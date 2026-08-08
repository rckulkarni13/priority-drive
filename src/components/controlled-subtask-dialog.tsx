import { SubtaskFormDialog } from "./subtask-form-dialog";
import { Theme, Task } from "@/types";

interface ControlledSubtaskDialogProps {
  isOpen: boolean;
  parentTaskId: string;
  themes: Theme[];
  tasks: Task[];
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => Promise<string>;
  onApplyChecklist?: (task: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
  onClose: () => void;
  workspaceId: string;
}

export function ControlledSubtaskDialog({
  isOpen,
  parentTaskId,
  themes,
  tasks,
  onTaskCreate,
  onApplyChecklist,
  onClose,
  workspaceId
}: ControlledSubtaskDialogProps) {
  if (!isOpen) return null;

  const parentTask = tasks.find(t => t.id === parentTaskId);
  const parentThemeId = parentTask?.themeIds?.[0];

  return (
    <SubtaskFormDialog
      defaultOpen
      onOpenChange={(o) => { if (!o) onClose(); }}
      themes={themes}
      tasks={tasks}
      parentTaskId={parentTaskId}
      defaultThemeId={parentThemeId}
      onTaskCreate={onTaskCreate}
      onApplyChecklist={onApplyChecklist}
      workspaceId={workspaceId}
    />
  );
}
