import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: string; // Firebase UID
  type: 'match' | 'recovery' | 'verification' | 'digest';
  itemId: string;
  relatedUserId?: string;
  title: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['match', 'recovery', 'verification', 'digest'],
      required: true,
    },
    itemId: { type: String, required: true },
    relatedUserId: { type: String },
    title: { type: String, required: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
      index: true,
    },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
