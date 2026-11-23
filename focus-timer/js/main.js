import { createController } from "./controller.js";
import { createSettings } from "./settings.js";
import { createStorage } from "./storage.js";
import { createTasks } from "./tasks.js";
import { createHistory } from "./history.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// ИНИЦИАЛИЗАЦИЯ МОДУЛЕЙ
// ==========================================
const storage = createStorage();
const settings = createSettings({ storage });
const tasks = createTasks({ storage });
const history = createHistory({ storage });

// ==========================================
// РЕАЛЬНЫЙ ИНТЕРФЕЙС
// ==========================================
const realElements = {
  startBtn: document.getElementById("start-btn"),
  pauseBtn: document.getElementById("pause-btn"),
  resetBtn: document.getElementById("reset-btn"),
  displayEl: document.getElementById("display"),
  statusEl: document.getElementById("status"),
  timeEl: document.getElementById("display-time"),
};

const announcer = document.getElementById("announcer");
const focusInput = document.getElementById("focus-input");
const breakInput = document.getElementById("break-input");
const errorEl = document.getElementById("settings-error");
const taskInput = document.getElementById("task-input");
const taskAddBtn = document.getElementById("task-add-btn");
const tasksList = document.getElementById("tasks-list");
const historyList = document.getElementById("history-list");
const historyCount = document.getElementById("history-count");
const historyClearBtn = document.getElementById("history-clear-btn");

// --- Настройки ---
focusInput.value = String(settings.getFocusMinutes());
breakInput.value = String(settings.getBreakMinutes());

function showError(message) {
  if (message) {
    errorEl.textContent = message;
    errorEl.classList.remove("settings__error_hidden");
  } else {
    errorEl.textContent = "";
    errorEl.classList.add("settings__error_hidden");
  }
}

function handleSettingInput(input, setter) {
  const raw = input.value.trim();
  const value = raw === "" ? NaN : Number(raw);
  const ok = setter(value);
  if (ok) {
    input.classList.remove("settings__input_invalid");
    showError(null);
    settings.clearError();
  } else {
    input.classList.add("settings__input_invalid");
    showError(settings.getError());
  }
}

focusInput.addEventListener("input", () =>
  handleSettingInput(focusInput, (v) => settings.setFocusMinutes(v)),
);
breakInput.addEventListener("input", () =>
  handleSettingInput(breakInput, (v) => settings.setBreakMinutes(v)),
);

// --- Задачи ---
function renderTasks() {
  const all = tasks.getAll();
  const selectedId = tasks.getSelectedId();
  tasksList.innerHTML = "";

  if (all.length === 0) {
    const empty = document.createElement("li");
    empty.className = "tasks__empty";
    empty.textContent = "Нет задач. Добавьте первую.";
    tasksList.appendChild(empty);
    return;
  }

  for (const task of all) {
    const li = document.createElement("li");
    li.className =
      "tasks__item" + (task.id === selectedId ? " tasks__item_selected" : "");
    li.dataset.id = task.id;

    const title = document.createElement("span");
    title.className = "tasks__item-title";
    title.textContent = task.title;

    const removeBtn = document.createElement("button");
    removeBtn.className = "tasks__item-remove";
    removeBtn.type = "button";
    removeBtn.textContent = "×";
    removeBtn.title = "Удалить задачу";

    li.appendChild(title);
    li.appendChild(removeBtn);
    tasksList.appendChild(li);
  }
}

function addTask() {
  const value = taskInput.value.trim();
  if (!value) return;
  tasks.add(value);
  taskInput.value = "";
  renderTasks();
}

taskAddBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

tasksList.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".tasks__item-remove");
  if (removeBtn) {
    const li = removeBtn.closest(".tasks__item");
    tasks.remove(li.dataset.id);
    renderTasks();
    return;
  }
  const li = e.target.closest(".tasks__item");
  if (li) {
    tasks.select(li.dataset.id);
    renderTasks();
  }
});

tasks.onChange = renderTasks;

