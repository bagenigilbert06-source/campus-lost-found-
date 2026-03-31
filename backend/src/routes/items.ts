import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { itemService } from '../services/ItemService.js';
import { matchingService } from '../services/MatchingService.js';
import { notificationService } from '../services/NotificationService.js';
import { BadRequest } from '../middleware/errorHandler.js';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';


const router: import('express').Router = Router();

// Get all items (with filters)
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const filters: any = {};

    if (req.query.category) filters.category = req.query.category;
    if (req.query.location) filters.location = req.query.location;
    if (req.query.itemType) filters.itemType = req.query.itemType;
    if (req.query.userId) filters.userId = req.query.userId;
    if (req.query.email) filters.email = req.query.email as string;
    if (req.query.userEmail) filters.userEmail = req.query.userEmail as string;
    if (req.query.status) filters.status = req.query.status as string;

    const isAdmin = req.user?.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke'
    ].includes(req.user?.email?.toLowerCase() || '');

    if (!filters.status && !filters.userId && !filters.userEmail && !isAdmin && req.query.includeInactive !== 'true') {
      filters.status = 'active';
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

// Admin dashboard endpoint - get dashboard data including stats and pending items
router.get('/admin/dashboard', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const allItems = await Item.find({}).sort({ createdAt: -1 }).lean();
    const allClaims = await Claim.find({}).sort({ createdAt: -1 }).lean();
    const openMessages = await Message.find({ recipientRole: 'admin', isRead: false }).lean();
    const recentActivity = allItems.slice(0, 5);
    const pendingItems = allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').slice(0, 5);

    const stats = {
      totalItems: allItems.length,
      activeItems: allItems.filter(item => item.status === 'active').length,
      claimedItems: allItems.filter(item => item.status === 'claim_in_progress').length,
      recoveredItems: allItems.filter(item => item.status === 'recovered').length,
      pendingVerification: allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').length,
      verifiedItems: allItems.filter(item => item.verificationStatus === 'verified').length,
      rejectedItems: allItems.filter(item => item.verificationStatus === 'rejected').length,
      lostItems: allItems.filter(item => item.itemType === 'Lost' || item.postType === 'Lost').length,
      foundItems: allItems.filter(item => item.itemType === 'Found' || item.postType === 'Found').length,
      recoveredItemsByType: allItems.filter(item => item.itemType === 'Recovered' || item.postType === 'Recovered').length,
      totalUsers: await User.countDocuments({}),
      pendingClaims: allClaims.filter(claim => claim.status === 'pending').length,
      approvedClaims: allClaims.filter(claim => claim.status === 'approved').length,
      rejectedClaims: allClaims.filter(claim => claim.status === 'rejected').length,
      unreadMessages: openMessages.length,
      activeConversations: await Message.distinct('conversationId', { recipientRole: 'admin' }).then((c) => c.length),
    };

    res.json({
      success: true,
      data: {
        stats,
        pendingItems,
        recentActivity,
      },
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
      claimedItems: allItems.filter(item => item.status === 'claim_in_progress').length,
      recoveredItems: allItems.filter(item => item.status === 'recovered').length,
      pendingVerification: allItems.filter(item => !item.verificationStatus || item.verificationStatus === 'pending').length,
      verifiedItems: allItems.filter(item => item.verificationStatus === 'verified').length,
      rejectedItems: allItems.filter(item => item.verificationStatus === 'rejected').length,
      totalUsers: new Set(allItems.map(item => item.userId).filter(Boolean)).size,
      lostItems: allItems.filter(item => item.itemType === 'Lost' || item.postType === 'Lost').length,
      foundItems: allItems.filter(item => item.itemType === 'Found' || item.postType === 'Found').length,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
});

// Get recovered items by email (or all for admin)
router.get('/recovered', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const email = (req.query.email as string || '').toLowerCase().trim();

    const isAdmin = req.user?.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke'
    ].includes(req.user?.email?.toLowerCase() || '');

    if (!email && !isAdmin) {
      res.status(400).json({ success: false, message: 'Email parameter is required for non-admin users' });
      return;
    }

    // Get recovered items only
    const { items } = await itemService.getItems({ status: 'recovered' });

    const recoveredItems = items.filter((item) => {
      if (!item || item.status !== 'recovered') return false;
      if (isAdmin) return true;

      const ownerEmail = item.email?.toLowerCase().trim() || '';
      const claimedByEmail = item.claimedBy?.email?.toLowerCase().trim() || '';
      const recoveredByEmail = item.recoveredBy?.email?.toLowerCase().trim() || '';

      return [ownerEmail, claimedByEmail, recoveredByEmail].includes(email);
    });

    res.json({
      success: true,
      data: recoveredItems,
      message: recoveredItems.length > 0 ? 'Recovered items found' : 'No recovered items found',
    });
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

    const {
      title,
      description,
      category,
      location,
      dateLost,
      images,
      itemType: rawItemType,
      postType,
      subType,
      coordinates,
      email,
      name,
    } = req.body;

    const resolvedType = (postType || rawItemType || '').toString();
    const isAdmin = req.user.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke',
    ].includes(req.user.email?.toLowerCase() || '');

    if (!title || !description || !category || !location || !dateLost || !resolvedType) {
      throw BadRequest('Missing required fields');
    }

    if (!['Lost', 'Found', 'Recovered'].includes(resolvedType)) {
      throw BadRequest('Invalid post type');
    }

    if (!isAdmin && !['Lost', 'Found'].includes(resolvedType)) {
      throw BadRequest('Normal users can only create Lost or Found items');
    }

    const item = await itemService.createItem(
      {
        title,
        description,
        category,
        location,
        dateLost: new Date(dateLost),
        images: images || [],
        itemType: resolvedType,
        postType: resolvedType,
        subType,
        coordinates,
        email: email ? email.toLowerCase() : req.user.email?.toLowerCase() || '',
        name: name || req.user.displayName,
      },
      req.user.uid,
      isAdmin
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

    const isAdmin = req.user.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke',
    ].includes(req.user.email?.toLowerCase() || '');

    // Process date field if present
    const updateData = { ...req.body };
    if (updateData.dateLost && typeof updateData.dateLost === 'string') {
      updateData.dateLost = new Date(updateData.dateLost);
    }

    const item = await itemService.updateItem(req.params.id, req.user.uid, updateData, isAdmin);
    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[Items PUT] Error updating item:', {
      itemId: req.params.id,
      userId: req.user?.uid,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && error.message === 'Unauthorized to update this item') {
      res.status(403).json({ success: false, message: error.message });
      return;
    }

    next(error);
  }
});

// Patch item (for partial updates like verification)
router.patch('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;
    const user = req.user;

    const isAdmin = user.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke'
    ].includes(user.email?.toLowerCase() || '');

    const item = await itemService.updateItem(id, user.uid, updateData, isAdmin);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error) {
    console.error('[v0] Patch item error:', error);
    if (error instanceof Error && error.message === 'Unauthorized to update this item') {
      res.status(403).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
});

// Delete item
router.delete('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const { id } = req.params;
    const item = await Item.findById(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    const isAdmin = req.user.role === 'admin' || [
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke',
      'lost-and-found@zetech.ac.ke',
      'bagenigilbert@zetech.ac.ke',
    ].includes(req.user.email?.toLowerCase() || '');

    if (!isAdmin && item.userId !== req.user.uid) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this item' });
      return;
    }

    await Item.findByIdAndDelete(id);

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
