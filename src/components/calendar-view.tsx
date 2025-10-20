import { useState } from "react";
import { Task, Theme, StrategicPillar, Domain, WorkspaceType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus } from "lucide-react";
import { PriorityTaskRow } from "./priority-task-row";
import { QuickCreateMenu } from "./quick-create-menu";
import { format, isSameDay, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  tasks: Task[];
  allTasks: Task[];
  themes: Theme[];
  strategicPillars: StrategicPillar[];
  domains: Domain[];
  workspaceId: string;
  workspaceType: WorkspaceType;
  onTaskEdit?: (task: Task) => void;
  onTaskToggleStatus?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;
  onCreateSubtask?: (parentTaskId: string) => void;
  onTaskCreate: (taskData: any) => void;
  onThemeCreate: (themeData: any) => void;
  onPillarCreate: (pillarData: any) => void;
  onDomainCreate: (domainData: any) => void;
}

export function CalendarView({
  tasks,
  allTasks,
  themes,
  strategicPillars,
  domains,
  workspaceId,
  workspaceType,
  onTaskEdit,
  onTaskToggleStatus,
  onTaskReopen,
  onCreateSubtask,
  onTaskCreate,
  onThemeCreate,
  onPillarCreate,
  onDomainCreate,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStart = startOfDay(date);
    return tasks.filter((task) => {
      const dueDate = task.dueDate ? startOfDay(new Date(task.dueDate)) : null;
      const prioritizedDate = task.prioritizedDate ? startOfDay(new Date(task.prioritizedDate)) : null;
      const prioritizedEndDate = task.prioritizedEndDate ? startOfDay(new Date(task.prioritizedEndDate)) : null;

      // Check if task is due on this date
      if (dueDate && isSameDay(dueDate, dateStart)) {
        return true;
      }

      // Check if task is prioritized for this date
      if (prioritizedDate && isSameDay(prioritizedDate, dateStart)) {
        return true;
      }

      // Check if this date falls within prioritized date range
      if (prioritizedDate && prioritizedEndDate) {
        return dateStart >= prioritizedDate && dateStart <= prioritizedEndDate;
      }

      return false;
    });
  };

  // Get dates that have tasks
  const getDatesWithTasks = () => {
    const dates = new Set<string>();
    tasks.forEach((task) => {
      if (task.dueDate) {
        dates.add(format(startOfDay(new Date(task.dueDate)), 'yyyy-MM-dd'));
      }
      if (task.prioritizedDate) {
        const start = startOfDay(new Date(task.prioritizedDate));
        const end = task.prioritizedEndDate ? startOfDay(new Date(task.prioritizedEndDate)) : start;
        
        let current = start;
        while (current <= end) {
          dates.add(format(current, 'yyyy-MM-dd'));
          current = new Date(current);
          current.setDate(current.getDate() + 1);
        }
      }
    });
    return dates;
  };

  const datesWithTasks = getDatesWithTasks();
  const selectedDateTasks = getTasksForDate(selectedDate);

  // Custom day content to show indicators for tasks
  const modifiers = {
    hasTasks: (date: Date) => datesWithTasks.has(format(startOfDay(date), 'yyyy-MM-dd'))
  };

  const modifiersStyles = {
    hasTasks: {
      fontWeight: 'bold',
      position: 'relative' as const,
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Calendar View
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className={cn("rounded-md border pointer-events-auto")}
              components={{
                DayContent: ({ date }) => {
                  const hasTask = datesWithTasks.has(format(startOfDay(date), 'yyyy-MM-dd'));
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <span>{format(date, 'd')}</span>
                      {hasTask && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </div>
                  );
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Tasks for selected date */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(selectedDate, 'MMMM d, yyyy')}
                <Badge variant="secondary" className="ml-2">
                  {selectedDateTasks.length} {selectedDateTasks.length === 1 ? 'task' : 'tasks'}
                </Badge>
              </CardTitle>
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
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {selectedDateTasks.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No tasks for this date</p>
                  <p className="text-sm mt-2">Use the + button above to create items</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-2">
                      <PriorityTaskRow
                        task={task}
                        allTasks={allTasks}
                        onTaskEdit={onTaskEdit}
                        onTaskToggleStatus={onTaskToggleStatus}
                        onTaskReopen={onTaskReopen}
                        onCreateSubtask={onCreateSubtask}
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
