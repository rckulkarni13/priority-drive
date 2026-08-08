# Apply Checklists at All Hierarchy Levels

## Product opinion

Yes. Allowing a checklist to be applied from every hierarchy level is consistent and productive. The pattern is already established for Themes, and the mental model is simple: each level can be "exploded" into the next level of children using a reusable checklist.

| Apply checklist on | Creates | Linked to parent |
|---|---|---|
| Domain | Pillars | domainIds |
| Pillar | Themes | strategicPillarIds |
| Theme | Tasks | themeIds |
| Task | Subtasks | parentTaskId |

## Scope

Extend the existing "Apply Checklist (Optional)" dropdown pattern to all creation dialogs. Keep the Theme-level behavior unchanged: it creates Tasks, not Subtasks. Add new checklist application handlers for Domain, Pillar, and Task.

## Implementation

### 1. Database: no schema changes

Checklists are already workspace-scoped with ordered items. No new tables or columns are required.

### 2. `use-tasks.ts`: add checklist-appliers

- Add `applyChecklistToDomain(domain, itemTitles)` → creates `strategic_pillars` rows, linked to the domain via `pillar_domains`.
- Add `applyChecklistToPillar(pillar, itemTitles)` → creates `themes` rows, linked to the pillar via `theme_pillars`.
- Add `applyChecklistToTask(task, itemTitles)` → creates `tasks` rows with `type = 'subtask'` and `parent_task_id = task.id`.
- Keep `applyChecklistToTheme` unchanged.

All four handlers use the same timestamp-staggering strategy already used by `applyChecklistToTheme` so user-defined order is preserved.

### 3. Form dialogs: add checklist dropdown

- `DomainFormDialog`: add optional "Apply Checklist" dropdown when `hasChecklists` is true. Pass `checklistId` to `onDomainCreate` via a new callback shape, or return the created domain id so the caller can apply the checklist.
- `PillarFormDialog`: same, pass `checklistId` through `onPillarCreate`.
- `TaskFormDialog`: same, but note: when a checklist is selected, the new task itself is still created first, then the checklist items become its subtasks.
- `ThemeFormDialog`: already has the dropdown; ensure it stays working and stays creating Tasks.

The cleanest API is to add an optional `onApplyChecklist` callback to each dialog and, after the parent entity is created, call the right `applyChecklistToX` handler.

### 4. Controlled dialogs and Index wiring

- `ControlledDomainDialog`, `ControlledPillarDialog`, `ControlledTaskDialog`, `ControlledThemeDialog`: forward the new `onApplyChecklist` prop from their parent.
- `src/pages/Index.tsx`: pass the matching `applyChecklistToX` handlers from `useTasks()` into each controlled dialog.

### 5. Quick Create / Hierarchy view

- In `HierarchyView`, the existing "Add Pillar", "Add Theme", and "Add Task" buttons already open the controlled dialogs. They will automatically gain the checklist dropdown once the dialogs are updated.
- The Quick Create menu opens dialogs without a parent context; it should also expose the checklist dropdown if it opens a Domain/Pillar/Task/Theme dialog. No special change is needed because the dialog itself will show the dropdown when checklists exist.

### 6. Success messages

Use the workspace terminology for the created child type (e.g. "Created 3 pillars from checklist"). Success messages already use `getTerms()` in `useTasks`.

### 7. UI copy

- Update `ChecklistFormDialog` description to say "apply them to any level to create children automatically" instead of only theme.
- Dropdown labels remain "Apply Checklist (Optional)".

## Verification

- Create a checklist in a workspace.
- In Hierarchy view, create a Domain with that checklist selected → Pillars appear under it.
- Create a Pillar with that checklist selected → Themes appear under it.
- Create a Theme with that checklist selected → Tasks appear under it (existing behavior).
- Create a Task with that checklist selected → Subtasks appear under it.
- Create any entity without a checklist selected → only the entity is created.
