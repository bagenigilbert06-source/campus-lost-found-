import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  email: string;
  displayName: string;
  profileImage?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  notificationPreferences: {
    emailOnMatch: boolean;
    emailOnRecovery: boolean;
    emailOnVerification: boolean;
    emailWeeklyDigest: boolean;
  };
  stats: {
    itemsPosted: number;
    itemsRecovered: number;
    itemsClaimed: number;
  };
}

const UserSchema = new Schema<any>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    profileImage: { type: String },
    location: { type: String },
    notificationPreferences: {
      emailOnMatch: { type: Boolean, default: true },
      emailOnRecovery: { type: Boolean, default: true },
      emailOnVerification: { type: Boolean, default: true },
      emailWeeklyDigest: { type: Boolean, default: false },
    },
    stats: {
      itemsPosted: { type: Number, default: 0 },
      itemsRecovered: { type: Number, default: 0 },
      itemsClaimed: { type: Number, default: 0 },
    },
  },
  { timestamps: true, _id: false }
);

export const User = model<IUser>('User', UserSchema);
