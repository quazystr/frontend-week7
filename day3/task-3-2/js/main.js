/**
 * Модуль main.js
 * Демонстрация call, apply, bind и невозможности повторного bind.
 */

// Исходная функция, зависящая от this
function formatMessage(prefix, suffix) {
  return `${prefix} ${this.name} ${suffix}`;
}

// Три разных объекта
const user1 = { name: "Алиса" };
const user2 = { name: "Боб" };
const user3 = { name: "Чарли" };
const fakeUser = { name: "Самозванец" };

console.log("=== 1. Вызов через call ===");
// call принимает контекст первым аргументом, остальные аргументы — через запятую
const resCall1 = formatMessage.call(user1, "Привет,", "!");
const resCall2 = formatMessage.call(user2, "Здравствуй,", ".");
const resCall3 = formatMessage.call(user3, "Добрый день,", "...");

console.log(resCall1);
console.log(resCall2);
console.log(resCall3);

console.assert(resCall1 === "Привет, Алиса !", "call не сработал для user1");
console.assert(resCall2 === "Здравствуй, Боб .", "call не сработал для user2");
console.assert(
  resCall3 === "Добрый день, Чарли ...",
  "call не сработал для user3",
);

console.log("\n=== 2. Вызов через apply ===");
// apply принимает контекст первым аргументом, а аргументы для функции — массивом
const argsArray = ["Салют,", "из apply!"];
const resApply = formatMessage.apply(user2, argsArray);

console.log(resApply);
console.assert(
  resApply === "Салют, Боб из apply!",
  "apply не сработал корректно",
);

console.log("\n=== 3. Создание функции через bind ===");
// bind возвращает НОВУЮ функцию с жестко закрепленным this и (опционально) аргументами
const greetCharlie = formatMessage.bind(user3, "Рад видеть,", "рад видеть!");
const resBind = greetCharlie();

console.log(resBind);
console.assert(
  resBind === "Рад видеть, Чарли рад видеть!",
  "bind не сработал корректно",
);

console.log("\n=== 4. Попытка повторного bind (не меняет контекст) ===");
// Пытаемся переопределить this у уже привязанной функции
const doubleBound = greetCharlie.bind(fakeUser, "Ложь:", "!");
const resDoubleBind = doubleBound();

console.log("Результат двойного bind:", resDoubleBind);
// Ожидаем, что 'Самозванец' НЕ появится, потому что первый bind победил
console.assert(
  resDoubleBind === "Рад видеть, Чарли рад видеть!",
  "Повторный bind не должен менять уже привязанный контекст!",
);

console.log("\n=== Все проверки console.assert пройдены ===");
