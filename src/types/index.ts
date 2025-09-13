export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'open' | 'hold' | 'completed';
export type TaskType = 'task' | 'subtask';

export interface Product {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
}

export interface StrategicPillar {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
  targetTimeFrame: string;
  productIds: string[];
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
  associatedProject?: string;
  strategicPillarIds: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdDate: Date;
  dueDate: Date;
  prioritizedDate?: Date;
  status: Status;
  priority: Priority;
  type: TaskType;
  parentTaskId?: string;
  themeIds: string[];
  order: number;
  prioritizedDays?: Date[];
}

export interface TaskGroup {
  date: string;
  tasks: Task[];
}