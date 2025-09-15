import { Task, Theme, StrategicPillar, Domain } from "@/types";
import { TaskCard } from "./task-card";
import { OrganizedTaskList } from "./task-group";
import { PriorityTaskRow } from "./priority-task-row";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { format, isSameDay, startOfDay, isBefore } from "date-fns";

interface TaskListProps {
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
  showDateGroups?: boolean;
  emptyMessage?: string;
}

export function TaskList({ 
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
    // For time-based views, show a flat list of priorities
    // Group tasks by their effective date but render as flat list
    const getEffectiveDate = (task: Task): Date | null => {
      return task.prioritizedDate || task.dueDate || null;
    };

    // Sort tasks by date and overdue status
    const today = startOfDay(new Date());
    const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // Show overdue tasks first
      const isOverdueA = isBefore(dateA, today);
      const isOverdueB = isBefore(dateB, today);
      
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;
      
      return dateA.getTime() - dateB.getTime();
    });

    // Group by date sections for headers
    const groupedTasks = sortedTasks.reduce((groups, task) => {
      const date = getEffectiveDate(task);
      let section = 'no-date';
      
      if (date) {
        if (isBefore(date, today)) {
          section = 'overdue';
        } else if (isSameDay(date, today)) {
          section = 'today';
        } else {
          section = 'upcoming';
        }
      }
      
      if (!groups[section]) groups[section] = [];
      groups[section].push(task);
      return groups;
    }, {} as Record<string, Task[]>);

    const getSectionTitle = (section: string) => {
      switch (section) {
        case 'overdue': return 'Overdue';
        case 'today': return 'Today';
        case 'upcoming': return 'Upcoming';
        case 'no-date': return 'No Due Date';
        default: return section;
      }
    };

    const sectionOrder = ['overdue', 'today', 'upcoming', 'no-date'];
    const visibleSections = sectionOrder.filter(section => groupedTasks[section]?.length > 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Badge variant="secondary" className="text-xs">
            {tasks.length} tasks
          </Badge>
        </div>

        {visibleSections.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {emptyMessage}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {visibleSections.map(section => (
              <div key={section} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">{getSectionTitle(section)}</h3>
                  <Badge variant="outline" className="text-xs">
                    {groupedTasks[section].length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {groupedTasks[section].map(task => (
                    <PriorityTaskRow
                      key={task.id}
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
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // For non-date-grouped views (like Today's priorities), use flat priority list
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
            <PriorityTaskRow
              key={task.id}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}