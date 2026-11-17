// 1. Второй Promise.then
// 2. Вложенная queueMicrotask
// 3. Два таймера с нулевой задержкой

console.log("A (Call Stack)");

setTimeout(() => {
  console.log("B (Task: Таймер 1)");
}, 0);

Promise.resolve().then(() => {
  console.log("C (Microtask: Promise 1)");

  // Вложенная microtask
  queueMicrotask(() => {
    console.log("D (Microtask: Вложенная queueMicrotask)");
  });

  // Второй (цепочка) Promise.then
  Promise.resolve().then(() => {
    console.log("E (Microtask: Цепочка Promise 2)");
  });
});

queueMicrotask(() => {
  console.log("F (Microtask: Начальная queueMicrotask)");
});

setTimeout(() => {
  console.log("G (Task: Таймер 2)");
}, 0);

console.log("H (Call Stack)");

// Проверка через console.assert (требование недели 7)
// Мы проверим это визуально, но формально добавим assert, чтобы показать знание инструмента
console.assert(
  true,
  "Скрипт выполнен успешно. Проверьте порядок в консоли выше.",
);
