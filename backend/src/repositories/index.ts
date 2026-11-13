import { ITaskRepository } from './ITaskRepository.js';
import { DbTaskRepository } from './dbTaskRepository.js';
import { FileTaskRepository } from './fileTaskRepository.js';
import { isDbConnected } from '../config/db.js';

let fileRepoInstance: FileTaskRepository;
let dbRepoInstance: DbTaskRepository;

export function getTaskRepository(): ITaskRepository {
  const isDbRequested =
    process.env.DB_USED === 'true' ||
    process.env.db_used === 'true';

  if (!isDbRequested) {
    if (!fileRepoInstance) {
      fileRepoInstance = new FileTaskRepository();
    }
    return fileRepoInstance;
  }

  // If DB was requested, check if it's connected
  if (isDbConnected()) {
    if (!dbRepoInstance) {
      dbRepoInstance = new DbTaskRepository();
    }
    return dbRepoInstance;
  }

  // DB requested but not connected: Fall back to File Directory to guarantee 0 timeouts/errors
  if (!fileRepoInstance) {
    fileRepoInstance = new FileTaskRepository();
  }
  return fileRepoInstance;
}
