import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { Bookmark } from '../models/Bookmark.js';
import { body, validationResult } from 'express-validator';

const router: import('express').Router = Router();

/**
 * POST /api/bookmarks
 * Add a bookmark for an item
 */
router.post(
  '/',
  authMiddleware,
  [
    body('itemId').trim().notEmpty().withMessage('Item ID is required'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
        return;
      }

      const { itemId } = req.body;
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findOne({ userId, itemId });
      if (existingBookmark) {
        // Idempotent behavior: if already bookmarked, return success
        res.status(200).json({
          success: true,
          message: 'Item already bookmarked',
          bookmark: existingBookmark,
          alreadyExists: true,
        });
        return;
      }

      // Create new bookmark
      const bookmark = new Bookmark({ userId, itemId });
      await bookmark.save();

      res.status(201).json({
        success: true,
        message: 'Item bookmarked successfully',
        bookmark,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/bookmarks/check-batch
 * Check bookmark status for multiple items in one request
 * Reduces N+1 problem when checking many items
 */
router.post(
  '/check-batch',
  authMiddleware,
  [
    body('itemIds').isArray({ min: 1 }).withMessage('itemIds must be a non-empty array'),
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
        return;
      }

      const { itemIds } = req.body;
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      // Fetch all bookmarks for these items in one query
      const bookmarks = await Bookmark.find({ userId, itemId: { $in: itemIds } });
      const bookmarkedIds = new Set(bookmarks.map(b => b.itemId));

      // Build response mapping itemId -> isBookmarked
      const result: Record<string, boolean> = {};
      itemIds.forEach((itemId: string) => {
        result[itemId] = bookmarkedIds.has(itemId);
      });

      res.json({
        success: true,
        bookmarks: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/bookmarks/check/:itemId
 * Check if an item is bookmarked by the current user
 */
router.get(
  '/check/:itemId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const bookmark = await Bookmark.findOne({ userId, itemId });
      res.json({
        success: true,
        isBookmarked: !!bookmark,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/bookmarks/:itemId
 * Remove a bookmark for an item
 */
router.delete(
  '/:itemId',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { itemId } = req.params;
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const result = await Bookmark.findOneAndDelete({ userId, itemId });

      if (!result) {
        res.status(404).json({
          success: false,
          message: 'Bookmark not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Bookmark removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/bookmarks
 * Get all bookmarks for the current user
 */
router.get(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.uid;

      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const bookmarks = await Bookmark.find({ userId })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
