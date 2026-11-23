/**
 * Модуль validation.js
 * Валидация записей истории и задач.
 * Все функции — чистые, не зависят от DOM или storage.
 */

export function isValidHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  if (typeof entry.id !== "string" || entry.id.length === 0) return false;
  // taskId может быть null (если задача не выбрана) или строкой
  if (entry.taskId !== null && typeof entry.taskId !== "string") return false;
  if (
    typeof entry.finishedAt !== "number" ||
    !Number.isFinite(entry.finishedAt)
  )
    return false;
  if (typeof entry.durationMs !== "number" || entry.durationMs <= 0)
    return false;
  return true;
}

export function isValidTask(task) {
  if (!task || typeof task !== "object") return false;
  if (typeof task.id !== "string" || task.id.length === 0) return false;
  if (typeof task.title !== "string" || task.title.trim().length === 0)
    return false;
  if (typeof task.createdAt !== "number" || !Number.isFinite(task.createdAt))
    return false;
  return true;
}

// Фильтрует список, оставляя только валидные записи
export function validateHistoryList(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(isValidHistoryEntry);
}

export function validateTaskList(list) {
  if (!Array.isArray(list)) return [];
  return list.filter(isValidTask);
}
