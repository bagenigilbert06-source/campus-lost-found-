import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  email: string;
  displayName: string;
  passwordHash?: string; // Only for local auth users
  profileImage?: string;
  location?: string;
  role: 'student' | 'admin';
  authProvider: 'local' | 'google';
  firebaseUid?: string; // Only for Google auth users
  isActive: boolean;
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
  studentProfile?: {
    onboardingComplete: boolean;
    preferences: Record<string, any>;
    createdAt: string;
  };
  adminProfile?: {
    permissions: string[];
    createdAt: string;
  };
}

const UserSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    passwordHash: { type: String }, // Only set for local auth
    profileImage: { type: String },
    location: { type: String },
    role: { 
      type: String, 
      enum: ['student', 'admin'], 
      default: 'student',
      required: true 
    },
    authProvider: { 
      type: String, 
      enum: ['local', 'google'], 
      default: 'local',
      required: true 
    },
    firebaseUid: { type: String }, // Only set for Google auth
    isActive: { type: Boolean, default: true },
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
    studentProfile: {
      onboardingComplete: { type: Boolean, default: false },
      preferences: { type: Schema.Types.Mixed, default: {} },
      createdAt: { type: String },
    },
    adminProfile: {
      permissions: [{ type: String }],
      createdAt: { type: String },
    },
  },
  { timestamps: true, _id: false }
);

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ role: 1 });

export const User = model<IUser>('User', UserSchema);
