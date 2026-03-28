import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';

const router: import('express').Router = Router();

// Get claims for a user by email
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { studentEmail, userEmail } = req.query;
    const email = studentEmail || userEmail;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ message: 'Email parameter is required' });
      return;
    }

    // Find user by email to get their Firebase UID
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // User not found, return empty array
      res.json({
        success: true,
        data: [],
        message: 'No user found with this email',
      });
      return;
    }

    // Get all items claimed by this user
    const claims = await Item.find({
      claimedBy: user.firebaseUid || user._id,
    })
      .sort({ claimedAt: -1, createdAt: -1 })
      .lean();

    // Map items to claim format
    const formattedClaims = claims.map((item) => ({
      _id: item._id,
      itemTitle: item.title,
      status: mapVerificationStatusToClaim(item.verificationStatus),
      claimedAt: item.claimedAt,
      createdAt: item.createdAt,
      itemType: item.itemType,
      category: item.category,
      originalItemId: item._id,
      verificationStatus: item.verificationStatus,
    }));

    res.json({
      success: true,
      data: formattedClaims,
      total: formattedClaims.length,
    });
  } catch (error) {
    next(error);
  }
});

// Get specific claim by ID
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const claim = await Item.findById(req.params.id).lean();

    if (!claim || !claim.claimedBy) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    const formattedClaim = {
      _id: claim._id,
      itemTitle: claim.title,
      status: mapVerificationStatusToClaim(claim.verificationStatus),
      claimedAt: claim.claimedAt,
      createdAt: claim.createdAt,
      itemType: claim.itemType,
      category: claim.category,
      description: claim.description,
      claimedBy: claim.claimedBy,
      verificationStatus: claim.verificationStatus,
    };

    res.json({
      success: true,
      data: formattedClaim,
    });
  } catch (error) {
    next(error);
  }
});

// Update claim status (for admin)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    ).lean();

    if (!updatedItem || !updatedItem.claimedBy) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    const formattedClaim = {
      _id: updatedItem._id,
      itemTitle: updatedItem.title,
      status: mapVerificationStatusToClaim(updatedItem.verificationStatus),
      claimedAt: updatedItem.claimedAt,
      createdAt: updatedItem.createdAt,
      verificationStatus: updatedItem.verificationStatus,
    };

    res.json({
      success: true,
      data: formattedClaim,
      message: 'Claim status updated',
    });
  } catch (error) {
    next(error);
  }
});

// Helper function to map verification status to claim status
function mapVerificationStatusToClaim(verificationStatus?: string): string {
  switch (verificationStatus) {
    case 'verified':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'pending':
    default:
      return 'pending';
  }
}

export default router;
