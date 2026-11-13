export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date format YYYY-MM-DD
  startTime?: string; // e.g. "10:00 AM" or "10:00"
  endTime?: string; // e.g. "11:30 AM" or "11:30"
  priority?: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WeekSummary {
  weekId: string; // e.g. "2026-W46"
  startDate: string; // Monday YYYY-MM-DD
  endDate: string; // Sunday YYYY-MM-DD
  label: string; // e.g. "Nov 09 - Nov 15, 2026"
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
