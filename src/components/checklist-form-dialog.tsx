import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Checklist } from "@/types";

interface ChecklistFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checklist?: Checklist | null;
  onSave: (input: { title: string; description?: string; items: string[] }) => void | Promise<void>;
}

export function ChecklistFormDialog({
  open,
  onOpenChange,
  checklist,
  onSave,
}: ChecklistFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<string[]>([""]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(checklist?.title ?? "");
    setDescription(checklist?.description ?? "");
    setItems(checklist?.items.length ? checklist.items.map((i) => i.title) : [""]);
  }, [open, checklist]);

  const updateItem = (index: number, value: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const cleanedItems = items.map((i) => i.trim()).filter(Boolean);
  const canSave = title.trim().length > 0 && cleanedItems.length > 0 && !isSaving;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        items: cleanedItems,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{checklist ? "Edit Checklist" : "New Checklist"}</DialogTitle>
          <DialogDescription>
            {checklist
              ? "Saving creates a new version. Tasks already created from an earlier version stay unchanged."
              : "Define the steps once, then apply them to a theme to create those tasks automatically."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="checklist-title">Title</Label>
            <Input
              id="checklist-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Feature Launch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="checklist-description">Description (Optional)</Label>
            <Textarea
              id="checklist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this checklist for?"
              className="min-h-[60px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Steps</Label>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                    {index + 1}.
                  </span>
                  <Input
                    value={item}
                    onChange={(e) => updateItem(index, e.target.value)}
                    placeholder="Step title..."
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                    aria-label="Move step up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, 1)}
                    aria-label="Move step down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    aria-label="Remove step"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setItems((prev) => [...prev, ""])}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Step
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {checklist ? "Save New Version" : "Create Checklist"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}