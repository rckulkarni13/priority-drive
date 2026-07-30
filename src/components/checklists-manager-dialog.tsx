import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ListChecks, Pencil, Plus, Trash2 } from "lucide-react";
import { useChecklists } from "@/hooks/use-checklists";
import { ChecklistFormDialog } from "@/components/checklist-form-dialog";
import { Checklist } from "@/types";

interface ChecklistsManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

export function ChecklistsManagerDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
}: ChecklistsManagerDialogProps) {
  const { checklists, isLoading, createChecklist, updateChecklist, deleteChecklist } =
    useChecklists(workspaceId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Checklist | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Checklist | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (checklist: Checklist) => {
    setEditing(checklist);
    setFormOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="w-5 h-5" />
              Checklists — {workspaceName}
            </DialogTitle>
            <DialogDescription>
              Reusable sets of steps. Apply one to a task and its steps become subtasks.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end">
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-1" />
              New Checklist
            </Button>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading checklists...</p>
          ) : checklists.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No checklists yet in {workspaceName}</p>
              <p className="text-xs">
                Create one to stop re-adding the same setup steps to every task.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {checklists.map((checklist) => (
                <Card key={checklist.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{checklist.title}</h4>
                        <Badge variant="secondary" className="text-xs">
                          v{checklist.versionNumber}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {checklist.items.length} steps
                        </span>
                      </div>
                      {checklist.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {checklist.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(checklist)}
                        aria-label={`Edit ${checklist.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPendingDelete(checklist)}
                        aria-label={`Delete ${checklist.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <ul className="mt-3 space-y-1">
                    {checklist.items.map((item, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-xs w-5 shrink-0 text-right">{index + 1}.</span>
                        <span>{item.title}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ChecklistFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        checklist={editing}
        onSave={(input) =>
          editing ? updateChecklist(editing.id, input) : createChecklist(input)
        }
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(isOpen) => !isOpen && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{pendingDelete?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the checklist definition. Tasks already created from it stay on
              their tasks and are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) deleteChecklist(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}