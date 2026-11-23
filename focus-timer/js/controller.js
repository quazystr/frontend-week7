import { createTimer } from "./timer.js";

export function createController(options) {
  const { elements, settings } = options;

  let isInitialized = false;
  let status = "idle";
  let mode = "focus"; // focus | break
  let abortController = null;
  let timer = null;

  function setStatus(newStatus) {
    status = newStatus;
    updateUI();
  }

  function updateUI() {
    if (!isInitialized) return;

    const { displayEl, statusEl, startBtn, pauseBtn, resetBtn } = elements;

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
    const { displayEl } = elements;
    if (displayEl) {
      displayEl.textContent = formatTime(remainingMs);
    }
  }

  function handleFinish() {
    if (!isInitialized) return;
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

    setStatus("running");
    timer.start();
  }

  function onHandlePause() {
    if (status !== "running") return;
    setStatus("paused");
    if (timer) timer.pause();
  }

  function onHandleReset() {
    // Сбрасываем таймер — длительность возьмётся заново из settings при следующем start
    if (timer) {
      timer.destroy();
      timer = null;
    }
    setStatus("idle");

    // Обновляем дисплей согласно текущим настройкам
    const { displayEl } = elements;
    if (displayEl) {
      displayEl.textContent = formatTime(getCurrentDurationMs());
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

      // Начальное отображение
      const { displayEl } = elements;
      if (displayEl) {
        displayEl.textContent = formatTime(getCurrentDurationMs());
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

    simulateClick(buttonName) {
      if (!isInitialized) return false;
      if (buttonName === "start") handleStart();
      if (buttonName === "pause") handlePause();
      if (buttonName === "reset") handleReset();
      return true;
    },
  };
}
