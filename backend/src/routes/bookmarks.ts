import { Router, Response, NextFunction } from 'express';
import { hybridAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { Bookmark } from '../models/Bookmark.js';
import { body, validationResult } from 'express-validator';

const router: import('express').Router = Router();

/**
 * POST /api/bookmarks
 * Add a bookmark for an item
 */
router.post(
  '/',
  hybridAuthMiddleware,
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
        res.status(400).json({ 
          success: false, 
          message: 'Item already bookmarked' 
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
 * GET /api/bookmarks/check/:itemId
 * Check if an item is bookmarked by the current user
 */
router.get(
  '/check/:itemId',
  hybridAuthMiddleware,
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
  hybridAuthMiddleware,
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
  hybridAuthMiddleware,
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
