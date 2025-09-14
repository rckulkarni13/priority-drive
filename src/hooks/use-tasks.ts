import { useState, useCallback } from "react";
import { Task, Product, StrategicPillar, Theme, Priority, Status } from "@/types";

// Empty data arrays - ready for your custom data
const mockProducts: Product[] = [];

const mockPillars: StrategicPillar[] = [];

const mockThemes: Theme[] = [];

const mockTasks: Task[] = [];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [strategicPillars, setStrategicPillars] = useState<StrategicPillar[]>(mockPillars);
  const [themes, setThemes] = useState<Theme[]>(mockThemes);

  const toggleTaskStatus = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newStatus: Status = task.status === 'completed' ? 'open' : 'completed';
        return { ...task, status: newStatus };
      }
      return task;
    }));
  }, []);

  const reopenTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, status: 'open' as Status };
      }
      return task;
    }));
  }, []);

  const getTodaysTasks = useCallback(() => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.prioritizedDate) return false;
      
      const startDate = new Date(task.prioritizedDate);
      const endDate = task.prioritizedEndDate ? new Date(task.prioritizedEndDate) : startDate;
      
      // Check if today falls within the priority period
      const todayTime = today.getTime();
      const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
      const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
      
      return (
        todayTime >= startTime &&
        todayTime <= endTime &&
        task.status !== 'completed'
      );
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  const getCompletedTasks = useCallback(() => {
    return tasks.filter(task => task.status === 'completed');
  }, [tasks]);

  const getAllActiveTasks = useCallback(() => {
    return tasks.filter(task => task.status !== 'completed');
  }, [tasks]);

  const getThisWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of current week (Saturday)

    return tasks.filter(task => {
      if (!task.prioritizedDate || task.status === 'completed') return false;
      
      const startDate = new Date(task.prioritizedDate);
      const endDate = task.prioritizedEndDate ? new Date(task.prioritizedEndDate) : startDate;
      
      // Check if any part of the task's priority period overlaps with this week
      return (
        (startDate <= endOfWeek && endDate >= startOfWeek)
      );
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  const getNextWeekTasks = useCallback(() => {
    const today = new Date();
    const startOfNextWeek = new Date(today);
    startOfNextWeek.setDate(today.getDate() - today.getDay() + 7); // Start of next week (Sunday)
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // End of next week (Saturday)

    return tasks.filter(task => {
      if (!task.prioritizedDate || task.status === 'completed') return false;
      
      const startDate = new Date(task.prioritizedDate);
      const endDate = task.prioritizedEndDate ? new Date(task.prioritizedEndDate) : startDate;
      
      // Check if any part of the task's priority period overlaps with next week
      return (
        (startDate <= endOfNextWeek && endDate >= startOfNextWeek)
      );
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  const getMonthlyTasks = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return tasks.filter(task => {
      if (!task.prioritizedDate || task.status === 'completed') return false;
      
      const startDate = new Date(task.prioritizedDate);
      const endDate = task.prioritizedEndDate ? new Date(task.prioritizedEndDate) : startDate;
      
      // Check if any part of the task's priority period overlaps with this month
      return (
        (startDate <= endOfMonth && endDate >= startOfMonth)
      );
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  const createTask = useCallback((taskData: Omit<Task, "id" | "createdDate" | "status" | "type" | "order">) => {
    const newTask: Task = {
      ...taskData,
      id: String(Date.now()),
      createdDate: new Date(),
      status: "open",
      type: "task",
      order: tasks.length + 1,
    };
    setTasks(prev => [...prev, newTask]);
  }, [tasks.length]);

  const createProduct = useCallback((productData: Omit<Product, "id" | "createdDate">) => {
    const newProduct: Product = {
      ...productData,
      id: String(Date.now()),
      createdDate: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  }, []);

  const createStrategicPillar = useCallback((pillarData: Omit<StrategicPillar, "id" | "createdDate">) => {
    const newPillar: StrategicPillar = {
      ...pillarData,
      id: String(Date.now()),
      createdDate: new Date(),
    };
    setStrategicPillars(prev => [...prev, newPillar]);
  }, []);

  const createTheme = useCallback((themeData: Omit<Theme, "id" | "createdDate">) => {
    const newTheme: Theme = {
      ...themeData,
      id: String(Date.now()),
      createdDate: new Date(),
    };
    setThemes(prev => [...prev, newTheme]);
  }, []);

  return {
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
    getTodaysTasks,
    getThisWeekTasks,
    getNextWeekTasks,
    getMonthlyTasks,
    getCompletedTasks,
    getAllActiveTasks,
  };
}