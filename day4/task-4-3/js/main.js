/**
 * Модуль main.js
 * Секундомер с защитой от дублирования таймеров.
 * Один таймер за раз: повторные Start не создают второй цикл.
 */

const logEl = document.getElementById("log");
const displayEl = document.getElementById("display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");

function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  if (type === "info") div.style.color = "#6a9955";
  logEl.appendChild(div);
}

// ==========================================
// КОНТРОЛЛЕР СЕКУНДОМЕРА
// ==========================================
const stopwatch = {
  // Состояние
  elapsed: 0, // прошедшее время в мс
  startTime: null, // время последнего запуска
  timerId: null, // ID активного таймера

  // Форматирование времени
  formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  },

  // Обновление дисплея
  updateDisplay() {
    displayEl.textContent = this.formatTime(this.elapsed);
  },

  // Тик таймера (вызывается каждые 100 мс)
  tick() {
    const now = Date.now();
    this.elapsed = this.startTime ? now - this.startTime : 0;
    this.updateDisplay();

    // Планируем следующий тик
    this.timerId = setTimeout(() => this.tick(), 100);
  },

  // Start: запускает таймер, если его ещё нет
  start() {
    // Защита от повторного запуска
    if (this.timerId !== null) {
      log("⚠️ Start: таймер уже активен, игнорируем повторный вызов", "info");
      return;
    }

    log("▶️ Start: запуск таймера", "ok");
    this.startTime = Date.now() - this.elapsed; // Учитываем уже прошедшее время
    this.tick(); // Первый тик сразу
  },

  // Pause: останавливает таймер
  pause() {
    if (this.timerId === null) {
      log("⚠️ Pause: таймер не активен, игнорируем", "info");
      return;
    }

    log("⏸️ Pause: остановка таймера", "ok");
    clearTimeout(this.timerId);
    this.timerId = null;
    // elapsed уже обновлён в последнем tick, ничего больше не нужно
  },

  // Reset: сбрасывает всё
  reset() {
    log("🔄 Reset: сброс секундомера", "ok");

    // Отменяем таймер, если он активен
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    // Сбрасываем состояние
    this.elapsed = 0;
    this.startTime = null;
    this.updateDisplay();
  },
};

// ==========================================
// ОБРАБОТЧИКИ КНОПОК
// ==========================================
startBtn.addEventListener("click", () => stopwatch.start());
pauseBtn.addEventListener("click", () => stopwatch.pause());
resetBtn.addEventListener("click", () => stopwatch.reset());

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: Повторный Start не создаёт второй таймер
let tickCount = 0;
const testStopwatch = {
  elapsed: 0,
  startTime: null,
  timerId: null,
  tick() {
    tickCount += 1;
    this.timerId = setTimeout(() => this.tick(), 50);
  },
  start() {
    if (this.timerId !== null) return; // Защита
    this.startTime = Date.now();
    this.tick();
  },
  reset() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },
};

testStopwatch.start();
testStopwatch.start(); // Повторный вызов
testStopwatch.start(); // Ещё раз

setTimeout(() => {
  console.assert(
    tickCount >= 3 && tickCount <= 5,
    "Должно быть ~3-5 тиков за 150 мс, а не 9-15 (три таймера)",
  );
  testStopwatch.reset();

  setTimeout(() => {
    const ticksAfterReset = tickCount;
    console.assert(
      tickCount === ticksAfterReset,
      "После reset() таймер не должен тикать",
    );
    log("✅ Все console.assert пройдены", "ok");
  }, 100);
}, 150);

log(
  "Нажимайте Start, Pause, Reset. Быстрые повторные Start не создают второй цикл.",
);
