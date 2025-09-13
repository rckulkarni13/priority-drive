import { Task } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Calendar, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onToggleStatus?: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export function TaskCard({ 
  task, 
  onEdit, 
  onToggleStatus, 
  onReopen, 
  isDragging,
  dragHandleProps 
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  
  return (
    <Card className={cn(
      "task-card group",
      isDragging && "opacity-50 rotate-2 scale-105",
      isCompleted && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...dragHandleProps}
            className="drag-handle mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={cn(
                "font-medium text-sm leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </div>
            </div>
            
            {task.description && (
              <p className={cn(
                "text-xs text-muted-foreground mb-3 line-clamp-2",
                isCompleted && "line-through"
              )}>
                {task.description}
              </p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {format(task.dueDate, 'MMM d')}</span>
                </div>
                {task.prioritizedDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Priority {format(task.prioritizedDate, 'MMM d')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {isCompleted ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReopen?.(task.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reopen
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleStatus?.(task.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}