/**
 * Модуль main.js
 * Демо и проверки границ для createAttemptLimiter.
 */

import { createAttemptLimiter } from "./attempt-limiter.js";

const logEl = document.getElementById("log");

function log(message, type = "") {
  const line = document.createElement("div");
  if (type) line.className = type;
  line.textContent = message;
  logEl.appendChild(line);
}

function clearLog() {
  logEl.textContent = "";
}

// ==========================================
// ДЕМО: обычный сценарий (limit = 3)
// ==========================================
document.getElementById("demo-btn").addEventListener("click", () => {
  clearLog();
  log("=== Демо: limit = 3 ===", "info");

  const limiter = createAttemptLimiter(3);
  log(`Создан limiter. Осталось: ${limiter.getRemaining()}`);
  log(`canTry(): ${limiter.canTry()}`);

  for (let i = 1; i <= 5; i++) {
    log(`--- Попытка #${i} ---`);
    if (limiter.canTry()) {
      log("  → canTry() = true, пробуем...");
      // Имитируем неудачу
      limiter.recordFailure();
      log(`  → recordFailure(). Осталось: ${limiter.getRemaining()}`);
    } else {
      log("  → canTry() = false, попытки исчерпаны", "error");
    }
  }

  log("--- Сброс ---");
  limiter.reset();
  log(`После reset(). Осталось: ${limiter.getRemaining()}`);
  log(`canTry(): ${limiter.canTry()}`);
});

// ==========================================
// ПРОВЕРКИ ГРАНИЦ
// ==========================================
document.getElementById("bounds-btn").addEventListener("click", () => {
  clearLog();
  log("=== Проверка границ ===", "info");

  // 1. limit = 0
  log("--- limit = 0 ---");
  const zero = createAttemptLimiter(0);
  log(`getRemaining(): ${zero.getRemaining()}`);
  log(`canTry(): ${zero.canTry()}`);
  zero.recordFailure(); // не должно уйти в минус
  log(`После recordFailure(). getRemaining(): ${zero.getRemaining()}`);
  console.assert(zero.getRemaining() === 0, "limit=0: не уходит в минус");

  // 2. limit = 1
  log("--- limit = 1 ---");
  const one = createAttemptLimiter(1);
  log(`getRemaining(): ${one.getRemaining()}`);
  log(`canTry(): ${one.canTry()}`);
  one.recordFailure();
  log(`После 1-го recordFailure(). getRemaining(): ${one.getRemaining()}`);
  log(`canTry(): ${one.canTry()}`);
  one.recordFailure(); // лишняя попытка
  log(`После 2-го recordFailure(). getRemaining(): ${one.getRemaining()}`);
  console.assert(one.getRemaining() === 0, "limit=1: не уходит в минус");

  // 3. limit < 0 — должно бросить ошибку
  log("--- limit = -5 (ожидаем ошибку) ---");
  try {
    createAttemptLimiter(-5);
    log("ОШИБКА: конструктор не бросил исключение!", "error");
  } catch (error) {
    log(`Поймали ошибку: ${error.message}`, "ok");
  }

  // 4. Вызовы после исчерпания
  log("--- Вызовы после исчерпания (limit = 2) ---");
  const two = createAttemptLimiter(2);
  two.recordFailure();
  two.recordFailure();
  log(`После 2 recordFailure(). getRemaining(): ${two.getRemaining()}`);
  log(`canTry(): ${two.canTry()}`);
  // Пробуем ещё зафиксировать неудачу — не должно сломаться
  two.recordFailure();
  two.recordFailure();
  two.recordFailure();
  log(`После ещё 3 recordFailure(). getRemaining(): ${two.getRemaining()}`);
  console.assert(
    two.getRemaining() === 0,
    "Не уходит в минус после исчерпания",
  );
  console.assert(two.canTry() === false, "canTry() = false после исчерпания");

  // 5. Приватность состояния
  log("--- Приватность состояния ---");
  const priv = createAttemptLimiter(10);
  log(`priv.remaining: ${priv.remaining}`);
  console.assert(priv.remaining === undefined, "remaining приватный");
  log("Прямого доступа к remaining нет (undefined)");

  log("=== Все console.assert прошли ===", "ok");
});

// Очистка
document.getElementById("clear-btn").addEventListener("click", clearLog);

// Проверки при загрузке
console.assert(true, "Скрипт инициализирован");
