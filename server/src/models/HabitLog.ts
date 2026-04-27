import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitLog extends Document {
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format for easy querying
  status: 'completed' | 'missed' | 'pending';
}

const habitLogSchema = new Schema<IHabitLog>(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    status: {
      type: String,
      enum: ['completed', 'missed', 'pending'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });
habitLogSchema.index({ userId: 1, date: 1 });

export default mongoose.model<IHabitLog>('HabitLog', habitLogSchema);
