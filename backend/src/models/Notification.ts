import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: string; // Firebase UID
  type: 'match' | 'recovery' | 'verification' | 'digest' | 'claim_submitted' | 'claim_approved' | 'claim_rejected' | 'message_received';
  itemId: string;
  relatedUserId?: string;
  relatedItemId?: string;
  relatedMessageId?: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  isRead?: boolean;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['match', 'recovery', 'verification', 'digest', 'claim_submitted', 'claim_approved', 'claim_rejected', 'message_received'],
      required: true,
    },
    itemId: { type: String, required: true },
    relatedUserId: { type: String },
    relatedItemId: { type: String },
    relatedMessageId: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
