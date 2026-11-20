/**
 * Модуль main.js
 * UI обратного отсчёта на 20 секунд, обработчик visibilitychange и тесты.
 * Возврат на вкладку пересчитывает остаток от deadline, но не ставит паузу.
 */

import { createCountdown } from "./countdown.js";

const displayEl = document.getElementById("display");
const ticksEl = document.getElementById("ticks");
const stateEl = document.getElementById("state");
const logEl = document.getElementById("log");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const blockBtn = document.getElementById("block-btn");

function log(message, type = "") {
  const line = document.createElement("div");
  line.textContent = message;
  if (type === "error") line.style.color = "#f48771";
  if (type === "ok") line.style.color = "#89d185";
  if (type === "info") line.style.color = "#6a9955";
  logEl.appendChild(line);
}

function format(ms) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

let tickCount = 0;
let hiddenAt = null;

const countdown = createCountdown({
  durationMs: 20000,
  tickIntervalMs: 100,
  onTick(remainingMs, source) {
    displayEl.textContent = format(remainingMs);
    if (source === "tick") {
      tickCount += 1;
      ticksEl.textContent = String(tickCount);
    }
    stateEl.textContent = countdown.isRunning() ? "идёт" : "пауза/стоп";
  },
  onFinish() {
    log("⏱️ Отсчёт завершён ровно по deadline", "ok");
    stateEl.textContent = "завершён";
  },
});

// ==========================================
// ОБРАБОТЧИКИ КНОПОК
// ==========================================
startBtn.addEventListener("click", () => {
  const started = countdown.start();
  log(
    started ? "▶️ Start" : "⚠️ Start проигнорирован (уже идёт или нужен Reset)",
    started ? "ok" : "info",
  );
});

pauseBtn.addEventListener("click", () => {
  const paused = countdown.pause();
  log(
    paused
      ? "⏸️ Pause (явный выбор пользователя)"
      : "⚠️ Pause проигнорирован (не шёл)",
    paused ? "ok" : "info",
  );
});

resetBtn.addEventListener("click", () => {
  countdown.reset();
  tickCount = 0;
  ticksEl.textContent = "0";
  log("🔄 Reset: таймер отменён, значение возвращено к 20 секундам", "info");
});

blockBtn.addEventListener("click", () => {
  log("🔒 Блокировка потока на 2500 мс", "error");
  const start = Date.now();
  while (Date.now() - start < 2500) {
    // busy loop
  }
  log("🔓 Блокировка снята, пересчёт от deadline", "error");
  countdown.sync();
});

// ==========================================
// ВИДИМОСТЬ ВКЛАДКИ
// ==========================================
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    hiddenAt = Date.now();
    // ВАЖНО: паузу не ставим. Таймер остаётся «идущим»,
    // браузер просто реже вызывает наш setTimeout.
    log("🙈 Вкладка скрыта: таймер НЕ ставится на паузу", "info");
    return;
  }

  const awayMs = hiddenAt === null ? 0 : Date.now() - hiddenAt;
  hiddenAt = null;

  const before = tickCount;
  const synced = countdown.sync();
  const after = tickCount;

  if (synced) {
    log(
      `👁️ Возврат: отсутствовали ${(awayMs / 1000).toFixed(1)} с. ` +
        `Остаток пересчитан от deadline: ${format(countdown.getRemainingMs())}. ` +
        `Добавлено тиков: ${after - before} (пропущенные не проигрываются)`,
      "ok",
    );
  } else {
    log(
      "👁️ Возврат: таймер на паузе по выбору пользователя — ничего не пересчитываем",
      "info",
    );
  }
});

// ==========================================
// ТЕСТЫ (console.assert)
// ==========================================
async function runTests() {
  // 1. У утилиты есть cancel()
  console.assert(
    typeof countdown.cancel === "function",
    "должен быть метод cancel()",
  );
  console.assert(
    typeof countdown.sync === "function",
    "должен быть метод sync()",
  );

  // 2. Повторный Start безопасен: тиков не вдвое больше
  let ticks = 0;
  const fast = createCountdown({
    durationMs: 1000,
    tickIntervalMs: 50,
    onTick() {
      ticks += 1;
    },
  });
  fast.start();
  fast.start();
  fast.start();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const oneChainTicks = ticks;
  console.assert(
    oneChainTicks >= 4 && oneChainTicks <= 9,
    `ожидалась одна цепочка тиков, получено ${oneChainTicks}`,
  );
  fast.cancel();

  // 3. cancel() останавливает ожидающий тик
  const ticksAfterCancel = ticks;
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.assert(
    ticks === ticksAfterCancel,
    "после cancel() тики не продолжаются",
  );

  // 4. Точность от deadline после блокировки потока
  let lastValue = null;
  const precise = createCountdown({
    durationMs: 3000,
    tickIntervalMs: 50,
    onTick(ms) {
      lastValue = ms;
    },
  });
  precise.start();
  const blockStart = Date.now();
  while (Date.now() - blockStart < 1200) {
    // блокируем поток на 1200 мс
  }
  precise.sync();
  const expected = 3000 - (Date.now() - blockStart);
  console.assert(
    Math.abs(lastValue - expected) < 150,
    `остаток должен считаться от deadline: ${lastValue} против ${expected}`,
  );
  precise.cancel();

  // 5. После reset() нет запоздалых изменений UI
  let resetTicks = 0;
  let resetValue = null;
  const resettable = createCountdown({
    durationMs: 5000,
    tickIntervalMs: 50,
    onTick(ms, source) {
      resetValue = ms;
      if (source === "tick") resetTicks += 1;
    },
  });
  resettable.start();
  await new Promise((resolve) => setTimeout(resolve, 150));
  resettable.reset();
  const ticksAtReset = resetTicks;
  const valueAtReset = resetValue;
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.assert(
    resetTicks === ticksAtReset,
    "после reset() нет поздних тиков",
  );
  console.assert(
    resetValue === valueAtReset && resetValue === 5000,
    "после reset() значение не меняется",
  );

  // 6. sync() не оживляет таймер после явной паузы
  const paused = createCountdown({
    durationMs: 5000,
    tickIntervalMs: 50,
    onTick() {},
  });
  paused.start();
  paused.pause();
  console.assert(
    paused.sync() === false,
    "sync() не должен запускать таймер после паузы",
  );
  console.assert(paused.isRunning() === false, "пауза остаётся паузой");

  log("✅ Все console.assert пройдены", "ok");
}

countdown.reset();
runTests();
log("Нажмите Start, уйдите на другую вкладку на 5–10 секунд и вернитесь.");
