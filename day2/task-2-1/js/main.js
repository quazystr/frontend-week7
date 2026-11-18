/**
 * Модуль main.js
 * Создаёт два независимых счётчика и связывает их с DOM.
 */

import { createCounter } from "./counter.js";

// Два счётчика с разными start и step
const counterA = createCounter(0, 1);
const counterB = createCounter(100, 5);

// Связь с DOM
const displayA = document.getElementById("display-a");
const displayB = document.getElementById("display-b");

function updateDisplayA() {
  displayA.textContent = String(counterA.getValue());
}

function updateDisplayB() {
  displayB.textContent = String(counterB.getValue());
}

// Обработчики для счётчика A
document.getElementById("a-inc").addEventListener("click", () => {
  counterA.increment();
  updateDisplayA();
});

document.getElementById("a-dec").addEventListener("click", () => {
  counterA.decrement();
  updateDisplayA();
});

document.getElementById("a-reset").addEventListener("click", () => {
  counterA.reset();
  updateDisplayA();
});

// Обработчики для счётчика B
document.getElementById("b-inc").addEventListener("click", () => {
  counterB.increment();
  updateDisplayB();
});

document.getElementById("b-dec").addEventListener("click", () => {
  counterB.decrement();
  updateDisplayB();
});

document.getElementById("b-reset").addEventListener("click", () => {
  counterB.reset();
  updateDisplayB();
});

// Начальная отрисовка
updateDisplayA();
updateDisplayB();

// Проверка независимости через console.assert
console.assert(counterA.getValue() === 0, "Счётчик A стартует с 0");
console.assert(counterB.getValue() === 100, "Счётчик B стартует со 100");

counterA.increment();
counterB.increment();
console.assert(counterA.getValue() === 1, "A увеличился на 1 (step=1)");
console.assert(counterB.getValue() === 105, "B увеличился на 5 (step=5)");

// Проверяем, что прямого доступа к value нет
console.assert(counterA.value === undefined, "Прямого доступа к value нет");
console.assert(counterB.value === undefined, "Прямого доступа к value нет");
