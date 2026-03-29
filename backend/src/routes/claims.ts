import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { Message } from '../models/Message.js';
import { notificationService } from '../services/NotificationService.js';

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

    // Get all claims for this student
    const claims = await Claim.find({
      studentEmail: email.toLowerCase().trim(),
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: claims,
      total: claims.length,
    });
  } catch (error) {
    next(error);
  }
});

// Submit a new claim
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const {
      itemId,
      itemTitle,
      claimantName,
      claimantEmail,
      claimantPhone,
      claimantStudentId,
      proofOfOwnership,
      claimNotes,
    } = req.body;

    console.log('[Claims] Received claim data:', {
      itemId,
      itemTitle,
      claimantName,
      claimantEmail,
      claimantPhone,
      claimantStudentId,
      proofOfOwnership: proofOfOwnership?.substring(0, 50) + '...',
      claimNotes: claimNotes?.substring(0, 50) + '...',
    });

    if (!itemId || !itemTitle || !claimantName || !claimantEmail || !claimantPhone || !claimantStudentId || !proofOfOwnership) {
      res.status(400).json({ message: 'Missing required claim fields' });
      return;
    }

    // Create the claim
    const claim = new Claim({
      itemId,
      itemTitle,
      studentId: claimantStudentId,
      studentEmail: claimantEmail.toLowerCase(),
      studentName: claimantName,
      studentPhone: claimantPhone,
      studentUId: req.user.uid,
      claimMessage: claimNotes || '',
      proofOfOwnership,
      status: 'pending',
    });

    console.log('[Claims] Saving claim...');
    await claim.save();
    console.log('[Claims] Claim saved successfully');

    // Update item status to claimed if not already
    console.log('[Claims] Updating item status...');
    await Item.findByIdAndUpdate(itemId, { status: 'claimed' });
    console.log('[Claims] Item status updated');

    // Create a message thread for this claim (automatically notify admin)
    console.log('[Claims] Creating message...');
    const message = new Message({
      conversationId: `claim-${claim._id}`,
      itemId,
      senderId: req.user.uid,
      senderEmail: claimantEmail.toLowerCase(),
      senderRole: 'student',
      recipientId: 'admin',
      recipientEmail: 'admin@zetech.ac.ke',
      recipientRole: 'admin',
      content: `New claim submitted for item "${itemTitle}". Student claims: ${proofOfOwnership}`,
      isRead: false,
    });

    await message.save();
    console.log('[Claims] Message saved');

    // Notify admin about the new claim
    try {
      console.log('[Claims] Creating notification...');
      await notificationService.createNotification({
        userId: 'admin',
        type: 'match',
        itemId,
        title: `New Claim Submitted`,
        message: `${claimantName} has claimed "${itemTitle}". Review the claim details.`,
      });
      console.log('[Claims] Notification created');
    } catch (notifError) {
      console.warn('[v0] Notification creation failed:', notifError);
    }

    res.status(201).json({
      success: true,
      data: claim,
      message: 'Claim submitted successfully',
    });
  } catch (error) {
    console.error('[Claims] Error creating claim:', error);
    next(error);
  }
});

// Get specific claim by ID
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id).lean();

    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    res.json({
      success: true,
      data: claim,
    });
  } catch (error) {
    next(error);
  }
});

// Update claim status (for admin)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const { status, adminNote } = req.body;

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status value' });
      return;
    }

    const claim = await Claim.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote,
        adminId: req.user.uid,
        adminEmail: req.user.email || 'admin',
        reviewedAt: new Date(),
      },
      { new: true }
    );

    if (!claim) {
      res.status(404).json({ message: 'Claim not found' });
      return;
    }

    // Update item status if claim is approved
    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.itemId, {
        status: 'recovered',
        claimedBy: {
          email: claim.studentEmail,
          name: claim.studentName,
          date: new Date(),
        },
        claimedAt: new Date(),
      });

      // Notify student that their claim was approved
      const message = new Message({
        conversationId: `claim-${claim._id}`,
        itemId: claim.itemId,
        senderId: 'admin',
        senderEmail: req.user.email || 'admin@zetech.ac.ke',
        senderRole: 'admin',
        recipientId: claim.studentUId,
        recipientEmail: claim.studentEmail,
        recipientRole: 'student',
        content: `Your claim for "${claim.itemTitle}" has been APPROVED! Please come to the security office to collect the item. Note: ${adminNote || 'No additional notes'}`,
        isRead: false,
      });

      await message.save();

      // Create notification for student
      try {
        await notificationService.createNotification({
          userId: claim.studentUId,
          type: 'recovery',
          itemId: claim.itemId,
          title: 'Claim Approved',
          message: `Your claim for "${claim.itemTitle}" has been approved! Come to security office to collect it.`,
        });
      } catch (notifError) {
        console.warn('[v0] Student notification failed:', notifError);
      }
    } else if (status === 'rejected') {
      // Notify student that their claim was rejected
      const message = new Message({
        conversationId: `claim-${claim._id}`,
        itemId: claim.itemId,
        senderId: 'admin',
        senderEmail: req.user.email || 'admin@zetech.ac.ke',
        senderRole: 'admin',
        recipientId: claim.studentUId,
        recipientEmail: claim.studentEmail,
        recipientRole: 'student',
        content: `Your claim for "${claim.itemTitle}" has been REJECTED. Reason: ${adminNote || 'Proof of ownership was insufficient'}`,
        isRead: false,
      });

      await message.save();
    }

    res.json({
      success: true,
      data: claim,
      message: `Claim status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
