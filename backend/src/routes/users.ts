import { Router, Response, NextFunction } from 'express';
import { optionalAuthMiddleware, authMiddleware, adminOnlyMiddleware, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/UserService.js';
import { Item } from '../models/Item.js';
import { User } from '../models/User.js';
import { BadRequest, NotFound } from '../middleware/errorHandler.js';

const router: import('express').Router = Router();

// Normalize image URLs to avoid insecure localhost references in production
const normalizeImageUrl = (url: string | undefined | null) => {
  if (!url || typeof url !== 'string') return url;
  if (/^https?:\/\/localhost(:\d+)?/.test(url)) {
    const backendBaseUrl = (process.env.BACKEND_URL || '').replace(/\/$/, '');
    if (backendBaseUrl) {
      return `${backendBaseUrl}${url.replace(/^https?:\/\/localhost(:\d+)?/, '')}`;
    }
    return url.replace(/^http:\/\//, 'https://');
  }
  return url;
};

/**
 * GET /users/profile?email=...
 * Get user profile data including settings and preferences
 */
router.get('/', adminOnlyMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const sortBy = (req.query.sortBy as string) || '-createdAt';
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (search.trim()) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.query.role) {
      query.role = req.query.role;
    }

    if (req.query.isActive) {
      query.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(query)
      .sort({ [sortBy.replace('-', '')]: sortBy.startsWith('-') ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profile', optionalAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      throw BadRequest('Email parameter is required');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Return empty object if user not found (for graceful degradation)
      res.json({
        success: true,
        data: {}
      });
      return;
    }

    // Return user profile data
    res.json({
      success: true,
      data: {
        email: user.email,
        displayName: user.displayName,
        profileImage: normalizeImageUrl(user.profileImage),
        location: user.location,
        phone: user.phone,
        studentId: user.studentId,
        department: user.department,
        address: user.address,
        dateOfBirth: user.dateOfBirth,
        emergency_contact: user.emergency_contact,
        emergency_phone: user.emergency_phone,
        bio: user.bio,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        settings: user.notificationPreferences,
        studentProfile: user.studentProfile,
        adminProfile: user.adminProfile,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/activity?email=...&limit=10
 * Get user activity log (items posted, claimed, recovered)
 */
router.get('/activity', optionalAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!email || typeof email !== 'string') {
      throw BadRequest('Email parameter is required');
    }

    // Find all items related to this user
    const items = await Item.find({ email: email.toLowerCase() })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .lean();

    // Transform items into activity log format
    const activityLog = items.map((item) => ({
      id: item._id,
      type: item.itemType === 'Found' ? 'found' : 'lost',
      title: item.title,
      category: item.category,
      location: item.location,
      status: item.status,
      date: item.uploadedAt || item.dateLost,
      description: item.description,
      verificationStatus: item.verificationStatus,
    }));

    res.json({
      success: true,
      data: activityLog
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /users/stats?email=...
 * Get user statistics
 */
router.get('/stats', optionalAuthMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      throw BadRequest('Email parameter is required');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      // Return default stats if user not found
      res.json({
        success: true,
        data: {
          itemsPosted: 0,
          itemsRecovered: 0,
          itemsClaimed: 0,
          totalMatches: 0,
        }
      });
      return;
    }

    // Get actual counts from items collection for accuracy
    const userItems = await Item.find({ email: email.toLowerCase() });
    
    const stats = {
      itemsPosted: userItems.filter(item => item.itemType === 'Lost' || item.itemType === 'Found').length,
      itemsRecovered: userItems.filter(item => item.status === 'recovered').length,
      itemsClaimed: userItems.filter(item => item.status === 'claim_in_progress').length,
      totalMatches: 0, // Placeholder for future implementation
      activeItems: userItems.filter(item => item.status === 'active').length,
      pendingVerification: userItems.filter(item => item.verificationStatus === 'pending').length,
      verifiedItems: userItems.filter(item => item.verificationStatus === 'verified').length,
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /users/profile
 * Update user profile data (displayName, location, profileImage, notification preferences)
 */
router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      email, 
      displayName, 
      fullName,
      location, 
      profileImage, 
      settings,
      phone,
      studentId,
      department,
      address,
      dateOfBirth,
      emergency_contact,
      emergency_phone,
      bio
    } = req.body;

    if (!email || typeof email !== 'string') {
      throw BadRequest('Email is required');
    }

    // Verify the authenticated user is updating their own profile
    if (req.user?.email && req.user.email.toLowerCase() !== email.toLowerCase()) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
      return;
    }

    // Build update object with only provided fields
    const updateData: any = {};
    // Handle both displayName and fullName (frontend sends fullName, backend uses displayName)
    if (displayName !== undefined) updateData.displayName = displayName;
    if (fullName !== undefined) updateData.displayName = fullName;
    
    if (location !== undefined) updateData.location = location;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (settings !== undefined) updateData.notificationPreferences = settings;
    
    // Add all other profile fields
    if (phone !== undefined) updateData.phone = phone;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (department !== undefined) updateData.department = department;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (emergency_contact !== undefined) updateData.emergency_contact = emergency_contact;
    if (emergency_phone !== undefined) updateData.emergency_phone = emergency_phone;
    if (bio !== undefined) updateData.bio = bio;

    // Update user in database
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw NotFound('User not found');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        profileImage: normalizeImageUrl(updatedUser.profileImage),
        location: updatedUser.location,
        phone: updatedUser.phone,
        studentId: updatedUser.studentId,
        department: updatedUser.department,
        address: updatedUser.address,
        dateOfBirth: updatedUser.dateOfBirth,
        emergency_contact: updatedUser.emergency_contact,
        emergency_phone: updatedUser.emergency_phone,
        bio: updatedUser.bio,
        settings: updatedUser.notificationPreferences,
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /users/settings
 * Update user notification settings/preferences
 */
router.patch('/:id/status', adminOnlyMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { isActive } = req.body;
    const { id } = req.params;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive boolean is required' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.put('/settings', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, settings } = req.body;

    if (!email || typeof email !== 'string') {
      throw BadRequest('Email is required');
    }

    if (!settings || typeof settings !== 'object') {
      throw BadRequest('Settings object is required');
    }

    // Verify the authenticated user is updating their own settings
    if (req.user?.email && req.user.email.toLowerCase() !== email.toLowerCase()) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own settings'
      });
      return;
    }

    // Update user notification preferences in database
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { notificationPreferences: settings },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw NotFound('User not found');
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        email: updatedUser.email,
        settings: updatedUser.notificationPreferences,
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
