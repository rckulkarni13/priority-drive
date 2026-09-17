/**
 * Recurring task schedules.
 *
 * A repeating task is a single task that moves forward: when it is completed
 * (or skipped) its dates jump to the next occurrence and it stays open.
 */

export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly_date' | 'monthly_weekday';

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  /** Every N days / weeks / months. Minimum 1. */
  interval: number;
  /** weekly: days of week (0 = Sunday .. 6 = Saturday) */
  weekdays?: number[];
  /** monthly_date: day of month 1-31 (clamped to the last day of short months) */
  monthDay?: number;
  /** monthly_weekday: 1..4 = first..fourth, -1 = last */
  weekOfMonth?: 1 | 2 | 3 | 4 | -1;
  /** monthly_weekday: 0 = Sunday .. 6 = Saturday */
  weekday?: number;
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ORDINALS: Record<string, string> = { '1': 'first', '2': 'second', '3': 'third', '4': 'fourth', '-1': 'last' };

const dateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d: Date, n: number) => {
  const c = dateOnly(d);
  c.setDate(c.getDate() + n);
  return c;
};

export function daysBetween(a: Date, b: Date): number {
  const ms = dateOnly(b).getTime() - dateOnly(a).getTime();
  return Math.round(ms / 86400000);
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Date of the Nth (or last) given weekday in a month. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, week: 1 | 2 | 3 | 4 | -1): Date {
  if (week === -1) {
    const last = new Date(year, month, lastDayOfMonth(year, month));
    const diff = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month, last.getDate() - diff);
  }
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (week - 1) * 7);
}

/**
 * The first occurrence strictly after `from`.
 * `anchor` is the original start of the series (used for interval maths).
 */
export function nextOccurrence(rule: RecurrenceRule, from: Date, anchor?: Date): Date {
  const interval = Math.max(1, Math.floor(rule.interval || 1));
  const base = dateOnly(from);
  const start = anchor ? dateOnly(anchor) : base;

  switch (rule.freq) {
    case 'daily': {
      if (interval === 1) return addDays(base, 1);
      const elapsed = daysBetween(start, base);
      const steps = Math.floor(elapsed / interval) + 1;
      const candidate = addDays(start, steps * interval);
      return candidate > base ? candidate : addDays(candidate, interval);
    }
    case 'weekly': {
      const days = (rule.weekdays && rule.weekdays.length > 0 ? rule.weekdays : [start.getDay()])
        .slice()
        .sort((a, b) => a - b);
      // Walk forward day by day, honouring the week interval relative to the anchor week.
      for (let i = 1; i <= 366; i++) {
        const candidate = addDays(base, i);
        if (!days.includes(candidate.getDay())) continue;
        if (interval === 1) return candidate;
        const weeksApart = Math.floor(daysBetween(startOfWeek(start), startOfWeek(candidate)) / 7);
        if (weeksApart % interval === 0) return candidate;
      }
      return addDays(base, 7 * interval);
    }
    case 'monthly_date': {
      const day = Math.min(31, Math.max(1, rule.monthDay ?? start.getDate()));
      let year = base.getFullYear();
      let month = base.getMonth();
      for (let i = 0; i < 60; i++) {
        const candidate = new Date(year, month, Math.min(day, lastDayOfMonth(year, month)));
        if (candidate > base && monthsApart(start, candidate) % interval === 0) return candidate;
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }
      return addDays(base, 30 * interval);
    }
    case 'monthly_weekday': {
      const weekday = rule.weekday ?? start.getDay();
      const week = rule.weekOfMonth ?? 1;
      let year = base.getFullYear();
      let month = base.getMonth();
      for (let i = 0; i < 60; i++) {
        const candidate = nthWeekdayOfMonth(year, month, weekday, week);
        if (candidate > base && monthsApart(start, candidate) % interval === 0) return candidate;
        month += 1;
        if (month > 11) {
          month = 0;
          year += 1;
        }
      }
      return addDays(base, 30 * interval);
    }
  }
}

function startOfWeek(d: Date) {
  const c = dateOnly(d);
  c.setDate(c.getDate() - c.getDay());
  return c;
}

function monthsApart(a: Date, b: Date) {
  return Math.abs((b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()));
}

/** Plain-language summary, e.g. "Every third Tuesday". */
export function describeRecurrence(rule: RecurrenceRule): string {
  const n = Math.max(1, Math.floor(rule.interval || 1));
  switch (rule.freq) {
    case 'daily':
      return n === 1 ? 'Every day' : `Every ${n} days`;
    case 'weekly': {
      const days = (rule.weekdays || []).slice().sort((a, b) => a - b).map((d) => WEEKDAY_NAMES[d]);
      const list = days.length ? days.join(', ') : 'week';
      if (n === 1) return days.length ? `Every ${list}` : 'Every week';
      return `Every ${n} weeks on ${list}`;
    }
    case 'monthly_date': {
      const day = rule.monthDay ?? 1;
      const suffix = ordinalSuffix(day);
      return n === 1 ? `Monthly on the ${day}${suffix}` : `Every ${n} months on the ${day}${suffix}`;
    }
    case 'monthly_weekday': {
      const ord = ORDINALS[String(rule.weekOfMonth ?? 1)];
      const day = WEEKDAY_NAMES[rule.weekday ?? 1];
      return n === 1 ? `Every ${ord} ${day}` : `Every ${n} months on the ${ord} ${day}`;
    }
  }
}

function ordinalSuffix(day: number) {
  if (day % 100 >= 11 && day % 100 <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
