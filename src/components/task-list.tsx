import { Task } from "@/types";
import { TaskCard } from "./task-card";
import { OrganizedTaskList } from "./task-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface TaskListProps {
  title: string;
  tasks: Task[];
  allTasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  showDateGroups?: boolean;
  emptyMessage?: string;
}

export function TaskList({ 
  title, 
  tasks,
  allTasks,
  onTaskEdit, 
  onTaskToggleStatus, 
  onTaskReopen,
  onCreateSubtask,
  showDateGroups = false,
  emptyMessage = "No tasks found"
}: TaskListProps) {
  // For time-based views, we need to know which tasks are actually prioritized for this period
  // vs tasks included for context (like parent tasks)
  const getPrioritizedTaskIds = () => {
    if (!showDateGroups) {
      // For non-time-based views like "All Tasks", all tasks are equally relevant
      return new Set(tasks.map(task => task.id));
    }
    
    // For time-based views, only show tasks with prioritized dates in the current period as "prioritized"
    return new Set(
      tasks.filter(task => task.prioritizedDate).map(task => task.id)
    );
  };

  const prioritizedTaskIds = getPrioritizedTaskIds();

  if (showDateGroups) {
    // Group tasks by effective grouping date:
    // - Use prioritizedDate when present
    // - For parent tasks without prioritizedDate, use the earliest effective date of its visible subtasks
    // - Otherwise, fall back to dueDate
    const getGroupingDate = (task: Task): Date | null => {
      if (task.prioritizedDate) return task.prioritizedDate;
      if (task.type === 'task') {
        const children = tasks.filter(t => t.parentTaskId === task.id);
        const childDates = children
          .map(c => c.prioritizedDate || c.dueDate)
          .filter(Boolean) as Date[];
        if (childDates.length) {
          return new Date(Math.min(...childDates.map(d => d.getTime())));
        }
      }
      return task.dueDate || null;
    };

    const groupedTasks = tasks.reduce((groups, task) => {
      const date = getGroupingDate(task);
      const dateKey = date ? format(date, 'yyyy-MM-dd') : 'no-date';
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(task);
      return groups;
    }, {} as Record<string, Task[]>);

    const sortedDateKeys = Object.keys(groupedTasks).sort();

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant="secondary" className="text-xs">
            {tasks.length} tasks
          </Badge>
        </div>

        {sortedDateKeys.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedDateKeys.map(dateKey => {
              const dateTasks = groupedTasks[dateKey];
              const isToday = dateKey !== 'no-date' && isSameDay(new Date(dateKey), new Date());
              
              return (
                <Card key={dateKey} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarDays className="w-4 h-4" />
                      {dateKey === 'no-date' ? (
                        'No Priority Date'
                      ) : (
                        <>
                          {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                          {isToday && (
                            <Badge variant="default" className="ml-2">Today</Badge>
                          )}
                        </>
                      )}
                      <Badge variant="outline" className="ml-auto">
                        {dateTasks.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <OrganizedTaskList
                      tasks={dateTasks}
                      allTasks={allTasks}
                      prioritizedTaskIds={prioritizedTaskIds}
                      onTaskEdit={onTaskEdit}
                      onTaskToggleStatus={onTaskToggleStatus}
                      onTaskReopen={onTaskReopen}
                      onCreateSubtask={onCreateSubtask}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
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
        <OrganizedTaskList
          tasks={tasks}
          allTasks={allTasks}
          prioritizedTaskIds={prioritizedTaskIds}
          onTaskEdit={onTaskEdit}
          onTaskToggleStatus={onTaskToggleStatus}
          onTaskReopen={onTaskReopen}
          onCreateSubtask={onCreateSubtask}
        />
      )}
    </div>
  );
}