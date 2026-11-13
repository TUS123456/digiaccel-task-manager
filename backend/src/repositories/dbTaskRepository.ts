import mongoose from 'mongoose';
import { TaskModel, ITask } from '../models/Task.js';
import { ITaskRepository, TaskFilterParams, TaskStats, WeekSummary } from './ITaskRepository.js';
import { FileTaskRepository } from './fileTaskRepository.js';
import { formatDateKey, formatWeekLabel, getMondayOfWeek, getSundayOfWeek } from '../utils/dateUtils.js';

export class DbTaskRepository implements ITaskRepository {
  private fallbackFileRepo = new FileTaskRepository();

  private isDbReady(): boolean {
    return mongoose.connection.readyState === 1;
  }

  public async getAll(filters?: TaskFilterParams): Promise<ITask[]> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.getAll(filters);
    }

    try {
      const query: Record<string, any> = {};

      if (filters?.date) {
        query.date = filters.date;
      }
      if (filters?.weekStart && filters?.weekEnd) {
        query.date = { $gte: filters.weekStart, $lte: filters.weekEnd };
      }
      if (filters?.status) {
        query.status = filters.status;
      }
      if (filters?.search && filters.search.trim()) {
        const regex = new RegExp(filters.search.trim(), 'i');
        query.$or = [{ title: regex }, { description: regex }];
      }

      const docs = await TaskModel.find(query).sort({ date: 1, startTime: 1 }).lean();
      return docs.map((doc: any) => ({
        id: doc._id ? doc._id.toString() : doc.id,
        title: doc.title,
        description: doc.description || '',
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        priority: doc.priority,
        status: doc.status,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
      }));
    } catch (error) {
      console.warn('DB getAll failed, using file fallback:', error);
      return this.fallbackFileRepo.getAll(filters);
    }
  }

  public async getById(id: string): Promise<ITask | null> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.getById(id);
    }

    try {
      const doc: any = await TaskModel.findById(id).lean();
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description || '',
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        priority: doc.priority,
        status: doc.status,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
      };
    } catch {
      return this.fallbackFileRepo.getById(id);
    }
  }

  public async create(data: Omit<ITask, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: ITask['status'] }): Promise<ITask> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.create(data);
    }

    try {
      const doc = await TaskModel.create({
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime || '10:00 AM',
        endTime: data.endTime || '11:30 AM',
        priority: data.priority || 'Medium',
        status: data.status || 'In Progress',
      });

      return {
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description || '',
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        priority: doc.priority,
        status: doc.status,
        createdAt: (doc as any).createdAt ? (doc as any).createdAt.toISOString() : new Date().toISOString(),
        updatedAt: (doc as any).updatedAt ? (doc as any).updatedAt.toISOString() : new Date().toISOString(),
      };
    } catch (error) {
      console.warn('DB create failed, using file fallback:', error);
      return this.fallbackFileRepo.create(data);
    }
  }

  public async update(id: string, updates: Partial<ITask>): Promise<ITask | null> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.update(id, updates);
    }

    try {
      const doc: any = await TaskModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!doc) return null;
      return {
        id: doc._id.toString(),
        title: doc.title,
        description: doc.description || '',
        date: doc.date,
        startTime: doc.startTime,
        endTime: doc.endTime,
        priority: doc.priority,
        status: doc.status,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : new Date().toISOString(),
      };
    } catch {
      return this.fallbackFileRepo.update(id, updates);
    }
  }

  public async toggle(id: string): Promise<ITask | null> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.toggle(id);
    }

    try {
      const task = await TaskModel.findById(id);
      if (!task) return this.fallbackFileRepo.toggle(id);

      task.status = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await task.save();

      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description || '',
        date: task.date,
        startTime: task.startTime,
        endTime: task.endTime,
        priority: task.priority,
        status: task.status,
        createdAt: (task as any).createdAt ? (task as any).createdAt.toISOString() : new Date().toISOString(),
        updatedAt: (task as any).updatedAt ? (task as any).updatedAt.toISOString() : new Date().toISOString(),
      };
    } catch {
      return this.fallbackFileRepo.toggle(id);
    }
  }

  public async delete(id: string): Promise<boolean> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.delete(id);
    }

    try {
      const res = await TaskModel.findByIdAndDelete(id);
      return !!res;
    } catch {
      return this.fallbackFileRepo.delete(id);
    }
  }

  public async getWeeklySummaries(): Promise<WeekSummary[]> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.getWeeklySummaries();
    }

    try {
      const all = await this.getAll();
      const weeksMap = new Map<string, { startDate: string; endDate: string; tasks: ITask[] }>();

      for (const task of all) {
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
    } catch {
      return this.fallbackFileRepo.getWeeklySummaries();
    }
  }

  public async getStats(refDate: Date = new Date()): Promise<TaskStats> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.getStats(refDate);
    }

    try {
      const monday = getMondayOfWeek(refDate);
      const sunday = getSundayOfWeek(refDate);
      const monKey = formatDateKey(monday);
      const sunKey = formatDateKey(sunday);
      const todayKey = formatDateKey(new Date());

      const weekTasks = await this.getAll({ weekStart: monKey, weekEnd: sunKey });
      const completedThisWeek = weekTasks.filter((t) => t.status === 'Completed').length;
      const pendingThisWeek = weekTasks.filter((t) => t.status === 'In Progress').length;
      const totalThisWeek = weekTasks.length;
      const progressPercent = totalThisWeek === 0 ? 0 : Math.round((completedThisWeek / totalThisWeek) * 100);

      const todayTasks = await this.getAll({ date: todayKey });
      const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;

      return {
        completedThisWeek,
        pendingThisWeek,
        totalThisWeek,
        progressPercent,
        tasksToday: todayTasks.length,
        completedToday,
      };
    } catch {
      return this.fallbackFileRepo.getStats(refDate);
    }
  }

  public async seed(): Promise<void> {
    if (!this.isDbReady()) {
      return this.fallbackFileRepo.seed();
    }

    try {
      await TaskModel.deleteMany({});
      const today = new Date();
      const todayStr = formatDateKey(today);

      await TaskModel.insertMany([
        {
          title: 'Finishing Wireframe',
          description: 'Complete mobile screens and onboarding flow in Figma',
          date: todayStr,
          startTime: '09:00 AM',
          endTime: '11:00 AM',
          priority: 'High',
          status: 'In Progress',
        },
        {
          title: 'Meeting with team',
          description: 'Sync up on SDE-1 assignment review and deployment checklist',
          date: todayStr,
          startTime: '11:30 AM',
          endTime: '12:30 PM',
          priority: 'Medium',
          status: 'In Progress',
        },
        {
          title: 'Buy a cat food',
          description: 'Get salmon flavor canned food from pet store',
          date: todayStr,
          startTime: '05:00 PM',
          endTime: '05:45 PM',
          priority: 'Low',
          status: 'Completed',
        },
        {
          title: 'Finishing daily commission',
          description: 'Review client requirements and submit final deliverables',
          date: todayStr,
          startTime: '06:00 PM',
          endTime: '08:00 PM',
          priority: 'High',
          status: 'Completed',
        },
        {
          title: 'Doing Homework',
          description: 'Algorithms practice problems and system design reading',
          date: todayStr,
          startTime: '10:00 AM',
          endTime: '11:30 AM',
          priority: 'Medium',
          status: 'In Progress',
        },
      ]);
    } catch {
      return this.fallbackFileRepo.seed();
    }
  }
}
