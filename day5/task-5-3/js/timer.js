/**
 * Модуль timer.js
 * Контроллер секундомера с защитой от старых callback через runId.
 * Каждый start() и reset() инкрементирует runId.
 * Callback проверяет свой runId — если он устарел, не трогает состояние.
 * Экспортирует: createTimer()
 */

export function createTimer() {
  // Состояние
  let elapsed = 0;
  let startTime = null;
  let timerId = null;
  let running = false;

  // Защита от старых callback
  let currentRunId = 0;

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
  }

  function tick(myRunId) {
    // КЛЮЧЕВАЯ ЗАЩИТА: если runId устарел — выходим, не трогаем ничего
    if (myRunId !== currentRunId) {
      return;
    }

    // Вторая защита: если не running — тоже выходим
    if (!running) {
      return;
    }

    const now = Date.now();
    elapsed = now - startTime;

    // Планируем следующий тик, передавая ТОТ ЖЕ runId
    timerId = setTimeout(() => tick(myRunId), 100);
  }

  function start(onTick) {
    if (running) return false;

    // Инкрементируем runId — все старые callback станут недействительны
    currentRunId += 1;
    const myRunId = currentRunId;

    running = true;
    startTime = Date.now() - elapsed; // учитываем уже накопленное время
    tick(myRunId); // первый тик сразу

    if (onTick) onTick(elapsed);
    return true;
  }

  function pause(onTick) {
    if (!running) return false;

    running = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    // runId НЕ трогаем — pause не "убивает" callback, просто останавливает
    // (но tick() всё равно проверит running и выйдет)

    if (onTick) onTick(elapsed);
    return true;
  }

  function reset(onTick) {
    // Инкрементируем runId — убиваем все активные callback
    currentRunId += 1;

    running = false;
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
    elapsed = 0;
    startTime = null;

    if (onTick) onTick(elapsed);
    return true;
  }

  return {
    start,
    pause,
    reset,
    getElapsed: () => elapsed,
    isRunning: () => running,
    getRunId: () => currentRunId,
    formatTime,
  };
}
