import { TaskFormDialog } from "./task-form-dialog";
import { Theme, Task } from "@/types";

interface SubtaskFormDialogProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  themes: Theme[];
  tasks: Task[];
  parentTaskId: string;
  defaultThemeId?: string;
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => void;
  workspaceId: string;
}

export function SubtaskFormDialog({ 
  children,
  defaultOpen = false,
  onOpenChange,
  themes, 
  tasks, 
  parentTaskId, 
  defaultThemeId,
  onTaskCreate,
  workspaceId
}: SubtaskFormDialogProps) {
  return (
    <TaskFormDialog
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      themes={themes}
      tasks={tasks}
      onTaskCreate={onTaskCreate}
      defaultParentTaskId={parentTaskId}
      defaultThemeId={defaultThemeId}
      defaultType="subtask"
      workspaceId={workspaceId}
    >
      {children}
    </TaskFormDialog>
  );
}