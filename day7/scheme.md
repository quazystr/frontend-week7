# Day 7, Task 7.2: Схема одного запуска

Путь кнопки Start от клика до сохранения в историю. У каждого шага указан
файл и функция.

---

Шаг 1. Событие клика.
Файл: focus-timer/index.html, элемент button#start-btn.
Пользователь нажимает кнопку, браузер генерирует событие click.

Шаг 2. Обработчик получает управление.
Файл: focus-timer/js/controller.js, функция onHandleStart.
Обработчик был повешен в init() через addEventListener с signal от
AbortController. Проверяет if (status === 'running') return — защита от
двойного запуска.

Шаг 3. Создание таймера (если его ещё нет).
Файл: focus-timer/js/controller.js, функция onHandleStart.
Вызывает createTimer({ durationMs, onTick: handleTick, onFinish: handleFinish }).
durationMs берётся из settings.getFocusMs() или settings.getBreakMs() в
зависимости от mode.

Шаг 4. Смена статуса.
Файл: focus-timer/js/controller.js, функция setStatus.
status меняется с idle на running. Вызывается updateUI(), который
блокирует кнопку Start (disabled = true) и разблокирует Pause.

Шаг 5. Запуск таймера.
Файл: focus-timer/js/timer.js, метод start.
Инкрементирует runId (убивает старые callback), устанавливает isRunning = true,
сбрасывает hasFinished = false.

Шаг 6. Создание deadline.
Файл: focus-timer/js/timer.js, метод start.
deadline = Date.now() + remainingMs. Это абсолютный момент окончания, от
которого всегда вычисляется остаток.

Шаг 7. Первый тик.
Файл: focus-timer/js/timer.js, функция tick.
Вызывается сразу, без ожидания setTimeout.

Шаг 8. Пересчёт остатка.
Файл: focus-timer/js/timer.js, функция tick.
remainingMs = Math.max(0, deadline - Date.now()). Точное значение, не
зависящее от количества тиков.

Шаг 9. Проверка завершения.
Файл: focus-timer/js/timer.js, функция tick.
Если remainingMs <= 0, устанавливает isRunning = false, вызывает onFinish
один раз (благодаря флагу hasFinished). Иначе планирует следующий тик.

Шаг 10. Планирование следующего тика.
Файл: focus-timer/js/timer.js, функция tick.
timeoutId = setTimeout(() => tick(currentRunId), 250). Интервал 250 мс —
4 обновления в секунду, достаточно для плавного UI.

Шаг 11. Отрисовка (render).
Файл: focus-timer/js/controller.js, функция handleTick.
Получает remainingMs от таймера. Форматирует через formatTime() и записывает
в displayEl.textContent. Также обновляет timeEl (элемент time) для
семантики и доступности.

Шаг 12. Завершение сессии.
Файл: focus-timer/js/controller.js, функция handleFinish.
Вызывается из tick(), когда remainingMs <= 0. Устанавливает status = 'done'.

Шаг 13. Сохранение в историю.
Файл: focus-timer/js/controller.js, функция handleFinish.
Если mode === 'focus', вызывает history.add({ taskId: tasks.getSelectedId(),
finishedAt: Date.now(), durationMs: getCurrentDurationMs() }).

Шаг 14. Запись в localStorage.
Файл: focus-timer/js/history.js, метод add.
Нормализует запись, валидирует через isValidHistoryEntry, добавляет в начало
массива (unshift), обрезает до 50 записей, вызывает storage.setItem.

Шаг 15. Обновление UI истории.
Файл: focus-timer/js/main.js, функция renderHistory.
Вызывается через onChange-колбэк, который history.js дёргает после add().
Перерисовывает список записей.

---

Итого: 15 шагов от клика до записи в localStorage. Каждый шаг — отдельная
функция в отдельном модуле. Ни один модуль не знает о внутренностях другого.
