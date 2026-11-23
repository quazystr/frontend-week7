import { createController } from "./controller.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// ЧАСТЬ 1: РЕАЛЬНЫЙ ИНТЕРФЕЙС
// ==========================================
const realElements = {
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  displayEl: document.getElementById("display"),
  statusEl: document.getElementById("status"),
};

const realController = createController({
  elements: realElements,
  durationMs: 25 * 60 * 1000,
});

document.getElementById("init-btn").addEventListener("click", () => {
  const ok = realController.init();
  console.log(ok ? "✅ init() выполнен" : "⚠️ init() проигнорирован");
});

document.getElementById("destroy-btn").addEventListener("click", () => {
  const ok = realController.destroy();
  console.log(ok ? "🛑 destroy() выполнен" : "⚠️ destroy() проигнорирован");
});

realController.init();
console.log("🎯 Реальный контроллер инициализирован.");

// ==========================================
// ЧАСТЬ 2: АВТОМАТИЧЕСКИЕ ТЕСТЫ
// ==========================================
async function runTests() {
  console.log("\n=== Тесты Task 6.3 ===");

  const startBtn = document.createElement("button");
  const pauseBtn = document.createElement("button");
  const resetBtn = document.createElement("button");
  const displayEl = document.createElement("div");
  const statusEl = document.createElement("div");
  const elements = { startBtn, pauseBtn, resetBtn, displayEl, statusEl };

  const controller = createController({ elements, durationMs: 1000 });

  console.assert(
    controller.isInitialized() === false,
    "До init() не инициализирован",
  );
  console.assert(controller.init() === true, "init() возвращает true");
  console.assert(
    controller.isInitialized() === true,
    "После init() инициализирован",
  );
  console.assert(controller.getStatus() === "idle", "Статус = idle");

  console.assert(
    controller.init() === false,
    "Повторный init() возвращает false",
  );

  controller.simulateClick("start");
  await delay(100);
  console.assert(controller.getStatus() === "running", "После start = running");

  controller.simulateClick("pause");
  console.assert(controller.getStatus() === "paused", "После pause = paused");

  controller.simulateClick("reset");
  console.assert(controller.getStatus() === "idle", "После reset = idle");

  controller.simulateClick("start");
  await delay(100);
  console.assert(
    controller.getStatus() === "running",
    "Перед destroy = running",
  );

  console.assert(controller.destroy() === true, "destroy() возвращает true");
  console.assert(
    controller.isInitialized() === false,
    "После destroy() не инициализирован",
  );
  console.assert(controller.getStatus() === "idle", "После destroy() = idle");

  console.assert(
    controller.simulateClick("start") === false,
    "simulateClick после destroy = false",
  );
  console.assert(controller.getStatus() === "idle", "Статус остался idle");

  startBtn.click();
  await delay(100);
  console.assert(
    controller.getStatus() === "idle",
    "Реальный клик после destroy не работает",
  );

  console.assert(controller.destroy() === false, "Повторный destroy = false");

  console.assert(controller.init() === true, "После destroy init() работает");
  controller.simulateClick("start");
  await delay(100);
  console.assert(
    controller.getStatus() === "running",
    "После повторного init start работает",
  );
  controller.destroy();

  const controller2 = createController({ elements, durationMs: 300 });
  controller2.init();
  controller2.simulateClick("start");
  controller2.destroy();
  await delay(500);
  console.assert(
    controller2.getStatus() === "idle",
    "Поздние callback не влияют",
  );

  console.log("✅ Все тесты Task 6.3 пройдены!");
}

runTests();
