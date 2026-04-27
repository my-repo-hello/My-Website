import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'reminder' | 'task' | 'chat' | 'habit' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  relatedId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reminder', 'task', 'chat', 'habit', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    relatedId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
