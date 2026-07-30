import { Task } from "@/types";
import { getEffectiveStartDate, getEffectiveEndDate, isTaskOverdue } from "@/lib/task-dates";

const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const c = dateOnly(d);
  c.setDate(c.getDate() + n);
  return c;
};

export type OverviewBucket = 'overdue' | 'today' | 'upcoming';

export interface OverviewBuckets {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
}

/** Tasks with no dates at all never qualify for the Overview. */
function isDated(task: Task): boolean {
  return !!getEffectiveEndDate(task);
}

function windowOf(task: Task): { start: Date; end: Date } | null {
  const end = getEffectiveEndDate(task);
  if (!end) return null;
  const start = getEffectiveStartDate(task) ?? end;
  const s = dateOnly(start);
  const e = dateOnly(end);
  return { start: s > e ? e : s, end: e };
}

export function categorizeOverviewTasks(tasks: Task[], now: Date = new Date()): OverviewBuckets {
  const today = dateOnly(now);
  const tomorrow = addDays(today, 1);
  const horizon = addDays(today, 7);

  const overdue: Task[] = [];
  const todayTasks: Task[] = [];
  const upcoming: Task[] = [];

  for (const task of tasks) {
    // Subtasks are surfaced through their parents elsewhere, but they are real
    // dated work items too — include everything that is not completed.
    if (task.status === 'completed') continue;
    if (!isDated(task)) continue;

    const w = windowOf(task);
    if (!w) continue;

    if (isTaskOverdue(task, now)) {
      overdue.push(task);
    } else if (w.start <= today && w.end >= today) {
      todayTasks.push(task);
    } else if (w.start <= horizon && w.end >= tomorrow) {
      upcoming.push(task);
    }
  }

  const byEnd = (a: Task, b: Task) => {
    const ea = getEffectiveEndDate(a)!.getTime();
    const eb = getEffectiveEndDate(b)!.getTime();
    return ea - eb;
  };

  return {
    overdue: overdue.sort(byEnd),
    today: todayTasks.sort(byEnd),
    upcoming: upcoming.sort((a, b) => {
      const sa = (getEffectiveStartDate(a) ?? getEffectiveEndDate(a)!).getTime();
      const sb = (getEffectiveStartDate(b) ?? getEffectiveEndDate(b)!).getTime();
      return sa - sb || byEnd(a, b);
    }),
  };
}

/** Count used for the persistent Overview nav badge: Overdue + Today. */
export function getOverviewAlertCount(tasks: Task[], now: Date = new Date()): number {
  const { overdue, today } = categorizeOverviewTasks(tasks, now);
  return overdue.length + today.length;
}