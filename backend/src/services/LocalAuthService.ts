import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// JWT secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'campus-lost-found-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Admin emails list (should match frontend config)
const ADMIN_EMAILS = [
  'bagenigilbert@zetech.ac.ke',
  'admin@zetech.ac.ke',
  'security@zetech.ac.ke'
];

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    email: string;
    displayName: string;
    role: string;
    authProvider: string;
    profileImage?: string;
  };
  token?: string;
}

export class LocalAuthService {
  /**
   * Determine role based on email
   */
  private determineRole(email: string): 'admin' | 'student' {
    return ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'student';
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        uid: user._id,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   */
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register a new user with email/password (local auth)
   */
  async register(
    email: string,
    password: string,
    displayName: string,
    photoURL?: string
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        // If user exists with Google auth, they should use Google login
        if (existingUser.authProvider === 'google') {
          return {
            success: false,
            message: 'An account with this email already exists. Please sign in with Google.',
          };
        }
        return {
          success: false,
          message: 'An account with this email already exists. Please sign in.',
        };
      }

      // Validate password strength
      if (password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters long.',
        };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Determine role
      const role = this.determineRole(email);

      // Create new user
      const userId = uuidv4();
      const user = new User({
        _id: userId,
        email: email.toLowerCase(),
        displayName,
        passwordHash,
        profileImage: photoURL || '',
        role,
        authProvider: 'local',
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
        ...(role === 'student' && {
          studentProfile: {
            onboardingComplete: false,
            preferences: {},
            createdAt: new Date().toISOString(),
          },
        }),
        ...(role === 'admin' && {
          adminProfile: {
            permissions: ['verify_items', 'manage_users', 'view_reports'],
            createdAt: new Date().toISOString(),
          },
        }),
      });

      await user.save();

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Registration successful',
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
        },
        token,
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return {
          success: false,
          message: 'An account with this email already exists.',
        };
      }
      
      return {
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Login with email/password (local auth)
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password.',
        };
      }

      // Check if user uses Google auth
      if (user.authProvider === 'google') {
        return {
          success: false,
          message: 'This account uses Google Sign-In. Please sign in with Google.',
        };
      }

      // Check if user has a password (local auth)
      if (!user.passwordHash) {
        return {
          success: false,
          message: 'Invalid email or password.',
        };
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.passwordHash);
      
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password.',
        };
      }

      // Check if account is active
      if (!user.isActive) {
        return {
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        };
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        success: true,
        message: 'Login successful',
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  }

  /**
   * Verify JWT token and return user data
   */
  async verifyToken(token: string): Promise<AuthResponse> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        uid: string;
        email: string;
        role: string;
        authProvider: string;
      };

      const user = await User.findById(decoded.uid);

      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      if (!user.isActive) {
        return {
          success: false,
          message: 'Account has been deactivated.',
        };
      }

      return {
        success: true,
        message: 'Token valid',
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          authProvider: user.authProvider,
          profileImage: user.profileImage,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token.',
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      if (user.authProvider !== 'local') {
        return { success: false, message: 'Password change not available for Google accounts.' };
      }

      if (!user.passwordHash) {
        return { success: false, message: 'Invalid account configuration.' };
      }

      const isValidPassword = await this.comparePassword(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      if (newPassword.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters.' };
      }

      user.passwordHash = await this.hashPassword(newPassword);
      await user.save();

      return { success: true, message: 'Password updated successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to update password.' };
    }
  }
}

export const localAuthService = new LocalAuthService();
