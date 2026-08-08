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
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => Promise<string>;
  onApplyChecklist?: (task: { id: string; workspaceId: string }, itemTitles: string[]) => void | Promise<void>;
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
  onApplyChecklist,
  workspaceId
}: SubtaskFormDialogProps) {
  return (
    <TaskFormDialog
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      themes={themes}
      tasks={tasks}
      onTaskCreate={onTaskCreate}
      onApplyChecklist={onApplyChecklist}
      defaultParentTaskId={parentTaskId}
      defaultThemeId={defaultThemeId}
      defaultType="subtask"
      workspaceId={workspaceId}
    >
      {children}
    </TaskFormDialog>
  );
}
