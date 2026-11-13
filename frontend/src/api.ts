import { Task, TaskStats, WeekSummary } from './types';

const BASE_URL = '/api';

export async function fetchTasks(params?: {
  date?: string;
  search?: string;
  weekStart?: string;
  weekEnd?: string;
  status?: string;
}): Promise<Task[]> {
  const query = new URLSearchParams();
  if (params?.date) query.set('date', params.date);
  if (params?.search) query.set('search', params.search);
  if (params?.weekStart) query.set('weekStart', params.weekStart);
  if (params?.weekEnd) query.set('weekEnd', params.weekEnd);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${BASE_URL}/tasks?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  }
  return res.json();
}

export async function createTask(data: {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'In Progress' | 'Completed';
}): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create task');
  }
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update task');
  }
  return res.json();
}

export async function toggleTaskStatus(id: string): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to toggle task status');
  }
  return res.json();
}

export async function deleteTask(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete task');
  }
  return true;
}

export async function fetchWeeklySummaries(): Promise<WeekSummary[]> {
  const res = await fetch(`${BASE_URL}/weeks`);
  if (!res.ok) {
    throw new Error('Failed to fetch weekly summaries');
  }
  return res.json();
}

export async function fetchStats(dateStr?: string): Promise<TaskStats> {
  const query = dateStr ? `?date=${encodeURIComponent(dateStr)}` : '';
  const res = await fetch(`${BASE_URL}/stats${query}`);
  if (!res.ok) {
    throw new Error('Failed to fetch task stats');
  }
  return res.json();
}

export async function seedDatabase(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/seed`, { method: 'POST' });
  return res.ok;
}