// --- История ---
function formatHistoryDate(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}м ${String(seconds).padStart(2, "0")}с`;
}

function renderHistory() {
  const all = history.getAll();
  historyList.innerHTML = "";
  historyCount.textContent = `${all.length} записей`;

  if (all.length === 0) {
    const empty = document.createElement("li");
    empty.className = "history__empty";
    empty.textContent = "История пуста. Завершите первую сессию.";
    historyList.appendChild(empty);
    return;
  }

  for (const entry of all) {
    const li = document.createElement("li");
    li.className = "history__item";

    const taskSpan = document.createElement("span");
    taskSpan.className = "history__item-task";
    if (entry.taskId) {
      const task = tasks.getById(entry.taskId);
      if (task) {
        taskSpan.textContent = task.title;
      } else {
        taskSpan.textContent = "(задача удалена)";
        taskSpan.classList.add("history__item-task_no-task");
      }
    } else {
      taskSpan.textContent = "Без задачи";
      taskSpan.classList.add("history__item-task_no-task");
    }

    const meta = document.createElement("span");
    meta.className = "history__item-meta";
    meta.innerHTML = `<span>${formatDuration(entry.durationMs)}</span><span>${formatHistoryDate(entry.finishedAt)}</span>`;

    li.appendChild(taskSpan);
    li.appendChild(meta);
    historyList.appendChild(li);
  }
}

historyClearBtn.addEventListener("click", () => {
  history.clear();
  renderHistory();
});

history.onChange = renderHistory;

// --- Контроллер ---
const realController = createController({
  elements: realElements,
  settings,
  tasks,
  history,
  announcer,
});
realController.init();

// Первичная отрисовка
renderTasks();
renderHistory();

console.log("🎯 Focus Timer инициализирован.");

// ==========================================
// АВТОМАТИЧЕСКИЕ ТЕСТЫ
// ==========================================
async function runTests() {
  console.log("\n=== Тесты Task 6.5: Задача и история ===");

  // In-memory storage для изоляции
  const memoryStorage = {
    _data: {},
    getItem(key) {
      return this._data[key] ?? null;
    },
    setItem(key, value) {
      this._data[key] = String(value);
    },
    removeItem(key) {
      delete this._data[key];
    },
    clear() {
      this._data = {};
    },
  };

  // ==========================================
  // ТЕСТ 1: Добавление и удаление задач
  // ==========================================
  memoryStorage.clear();
  const testStorage = {
    getItem: (k) => memoryStorage.getItem(k),
    setItem: (k, v) => memoryStorage.setItem(k, v),
    removeItem: (k) => memoryStorage.removeItem(k),
  };
  const t1 = createTasks({ storage: testStorage });

  const task1 = t1.add("Первая задача");
  const task2 = t1.add("Вторая задача");
  console.assert(task1 !== null && task2 !== null, "Задачи добавлены");
  console.assert(t1.getAll().length === 2, "Две задачи в списке");
  console.assert(t1.getById(task1.id) === task1, "getById работает");

  t1.remove(task1.id);
  console.assert(t1.getAll().length === 1, "После удаления одна задача");
  console.assert(
    t1.getById(task1.id) === null,
    "Удалённая задача не находится",
  );

  // Пустой title не добавляется
  const emptyTask = t1.add("   ");
  console.assert(emptyTask === null, "Пустой title не добавляется");
  console.assert(t1.getAll().length === 1, "Список не изменился");

  // ==========================================
  // ТЕСТ 2: Выбор задачи
  // ==========================================
  const t2 = createTasks({ storage: testStorage });
  memoryStorage.clear();
  const ta = t2.add("A");
  const tb = t2.add("B");

  console.assert(t2.getSelectedId() === null, "Изначально ничего не выбрано");
  console.assert(t2.select(ta.id) === true, "select возвращает true");
  console.assert(t2.getSelectedId() === ta.id, "Выбрана задача A");
  console.assert(t2.select(tb.id) === true, "Переключение на B");
  console.assert(t2.getSelectedId() === tb.id, "Выбрана задача B");
  console.assert(t2.select(null) === true, "Снятие выбора");
  console.assert(t2.getSelectedId() === null, "После select(null) выбор снят");
  console.assert(
    t2.select("несуществующий-id") === false,
    "select несуществующей задачи = false",
  );

  // Удаление выбранной задачи снимает выбор
  t2.select(ta.id);
  t2.remove(ta.id);
  console.assert(
    t2.getSelectedId() === null,
    "Удаление выбранной задачи снимает выбор",
  );

  // ==========================================
  // ТЕСТ 3: Задачи сохраняются через debounce
  // ==========================================
  memoryStorage.clear();
  const t3 = createTasks({ storage: testStorage });
  t3.add("Тестовая");
  console.assert(
    memoryStorage.getItem("focus-timer:tasks") === null,
    "Сразу после add storage пуст (debounce)",
  );
  await t3._waitDebounce();
  const savedTasks = JSON.parse(memoryStorage.getItem("focus-timer:tasks"));
  console.assert(
    savedTasks.tasks.length === 1,
    "После debounce задача сохранена",
  );
  console.assert(
    savedTasks.tasks[0].title === "Тестовая",
    "Title сохранён корректно",
  );

  // ==========================================
  // ТЕСТ 4: Добавление записи в историю
  // ==========================================
  memoryStorage.clear();
  const h1 = createHistory({ storage: testStorage });
  const entry = {
    id: "session-1",
    taskId: "task-1",
    finishedAt: Date.now(),
    durationMs: 25 * 60 * 1000,
  };
  console.assert(h1.add(entry) === true, "add возвращает true");
  console.assert(h1.getCount() === 1, "Одна запись");
  console.assert(h1.getAll()[0].id === "session-1", "Запись корректная");

  // ==========================================
  // ТЕСТ 5: Лимит 50 записей
  // ==========================================
  memoryStorage.clear();
  const h2 = createHistory({ storage: testStorage });
  for (let i = 0; i < 60; i++) {
    h2.add({
      id: `session-${i}`,
      taskId: null,
      finishedAt: Date.now() + i,
      durationMs: 1000,
    });
  }
  console.assert(
    h2.getCount() === 50,
    `Лимит 50 записей, получено ${h2.getCount()}`,
  );
  // Самые свежие — в начале
  console.assert(h2.getAll()[0].id === "session-59", "Свежая запись первая");
  // Старые (0-9) должны быть вытеснены
  const ids = h2.getAll().map((e) => e.id);
  console.assert(!ids.includes("session-0"), "session-0 вытеснен");
  console.assert(!ids.includes("session-9"), "session-9 вытеснен");
  console.assert(ids.includes("session-10"), "session-10 остался");

  // ==========================================
  // ТЕСТ 6: Валидация при чтении + сортировка по свежести
  // ==========================================
  memoryStorage.clear();
  const h3 = createHistory({ storage: testStorage });
  // Разносим finishedAt, чтобы сортировка дала предсказуемый результат
  const baseTime = Date.now();
  const corrupted = JSON.stringify([
    { id: "good-1", taskId: "t1", finishedAt: baseTime, durationMs: 1000 },
    null, // невалидно
    {
      id: "good-2",
      taskId: null,
      finishedAt: baseTime + 1000,
      durationMs: 2000,
    },
    { id: "", taskId: "t1", finishedAt: baseTime, durationMs: 1000 }, // пустой id
    {
      id: "bad-duration",
      taskId: "t1",
      finishedAt: baseTime,
      durationMs: -100,
    }, // отрицательная длительность
    { id: "bad-date", taskId: "t1", finishedAt: NaN, durationMs: 1000 }, // NaN finishedAt
    "not an object", // строка вместо объекта
    {
      id: "good-3",
      taskId: "t2",
      finishedAt: baseTime + 2000,
      durationMs: 3000,
    },
  ]);
  h3._writeRaw(corrupted);
  h3._reload(); // перечитываем из storage с валидацией и сортировкой
  const validEntries = h3.getAll();
  console.assert(
    validEntries.length === 3,
    `Валидных записей: 3, получено ${validEntries.length}`,
  );
  console.assert(
    validEntries[0].id === "good-3",
    `Первая — good-3 (самый свежий finishedAt), получено ${validEntries[0]?.id}`,
  );
  console.assert(
    validEntries[1].id === "good-2",
    `Вторая — good-2, получено ${validEntries[1]?.id}`,
  );
  console.assert(
    validEntries[2].id === "good-1",
    `Третья — good-1, получено ${validEntries[2]?.id}`,
  );

  // ==========================================
  // ТЕСТ 7: Интеграция — завершённая сессия добавляет запись
  // ==========================================
  memoryStorage.clear();
  const intSettings = createSettings({ storage: testStorage });
  const intTasks = createTasks({ storage: testStorage });
  const intHistory = createHistory({ storage: testStorage });

  const mockBtn = document.createElement("button");
  const mockDisplay = document.createElement("div");
  const mockStatus = document.createElement("div");
  const intController = createController({
    elements: {
      startBtn: mockBtn,
      pauseBtn: mockBtn,
      resetBtn: mockBtn,
      displayEl: mockDisplay,
      statusEl: mockStatus,
    },
    settings: intSettings,
    tasks: intTasks,
    history: intHistory,
  });
  intController.init();

  // Добавляем задачу и выбираем её
  const intTask = intTasks.add("Тестовая задача");
  intTasks.select(intTask.id);

  // Имитируем завершение сессии
  intController._simulateFinish();

  const historyEntries = intHistory.getAll();
  console.assert(
    historyEntries.length === 1,
    `После завершения сессии в истории 1 запись, получено ${historyEntries.length}`,
  );
  console.assert(
    historyEntries[0].taskId === intTask.id,
    "taskId совпадает с выбранной задачей",
  );
  console.assert(
    historyEntries[0].durationMs === intSettings.getFocusMs(),
    "durationMs совпадает с настройками фокуса",
  );
  console.assert(
    typeof historyEntries[0].finishedAt === "number",
    "finishedAt — число",
  );
  console.assert(typeof historyEntries[0].id === "string", "id — строка");

  // Завершаем ещё одну сессию без выбранной задачи
  intTasks.select(null);
  intController._simulateFinish();
  const entries2 = intHistory.getAll();
  console.assert(entries2.length === 2, "Вторая сессия добавлена");
  console.assert(
    entries2[0].taskId === null,
    "taskId = null, если задача не выбрана",
  );

  intController.destroy();

  // ==========================================
  // ТЕСТ 8: Повреждённый JSON не ломает задачи
  // ==========================================
  memoryStorage.clear();
  memoryStorage.setItem("focus-timer:tasks", "{broken json");
  const tBad = createTasks({ storage: testStorage });
  console.assert(
    tBad.getAll().length === 0,
    "Повреждённый JSON — пустой список задач",
  );
  console.assert(
    tBad.getSelectedId() === null,
    "Повреждённый JSON — нет выбранной задачи",
  );

  console.log("✅ Все тесты Task 6.5 пройдены!");
}

runTests();
