import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from "@/types";
import { PriorityTaskRow } from "./priority-task-row";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

interface SortableTaskItemProps {
  task: Task;
  allTasks: Task[];
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
}

function SortableTaskItem({
  task,
  allTasks,
  onTaskView,
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="drag-handle p-1 rounded hover:bg-muted/50 transition-colors cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <PriorityTaskRow
            task={task}
            allTasks={allTasks}
            onTaskView={onTaskView}
            onTaskEdit={onTaskEdit}
            onTaskToggleStatus={onTaskToggleStatus}
            onTaskReopen={onTaskReopen}
            onCreateSubtask={onCreateSubtask}
          />
        </div>
      </div>
    </div>
  );
}

interface SortableTaskListProps {
  title: string;
  tasks: Task[];
  allTasks: Task[];
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onTaskReorder?: (taskOrders: { id: string; order: number }[]) => void;
  emptyMessage?: string;
}

export function SortableTaskList({
  title,
  tasks,
  allTasks,
  onTaskView,
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
  onTaskReorder,
  emptyMessage = "No tasks found",
}: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Create order updates with new positions
      const taskOrders = reorderedTasks.map((task, index) => ({
        id: task.id,
        order: index + 1,
      }));
      
      onTaskReorder?.(taskOrders);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="secondary" className="text-xs">
          {tasks.length} tasks
        </Badge>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {tasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  allTasks={allTasks}
                  onTaskView={onTaskView}
                  onTaskEdit={onTaskEdit}
                  onTaskToggleStatus={onTaskToggleStatus}
                  onTaskReopen={onTaskReopen}
                  onCreateSubtask={onCreateSubtask}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}