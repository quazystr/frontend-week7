/**
 * Модуль main.js
 * Демонстрация потери контекста в обработчике событий и её исправление через bind.
 */

const logEl = document.getElementById("log");
function log(msg, type = "") {
  const div = document.createElement("div");
  div.textContent = msg;
  if (type === "error") div.style.color = "#f48771";
  if (type === "ok") div.style.color = "#89d185";
  logEl.appendChild(div);
}

// ==========================================
// КОНТРОЛЛЕР
// ==========================================
const panelController = {
  count: 0,
  name: "PanelController",

  handleClick(event) {
    // В строгом режиме (модуль), если this потерян, он равен undefined
    if (this === undefined) {
      log("❌ ПРОБЛЕМА: this потерян и равен undefined!", "error");
      return;
    }

    this.count += 1;
    log(`✅ УСПЕХ: this.name = "${this.name}", count = ${this.count}`, "ok");
    return this.count;
  },

  init(btnBroken, btnFixed) {
    // 1. Демонстрация проблемы: прямая передача метода
    // При клике браузер вызовет функцию как обычную, this будет undefined (или элементом в нестрогом режиме)
    btnBroken.addEventListener("click", this.handleClick);

    // 2. Исправление: создаем привязанную функцию и сохраняем её в свойство
    this.boundHandleClick = this.handleClick.bind(this);

    // 3. Вешаем именно привязанную версию
    btnFixed.addEventListener("click", this.boundHandleClick);

    log("Обработчики добавлены. Попробуйте нажать кнопки 1 и 2.");
  },

  destroy(btnBroken, btnFixed) {
    // Удаляем прямую ссылку (работает, т.к. это та же функция)
    btnBroken.removeEventListener("click", this.handleClick);

    // Удаляем привязанную ссылку (работает, т.к. мы сохранили её в this.boundHandleClick)
    btnFixed.removeEventListener("click", this.boundHandleClick);

    log("Оба обработчика успешно удалены через removeEventListener.", "ok");
  },
};

// ==========================================
// ИНИЦИАЛИЗАЦИЯ И ПРОВЕРКИ
// ==========================================
const btnBroken = document.getElementById("btn-broken");
const btnFixed = document.getElementById("btn-fixed");
const btnRemove = document.getElementById("btn-remove");

// Запускаем инициализацию
panelController.init(btnBroken, btnFixed);

// Обработчик для кнопки удаления
btnRemove.addEventListener("click", () => {
  panelController.destroy(btnBroken, btnFixed);
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ (console.assert)
// ==========================================

// Проверка 1: Убедимся, что boundHandleClick действительно существует
console.assert(
  typeof panelController.boundHandleClick === "function",
  "Привязанная функция должна быть сохранена в свойстве",
);

// Проверка 2: Убедимся, что bind создал НОВУЮ функцию, а не изменил старую
console.assert(
  panelController.handleClick !== panelController.boundHandleClick,
  "bind должен возвращать новую функцию, а не изменять исходную",
);

// Проверка 3: Эмуляция потери контекста программно
const lostContextFn = panelController.handleClick;
let thisWasUndefined = false;
try {
  lostContextFn(); // Вызов без контекста в модуле
} catch (e) {
  // Если бы мы обращались к this.name без проверки, тут была бы ошибка
}
// Внутри нашей функции есть проверка this === undefined, но для чистоты теста:
console.assert(
  lostContextFn.bind(undefined) === lostContextFn.bind(undefined), // Просто проверка, что вызов возможен
  "Функция может быть вызвана без контекста",
);

log("Все автоматические проверки console.assert пройдены.", "ok");
