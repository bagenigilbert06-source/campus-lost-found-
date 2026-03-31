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
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_proof';
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
      enum: ['pending', 'approved', 'rejected', 'needs_more_proof'],
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
ClaimSchema.index({ studentId: 1, createdAt: -1 }); // For student claims with date sorting
ClaimSchema.index({ status: 1, createdAt: -1 }); // For status-based queries sorted by date
ClaimSchema.index({ createdAt: -1 }); // For date-based sorting across all queries
ClaimSchema.index({ studentId: 1, status: 1 }); // For student's claims by status

export const Claim = model<IClaim>('Claim', ClaimSchema);
