import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { TaskList } from "@/components/task-list";
import { HierarchyView } from "@/components/hierarchy-view";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare2 } from "lucide-react";

type View = 'today' | 'hierarchy' | 'completed' | 'all-tasks';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('today');
  const {
    tasks,
    products,
    strategicPillars,
    themes,
    toggleTaskStatus,
    reopenTask,
    createTask,
    getTodaysTasks,
    getCompletedTasks,
    getAllActiveTasks,
  } = useTasks();

  const todaysTasks = getTodaysTasks();
  const completedTasks = getCompletedTasks();
  const allActiveTasks = getAllActiveTasks();

  const renderContent = () => {
    switch (currentView) {
      case 'today':
        return (
          <TaskList
            title="Today's Priorities"
            tasks={todaysTasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            showDateGroups={false}
            emptyMessage="No tasks prioritized for today. Add some priorities to get started!"
          />
        );
      
      case 'hierarchy':
        return (
          <HierarchyView
            products={products}
            strategicPillars={strategicPillars}
            themes={themes}
            tasks={tasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
          />
        );
      
      case 'completed':
        return (
          <TaskList
            title="Completed Tasks"
            tasks={completedTasks}
            onTaskReopen={reopenTask}
            emptyMessage="No completed tasks yet. Complete some tasks to see them here!"
          />
        );
      
      case 'all-tasks':
        return (
          <TaskList
            title="All Active Tasks"
            tasks={allActiveTasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            showDateGroups={true}
            emptyMessage="No active tasks found."
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <CheckSquare2 className="w-8 h-8 text-primary" />
                Task Manager
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize your work with strategic precision
              </p>
            </div>
            
            <TaskFormDialog themes={themes} onTaskCreate={createTask}>
              <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-4 h-4" />
                New Task
              </Button>
            </TaskFormDialog>
          </div>

          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            todayTasksCount={todaysTasks.length}
            completedTasksCount={completedTasks.length}
            allTasksCount={allActiveTasks.length}
          />
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Index;
