import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task, Domain, StrategicPillar, Theme, Priority, Status, TaskType } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [strategicPillars, setStrategicPillars] = useState<StrategicPillar[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchDomains(),
        fetchStrategicPillars(),
        fetchThemes(),
        fetchTasks()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDomains = async () => {
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .order('created_date', { ascending: false });

    if (error) throw error;

    const formattedDomains: Domain[] = data.map((domain: any) => ({
      id: domain.id,
      title: domain.title,
      description: domain.description || '',
      createdDate: new Date(domain.created_date),
      workspaceId: domain.workspace_id,
      color: domain.color || '#3b82f6'
    }));

    setDomains(formattedDomains);
  };

  const fetchStrategicPillars = async () => {
    const { data, error } = await supabase
      .from('strategic_pillars')
      .select(`
        *,
        pillar_domains(domain_id)
      `)
      .order('created_date', { ascending: false });

    if (error) throw error;

    const formattedPillars: StrategicPillar[] = data.map(pillar => ({
      id: pillar.id,
      title: pillar.title,
      description: pillar.description || '',
      createdDate: new Date(pillar.created_date),
      targetTimeFrame: pillar.target_timeframe,
      domainIds: pillar.pillar_domains?.map((pd: any) => pd.domain_id) || [],
      workspaceId: pillar.workspace_id,
      color: pillar.color || '#8b5cf6'
    }));

    setStrategicPillars(formattedPillars);
  };

  const fetchThemes = async () => {
    const { data, error } = await supabase
      .from('themes')
      .select(`
        *,
        theme_pillars(pillar_id)
      `)
      .order('created_date', { ascending: false });

    if (error) throw error;

    const formattedThemes: Theme[] = data.map(theme => ({
      id: theme.id,
      title: theme.title,
      description: theme.description || '',
      createdDate: new Date(theme.created_date),
      associatedProject: theme.associated_project || undefined,
      strategicPillarIds: theme.theme_pillars?.map((tp: any) => tp.pillar_id) || [],
      workspaceId: theme.workspace_id,
      color: theme.color || '#06b6d4'
    }));

    setThemes(formattedThemes);
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_themes(theme_id)
      `)
      .order('created_date', { ascending: false });

    if (error) throw error;

    const formattedTasks: Task[] = data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      createdDate: new Date(task.created_date),
      dueDate: task.due_date ? new Date(task.due_date) : undefined,
      prioritizedDate: task.prioritized_date ? new Date(task.prioritized_date) : undefined,
      prioritizedEndDate: task.prioritized_end_date ? new Date(task.prioritized_end_date) : undefined,
      status: task.status as Status,
      priority: task.priority as Priority,
      type: task.type as TaskType,
      parentTaskId: task.parent_task_id || undefined,
      themeIds: task.task_themes?.map((tt: any) => tt.theme_id) || [],
      order: task.task_order,
      prioritizedDays: [],
      workspaceId: task.workspace_id
    }));

    setTasks(formattedTasks);
  };

  const toggleTaskStatus = useCallback(async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newStatus = task.status === 'completed' ? 'open' : 'completed';
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      toast({
        title: "Success",
        description: `Task ${newStatus === 'completed' ? 'completed' : 'reopened'}`
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  }, [tasks, toast]);

  const reopenTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'open' })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: 'open' as Status } : task
        )
      );

      toast({
        title: "Success",
        description: "Task reopened"
      });
    } catch (error) {
      console.error('Error reopening task:', error);
      toast({
        title: "Error", 
        description: "Failed to reopen task",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createTask = useCallback(async (taskData: Omit<Task, "id" | "createdDate" | "status" | "type" | "order">) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: task, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          due_date: taskData.dueDate?.toISOString() || null,
          prioritized_date: taskData.prioritizedDate?.toISOString() || null,
          prioritized_end_date: taskData.prioritizedEndDate?.toISOString() || null,
          priority: taskData.priority,
          type: taskData.parentTaskId ? 'subtask' : 'task',
          parent_task_id: taskData.parentTaskId,
          task_order: Math.max(...tasks.map(t => t.order || 0), 0) + 1,
          user_id: user.user.id,
          workspace_id: taskData.workspaceId
        })
        .select()
        .single();

      if (error) throw error;

      // Insert theme relationships
      if (taskData.themeIds && taskData.themeIds.length > 0) {
        const themeInserts = taskData.themeIds.map(themeId => ({
          task_id: task.id,
          theme_id: themeId
        }));

        const { error: themeError } = await supabase
          .from('task_themes')
          .insert(themeInserts);

        if (themeError) throw themeError;
      }

      await fetchTasks();
      
      toast({
        title: "Success",
        description: "Task created successfully"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
    }
  }, [tasks.length, toast]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updateData: any = {
        title: updates.title,
        description: updates.description,
        priority: updates.priority,
        status: updates.status,
        type: updates.type,
      };

      // Dates and parent: only include if explicitly provided
      if ('dueDate' in updates) {
        updateData.due_date = updates.dueDate ? updates.dueDate.toISOString() : null;
      }
      if ('prioritizedDate' in updates) {
        updateData.prioritized_date = updates.prioritizedDate ? updates.prioritizedDate.toISOString() : null;
      }
      if ('prioritizedEndDate' in updates) {
        updateData.prioritized_end_date = updates.prioritizedEndDate ? updates.prioritizedEndDate.toISOString() : null;
      }
      if ('parentTaskId' in updates) {
        updateData.parent_task_id = updates.parentTaskId ?? null;
      }

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      console.debug('[useTasks.updateTask] taskId:', taskId, 'updates:', updates, 'payload:', updateData);

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Update task-theme relationships if themeIds are provided
      if (updates.themeIds !== undefined) {
        // Delete existing relationships
        await supabase
          .from('task_themes')
          .delete()
          .eq('task_id', taskId);

        // Create new relationships
        if (updates.themeIds.length > 0) {
          const taskThemes = updates.themeIds.map(themeId => ({
            task_id: taskId,
            theme_id: themeId
          }));

          const { error: themeError } = await supabase
            .from('task_themes')
            .insert(taskThemes);

          if (themeError) throw themeError;
        }
      }

      await fetchTasks();

      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createDomain = useCallback(async (domainData: Omit<Domain, "id" | "createdDate">) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('domains')
        .insert({
          title: domainData.title,
          description: domainData.description,
          user_id: user.user.id,
          workspace_id: domainData.workspaceId,
          color: domainData.color
        });

      if (error) throw error;

      await fetchDomains();
      
      toast({
        title: "Success",
        description: "Domain created successfully"
      });
    } catch (error) {
      console.error('Error creating domain:', error);
      toast({
        title: "Error",
        description: "Failed to create domain",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createStrategicPillar = useCallback(async (pillarData: Omit<StrategicPillar, "id" | "createdDate">) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: pillar, error } = await supabase
        .from('strategic_pillars')
        .insert({
          title: pillarData.title,
          description: pillarData.description,
          target_timeframe: pillarData.targetTimeFrame,
          user_id: user.user.id,
          workspace_id: pillarData.workspaceId,
          color: pillarData.color
        })
        .select()
        .single();

      if (error) throw error;

      // Insert domain relationships
      if (pillarData.domainIds.length > 0) {
        const domainInserts = pillarData.domainIds.map(domainId => ({
          pillar_id: pillar.id,
          domain_id: domainId
        }));

        const { error: domainError } = await supabase
          .from('pillar_domains')
          .insert(domainInserts);

        if (domainError) throw domainError;
      }

      await fetchStrategicPillars();
      
      toast({
        title: "Success",
        description: "Strategic pillar created successfully"
      });
    } catch (error) {
      console.error('Error creating strategic pillar:', error);
      toast({
        title: "Error",
        description: "Failed to create strategic pillar",
        variant: "destructive"
      });
    }
  }, [toast]);

  const createTheme = useCallback(async (themeData: Omit<Theme, "id" | "createdDate">) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: theme, error } = await supabase
        .from('themes')
        .insert({
          title: themeData.title,
          description: themeData.description,
          associated_project: themeData.associatedProject,
          user_id: user.user.id,
          workspace_id: themeData.workspaceId,
          color: themeData.color
        })
        .select()
        .single();

      if (error) throw error;

      // Insert pillar relationships
      if (themeData.strategicPillarIds.length > 0) {
        const pillarInserts = themeData.strategicPillarIds.map(pillarId => ({
          theme_id: theme.id,
          pillar_id: pillarId
        }));

        const { error: pillarError } = await supabase
          .from('theme_pillars')
          .insert(pillarInserts);

        if (pillarError) throw pillarError;
      }

      await fetchThemes();
      
      toast({
        title: "Success",
        description: "Theme created successfully"
      });
    } catch (error) {
      console.error('Error creating theme:', error);
      toast({
        title: "Error", 
        description: "Failed to create theme",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Helper function to get effective start date for priority range (priority date or due date)
  const getEffectiveDate = useCallback((task: Task) => {
    return task.prioritizedDate || task.dueDate;
  }, []);

  // Helper function to get effective end date for priority range
  const getEffectiveEndDate = useCallback((task: Task) => {
    return task.prioritizedEndDate || task.prioritizedDate || task.dueDate;
  }, []);

  // Helper function to check if task should appear today based on priority date range
  const isTaskActiveToday = useCallback((task: Task) => {
    // Only show tasks with timing information in time-based views
    if (!task.prioritizedDate && !task.dueDate) return false;
    
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const startDate = getEffectiveDate(task);
    const endDate = getEffectiveEndDate(task);
    
    if (!startDate) return false;
    
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : startDateOnly;
    
    return todayDateOnly >= startDateOnly && todayDateOnly <= endDateOnly;
  }, [getEffectiveDate, getEffectiveEndDate]);

  // Helper function to check if task should appear in a date range
  const isTaskActiveInRange = useCallback((task: Task, rangeStart: Date, rangeEnd: Date) => {
    // Only show tasks with timing information in time-based views
    if (!task.prioritizedDate && !task.dueDate) return false;
    
    const startDate = getEffectiveDate(task);
    const endDate = getEffectiveEndDate(task);
    
    if (!startDate) return false;
    
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) : startDateOnly;
    const rangeStartOnly = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const rangeEndOnly = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    
    // Task is active in range if its date range overlaps with the query range
    return startDateOnly <= rangeEndOnly && endDateOnly >= rangeStartOnly;
  }, [getEffectiveDate, getEffectiveEndDate]);

  // Helper functions for task filtering - only return tasks that actually meet the criteria
  const getTodaysTasks = useCallback(() => {
    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      return isTaskActiveToday(task);
    }).sort((a, b) => {
      // First sort by custom order (if both have order), then by priority
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // Fall back to priority sorting for tasks without custom order
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, isTaskActiveToday]);

  const getTodaysPrioritizedTaskIds = useCallback(() => {
    return new Set(tasks.filter(task => {
      if (task.status === 'completed') return false;
      return isTaskActiveToday(task);
    }).map(task => task.id));
  }, [tasks, isTaskActiveToday]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'completed');
  }, [tasks]);

  const getAllActiveTasks = useCallback(() => {
    return tasks.filter(task => task.status !== 'completed');
  }, [tasks]);

  const getThisWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      return isTaskActiveInRange(task, startOfWeek, endOfWeek);
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, isTaskActiveInRange]);

  const getNextWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfNextWeek = new Date(today);
    startOfNextWeek.setDate(today.getDate() - today.getDay() + 7);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      return isTaskActiveInRange(task, startOfNextWeek, endOfNextWeek);
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, isTaskActiveInRange]);

  const getMonthlyTasks = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return tasks.filter(task => {
      if (task.status === 'completed') return false;
      return isTaskActiveInRange(task, startOfMonth, endOfMonth);
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, isTaskActiveInRange]);

  // Deletion functions
  const deleteDomain = useCallback(async (domainId: string) => {
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) throw error;

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Domain deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting domain:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteStrategicPillar = useCallback(async (pillarId: string) => {
    try {
      const { error } = await supabase
        .from('strategic_pillars')
        .delete()
        .eq('id', pillarId);

      if (error) throw error;

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Strategic pillar deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting strategic pillar:', error);
      toast({
        title: "Error",
        description: "Failed to delete strategic pillar",
        variant: "destructive"
      });
    }
  }, [toast]);

  const deleteTheme = useCallback(async (themeId: string) => {
    try {
      const { error } = await supabase
        .from('themes')
        .delete()
        .eq('id', themeId);

      if (error) throw error;

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Theme deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting theme:', error);
      toast({
        title: "Error",
        description: "Failed to delete theme",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateTaskOrder = useCallback(async (taskOrders: { id: string; order: number }[]) => {
    try {
      // Update each task's order in the database
      const updates = taskOrders.map(({ id, order }) => 
        supabase
          .from('tasks')
          .update({ task_order: order })
          .eq('id', id)
      );

      await Promise.all(updates);

      // Update local state
      setTasks(prevTasks =>
        prevTasks.map(task => {
          const orderUpdate = taskOrders.find(update => update.id === task.id);
          return orderUpdate ? { ...task, order: orderUpdate.order } : task;
        })
      );

      toast({
        title: "Success",
        description: "Task order updated"
      });
    } catch (error) {
      console.error('Error updating task order:', error);
      toast({
        title: "Error",
        description: "Failed to update task order",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateDomain = useCallback(async (domainId: string, updates: Partial<Domain>) => {
    try {
      const { error } = await supabase
        .from('domains')
        .update({
          title: updates.title,
          description: updates.description,
        })
        .eq('id', domainId);

      if (error) throw error;

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Domain updated successfully"
      });
    } catch (error) {
      console.error('Error updating domain:', error);
      toast({
        title: "Error",
        description: "Failed to update domain",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateStrategicPillar = useCallback(async (pillarId: string, updates: Partial<StrategicPillar>) => {
    try {
      const { error } = await supabase
        .from('strategic_pillars')
        .update({
          title: updates.title,
          description: updates.description,
          target_timeframe: updates.targetTimeFrame,
        })
        .eq('id', pillarId);

      if (error) throw error;

      // Update domain relationships if provided
      if (updates.domainIds !== undefined) {
        // Delete existing relationships
        await supabase
          .from('pillar_domains')
          .delete()
          .eq('pillar_id', pillarId);

        // Insert new relationships
        if (updates.domainIds.length > 0) {
          const domainInserts = updates.domainIds.map(domainId => ({
            pillar_id: pillarId,
            domain_id: domainId
          }));

          const { error: domainError } = await supabase
            .from('pillar_domains')
            .insert(domainInserts);

          if (domainError) throw domainError;
        }
      }

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Strategic pillar updated successfully"
      });
    } catch (error) {
      console.error('Error updating strategic pillar:', error);
      toast({
        title: "Error",
        description: "Failed to update strategic pillar",
        variant: "destructive"
      });
    }
  }, [toast]);

  const updateTheme = useCallback(async (themeId: string, updates: Partial<Theme>) => {
    try {
      const { error } = await supabase
        .from('themes')
        .update({
          title: updates.title,
          description: updates.description,
          associated_project: updates.associatedProject,
        })
        .eq('id', themeId);

      if (error) throw error;

      // Update pillar relationships if provided
      if (updates.strategicPillarIds !== undefined) {
        // Delete existing relationships
        await supabase
          .from('theme_pillars')
          .delete()
          .eq('theme_id', themeId);

        // Insert new relationships
        if (updates.strategicPillarIds.length > 0) {
          const pillarInserts = updates.strategicPillarIds.map(pillarId => ({
            theme_id: themeId,
            pillar_id: pillarId
          }));

          const { error: pillarError } = await supabase
            .from('theme_pillars')
            .insert(pillarInserts);

          if (pillarError) throw pillarError;
        }
      }

      await fetchAllData();
      
      toast({
        title: "Success",
        description: "Theme updated successfully"
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    tasks,
    domains,
    strategicPillars,
    themes,
    isLoading,
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
    getTodaysTasks,
    getTodaysPrioritizedTaskIds,
    getThisWeekTasks,
    getNextWeekTasks,
    getMonthlyTasks,
    getCompletedTasks,
    getAllActiveTasks,
    deleteDomain,
    deleteStrategicPillar,
    deleteTheme,
    fetchAllData
  };
}