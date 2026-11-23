import { createTimer } from "./timer.js";

export function createController(options) {
  const { elements, settings, tasks, history, announcer } = options;

  let isInitialized = false;
  let status = "idle";
  let mode = "focus";
  let abortController = null;
  let timer = null;
  let sessionStartMs = 0;

  function setStatus(newStatus) {
    const oldStatus = status;
    status = newStatus;
    updateUI();

    // Анонс для screen reader при смене статуса
    if (announcer && oldStatus !== newStatus) {
      announceStatus(newStatus);
    }
  }

  function announceStatus(newStatus) {
    if (!announcer) return;
    const messages = {
      idle: "Таймер сброшен",
      running: "Сессия начата",
      paused: "Сессия на паузе",
      done: "Сессия завершена",
    };
    announcer.textContent = messages[newStatus] || newStatus;
  }

  function updateUI() {
    if (!isInitialized) return;

    const { displayEl, statusEl, startBtn, pauseBtn, resetBtn, timeEl } =
      elements;

    if (statusEl) statusEl.textContent = status;
    if (startBtn) startBtn.disabled = status === "running";
    if (pauseBtn) pauseBtn.disabled = status !== "running";
    if (resetBtn) resetBtn.disabled = status === "idle";
  }

  function getCurrentDurationMs() {
    return mode === "focus" ? settings.getFocusMs() : settings.getBreakMs();
  }

  function handleTick(remainingMs) {
    if (!isInitialized) return;
    const { displayEl, timeEl } = elements;

    if (displayEl) {
      displayEl.textContent = formatTime(remainingMs);
    }

    // Обновляем <time> для семантики (не озвучивается, т.к. visually-hidden)
    if (timeEl) {
      const totalSeconds = Math.floor(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timeEl.setAttribute("datetime", `PT${minutes}M${seconds}S`);
      timeEl.textContent = `${minutes} минут ${seconds} секунд`;
    }
  }

  function handleFinish() {
    if (!isInitialized) return;

    if (mode === "focus") {
      const actualDurationMs = getCurrentDurationMs();
      history.add({
        id: undefined,
        taskId: tasks.getSelectedId(),
        finishedAt: Date.now(),
        durationMs: actualDurationMs,
      });
    }

    setStatus("done");
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function onHandleStart() {
    if (status === "running") return;

    if (!timer) {
      timer = createTimer({
        durationMs: getCurrentDurationMs(),
        onTick: handleTick,
        onFinish: handleFinish,
      });
    }

    sessionStartMs = Date.now();
    setStatus("running");
    timer.start();
  }

  function onHandlePause() {
    if (status !== "running") return;
    setStatus("paused");
    if (timer) timer.pause();
  }

  function onHandleReset() {
    if (timer) {
      timer.destroy();
      timer = null;
    }
    setStatus("idle");

    const { displayEl, timeEl } = elements;
    if (displayEl) {
      displayEl.textContent = formatTime(getCurrentDurationMs());
    }
    if (timeEl) {
      const durationMs = getCurrentDurationMs();
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      timeEl.setAttribute("datetime", `PT${minutes}M${seconds}S`);
      timeEl.textContent = `${minutes} минут ${seconds} секунд`;
    }
  }

  const handleStart = onHandleStart;
  const handlePause = onHandlePause;
  const handleReset = onHandleReset;

  return {
    init() {
      if (isInitialized) return false;

      abortController = new AbortController();
      const signal = abortController.signal;

      elements.startBtn.addEventListener("click", handleStart, { signal });
      elements.pauseBtn.addEventListener("click", handlePause, { signal });
      elements.resetBtn.addEventListener("click", handleReset, { signal });

      isInitialized = true;

      const { displayEl, timeEl } = elements;
      if (displayEl) {
        displayEl.textContent = formatTime(getCurrentDurationMs());
      }
      if (timeEl) {
        const durationMs = getCurrentDurationMs();
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timeEl.setAttribute("datetime", `PT${minutes}M${seconds}S`);
        timeEl.textContent = `${minutes} минут ${seconds} секунд`;
      }
      updateUI();
      return true;
    },

    destroy() {
      if (!isInitialized) return false;

      if (timer) {
        timer.destroy();
        timer = null;
      }
      if (abortController) {
        abortController.abort();
        abortController = null;
      }

      isInitialized = false;
      status = "idle";
      return true;
    },

    getStatus: () => status,
    isInitialized: () => isInitialized,
    getMode: () => mode,

    _simulateFinish() {
      handleFinish();
    },

    simulateClick(buttonName) {
      if (!isInitialized) return false;
      if (buttonName === "start") handleStart();
      if (buttonName === "pause") handlePause();
      if (buttonName === "reset") handleReset();
      return true;
    },
  };
}
