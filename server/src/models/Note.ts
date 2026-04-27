import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  isShared: boolean;
  isPinned: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Untitled Note', trim: true },
    content: { type: String, default: '' },
    tags: [{ type: String }],
    isShared: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    color: { type: String, default: '#1e1e2e' },
  },
  { timestamps: true }
);

noteSchema.index({ userId: 1 });
noteSchema.index({ title: 'text', content: 'text' });

export default mongoose.model<INote>('Note', noteSchema);
