/**
 * Модуль auto-saver.js
 * Фабрика createAutoSaver(save, delay) — создаёт автосейвер.
 * Откладывает вызов save(value) на delay мс. Если за это время
 * вызвали schedule() снова — таймер сбрасывается.
 * Экспортирует: createAutoSaver(save, delay)
 */

export function createAutoSaver(save, delay) {
  // Приватное состояние замыкания:
  // - timerId: ID текущего setTimeout (для отмены)
  // - pendingValue: последнее значение, переданное в schedule
  let timerId = null;
  let pendingValue = undefined;

  return {
    schedule(value) {
      // Если уже есть таймер — отменяем его (сбрасываем задержку)
      if (timerId !== null) {
        clearTimeout(timerId);
      }
      // Сохраняем значение и планируем новый таймер
      pendingValue = value;
      timerId = setTimeout(() => {
        timerId = null; // обнуляем, чтобы состояние было чистым
        save(pendingValue);
      }, delay);
    },

    flush() {
      // Если есть отложенное значение — сохраняем его немедленно
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
        save(pendingValue);
        pendingValue = undefined;
      }
    },

    cancel() {
      // Отменяем таймер и сбрасываем состояние
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      pendingValue = undefined;
    },
  };
}
