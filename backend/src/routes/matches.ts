import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { matchingService } from '../services/MatchingService.js';

const router: import('express').Router = Router();

// Get matches for a specific item
router.get('/item/:itemId', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const matches = await matchingService.findMatches(req.params.itemId);
    res.json({
      success: true,
      data: matches,
      total: matches.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get matches for all user's items
router.get('/user', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    // This would require fetching all user items and finding matches for each
    // For now, return empty array - implement based on your needs
    res.json({
      success: true,
      data: [],
      message: 'Get all matches for user items',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
