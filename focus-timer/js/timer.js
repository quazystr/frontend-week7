/**
 * Модуль timer.js
 * Фабрика createTimer(options).
 * Обновление не чаще 4 раз в секунду (250 мс), мгновенная коррекция через sync(),
 * гарантия однократного вызова onFinish.
 */

export function createTimer(options) {
  const { durationMs, onTick, onFinish } = options;

  // Приватное состояние
  let timeoutId = null;
  let deadline = null;
  let remainingMs = durationMs;
  let runId = 0;
  let isRunning = false;
  let hasFinished = false; // Гарантия однократного вызова onFinish

  function tick(currentRunId) {
    // 1. Защита от устаревшего цикла
    if (currentRunId !== runId) return;
    // 2. Защита от вызова в паузе
    if (!isRunning) return;

    // 3. Точный расчет от deadline
    remainingMs = Math.max(0, deadline - Date.now());

    // 4. Обновление интерфейса
    onTick(remainingMs);

    // 5. Завершение
    if (remainingMs <= 0) {
      isRunning = false;
      timeoutId = null;
      if (!hasFinished) {
        hasFinished = true;
        if (onFinish) onFinish();
      }
      return;
    }

    // 6. Планируем следующий тик: 1000 мс / 4 = 250 мс
    timeoutId = setTimeout(() => tick(currentRunId), 250);
  }

  return {
    start() {
      if (isRunning) return;
      if (remainingMs <= 0) return;

      runId += 1;
      isRunning = true;
      hasFinished = false; // Сбрасываем флаг при новом запуске
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
      remainingMs = Math.max(0, deadline - Date.now());
    },

    reset() {
      isRunning = false;
      hasFinished = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      runId += 1;
      remainingMs = durationMs;
      deadline = null;

      onTick(remainingMs); // Мгновенное обновление UI на стартовое значение
    },

    // НОВЫЙ МЕТОД: Мгновенная коррекция (для возвращения на вкладку)
    sync() {
      if (!isRunning) return;

      // Отменяем плановый тик, чтобы не было двойного обновления
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // Вызываем tick немедленно: он пересчитает remainingMs от текущего Date.now()
      // и сам запланирует следующий тик через 250 мс
      tick(runId);
    },

    getSnapshot() {
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
    },
  };
}
