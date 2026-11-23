/**
 * Retry-1: debounce с нуля.
 * Задача: поле ввода, лог появляется только после 400 мс тишины.
 * Пустая строка отменяет ожидающий вызов.
 */

function createDebounce(fn, delay) {
  let timeoutId = null;
  let savedArgs = null;
  let savedThis = null;

  const debounced = function (...args) {
    savedArgs = args;
    savedThis = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn.apply(savedThis, savedArgs);
      savedArgs = null;
      savedThis = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    savedArgs = null;
    savedThis = null;
  };

  return debounced;
}

// --- Демо ---
const input = document.getElementById("input");
const log = document.getElementById("log");

const debouncedLog = createDebounce((value) => {
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] Поиск: "${value}"`;
  log.appendChild(line);
}, 400);

input.addEventListener("input", (e) => {
  const value = e.target.value;
  if (value === "") {
    debouncedLog.cancel();
    return;
  }
  debouncedLog(value);
});

// --- Тесты ---
let calls = 0;
const testFn = createDebounce(() => {
  calls += 1;
}, 50);
testFn();
testFn();
testFn();
setTimeout(() => {
  console.assert(
    calls === 1,
    `debounce: 3 вызова = 1 срабатывание, получено ${calls}`,
  );

  testFn();
  testFn.cancel();
  setTimeout(() => {
    console.assert(calls === 1, `после cancel() срабатываний не прибавилось`);
    console.log("✅ retry-1: debounce пройден");
  }, 100);
}, 100);
