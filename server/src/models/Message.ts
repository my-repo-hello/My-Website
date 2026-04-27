import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl: string;
  fileName: string;
  seenBy: mongoose.Types.ObjectId[];
  deliveredTo: mongoose.Types.ObjectId[];
  replyTo: mongoose.Types.ObjectId;
  reactions: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }[];
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
      {
        emoji: { type: String },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, timestamp: -1 });

export default mongoose.model<IMessage>('Message', messageSchema);
