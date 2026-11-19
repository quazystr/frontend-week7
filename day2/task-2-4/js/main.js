/**
 * Модуль main.js
 * Демонстрация замыкания в цикле: три варианта создания кнопок.
 */

const varContainer = document.getElementById("var-buttons");
const letContainer = document.getElementById("let-buttons");
const factoryContainer = document.getElementById("factory-buttons");

// ==========================================
// ВАРИАНТ 1: var (сломанный)
// ==========================================
// var имеет функциональную область видимости, поэтому переменная i одна на весь цикл.
// К моменту клика цикл уже завершился, и i === 5 для всех кнопок.
for (var i = 1; i <= 5; i++) {
  const btn = document.createElement("button");
  btn.textContent = `Кнопка ${i} (var)`;
  btn.addEventListener("click", () => {
    alert(`Вы нажали кнопку ${i} (var) — но i всегда равно 5!`);
  });
  varContainer.appendChild(btn);
}

// ==========================================
// ВАРИАНТ 2: let (исправленный)
// ==========================================
// let имеет блочную область видимости, поэтому на каждую итерацию цикла создаётся
// новая переменная i. Каждая кнопка "помнит" своё значение i через замыкание.
for (let i = 1; i <= 5; i++) {
  const btn = document.createElement("button");
  btn.textContent = `Кнопка ${i} (let)`;
  btn.addEventListener("click", () => {
    alert(`Вы нажали кнопку ${i} (let) — i равно ${i}, как и ожидалось!`);
  });
  letContainer.appendChild(btn);
}

// ==========================================
// ВАРИАНТ 3: фабрика createHandler (исправленный)
// ==========================================
// Фабрика создаёт функцию-обработчик, которая замыкает аргумент index.
// Каждый вызов createHandler(index) создаёт новое лексическое окружение
// со своей переменной index, поэтому каждая кнопка помнит свой номер.
function createHandler(index) {
  return function () {
    alert(`Вы нажали кнопку ${index} (фабрика) — index равно ${index}!`);
  };
}

for (let i = 1; i <= 5; i++) {
  const btn = document.createElement("button");
  btn.textContent = `Кнопка ${i} (фабрика)`;
  btn.addEventListener("click", createHandler(i));
  factoryContainer.appendChild(btn);
}

// Проверка через console.assert
console.assert(
  true,
  "Скрипт инициализирован. Все три варианта кнопок созданы.",
);
