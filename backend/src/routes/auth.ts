import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/UserService.js';
import { body, validationResult } from 'express-validator';
import { BadRequest } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router: import('express').Router = Router();

// Helper function to generate JWT token
const generateToken = (userId: string, email: string, displayName: string, photoURL?: string): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  return jwt.sign(
    { id: userId, email, displayName, photoURL },
    secret,
    { expiresIn: '7d' }
  );
};

// Local signup endpoint
router.post('/signup', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('displayName').isString().trim(),
], async (req: Response, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw BadRequest('Invalid input fields');
    }

    const { email, password, displayName } = req.body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ success: false, message: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with hashed password
    const user = await userService.getOrCreateUser(
      email, // Use email as ID
      email,
      displayName,
      '',
      hashedPassword
    );

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.displayName);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Local login endpoint
router.post('/login', [
  body('email').isEmail(),
  body('password').isString(),
], async (req: Response, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw BadRequest('Invalid input fields');
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await userService.getUserByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user._id, user.email, user.displayName);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Register or sync user (handles both Firebase and Google OAuth users)
router.post('/register', authMiddleware, [
  body('email').isEmail(),
  body('displayName').optional().isString().trim(),
  body('photoURL').optional().isURL(),
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

    const { email, displayName, photoURL } = req.body;
    
    // Get or create user in MongoDB
    const user = await userService.getOrCreateUser(
      req.user.uid,
      email || req.user.email || '',
      displayName || req.user.displayName || 'User',
      photoURL || req.user.photoURL || ''
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Verify token and get user
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
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userService.getUserById(req.user.uid);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Update user profile with validation
router.put('/profile', authMiddleware, [
  body('displayName').optional().isString().trim(),
  body('location').optional().isString().trim(),
  body('profileImage').optional().isURL(),
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

    const user = await userService.updateUserProfile(req.user.uid, req.body);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Update notification preferences
router.put('/notifications', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { emailOnMatch, emailOnRecovery, emailOnVerification, emailWeeklyDigest } = req.body;

    const preferences = {
      emailOnMatch: typeof emailOnMatch === 'boolean' ? emailOnMatch : true,
      emailOnRecovery: typeof emailOnRecovery === 'boolean' ? emailOnRecovery : true,
      emailOnVerification: typeof emailOnVerification === 'boolean' ? emailOnVerification : true,
      emailWeeklyDigest: typeof emailWeeklyDigest === 'boolean' ? emailWeeklyDigest : false,
    };

    const user = await userService.updateNotificationPreferences(req.user.uid, preferences);
    res.json({ success: true, preferences: user.notificationPreferences });
  } catch (error) {
    next(error);
  }
});

export default router;
