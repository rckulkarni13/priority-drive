import { useEffect, useMemo, useState } from "react";
import { Workspace } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RotateCcw, Tags } from "lucide-react";
import {
  getWorkspaceTerminology,
  MAX_TIER_LABEL_LENGTH,
  TierKey,
  TierLabelOverrides,
  TIER_KEYS,
} from "@/lib/workspace-terminology";

interface WorkspaceLabelsDialogProps {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (workspaceId: string, tierLabels: TierLabelOverrides | null) => Promise<boolean> | void;
}

type LabelForm = Record<TierKey, { singular: string; plural: string }>;

const TIER_HINTS: Record<TierKey, string> = {
  domain: "Top level — the broadest grouping",
  pillar: "Middle level — sits inside the top level",
  theme: "Bottom level — the group that holds tasks",
};

export function WorkspaceLabelsDialog({
  workspace,
  open,
  onOpenChange,
  onSave,
}: WorkspaceLabelsDialogProps) {
  const defaults = useMemo(() => getWorkspaceTerminology(workspace.type), [workspace.type]);

  const buildForm = (): LabelForm =>
    TIER_KEYS.reduce((acc, key) => {
      acc[key] = {
        singular: workspace.tierLabels?.[key]?.singular?.trim() || defaults[key].singular,
        plural: workspace.tierLabels?.[key]?.plural?.trim() || defaults[key].plural,
      };
      return acc;
    }, {} as LabelForm);

  const [form, setForm] = useState<LabelForm>(buildForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(buildForm());
      setErrors([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, workspace.id, workspace.tierLabels, defaults]);

  const setField = (key: TierKey, field: "singular" | "plural", value: string) => {
    setForm((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const resetTier = (key: TierKey) => {
    setField(key, "singular", defaults[key].singular);
    setField(key, "plural", defaults[key].plural);
  };

  const resetAll = () => {
    setForm(
      TIER_KEYS.reduce((acc, key) => {
        acc[key] = { singular: defaults[key].singular, plural: defaults[key].plural };
        return acc;
      }, {} as LabelForm)
    );
    setErrors([]);
  };

  const validate = (): { ok: boolean; messages: string[]; cleaned: LabelForm } => {
    const messages: string[] = [];
    const cleaned = TIER_KEYS.reduce((acc, key) => {
      acc[key] = {
        singular: form[key].singular.trim(),
        plural: form[key].plural.trim(),
      };
      return acc;
    }, {} as LabelForm);

    for (const key of TIER_KEYS) {
      for (const field of ["singular", "plural"] as const) {
        const value = cleaned[key][field];
        if (!value) {
          messages.push(`${defaults[key].singular}: ${field} name cannot be empty.`);
        } else if (value.length > MAX_TIER_LABEL_LENGTH) {
          messages.push(
            `${defaults[key].singular}: ${field} name must be ${MAX_TIER_LABEL_LENGTH} characters or fewer.`
          );
        }
      }
    }

    const singulars = TIER_KEYS.map((k) => cleaned[k].singular.toLowerCase()).filter(Boolean);
    if (new Set(singulars).size !== singulars.length) {
      messages.push("Each level needs a different name.");
    }
    if (singulars.includes("task") || TIER_KEYS.some((k) => cleaned[k].plural.toLowerCase() === "tasks")) {
      messages.push('"Task" is reserved and cannot be used as a level name.');
    }

    return { ok: messages.length === 0, messages, cleaned };
  };

  const handleSave = async () => {
    const { ok, messages, cleaned } = validate();
    setErrors(messages);
    if (!ok) return;

    // Only persist values that differ from the workspace defaults
    const overrides: TierLabelOverrides = {};
    for (const key of TIER_KEYS) {
      const entry: { singular?: string; plural?: string } = {};
      if (cleaned[key].singular !== defaults[key].singular) entry.singular = cleaned[key].singular;
      if (cleaned[key].plural !== defaults[key].plural) entry.plural = cleaned[key].plural;
      if (Object.keys(entry).length) overrides[key] = entry;
    }

    setSaving(true);
    try {
      await onSave(workspace.id, Object.keys(overrides).length ? overrides : null);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Customize labels — {workspace.name}
          </DialogTitle>
          <DialogDescription>
            Rename the three levels above Task for this workspace only. Other workspaces are
            unaffected, and "Task" always stays "Task".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {TIER_KEYS.map((key) => (
            <div key={key} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{defaults[key].singular}</p>
                  <p className="text-xs text-muted-foreground">{TIER_HINTS[key]}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => resetTier(key)}
                  className="h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`${key}-singular`} className="text-xs">
                    Singular
                  </Label>
                  <Input
                    id={`${key}-singular`}
                    value={form[key].singular}
                    maxLength={MAX_TIER_LABEL_LENGTH}
                    onChange={(e) => setField(key, "singular", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${key}-plural`} className="text-xs">
                    Plural
                  </Label>
                  <Input
                    id={`${key}-plural`}
                    value={form[key].plural}
                    maxLength={MAX_TIER_LABEL_LENGTH}
                    onChange={(e) => setField(key, "plural", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="text-sm font-medium text-muted-foreground">Task</p>
            <p className="text-xs text-muted-foreground">
              Fixed across all workspaces so Checklists, Overview and integrations stay consistent.
            </p>
          </div>

          {errors.length > 0 && (
            <ul className="space-y-1 text-sm text-destructive">
              {errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={resetAll}>
            Reset all to defaults
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save labels"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
