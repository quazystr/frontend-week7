/**
 * Модуль main.js
 * Каждый фрагмент — отдельная функция, логирует свой результат.
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

function header(num, title) {
  log(`\n=== Фрагмент ${num}: ${title} ===`, "header");
}

// ==========================================
// ФРАГМЕНТ 1: Базовая классика
// ==========================================
function fragment1() {
  header(1, "Синхронный + setTimeout + Promise");
  const order = [];
  console.log("A");
  order.push("A");
  setTimeout(() => {
    console.log("B");
    order.push("B");
  }, 0);
  Promise.resolve().then(() => {
    console.log("C");
    order.push("C");
  });
  console.log("D");
  order.push("D");
  console.log("Факт:", order.join(", "));
  console.assert(order.join(",") === "A,D,C,B", "Фрагмент 1: A, D, C, B");
}

// ==========================================
// ФРАГМЕНТ 2: Вложенные Promise.then
// ==========================================
function fragment2() {
  header(2, "Вложенные Promise.then");
  const order = [];
  Promise.resolve().then(() => {
    order.push("1");
    Promise.resolve().then(() => order.push("2"));
  });
  Promise.resolve().then(() => order.push("3"));
  console.log("Факт:", order.join(", "));
  setTimeout(() => {
    console.log("После микрозадач:", order.join(", "));
    console.assert(order.join(",") === "1,3,2", "Фрагмент 2: 1, 3, 2");
  }, 0);
}

// ==========================================
// ФРАГМЕНТ 3: await внутри async
// ==========================================
async function fragment3() {
  header(3, "await внутри async");
  const order = [];
  order.push("A");
  async function f() {
    order.push("B");
    await Promise.resolve();
    order.push("C");
  }
  f();
  order.push("D");
  await new Promise((r) => setTimeout(r, 0));
  console.log("Факт:", order.join(", "));
  console.assert(order.join(",") === "A,B,D,C", "Фрагмент 3: A, B, D, C");
}

// ==========================================
// ФРАГМЕНТ 4: await с синхронным кодом после
// ==========================================
async function fragment4() {
  header(4, "await с синхронным кодом после");
  const order = [];
  async function f() {
    order.push("1");
    await Promise.resolve();
    order.push("2");
    await Promise.resolve();
    order.push("3");
  }
  f();
  order.push("4");
  await new Promise((r) => setTimeout(r, 0));
  console.log("Факт:", order.join(", "));
  console.assert(order.join(",") === "1,4,2,3", "Фрагмент 4: 1, 4, 2, 3");
}

// ==========================================
// ФРАГМЕНТ 5: Ошибка в Promise без catch
// ==========================================
function fragment5() {
  header(5, "Ошибка в Promise с catch");
  const order = [];
  order.push("A");
  Promise.resolve()
    .then(() => {
      order.push("B");
      throw new Error("oops");
    })
    .catch((e) => {
      order.push("C:" + e.message);
    })
    .then(() => order.push("D"));
  order.push("E");
  setTimeout(() => {
    console.log("Факт:", order.join(", "));
    console.assert(
      order.join(",") === "A,E,B,C:oops,D",
      "Фрагмент 5: A, E, B, C:oops, D",
    );
  }, 0);
}

// ==========================================
// ФРАГМЕНТ 6: try/catch снаружи setTimeout (не ловит)
// ==========================================
function fragment6() {
  header(6, "try/catch снаружи setTimeout");
  const order = [];
  order.push("A");
  let caught = false;
  try {
    setTimeout(() => {
      order.push("B");
      throw new Error("inside");
    }, 0);
    order.push("C");
  } catch (e) {
    caught = true;
    order.push("D:" + e.message);
  }
  setTimeout(() => {
    console.log("Факт:", order.join(", "), "caught:", caught);
    console.assert(
      order.join(",") === "A,C,B",
      "Фрагмент 6: try/catch не ловит ошибку из setTimeout",
    );
    console.assert(caught === false, "caught должен быть false");
  }, 50);
}

// ==========================================
// ФРАГМЕНТ 7: try/catch внутри setTimeout (ловит)
// ==========================================
function fragment7() {
  header(7, "try/catch внутри setTimeout");
  const order = [];
  order.push("A");
  setTimeout(() => {
    try {
      order.push("B");
      throw new Error("inside");
    } catch (e) {
      order.push("C:" + e.message);
    }
    order.push("D");
  }, 0);
  order.push("E");
  setTimeout(() => {
    console.log("Факт:", order.join(", "));
    console.assert(
      order.join(",") === "A,E,B,C:inside,D",
      "Фрагмент 7: try/catch внутри ловит",
    );
  }, 50);
}

// ==========================================
// ФРАГМЕНТ 8: queueMicrotask + setTimeout + Promise
// ==========================================
function fragment8() {
  header(8, "queueMicrotask + setTimeout + Promise");
  const order = [];
  order.push("A");
  queueMicrotask(() => order.push("B"));
  setTimeout(() => order.push("C"), 0);
  Promise.resolve().then(() => order.push("D"));
  queueMicrotask(() => order.push("E"));
  order.push("F");
  setTimeout(() => {
    console.log("Факт:", order.join(", "));
    console.assert(
      order.join(",") === "A,F,B,D,E,C",
      "Фрагмент 8: A, F, B, D, E, C",
    );
  }, 0);
}

// ==========================================
// ФРАГМЕНТ 9: Nested await (await внутри await)
// ==========================================
async function fragment9() {
  header(9, "Nested await");
  const order = [];
  async function inner() {
    order.push("1");
    await Promise.resolve();
    order.push("2");
    return "inner-result";
  }
  async function outer() {
    order.push("3");
    const result = await inner();
    order.push("4:" + result);
  }
  outer();
  order.push("5");
  await new Promise((r) => setTimeout(r, 0));
  console.log("Факт:", order.join(", "));
  console.assert(
    order.join(",") === "3,1,5,2,4:inner-result",
    "Фрагмент 9: 3, 1, 5, 2, 4:inner-result",
  );
}

// ==========================================
// ФРАГМЕНТ 10: Микс — await + setTimeout + ошибка
// ==========================================
async function fragment10() {
  header(10, "Микс: await + setTimeout + ошибка");
  const order = [];
  order.push("A");
  setTimeout(() => {
    order.push("B");
    Promise.resolve().then(() => order.push("C"));
  }, 0);
  try {
    await Promise.reject(new Error("fail"));
  } catch (e) {
    order.push("D:" + e.message);
  }
  Promise.resolve().then(() => order.push("E"));
  order.push("F");
  await new Promise((r) => setTimeout(r, 0));
  console.log("Факт:", order.join(", "));
  console.assert(
    order.join(",") === "A,F,D:fail,B,C,E",
    "Фрагмент 10: A, F, D:fail, B, C, E",
  );
}

// ==========================================
// ЗАПУСК ВСЕХ ФРАГМЕНТОВ
// ==========================================
async function runAll() {
  logEl.textContent = "";
  log("Запуск всех 10 фрагментов...", "info");

  fragment1();
  fragment2();
  await fragment3();
  await fragment4();
  fragment5();
  fragment6();
  fragment7();
  fragment8();
  await fragment9();
  await fragment10();

  // Ждём, чтобы все setTimeout успели выполниться
  await new Promise((r) => setTimeout(r, 100));

  log("\n=== Все фрагменты выполнены ===", "ok");
  log("Проверьте консоль: все console.assert должны пройти.", "info");
}

document.getElementById("run-btn").addEventListener("click", runAll);
document.getElementById("clear-btn").addEventListener("click", () => {
  logEl.textContent = "";
});

// Автозапуск при загрузке
runAll();
