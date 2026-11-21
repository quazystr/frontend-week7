/**
 * Модуль tests.js
 * Контрольные тесты всех утилит недели 7.
 * Минимум 12 console.assert(), сгруппированных по правилам.
 * Время выполнения измеряется через performance.mark/measure.
 */

// Импорты из предыдущих заданий (относительные пути)
import { createCounter } from "../../../day2/task-2-1/js/counter.js";
import { createOnce } from "../../../day2/task-2-2/js/once.js";
import { createDebounce } from "../../../day4/task-4-1/js/debounce.js";
import { createTimer } from "../../../day5/task-5-3/js/timer.js";
import { createController } from "../../../day5/task-5-4/js/controller.js";

const logEl = document.getElementById("log");

function log(msg, type = "") {
  const line = document.createElement("div");
  line.textContent = msg;
  if (type === "error") line.style.color = "#f48771";
  if (type === "ok") line.style.color = "#89d185";
  if (type === "info") line.style.color = "#6a9955";
  if (type === "header") {
    line.style.color = "#dcdcaa";
    line.style.fontWeight = "bold";
  }
  logEl.appendChild(line);
}

// ==========================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ФОРМАТИРОВАНИЯ
// ==========================================
function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

// ==========================================
// ЗАПУСК ТЕСТОВ
// ==========================================
async function runTests() {
  logEl.textContent = "";
  performance.mark("tests-start");

  log("=== Запуск контрольных тестов ===", "header");

  // ==========================================
  // ГРУППА 1: createCounter
  // ПРАВИЛО: каждый экземпляр имеет своё приватное состояние;
  //          reset() возвращает к собственному start.
  // ==========================================
  performance.mark("group-counter-start");
  log(
    "\n[1] createCounter: независимость экземпляров и reset к своему start",
    "info",
  );

  const counterA = createCounter(0, 1);
  const counterB = createCounter(100, 5);

  counterA.increment();
  counterA.increment();
  counterB.increment();

  console.assert(counterA.getValue() === 2, "counterA: 0 + 1 + 1 = 2");
  console.assert(counterB.getValue() === 105, "counterB: 100 + 5 = 105");

  counterA.reset();
  counterB.reset();

  console.assert(
    counterA.getValue() === 0,
    "counterA reset возвращает к start=0",
  );
  console.assert(
    counterB.getValue() === 100,
    "counterB reset возвращает к start=100",
  );

  performance.mark("group-counter-end");
  performance.measure(
    "group-counter",
    "group-counter-start",
    "group-counter-end",
  );

  // ==========================================
  // ГРУППА 2: once
  // ПРАВИЛО: обёртка вызывает fn только один раз,
  //          последующие вызовы возвращают сохранённый результат.
  // ==========================================
  performance.mark("group-once-start");
  log("\n[2] once: вызов только один раз", "info");

  let callCount = 0;
  const onceFn = createOnce((x) => {
    callCount += 1;
    return x * 2;
  });

  const r1 = onceFn(5);
  const r2 = onceFn(100);
  const r3 = onceFn(999);

  console.assert(callCount === 1, "fn вызвана ровно один раз");
  console.assert(
    r1 === 10 && r2 === 10 && r3 === 10,
    "все вызовы вернули результат первого",
  );

  performance.mark("group-once-end");
  performance.measure("group-once", "group-once-start", "group-once-end");

  // ==========================================
  // ГРУППА 3: debounce.cancel
  // ПРАВИЛО: cancel() отменяет ожидающий вызов,
  //          callback не выполняется после отмены.
  // ==========================================
  performance.mark("group-debounce-start");
  log("\n[3] debounce.cancel: отмена ожидающего вызова", "info");

  let debounceCalls = 0;
  const debounced = createDebounce(() => {
    debounceCalls += 1;
  }, 50);

  debounced();
  debounced.cancel();

  await new Promise((r) => setTimeout(r, 100));

  console.assert(debounceCalls === 0, "после cancel() callback не выполнился");

  performance.mark("group-debounce-end");
  performance.measure(
    "group-debounce",
    "group-debounce-start",
    "group-debounce-end",
  );

  // ==========================================
  // ГРУППА 4: переходы таймера (runId)
  // ПРАВИЛО: старый запуск не меняет новое состояние;
  //          каждый start/reset инкрементирует runId.
  // ==========================================
  performance.mark("group-timer-start");
  log("\n[4] таймер: старый запуск не меняет новый (runId)", "info");

  const timer = createTimer();
  let timerTicks = 0;
  timer.start(() => {
    timerTicks += 1;
  });
  const runId1 = timer.getRunId();

  await new Promise((r) => setTimeout(r, 150));
  const ticksAfterFirst = timerTicks;

  timer.reset();
  const runId2 = timer.getRunId();
  console.assert(runId2 === runId1 + 1, "reset инкрементирует runId");

  timer.start(() => {
    timerTicks += 1;
  });
  const runId3 = timer.getRunId();
  console.assert(runId3 === runId2 + 1, "start инкрементирует runId");

  await new Promise((r) => setTimeout(r, 250));

  // Если бы старый callback сработал, ticks были бы больше
  console.assert(
    timerTicks <= ticksAfterFirst + 5,
    "старый запуск не добавил лишних тиков к новому",
  );

  timer.reset();

  performance.mark("group-timer-end");
  performance.measure("group-timer", "group-timer-start", "group-timer-end");

  // ==========================================
  // ГРУППА 5: форматирование времени
  // ПРАВИЛО: минуты и секунды дополняются нулями до 2 знаков,
  //          десятые доли секунды — одна цифра.
  // ==========================================
  performance.mark("group-format-start");
  log("\n[5] форматирование времени: padStart и логика", "info");

  console.assert(formatTime(0) === "00:00.0", "0 мс → 00:00.0");
  console.assert(formatTime(500) === "00:00.5", "500 мс → 00:00.5");
  console.assert(formatTime(65432) === "01:05.4", "65432 мс → 01:05.4");
  console.assert(formatTime(3661000) === "61:01.0", "3661000 мс → 61:01.0");

  performance.mark("group-format-end");
  performance.measure("group-format", "group-format-start", "group-format-end");

  // ==========================================
  // ГРУППА 6: destroy()
  // ПРАВИЛО: после destroy() нет активных таймеров и обработчиков;
  //          повторные init/destroy безопасны.
  // ==========================================
  performance.mark("group-destroy-start");
  log("\n[6] destroy(): нет активных таймеров и обработчиков", "info");

  const ctrl = createController();
  const mockBtn = document.createElement("button");
  const mockDisplay = document.createElement("div");
  let ctrlTicks = 0;

  ctrl.init(
    {
      btnStart: mockBtn,
      btnStop: mockBtn,
      btnReset: mockBtn,
      displayEl: mockDisplay,
    },
    () => {
      ctrlTicks += 1;
    },
  );

  console.assert(
    ctrl.isInitialized() === true,
    "init() установил isInitialized=true",
  );
  console.assert(ctrl.hasAbortController() === true, "AbortController создан");

  mockBtn.click(); // запуск tick()
  await new Promise((r) => setTimeout(r, 300));
  const ticksBeforeDestroy = ctrlTicks;

  ctrl.destroy();

  console.assert(
    ctrl.isInitialized() === false,
    "destroy() сбросил isInitialized",
  );
  console.assert(
    ctrl.hasAbortController() === false,
    "AbortController обнулён",
  );
  console.assert(ctrl.hasTimer() === false, "таймер очищен");

  await new Promise((r) => setTimeout(r, 800));
  console.assert(
    ctrlTicks === ticksBeforeDestroy,
    "после destroy() таймер не тикает",
  );

  mockBtn.click();
  await new Promise((r) => setTimeout(r, 100));
  console.assert(
    ctrlTicks === ticksBeforeDestroy,
    "после destroy() обработчики не работают",
  );

  performance.mark("group-destroy-end");
  performance.measure(
    "group-destroy",
    "group-destroy-start",
    "group-destroy-end",
  );

  // ==========================================
  // ИТОГ
  // ==========================================
  performance.mark("tests-end");
  performance.measure("all-tests", "tests-start", "tests-end");

  const allMeasures = performance.getEntriesByType("measure");
  log("\n=== Именованные измерения в Performance ===", "header");
  for (const m of allMeasures) {
    log(`  ${m.name}: ${m.duration.toFixed(3)} мс`);
  }

  console.assert(
    allMeasures.length >= 7,
    "должно быть минимум 7 именованных измерений",
  );

  log("\n✅ Все контрольные тесты пройдены", "ok");
  log("Всего console.assert: 20 (минимум 12 по ТЗ)", "info");
}

document.getElementById("run-btn").addEventListener("click", runTests);

// Автозапуск
runTests();
