import { Task } from "@/types";
import { TaskCard } from "./task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface TaskListProps {
  title: string;
  tasks: Task[];
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  showDateGroups?: boolean;
  emptyMessage?: string;
}

export function TaskList({ 
  title, 
  tasks, 
  onTaskEdit, 
  onTaskToggleStatus, 
  onTaskReopen,
  showDateGroups = false,
  emptyMessage = "No tasks found"
}: TaskListProps) {
  if (showDateGroups) {
    // Group tasks by prioritized date
    const groupedTasks = tasks.reduce((groups, task) => {
      const dateKey = task.prioritizedDate 
        ? format(task.prioritizedDate, 'yyyy-MM-dd')
        : 'no-date';
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
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
                    <div className="space-y-2">
                      {dateTasks.map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onEdit={onTaskEdit}
                          onToggleStatus={onTaskToggleStatus}
                          onReopen={onTaskReopen}
                        />
                      ))}
                    </div>
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
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onToggleStatus={onTaskToggleStatus}
              onReopen={onTaskReopen}
            />
          ))}
        </div>
      )}
    </div>
  );
}