import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { itemService } from '../services/ItemService.js';
import { matchingService } from '../services/MatchingService.js';
import { notificationService } from '../services/NotificationService.js';
import { BadRequest } from '../middleware/errorHandler.js';
import { Item } from '../models/Item.js';

const router: import('express').Router = Router();

// Get all items (with filters)
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const filters: any = {};

    if (req.query.category) filters.category = req.query.category;
    if (req.query.location) filters.location = req.query.location;
    if (req.query.itemType) filters.itemType = req.query.itemType;
    if (req.query.userId) filters.userId = req.query.userId;

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

// Admin dashboard endpoint - get dashboard data including stats and pending items
router.get('/admin/dashboard', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    // Get all items regardless of status (for admin)
    const allItems = await Item.find({}).sort({ createdAt: -1 }).lean();
    
    const pendingItems = allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').slice(0, 5);
    const recentActivity = allItems.slice(0, 5);
    
    const stats = {
      totalItems: allItems.length,
      activeItems: allItems.filter(item => item.status === 'active').length,
      claimedItems: allItems.filter(item => item.status === 'claimed').length,
      recoveredItems: allItems.filter(item => item.status === 'recovered').length,
      pendingVerification: allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').length,
      verifiedItems: allItems.filter(item => item.verificationStatus === 'verified').length,
      rejectedItems: allItems.filter(item => item.verificationStatus === 'rejected').length,
      totalUsers: new Set(allItems.map(item => item.userId).filter(Boolean)).size,
      lostItems: allItems.filter(item => item.itemType === 'Lost').length,
      foundItems: allItems.filter(item => item.itemType === 'Found').length,
      unreadMessages: 0, // Placeholder for future implementation
    };

    res.json({ 
      success: true, 
      data: {
        stats,
        pendingItems,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
});

// Admin stats endpoint - get all items including recovered/claimed
router.get('/admin/stats', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    // Get all items regardless of status (for admin)
    const allItems = await Item.find({});
    
    const stats = {
      totalItems: allItems.length,
      activeItems: allItems.filter(item => item.status === 'active').length,
      claimedItems: allItems.filter(item => item.status === 'claimed').length,
      recoveredItems: allItems.filter(item => item.status === 'recovered').length,
      pendingVerification: allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').length,
      verifiedItems: allItems.filter(item => item.verificationStatus === 'verified').length,
      rejectedItems: allItems.filter(item => item.verificationStatus === 'rejected').length,
      totalUsers: new Set(allItems.map(item => item.userId).filter(Boolean)).size,
      lostItems: allItems.filter(item => item.itemType === 'Lost').length,
      foundItems: allItems.filter(item => item.itemType === 'Found').length,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get item by ID
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Create item (auth required)
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { title, description, category, location, dateLost, images, itemType, coordinates } = req.body;

    if (!title || !description || !category || !location || !dateLost || !itemType) {
      throw BadRequest('Missing required fields');
    }

    const item = await itemService.createItem(
      {
        title,
        description,
        category,
        location,
        dateLost: new Date(dateLost),
        images: images || [],
        itemType,
        coordinates,
      },
      req.user.uid
    );

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Update item
router.put('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const item = await itemService.updateItem(req.params.id, req.user.uid, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Patch item (for partial updates like verification)
router.patch('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const item = await Item.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Delete item
router.delete('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;

    // Try to delete the item
    const item = await Item.findByIdAndDelete(id);
    
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    console.log('[v0] Item deleted:', id);
    res.json({ success: true, message: 'Item deleted successfully', data: item });
  } catch (error) {
    console.error('[v0] Error deleting item:', error);
    next(error);
  }
});

// Claim/recover item
router.post('/:id/claim', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const item = await itemService.claimItem(req.params.id, req.user.uid);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

// Get user's items
router.get('/user/:userId', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { items } = await itemService.getItems({ userId: req.params.userId });
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
});

// Get recovered items by email
router.get('/recovered', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const email = req.query.email as string;
    
    if (!email) {
      res.status(400).json({ success: false, message: 'Email parameter is required' });
      return;
    }

    // Get items where the current user has claimed/recovered them
    const { items } = await itemService.getItems({ status: 'recovered' });
    
    // Filter items by the email of the person who recovered them
    const recoveredItems = items.filter(item => 
      (item.recoveredBy && item.recoveredBy.email === email) || 
      (item.claimedBy && item.claimedBy.email === email)
    );
    
    res.json({ 
      success: true, 
      data: recoveredItems,
      message: recoveredItems.length > 0 ? 'Recovered items found' : 'No recovered items found'
    });
  } catch (error) {
    next(error);
  }
});

// Get matches for an item
router.get('/:id/matches', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const matches = await matchingService.findMatches(req.params.id);
    res.json({ success: true, data: matches });
  } catch (error) {
    next(error);
  }
});

// Claim item with notification
router.post('/:id/claim-with-notification', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const item = await itemService.claimItem(req.params.id, req.user.uid);

    // Send notification to item owner
    if (item.userId) {
      await notificationService.notifyItemRecovery(item.userId, item.title);
    }

    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
});

export default router;
