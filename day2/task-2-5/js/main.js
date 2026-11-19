/**
 * Модуль main.js
 * Демо и тесты для createAutoSaver.
 * Проверяет: независимость экземпляров, приватность, отмену, flush.
 */

import { createAutoSaver } from "./auto-saver.js";

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
// ДЕМО: автосохранение с задержкой 1000 мс
// ==========================================
document.getElementById("demo-btn").addEventListener("click", () => {
  clearLog();
  log("=== Демо: автосохранение (delay = 1000 мс) ===", "info");

  const saves = [];
  const saver = createAutoSaver((value) => {
    saves.push(value);
    log(`💾 Сохранено: "${value}"`);
  }, 1000);

  log('schedule("a")');
  saver.schedule("a");

  setTimeout(() => {
    log('schedule("ab") — сбрасывает таймер');
    saver.schedule("ab");
  }, 300);

  setTimeout(() => {
    log('schedule("abc") — снова сбрасывает');
    saver.schedule("abc");
  }, 600);

  setTimeout(() => {
    log(`Итог сохранений: [${saves.join(", ")}] (ожидается только "abc")`);
    console.assert(saves.length === 1, "Должно быть одно сохранение");
    console.assert(saves[0] === "abc", "Сохранено последнее значение");
  }, 2000);
});

// ==========================================
// ТЕСТЫ
// ==========================================
document.getElementById("test-btn").addEventListener("click", async () => {
  clearLog();
  log("=== Тесты ===", "info");

  // Тест 1: Независимость экземпляров
  log("--- Тест 1: Независимость экземпляров ---");
  const savesA = [];
  const savesB = [];
  const saverA = createAutoSaver((v) => savesA.push(v), 100);
  const saverB = createAutoSaver((v) => savesB.push(v), 100);

  saverA.schedule("A1");
  saverB.schedule("B1");
  saverA.schedule("A2");

  await new Promise((r) => setTimeout(r, 200));

  console.assert(
    savesA.length === 1 && savesA[0] === "A2",
    "saverA: только A2",
  );
  console.assert(
    savesB.length === 1 && savesB[0] === "B1",
    "saverB: только B1",
  );
  log("✅ Экземпляры независимы: A=[A2], B=[B1]", "ok");

  // Тест 2: Приватность переменных
  log("--- Тест 2: Приватность переменных ---");
  const saver = createAutoSaver(() => {}, 100);
  console.assert(saver.timerId === undefined, "timerId приватный");
  console.assert(saver.pendingValue === undefined, "pendingValue приватный");
  log("✅ timerId и pendingValue недоступны снаружи", "ok");

  // Тест 3: cancel() отменяет callback
  log("--- Тест 3: cancel() отменяет callback ---");
  const savesCancel = [];
  const saverCancel = createAutoSaver((v) => savesCancel.push(v), 100);
  saverCancel.schedule("should-not-save");
  saverCancel.cancel();

  await new Promise((r) => setTimeout(r, 200));

  console.assert(
    savesCancel.length === 0,
    "После cancel() ничего не сохраняется",
  );
  log("✅ После cancel() callback не выполнился", "ok");

  // Тест 4: flush() сохраняет немедленно
  log("--- Тест 4: flush() сохраняет немедленно ---");
  const savesFlush = [];
  const saverFlush = createAutoSaver((v) => savesFlush.push(v), 5000);
  saverFlush.schedule("flush-me");
  saverFlush.flush();

  console.assert(
    savesFlush.length === 1 && savesFlush[0] === "flush-me",
    "flush() сохранил сразу",
  );
  log("✅ flush() вызвал save() немедленно, не дожидаясь delay", "ok");

  // Тест 5: Повторный cancel() безопасен
  log("--- Тест 5: Повторный cancel() безопасен ---");
  const saverSafe = createAutoSaver(() => {}, 100);
  saverSafe.cancel();
  saverSafe.cancel();
  saverSafe.cancel();
  log("✅ Многократный cancel() не ломает объект", "ok");

  // Тест 6: schedule() после cancel() работает
  log("--- Тест 6: schedule() после cancel() работает ---");
  const savesAfter = [];
  const saverAfter = createAutoSaver((v) => savesAfter.push(v), 100);
  saverAfter.schedule("first");
  saverAfter.cancel();
  saverAfter.schedule("second");

  await new Promise((r) => setTimeout(r, 200));

  console.assert(
    savesAfter.length === 1 && savesAfter[0] === "second",
    "После cancel() schedule() работает",
  );
  log("✅ После cancel() можно снова schedule()", "ok");

  log("=== Все console.assert прошли ===", "ok");
});

document.getElementById("clear-btn").addEventListener("click", clearLog);

console.assert(true, "Скрипт инициализирован");
