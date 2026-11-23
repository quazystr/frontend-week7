/**
 * Модуль history.js
 * Фабрика createHistory(options).
 * Управление историей завершённых фокус-сессий.
 * Лимит 50 записей. Валидация и сортировка при чтении.
 */

import { validateHistoryList, isValidHistoryEntry } from "./validation.js";

const STORAGE_KEY = "focus-timer:history";
const MAX_ENTRIES = 50;

function generateId() {
  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Сортировка: новые сверху (по убыванию finishedAt)
function sortByFreshness(entries) {
  return entries.slice().sort((a, b) => b.finishedAt - a.finishedAt);
}

export function createHistory(options = {}) {
  const { storage, key = STORAGE_KEY, onChange } = options;

  let entries = [];

  // Чтение с валидацией и сортировкой
  function loadFromStorage() {
    try {
      const raw = storage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        let valid = validateHistoryList(parsed);
        // Сортируем, чтобы гарантировать порядок "новые сверху"
        valid = sortByFreshness(valid);
        // Применяем лимит
        if (valid.length > MAX_ENTRIES) {
          valid = valid.slice(0, MAX_ENTRIES);
        }
        return valid;
      }
    } catch (e) {
      // Повреждённый JSON — игнорируем
    }
    return [];
  }

  entries = loadFromStorage();

  function persist() {
    storage.setItem(key, JSON.stringify(entries));
  }

  function notify() {
    if (onChange) onChange(entries.slice());
  }

  return {
    getAll() {
      return entries.slice();
    },

    getCount() {
      return entries.length;
    },

    add(entry) {
      const normalized = {
        id: entry && typeof entry.id === "string" ? entry.id : generateId(),
        taskId:
          entry && (entry.taskId === null || typeof entry.taskId === "string")
            ? entry.taskId
            : null,
        finishedAt:
          entry && typeof entry.finishedAt === "number"
            ? entry.finishedAt
            : Date.now(),
        durationMs:
          entry && typeof entry.durationMs === "number" && entry.durationMs > 0
            ? entry.durationMs
            : 0,
      };

      if (!isValidHistoryEntry(normalized)) return false;

      entries.unshift(normalized);

      if (entries.length > MAX_ENTRIES) {
        entries = entries.slice(0, MAX_ENTRIES);
      }

      persist();
      notify();
      return true;
    },

    clear() {
      entries = [];
      persist();
      notify();
      return true;
    },

    // Для тестов: принудительно записать невалидные данные
    _writeRaw(rawJson) {
      storage.setItem(key, rawJson);
    },

    // Для тестов: перечитать из storage (имитация перезагрузки)
    _reload() {
      entries = loadFromStorage();
    },
  };
}
