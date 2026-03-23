import { Schema, model, Document, Types } from 'mongoose';

export interface IItem extends Document {
  itemType: 'Lost' | 'Found';
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
  userId: string; // Firebase UID
  status: 'active' | 'recovered' | 'claimed';
  claimedBy?: string; // Firebase UID
  claimedAt?: Date;
  metadata?: Record<string, any>;
}

const ItemSchema = new Schema<IItem>(
  {
    itemType: { type: String, enum: ['Lost', 'Found'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    location: { type: String, required: true, index: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    dateLost: { type: Date, required: true },
    images: [{ type: String }],
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'recovered', 'claimed'],
      default: 'active',
      index: true,
    },
    claimedBy: { type: String },
    claimedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Compound index for efficient queries
ItemSchema.index({ userId: 1, status: 1 });
ItemSchema.index({ category: 1, location: 1 });
ItemSchema.index({ itemType: 1, status: 1 });

export const Item = model<IItem>('Item', ItemSchema);
