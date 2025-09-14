import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { TaskList } from "@/components/task-list";
import { HierarchyView } from "@/components/hierarchy-view";
import { ManageView } from "@/components/manage-view";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { ProductFormDialog } from "@/components/product-form-dialog";
import { PillarFormDialog } from "@/components/pillar-form-dialog";
import { ThemeFormDialog } from "@/components/theme-form-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare2, Package, Target, Lightbulb } from "lucide-react";

type View = 'today' | 'this-week' | 'next-week' | 'monthly' | 'hierarchy' | 'completed' | 'all-tasks' | 'manage';

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
    createProduct,
    createStrategicPillar,
    createTheme,
    deleteProduct,
    deleteStrategicPillar,
    deleteTheme,
    getTodaysTasks,
    getThisWeekTasks,
    getNextWeekTasks,
    getMonthlyTasks,
    getCompletedTasks,
    getAllActiveTasks,
  } = useTasks();

  const todaysTasks = getTodaysTasks();
  const thisWeekTasks = getThisWeekTasks();
  const nextWeekTasks = getNextWeekTasks();
  const monthlyTasks = getMonthlyTasks();
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

      case 'this-week':
        return (
          <TaskList
            title="This Week's Priorities"
            tasks={thisWeekTasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            showDateGroups={true}
            emptyMessage="No tasks prioritized for this week."
          />
        );

      case 'next-week':
        return (
          <TaskList
            title="Next Week's Priorities"
            tasks={nextWeekTasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            showDateGroups={true}
            emptyMessage="No tasks prioritized for next week."
          />
        );

      case 'monthly':
        return (
          <TaskList
            title="This Month's Priorities"
            tasks={monthlyTasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            showDateGroups={true}
            emptyMessage="No tasks prioritized for this month."
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
            onProductDelete={deleteProduct}
            onPillarDelete={deleteStrategicPillar}
            onThemeDelete={deleteTheme}
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
      
      case 'manage':
        return (
          <ManageView
            products={products}
            strategicPillars={strategicPillars}
            themes={themes}
            onProductDelete={deleteProduct}
            onPillarDelete={deleteStrategicPillar}
            onThemeDelete={deleteTheme}
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
            
            <div className="flex gap-2">
              <ProductFormDialog onProductCreate={createProduct}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Package className="w-4 h-4" />
                  Product
                </Button>
              </ProductFormDialog>
              
              <PillarFormDialog products={products} onPillarCreate={createStrategicPillar}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Target className="w-4 h-4" />
                  Pillar
                </Button>
              </PillarFormDialog>
              
              <ThemeFormDialog strategicPillars={strategicPillars} onThemeCreate={createTheme}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Lightbulb className="w-4 h-4" />
                  Theme
                </Button>
              </ThemeFormDialog>
              
              <TaskFormDialog themes={themes} tasks={tasks} onTaskCreate={createTask}>
                <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="w-4 h-4" />
                  New Task
                </Button>
              </TaskFormDialog>
            </div>
          </div>

          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            todayTasksCount={todaysTasks.length}
            thisWeekTasksCount={thisWeekTasks.length}
            nextWeekTasksCount={nextWeekTasks.length}
            monthlyTasksCount={monthlyTasks.length}
            completedTasksCount={completedTasks.length}
            allTasksCount={allActiveTasks.length}
            productsCount={products.length}
            pillarsCount={strategicPillars.length}
            themesCount={themes.length}
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
