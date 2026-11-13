import mongoose, { Schema, Document } from 'mongoose';

export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'In Progress' | 'Completed';

export interface ITask {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  priority?: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskDocument extends Omit<ITask, 'id'>, Document {
  id: string;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is mandatory'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is mandatory'],
    },
    startTime: {
      type: String,
      default: '10:00 AM',
    },
    endTime: {
      type: String,
      default: '11:30 AM',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed'],
      default: 'In Progress',
    },
  },
  {
    bufferCommands: false, // Prevents 10000ms buffering hang if DB is disconnected
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const TaskModel = mongoose.models.Task || mongoose.model<ITaskDocument>('Task', TaskSchema);
