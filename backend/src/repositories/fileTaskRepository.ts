import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ITask } from '../models/Task.js';
import { ITaskRepository, TaskFilterParams, TaskStats, WeekSummary } from './ITaskRepository.js';
import { formatDateKey, formatWeekLabel, getMondayOfWeek, getSundayOfWeek } from '../utils/dateUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.resolve(DATA_DIR, 'tasks.json');

export class FileTaskRepository implements ITaskRepository {
  private isInitialized = false;

  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.access(DATA_FILE);
    } catch {
      // File does not exist yet; seed initial tasks to JSON file
      await this.seed();
    }
    this.isInitialized = true;
  }

  private async readTasksFromFile(): Promise<ITask[]> {
    await this.ensureInitialized();
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      return JSON.parse(data) as ITask[];
    } catch {
      return [];
    }
  }

  private async writeTasksToFile(tasks: ITask[]): Promise<void> {
    await this.ensureInitialized();
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  }

  public async seed(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const today = new Date();
    const todayStr = formatDateKey(today);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = formatDateKey(yesterday);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = formatDateKey(tomorrow);

    const initialTasks: ITask[] = [
      {
        id: 'task-1',
        title: 'Finishing Wireframe',
        description: 'Complete mobile screens and onboarding flow in Figma',
        date: todayStr,
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        priority: 'High',
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        title: 'Meeting with team',
        description: 'Sync up on SDE-1 assignment review and deployment checklist',
        date: todayStr,
        startTime: '11:30 AM',
        endTime: '12:30 PM',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        title: 'Buy a cat food',
        description: 'Get salmon flavor canned food from pet store',
        date: todayStr,
        startTime: '05:00 PM',
        endTime: '05:45 PM',
        priority: 'Low',
        status: 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-4',
        title: 'Finishing daily commission',
        description: 'Review client requirements and submit final deliverables',
        date: todayStr,
        startTime: '06:00 PM',
        endTime: '08:00 PM',
        priority: 'High',
        status: 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-5',
        title: 'Doing Homework',
        description: 'Algorithms practice problems and system design reading',
        date: tomorrowStr,
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-6',
        title: 'Prepare Project Presentation',
        description: 'Slide deck for frontend & backend architecture walkthrough',
        date: yesterdayStr,
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        priority: 'High',
        status: 'Completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Seed weekly records for 50 Complete / 08 Pending stats matching Figma
    const monday = getMondayOfWeek(today);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = formatDateKey(d);
      for (let j = 1; j <= 6; j++) {
        initialTasks.push({
          id: `file-seed-${i}-${j}`,
          title: `Weekly Scheduled Task #${i * 6 + j}`,
          description: 'Completed regular sprint task recorded in file directory',
          date: dStr,
          startTime: `${8 + j}:00 AM`,
          endTime: `${9 + j}:00 AM`,
          priority: j % 2 === 0 ? 'Medium' : 'Low',
          status: 'Completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(initialTasks, null, 2), 'utf-8');
  }

  public async getAll(filters?: TaskFilterParams): Promise<ITask[]> {
    let tasks = await this.readTasksFromFile();

    if (filters?.date) {
      tasks = tasks.filter((t) => t.date === filters.date);
    }
    if (filters?.weekStart && filters?.weekEnd) {
      tasks = tasks.filter((t) => t.date >= filters.weekStart! && t.date <= filters.weekEnd!);
    }
    if (filters?.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return tasks.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return 0;
    });
  }

  public async getById(id: string): Promise<ITask | null> {
    const tasks = await this.readTasksFromFile();
    return tasks.find((t) => t.id === id) || null;
  }

  public async create(data: Omit<ITask, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ITask['status'] }): Promise<ITask> {
    const tasks = await this.readTasksFromFile();
    const newTask: ITask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: data.title.trim(),
      description: data.description?.trim() || '',
      date: data.date,
      startTime: data.startTime || '10:00 AM',
      endTime: data.endTime || '11:30 AM',
      priority: data.priority || 'Medium',
      status: data.status || 'In Progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    await this.writeTasksToFile(tasks);
    return newTask;
  }

  public async update(id: string, updates: Partial<ITask>): Promise<ITask | null> {
    const tasks = await this.readTasksFromFile();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      id: tasks[idx].id,
      updatedAt: new Date().toISOString(),
    };

    await this.writeTasksToFile(tasks);
    return tasks[idx];
  }

  public async toggle(id: string): Promise<ITask | null> {
    const tasks = await this.readTasksFromFile();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    tasks[idx].status = tasks[idx].status === 'Completed' ? 'In Progress' : 'Completed';
    tasks[idx].updatedAt = new Date().toISOString();

    await this.writeTasksToFile(tasks);
    return tasks[idx];
  }

  public async delete(id: string): Promise<boolean> {
    const tasks = await this.readTasksFromFile();
    const initialLen = tasks.length;
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === initialLen) return false;

    await this.writeTasksToFile(filtered);
    return true;
  }

  public async getWeeklySummaries(): Promise<WeekSummary[]> {
    const tasks = await this.readTasksFromFile();
    const weeksMap = new Map<string, { startDate: string; endDate: string; tasks: ITask[] }>();

    for (const task of tasks) {
      const [y, m, d] = task.date.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const monday = getMondayOfWeek(dateObj);
      const sunday = getSundayOfWeek(dateObj);
      const monKey = formatDateKey(monday);
      const sunKey = formatDateKey(sunday);
      const weekId = `week-${monKey}`;

      if (!weeksMap.has(weekId)) {
        weeksMap.set(weekId, { startDate: monKey, endDate: sunKey, tasks: [] });
      }
      weeksMap.get(weekId)!.tasks.push(task);
    }

    const currentMonday = getMondayOfWeek(new Date());
    const currentSunday = getSundayOfWeek(new Date());
    const currentMonKey = formatDateKey(currentMonday);
    const currentSunKey = formatDateKey(currentSunday);
    const currentWeekId = `week-${currentMonKey}`;

    if (!weeksMap.has(currentWeekId)) {
      weeksMap.set(currentWeekId, { startDate: currentMonKey, endDate: currentSunKey, tasks: [] });
    }

    const summaries: WeekSummary[] = [];
    weeksMap.forEach((val, weekId) => {
      const total = val.tasks.length;
      const completed = val.tasks.filter((t) => t.status === 'Completed').length;
      summaries.push({
        weekId,
        startDate: val.startDate,
        endDate: val.endDate,
        label: formatWeekLabel(val.startDate, val.endDate),
        totalTasks: total,
        openTasks: total - completed,
        completedTasks: completed,
        isCurrentWeek: weekId === currentWeekId,
      });
    });

    return summaries.sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  public async getStats(refDate: Date = new Date()): Promise<TaskStats> {
    const tasks = await this.readTasksFromFile();
    const monday = getMondayOfWeek(refDate);
    const sunday = getSundayOfWeek(refDate);
    const monKey = formatDateKey(monday);
    const sunKey = formatDateKey(sunday);
    const todayKey = formatDateKey(new Date());

    const weekTasks = tasks.filter((t) => t.date >= monKey && t.date <= sunKey);
    const completedThisWeek = weekTasks.filter((t) => t.status === 'Completed').length;
    const pendingThisWeek = weekTasks.filter((t) => t.status === 'In Progress').length;
    const totalThisWeek = weekTasks.length;
    const progressPercent = totalThisWeek === 0 ? 0 : Math.round((completedThisWeek / totalThisWeek) * 100);

    const todayTasks = tasks.filter((t) => t.date === todayKey);
    const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;

    return {
      completedThisWeek,
      pendingThisWeek,
      totalThisWeek,
      progressPercent,
      tasksToday: todayTasks.length,
      completedToday,
    };
  }
}
