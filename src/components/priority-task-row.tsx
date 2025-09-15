import { Task, Theme, StrategicPillar, Domain } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Check, 
  Edit, 
  Plus, 
  Target, 
  Clock, 
  AlertTriangle,
  RotateCcw,
  Layers,
  Package
} from "lucide-react";
import { format, isBefore, startOfDay } from "date-fns";

interface PriorityTaskRowProps {
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
}

export function PriorityTaskRow({
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
}: PriorityTaskRowProps) {
  // Find parent task if this is a subtask
  const parentTask = task.parentTaskId 
    ? allTasks.find(t => t.id === task.parentTaskId)
    : null;

  // Get related data for this task
  const taskThemes = themes.filter(theme => task.themeIds.includes(theme.id));
  const relatedPillars = strategicPillars.filter(pillar => 
    taskThemes.some(theme => theme.strategicPillarIds.includes(pillar.id))
  );
  const relatedDomains = domains.filter(domain =>
    relatedPillars.some(pillar => pillar.domainIds.includes(domain.id))
  );

  // Determine badge type and status
  const today = startOfDay(new Date());
  const effectiveDate = task.prioritizedDate || task.dueDate;
  const isOverdue = effectiveDate && isBefore(effectiveDate, today) && task.status !== 'completed';
  const isDueToday = effectiveDate && format(effectiveDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
  const getBadges = () => {
    const badges = [];
    
    if (task.prioritizedDate) {
      badges.push(
        <Badge key="prioritized" variant="default" className="gap-1">
          <Target className="w-3 h-3" />
          Prioritized
        </Badge>
      );
    }
    
    if (effectiveDate && !task.prioritizedDate) {
      if (isOverdue) {
        badges.push(
          <Badge key="overdue" variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </Badge>
        );
      } else {
        badges.push(
          <Badge key="due" variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Due {isDueToday ? 'Today' : format(effectiveDate, 'MMM d')}
          </Badge>
        );
      }
    }
    
    return badges;
  };

  const isCompleted = task.status === 'completed';
  const handleOpen = () => {
    if (onTaskView) return onTaskView(task);
    onTaskEdit?.(task);
  };

  return (
    <Card className={`p-4 ${isCompleted ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onTaskToggleStatus?.(task.id)}
            disabled={task.status === 'hold'}
          />
        </div>

        {/* Task Content */}
        <div 
          className="flex-1 min-w-0 cursor-pointer hover:bg-muted/30 rounded p-2 -m-2 transition-colors"
          onClick={handleOpen}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Parent Task Chip */}
              {parentTask && (
                <div className="mb-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTaskView) {
                        onTaskView(parentTask);
                      } else {
                        onTaskEdit?.(parentTask);
                      }
                    }}
                  >
                    📋 {parentTask.title}
                  </Badge>
                </div>
              )}
              
              {/* Task Title */}
              <h3 className={`font-medium ${isCompleted ? 'line-through' : ''}`}>
                {task.title}
              </h3>
              
              {/* Task Description */}
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              
              {/* Related items */}
              {(taskThemes.length > 0 || relatedPillars.length > 0 || relatedDomains.length > 0) && (
                <div className="mt-2 space-y-1">
                  {relatedDomains.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Package className="w-3 h-3 text-muted-foreground" />
                      {relatedDomains.map(domain => (
                        <Badge key={domain.id} variant="outline" className="text-xs">
                          {domain.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {relatedPillars.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Target className="w-3 h-3 text-muted-foreground" />
                      {relatedPillars.map(pillar => (
                        <Badge key={pillar.id} variant="secondary" className="text-xs">
                          {pillar.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {taskThemes.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Layers className="w-3 h-3 text-muted-foreground" />
                      {taskThemes.map(theme => (
                        <Badge key={theme.id} variant="default" className="text-xs">
                          {theme.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {task.type === 'task' ? 'Task' : 'Subtask'}
                </Badge>
                {getBadges()}
                <Badge variant="outline" className="capitalize">
                  {task.priority}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {isCompleted ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskReopen?.(task.id)}
                  className="h-8 w-8 p-0"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskToggleStatus?.(task.id)}
                  className="h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTaskEdit?.(task)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              {task.type === 'task' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateSubtask?.(task.id)}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}