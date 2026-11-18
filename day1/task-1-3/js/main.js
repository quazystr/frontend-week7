const BUSY_TIME_MS = 250; // сколько занимаем поток
const REQUESTED_DELAY_MS = 0; // заказанная задержка setTimeout
const MEASUREMENT_COUNT = 5; // количество измерений

// Синхронная функция, которая занимает поток на заданное время
function busyLoop(durationMs) {
  const start = performance.now();
  // Крутим цикл, пока не пройдёт нужное время
  while (performance.now() - start < durationMs) {
    // намеренно пусто — это "тяжёлая" синхронная работа
  }
}

// Одно измерение: возвращает Promise с результатом
function runMeasurement(index) {
  return new Promise((resolve) => {
    const startTime = performance.now();

    // 1. Планируем setTimeout(..., 0)
    setTimeout(() => {
      const endTime = performance.now();
      const actualDelay = endTime - startTime;
      resolve({
        index,
        requested: REQUESTED_DELAY_MS,
        busyTime: BUSY_TIME_MS,
        actual: actualDelay,
      });
    }, REQUESTED_DELAY_MS);

    // 2. Сразу после планирования — занимаем поток синхронным циклом
    busyLoop(BUSY_TIME_MS);
  });
}

// Отрисовка строки в таблице
function renderRow(tbody, measurement) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${measurement.index}</td>
    <td class="result">${measurement.requested}</td>
    <td class="result">~${measurement.busyTime}</td>
    <td class="result">${measurement.actual.toFixed(2)}</td>
  `;
  tbody.appendChild(tr);
}

// Отрисовка итогового вывода
function renderSummary(summaryEl, measurements) {
  const actualValues = measurements.map((m) => m.actual);
  const min = Math.min(...actualValues).toFixed(2);
  const max = Math.max(...actualValues).toFixed(2);
  const avg = (
    actualValues.reduce((sum, v) => sum + v, 0) / actualValues.length
  ).toFixed(2);

  summaryEl.innerHTML = `
    <strong>Итог по ${measurements.length} измерениям:</strong><br>
    Мин: ${min} мс · Макс: ${max} мс · Среднее: ${avg} мс<br>
    Заказано было всего ${REQUESTED_DELAY_MS} мс, но фактически ждали
    больше ${BUSY_TIME_MS} мс — пока поток не освободился от синхронного цикла.
  `;
}

// Главная функция: запускает 5 измерений последовательно
async function runAll() {
  const tbody = document.getElementById("results");
  const summaryEl = document.getElementById("summary");
  const measurements = [];

  for (let i = 1; i <= MEASUREMENT_COUNT; i++) {
    const result = await runMeasurement(i);
    measurements.push(result);
    renderRow(tbody, result);
  }

  renderSummary(summaryEl, measurements);

  console.assert(
    measurements.every((m) => m.actual >= BUSY_TIME_MS),
    "Фактическая задержка должна быть не меньше времени busy loop",
  );
}

runAll();
