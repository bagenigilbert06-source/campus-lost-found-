import { Schema, model, Document } from 'mongoose';

export interface IConversation extends Document {
  itemId: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  adminId: string;
  adminEmail: string;
  status: 'active' | 'resolved' | 'closed';
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: {
    student: number;
    admin: number;
  };
  itemTitle: string;
  claimVerified: boolean;
  verificationDetails?: {
    verifiedAt: Date;
    verifiedBy: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    itemId: { type: String, required: true, index: true },
    studentId: { type: String, required: true, index: true },
    studentEmail: { type: String, required: true },
    studentName: { type: String, required: true },
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'resolved', 'closed'],
      default: 'active',
    },
    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    unreadCount: {
      student: { type: Number, default: 0 },
      admin: { type: Number, default: 0 },
    },
    itemTitle: { type: String, required: true },
    claimVerified: { type: Boolean, default: false },
    verificationDetails: {
      verifiedAt: { type: Date },
      verifiedBy: { type: String },
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
ConversationSchema.index({ studentId: 1, createdAt: -1 });
ConversationSchema.index({ adminId: 1, status: 1 });
ConversationSchema.index({ itemId: 1, studentId: 1 }, { unique: true });

export const Conversation = model<IConversation>('Conversation', ConversationSchema);
