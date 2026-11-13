import { ITask } from '../models/Task.js';

export interface TaskFilterParams {
  date?: string;
  search?: string;
  weekStart?: string;
  weekEnd?: string;
  status?: string;
}

export interface WeekSummary {
  weekId: string;
  startDate: string;
  endDate: string;
  label: string;
  totalTasks: number;
  openTasks: number;
  completedTasks: number;
  isCurrentWeek?: boolean;
}

export interface TaskStats {
  completedThisWeek: number;
  pendingThisWeek: number;
  totalThisWeek: number;
  progressPercent: number;
  tasksToday: number;
  completedToday: number;
}

export interface ITaskRepository {
  getAll(filters?: TaskFilterParams): Promise<ITask[]>;
  getById(id: string): Promise<ITask | null>;
  create(data: Omit<ITask, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ITask['status'] }): Promise<ITask>;
  update(id: string, updates: Partial<ITask>): Promise<ITask | null>;
  toggle(id: string): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  getWeeklySummaries(): Promise<WeekSummary[]>;
  getStats(refDate?: Date): Promise<TaskStats>;
  seed(): Promise<void>;
}
