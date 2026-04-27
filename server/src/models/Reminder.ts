import mongoose, { Document, Schema } from 'mongoose';

export interface IReminder extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  datetime: Date;
  type: 'personal' | 'team';
  repeat: 'none' | 'daily' | 'weekly';
  linkedTask: mongoose.Types.ObjectId;
  status: 'active' | 'dismissed' | 'completed';
  emailSent: boolean;
  notified: boolean;
  createdAt: Date;
}

const reminderSchema = new Schema<IReminder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    datetime: { type: Date, required: true },
    type: {
      type: String,
      enum: ['personal', 'team'],
      default: 'personal',
    },
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly'],
      default: 'none',
    },
    linkedTask: { type: Schema.Types.ObjectId, ref: 'Task' },
    status: {
      type: String,
      enum: ['active', 'dismissed', 'completed'],
      default: 'active',
    },
    emailSent: { type: Boolean, default: false },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1, datetime: 1 });
reminderSchema.index({ datetime: 1, status: 1 });

export default mongoose.model<IReminder>('Reminder', reminderSchema);
