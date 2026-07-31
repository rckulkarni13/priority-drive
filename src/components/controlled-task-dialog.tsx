import { TaskFormDialog } from "./task-form-dialog";
import { Theme, Task } from "@/types";

interface ControlledTaskDialogProps {
  isOpen: boolean;
  themeId?: string;
  themes: Theme[];
  tasks: Task[];
  onTaskCreate: (taskData: Omit<Task, "id" | "createdDate" | "status" | "type" | "order">) => void;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledTaskDialog({
  isOpen,
  themeId,
  themes,
  tasks,
  onTaskCreate,
  onClose,
  workspaceId
}: ControlledTaskDialogProps) {
  if (!isOpen) return null;

  return (
    <TaskFormDialog
      key={themeId || 'new-task'}
      defaultOpen
      onOpenChange={(o) => { if (!o) onClose(); }}
      themes={themes}
      tasks={tasks}
      defaultThemeId={themeId}
      onTaskCreate={(taskData) => {
        onTaskCreate(taskData);
        onClose();
      }}
      workspaceId={workspaceId}
    />
  );
}