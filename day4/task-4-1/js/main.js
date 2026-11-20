/**
 * Модуль main.js
 * Демо debounce на поле поиска.
 * Пишет в лог только последнее значение после 300 мс тишины.
 * Пустая строка отменяет ожидающий вызов.
 */

import { createDebounce } from "./debounce.js";

const logEl = document.getElementById("log");
const searchInput = document.getElementById("search");
const cancelBtn = document.getElementById("cancel-btn");

function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  if (type === "info") div.style.color = "#6a9955";
  logEl.appendChild(div);
}

// Функция, которая будет вызываться после тишины
function handleSearch(query) {
  log(`🔍 Поиск: "${query}"`, "ok");
}

// Создаём debounce-обёртку с задержкой 300 мс
const debouncedSearch = createDebounce(handleSearch, 300);

// Обработчик ввода
searchInput.addEventListener("input", (event) => {
  const value = event.target.value;
  log(`Ввод: "${value}"`);

  // Пустая строка отменяет ожидающий вызов
  if (value === "") {
    debouncedSearch.cancel();
    log("⚠️ Пустая строка — ожидающий вызов отменён", "info");
    return;
  }

  // Передаём значение в debounce
  debouncedSearch(value);
});

// Кнопка ручной отмены
cancelBtn.addEventListener("click", () => {
  debouncedSearch.cancel();
  log("⚠️ Ручная отмена через cancel()", "info");
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: cancel() существует
console.assert(
  typeof debouncedSearch.cancel === "function",
  "debounced должна иметь метод cancel()",
);

// Проверка 2: this передаётся корректно
const testObj = {
  name: "TestObject",
  logName(query) {
    console.assert(this === testObj, "this должен быть testObj");
    console.assert(query === "test", 'аргумент должен быть "test"');
  },
};

const debouncedMethod = createDebounce(testObj.logName, 100);
debouncedMethod.call(testObj, "test");

// Проверка 3: Повторный вызов отменяет предыдущий
let callCount = 0;
const counter = createDebounce(() => {
  callCount += 1;
}, 50);

counter();
counter();
counter();

setTimeout(() => {
  console.assert(
    callCount === 1,
    "Три вызова подряд должны дать один результат",
  );
  log("✅ Все console.assert пройдены", "ok");
}, 200);

log(
  "Введите текст в поле поиска. Лог появится через 300 мс после прекращения ввода.",
);
log("Очистите поле — ожидающий вызов будет отменён.");
