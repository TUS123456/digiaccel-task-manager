import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  getWeeklySummaries,
  getStats,
  resetData,
} from "../controllers/taskController.js";

const router = Router();

// RESTful CRUD Endpoints
router.get('/tasks', getTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.patch('/tasks/:id/toggle', toggleTask);
router.delete('/tasks/:id', deleteTask);

// Specialized Endpoints (Weekly Grouping, Stats, and Reset)
router.get('/weeks', getWeeklySummaries);
router.get('/stats', getStats);
router.post('/seed', resetData);

export default router;
