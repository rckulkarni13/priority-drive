import { Task } from "@/types";

const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Start of the task's active window (priority start, else due date). */
export function getEffectiveStartDate(task: Task): Date | undefined {
  return task.prioritizedDate || task.dueDate;
}

/**
 * Last day a task is still "on time": the latest of its priority end date
 * (or priority start) and its due date.
 */
export function getEffectiveEndDate(task: Task): Date | undefined {
  const priorityEnd = task.prioritizedEndDate || task.prioritizedDate;
  const candidates = [priorityEnd, task.dueDate].filter(Boolean) as Date[];
  if (candidates.length === 0) return undefined;
  return candidates.reduce((latest, d) => (d > latest ? d : latest));
}

/** A task is overdue when it is not completed and its effective end date is in the past. */
export function isTaskOverdue(task: Task, now: Date = new Date()): boolean {
  if (task.status === 'completed') return false;
  const end = getEffectiveEndDate(task);
  if (!end) return false;
  return dateOnly(end) < dateOnly(now);
}
