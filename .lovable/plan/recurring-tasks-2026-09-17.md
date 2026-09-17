# Recurring Tasks

Let a task repeat on a schedule. One task moves forward: when you complete it, its priority date jumps to the next occurrence and the task re-opens. Missed occurrences stay overdue until you deal with them.

## How it works for you

- In the task form (create and edit) a new **Repeat** section: Does not repeat / Daily / Weekly / Every N weeks / Monthly by date / Monthly by weekday.
  - Daily: every N days.
  - Weekly: pick one or more weekdays.
  - Every N weeks: interval plus chosen weekdays.
  - Monthly by date: e.g. the 15th (if a month is short, the last day is used).
  - Monthly by weekday: e.g. the third Tuesday, or the last Friday.
- A series never ends; it repeats until you delete the task or turn repeating off.
- A repeating task shows a small repeat badge with a plain-language summary ("Every third Tuesday") on the task card, in Today, Calendar and Overview.
- Completing it does not archive it: it reappears at the next scheduled date, still open, with its subtasks reset to open.
- Editing the schedule recalculates the next date from today.
- If you skip an occurrence, it stays in Overdue. Completing an overdue occurrence advances to the next future date, so you never get a backlog of copies.
- A "Skip this occurrence" action in the task detail dialog moves it forward without marking it done.

## What repeats

The task's **priority start date** drives the occurrence. If the task also has a priority end date or a due date, the same offset in days is preserved on each occurrence.

## Technical notes

Database (single migration on `public.tasks`):
- `recurrence_rule jsonb` (null = non-repeating), holding `{ freq: 'daily'|'weekly'|'monthly_date'|'monthly_weekday', interval, weekdays?: number[], monthDay?: number, weekOfMonth?: 1|2|3|4|-1, weekday?: number }`
- `recurrence_anchor_date timestamptz` — the first occurrence, used for interval math.

New `src/lib/recurrence.ts`:
- `nextOccurrence(rule, from: Date): Date` for all four frequencies
- `describeRecurrence(rule): string` for badges/summaries
- pure, unit-testable, no date library beyond `date-fns` already in the project

`src/types/index.ts`: `recurrence?: RecurrenceRule` and `recurrenceAnchorDate?: Date` on `Task`.

`src/hooks/use-tasks.ts`:
- map the new columns in `fetchAllData`; persist in create/update
- in the completion path, when `recurrence` is set: instead of setting `status: 'completed'`, compute `nextOccurrence(rule, max(today, currentPriorityDate))`, shift `prioritizedDate`, `prioritizedEndDate` and `dueDate` by the same delta, keep `status: 'open'`, and reset direct subtasks to open
- add `skipOccurrence(taskId)` using the same shift without completing

UI:
- new `src/components/recurrence-picker.tsx` used by `task-form-dialog.tsx` and `edit-task-dialog.tsx`
- repeat badge in `task-card.tsx`, `priority-task-row.tsx`, `calendar-week-view.tsx`, `overview-view.tsx`
- `task-detail-dialog.tsx`: schedule summary, edit affordance, and "Skip this occurrence"

Existing date filtering (`task-dates.ts`, `overview-tasks.ts`, calendar) needs no changes, since the task always carries a single concrete set of dates.
