/**
 * Модуль throttle.js
 * Фабрика createThrottle(fn, interval) — создаёт throttle-обёртку.
 * Первый вызов в серии выполняется сразу (leading).
 * Последний вызов в серии обязательно выполняется после interval (trailing).
 * Промежуточные вызовы отбрасываются, но последнее значение сохраняется.
 * Экспортирует: createThrottle(fn, interval)
 */

export function createThrottle(fn, interval) {
  // Приватное состояние замыкания
  let lastCallTime = null; // время последнего фактического вызова
  let timerId = null; // ID таймера для trailing вызова
  let lastArgs = null; // последние аргументы (для trailing)
  let lastThis = null; // последний контекст (для trailing)

  const throttled = function (...args) {
    const now = Date.now();
    // Сохраняем самые свежие аргументы и контекст
    lastArgs = args;
    lastThis = this;

    // Первый вызов — выполняем сразу (leading)
    if (lastCallTime === null) {
      lastCallTime = now;
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;
      return;
    }

    const elapsed = now - lastCallTime;

    if (elapsed >= interval) {
      // Прошло достаточно времени — новая серия, выполняем сразу (leading)
      lastCallTime = now;
      fn.apply(lastThis, lastArgs);
      lastArgs = null;
      lastThis = null;

      // Отменяем возможный запланированный trailing, он больше не нужен
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    } else {
      // Ещё рано — планируем trailing вызов, если его ещё нет
      if (timerId === null) {
        timerId = setTimeout(() => {
          lastCallTime = Date.now();
          timerId = null;
          fn.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }, interval - elapsed);
      }
      // Если trailing уже запланирован — просто обновляем lastArgs/lastThis,
      // таймер не трогаем (иначе trailing будет сдвигаться бесконечно)
    }
  };

  // Метод cancel() — отменяет всё
  throttled.cancel = function () {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    lastCallTime = null;
    lastArgs = null;
    lastThis = null;
  };

  return throttled;
}
