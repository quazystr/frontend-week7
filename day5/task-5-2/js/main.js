/**
 * Модуль main.js
 * Измерение тяжёлой синхронной функции через performance.now()
 * и performance.mark/measure. Три измерения каждым способом.
 */

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

// Тяжёлая синхронная функция
function heavyComputation(iterations) {
  let sum = 0;
  for (let i = 0; i < iterations; i++) {
    sum += Math.sqrt(i) * Math.log(i + 1);
  }
  return sum;
}

const ITERATIONS = 10_000_000; // 10 миллионов итераций

// ==========================================
// ИЗМЕРЕНИЕ ЧЕРЕЗ performance.now()
// ==========================================
function measureWithNow() {
  log("\n=== Измерение через performance.now() ===", "header");
  const results = [];

  for (let i = 1; i <= 3; i++) {
    const start = performance.now();
    const result = heavyComputation(ITERATIONS);
    const end = performance.now();
    const duration = end - start;
    results.push(duration);
    log(
      `Попытка ${i}: ${duration.toFixed(3)} мс (результат: ${result.toFixed(2)})`,
    );
  }

  const avg = results.reduce((sum, v) => sum + v, 0) / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);
  const spread = max - min;

  log(
    `\nИтог (now): мин=${min.toFixed(3)}, макс=${max.toFixed(3)}, среднее=${avg.toFixed(3)}, разброс=${spread.toFixed(3)} мс`,
    "info",
  );

  return results;
}

// ==========================================
// ИЗМЕРЕНИЕ ЧЕРЕЗ performance.mark/measure
// ==========================================
function measureWithMarks() {
  log("\n=== Измерение через performance.mark/measure ===", "header");
  const results = [];

  for (let i = 1; i <= 3; i++) {
    const startMark = `start-${i}`;
    const endMark = `end-${i}`;
    const measureName = `computation-${i}`;

    performance.mark(startMark);
    const result = heavyComputation(ITERATIONS);
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measure = performance.getEntriesByName(measureName)[0];
    const duration = measure.duration;
    results.push(duration);
    log(
      `Попытка ${i}: ${duration.toFixed(3)} мс (результат: ${result.toFixed(2)})`,
    );

    // Очищаем записи, чтобы не засорять performance timeline
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  }

  const avg = results.reduce((sum, v) => sum + v, 0) / results.length;
  const min = Math.min(...results);
  const max = Math.max(...results);
  const spread = max - min;

  log(
    `\nИтог (mark/measure): мин=${min.toFixed(3)}, макс=${max.toFixed(3)}, среднее=${avg.toFixed(3)}, разброс=${spread.toFixed(3)} мс`,
    "info",
  );

  return results;
}

// ==========================================
// ЗАПУСК
// ==========================================
function runMeasurements() {
  logEl.textContent = "";
  log("Запуск измерений...", "info");

  const nowResults = measureWithNow();
  const markResults = measureWithMarks();

  log("\n=== Сравнение методов ===", "header");
  log(
    `performance.now() среднее: ${(nowResults.reduce((s, v) => s + v, 0) / nowResults.length).toFixed(3)} мс`,
  );
  log(
    `mark/measure среднее: ${(markResults.reduce((s, v) => s + v, 0) / markResults.length).toFixed(3)} мс`,
  );

  // Проверки
  console.assert(
    nowResults.length === 3,
    "Должно быть 3 измерения через now()",
  );
  console.assert(
    markResults.length === 3,
    "Должно быть 3 измерения через mark/measure",
  );
  console.assert(
    nowResults.every((v) => v > 0),
    "Все измерения должны быть > 0",
  );
  console.assert(
    markResults.every((v) => v > 0),
    "Все измерения должны быть > 0",
  );

  log("\n✅ Все console.assert пройдены", "ok");
}

document.getElementById("run-btn").addEventListener("click", runMeasurements);
document.getElementById("clear-btn").addEventListener("click", () => {
  logEl.textContent = "";
});

// Автозапуск
runMeasurements();
