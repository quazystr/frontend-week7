/**
 * Retry-2: createTimer с runId с нуля.
 * Задача: таймер с защитой от старых callback.
 */

function createTimer({ durationMs, onTick, onFinish }) {
  let timeoutId = null;
  let deadline = null;
  let remainingMs = durationMs;
  let runId = 0;
  let running = false;
  let finished = false;

  function tick(myRunId) {
    if (myRunId !== runId) return;
    if (!running) return;

    remainingMs = Math.max(0, deadline - Date.now());
    onTick(remainingMs);

    if (remainingMs <= 0) {
      running = false;
      timeoutId = null;
      if (!finished) {
        finished = true;
        if (onFinish) onFinish();
      }
      return;
    }

    timeoutId = setTimeout(() => tick(myRunId), 250);
  }

  return {
    start() {
      if (running) return;
      if (remainingMs <= 0) return;
      runId += 1;
      running = true;
      finished = false;
      deadline = Date.now() + remainingMs;
      tick(runId);
    },
    pause() {
      if (!running) return;
      running = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      remainingMs = Math.max(0, deadline - Date.now());
    },
    reset() {
      running = false;
      finished = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      runId += 1;
      remainingMs = durationMs;
      deadline = null;
      onTick(remainingMs);
    },
    sync() {
      if (!running) return;
      if (timeoutId !== null) clearTimeout(timeoutId);
      tick(runId);
    },
    getSnapshot() {
      return {
        running,
        remainingMs: running ? Math.max(0, deadline - Date.now()) : remainingMs,
        runId,
      };
    },
  };
}

// --- Тесты ---
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTests() {
  let ticks = 0;
  let finishedCount = 0;

  const timer = createTimer({
    durationMs: 500,
    onTick: () => {
      ticks += 1;
    },
    onFinish: () => {
      finishedCount += 1;
    },
  });

  // Тест 1: базовая работа
  timer.start();
  console.assert(
    timer.getSnapshot().running === true,
    "после start running=true",
  );
  await delay(700);
  console.assert(
    finishedCount === 1,
    `onFinish вызван 1 раз, получено ${finishedCount}`,
  );

  // Тест 2: защита от старых callback
  timer.reset();
  timer.start();
  const oldRunId = timer.getSnapshot().runId;
  timer.reset();
  const newRunId = timer.getSnapshot().runId;
  console.assert(newRunId === oldRunId + 1, "reset инкрементирует runId");

  await delay(600);
  console.assert(
    finishedCount === 1,
    "старый callback не вызвал onFinish повторно",
  );

  // Тест 3: pause не теряет время
  timer.reset();
  timer.start();
  await delay(200);
  timer.pause();
  const paused = timer.getSnapshot().remainingMs;
  await delay(500);
  console.assert(
    timer.getSnapshot().remainingMs === paused,
    "в паузе время не меняется",
  );

  console.log("✅ retry-2: createTimer с runId пройден");
}

runTests();
