import { Task, Theme, StrategicPillar, Domain } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GripVertical, Calendar, Clock, CheckCircle2, RotateCcw, MessageCircle, ChevronDown, ChevronUp, Plus, Edit, Target, Layers, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskComments } from "@/components/task-comments";
import { useState } from "react";

interface TaskCardProps {
  task: Task;
  themes?: Theme[];
  strategicPillars?: StrategicPillar[];
  domains?: Domain[];
  onEdit?: (task: Task) => void;
  onToggleStatus?: (taskId: string) => void;
  onReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export function TaskCard({ 
  task, 
  themes = [],
  strategicPillars = [],
  domains = [],
  onEdit, 
  onToggleStatus, 
  onReopen,
  onCreateSubtask,
  isDragging,
  dragHandleProps 
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const [showComments, setShowComments] = useState(false);
  
  // Get related data for this task
  const taskThemes = themes.filter(theme => task.themeIds.includes(theme.id));
  const relatedPillars = strategicPillars.filter(pillar => 
    taskThemes.some(theme => theme.strategicPillarIds.includes(pillar.id))
  );
  const relatedDomains = domains.filter(domain =>
    relatedPillars.some(pillar => pillar.domainIds.includes(domain.id))
  );
  
  return (
    <Card className={cn(
      "task-card group transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
      isDragging && "opacity-50 rotate-2 scale-105",
      isCompleted && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            {...dragHandleProps}
            className="drag-handle mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          
          <div 
            className="flex-1 min-w-0 cursor-pointer hover:bg-muted/30 rounded p-2 -m-2 transition-colors"
            onClick={() => onEdit?.(task)}
          >
            <div className="flex items-start justify-between gap-2 mb-2 mt-6">
              <h3 className={cn(
                "font-medium text-sm leading-tight transition-colors",
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
            
            {/* Related items */}
            {(taskThemes.length > 0 || relatedPillars.length > 0 || relatedDomains.length > 0) && (
              <div className="mb-3 space-y-2">
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
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{task.dueDate ? `Due ${format(task.dueDate, 'MMM d')}` : 'No due'}</span>
                </div>
                {task.prioritizedDate && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Priority {format(task.prioritizedDate, 'MMM d')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                {task.type === 'task' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateSubtask?.(task.id)}
                    className="h-6 px-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Subtask
                  </Button>
                )}
                
                <Collapsible open={showComments} onOpenChange={setShowComments}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Comments
                      {showComments ? (
                        <ChevronUp className="w-3 h-3 ml-1" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-1" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
                
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
        
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent className="pt-4 border-t mt-4">
            <TaskComments taskId={task.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}