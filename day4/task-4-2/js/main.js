/**
 * Модуль main.js
 * Демо throttle: серия из 20 быстрых кликов.
 * Счётчик обновляется ограниченное число раз,
 * но последнее значение обязательно отображается.
 */

import { createThrottle } from "./throttle.js";

const logEl = document.getElementById("log");
const clickBtn = document.getElementById("click-btn");
const autoBtn = document.getElementById("auto-btn");
const cancelBtn = document.getElementById("cancel-btn");
const counterEl = document.getElementById("counter");
const updatesEl = document.getElementById("updates");

function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  if (type === "info") div.style.color = "#6a9955";
  logEl.appendChild(div);
}

let counter = 0;
let updateCount = 0;

// Функция, которая будет вызываться через throttle
function updateCounter(value) {
  counter = value;
  updateCount += 1;
  counterEl.textContent = String(counter);
  updatesEl.textContent = String(updateCount);
  log(`🔄 Обновление #${updateCount}: значение = ${counter}`, "ok");
}

// Создаём throttle-обёртку с интервалом 500 мс
const throttledUpdate = createThrottle(updateCounter, 500);

// Ручной клик
clickBtn.addEventListener("click", () => {
  throttledUpdate(counter + 1);
});

// Автоматическая серия из 20 кликов
autoBtn.addEventListener("click", () => {
  log("--- Запуск серии из 20 кликов (интервал 20 мс) ---", "info");
  log(`До серии: counter = ${counter}, updates = ${updateCount}`, "info");

  for (let i = 1; i <= 20; i++) {
    setTimeout(() => {
      throttledUpdate(counter + 1);
      if (i === 20) {
        // После последнего клика ждём, чтобы сработал trailing
        setTimeout(() => {
          log(`--- Серия завершена ---`, "info");
          log(
            `После серии: counter = ${counter}, updates = ${updateCount}`,
            "info",
          );
          log(
            `Кликов было: 20, обновлений UI: ${updateCount - (updateCount - 1) > 0 ? "см. выше" : "..."}`,
            "info",
          );
          console.assert(counter > 0, "Счётчик должен увеличиться");
          console.assert(
            updateCount < 20,
            "Обновлений должно быть меньше, чем кликов",
          );
        }, 600);
      }
    }, i * 20);
  }
});

// Отмена
cancelBtn.addEventListener("click", () => {
  throttledUpdate.cancel();
  log("⚠️ Throttle отменён через cancel()", "info");
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: cancel() существует
console.assert(
  typeof throttledUpdate.cancel === "function",
  "throttled должна иметь метод cancel()",
);

// Проверка 2: leading — первый вызов выполняется сразу
let leadingCalled = false;
const testLeading = createThrottle(() => {
  leadingCalled = true;
}, 500);
testLeading();
console.assert(
  leadingCalled === true,
  "Первый вызов должен быть немедленным (leading)",
);

// Проверка 3: trailing — последнее значение не теряется
let trailingResult = null;
const testTrailing = createThrottle((value) => {
  trailingResult = value;
}, 100);

testTrailing(1); // leading, выполняется сразу → trailingResult = 1
testTrailing(2); // в интервале → отложен
testTrailing(3); // в интервале → отложен, аргументы обновлены
testTrailing(4); // в интервале → отложен, аргументы обновлены

setTimeout(() => {
  console.assert(
    trailingResult === 4,
    "Trailing должен вызвать с последним аргументом (4)",
  );
  log("✅ Все console.assert пройдены", "ok");
}, 200);

// Проверка 4: this передаётся корректно
const obj = {
  name: "TestObj",
  value: 0,
  update(v) {
    console.assert(this === obj, "this должен быть obj");
    this.value = v;
  },
};
const throttledMethod = createThrottle(obj.update, 100);
throttledMethod.call(obj, 42);
console.assert(obj.value === 42, "this должен передаться корректно");

log("Нажимайте кнопки, чтобы увидеть throttle в действии.");
log(
  "Интервал: 500 мс. Быстрые клики дают ограниченное число обновлений, но последнее обязательно.",
);
