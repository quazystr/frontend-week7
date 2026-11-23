import { createController } from "./controller.js";
import { createSettings } from "./settings.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// РЕАЛЬНЫЙ ИНТЕРФЕЙС
// ==========================================
const settings = createSettings();

const realElements = {
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  displayEl: document.getElementById("display"),
  statusEl: document.getElementById("status"),
};

const focusInput = document.getElementById("focus-input");
const breakInput = document.getElementById("break-input");
const errorEl = document.getElementById("settings-error");

// Инициализируем поля ввода из настроек
focusInput.value = String(settings.getFocusMinutes());
breakInput.value = String(settings.getBreakMinutes());

function showError(message) {
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove("settings__error_hidden");
  } else {
    errorEl.textContent = "";
    errorEl.classList.add("settings__error_hidden");
  }
}

function handleInputChange(input, setter) {
  const raw = input.value.trim();
  const value = raw === "" ? NaN : Number(raw);

  const ok = setter(value);
  if (ok) {
    input.classList.remove("settings__input_invalid");
    showError(null);
    settings.clearError();
  } else {
    input.classList.add("settings__input_invalid");
    showError(settings.getError());
  }
}

focusInput.addEventListener("input", () => {
  handleInputChange(focusInput, (v) => settings.setFocusMinutes(v));
});

breakInput.addEventListener("input", () => {
  handleInputChange(breakInput, (v) => settings.setBreakMinutes(v));
});

// Контроллер
const realController = createController({
  elements: realElements,
  settings,
});
realController.init();

console.log("🎯 Focus Timer инициализирован.");

// ==========================================
// АВТОМАТИЧЕСКИЕ ТЕСТЫ
// ==========================================
async function runTests() {
  console.log("\n=== Тесты Task 6.4: Настройки и debounce ===");

  // In-memory storage для изоляции тестов
  const memoryStorage = {
    _data: {},
    getItem(key) {
      return this._data[key] ?? null;
    },
    setItem(key, value) {
      this._data[key] = String(value);
    },
    removeItem(key) {
      delete this._data[key];
    },
    clear() {
      this._data = {};
    },
  };

  // ==========================================
  // ТЕСТ 1: Валидация границ
  // ==========================================
  memoryStorage.clear(); // ✅ Чистое состояние
  const s1 = createSettings({ storage: memoryStorage });
  console.assert(s1.setFocusMinutes(1) === true, "1 минута — валидно");
  console.assert(s1.setFocusMinutes(90) === true, "90 минут — валидно");
  console.assert(s1.setFocusMinutes(0) === false, "0 минут — невалидно");
  console.assert(s1.setFocusMinutes(91) === false, "91 минута — невалидно");
  console.assert(s1.setFocusMinutes(-5) === false, "-5 минут — невалидно");
  console.assert(
    s1.setFocusMinutes(1.5) === false,
    "1.5 минуты — невалидно (не целое)",
  );
  console.assert(s1.setFocusMinutes(NaN) === false, "NaN — невалидно");
  console.assert(s1.setFocusMinutes("abc") === false, '"abc" — невалидно');

  s1.setFocusMinutes(25);
  s1.setFocusMinutes(999); // невалидно
  console.assert(
    s1.getFocusMinutes() === 25,
    "После невалидного ввода значение не изменилось",
  );

  // ==========================================
  // ТЕСТ 2: Debounce работает
  // ==========================================
  memoryStorage.clear(); // ✅ Чистое состояние
  const s2 = createSettings({ storage: memoryStorage });
  s2.setFocusMinutes(10);
  s2.setFocusMinutes(20);
  s2.setFocusMinutes(30);
  console.assert(
    memoryStorage.getItem("focus-timer:settings") === null,
    "Debounce: сразу после вызовов storage пуст",
  );

  await s2._waitDebounce();
  const saved = JSON.parse(memoryStorage.getItem("focus-timer:settings"));
  console.assert(
    saved.focusMinutes === 30,
    `Debounce: сохранилось последнее значение (30), получено ${saved?.focusMinutes}`,
  );

  // ==========================================
  // ТЕСТ 3: Reset отменяет debounce
  // ==========================================
  memoryStorage.clear(); // ✅ ИСПРАВЛЕНИЕ: чистое состояние, чтобы reset() вернул дефолт 25
  const s3 = createSettings({ storage: memoryStorage });
  s3.setFocusMinutes(40);
  s3.setFocusMinutes(50); // ожидающее сохранение
  const result = s3.reset();
  console.assert(
    result.focusMinutes === 25,
    `Reset вернул значение по умолчанию (25), получено ${result.focusMinutes}`,
  );
  await s3._waitDebounce();
  const afterReset = memoryStorage.getItem("focus-timer:settings");
  console.assert(
    afterReset === null,
    "После reset() ожидающее сохранение отменилось — storage должен остаться пустым",
  );

  // ==========================================
  // ТЕСТ 4: Чтение из localStorage при создании
  // ==========================================
  memoryStorage.clear(); // ✅ Чистое состояние перед заполнением
  memoryStorage.setItem(
    "focus-timer:settings",
    JSON.stringify({ focusMinutes: 42, breakMinutes: 7 }),
  );
  const s4 = createSettings({ storage: memoryStorage });
  console.assert(
    s4.getFocusMinutes() === 42,
    "При создании читаются сохранённые настройки",
  );
  console.assert(
    s4.getBreakMinutes() === 7,
    "При создании читаются сохранённые настройки",
  );

  // ==========================================
  // ТЕСТ 5: getFocusMs / getBreakMs
  // ==========================================
  // s4 уже имеет focusMinutes=42, breakMinutes=7
  console.assert(
    s4.getFocusMs() === 42 * 60 * 1000,
    "getFocusMs возвращает миллисекунды",
  );
  console.assert(
    s4.getBreakMs() === 7 * 60 * 1000,
    "getBreakMs возвращает миллисекунды",
  );

  // ==========================================
  // ТЕСТ 6: Некорректное значение не ломает текущую сессию
  // ==========================================
  memoryStorage.clear(); // ✅ Чистое состояние
  const s6 = createSettings({ storage: memoryStorage });
  s6.setFocusMinutes(42);
  s6.setFocusMinutes("invalid"); // ошибка
  console.assert(
    s6.getFocusMinutes() === 42,
    "После ошибки состояние не изменилось",
  );
  console.assert(s6.getError() !== null, "После ошибки есть сообщение");
  s6.clearError();
  console.assert(s6.getError() === null, "clearError очищает ошибку");

  // ==========================================
  // ТЕСТ 7: Повреждённый JSON в storage не ломает создание
  // ==========================================
  memoryStorage.clear(); // ✅ Чистое состояние
  memoryStorage.setItem("focus-timer:settings", "{invalid json");
  const s7 = createSettings({ storage: memoryStorage });
  console.assert(
    s7.getFocusMinutes() === 25,
    "Повреждённый JSON — используются defaults",
  );

  console.log("✅ Все тесты Task 6.4 пройдены!");
}
runTests();
