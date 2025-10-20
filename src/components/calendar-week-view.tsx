import { useState } from "react";
import { Task, Theme, StrategicPillar, Domain, WorkspaceType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { QuickCreateMenu } from "./quick-create-menu";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// Droppable day column
function DroppableDay({ date, children }: { date: Date; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: format(date, 'yyyy-MM-dd'),
    data: { date },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-full transition-colors",
        isOver && "bg-primary/10"
      )}
    >
      {children}
    </div>
  );
}

// Draggable task card
function DraggableTaskCard({ 
  task, 
  themes,
  strategicPillars,
  domains,
  onClick 
}: { 
  task: Task; 
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const priorityColors = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-blue-500',
    low: 'border-l-green-500',
  };

  const priorityBadgeColors = {
    critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    low: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  };

  // Get theme name
  const taskTheme = task.themeIds.length > 0 
    ? themes.find(t => t.id === task.themeIds[0])?.title 
    : null;

  // Get related domain data for this task - properly traverse the hierarchy
  const taskThemes = themes.filter(theme => task.themeIds.includes(theme.id));
  const relatedPillarIds = taskThemes.flatMap(theme => theme.strategicPillarIds);
  const relatedPillars = strategicPillars.filter(pillar => relatedPillarIds.includes(pillar.id));
  const relatedDomainIds = relatedPillars.flatMap(pillar => pillar.domainIds);
  const relatedDomain = relatedDomainIds.length > 0 
    ? domains.find(domain => relatedDomainIds.includes(domain.id))
    : null;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative bg-card rounded-lg border shadow-sm p-2.5 mb-2 cursor-pointer transition-all hover:shadow-md",
        isDragging && "opacity-50 shadow-lg scale-105",
        task.status === 'completed' && "opacity-60 bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity pt-0.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className={cn(
            "text-xs font-medium leading-snug line-clamp-2",
            task.status === 'completed' && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          
          <div className="flex flex-wrap items-center gap-1">
            {relatedDomain && (
              <Badge 
                variant="outline" 
                className="text-[9px] h-4 px-1 border font-semibold"
                style={{ 
                  borderColor: relatedDomain.color,
                  backgroundColor: `${relatedDomain.color}20`,
                  color: relatedDomain.color 
                }}
              >
                {relatedDomain.title}
              </Badge>
            )}
            
            {taskTheme && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-primary/10 text-primary">
                {taskTheme}
              </Badge>
            )}
            
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] h-4 px-1",
                priorityBadgeColors[task.priority]
              )}
            >
              {task.priority}
            </Badge>
            
            {task.status === 'completed' && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                ✓
              </Badge>
            )}
            
            {task.status === 'hold' && (
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                Hold
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CalendarWeekViewProps {
  tasks: Task[];
  allTasks: Task[];
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  workspaceId: string;
  workspaceType: WorkspaceType;
  onTaskClick?: (task: Task) => void;
  onTaskCreate: (taskData: any) => void;
  onThemeCreate: (themeData: any) => void;
  onPillarCreate: (pillarData: any) => void;
  onDomainCreate: (domainData: any) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function CalendarWeekView({
  tasks,
  allTasks,
  themes,
  strategicPillars,
  domains,
  workspaceId,
  workspaceType,
  onTaskClick,
  onTaskCreate,
  onThemeCreate,
  onPillarCreate,
  onDomainCreate,
  onTaskUpdate,
}: CalendarWeekViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    
    const { active, over } = event;
    
    if (!over) return;
    
    const task = active.data.current?.task as Task;
    const newDate = over.data.current?.date as Date;
    
    if (task && newDate) {
      onTaskUpdate(task.id, {
        prioritizedDate: newDate,
        prioritizedEndDate: newDate,
      });
    }
  };

  const getTasksForDate = (date: Date) => {
    const dateStart = startOfDay(date);
    return tasks.filter((task) => {
      const dueDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
      const prioritizedDate = task.prioritizedDate ? startOfDay(new Date(task.prioritizedDate)) : null;
      const prioritizedEndDate = task.prioritizedEndDate ? startOfDay(new Date(task.prioritizedEndDate)) : null;

      if (dueDate && isSameDay(dueDate, dateStart)) {
        return true;
      }

      if (prioritizedDate && isSameDay(prioritizedDate, dateStart)) {
        return true;
      }

      if (prioritizedDate && prioritizedEndDate) {
        return dateStart >= prioritizedDate && dateStart <= prioritizedEndDate;
      }

      return false;
    });
  };

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-6 h-6" />
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click on a task to view details • Drag to reschedule
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <QuickCreateMenu
              themes={themes}
              tasks={allTasks}
              strategicPillars={strategicPillars}
              domains={domains}
              onTaskCreate={onTaskCreate}
              onThemeCreate={onThemeCreate}
              onPillarCreate={onPillarCreate}
              onDomainCreate={onDomainCreate}
              workspaceId={workspaceId}
              workspaceType={workspaceType}
              variant="compact"
            />
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isCurrentDay = isToday(day);

            return (
              <Card
                key={day.toISOString()}
                className={cn(
                  "min-h-[500px] flex flex-col",
                  isCurrentDay && "ring-2 ring-primary"
                )}
              >
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <div className="flex flex-col items-center">
                      <span className="text-muted-foreground text-xs">
                        {format(day, 'EEE')}
                      </span>
                      <span
                        className={cn(
                          "text-lg",
                          isCurrentDay && "bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center"
                        )}
                      >
                        {format(day, 'd')}
                      </span>
                    </div>
                  </CardTitle>
                  {dayTasks.length > 0 && (
                    <Badge variant="secondary" className="text-[10px] h-4 px-1 mx-auto mt-1">
                      {dayTasks.length}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-2 flex-1 overflow-y-auto">
                  <DroppableDay date={day}>
                    {dayTasks.map((task) => (
                      <DraggableTaskCard
                        key={task.id}
                        task={task}
                        themes={themes}
                        strategicPillars={strategicPillars}
                        domains={domains}
                        onClick={() => onTaskClick?.(task)}
                      />
                    ))}
                  </DroppableDay>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">{activeTask.title}</div>
                <Badge variant="outline" className="text-[10px] h-4 px-1 mt-1">
                  {activeTask.priority}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
