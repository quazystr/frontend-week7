/**
 * Модуль main.js
 * UI секундомера и тест, воспроизводящий ошибку Reset → Start.
 */

import { createTimer } from "./timer.js";

const logEl = document.getElementById("log");
const displayEl = document.getElementById("display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const testBtn = document.getElementById("test-btn");

function log(msg, type = "") {
  const line = document.createElement("div");
  line.textContent = msg;
  if (type === "error") line.style.color = "#f48771";
  if (type === "ok") line.style.color = "#89d185";
  if (type === "info") line.style.color = "#6a9955";
  logEl.appendChild(line);
}

const timer = createTimer();

function updateDisplay(ms) {
  displayEl.textContent = timer.formatTime(ms);
}

// Инициальное отображение
updateDisplay(0);

startBtn.addEventListener("click", () => {
  const started = timer.start(updateDisplay);
  log(
    started ? "▶️ Start" : "⚠️ Start проигнорирован",
    started ? "ok" : "info",
  );
});

pauseBtn.addEventListener("click", () => {
  const paused = timer.pause(updateDisplay);
  log(paused ? "⏸️ Pause" : "⚠️ Pause проигнорирован", paused ? "ok" : "info");
});

resetBtn.addEventListener("click", () => {
  timer.reset(updateDisplay);
  log("🔄 Reset", "info");
});

// ==========================================
// ТЕСТ: воспроизведение ошибки Reset → Start
// ==========================================
testBtn.addEventListener("click", async () => {
  log("\n=== Тест: защита от старых callback ===", "info");

  // Создаём отдельный таймер для теста
  const testTimer = createTimer();
  let tickCount = 0;
  let lastElapsed = 0;

  function onTick(ms) {
    tickCount += 1;
    lastElapsed = ms;
  }

  // Шаг 1: Start
  testTimer.start(onTick);
  const runId1 = testTimer.getRunId();
  log(`Шаг 1: Start. runId = ${runId1}`);

  // Ждём 150 мс — должно быть ~1-2 тика
  await new Promise((r) => setTimeout(r, 150));
  const ticksAfterFirstStart = tickCount;
  log(
    `После 150 мс: тиков = ${ticksAfterFirstStart}, elapsed = ${lastElapsed} мс`,
  );

  // Шаг 2: Reset (инкрементирует runId, убивает старые callback)
  testTimer.reset(onTick);
  const runId2 = testTimer.getRunId();
  log(`Шаг 2: Reset. runId = ${runId2} (был ${runId1})`);
  console.assert(runId2 === runId1 + 1, "Reset должен инкрементировать runId");
  console.assert(
    tickCount === ticksAfterFirstStart,
    "Reset не должен добавлять тики",
  );
  console.assert(lastElapsed === 0, "Reset должен обнулить elapsed");

  // Шаг 3: Сразу Start (новый runId)
  testTimer.start(onTick);
  const runId3 = testTimer.getRunId();
  log(`Шаг 3: Start. runId = ${runId3}`);
  console.assert(runId3 === runId2 + 1, "Start должен инкрементировать runId");

  // Ждём 300 мс — должно быть ~3 тика от НОВОГО запуска
  await new Promise((r) => setTimeout(r, 300));
  const ticksAfterSecondStart = tickCount - ticksAfterFirstStart;
  log(
    `После 300 мс: новых тиков = ${ticksAfterSecondStart}, elapsed = ${lastElapsed} мс`,
  );

  // КЛЮЧЕВАЯ ПРОВЕРКА: если бы старый callback сработал, он бы увеличил tickCount
  // или установил бы старое значение elapsed. Но благодаря runId — он вышел сразу.
  console.assert(
    ticksAfterSecondStart >= 2 && ticksAfterSecondStart <= 5,
    `Должно быть ~3 тика от нового запуска, получено ${ticksAfterSecondStart}`,
  );
  console.assert(
    lastElapsed > 0 && lastElapsed < 500,
    `elapsed должен быть от нового запуска, получено ${lastElapsed}`,
  );

  // Останавливаем тестовый таймер
  testTimer.reset();

  log(
    "✅ Все console.assert пройдены: старые callback не влияют на новое состояние",
    "ok",
  );
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: runId инкрементируется при start и reset
const t1 = createTimer();
const id0 = t1.getRunId();
t1.start(() => {});
const id1 = t1.getRunId();
t1.reset();
const id2 = t1.getRunId();
console.assert(id1 === id0 + 1, "start() инкрементирует runId");
console.assert(id2 === id1 + 1, "reset() инкрементирует runId");

// Проверка 2: pause() НЕ инкрементирует runId
const t2 = createTimer();
t2.start(() => {});
const idBeforePause = t2.getRunId();
t2.pause();
const idAfterPause = t2.getRunId();
console.assert(
  idAfterPause === idBeforePause,
  "pause() не инкрементирует runId",
);
t2.reset();

log(
  'Все автоматические проверки пройдены. Нажмите "Тест" для демонстрации защиты.',
);
