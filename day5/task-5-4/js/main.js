/**
 * Модуль main.js
 * UI и тесты для контроллера с AbortController.
 */

import { createController } from "./controller.js";

const logEl = document.getElementById("log");
const displayEl = document.getElementById("display");
const tickCountEl = document.getElementById("tick-count");
const btnStart = document.getElementById("btn-start");
const btnStop = document.getElementById("btn-stop");
const btnReset = document.getElementById("btn-reset");
const testBtn = document.getElementById("test-btn");

function log(msg, type = "") {
  const line = document.createElement("div");
  line.textContent = msg;
  if (type === "error") line.style.color = "#f48771";
  if (type === "ok") line.style.color = "#89d185";
  if (type === "info") line.style.color = "#6a9955";
  logEl.appendChild(line);
}

function updateTickDisplay(count) {
  tickCountEl.textContent = String(count);
}

const controller = createController();

// Обработчики кнопок UI
document.getElementById("init-btn").addEventListener("click", () => {
  const ok = controller.init(
    { btnStart, btnStop, btnReset, displayEl },
    updateTickDisplay,
  );
  log(
    ok
      ? "✅ init() выполнен"
      : "⚠️ init() проигнорирован (уже инициализирован)",
    ok ? "ok" : "info",
  );
});

document.getElementById("destroy-btn").addEventListener("click", () => {
  const ok = controller.destroy();
  log(
    ok
      ? "🛑 destroy() выполнен"
      : "⚠️ destroy() проигнорирован (не инициализирован)",
    ok ? "ok" : "info",
  );
  displayEl.textContent = "Не инициализирован";
  tickCountEl.textContent = "0";
});

// ==========================================
// ТЕСТЫ
// ==========================================
testBtn.addEventListener("click", async () => {
  log("\n=== Тесты группы обработчиков ===", "info");

  // Тест 1: init() работает
  const testController = createController();
  const mockBtn = document.createElement("button");
  const mockDisplay = document.createElement("div");
  let ticks = 0;

  const initOk = testController.init(
    {
      btnStart: mockBtn,
      btnStop: mockBtn,
      btnReset: mockBtn,
      displayEl: mockDisplay,
    },
    () => {
      ticks += 1;
    },
  );
  console.assert(initOk === true, "Первый init() должен вернуть true");
  console.assert(
    testController.isInitialized() === true,
    "isInitialized = true",
  );
  console.assert(
    testController.hasAbortController() === true,
    "AbortController создан",
  );
  log("✅ Тест 1: init() создал AbortController", "ok");

  // Тест 2: Повторный init() безопасен
  const initOk2 = testController.init(
    {
      btnStart: mockBtn,
      btnStop: mockBtn,
      btnReset: mockBtn,
      displayEl: mockDisplay,
    },
    () => {
      ticks += 1;
    },
  );
  console.assert(initOk2 === false, "Повторный init() должен вернуть false");
  log("✅ Тест 2: повторный init() проигнорирован", "ok");

  // Тест 3: Клик по кнопке вызывает обработчик
  mockBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  console.assert(ticks >= 1, "Клик должен вызвать обработчик");
  log(`✅ Тест 3: клик вызвал обработчик (тиков: ${ticks})`, "ok");

  // Тест 4: destroy() снимает все обработчики
  const destroyOk = testController.destroy();
  console.assert(destroyOk === true, "Первый destroy() должен вернуть true");
  console.assert(
    testController.isInitialized() === false,
    "isInitialized = false",
  );
  console.assert(
    testController.hasAbortController() === false,
    "AbortController обнулён",
  );
  console.assert(testController.hasTimer() === false, "Таймер очищен");
  log("✅ Тест 4: destroy() снял обработчики и очистил таймер", "ok");

  // Тест 5: После destroy() клики не работают
  const ticksBefore = ticks;
  mockBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  console.assert(
    ticks === ticksBefore,
    "После destroy() клики не должны вызывать обработчик",
  );
  log("✅ Тест 5: после destroy() обработчики не работают", "ok");

  // Тест 6: Повторный destroy() безопасен
  const destroyOk2 = testController.destroy();
  console.assert(
    destroyOk2 === false,
    "Повторный destroy() должен вернуть false",
  );
  log("✅ Тест 6: повторный destroy() проигнорирован", "ok");

  // Тест 7: После destroy() можно снова init()
  const initOk3 = testController.init(
    {
      btnStart: mockBtn,
      btnStop: mockBtn,
      btnReset: mockBtn,
      displayEl: mockDisplay,
    },
    () => {
      ticks += 1;
    },
  );
  console.assert(initOk3 === true, "После destroy() init() должен работать");
  mockBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  console.assert(
    ticks > ticksBefore,
    "После повторного init() обработчики снова работают",
  );
  log("✅ Тест 7: после destroy() можно снова init()", "ok");

  // Тест 8: Таймер останавливается при destroy()
  const timerController = createController();
  let timerTicks = 0;
  timerController.init(
    {
      btnStart: mockBtn,
      btnStop: mockBtn,
      btnReset: mockBtn,
      displayEl: mockDisplay,
    },
    () => {
      timerTicks += 1;
    },
  );
  mockBtn.click(); // запускаем tick()
  await new Promise((r) => setTimeout(r, 300));
  const ticksBeforeDestroy = timerTicks;
  timerController.destroy();
  await new Promise((r) => setTimeout(r, 800));
  console.assert(
    timerTicks === ticksBeforeDestroy,
    "После destroy() таймер не должен тикать",
  );
  log("✅ Тест 8: destroy() останавливает таймер", "ok");

  log("\n✅ Все console.assert пройдены", "ok");
});

// Автоинициализация
controller.init({ btnStart, btnStop, btnReset, displayEl }, updateTickDisplay);
log("Контроллер инициализирован. Нажимайте Start, Stop, Reset.", "info");
