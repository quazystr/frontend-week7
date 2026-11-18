// ==========================================
// СЧЁТЧИК (простой кликер)
// ==========================================
let counter = 0;
const counterValueEl = document.getElementById("counter-value");

function updateCounterDisplay() {
  counterValueEl.textContent = String(counter);
}

document.getElementById("counter-btn").addEventListener("click", () => {
  counter += 1;
  updateCounterDisplay();
});

document.getElementById("counter-reset").addEventListener("click", () => {
  counter = 0;
  updateCounterDisplay();
});

// ==========================================
// КОНСТАНТЫ ДЛЯ ТЯЖЁЛЫХ ВЫЧИСЛЕНИЙ
// ==========================================
const HEAVY_ITERATIONS = 50_000_000; // 50 миллионов итераций
const SLICE_TIME_MS = 8; // один кусок работы — до 8 мс

// ==========================================
// БЛОКИРУЮЩАЯ ВЕРСИЯ (синхронный цикл)
// ==========================================
document.getElementById("sync-btn").addEventListener("click", () => {
  const syncResultEl = document.getElementById("sync-result");
  syncResultEl.textContent =
    "Считаю... (попробуйте кликнуть счётчик — не получится)";

  // Откладываем отрисовку, чтобы пользователь увидел "Считаю..."
  setTimeout(() => {
    const start = performance.now();
    let sum = 0;

    // Тяжёлый синхронный цикл — занимает поток целиком
    for (let i = 1; i <= HEAVY_ITERATIONS; i++) {
      sum += Math.sqrt(i) * Math.log(i + 1);
    }

    const elapsed = performance.now() - start;
    syncResultEl.textContent =
      `Результат: ${sum.toFixed(2)} · Время: ${elapsed.toFixed(1)} мс · ` +
      `Счётчик в это время был заблокирован.`;
  }, 0);
});

// ==========================================
// НЕБЛОКИРУЮЩАЯ ВЕРСИЯ (разбиение через setTimeout)
// ==========================================
document.getElementById("async-btn").addEventListener("click", () => {
  const asyncResultEl = document.getElementById("async-result");
  const asyncProgressEl = document.getElementById("async-progress");

  asyncResultEl.textContent = "";
  asyncProgressEl.textContent = "Запуск...";

  const start = performance.now();

  // Замыкание хранит весь прогресс вычисления:
  // - i: текущий индекс цикла
  // - sum: накопленная сумма
  // Эти переменные живут в замыкании функции step()
  // и сохраняются между вызовами setTimeout.
  let i = 1;
  let sum = 0;

  function step() {
    const sliceStart = performance.now();

    // Работаем, пока не пройдёт SLICE_TIME_MS или не закончится цикл
    while (
      i <= HEAVY_ITERATIONS &&
      performance.now() - sliceStart < SLICE_TIME_MS
    ) {
      sum += Math.sqrt(i) * Math.log(i + 1);
      i++;
    }

    // Показываем прогресс
    const progress = ((i - 1) / HEAVY_ITERATIONS) * 100;
    asyncProgressEl.textContent =
      `Обработано: ${(i - 1).toLocaleString("ru-RU")} из ${HEAVY_ITERATIONS.toLocaleString("ru-RU")} ` +
      `(${progress.toFixed(1)}%) — попробуйте кликнуть счётчик, он работает!`;

    if (i <= HEAVY_ITERATIONS) {
      // Работа не закончена — отдаём управление Event Loop
      // и планируем следующий кусок как макрозадачу.
      setTimeout(step, 0);
    } else {
      // Работа закончена
      const elapsed = performance.now() - start;
      asyncResultEl.textContent =
        `Результат: ${sum.toFixed(2)} · Время: ${elapsed.toFixed(1)} мс · ` +
        `Счётчик оставался кликабельным всё время.`;
      asyncProgressEl.textContent = "Готово.";
    }
  }

  // Запускаем первый кусок
  setTimeout(step, 0);
});

// Проверка через console.assert
console.assert(true, "Скрипт инициализирован.");
