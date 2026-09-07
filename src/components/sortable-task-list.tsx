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
import { Task, Theme, StrategicPillar, Domain } from "@/types";
import { PriorityTaskRow } from "./priority-task-row";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Radar } from "lucide-react";

interface SortableTaskItemProps {
  task: Task;
  allTasks: Task[];
  themes?: Theme[];
  strategicPillars?: StrategicPillar[];
  domains?: Domain[];
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

function SortableTaskItem({
  task,
  allTasks,
  themes = [],
  strategicPillars = [],
  domains = [],
  onTaskView,
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
  onTaskDelete,
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
            themes={themes}
            strategicPillars={strategicPillars}
            domains={domains}
            onTaskView={onTaskView}
            onTaskEdit={onTaskEdit}
            onTaskToggleStatus={onTaskToggleStatus}
            onTaskReopen={onTaskReopen}
            onCreateSubtask={onCreateSubtask}
            onTaskDelete={onTaskDelete}
          />
        </div>
      </div>
    </div>
  );
}

const RADAR_LINE_ID = '__radar-line__';

function RadarLine({ count }: { count: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: RADAR_LINE_ID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="py-2 select-none">
      <div
        {...attributes}
        {...listeners}
        className="flex items-center gap-3 cursor-grab active:cursor-grabbing group"
        aria-label="Drag the line to move tasks between Doing Today and On the Radar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground opacity-60 group-hover:opacity-100" />
        <div className="h-px flex-1 bg-border" />
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Radar className="w-3.5 h-3.5" />
          On the Radar
          {count > 0 ? (
            <Badge variant="outline" className="text-[10px] h-4 px-1.5">{count}</Badge>
          ) : (
            <span className="normal-case tracking-normal font-normal text-muted-foreground/70">
              — drag a follow-up below the line
            </span>
          )}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

interface SortableTaskListProps {
  title: string;
  tasks: Task[];
  allTasks: Task[];
  themes?: Theme[];
  strategicPillars?: StrategicPillar[];
  domains?: Domain[];
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskReorder?: (taskOrders: { id: string; order: number }[]) => void;
  onTaskRadarChange?: (updates: { id: string; onRadar: boolean }[]) => void;
  showRadarLine?: boolean;
  emptyMessage?: string;
}

export function SortableTaskList({
  title,
  tasks,
  allTasks,
  themes = [],
  strategicPillars = [],
  domains = [],
  onTaskView,
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
  onTaskDelete,
  onTaskReorder,
  onTaskRadarChange,
  showRadarLine = false,
  emptyMessage = "No tasks found",
}: SortableTaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Above-the-line first, then below-the-line, each keeping their manual order.
  const doingTasks = tasks.filter(t => !t.onRadar);
  const radarTasks = tasks.filter(t => t.onRadar);
  const orderedTasks = showRadarLine ? [...doingTasks, ...radarTasks] : tasks;

  // Items array includes the line sentinel between the two groups.
  const items: string[] = showRadarLine
    ? [...doingTasks.map(t => t.id), RADAR_LINE_ID, ...radarTasks.map(t => t.id)]
    : orderedTasks.map(t => t.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const nextItems = arrayMove(items, oldIndex, newIndex);

    if (showRadarLine) {
      const lineIndex = nextItems.indexOf(RADAR_LINE_ID);
      const radarUpdates: { id: string; onRadar: boolean }[] = [];
      const taskOrders: { id: string; order: number }[] = [];

      nextItems.forEach((id, index) => {
        if (id === RADAR_LINE_ID) return;
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        taskOrders.push({ id, order: index + 1 });
        const shouldBeOnRadar = index > lineIndex;
        if (!!task.onRadar !== shouldBeOnRadar) {
          radarUpdates.push({ id, onRadar: shouldBeOnRadar });
        }
      });

      if (radarUpdates.length > 0) onTaskRadarChange?.(radarUpdates);
      onTaskReorder?.(taskOrders);
      return;
    }

    onTaskReorder?.(nextItems.map((id, index) => ({ id, order: index + 1 })));
  }

  const renderTask = (task: Task) => (
    <div key={task.id} className={task.onRadar && showRadarLine ? "opacity-70" : undefined}>
      <SortableTaskItem
        task={task}
        allTasks={allTasks}
        themes={themes}
        strategicPillars={strategicPillars}
        domains={domains}
        onTaskView={onTaskView}
        onTaskEdit={onTaskEdit}
        onTaskToggleStatus={onTaskToggleStatus}
        onTaskReopen={onTaskReopen}
        onCreateSubtask={onCreateSubtask}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          {showRadarLine && (
            <Badge variant="secondary" className="text-xs">
              {doingTasks.length} doing today
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {showRadarLine ? `${radarTasks.length} on the radar` : `${tasks.length} tasks`}
          </Badge>
        </div>
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
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {showRadarLine ? (
                <>
                  {doingTasks.map(renderTask)}
                  <RadarLine count={radarTasks.length} />
                  {radarTasks.map(renderTask)}
                </>
              ) : (
                tasks.map(renderTask)
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}