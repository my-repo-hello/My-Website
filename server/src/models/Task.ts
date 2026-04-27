import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: mongoose.Types.ObjectId[];
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  activityLog: {
    user: mongoose.Types.ObjectId;
    action: string;
    timestamp: Date;
  }[];
  createdAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    dueDate: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    activityLog: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        action: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignedTo: 1 });

export default mongoose.model<ITask>('Task', taskSchema);
