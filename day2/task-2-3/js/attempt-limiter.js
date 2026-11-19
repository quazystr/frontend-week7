/**
 * Модуль attempt-limiter.js
 * Фабрика createAttemptLimiter(limit) — создаёт ограничитель попыток.
 * Состояние приватное, доступно только через методы.
 * Экспортирует: createAttemptLimiter(limit)
 */

export function createAttemptLimiter(limit) {
  // Валидация: отрицательный limit — ошибка при создании (fail fast)
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error(
      `createAttemptLimiter: limit должен быть целым неотрицательным числом, получено ${limit}`,
    );
  }

  let remaining = limit; // приватное состояние

  return {
    canTry() {
      return remaining > 0;
    },
    recordFailure() {
      if (remaining > 0) {
        remaining -= 1;
      }
      // Если уже 0 — ничего не делаем, не уходим в минус
    },
    reset() {
      remaining = limit;
    },
    getRemaining() {
      return remaining;
    },
  };
}
