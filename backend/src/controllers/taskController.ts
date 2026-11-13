import { Request, Response } from 'express';
import { getTaskRepository } from '../repositories/index.js';
import { DbTaskRepository } from '../repositories/dbTaskRepository.js';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { date, search, weekStart, weekEnd, status } = req.query;
    const repo = getTaskRepository();
    const tasks = await repo.getAll({
      date: date as string | undefined,
      search: search as string | undefined,
      weekStart: weekStart as string | undefined,
      weekEnd: weekEnd as string | undefined,
      status: status as string | undefined,
    });
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    const task = await repo.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, description, date, startTime, endTime, priority, status } = req.body;
    if (!title || !String(title).trim()) {
      return res.status(400).json({ error: 'Title is mandatory' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Date is mandatory' });
    }

    const repo = getTaskRepository();
    console.log("reporeporeporepo", repo);
    const newTask = await repo.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      date,
      startTime,
      endTime,
      priority,
      status,
    });
    console.log("Task Creatyewdedccdj")
    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    const updated = await repo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update task' });
  }
};

export const toggleTask = async (req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    const updated = await repo.toggle(req.params.id);
    if (!updated) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to toggle task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    const success = await repo.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete task' });
  }
};

export const getWeeklySummaries = async (_req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    const summaries = await repo.getWeeklySummaries();
    res.json(summaries);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch weekly summaries' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const refDate = date ? new Date(date as string) : new Date();
    const repo = getTaskRepository();
    const stats = await repo.getStats(refDate);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch statistics' });
  }
};

export const resetData = async (_req: Request, res: Response) => {
  try {
    const repo = getTaskRepository();
    await repo.seed();
    res.json({ success: true, message: 'Database/File store re-seeded with initial sample tasks' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset data' });
  }
};

