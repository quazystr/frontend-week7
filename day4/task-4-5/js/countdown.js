/**
 * Модуль countdown.js
 * Фабрика createCountdown({ durationMs, tickIntervalMs, onTick, onFinish }).
 * Обратный отсчёт на deadline: остаток всегда вычисляется от Date.now(),
 * поэтому пропущенные тики не «догоняются» и не накапливают ошибку.
 * Экспортирует: createCountdown(options)
 *
 * Методы: start, pause, reset, cancel, sync, getRemainingMs, isRunning
 */

export function createCountdown({
  durationMs,
  tickIntervalMs = 100,
  onTick,
  onFinish,
}) {
  // Приватное состояние замыкания
  let deadline = null; // абсолютный момент окончания (Date.now + остаток)
  let remainingMs = durationMs;
  let timerId = null; // один таймер за раз
  let running = false; // явный выбор пользователя (Start / Pause)

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function schedule() {
    clearTimer();
    const rest = Math.max(0, deadline - Date.now());
    // Не ждём дольше, чем осталось, чтобы финиш был точным
    timerId = setTimeout(step, Math.min(tickIntervalMs, rest));
  }

  function step() {
    timerId = null;

    // Защита от позднего callback после pause/reset/cancel
    if (!running) return;

    remainingMs = Math.max(0, deadline - Date.now());
    onTick(remainingMs, "tick");

    if (remainingMs <= 0) {
      running = false;
      deadline = null;
      clearTimer();
      if (onFinish) onFinish();
      return;
    }

    schedule();
  }

  function start() {
    if (running) return false; // повторный Start безопасен
    if (remainingMs <= 0) return false; // после финиша нужен Reset

    running = true;
    deadline = Date.now() + remainingMs;
    step(); // мгновенная отрисовка + постановка таймера
    return true;
  }

  function cancel() {
    // Отменяет ожидающий тик и фиксирует остаток, но НЕ сбрасывает значение
    if (!running) return false;
    remainingMs = Math.max(0, deadline - Date.now());
    running = false;
    deadline = null;
    clearTimer();
    return true;
  }

  function pause() {
    const stopped = cancel();
    if (stopped) onTick(remainingMs, "pause");
    return stopped;
  }

  function reset() {
    clearTimer();
    running = false;
    deadline = null;
    remainingMs = durationMs;
    onTick(remainingMs, "reset");
  }

  function sync() {
    // Вызывается при возврате на вкладку.
    // Если пользователь поставил паузу — ничего не делаем.
    if (!running) return false;
    clearTimer();
    step(); // один пересчёт от deadline, без проигрывания пропущенных тиков
    return true;
  }

  return {
    start,
    pause,
    reset,
    cancel,
    sync,
    getRemainingMs: () =>
      running ? Math.max(0, deadline - Date.now()) : remainingMs,
    isRunning: () => running,
  };
}
