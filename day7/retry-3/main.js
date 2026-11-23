/**
 * Retry-3: контроллер с AbortController с нуля.
 * Задача: init() вешает обработчики, destroy() снимает их все.
 * Повторные init/destroy безопасны.
 */

function createController({ elements }) {
  let initialized = false;
  let abortController = null;
  let count = 0;

  function updateDisplay() {
    if (!initialized) return;
    elements.display.textContent = String(count);
  }

  function onStart() {
    if (!initialized) return;
    count += 1;
    updateDisplay();
  }

  function onReset() {
    if (!initialized) return;
    count = 0;
    updateDisplay();
  }

  return {
    init() {
      if (initialized) return false;

      abortController = new AbortController();
      const signal = abortController.signal;

      elements.startBtn.addEventListener("click", onStart, { signal });
      elements.resetBtn.addEventListener("click", onReset, { signal });

      initialized = true;
      updateDisplay();
      return true;
    },

    destroy() {
      if (!initialized) return false;

      if (abortController) {
        abortController.abort();
        abortController = null;
      }

      initialized = false;
      return true;
    },

    isInitialized() {
      return initialized;
    },

    getCount() {
      return count;
    },
  };
}

// --- Тесты ---
const startBtn = document.createElement("button");
const resetBtn = document.createElement("button");
const display = document.createElement("div");

const ctrl = createController({
  elements: { startBtn, resetBtn, display },
});

console.assert(ctrl.init() === true, "первый init = true");
console.assert(ctrl.init() === false, "повторный init = false");

startBtn.click();
startBtn.click();
startBtn.click();
console.assert(ctrl.getCount() === 3, "после 3 кликов count=3");

resetBtn.click();
console.assert(ctrl.getCount() === 0, "после reset count=0");

console.assert(ctrl.destroy() === true, "первый destroy = true");
console.assert(ctrl.destroy() === false, "повторный destroy = false");

startBtn.click();
startBtn.click();
console.assert(ctrl.getCount() === 0, "после destroy клики не работают");

console.assert(ctrl.init() === true, "после destroy можно снова init");
startBtn.click();
console.assert(ctrl.getCount() === 1, "после повторного init работает");

ctrl.destroy();

console.log("✅ retry-3: контроллер с AbortController пройден");
