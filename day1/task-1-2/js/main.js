async function first() {
  console.log("2 first: ДО await");
  await Promise.resolve();
  console.log("6 first: ПОСЛЕ await");
}

async function second() {
  console.log("3 second: ДО await");
  Promise.resolve();
  console.log("4 second: СРАЗУ после (await больше нет)");
}

console.log("1 Старт скрипта");

first();
second();

Promise.resolve().then(() => {
  console.log("7 Promise.then");
});

setTimeout(() => {
  console.log("8 setTimeout");
}, 0);

console.log("5 Конец синхронного кода");

console.assert(true, "Вариант без await выполнен.");
