/**
 * Модуль counter.js
 * Фабрика createCounter — создаёт независимые счётчики с приватным состоянием.
 * Экспортирует: createCounter(start, step)
 */

export function createCounter(start = 0, step = 1) {
  let value = start; // приватная переменная — доступна только методам ниже

  return {
    increment() {
      value += step;
      return value;
    },
    decrement() {
      value -= step;
      return value;
    },
    getValue() {
      return value;
    },
    reset() {
      value = start;
      return value;
    },
  };
}
