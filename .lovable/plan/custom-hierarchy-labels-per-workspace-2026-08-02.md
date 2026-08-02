# Custom Hierarchy Labels (per workspace)

Let each workspace define its own display names for the three tiers above Task. Defaults stay exactly as today, so nobody who ignores the setting sees a change.

## What the user gets

- A **Labels** section in the workspace's settings (reached from the Manage view, and from the workspace switcher's gear action), listing the three tiers in order: top tier (today "Domain"), middle tier (today "Strategic Pillar" / "Learning Goal" / "Goal"), bottom tier above Task (today "Theme" / "Topic" / "Project").
- For each tier: a **singular** and a **plural** field, pre-filled with the current workspace default, plus a "Reset to default" action per tier and for the whole set.
- Saving updates the wording everywhere in that workspace immediately: hierarchy view, Manage view, create/edit/detail modals, Quick Create, Overview, Checklists modal, toasts, tooltips, empty states.
- "Task" is not editable and is not shown as an editable row.
- Labels are per workspace and independent: renaming in Work does not affect School or Home.

Two fields per tier (rather than auto-pluralizing) because auto-pluralization mangles real words users pick; the fields are pre-filled so it stays a one-line edit.

## Validation

- Trimmed, 1-40 characters, required if edited; empty means "fall back to default".
- Duplicate labels across the three tiers in the same workspace are rejected (they'd make the hierarchy unreadable).
- Displayed casing is handled where it already is today (e.g. lowercase inside sentences), so any input casing renders sensibly.

## Technical approach

**Data**: one migration adding a nullable `tier_labels jsonb` column to `public.workspaces` (shape: `{ domain: {singular, plural}, pillar: {...}, theme: {...} }`, any missing key falls back to the type default). No new table, no changes to `domains` / `strategic_pillars` / `themes` / `tasks`. Existing RLS on `workspaces` already scopes reads/writes to the owner, so no new policies.

**Terminology resolution**: `src/lib/workspace-terminology.ts` keeps `getWorkspaceTerminology(type)` as the defaults source and gains a merge helper that overlays overrides onto defaults. `src/hooks/use-workspace-terms.ts` caches `{ type, tier_labels }` per workspace id instead of just `type` and returns the merged terminology; `registerWorkspaceTypes` (called from `use-workspaces.ts` once workspaces load) is extended to carry the overrides, and its existing listener broadcast makes every mounted dialog re-render after a save. Because all ~19 call sites already read from these two modules, no per-component copy changes are needed.

**Types**: `Workspace` in `src/types/index.ts` gains an optional `tierLabels` field, mapped in `use-workspaces.ts`.

**UI**: new `src/components/workspace-labels-dialog.tsx` (form + validation + reset), opened from a "Customize labels" entry in `manage-view.tsx` and the workspace switcher. Saving writes `tier_labels` on the workspace row, refreshes the workspaces list, and re-primes the cache.

**Server-side wording** (`use-tasks.ts` toasts) resolves labels from the same merged source rather than the type-only default.

## Impact on the MCP plan

No structural change, but the MCP spec needs one wording update: `list_workspaces` must return the workspace's **effective** labels (overrides merged over defaults), not the hard-coded type map. The tool names, arguments and the fixed three-tier-plus-Task contract stay identical, so effort is unchanged. I'll fold that line into the MCP plan when we build it.

## Out of scope

- Changing the number of hierarchy tiers.
- Renaming "Task".
- Any change to how Checklists, Overview or MCP reference tiers internally.
