import mongoose, { Document, Schema } from 'mongoose';

export interface IHabit extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: 'Health' | 'Work' | 'Learning' | 'Fitness' | 'Other';
  frequency: 'daily' | 'weekly' | 'custom';
  customDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  color: string;
  currentStreak: number;
  longestStreak: number;
  createdAt: Date;
}

const habitSchema = new Schema<IHabit>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Health', 'Work', 'Learning', 'Fitness', 'Other'],
      default: 'Other',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    customDays: [{ type: Number }],
    color: { type: String, default: '#818cf8' },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

habitSchema.index({ userId: 1 });

export default mongoose.model<IHabit>('Habit', habitSchema);
