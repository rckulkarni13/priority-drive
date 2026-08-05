# Fix: white screen when adding a Theme from Hierarchy view

## What is happening

Clicking "Add Theme" on a Strategic Pillar opens the Create Theme dialog, which crashes the app and leaves a blank white page.

## Root cause (confirmed)

`src/components/theme-form-dialog.tsx` line 189 renders the optional "Apply Checklist" dropdown with an empty-string option:

```tsx
<SelectItem value="">None</SelectItem>
```

Radix UI's Select throws a hard error when an item has an empty string value (empty string is reserved for clearing the selection). The thrown error escapes React rendering and blanks the page. This dropdown only renders when the workspace has at least one checklist, which is why the crash appears in the workspace where checklists exist.

## Fix

In `src/components/theme-form-dialog.tsx`:

1. Replace the empty-string option with a sentinel value, e.g. `<SelectItem value="none">None</SelectItem>`.
2. Set the form's `checklistId` default to `"none"` instead of `""`.
3. In `onSubmit`, treat `"none"` as "no checklist selected" so no checklist tasks are created.

No database, hook, or hierarchy-view changes are needed.

## Verification

- Open Hierarchy view, click "Add Theme" on a Strategic Pillar: the dialog opens with no blank page.
- Create a theme without picking a checklist: theme is created, no extra tasks.
- Create a theme with a checklist selected: theme is created and its checklist tasks appear.
