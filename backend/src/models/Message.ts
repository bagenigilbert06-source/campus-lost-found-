import { Schema, model, Document } from 'mongoose';

export interface IMessage extends Document {
  conversationId: string;
  itemId: string;
  senderId: string;
  senderEmail: string;
  senderRole: 'student' | 'admin';
  recipientId: string;
  recipientEmail: string;
  recipientRole: 'student' | 'admin';
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    itemId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderEmail: { type: String, required: true },
    senderRole: { type: String, enum: ['student', 'admin'], required: true },
    recipientId: { type: String, required: true, index: true },
    recipientEmail: { type: String, required: true },
    recipientRole: { type: String, enum: ['student', 'admin'], required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for efficient conversation queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, isRead: 1 });

export const Message = model<IMessage>('Message', MessageSchema);
