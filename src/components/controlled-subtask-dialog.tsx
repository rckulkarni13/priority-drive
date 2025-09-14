import { useEffect, useRef } from "react";
import { SubtaskFormDialog } from "./subtask-form-dialog";
import { Theme, Task } from "@/types";

interface ControlledSubtaskDialogProps {
  isOpen: boolean;
  parentTaskId: string;
  themes: Theme[];
  tasks: Task[];
  onTaskCreate: (taskData: Omit<Task, 'id' | 'createdDate' | 'order'>) => void;
  onClose: () => void;
}

export function ControlledSubtaskDialog({
  isOpen,
  parentTaskId,
  themes,
  tasks,
  onTaskCreate,
  onClose
}: ControlledSubtaskDialogProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [isOpen, parentTaskId]);

  if (!isOpen) return null;

  return (
    <SubtaskFormDialog
      themes={themes}
      tasks={tasks}
      parentTaskId={parentTaskId}
      onTaskCreate={(taskData) => {
        onTaskCreate(taskData);
        onClose();
      }}
    >
      <button ref={triggerRef} style={{ display: 'none' }} />
    </SubtaskFormDialog>
  );
}