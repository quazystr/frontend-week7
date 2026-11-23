/**
 * Модуль timer.js
 * Фабрика createTimer(options).
 * Управляет логикой обратного отсчета. Не знает ничего о DOM или localStorage.
 */

export function createTimer(options) {
  const { durationMs, onTick, onFinish } = options;

  // Приватное состояние замыкания
  let timeoutId = null;
  let deadline = null;
  let remainingMs = durationMs;
  let runId = 0;
  let isRunning = false;

  // Внутренняя функция тика
  function tick(currentRunId) {
    // 1. Защита от старого callback (если был reset или новый start)
    if (currentRunId !== runId) {
      return;
    }

    // 2. Защита от вызова в паузе
    if (!isRunning) {
      return;
    }

    // 3. Вычисляем точное оставшееся время от deadline
    remainingMs = Math.max(0, deadline - Date.now());

    // 4. Сообщаем внешнему миру
    onTick(remainingMs);

    // 5. Проверка завершения
    if (remainingMs <= 0) {
      isRunning = false;
      timeoutId = null;
      if (onFinish) {
        onFinish();
      }
      return;
    }

    // 6. Планируем следующий тик (100 мс для плавности UI без перегрузки Event Loop)
    timeoutId = setTimeout(() => tick(currentRunId), 100);
  }

  // Публичный API
  return {
    start() {
      if (isRunning) return; // Защита от двойного запуска

      runId += 1; // Инкрементируем, убивая все старые циклы
      isRunning = true;
      deadline = Date.now() + remainingMs;

      tick(runId); // Первый тик сразу
    },

    pause() {
      if (!isRunning) return;

      isRunning = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      // Фиксируем точное оставшееся время на момент паузы
      remainingMs = Math.max(0, deadline - Date.now());
    },

    reset() {
      isRunning = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      runId += 1; // Сбрасываем runId, чтобы любые зависшие тики умерли
      remainingMs = durationMs;
      deadline = null;

      onTick(remainingMs); // Сразу обновляем UI на стартовое значение
    },

    getSnapshot() {
      // Возвращаем актуальное состояние. Если таймер идет, вычисляем на лету.
      const currentRemaining = isRunning
        ? Math.max(0, deadline - Date.now())
        : remainingMs;
      return {
        isRunning,
        remainingMs: currentRemaining,
        runId,
      };
    },

    destroy() {
      this.reset();
      // В сложных приложениях здесь можно обнулить onTick и onFinish
      // для гарантированного освобождения замыканий, но для нашей задачи reset достаточно.
    },
  };
}
