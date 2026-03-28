import { Router, Response, NextFunction } from 'express';
import { authMiddleware, localAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/UserService.js';
import { localAuthService } from '../services/LocalAuthService.js';
import { body, validationResult } from 'express-validator';
import { BadRequest } from '../middleware/errorHandler.js';

const router: import('express').Router = Router();

// ============================================
// LOCAL AUTH ROUTES (Email/Password)
// ============================================

/**
 * POST /auth/local/register
 * Register a new user with email and password
 */
router.post('/local/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('displayName').trim().notEmpty().withMessage('Display name is required'),
  body('photoURL').optional().isURL(),
], async (req, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
      return;
    }

    const { email, password, displayName, photoURL } = req.body;
    
    const result = await localAuthService.register(email, password, displayName, photoURL);
    
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/local/login
 * Login with email and password
 */
router.post('/local/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
      return;
    }

    const { email, password } = req.body;
    
    const result = await localAuthService.login(email, password);
    
    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/local/verify
 * Verify a local JWT token
 */
router.post('/local/verify', async (req, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const result = await localAuthService.verifyToken(token);
    
    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /auth/local/password
 * Update password for local auth users
 */
router.put('/local/password', localAuthMiddleware, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const result = await localAuthService.updatePassword(req.user.uid, currentPassword, newPassword);
    
    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// FIREBASE/GOOGLE AUTH ROUTES
// ============================================

/**
 * POST /auth/register
 * Register or sync Firebase/Google user to MongoDB
 */
router.post('/register', authMiddleware, [
  body('email').isEmail(),
  body('displayName').optional({ checkFalsy: true }).isString().trim(),
  body('photoURL').optional({ checkFalsy: true }).isURL(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw BadRequest('Invalid input fields');
    }

    const { email, displayName, photoURL, role } = req.body;
    
    // Get or create user in MongoDB
    const user = await userService.getOrCreateUser(
      req.user.uid,
      email || req.user.email || '',
      displayName || req.user.displayName || 'User',
      photoURL || req.user.photoURL || '',
      role // Pass role for Google users
    );

    res.status(user.isNew ? 201 : 200).json({
      success: true,
      message: user.isNew ? 'User registered successfully' : 'User synced successfully',
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/verify
 * Verify Firebase token and get/create user
 */
router.post('/verify', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userService.getOrCreateUser(
      req.user.uid,
      req.user.email || '',
      'User'
    );

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /auth/me
 * Get current user (works with both Firebase and local tokens)
 */
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    // Try local token verification first
    const localResult = await localAuthService.verifyToken(token);
    if (localResult.success && localResult.user) {
      res.json({ success: true, user: localResult.user });
      return;
    }

    // Fall back to Firebase verification
    try {
      const { getFirebaseAuth } = await import('../config/firebase.js');
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);
      
      const user = await userService.getUserById(decodedToken.uid);
      res.json({ 
        success: true, 
        user: {
          _id: user._id,
          email: user.email,
          displayName: user.displayName,
          profileImage: user.profileImage,
          location: user.location,
          role: user.role,
          authProvider: user.authProvider,
        }
      });
    } catch (firebaseError) {
      res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /auth/profile
 * Update user profile (works with both auth methods)
 */
router.put('/profile', [
  body('displayName').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('profileImage').optional().isURL(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw BadRequest('Invalid input fields');
    }

    // Get user ID from token (try local first, then Firebase)
    let userId: string | null = null;
    
    const localResult = await localAuthService.verifyToken(token);
    if (localResult.success && localResult.user) {
      userId = localResult.user._id;
    } else {
      try {
        const { getFirebaseAuth } = await import('../config/firebase.js');
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (e) {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const user = await userService.updateUserProfile(userId, req.body);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /auth/notifications
 * Update notification preferences
 */
router.put('/notifications', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    // Get user ID from token
    let userId: string | null = null;
    
    const localResult = await localAuthService.verifyToken(token);
    if (localResult.success && localResult.user) {
      userId = localResult.user._id;
    } else {
      try {
        const { getFirebaseAuth } = await import('../config/firebase.js');
        const decodedToken = await getFirebaseAuth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (e) {
        res.status(401).json({ success: false, message: 'Invalid token' });
        return;
      }
    }

    if (!userId) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const { emailOnMatch, emailOnRecovery, emailOnVerification, emailWeeklyDigest } = req.body;

    const preferences = {
      emailOnMatch: typeof emailOnMatch === 'boolean' ? emailOnMatch : true,
      emailOnRecovery: typeof emailOnRecovery === 'boolean' ? emailOnRecovery : true,
      emailOnVerification: typeof emailOnVerification === 'boolean' ? emailOnVerification : true,
      emailWeeklyDigest: typeof emailWeeklyDigest === 'boolean' ? emailWeeklyDigest : false,
    };

    const user = await userService.updateNotificationPreferences(userId, preferences);
    res.json({ success: true, preferences: user.notificationPreferences });
  } catch (error) {
    next(error);
  }
});

export default router;
