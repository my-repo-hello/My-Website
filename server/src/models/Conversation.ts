import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  type: 'group' | 'private';
  members: mongoose.Types.ObjectId[];
  name: string;
  lastMessage: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    timestamp: Date;
  };
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    type: {
      type: String,
      enum: ['group', 'private'],
      required: true,
    },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    name: { type: String, default: '' },
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date },
    },
  },
  { timestamps: true }
);

conversationSchema.index({ members: 1 });

export default mongoose.model<IConversation>('Conversation', conversationSchema);
