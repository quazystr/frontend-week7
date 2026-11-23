/**
 * Модуль tasks.js
 * Фабрика createTasks(options).
 * Управление локальными задачами: добавление, удаление, выбор.
 * Сохранение в storage через debounce.
 */

import { createDebounce } from "./debounce.js";
import { isValidTask, validateTaskList } from "./validation.js";

const STORAGE_KEY = "focus-timer:tasks";
const DEBOUNCE_DELAY_MS = 400;

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createTasks(options = {}) {
  const { storage, key = STORAGE_KEY, onChange } = options;

  let tasks = [];
  let selectedId = null;

  // Чтение из storage при создании
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      tasks = validateTaskList(parsed.tasks || []);
      if (parsed.selectedId && tasks.some((t) => t.id === parsed.selectedId)) {
        selectedId = parsed.selectedId;
      }
    }
  } catch (e) {
    tasks = [];
    selectedId = null;
  }

  function persist() {
    storage.setItem(key, JSON.stringify({ tasks, selectedId }));
  }

  const debouncedSave = createDebounce(persist, DEBOUNCE_DELAY_MS);

  function notify() {
    if (onChange) onChange({ tasks, selectedId });
  }

  return {
    getAll() {
      return tasks.slice(); // копия
    },

    getById(id) {
      return tasks.find((t) => t.id === id) || null;
    },

    getSelectedId() {
      return selectedId;
    },

    getSelected() {
      return selectedId ? this.getById(selectedId) : null;
    },

    add(title) {
      if (typeof title !== "string") return null;
      const trimmed = title.trim();
      if (trimmed.length === 0) return null;

      const task = {
        id: generateId(),
        title: trimmed,
        createdAt: Date.now(),
      };
      if (!isValidTask(task)) return null;

      tasks.push(task);
      debouncedSave();
      notify();
      return task;
    },

    remove(id) {
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) return false;

      tasks.splice(index, 1);
      if (selectedId === id) {
        selectedId = null;
      }
      debouncedSave();
      notify();
      return true;
    },

    select(id) {
      if (id === null) {
        selectedId = null;
        debouncedSave();
        notify();
        return true;
      }
      if (!tasks.some((t) => t.id === id)) return false;
      selectedId = id;
      debouncedSave();
      notify();
      return true;
    },

    reset() {
      debouncedSave.cancel();
      // Перечитываем из storage
      try {
        const raw = storage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          tasks = validateTaskList(parsed.tasks || []);
          selectedId =
            parsed.selectedId && tasks.some((t) => t.id === parsed.selectedId)
              ? parsed.selectedId
              : null;
        } else {
          tasks = [];
          selectedId = null;
        }
      } catch (e) {
        tasks = [];
        selectedId = null;
      }
      notify();
      return { tasks: tasks.slice(), selectedId };
    },

    _forceSave() {
      persist();
    },

    _waitDebounce() {
      return new Promise((r) => setTimeout(r, DEBOUNCE_DELAY_MS + 50));
    },
  };
}
