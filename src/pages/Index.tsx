import { useState, useEffect, useMemo } from "react";
import { Task, Theme, StrategicPillar, Domain } from "@/types";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/navigation";
import { TaskList } from "@/components/task-list";
import { SortableTaskList } from "@/components/sortable-task-list";
import { HierarchyView } from "@/components/hierarchy-view";
import { CalendarWeekView } from "@/components/calendar-week-view";
import { ManageView } from "@/components/manage-view";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import { TaskDetailDialog } from "@/components/task-detail-dialog";
import { ThemeDetailDialog } from "@/components/theme-detail-dialog";
import { PillarDetailDialog } from "@/components/pillar-detail-dialog";
import { DomainDetailDialog } from "@/components/domain-detail-dialog";
import { ControlledSubtaskDialog } from "@/components/controlled-subtask-dialog";
import { ControlledTaskDialog } from "@/components/controlled-task-dialog";
import { ControlledThemeDialog } from "@/components/controlled-theme-dialog";
import { ControlledPillarDialog } from "@/components/controlled-pillar-dialog";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { Button } from "@/components/ui/button";
import { QuickCreateMenu } from "@/components/quick-create-menu";
import { Plus, CheckSquare2, Package, Target, Lightbulb, LogOut } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type View = 'today' | 'calendar' | 'hierarchy' | 'completed' | 'all-tasks' | 'manage';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('today');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [viewingTheme, setViewingTheme] = useState<Theme | null>(null);
  const [viewingPillar, setViewingPillar] = useState<StrategicPillar | null>(null);
  const [viewingDomain, setViewingDomain] = useState<Domain | null>(null);
  const [navigationStack, setNavigationStack] = useState<Array<{type: 'task' | 'theme' | 'pillar' | 'domain', data: any}>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSubtask, setShowCreateSubtask] = useState<string>('');
  const [showCreateTask, setShowCreateTask] = useState<string>('');
  const [showCreateTheme, setShowCreateTheme] = useState<string>('');
  const [showCreatePillar, setShowCreatePillar] = useState<string>('');
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
    updateTask,
    updateTaskOrder,
    createDomain,
    updateDomain,
    createStrategicPillar,
    updateStrategicPillar,
    createTheme,
    updateTheme,
    deleteDomain,
    deleteStrategicPillar,
    deleteTheme,
    getTodaysTasks,
    getTodaysPrioritizedTaskIds,
    getThisWeekTasks,
    getNextWeekTasks,
    getMonthlyTasks,
    getCompletedTasks,
    getAllActiveTasks,
  } = useTasks();

  const { workspaces, currentWorkspace, switchWorkspace, isLoading: workspacesLoading } = useWorkspaces();


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

  // Separate effect to check onboarding after workspaces are loaded
  useEffect(() => {
    if (user && !loading && !workspacesLoading) {
      if (workspaces.length === 0) {
        navigate("/onboarding");
      }
    }
  }, [user, loading, workspacesLoading, workspaces.length, navigate]);


  // Filter data by current workspace
  const filteredDomains = useMemo(
    () => currentWorkspace ? domains.filter(d => d.workspaceId === currentWorkspace.id) : [],
    [domains, currentWorkspace]
  );
  
  const filteredPillars = useMemo(
    () => currentWorkspace ? strategicPillars.filter(p => p.workspaceId === currentWorkspace.id) : [],
    [strategicPillars, currentWorkspace]
  );
  
  const filteredThemes = useMemo(
    () => currentWorkspace ? themes.filter(t => t.workspaceId === currentWorkspace.id) : [],
    [themes, currentWorkspace]
  );
  
  const filteredTasks = useMemo(
    () => currentWorkspace ? tasks.filter(t => t.workspaceId === currentWorkspace.id) : [],
    [tasks, currentWorkspace]
  );

  // Filter tasks by workspace for display
  const todaysTasks = useMemo(() => 
    getTodaysTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getTodaysTasks, currentWorkspace]
  );
  const thisWeekTasks = useMemo(() => 
    getThisWeekTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getThisWeekTasks, currentWorkspace]
  );
  const nextWeekTasks = useMemo(() => 
    getNextWeekTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getNextWeekTasks, currentWorkspace]
  );
  const monthlyTasks = useMemo(() => 
    getMonthlyTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getMonthlyTasks, currentWorkspace]
  );
  const completedTasks = useMemo(() => 
    getCompletedTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getCompletedTasks, currentWorkspace]
  );
  const allActiveTasks = useMemo(() => 
    getAllActiveTasks().filter(t => !currentWorkspace || t.workspaceId === currentWorkspace.id),
    [getAllActiveTasks, currentWorkspace]
  );
  const todaysPrioritizedIds = getTodaysPrioritizedTaskIds();

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


  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  const handleCreateSubtask = (parentTaskId: string) => {
    if (showCreateSubtask !== '') {
      setShowCreateSubtask('');
      setTimeout(() => setShowCreateSubtask(parentTaskId), 0);
    } else {
      setShowCreateSubtask(parentTaskId);
    }
  };

  const handleCreateTask = (themeId?: string, date?: Date) => {
    // Store the date if provided for use in the task creation dialog
    if (date) {
      // We'll pass this through showCreateTask state
      setShowCreateTask(`${themeId || 'new-task'}|${date.toISOString()}`);
    } else {
      setShowCreateTask(themeId || 'new-task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleCloseEditDialog = () => {
    setEditingTask(null);
  };

  const handleCreateTheme = (pillarId?: string) => {
    setShowCreateTheme(pillarId || 'new-theme');
  };

  const handleCreatePillar = (domainId?: string) => {
    setShowCreatePillar(domainId || 'new-pillar');
  };

  const handleTaskView = (task: Task) => {
    if (viewingTask) {
      setNavigationStack(prev => [...prev, { type: 'task', data: viewingTask }]);
    }
    setViewingTask(task);
    setViewingTheme(null);
    setViewingPillar(null);
    setViewingDomain(null);
  };

  const handleThemeView = (theme: Theme) => {
    if (viewingTask) {
      setNavigationStack(prev => [...prev, { type: 'task', data: viewingTask }]);
    } else if (viewingTheme) {
      setNavigationStack(prev => [...prev, { type: 'theme', data: viewingTheme }]);
    } else if (viewingPillar) {
      setNavigationStack(prev => [...prev, { type: 'pillar', data: viewingPillar }]);
    } else if (viewingDomain) {
      setNavigationStack(prev => [...prev, { type: 'domain', data: viewingDomain }]);
    }
    setViewingTheme(theme);
    setViewingTask(null);
    setViewingPillar(null);
    setViewingDomain(null);
  };

  const handlePillarView = (pillar: StrategicPillar) => {
    if (viewingTask) {
      setNavigationStack(prev => [...prev, { type: 'task', data: viewingTask }]);
    } else if (viewingTheme) {
      setNavigationStack(prev => [...prev, { type: 'theme', data: viewingTheme }]);
    } else if (viewingPillar) {
      setNavigationStack(prev => [...prev, { type: 'pillar', data: viewingPillar }]);
    } else if (viewingDomain) {
      setNavigationStack(prev => [...prev, { type: 'domain', data: viewingDomain }]);
    }
    setViewingPillar(pillar);
    setViewingTask(null);
    setViewingTheme(null);
    setViewingDomain(null);
  };

  const handleDomainView = (domain: Domain) => {
    if (viewingTask) {
      setNavigationStack(prev => [...prev, { type: 'task', data: viewingTask }]);
    } else if (viewingTheme) {
      setNavigationStack(prev => [...prev, { type: 'theme', data: viewingTheme }]);
    } else if (viewingPillar) {
      setNavigationStack(prev => [...prev, { type: 'pillar', data: viewingPillar }]);
    } else if (viewingDomain) {
      setNavigationStack(prev => [...prev, { type: 'domain', data: viewingDomain }]);
    }
    setViewingDomain(domain);
    setViewingTask(null);
    setViewingTheme(null);
    setViewingPillar(null);
  };

  const handleBack = () => {
    const lastItem = navigationStack[navigationStack.length - 1];
    if (lastItem) {
      setNavigationStack(prev => prev.slice(0, -1));
      if (lastItem.type === 'task') {
        setViewingTask(lastItem.data);
        setViewingTheme(null);
        setViewingPillar(null);
        setViewingDomain(null);
      } else if (lastItem.type === 'theme') {
        setViewingTheme(lastItem.data);
        setViewingTask(null);
        setViewingPillar(null);
        setViewingDomain(null);
      } else if (lastItem.type === 'pillar') {
        setViewingPillar(lastItem.data);
        setViewingTask(null);
        setViewingTheme(null);
        setViewingDomain(null);
      } else if (lastItem.type === 'domain') {
        setViewingDomain(lastItem.data);
        setViewingTask(null);
        setViewingTheme(null);
        setViewingPillar(null);
      }
    }
  };

  const handleCloseAllDialogs = () => {
    setViewingTask(null);
    setViewingTheme(null);
    setViewingPillar(null);
    setViewingDomain(null);
    setNavigationStack([]);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'today':
        return (
            <SortableTaskList
              title="Today's Priorities"
              tasks={todaysTasks}
              allTasks={filteredTasks}
              themes={filteredThemes}
              strategicPillars={filteredPillars}
              domains={filteredDomains}
              onTaskEdit={handleTaskView}
              onTaskToggleStatus={toggleTaskStatus}
              onTaskReopen={reopenTask}
              onCreateSubtask={handleCreateSubtask}
              onTaskReorder={updateTaskOrder}
              emptyMessage="No tasks prioritized for today. Add some priorities to get started!"
            />
        );

      case 'calendar':
        return (
          <CalendarWeekView
            tasks={filteredTasks}
            allTasks={filteredTasks}
            themes={filteredThemes}
            strategicPillars={filteredPillars}
            domains={filteredDomains}
            workspaceId={currentWorkspace?.id || ''}
            workspaceType={currentWorkspace?.type || 'work'}
            onTaskClick={handleTaskView}
            onTaskCreate={createTask}
            onThemeCreate={createTheme}
            onPillarCreate={createStrategicPillar}
            onDomainCreate={createDomain}
            onTaskUpdate={updateTask}
          />
        );
      
      case 'hierarchy':
        return (
            <HierarchyView
              domains={domains}
              strategicPillars={strategicPillars}
              themes={themes}
              tasks={tasks}
              workspaceType={currentWorkspace?.type || 'work'}
              onTaskEdit={handleTaskView}
              onTaskToggleStatus={toggleTaskStatus}
              onTaskReopen={reopenTask}
              onCreateSubtask={handleCreateSubtask}
              onCreateTask={handleCreateTask}
              onThemeView={handleThemeView}
              onPillarView={handlePillarView}
              onDomainView={handleDomainView}
              onCreateTheme={handleCreateTheme}
              onCreatePillar={handleCreatePillar}
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
              allTasks={filteredTasks}
              themes={filteredThemes}
              strategicPillars={filteredPillars}
              domains={filteredDomains}
              onTaskEdit={handleTaskView}
              onTaskReopen={reopenTask}
              onCreateSubtask={handleCreateSubtask}
              emptyMessage="No completed tasks yet. Complete some tasks to see them here!"
            />
        );
      
      case 'all-tasks':
        return (
            <TaskList
              title="All Active Tasks"
              tasks={allActiveTasks}
              allTasks={filteredTasks}
              themes={filteredThemes}
              strategicPillars={filteredPillars}
              domains={filteredDomains}
              onTaskEdit={handleTaskView}
              onTaskToggleStatus={toggleTaskStatus}
              onTaskReopen={reopenTask}
              onCreateSubtask={handleCreateSubtask}
              showDateGroups={true}
              emptyMessage="No active tasks found."
            />
        );
      
      case 'manage':
        return (
          <ManageView
            domains={filteredDomains}
            strategicPillars={filteredPillars}
            themes={filteredThemes}
            workspaceType={currentWorkspace?.type || 'work'}
            onDomainDelete={deleteDomain}
            onPillarDelete={deleteStrategicPillar}
            onThemeDelete={deleteTheme}
            onDomainUpdate={updateDomain}
            onPillarUpdate={updateStrategicPillar}
            onThemeUpdate={updateTheme}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
                  <CheckSquare2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  Task Manager
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
                  Organize your work with strategic precision
                </p>
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="gap-1 sm:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground whitespace-nowrap">Workspace:</span>
                <WorkspaceSwitcher
                  workspaces={workspaces}
                  currentWorkspace={currentWorkspace}
                  onWorkspaceChange={switchWorkspace}
                />
              </div>
              
              <div className="flex items-center gap-2">
                {currentWorkspace && (
                  <QuickCreateMenu
                    themes={filteredThemes}
                    tasks={filteredTasks}
                    strategicPillars={filteredPillars}
                    domains={filteredDomains}
                    onTaskCreate={createTask}
                    onThemeCreate={createTheme}
                    onPillarCreate={createStrategicPillar}
                    onDomainCreate={createDomain}
                    workspaceId={currentWorkspace.id}
                    workspaceType={currentWorkspace.type}
                  />
                )}
                
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="gap-1 hidden sm:flex"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          <Navigation
            currentView={currentView}
            onViewChange={setCurrentView}
            todayTasksCount={todaysTasks.length}
            completedTasksCount={completedTasks.length}
            allTasksCount={allActiveTasks.length}
            domainsCount={filteredDomains.length}
            pillarsCount={filteredPillars.length}
            themesCount={filteredThemes.length}
          />
        </div>

        {/* Main Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>

      {/* Task Detail Dialog */}
      {currentWorkspace && (
        <TaskDetailDialog
          task={viewingTask}
          themes={filteredThemes}
          tasks={filteredTasks}
          onTaskUpdate={updateTask}
          onTaskCreate={createTask}
          onClose={handleCloseAllDialogs}
          onBack={navigationStack.length > 0 ? handleBack : undefined}
          onTaskView={handleTaskView}
          onThemeView={handleThemeView}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Theme Detail Dialog */}
      <ThemeDetailDialog
        theme={viewingTheme}
        strategicPillars={strategicPillars}
        tasks={tasks}
        onThemeUpdate={updateTheme}
        onClose={handleCloseAllDialogs}
        onBack={navigationStack.length > 0 ? handleBack : undefined}
        onTaskView={handleTaskView}
        onPillarView={handlePillarView}
      />

      {/* Pillar Detail Dialog */}
      <PillarDetailDialog
        pillar={viewingPillar}
        domains={domains}
        themes={themes}
        onPillarUpdate={updateStrategicPillar}
        onClose={handleCloseAllDialogs}
        onBack={navigationStack.length > 0 ? handleBack : undefined}
        onThemeView={handleThemeView}
        onDomainView={handleDomainView}
      />

      {/* Domain Detail Dialog */}
      <DomainDetailDialog
        domain={viewingDomain}
        strategicPillars={strategicPillars}
        onDomainUpdate={updateDomain}
        onClose={handleCloseAllDialogs}
        onBack={navigationStack.length > 0 ? handleBack : undefined}
        onPillarView={handlePillarView}
      />

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTask}
        themes={themes}
        tasks={tasks}
        onTaskUpdate={updateTask}
        onClose={handleCloseEditDialog}
      />

      {/* Create Subtask Dialog */}
      {currentWorkspace && (
        <ControlledSubtaskDialog
          isOpen={!!showCreateSubtask && showCreateSubtask !== ''}
          parentTaskId={showCreateSubtask}
          themes={filteredThemes}
          tasks={filteredTasks}
          onTaskCreate={createTask}
          onClose={() => setShowCreateSubtask('')}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Create Task Dialog */}
      {currentWorkspace && (
        <ControlledTaskDialog
          isOpen={!!showCreateTask && showCreateTask !== ''}
          themes={filteredThemes}
          tasks={filteredTasks}
          onTaskCreate={createTask}
          onClose={() => setShowCreateTask('')}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Create Theme Dialog */}
      {currentWorkspace && (
        <ControlledThemeDialog
          isOpen={!!showCreateTheme && showCreateTheme !== ''}
          strategicPillars={filteredPillars}
          onThemeCreate={createTheme}
          onClose={() => setShowCreateTheme('')}
          workspaceId={currentWorkspace.id}
        />
      )}

      {/* Create Pillar Dialog */}
      {currentWorkspace && (
        <ControlledPillarDialog
          isOpen={!!showCreatePillar && showCreatePillar !== ''}
          domains={filteredDomains}
          onPillarCreate={createStrategicPillar}
          onClose={() => setShowCreatePillar('')}
          workspaceId={currentWorkspace.id}
        />
      )}
    </div>
  );
};

export default Index;