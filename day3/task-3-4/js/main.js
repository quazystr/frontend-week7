/**
 * Модуль main.js
 * Три способа передать callback в setTimeout + демонстрация проблемы стрелочного метода.
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
// ОБЪЕКТ С ОБЫЧНЫМИ МЕТОДАМИ
// ==========================================
const timerController = {
  name: "TimerController",
  delay: 100,

  // Вариант 1: обычный callback — this теряется
  startWithCallback() {
    log(`[startWithCallback] Запуск. this.name = "${this?.name}"`, "info");
    setTimeout(function () {
      // В модуле this === undefined
      const currentName = this?.name ?? "undefined";
      log(`[callback] Через 100 мс: this.name = "${currentName}"`, "error");
    }, this.delay);
  },

  // Вариант 2: callback с bind(this)
  startWithBind() {
    log(`[startWithBind] Запуск. this.name = "${this?.name}"`, "info");
    setTimeout(
      function () {
        const currentName = this?.name ?? "undefined";
        log(`[bind] Через 100 мс: this.name = "${currentName}"`, "ok");
      }.bind(this),
      this.delay,
    );
  },

  // Вариант 3: стрелка внутри метода
  startWithArrow() {
    log(`[startWithArrow] Запуск. this.name = "${this?.name}"`, "info");
    setTimeout(() => {
      // Стрелка не создаёт свой this — берёт из внешнего метода
      const currentName = this?.name ?? "undefined";
      log(`[arrow] Через 100 мс: this.name = "${currentName}"`, "ok");
    }, this.delay);
  },
};

// ==========================================
// ОБЪЕКТ СО СТРЕЛОЧНЫМ МЕТОДОМ (демонстрация проблемы)
// ==========================================
const arrowMethodObj = {
  name: "ArrowMethodObj",
  // Стрелочный метод — у него нет своего this
  printName: () => {
    const currentName = this?.name ?? "undefined";
    log(`[arrow method] this.name = "${currentName}"`, "error");
  },
};

// ==========================================
// ОБРАБОТЧИКИ КНОПОК
// ==========================================
document.getElementById("btn-callback").addEventListener("click", () => {
  log("--- Вариант 1: обычный callback ---", "info");
  timerController.startWithCallback();
});

document.getElementById("btn-bind").addEventListener("click", () => {
  log("--- Вариант 2: callback с bind ---", "info");
  timerController.startWithBind();
});

document.getElementById("btn-arrow").addEventListener("click", () => {
  log("--- Вариант 3: стрелка внутри метода ---", "info");
  timerController.startWithArrow();
});

document.getElementById("btn-arrow-method").addEventListener("click", () => {
  log("--- Бонус: стрелочный метод объекта ---", "info");
  arrowMethodObj.printName();
});

// ==========================================
// АВТОМАТИЧЕСКИЕ ПРОВЕРКИ
// ==========================================

// Проверка 1: стрелочный метод теряет this (в модуле this === undefined)
let arrowMethodLostThis = false;
const testObj = {
  name: "Test",
  arrowFn: () => {
    arrowMethodLostThis = this === undefined;
  },
};
testObj.arrowFn();
console.assert(arrowMethodLostThis, "Стрелочный метод объекта теряет this");

// Проверка 2: обычный метод получает this при вызове как obj.method()
let regularMethodGotThis = false;
const testObj2 = {
  name: "Test2",
  regularFn() {
    regularMethodGotThis = this === testObj2;
  },
};
testObj2.regularFn();
console.assert(
  regularMethodGotThis,
  "Обычный метод получает this при вызове через точку",
);

log("--- Все console.assert пройдены ---", "ok");
