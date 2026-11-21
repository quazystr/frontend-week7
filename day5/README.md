# Day 5, Task 5.1: Таблица порядка выполнения

## Фрагмент 1. Синхронный + setTimeout + Promise

Код:

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
```

Прогноз: A, D, C, B
Факт: A, D, C, B
Причина: Синхронный код (A, D) выполняется сразу. Затем микрозадачи (C из Promise.then). Затем макрозадачи (B из setTimeout).

---

## Фрагмент 2. Вложенные Promise.then

Код:

```javascript
Promise.resolve().then(() => {
  console.log("1");
  Promise.resolve().then(() => console.log("2"));
});
Promise.resolve().then(() => console.log("3"));
```

Прогноз: 1, 3, 2
Факт: 1, 3, 2
Причина: Первый `.then` выполняется, добавляет '1' и планирует новую микрозадачу '2'. Второй `.then` (уже в очереди) выполняется → '3'. Затем новая микрозадача → '2'.

---

## Фрагмент 3. await внутри async

Код:

```javascript
async function f() {
  console.log("B");
  await Promise.resolve();
  console.log("C");
}
console.log("A");
f();
console.log("D");
```

Прогноз: A, B, D, C
Факт: A, B, D, C
Причина: Синхронная часть `f()` (B) выполняется сразу. `await` разрезает функцию: продолжение (C) уходит в микрозадачи. Синхронный код после вызова `f()` (D) выполняется. Затем микрозадача → C.

---

## Фрагмент 4. await с синхронным кодом после

Код:

```javascript
async function f() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
  await Promise.resolve();
  console.log("3");
}
f();
console.log("4");
```

Прогноз: 1, 4, 2, 3
Факт: 1, 4, 2, 3
Причина: Синхронная часть `f()` (1) → `await` → продолжение в микрозадачи. Синхронный код (4). Затем первая микрозадача (2) → второй `await` → продолжение в микрозадачи. Затем вторая микрозадача (3).

---

## Фрагмент 5. Ошибка в Promise с catch

Код:

```javascript
console.log("A");
Promise.resolve()
  .then(() => {
    console.log("B");
    throw new Error("oops");
  })
  .catch((e) => console.log("C:" + e.message))
  .then(() => console.log("D"));
console.log("E");
```

Прогноз: A, E, B, C:oops, D
Факт: A, E, B, C:oops, D
Причина: Синхронный код (A, E). Микрозадача: выполняется `.then` (B), бросает ошибку → переходит в `.catch` (C:oops) → следующий `.then` (D).

---

## Фрагмент 6. try/catch снаружи setTimeout (не ловит)

Код:

```javascript
let caught = false;
try {
  setTimeout(() => {
    throw new Error("inside");
  }, 0);
} catch (e) {
  caught = true;
}
```

Прогноз: Ошибка не поймана, caught = false
Факт: Ошибка не поймана, caught = false
Причина: `try/catch` работает только в пределах одного витка стека. `setTimeout` возвращает управление сразу, `try` завершается. Когда callback выполнится (в другом витке), `try/catch` уже не в стеке.

---

## Фрагмент 7. try/catch внутри setTimeout (ловит)

Код:

```javascript
setTimeout(() => {
  try {
    throw new Error("inside");
  } catch (e) {
    console.log("caught");
  }
}, 0);
```

Прогноз: caught
Факт: caught
Причина: `try/catch` находится внутри callback, поэтому ловит ошибку в том же витке стека.

---

## Фрагмент 8. queueMicrotask + setTimeout + Promise

Код:

```javascript
console.log("A");
queueMicrotask(() => console.log("B"));
setTimeout(() => console.log("C"), 0);
Promise.resolve().then(() => console.log("D"));
queueMicrotask(() => console.log("E"));
console.log("F");
```

Прогноз: A, F, B, D, E, C
Факт: A, F, B, D, E, C
Причина: Синхронный код (A, F). Микрозадачи в порядке добавления: B (queueMicrotask), D (Promise.then), E (queueMicrotask). Затем макрозадача: C (setTimeout).

---

## Фрагмент 9. Nested await (await внутри await)

Код:

```javascript
async function inner() {
  console.log("1");
  await Promise.resolve();
  console.log("2");
  return "inner-result";
}
async function outer() {
  console.log("3");
  const result = await inner();
  console.log("4:" + result);
}
outer();
console.log("5");
```

Прогноз: 3, 1, 5, 2, 4:inner-result
Факт: 3, 1, 5, 2, 4:inner-result
Причина: Синхронная часть `outer()` (3) → `await inner()` → синхронная часть `inner()` (1) → `await` → продолжение `inner` в микрозадачи. Синхронный код (5). Микрозадача: `inner` продолжает (2), возвращает результат → `outer` продолжает (4).

---

## Фрагмент 10. Микс — await + setTimeout + ошибка

Код:

```javascript
console.log("A");
setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);
try {
  await Promise.reject(new Error("fail"));
} catch (e) {
  console.log("D:" + e.message);
}
Promise.resolve().then(() => console.log("E"));
console.log("F");
```

Прогноз: A, F, D:fail, B, C, E
Факт: A, F, D:fail, B, C, E
Причина: Синхронный код (A, F). `await Promise.reject` бросает ошибку → `catch` (D:fail) — это микрозадача. Затем макрозадача setTimeout: B → планирует микрозадачу C. Затем микрозадача E (из Promise.resolve().then после catch).

---

## Ключевые правила

1. Синхронный код выполняется сразу, в порядке написания.
2. Микрозадачи (Promise.then, queueMicrotask, продолжения await) выполняются после синхронного кода, в порядке добавления в очередь. Все микрозадачи выполняются до перехода к макрозадачам.
3. Макрозадачи (setTimeout, setInterval, события) выполняются после полной очистки очереди микрозадач.
4. await разрезает функцию: всё до `await` — синхронно, всё после — микрозадача.
5. try/catch ловит только в своём витке стека. Асинхронные продолжения (callback setTimeout, .then без .catch) требуют своих механизмов обработки.
6. Вложенные микрозадачи добавляются в конец очереди и выполняются в том же цикле очистки.

## Проверка

- 10 фрагментов с прогнозом, фактом и объяснением.
- Минимум 2 примера с `await` (фрагменты 3, 4, 9, 10).
- Минимум 2 примера с вложенными microtask (фрагменты 2, 8).
- Минимум 2 примера с таймерами (фрагменты 1, 6, 7, 8, 10).
- Минимум 2 примера с ошибками (фрагменты 5, 6, 7, 10).
- Все `console.assert` пройдены.
