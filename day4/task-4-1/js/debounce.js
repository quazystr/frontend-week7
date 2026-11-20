/**
 * Модуль debounce.js
 * Фабрика createDebounce(fn, delay) — создаёт debounce-обёртку.
 * При каждом вызове отменяет предыдущий таймер и ставит новый.
 * Callback выполняется только после "тишины" длительностью delay мс.
 * Экспортирует: createDebounce(fn, delay)
 */

export function createDebounce(fn, delay) {
  // Приватное состояние замыкания
  let timerId = null;
  let lastArgs = null;
  let lastThis = null;

  // Возвращаемая debounce-функция
  const debounced = function (...args) {
    // Сохраняем последние аргументы и контекст
    lastArgs = args;
    lastThis = this;

    // Если есть ожидающий таймер — отменяем его
    if (timerId !== null) {
      clearTimeout(timerId);
    }

    // Планируем новый таймер
    timerId = setTimeout(() => {
      timerId = null;
      // Вызываем fn с сохранёнными аргументами и контекстом
      fn.apply(lastThis, lastArgs);
      // Освобождаем ссылки для сборщика мусора
      lastArgs = null;
      lastThis = null;
    }, delay);
  };

  // Метод cancel() — отменяет ожидающий вызов
  debounced.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastArgs = null;
    lastThis = null;
  };

  return debounced;
}
