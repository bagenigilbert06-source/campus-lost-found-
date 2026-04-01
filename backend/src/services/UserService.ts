import { User, IUser } from '../models/User.js';
import { NotFound } from '../middleware/errorHandler.js';

export class UserService {
  /**
   * Get or create user for Firebase auth
   */
  async getOrCreateUser(
    uid: string,
    email: string,
    displayName: string,
    photoURL?: string,
    role?: string
  ): Promise<IUser & { isNew?: boolean }> {
    // First, try to find by Firebase UID
    let user = await User.findById(uid);
    let isNew = false;

    if (!user) {
      // Check if user exists with this email (might have migrated from local auth)
      const existingByEmail = await User.findOne({ email: email.toLowerCase() });

      if (existingByEmail) {
        // User exists with different auth provider, update their Firebase UID
        if (!existingByEmail.firebaseUid) {
          existingByEmail.firebaseUid = uid;
          await existingByEmail.save();
        }
        user = existingByEmail;
      } else {
        // Create new user
        isNew = true;
        const userRole = role || 'student'; // Default to student, admin can be set later

        user = new User({
          _id: uid,
          email: email.toLowerCase(),
          displayName,
          profileImage: photoURL || '',
          role: userRole,
          authProvider: 'firebase',
          firebaseUid: uid,
          isActive: true,
          notificationPreferences: {
            emailOnMatch: true,
            emailOnRecovery: true,
            emailOnVerification: true,
            emailWeeklyDigest: false,
          },
          stats: {
            itemsPosted: 0,
            itemsRecovered: 0,
            itemsClaimed: 0,
          },
          // Role-specific profile
          ...(userRole === 'student' && {
            studentProfile: {
              onboardingComplete: false,
              preferences: {},
              createdAt: new Date().toISOString(),
            },
          }),
          ...(userRole === 'admin' && {
            adminProfile: {
              permissions: ['verify_items', 'manage_users', 'view_reports'],
              createdAt: new Date().toISOString(),
            },
          }),
        });
        await user.save();
      }
    } else if (photoURL && !user.profileImage) {
      // Update profile image if not set and provided
      user.profileImage = photoURL;
      await user.save();
    }

    // Attach isNew flag to the user object
    (user as any).isNew = isNew;
    return user as IUser & { isNew: boolean };
  }

  /**
   * Get user by ID (works with both Firebase UID and local UUID)
   */
  async getUserById(uid: string): Promise<IUser> {
    let user = await User.findById(uid);
    
    // If not found by ID, try finding by firebaseUid
    if (!user) {
      user = await User.findOne({ firebaseUid: uid });
    }
    
    if (!user) {
      throw NotFound('User not found');
    }
    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, data: Partial<IUser>): Promise<IUser> {
    // Try finding by ID first
    let user = await User.findByIdAndUpdate(uid, data, { new: true });
    
    // If not found, try by firebaseUid
    if (!user) {
      user = await User.findOneAndUpdate({ firebaseUid: uid }, data, { new: true });
    }
    
    if (!user) {
      throw NotFound('User not found');
    }
    return user;
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(uid: string, preferences: any): Promise<IUser> {
    let user = await User.findByIdAndUpdate(
      uid,
      { notificationPreferences: preferences },
      { new: true }
    );
    
    if (!user) {
      user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        { notificationPreferences: preferences },
        { new: true }
      );
    }
    
    if (!user) {
      throw NotFound('User not found');
    }
    return user;
  }

  /**
   * Increment user stats
   */
  async incrementUserStats(uid: string, field: 'itemsPosted' | 'itemsRecovered' | 'itemsClaimed'): Promise<void> {
    const result = await User.findByIdAndUpdate(
      uid,
      { $inc: { [`stats.${field}`]: 1 } }
    );
    
    if (!result) {
      await User.findOneAndUpdate(
        { firebaseUid: uid },
        { $inc: { [`stats.${field}`]: 1 } }
      );
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(page: number = 1, limit: number = 20): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({}).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments({}),
    ]);
    return { users, total };
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(uid: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(uid, { isActive: false }, { new: true });
    if (!user) {
      throw NotFound('User not found');
    }
    return user;
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(uid: string): Promise<IUser> {
    const user = await User.findByIdAndUpdate(uid, { isActive: true }, { new: true });
    if (!user) {
      throw NotFound('User not found');
    }
    return user;
  }
}

export const userService = new UserService();
