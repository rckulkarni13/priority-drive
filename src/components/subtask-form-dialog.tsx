import { TaskFormDialog } from "./task-form-dialog";
import { Theme, Task } from "@/types";

interface SubtaskFormDialogProps {
  children: React.ReactNode;
  themes: Theme[];
  tasks: Task[];
  parentTaskId: string;
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => void;
}

export function SubtaskFormDialog({ 
  children, 
  themes, 
  tasks, 
  parentTaskId, 
  onTaskCreate 
}: SubtaskFormDialogProps) {
  return (
    <TaskFormDialog
      themes={themes}
      tasks={tasks}
      onTaskCreate={onTaskCreate}
      defaultParentTaskId={parentTaskId}
      defaultType="subtask"
    >
      {children}
    </TaskFormDialog>
  );
}