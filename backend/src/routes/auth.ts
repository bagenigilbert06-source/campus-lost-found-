import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/UserService.js';
import { body, validationResult } from 'express-validator';

const router: import('express').Router = Router();

// ============================================
// FIREBASE AUTH ROUTES
// ============================================

/**
 * POST /auth/register
 * Register or sync Firebase user to MongoDB
 */
router.post('/register', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { email: bodyEmail, displayName, photoURL, role } = req.body || {};
    const emailToUse = (bodyEmail || req.user.email || '').trim();

    if (!emailToUse) {
      throw new Error('Email is required to register or sync user profile.');
    }

    // Get or create user in MongoDB
    const user = await userService.getOrCreateUser(
      req.user.uid,
      emailToUse,
      (displayName || req.user.displayName || 'User').trim(),
      (photoURL || req.user.photoURL || '').trim(),
      role // Pass role for admin setup
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

    // Get user from database
    const user = await userService.getUserById(req.user.uid);

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
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/update-profile
 * Update user profile information
 */
router.post('/update-profile', authMiddleware, [
  body('displayName').optional().trim().notEmpty().withMessage('Display name cannot be empty'),
  body('location').optional().trim(),
  body('phone').optional().trim(),
  body('studentId').optional().trim(),
  body('department').optional().trim(),
  body('address').optional().trim(),
  body('emergency_contact').optional().trim(),
  body('emergency_phone').optional().trim(),
  body('bio').optional().trim(),
], async (req: AuthRequest, res: Response, next: NextFunction) => {
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

    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const updateData = req.body;
    const user = await userService.updateUserProfile(req.user.uid, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        displayName: user.displayName,
        profileImage: user.profileImage,
        location: user.location,
        phone: user.phone,
        studentId: user.studentId,
        department: user.department,
        address: user.address,
        emergency_contact: user.emergency_contact,
        emergency_phone: user.emergency_phone,
        bio: user.bio,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
