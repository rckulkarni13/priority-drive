import { useEffect, useRef } from "react";
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
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.click();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <TaskFormDialog
      themes={themes}
      tasks={tasks}
      onTaskCreate={(taskData) => {
        onTaskCreate(taskData);
        onClose();
      }}
      workspaceId={workspaceId}
    >
      <button ref={triggerRef} style={{ display: 'none' }} />
    </TaskFormDialog>
  );
}