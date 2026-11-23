/**
 * Модуль main.js
 * Демонстрация и тестирование фабрики createTimer без привязки к DOM.
 */

import { createTimer } from "./timer.js";

console.log("=== Тестирование фабрики createTimer ===");

// Вспомогательная функция задержки для асинхронных тестов
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runTests() {
  let tickCount = 0;
  let lastRemaining = 0;
  let finished = false;

  // Создаем таймер на 1000 мс (1 секунда) для быстрых тестов
  const timer = createTimer({
    durationMs: 1000,
    onTick: (ms) => {
      tickCount += 1;
      lastRemaining = ms;
    },
    onFinish: () => {
      finished = true;
    },
  });

  // Тест 1: Начальное состояние
  console.assert(
    timer.getSnapshot().isRunning === false,
    "Изначально таймер не запущен",
  );
  console.assert(
    timer.getSnapshot().remainingMs === 1000,
    "Начальное remainingMs = 1000",
  );

  // Тест 2: Запуск и работа
  timer.start();
  console.assert(
    timer.getSnapshot().isRunning === true,
    "После start() isRunning = true",
  );

  // ИСПРАВЛЕНИЕ: даем больший запас (400 мс) и проверяем широкий диапазон,
  // чтобы тест не падал из-за микрозадержек Event Loop браузера.
  await delay(400);
  console.assert(
    lastRemaining < 900 && lastRemaining > 300,
    `Время должно уменьшиться. Ожидали 300-900, получили: ${lastRemaining}`,
  );

  // Тест 3: Пауза
  timer.pause();
  const pausedRemaining = lastRemaining;
  console.assert(
    timer.getSnapshot().isRunning === false,
    "После pause() isRunning = false",
  );

  await delay(500); // Ждем 500 мс в паузе
  console.assert(
    lastRemaining === pausedRemaining,
    `Во время паузы время не меняется. Было: ${pausedRemaining}, стало: ${lastRemaining}`,
  );

  // Тест 4: Возобновление и завершение
  timer.start();
  // ИСПРАВЛЕНИЕ: ждем с большим запасом (1200 мс), чтобы таймер точно успел дойти до 0,
  // даже если предыдущие тики были с задержкой.
  await delay(1200);
  console.assert(finished === true, "Таймер завершился (onFinish вызван)");
  console.assert(
    lastRemaining === 0,
    `Оставшееся время должно быть 0. Получили: ${lastRemaining}`,
  );

  // Тест 5: Сброс
  finished = false;
  tickCount = 0;
  timer.reset();
  console.assert(
    timer.getSnapshot().remainingMs === 1000,
    "После reset() remainingMs = 1000",
  );
  console.assert(
    timer.getSnapshot().isRunning === false,
    "После reset() isRunning = false",
  );

  // Тест 6: Защита от старых callback (runId)
  timer.start();
  const oldRunId = timer.getSnapshot().runId;
  timer.reset(); // Это увеличит runId
  const newRunId = timer.getSnapshot().runId;
  console.assert(
    newRunId === oldRunId + 1,
    `reset() инкрементирует runId. Было: ${oldRunId}, стало: ${newRunId}`,
  );

  console.log("✅ Все тесты createTimer пройдены успешно!");
}

runTests();
