/**
 * Модуль main.js
 * Контроллер с жизненным циклом: init(), destroy(), handleStart(), handleReset().
 */

const logEl = document.getElementById("log");
function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  if (type === "info") div.style.color = "#6a9955";
  logEl.appendChild(div);
}

// ==========================================
// КОНТРОЛЛЕР
// ==========================================
const appController = {
  // Состояние
  count: 0,
  isInitialized: false,

  // DOM-элементы
  btnStart: null,
  btnReset: null,
  counterEl: null,

  // Сохранённые ссылки на привязанные обработчики
  boundHandleStart: null,
  boundHandleReset: null,

  // Методы-обработчики (используют this)
  handleStart() {
    this.count += 1;
    this.counterEl.textContent = String(this.count);
    log(`handleStart: count = ${this.count}`, "ok");
  },

  handleReset() {
    this.count = 0;
    this.counterEl.textContent = String(this.count);
    log(`handleReset: count = ${this.count}`, "info");
  },

  // Инициализация
  init(btnStart, btnReset, counterEl) {
    // Защита от повторной инициализации
    if (this.isInitialized) {
      log(
        "init() вызван повторно — игнорируем, обработчики уже добавлены.",
        "info",
      );
      return;
    }

    // Сохраняем DOM-элементы
    this.btnStart = btnStart;
    this.btnReset = btnReset;
    this.counterEl = counterEl;

    // Создаём привязанные функции и сохраняем в свойства
    this.boundHandleStart = this.handleStart.bind(this);
    this.boundHandleReset = this.handleReset.bind(this);

    // Добавляем обработчики
    this.btnStart.addEventListener("click", this.boundHandleStart);
    this.btnReset.addEventListener("click", this.boundHandleReset);

    this.isInitialized = true;
    log("init(): контроллер инициализирован, обработчики добавлены.", "ok");
  },

  // Уничтожение
  destroy() {
    if (!this.isInitialized) {
      log(
        "destroy() вызван, но контроллер не инициализирован — игнорируем.",
        "info",
      );
      return;
    }

    // Удаляем обработчики, используя сохранённые ссылки
    this.btnStart.removeEventListener("click", this.boundHandleStart);
    this.btnReset.removeEventListener("click", this.boundHandleReset);

    // Обнуляем ссылки на привязанные функции (освобождение памяти)
    this.boundHandleStart = null;
    this.boundHandleReset = null;

    // Сбрасываем состояние
    this.count = 0;
    this.counterEl.textContent = String(this.count);

    this.isInitialized = false;
    log("destroy(): обработчики удалены, состояние сброшено.", "ok");
  },
};

// ==========================================
// УПРАВЛЕНИЕ ИЗ ИНТЕРФЕЙСА
// ==========================================
const btnStart = document.getElementById("btn-start");
const btnReset = document.getElementById("btn-reset");
const btnInit = document.getElementById("btn-init");
const btnDestroy = document.getElementById("btn-destroy");
const counterEl = document.getElementById("counter");

btnInit.addEventListener("click", () => {
  appController.init(btnStart, btnReset, counterEl);
});

btnDestroy.addEventListener("click", () => {
  appController.destroy();
});

// ==========================================
// АВТОМАТИЧЕСКАЯ ИНИЦИАЛИЗАЦИЯ И ПРОВЕРКИ
// ==========================================

// Автоматически инициализируем при загрузке
appController.init(btnStart, btnReset, counterEl);

// Проверка 1: Повторный init() не добавляет обработчики второй раз
appController.init(btnStart, btnReset, counterEl);
console.assert(
  appController.isInitialized === true,
  "Контроллер должен быть инициализирован",
);
console.assert(
  appController.boundHandleStart !== null,
  "boundHandleStart должен существовать",
);
console.assert(
  appController.boundHandleReset !== null,
  "boundHandleReset должен существовать",
);

// Проверка 2: this объясняется формой вызова
// Если вызвать handleStart без контекста, this === undefined
const detachedHandleStart = appController.handleStart;
let thisWasUndefined = false;
try {
  detachedHandleStart(); // В модуле this === undefined
} catch (e) {
  // Ошибка при обращении к this.count
  thisWasUndefined = true;
}
console.assert(thisWasUndefined, "Отдельный вызов метода теряет this");

// Проверка 3: destroy() работает
appController.destroy();
console.assert(
  appController.isInitialized === false,
  "После destroy() isInitialized = false",
);
console.assert(
  appController.boundHandleStart === null,
  "После destroy() boundHandleStart = null",
);
console.assert(
  appController.boundHandleReset === null,
  "После destroy() boundHandleReset = null",
);

// Проверка 4: После destroy() кнопки не меняют состояние
appController.count = 10;
btnStart.click(); // Клик не должен сработать, обработчик удалён
console.assert(
  appController.count === 10,
  "После destroy() кнопки не должны менять состояние",
);

log("--- Все console.assert пройдены ---", "ok");
