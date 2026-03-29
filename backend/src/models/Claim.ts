import { Schema, model, Document } from 'mongoose';

export interface IClaim extends Document {
  itemId: string;
  itemTitle: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  studentPhone: string;
  studentUId: string; // Firebase UID
  claimMessage: string;
  proofOfOwnership: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  adminId?: string;
  adminEmail?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ClaimSchema = new Schema<IClaim>(
  {
    itemId: { type: String, required: true, index: true },
    itemTitle: { type: String, required: true },
    studentId: { type: String, required: true },
    studentEmail: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentPhone: { type: String, required: true },
    studentUId: { type: String, required: true, index: true },
    claimMessage: { type: String, required: false },
    proofOfOwnership: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNote: { type: String },
    adminId: { type: String },
    adminEmail: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
ClaimSchema.index({ itemId: 1, status: 1 });
ClaimSchema.index({ studentEmail: 1, createdAt: -1 });
ClaimSchema.index({ createdAt: -1 });

export const Claim = model<IClaim>('Claim', ClaimSchema);
