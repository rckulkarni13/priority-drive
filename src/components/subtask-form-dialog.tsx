import { TaskFormDialog } from "./task-form-dialog";
import { Theme, Task } from "@/types";

interface SubtaskFormDialogProps {
  children: React.ReactNode;
  themes: Theme[];
  tasks: Task[];
  parentTaskId: string;
  defaultThemeId?: string;
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => void;
  workspaceId: string;
}

export function SubtaskFormDialog({ 
  children, 
  themes, 
  tasks, 
  parentTaskId, 
  defaultThemeId,
  onTaskCreate,
  workspaceId
}: SubtaskFormDialogProps) {
  return (
    <TaskFormDialog
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