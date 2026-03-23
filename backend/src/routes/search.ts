import { Router } from 'express';
import { optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { itemService } from '../services/ItemService.js';
import { BadRequest } from '../middleware/errorHandler.js';

const router: import('express').Router = Router();

// Search nearby items
router.get('/nearby', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      throw BadRequest('Latitude and longitude are required');
    }

    const items = await itemService.searchNearby(
      parseFloat(lat as string),
      parseFloat(lng as string),
      parseFloat((radius as string) || '5')
    );

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// Search items with advanced filters
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const filters: any = {};

    if (req.query.q) {
      filters.searchTerm = req.query.q;
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.location) {
      filters.location = req.query.location;
    }

    if (req.query.itemType) {
      filters.itemType = req.query.itemType;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { items, total } = await itemService.getItems(filters, page, limit);

    res.json({
      success: true,
      data: items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
