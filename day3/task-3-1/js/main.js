/**
 * Модуль main.js
 * Демонстрация 4 форм вызова функции и поведения this.
 * Выполняется в строгом режиме (модуль), поэтому глобальный this === undefined.
 */

const player = {
  name: "Focus",
  role: "Hero",
  printInfo() {
    // Используем опциональную цепочку, чтобы код не падал, если this === undefined
    const currentName = this?.name ?? "undefined";
    const currentRole = this?.role ?? "undefined";
    console.log(`Name: ${currentName}, Role: ${currentRole}`);
    return this; // Возвращаем this для проверок
  },
};

console.log("=== 1. Вызов как метод объекта ===");
// Прогноз: this === player (неявная привязка, объект слева от точки)
const result1 = player.printInfo();
console.assert(result1 === player, "1. Ошибка: this должен быть равен player");

console.log("\n=== 2. Отдельный вызов функции (потеря контекста) ===");
const detached = player.printInfo;
// Прогноз: this === undefined (потеря контекста, строгий режим модуля)
try {
  const result2 = detached();
  console.assert(
    result2 === undefined,
    "2. Ошибка: this должен быть undefined",
  );
} catch (error) {
  console.log(
    "Поймана ошибка (ожидаемо в строгом режиме при обращении к this):",
    error.message,
  );
}

console.log("\n=== 3. Вызов через call ===");
// Прогноз: this === player (явная привязка, передаем объект первым аргументом)
const result3 = detached.call(player);
console.assert(
  result3 === player,
  "3. Ошибка: call должен установить this в player",
);

console.log("\n=== 4. Вызов через bind ===");
// Прогноз: this === player (жесткая привязка, создается новая функция)
const boundPrint = detached.bind(player);
const result4 = boundPrint();
console.assert(
  result4 === player,
  "4. Ошибка: bind должен навсегда установить this в player",
);

console.log("\n=== Все проверки console.assert пройдены ===");
