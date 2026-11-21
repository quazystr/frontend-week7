/**
 * Модуль controller.js
 * Контроллер с групповой отменой обработчиков через AbortController.
 * Один signal на все обработчики — один abort() снимает их все.
 * Повторные init() и destroy() безопасны (идемпотентны).
 * Экспортирует: createController()
 */

export function createController() {
  // Состояние
  let isInitialized = false;
  let abortController = null;
  let timerId = null;
  let tickCount = 0;

  // DOM-ссылки (обнуляются в destroy)
  let btnStart = null;
  let btnStop = null;
  let btnReset = null;
  let displayEl = null;
  let onTick = null;

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function tick() {
    tickCount += 1;
    if (onTick) onTick(tickCount);

    // Планируем следующий тик
    timerId = setTimeout(tick, 500);
  }

  function handleStart() {
    clearTimer();
    tick();
    if (displayEl) displayEl.textContent = "Работает";
  }

  function handleStop() {
    clearTimer();
    if (displayEl) displayEl.textContent = "Остановлен";
  }

  function handleReset() {
    clearTimer();
    tickCount = 0;
    if (onTick) onTick(tickCount);
    if (displayEl) displayEl.textContent = "Сброшен";
  }

  function init(elements, tickCallback) {
    // Защита от повторной инициализации
    if (isInitialized) {
      return false;
    }

    // Сохраняем ссылки
    btnStart = elements.btnStart;
    btnStop = elements.btnStop;
    btnReset = elements.btnReset;
    displayEl = elements.displayEl;
    onTick = tickCallback;

    // Создаём новый AbortController для этой "сессии"
    abortController = new AbortController();
    const signal = abortController.signal;

    // Все обработчики вешаются с одним signal
    btnStart.addEventListener("click", handleStart, { signal });
    btnStop.addEventListener("click", handleStop, { signal });
    btnReset.addEventListener("click", handleReset, { signal });

    isInitialized = true;
    return true;
  }

  function destroy() {
    // Защита от повторного destroy
    if (!isInitialized) {
      return false;
    }

    // ОДИН abort() снимает ВСЕ обработчики, повешенные с этим signal
    if (abortController !== null) {
      abortController.abort();
      abortController = null;
    }

    // Чистим таймер
    clearTimer();

    // Обнуляем ссылки для освобождения памяти
    btnStart = null;
    btnStop = null;
    btnReset = null;
    displayEl = null;
    onTick = null;
    tickCount = 0;

    isInitialized = false;
    return true;
  }

  return {
    init,
    destroy,
    isInitialized: () => isInitialized,
    getTickCount: () => tickCount,
    hasAbortController: () => abortController !== null,
    hasTimer: () => timerId !== null,
  };
}
