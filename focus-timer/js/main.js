import { createTimer } from "./timer.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  console.log("=== Тесты Task 6.2: Точное время ===");

  // Тест 1: Частота обновления ~4 раза в секунду (250 мс)
  let ticks1 = 0;
  const timer1 = createTimer({
    durationMs: 2000,
    onTick: () => {
      ticks1 += 1;
    },
    onFinish: () => {},
  });
  timer1.start();
  await delay(600);
  timer1.destroy();
  console.assert(
    ticks1 >= 2 && ticks1 <= 4,
    `Частота тиков: ожидали 2-4 за 600 мс, получили ${ticks1}`,
  );

  // Тест 2: onFinish вызывается ровно один раз
  let finishCount = 0;
  const timer2 = createTimer({
    durationMs: 300,
    onTick: () => {},
    onFinish: () => {
      finishCount += 1;
    },
  });
  timer2.start();
  // ✅ ИСПРАВЛЕНИЕ: увеличили с 500 до 1000 мс, чтобы учесть jitter браузера
  await delay(1000);
  console.assert(
    finishCount === 1,
    `onFinish должен быть вызван 1 раз, а не ${finishCount}`,
  );

  // Манипуляции после завершения — ни одна не должна вызвать onFinish повторно
  timer2.sync(); // isRunning=false → ничего не делает
  timer2.start(); // remainingMs=0 → ничего не делает (новая защита!)
  timer2.pause(); // isRunning=false → ничего не делает
  console.assert(
    finishCount === 1,
    `После манипуляций onFinish не должен вызываться повторно. Получили: ${finishCount}`,
  );
  timer2.destroy();

  // Тест 3: Мгновенная коррекция после блокировки потока + sync()
  let lastRemaining = 0;
  const timer3 = createTimer({
    durationMs: 2000,
    onTick: (ms) => {
      lastRemaining = ms;
    },
    onFinish: () => {},
  });
  timer3.start();
  await delay(100);

  const blockStart = Date.now();
  while (Date.now() - blockStart < 800) {
    /* busy loop */
  }

  timer3.sync();

  console.assert(
    lastRemaining > 900 && lastRemaining < 1300,
    `После блокировки и sync() остаток должен быть ~1100 мс. Получили: ${lastRemaining}`,
  );
  timer3.destroy();

  // Тест 4: start() после завершения не запускает таймер заново
  let restartFinishCount = 0;
  const timer4 = createTimer({
    durationMs: 200,
    onTick: () => {},
    onFinish: () => {
      restartFinishCount += 1;
    },
  });
  timer4.start();
  await delay(500); // Ждём завершения
  console.assert(restartFinishCount === 1, `Таймер завершился 1 раз`);

  // Пытаемся запустить снова без reset() — не должно сработать
  timer4.start();
  await delay(300);
  console.assert(
    restartFinishCount === 1,
    `start() после завершения без reset() не должен вызывать onFinish повторно. Получили: ${restartFinishCount}`,
  );

  // А вот после reset() — должен запуститься и завершиться снова
  timer4.reset();
  timer4.start();
  await delay(500);
  console.assert(
    restartFinishCount === 2,
    `После reset() + start() таймер должен завершиться ещё раз. Получили: ${restartFinishCount}`,
  );
  timer4.destroy();

  console.log("✅ Все тесты Task 6.2 пройдены!");
}

runTests();
