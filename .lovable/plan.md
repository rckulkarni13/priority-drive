## Feature: Reusable Checklists

Define a Checklist once (a named list of subtask titles), then apply it to any task to auto-create those subtasks. Scoped per workspace. Uses versioning so edits don't retroactively change tasks that already applied an earlier version.

### Placement (updated per feedback)

Checklists are a **parallel management surface to tasks**, not a view of tasks — so they get their own **"Checklists" button in the header, directly next to Quick Create**, rather than being buried in the More dropdown.

```text
Workspace: [🏢 Work ▾]        [ Checklists ]  [ + Quick Create ▾ ]
─────────────────────────────────────────────────────────────────
  Today   Calendar   More ▾
```

Clicking it opens a **Checklists manager dialog** (not a route) — consistent with how Quick Create and the other management dialogs behave, and it keeps the user in place while they're mid-task. The dialog lists the current workspace's checklists with create/edit/delete.

### Data model

Two new tables in `public`:

- `checklists` — `id`, `user_id`, `workspace_id`, `title`, `description` (nullable), `current_version_id` (nullable), `created_date`
- `checklist_versions` — `id`, `checklist_id`, `version_number` (int), `items` (jsonb array of `{ title, order }`), `created_date`

Each edit inserts a NEW `checklist_versions` row and repoints `checklists.current_version_id`. Old versions are retained for history.

RLS: `auth.uid() = user_id` on `checklists`; `checklist_versions` policies check ownership through the parent `checklists` row. GRANTs for `authenticated` + `service_role`.

Terminology: the word "Checklist" is used in all three workspaces — universally understood, no dynamic label mapping needed.

### Behavior

- **Scope**: checklists are filtered by `currentWorkspace.id`; only same-workspace checklists are selectable on a task.
- **Apply on create**: in `TaskFormDialog`, an optional "Apply Checklist" select. After the parent task is created, insert one subtask per item:
  - `parent_task_id` = new task id, `type` = 'subtask'
  - `title` = item title
  - `priority` = parent's priority (default, editable later)
  - themes inherited from parent (matching manual subtask behavior)
  - no `due_date`, no `prioritized_date`
  - sequential `task_order`
- **Apply to existing task**: "Apply Checklist" action in `TaskDetailDialog` next to Add Subtask; appends after existing subtasks.
- **Versioning**: editing writes a new version; already-created subtasks are untouched.
- **Independence**: no checklist reference stored on tasks — created subtasks are ordinary subtasks.

### UI

Checklists manager dialog:

```text
Checklists — Work                          [+ New Checklist]
────────────────────────────────────────────────────────────
▸ Feature Launch                    v3    [Edit] [Delete]
    • Create Context Seed
    • Create Product Spec
    • Create UX Mocks
    ...
```

Components:
- `src/components/checklists-manager-dialog.tsx` — header-button-triggered list view
- `src/components/checklist-form-dialog.tsx` — title + dynamic item rows (add/remove/reorder); save writes a new version
- `src/components/apply-checklist-select.tsx` — reused in task create + task detail
- `src/hooks/use-checklists.ts` — fetch/create/update/delete, joined with current version

### Files touched

New:
- `src/components/checklists-manager-dialog.tsx`
- `src/components/checklist-form-dialog.tsx`
- `src/components/apply-checklist-select.tsx`
- `src/hooks/use-checklists.ts`

Modified:
- `src/types/index.ts` — add `Checklist`, `ChecklistVersion`, `ChecklistItem`
- `src/pages/Index.tsx` — render the Checklists button next to `QuickCreateMenu` in the header; wire subtask batch creation
- `src/components/task-form-dialog.tsx` — optional Apply Checklist on create
- `src/components/task-detail-dialog.tsx` — Apply Checklist action

No changes to `navigation.tsx` — Checklists deliberately stays out of the view tabs since it isn't a task view.

### Migration (schema only)

Create `checklists` and `checklist_versions` with GRANTs + RLS + policies. No backfill.

### Out of scope

- Retroactive syncing of subtasks when a checklist is edited (explicitly rejected).
- Cross-workspace sharing of checklists.
- Per-item priorities or dates (an item is just a title in v1).
