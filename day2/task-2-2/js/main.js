/**
 * Модуль main.js
 * Демо: создаём функцию с счётчиком вызовов, оборачиваем в once,
 * показываем, что реальный вызов происходит только один раз.
 */

import { createOnce } from "./once.js";

// Функция, которая считает, сколько раз её реально вызвали
let realCallCount = 0;

function expensiveCalculation(x, y) {
  realCallCount += 1;
  // Имитация тяжёлой работы
  const result = x * y + Math.random();
  return result;
}

// Оборачиваем в once
const onceCalc = createOnce(expensiveCalculation);

// Также тестируем передачу this
const obj = {
  multiplier: 10,
  compute(a, b) {
    return (a + b) * this.multiplier;
  },
};

const onceMethod = createOnce(obj.compute);

// DOM-элементы
const callBtn = document.getElementById("call-btn");
const callWithThisBtn = document.getElementById("call-with-this-btn");
const resetBtn = document.getElementById("reset-btn");
const outputEl = document.getElementById("output");
const realCallsEl = document.getElementById("real-calls");
const wrapperCallsEl = document.getElementById("wrapper-calls");

let wrapperCallCount = 0;

function log(message) {
  const line = document.createElement("div");
  line.textContent = message;
  outputEl.appendChild(line);
}

function updateStats() {
  realCallsEl.textContent = String(realCallCount);
  wrapperCallsEl.textContent = String(wrapperCallCount);
}

// Обработчик обычного вызова
callBtn.addEventListener("click", () => {
  wrapperCallCount += 1;
  const arg1 = Math.floor(Math.random() * 10);
  const arg2 = Math.floor(Math.random() * 10);

  log(`Вызов #${wrapperCallCount}: onceCalc(${arg1}, ${arg2})`);
  const result = onceCalc(arg1, arg2);
  log(`  → Результат: ${result.toFixed(4)}`);
  log(`  → Реальных вызовов expensiveCalculation: ${realCallCount}`);

  updateStats();
});

// Обработчик вызова с this
callWithThisBtn.addEventListener("click", () => {
  wrapperCallCount += 1;
  const a = Math.floor(Math.random() * 5);
  const b = Math.floor(Math.random() * 5);

  log(`Вызов #${wrapperCallCount}: onceMethod.call(obj, ${a}, ${b})`);
  // Передаём this через call
  const result = onceMethod.call(obj, a, b);
  log(`  → Результат: ${result} (ожидается ${(a + b) * 10} при первом вызове)`);

  updateStats();
});

// Сброс
resetBtn.addEventListener("click", () => {
  outputEl.textContent = "";
  log("--- Сброс ---");
});

// Начальные проверки через console.assert
console.assert(realCallCount === 0, "До вызовов счётчик реальных вызовов = 0");

const testOnce = createOnce((x) => x * 2);
console.assert(testOnce(5) === 10, "Первый вызов возвращает результат");
console.assert(
  testOnce(100) === 10,
  "Второй вызов возвращает тот же результат",
);
console.assert(
  testOnce(999) === 10,
  "Третий вызов тоже возвращает тот же результат",
);

log(
  "Все console.assert прошли. Нажимайте кнопки, чтобы увидеть once в действии.",
);
updateStats();
