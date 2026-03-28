import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { userService } from '../services/UserService.js';
import { notificationService } from '../services/NotificationService.js';

const router: import('express').Router = Router();

// Get notification preferences
router.get('/preferences', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userService.getUserById(req.user.uid);
    res.json({
      success: true,
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
});

// Update notification preferences
router.put('/preferences', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userService.updateNotificationPreferences(req.user.uid, req.body);
    res.json({
      success: true,
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    next(error);
  }
});

// Send test email notification
router.post('/send-test', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const user = await userService.getUserById(req.user.uid);

    // Send test notification
    await notificationService.notifyItemMatch(
      req.user.uid,
      'Your Lost Item Title',
      'matched-item-id',
      'Matched Found Item Title'
    );

    res.json({
      success: true,
      message: 'Test notification sent to your email',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
});

// Get user's notifications
router.get('/history', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await notificationService.getUserNotifications(req.user.uid, limit);

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
