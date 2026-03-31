import { Schema, model, Document, Types } from 'mongoose';

export interface IItem extends Document {
  itemType: 'Lost' | 'Found' | 'Recovered';
  postType?: 'Lost' | 'Found' | 'Recovered';
  subType?: string;
  distinguishingFeatures?: string;
  title: string;
  description: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  dateLost: Date;
  uploadedAt: Date;
  images: string[];
  userId?: string; // Firebase UID
  email?: string; // User email
  name?: string; // User display name
  status: 'active' | 'pending_review' | 'verified' | 'matched' | 'claim_in_progress' | 'claimed' | 'ready_for_pickup' | 'recovered' | 'resolved' | 'rejected' | 'archived';
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  claimedBy?: { email: string; name: string; date: Date };
  claimedAt?: Date;
  recoveredBy?: { email: string; name: string; date: Date };
  recoveredAt?: Date;
  recoveredDate?: Date;
  recoveredLocation?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    itemType: { type: String, enum: ['Lost', 'Found', 'Recovered'], required: true, index: true },
    subType: { type: String },
    distinguishingFeatures: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    // deprecated: postType just for compatibility
    postType: { type: String, enum: ['Lost', 'Found', 'Recovered'], default: undefined },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    dateLost: { type: Date, required: true },
    images: [{ type: String }],
    userId: { type: String, index: true },
    email: { type: String, index: true },
    name: { type: String },
    status: {
      type: String,
      enum: [
        'active',
        'pending_review',
        'verified',
        'matched',
        'claim_in_progress',
        'claimed',
        'ready_for_pickup',
        'recovered',
        'resolved',
        'rejected',
        'archived',
      ],
      default: 'active',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    claimedBy: {
      email: { type: String },
      name: { type: String },
      date: { type: Date },
    },
    claimedAt: { type: Date },
    recoveredBy: {
      email: { type: String },
      name: { type: String },
      date: { type: Date },
    },
    recoveredAt: { type: Date },
    recoveredDate: { type: Date },
    recoveredLocation: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Compound index for efficient queries
ItemSchema.index({ userId: 1, status: 1 });
ItemSchema.index({ userId: 1, createdAt: -1 }); // For user items sorted by creation date
ItemSchema.index({ status: 1, createdAt: -1 }); // For status-based queries sorted by date
ItemSchema.index({ category: 1, location: 1 });
ItemSchema.index({ itemType: 1, status: 1 });
ItemSchema.index({ postType: 1, status: 1 });
ItemSchema.index({ createdAt: -1 }); // For date-based sorting across all items

export const Item = model<IItem>('Item', ItemSchema);
