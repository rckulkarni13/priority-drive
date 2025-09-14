import { Task } from "@/types";
import { TaskCard } from "./task-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TaskGroupProps {
  parentTask: Task;
  subtasks: Task[];
  allTasks: Task[];
  prioritizedTaskIds?: Set<string>; // Tasks that are actually prioritized for current view
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  showIndented?: boolean;
}

export function TaskGroup({
  parentTask,
  subtasks,
  allTasks,
  prioritizedTaskIds = new Set(),
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
  showIndented = false
}: TaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasks = subtasks.filter(task => task.status === 'completed').length;
  const prioritizedSubtasks = subtasks.filter(task => prioritizedTaskIds.has(task.id)).length;
  const isParentPrioritized = prioritizedTaskIds.has(parentTask.id);

  return (
    <div className={cn("space-y-2", showIndented && "ml-6 border-l-2 border-muted pl-4")}>
      {hasSubtasks ? (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className={cn("relative", !isParentPrioritized && "opacity-60")}>
            <TaskCard
              task={parentTask}
              onEdit={onTaskEdit}
              onToggleStatus={onTaskToggleStatus}
              onReopen={onTaskReopen}
              onCreateSubtask={onCreateSubtask}
            />
            
            {/* Task type and subtask indicator */}
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <Badge variant="outline" className={cn("text-xs px-1 py-0", isParentPrioritized && "bg-primary/10 border-primary/30")}>
                Parent Task
              </Badge>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-5 w-5 p-0 hover:bg-muted/50"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <Badge variant="secondary" className="text-xs px-1 py-0">
                {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
                {completedSubtasks > 0 && (
                  <span className="ml-1 text-green-600">
                    ({completedSubtasks} done)
                  </span>
                )}
                {prioritizedSubtasks > 0 && (
                  <span className="ml-1 text-blue-600 font-medium">
                    ({prioritizedSubtasks} prioritized)
                  </span>
                )}
              </Badge>
            </div>
          </div>

          <CollapsibleContent>
            <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
              {subtasks.map(subtask => {
                const isSubtaskPrioritized = prioritizedTaskIds.has(subtask.id);
                return (
                  <div key={subtask.id} className={cn("relative", !isSubtaskPrioritized && "opacity-50")}>
                    <TaskCard
                      task={subtask}
                      onEdit={onTaskEdit}
                      onToggleStatus={onTaskToggleStatus}
                      onReopen={onTaskReopen}
                      onCreateSubtask={onCreateSubtask}
                    />
                    {/* Subtask indicator */}
                    <div className="absolute top-2 left-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs px-1 py-0 bg-muted/30",
                          isSubtaskPrioritized && "bg-primary/10 border-primary/30 font-medium"
                        )}
                      >
                        Subtask {isSubtaskPrioritized && "🎯"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className={cn("relative", !isParentPrioritized && parentTask.type === 'task' && "opacity-60")}>
          <TaskCard
            task={parentTask}
            onEdit={onTaskEdit}
            onToggleStatus={onTaskToggleStatus}
            onReopen={onTaskReopen}
            onCreateSubtask={onCreateSubtask}
          />
          {/* Standalone task indicator */}
          <div className="absolute top-2 left-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-1 py-0",
                (isParentPrioritized || parentTask.type === 'subtask') && "bg-primary/10 border-primary/30"
              )}
            >
              {parentTask.type === 'subtask' ? 'Subtask' : 'Task'}
              {(isParentPrioritized || parentTask.type === 'subtask') && " 🎯"}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

interface OrganizedTaskListProps {
  tasks: Task[];
  allTasks: Task[];
  prioritizedTaskIds?: Set<string>; // Tasks that are actually prioritized for current view
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
}

export function OrganizedTaskList({
  tasks,
  allTasks,
  prioritizedTaskIds = new Set(),
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask
}: OrganizedTaskListProps) {
  // Organize tasks into parent-child groups
  const organizeTasksWithContext = (taskList: Task[]) => {
    const taskMap = new Map(taskList.map(task => [task.id, task]));
    const parentTasks = new Map<string, { parent: Task; children: Task[] }>();
    const orphanedSubtasks: Task[] = [];
    const standaloneTasks: Task[] = [];

    // First pass: identify all parent tasks and their children
    taskList.forEach(task => {
      if (task.type === 'task') {
        if (!parentTasks.has(task.id)) {
          parentTasks.set(task.id, { parent: task, children: [] });
        }
      }
    });

    // Second pass: organize subtasks
    taskList.forEach(task => {
      if (task.type === 'subtask' && task.parentTaskId) {
        const parentGroup = parentTasks.get(task.parentTaskId);
        if (parentGroup) {
          parentGroup.children.push(task);
        } else {
          // Parent not in current task list, but might exist in system
          // Show this subtask with context indication
          orphanedSubtasks.push(task);
        }
      } else if (task.type === 'task') {
        // This is handled in first pass
      } else if (task.type === 'subtask' && !task.parentTaskId) {
        // Orphaned subtask without parent
        standaloneTasks.push(task);
      }
    });

    return {
      parentGroups: Array.from(parentTasks.values()),
      orphanedSubtasks,
      standaloneTasks
    };
  };

  const { parentGroups, orphanedSubtasks, standaloneTasks } = organizeTasksWithContext(tasks);

  return (
    <div className="space-y-3">
      {/* Parent tasks with their subtasks */}
      {parentGroups.map(({ parent, children }) => (
        <TaskGroup
          key={parent.id}
          parentTask={parent}
          subtasks={children}
          allTasks={tasks}
          prioritizedTaskIds={prioritizedTaskIds}
          onTaskEdit={onTaskEdit}
          onTaskToggleStatus={onTaskToggleStatus}
          onTaskReopen={onTaskReopen}
          onCreateSubtask={onCreateSubtask}
        />
      ))}

      {/* Orphaned subtasks - subtasks whose parents are not in current view */}
      {orphanedSubtasks.map(subtask => {
        const isSubtaskPrioritized = prioritizedTaskIds.has(subtask.id);
        const parentTask = allTasks.find(t => t.id === subtask.parentTaskId);
        const parentTitle = parentTask?.title || "Unknown Parent";
        
        return (
          <div key={subtask.id} className={cn("relative", !isSubtaskPrioritized && "opacity-50")}>
            <TaskCard
              task={subtask}
              onEdit={onTaskEdit}
              onToggleStatus={onTaskToggleStatus}
              onReopen={onTaskReopen}
              onCreateSubtask={onCreateSubtask}
            />
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs px-1 py-0 bg-blue-50 border-blue-200",
                  isSubtaskPrioritized && "bg-primary/10 border-primary/30"
                )}
              >
                Subtask {isSubtaskPrioritized && "🎯"}
              </Badge>
              <Badge variant="secondary" className="text-xs px-1 py-0">
                of "{parentTitle}"
              </Badge>
            </div>
          </div>
        );
      })}

      {/* Standalone tasks */}
      {standaloneTasks.map(task => (
        <TaskGroup
          key={task.id}
          parentTask={task}
          subtasks={[]}
          allTasks={tasks}
          prioritizedTaskIds={prioritizedTaskIds}
          onTaskEdit={onTaskEdit}
          onTaskToggleStatus={onTaskToggleStatus}
          onTaskReopen={onTaskReopen}
          onCreateSubtask={onCreateSubtask}
        />
      ))}
    </div>
  );
}