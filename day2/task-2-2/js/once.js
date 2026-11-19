/**
 * Модуль once.js
 * Фабрика createOnce(fn) — создаёт обёртку, которая вызывает fn только один раз.
 * Экспортирует: createOnce(fn)
 */

export function createOnce(fn) {
  let called = false; // была ли функция уже вызвана
  let result = undefined; // сохранённый результат первого вызова

  return function (...args) {
    if (!called) {
      // Первый вызов: выполняем fn с правильным this и аргументами
      result = fn.apply(this, args);
      called = true;
    }
    // Все последующие вызовы: возвращаем сохранённый результат
    return result;
  };
}
