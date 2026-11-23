/**
 * Модуль settings.js
 * Фабрика createSettings(options).
 * Управляет настройками длительности фокуса и перерыва.
 *
 * Ключевые принципы:
 * - Валидация на границах 1-90 минут (целые числа).
 * - Сохранение в localStorage через debounce(400 мс).
 * - Некорректное значение НЕ меняет состояние и НЕ ломает текущую сессию.
 * - Reset отменяет ожидающее сохранение (cancel), а не выполняет его (flush).
 */

import { createDebounce } from "./debounce.js";

const MIN_MINUTES = 1;
const MAX_MINUTES = 90;
const STORAGE_KEY = "focus-timer:settings";
const DEBOUNCE_DELAY_MS = 400;

export function createSettings(options = {}) {
  const { storage = localStorage, key = STORAGE_KEY, onChange } = options;

  // Начальные значения (по умолчанию или из localStorage)
  const defaults = { focusMinutes: 25, breakMinutes: 5 };
  let current = { ...defaults };
  let lastError = null;

  // Читаем сохранённые настройки при создании
  try {
    const raw = storage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isValid(parsed.focusMinutes) && isValid(parsed.breakMinutes)) {
        current = {
          focusMinutes: parsed.focusMinutes,
          breakMinutes: parsed.breakMinutes,
        };
      }
    }
  } catch (e) {
    // Повреждённый JSON — игнорируем, используем defaults
    lastError = "Не удалось прочитать сохранённые настройки";
  }

  // Валидация
  function isValid(value) {
    return (
      Number.isInteger(value) && value >= MIN_MINUTES && value <= MAX_MINUTES
    );
  }

  // Сохранение в localStorage (вызывается через debounce)
  function persistToStorage() {
    try {
      storage.setItem(key, JSON.stringify(current));
    } catch (e) {
      lastError = "Не удалось сохранить настройки";
    }
  }

  // Debounce-обёртка для сохранения
  const debouncedSave = createDebounce(persistToStorage, DEBOUNCE_DELAY_MS);

  return {
    getFocusMinutes() {
      return current.focusMinutes;
    },

    getBreakMinutes() {
      return current.breakMinutes;
    },

    getFocusMs() {
      return current.focusMinutes * 60 * 1000;
    },

    getBreakMs() {
      return current.breakMinutes * 60 * 1000;
    },

    setFocusMinutes(value) {
      if (!isValid(value)) {
        lastError = `Длительность фокуса должна быть от ${MIN_MINUTES} до ${MAX_MINUTES} минут`;
        return false;
      }
      current.focusMinutes = value;
      lastError = null;
      debouncedSave();
      if (onChange) onChange(current);
      return true;
    },

    setBreakMinutes(value) {
      if (!isValid(value)) {
        lastError = `Длительность перерыва должна быть от ${MIN_MINUTES} до ${MAX_MINUTES} минут`;
        return false;
      }
      current.breakMinutes = value;
      lastError = null;
      debouncedSave();
      if (onChange) onChange(current);
      return true;
    },

    getError() {
      return lastError;
    },

    clearError() {
      lastError = null;
    },

    // Reset: отменяет ожидающее сохранение и возвращает поля к сохранённым значениям
    reset() {
      debouncedSave.cancel();
      // Перечитываем из localStorage — это и есть "сохранённое" состояние
      try {
        const raw = storage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (isValid(parsed.focusMinutes) && isValid(parsed.breakMinutes)) {
            current = {
              focusMinutes: parsed.focusMinutes,
              breakMinutes: parsed.breakMinutes,
            };
          }
        } else {
          current = { ...defaults };
        }
      } catch (e) {
        current = { ...defaults };
      }
      lastError = null;
      if (onChange) onChange(current);
      return current;
    },

    // Для тестов: немедленное сохранение (без debounce)
    _forceSave() {
      persistToStorage();
    },

    // Для тестов: ожидание завершения debounce
    async _waitDebounce() {
      await new Promise((r) => setTimeout(r, DEBOUNCE_DELAY_MS + 50));
    },
  };
}
