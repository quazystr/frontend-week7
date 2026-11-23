/**
 * Модуль storage.js
 * Безопасная обёртка над localStorage.
 * Все операции обёрнуты в try/catch, чтобы падение хранилища
 * (например, при включённом приватном режиме или переполнении)
 * не ломало приложение.
 */

export function createStorage(backend = localStorage) {
  return {
    getItem(key) {
      try {
        const raw = backend.getItem(key);
        return raw === null ? null : raw;
      } catch (e) {
        console.warn("storage.getItem failed:", e);
        return null;
      }
    },

    setItem(key, value) {
      try {
        backend.setItem(key, String(value));
        return true;
      } catch (e) {
        console.warn("storage.setItem failed:", e);
        return false;
      }
    },

    removeItem(key) {
      try {
        backend.removeItem(key);
      } catch (e) {
        console.warn("storage.removeItem failed:", e);
      }
    },
  };
}
