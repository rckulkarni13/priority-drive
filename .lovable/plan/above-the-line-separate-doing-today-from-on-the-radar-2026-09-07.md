# Above the line: separate "Doing Today" from "On the Radar"

## The idea

Today's view becomes one list with a movable line through it, just like the Jira backlog line.

- Above the line: **Doing Today** — the work you actually intend to touch today.
- Below the line: **On the Radar** — follow-ups you want to keep visible but aren't working on.

You drag a task across the line to change which side it's on, and drag the line itself up or down to move several tasks at once. The choice sticks: a task you push below the line stays on the radar tomorrow and the day after until you pull it back up.

Naming recommendation: **Doing Today** (clearer than "Prioritized", which already describes everything on the page) and **On the Radar**. "Focus" / "On the Radar" is a good alternative if you prefer shorter.

## What changes

### Today's view
- One continuous drag-and-drop list with a labelled divider row in the middle: a thin line with a small "On the Radar" caption and a count.
- Each side shows its own count. Above-the-line tasks stay full-size; below-the-line tasks render slightly dimmed and more compact so the eye lands on the work first.
- If nothing is on the radar, the line still shows with a hint ("Drag a follow-up below the line") so the feature is discoverable.
- The Overdue section above stays exactly as it is today.
- Completing a task, opening it, deleting it — all unchanged on both sides.

### Overview page (all workspaces)
- The Today column splits into the same two groups, with **Doing Today** on top and a lighter **On the Radar** group beneath a matching divider.
- Overview stays read-only for this: no dragging there, it just reflects what you set in Today's view. Overdue and Upcoming columns are untouched.

### Calendar and other views
No change for now, as agreed.

## Behaviour details
- New tasks default to above the line (Doing Today).
- A task's side is remembered permanently until you move it; rolling into a new day does not reset it.
- Moving a task below the line keeps its due/priority dates as-is — this is purely about attention, not scheduling.
- Sort order within each group keeps working the way it does now (your manual drag order).

## Technical notes
- Add a `on_radar boolean not null default false` column to `public.tasks` via migration; expose it as `onRadar` on the `Task` type in `src/types/index.ts` and map it in `src/hooks/use-tasks.ts`.
- `src/components/sortable-task-list.tsx` gains an optional "divider mode": the `SortableContext` items array includes a sentinel `__radar-line__` id. On drag end, compute each task's position relative to the sentinel, then persist (a) new `task_order` values via the existing `updateTaskOrder` and (b) `on_radar` for any task that crossed the line, through a small `setTaskRadar(taskId, value)` helper in `use-tasks.ts` (optimistic local update, then Supabase update).
- Dragging the sentinel itself is allowed; it re-partitions the list in one drop.
- `src/pages/Index.tsx` passes `todayOnlyTasks` unchanged (partitioning happens inside the list) plus the new handler.
- `src/components/overview-view.tsx`: partition `buckets.today` by `onRadar` inside the Today `Column` and render the two labelled groups, reusing the existing card component.
- Existing RLS policies on `tasks` already cover the new column; no policy changes needed.
