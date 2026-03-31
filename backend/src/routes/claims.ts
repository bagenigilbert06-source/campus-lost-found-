import { Router } from 'express';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Claim } from '../models/Claim.js';
import { Message } from '../models/Message.js';
import { notificationService } from '../services/NotificationService.js';

const router: import('express').Router = Router();

const ADMIN_EMAILS = [
  'admin@zetech.ac.ke',
  'security@zetech.ac.ke',
  'lost-and-found@zetech.ac.ke',
  'bagenigilbert@zetech.ac.ke'
];

function isAdminUser(req: AuthRequest): boolean {
  const email = req.user?.email?.toLowerCase();
  return (req.user?.role === 'admin') || (email ? ADMIN_EMAILS.includes(email) : false);
}

/**
 * Log query diagnostics for slow queries (>100ms)
 * Helps identify COLLSCAN operations and inefficient indexes
 */
async function logSlowQueryDiagnostics(db_duration: number, query: any, collection_name: string): Promise<void> {
  if (db_duration > 100) {
    try {
      const explanation = await Claim.collection.find(query).explain('executionStats');
      const executionStats = explanation?.executionStats;
      if (executionStats) {
        const docsExamined = executionStats.totalDocsExamined || 0;
        const docsReturned = executionStats.nReturned || 0;
        const executionStages = executionStats.executionStages?.stage;
        
        console.warn(
          `[${collection_name}] SLOW QUERY (${db_duration}ms): ` +
          `Query=${JSON.stringify(query)} | ` +
          `DocsExamined=${docsExamined} | DocsReturned=${docsReturned} | ` +
          `Ratio=${(docsExamined / Math.max(docsReturned, 1)).toFixed(2)}x | ` +
          `ExecutionStage=${executionStages}`
        );
      }
    } catch (err) {
      console.warn(`[${collection_name}] Failed to get explain stats:`, (err as any).message);
    }
  }
}

// Get claims for a user by email or all claims for admin - OPTIMIZED with pagination and field selection
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  const startTime = Date.now();
  try {
    const status = req.query.status as string;
    const itemId = req.query.itemId as string;
    const studentEmail = req.query.studentEmail as string;

    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (status) query.status = status;
    if (itemId) query.itemId = itemId;

    // Select only necessary fields to reduce payload size
    const selectFields = '_id itemId itemTitle studentEmail studentName studentPhone status adminNote createdAt';

    if (isAdminUser(req)) {
      // Admin can list all claims
      const dbQueryTime = Date.now();
      const [claims, total] = await Promise.all([
        Claim.find(query)
          .select(selectFields)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Claim.countDocuments(query),
      ]);
      const dbDuration = Date.now() - dbQueryTime;
      const responseTime = Date.now() - startTime;

      // Log diagnostics for slow queries
      logSlowQueryDiagnostics(dbDuration, query, 'Claims');

      console.log(`[Claims] Admin query timing - DB: ${dbDuration}ms, Total: ${responseTime}ms, Docs: ${claims.length}/${total}, Query: ${JSON.stringify(query)}`);

      return res.json({ success: true, data: claims, total, page, limit });
    }

    const email = studentEmail || req.user?.email;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }

    query.studentEmail = email.toLowerCase().trim();
    const dbQueryTime = Date.now();
    const [claims, total] = await Promise.all([
      Claim.find(query)
        .select(selectFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Claim.countDocuments(query),
    ]);
    const dbDuration = Date.now() - dbQueryTime;
    const responseTime = Date.now() - startTime;

    // Log diagnostics for slow queries
    logSlowQueryDiagnostics(dbDuration, query, 'Claims');

    console.log(`[Claims] User query timing (${email}) - DB: ${dbDuration}ms, Total: ${responseTime}ms, Docs: ${claims.length}/${total}, Query: ${JSON.stringify(query)}`);

    return res.json({ success: true, data: claims, total, page, limit });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Claims] Route error after ${duration}ms:`, error);
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

    // Update item status to claim_in_progress if not already
    console.log('[Claims] Updating item status...');
    await Item.findByIdAndUpdate(itemId, { status: 'claim_in_progress' });
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

    if (!status || !['pending', 'approved', 'rejected', 'needs_more_proof'].includes(status)) {
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
      const recoveredBy = {
        email: claim.studentEmail,
        name: claim.studentName,
        date: new Date(),
      };

      const item = await Item.findById(claim.itemId).lean();

      await Item.findByIdAndUpdate(claim.itemId, {
        status: 'recovered',
        claimedBy: recoveredBy,
        claimedAt: new Date(),
        recoveredBy,
        recoveredAt: new Date(),
        recoveredDate: new Date(),
        recoveredLocation: item?.location || undefined,
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
    } else if (status === 'needs_more_proof') {
      const message = new Message({
        conversationId: `claim-${claim._id}`,
        itemId: claim.itemId,
        senderId: 'admin',
        senderEmail: req.user.email || 'admin@zetech.ac.ke',
        senderRole: 'admin',
        recipientId: claim.studentUId,
        recipientEmail: claim.studentEmail,
        recipientRole: 'student',
        content: `Your claim for "${claim.itemTitle}" needs more proof. Please share additional evidence: ${adminNote || 'e.g., additional photo, receipt, serial number.'}`,
        isRead: false,
      });

      await message.save();
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
