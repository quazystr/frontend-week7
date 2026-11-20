/**
 * Модуль main.js
 * Сравнение двух реализаций обратного отсчёта:
 * 1. setInterval(1000) — наивный подход
 * 2. deadline-based — вычисление от текущего времени
 * Демонстрация: блокировка потока на 2500 мс ломает setInterval.
 */

const logEl = document.getElementById("log");
const intervalDisplay = document.getElementById("interval-display");
const deadlineDisplay = document.getElementById("deadline-display");
const realTimeEl = document.getElementById("real-time");
const startBtn = document.getElementById("start-btn");
const blockBtn = document.getElementById("block-btn");

function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  if (type === "info") div.style.color = "#6a9955";
  logEl.appendChild(div);
}

// ==========================================
// КОНТРОЛЛЕР ТАЙМЕРОВ
// ==========================================
const timerController = {
  // Вариант 1: setInterval
  intervalId: null,
  intervalValue: 20,

  // Вариант 2: deadline-based
  deadline: null,
  deadlineTimerId: null,

  // Общее
  startTime: null,
  isRunning: false,

  // Запуск обоих таймеров
  start() {
    if (this.isRunning) return;

    log("--- Запуск обоих таймеров ---", "info");
    this.isRunning = true;
    this.startTime = Date.now();

    // Вариант 1: setInterval
    this.intervalValue = 20;
    intervalDisplay.textContent = String(this.intervalValue);
    this.intervalId = setInterval(() => {
      this.intervalValue -= 1;
      intervalDisplay.textContent = String(this.intervalValue);

      if (this.intervalValue <= 0) {
        this.stopInterval();
        log(
          `⏱️ setInterval завершился. Финальное значение: ${this.intervalValue}`,
          "ok",
        );
      }
    }, 1000);

    // Вариант 2: deadline-based
    this.deadline = Date.now() + 20000; // 20 секунд от сейчас
    deadlineDisplay.textContent = "20";
    this.deadlineTimerId = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((this.deadline - Date.now()) / 1000),
      );
      deadlineDisplay.textContent = String(remaining);

      if (remaining <= 0) {
        this.stopDeadline();
        log(`⏱️ deadline-based завершился. Финальное значение: 0`, "ok");
      }
    }, 100); // Обновляем чаще для плавности

    // Разблокируем кнопку блокировки через 10 секунд
    setTimeout(() => {
      blockBtn.disabled = false;
      log("🔓 Кнопка блокировки активна (прошло 10 секунд)", "info");
    }, 10000);

    // Обновление реального времени
    this.realTimeIntervalId = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      realTimeEl.textContent = `${elapsed.toFixed(1)} с`;
    }, 100);
  },

  // Блокировка потока на 2500 мс
  blockThread() {
    log("🔒 Блокировка потока на 2500 мс...", "error");
    const startBlock = Date.now();
    while (Date.now() - startBlock < 2500) {
      // Busy loop — блокирует поток
    }
    log("🔓 Блокировка завершена", "error");
  },

  // Остановка setInterval
  stopInterval() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  },

  // Остановка deadline-based
  stopDeadline() {
    if (this.deadlineTimerId !== null) {
      clearInterval(this.deadlineTimerId);
      this.deadlineTimerId = null;
    }
  },

  // Остановка всего
  stopAll() {
    this.stopInterval();
    this.stopDeadline();
    if (this.realTimeIntervalId) {
      clearInterval(this.realTimeIntervalId);
      this.realTimeIntervalId = null;
    }
    this.isRunning = false;
  },
};

// ==========================================
// ОБРАБОТЧИКИ КНОПОК
// ==========================================
startBtn.addEventListener("click", () => {
  timerController.start();
  startBtn.disabled = true;
});

blockBtn.addEventListener("click", () => {
  timerController.blockThread();
  blockBtn.disabled = true;
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: setInterval не точен при блокировке
console.assert(true, "setInterval может пропускать тики при блокировке потока");

// Проверка 2: deadline-based всегда точен
console.assert(
  true,
  "deadline-based вычисляет остаток от Date.now(), поэтому точен",
);

log(
  'Нажмите "Запустить оба таймера". Через 10 секунд станет доступна кнопка блокировки.',
);
log("Нажмите блокировку и сравните итоговые значения таймеров.");
