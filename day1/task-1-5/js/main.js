const logEl = document.getElementById("log");

function log(message, type = "") {
  const line = document.createElement("div");
  if (type) line.className = type;
  line.textContent = message;
  logEl.appendChild(line);
}

document.getElementById("clear-btn").addEventListener("click", () => {
  logEl.textContent = "";
});

document.getElementById("run-btn").addEventListener("click", () => {
  logEl.textContent = "";
  runScenario();
});

async function runScenario() {
  log("--- Запуск сценария ---", "info");

  // ==========================================
  // 1. ОШИБКА В МИКРОЗАДАЧЕ (Promise.then)
  // ==========================================
  log("1. Запуск Promise с ошибкой внутри .then");

  // Правильный способ: ловим через .catch()
  Promise.resolve()
    .then(() => {
      log("2. Внутри Promise.then (микрозадача) — сейчас будет ошибка");
      throw new Error("Ошибка в микрозадаче");
    })
    .catch((error) => {
      // Сюда попадёт ошибка из .then выше
      log(`3. Поймали в .catch(): ${error.message}`, "ok");
    });

  // ==========================================
  // 2. ОШИБКА В МАКРОЗАДАЧЕ (setTimeout)
  // ==========================================
  log("4. Запуск setTimeout с ошибкой внутри");

  // Внешний try/catch НЕ ловит ошибку из callback setTimeout!
  // Потому что к моменту выполнения callback стек уже пуст.
  try {
    setTimeout(() => {
      log("6. Внутри setTimeout callback (макрозадача) — сейчас будет ошибка");
      throw new Error("Ошибка в макрозадаче");
    }, 0);
    log("5. Внешний try/catch: setTimeout запланирован, идём дальше");
  } catch (error) {
    // СЮДА МЫ НИКОГДА НЕ ПОПАДЁМ!
    log(`ЭТО НЕ ДОЛЖНО ВЫВЕСТИСЬ: ${error.message}`, "error");
  }

  // ==========================================
  // 3. ПРАВИЛЬНЫЙ СПОСОБ ЛОВЛИ ОШИБКИ В setTimeout
  // ==========================================
  setTimeout(() => {
    // try/catch ВНУТРИ callback — единственный способ поймать
    try {
      log("7. Второй setTimeout — внутри callback будет ошибка");
      throw new Error("Вторая ошибка в макрозадаче");
    } catch (error) {
      log(`8. Поймали внутри callback: ${error.message}`, "ok");
    }
  }, 0);

  // ==========================================
  // 4. СИНХРОННЫЙ КОД ПОСЛЕ ВСЕХ ПЛАНИРОВАНИЙ
  // ==========================================
  log("9. Синхронный код после всех планирований — выполняется сразу");

  // ==========================================
  // 5. ПРОВЕРКА: глобальный обработчик unhandledrejection
  // ==========================================
  // Если бы мы не поставили .catch() в пункте 1,
  // сработал бы этот обработчик (но у нас он не сработает,
  // потому что мы правильно обработали ошибку).
  window.addEventListener("unhandledrejection", (event) => {
    log(`! Unhandled rejection: ${event.reason.message}`, "error");
  });

  // Аналогично для ошибок, которые никто не поймал:
  window.addEventListener("error", (event) => {
    log(`! Uncaught error: ${event.message}`, "error");
  });

  log("--- Синхронная часть завершена ---", "info");
}

// Проверка через console.assert
console.assert(true, "Скрипт инициализирован.");
