import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/navigation";
import { TaskList } from "@/components/task-list";
import { HierarchyView } from "@/components/hierarchy-view";
import { ManageView } from "@/components/manage-view";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { DomainFormDialog } from "@/components/domain-form-dialog";
import { PillarFormDialog } from "@/components/pillar-form-dialog";
import { ThemeFormDialog } from "@/components/theme-form-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare2, Package, Target, Lightbulb, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type View = 'today' | 'this-week' | 'next-week' | 'monthly' | 'hierarchy' | 'completed' | 'all-tasks' | 'manage';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('today');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    tasks,
    domains,
    strategicPillars,
    themes,
    toggleTaskStatus,
    reopenTask,
    createTask,
    createDomain,
    createStrategicPillar,
    createTheme,
    deleteDomain,
    deleteStrategicPillar,
    deleteTheme,
    getTodaysTasks,
    getThisWeekTasks,
    getNextWeekTasks,
    getMonthlyTasks,
    getCompletedTasks,
    getAllActiveTasks,
  } = useTasks();

  useEffect(() => {
    // Check initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
      if (!user) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

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
            domains={domains}
            strategicPillars={strategicPillars}
            themes={themes}
            tasks={tasks}
            onTaskToggleStatus={toggleTaskStatus}
            onTaskReopen={reopenTask}
            onDomainDelete={deleteDomain}
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
            domains={domains}
            strategicPillars={strategicPillars}
            themes={themes}
            onDomainDelete={deleteDomain}
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
              <DomainFormDialog onDomainCreate={createDomain}>
                <Button variant="outline" size="sm" className="gap-1">
                  <Package className="w-4 h-4" />
                  Domain
                </Button>
              </DomainFormDialog>
              
              <PillarFormDialog domains={domains} onPillarCreate={createStrategicPillar}>
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

              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-1"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
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
            domainsCount={domains.length}
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