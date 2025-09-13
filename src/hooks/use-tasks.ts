import { useState, useCallback } from "react";
import { Task, Product, StrategicPillar, Theme, Priority, Status } from "@/types";

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: "1",
    title: "Task Management App",
    description: "A comprehensive task management application for productivity",
    createdDate: new Date("2024-01-01"),
  },
];

const mockPillars: StrategicPillar[] = [
  {
    id: "1",
    title: "Core Features",
    description: "Essential functionality for task management",
    createdDate: new Date("2024-01-02"),
    targetTimeFrame: "Q1 2024",
    productIds: ["1"],
  },
  {
    id: "2",
    title: "User Experience",
    description: "Optimizing user interface and interactions",
    createdDate: new Date("2024-01-03"),
    targetTimeFrame: "Q2 2024",
    productIds: ["1"],
  },
];

const mockThemes: Theme[] = [
  {
    id: "1",
    title: "Task Creation & Management",
    description: "Core task CRUD operations",
    createdDate: new Date("2024-01-04"),
    strategicPillarIds: ["1"],
  },
  {
    id: "2",
    title: "Hierarchy & Organization",
    description: "Product-pillar-theme-task structure",
    createdDate: new Date("2024-01-05"),
    strategicPillarIds: ["1"],
  },
  {
    id: "3",
    title: "Visual Design",
    description: "Beautiful and intuitive user interface",
    createdDate: new Date("2024-01-06"),
    strategicPillarIds: ["2"],
  },
];

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement task creation form",
    description: "Build a comprehensive form for creating new tasks with all required fields",
    createdDate: new Date("2024-01-10"),
    dueDate: new Date("2024-01-20"),
    prioritizedDate: new Date(),
    status: "open",
    priority: "high",
    type: "task",
    themeIds: ["1"],
    order: 1,
  },
  {
    id: "2",
    title: "Design task card component",
    description: "Create reusable task card with priority indicators and status badges",
    createdDate: new Date("2024-01-11"),
    dueDate: new Date("2024-01-18"),
    prioritizedDate: new Date(),
    status: "completed",
    priority: "medium",
    type: "task",
    themeIds: ["3"],
    order: 2,
  },
  {
    id: "3",
    title: "Add drag and drop functionality",
    description: "Implement drag and drop for task reordering",
    createdDate: new Date("2024-01-12"),
    dueDate: new Date("2024-01-25"),
    prioritizedDate: new Date(Date.now() + 86400000), // Tomorrow
    status: "open",
    priority: "critical",
    type: "task",
    themeIds: ["2"],
    order: 3,
  },
  {
    id: "4",
    title: "Add form validation",
    description: "Validate all form inputs before submission",
    createdDate: new Date("2024-01-13"),
    dueDate: new Date("2024-01-22"),
    status: "open",
    priority: "low",
    type: "subtask",
    parentTaskId: "1",
    themeIds: ["1"],
    order: 4,
  },
  {
    id: "5",
    title: "Implement hierarchy view",
    description: "Build collapsible hierarchy view for products, pillars, themes, and tasks",
    createdDate: new Date("2024-01-14"),
    dueDate: new Date("2024-01-30"),
    status: "hold",
    priority: "medium",
    type: "task",
    themeIds: ["2"],
    order: 5,
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [products] = useState<Product[]>(mockProducts);
  const [strategicPillars] = useState<StrategicPillar[]>(mockPillars);
  const [themes] = useState<Theme[]>(mockThemes);

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

  return {
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
  };
}