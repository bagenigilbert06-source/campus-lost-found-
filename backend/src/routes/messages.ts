import express from 'express';
import { AuthRequest, optionalAuthMiddleware, adminOnlyMiddleware } from '../middleware/auth.js';
import { Message } from '../models/Message.js';
import { Item } from '../models/Item.js';

const router: import('express').Router = express.Router();

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
 * Log query diagnostics for slow queries (>500ms)
 * Helps identify COLLSCAN operations and inefficient indexes
 */
async function logSlowQueryDiagnostics(db_duration: number, query: any, collection_name: string): Promise<void> {
  if (db_duration > 500) {
    try {
      const explanation = await Message.collection.find(query).explain('executionStats');
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

// List messages by role / recipient / conversation - OPTIMIZED with filters, pagination, and field selection
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  const startTime = Date.now();
  try {
    // Parse pagination parameters
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    // Select only necessary fields to reduce payload size
    const selectFields = '_id conversationId itemId senderId senderEmail senderRole recipientEmail recipientRole content isRead createdAt';

    // Admin can view all with full filtering
    if (isAdminUser(req)) {
      const adminQuery: any = {};
      
      // For admin, apply all query filters as-is
      if (req.query.conversationId) adminQuery.conversationId = req.query.conversationId;
      if (req.query.itemId) adminQuery.itemId = req.query.itemId;
      if (req.query.recipientEmail) adminQuery.recipientEmail = (req.query.recipientEmail as string).toLowerCase();
      if (req.query.senderEmail) adminQuery.senderEmail = (req.query.senderEmail as string).toLowerCase();
      if (req.query.recipientRole) adminQuery.recipientRole = req.query.recipientRole;
      if (req.query.senderRole) adminQuery.senderRole = req.query.senderRole;

      const dbQueryTime = Date.now();
      const [messages, total] = await Promise.all([
        Message.find(adminQuery)
          .select(selectFields)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Message.countDocuments(adminQuery),
      ]);
      const dbDuration = Date.now() - dbQueryTime;
      const responseTime = Date.now() - startTime;

      logSlowQueryDiagnostics(dbDuration, adminQuery, 'Messages');
      console.log(`[Messages] Admin: DB=${dbDuration}ms, Response=${responseTime}ms, Returned=${messages.length}, Total=${total}, Page=${page}/${Math.ceil(total / limit)}`);

      return res.json({ success: true, data: messages, total, page, limit });
    }

    // Non-admin user: only their own messages - enforce user boundary
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const email = req.user.email.toLowerCase();
    
    // Build user query that respects their boundaries
    const userQuery: any = {
      $or: [
        { recipientEmail: email },
        { senderEmail: email }
      ]
    };

    // Allow safe filters for non-admin users (ignore email filters, apply other criteria)
    if (req.query.itemId) userQuery.itemId = req.query.itemId;
    if (req.query.conversationId) userQuery.conversationId = req.query.conversationId;
    // Allow filtering by role of the OTHER party
    if (req.query.senderRole) userQuery.senderRole = req.query.senderRole;
    if (req.query.recipientRole) userQuery.recipientRole = req.query.recipientRole;

    const dbQueryTime = Date.now();
    const [messages, total] = await Promise.all([
      Message.find(userQuery)
        .select(selectFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments(userQuery),
    ]);
    const dbDuration = Date.now() - dbQueryTime;
    const responseTime = Date.now() - startTime;

    logSlowQueryDiagnostics(dbDuration, userQuery, 'Messages');
    console.log(`[Messages] User ${email}: DB=${dbDuration}ms, Response=${responseTime}ms, Returned=${messages.length}, Total=${total}, Page=${page}/${Math.ceil(total / limit)}`);

    return res.json({ success: true, data: messages, total, page, limit });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Messages] Route error after ${duration}ms:`, error);
    next(error);
  }
});

// Get a single message by ID
router.get('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const message = await Message.findById(req.params.id).lean();

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!isAdminUser(req) && req.user?.email?.toLowerCase() !== message.recipientEmail && req.user?.email?.toLowerCase() !== message.senderEmail) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Create a message entry
router.post('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const {
      conversationId,
      itemId,
      senderId,
      senderEmail,
      senderRole,
      recipientId,
      recipientEmail,
      recipientRole,
      content,
    } = req.body;

    if (!conversationId || !itemId || !senderEmail || !senderRole || !recipientEmail || !recipientRole || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const message = new Message({
      conversationId,
      itemId,
      senderId: senderId || (req.user?.uid || 'anonymous'),
      senderEmail,
      senderRole,
      recipientId: recipientId || (isAdminUser(req) ? 'admin' : 'user'),
      recipientEmail,
      recipientRole,
      content,
      isRead: false,
    });

    await message.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Reply to a message thread
router.post('/reply', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { originalMessageId, content } = req.body;
    if (!originalMessageId || !content) {
      return res.status(400).json({ success: false, message: 'originalMessageId and content are required' });
    }

    const original = await Message.findById(originalMessageId);
    if (!original) {
      return res.status(404).json({ success: false, message: 'Original message not found' });
    }

    const senderEmail = req.user?.email || original.recipientEmail;
    const senderRole = isAdminUser(req) ? 'admin' : 'student';
    const recipientEmail = senderEmail === original.recipientEmail ? original.senderEmail : original.recipientEmail;
    const recipientRole = senderRole === 'admin' ? 'student' : 'admin';

    const reply = new Message({
      conversationId: original.conversationId,
      itemId: original.itemId,
      senderId: req.user?.uid || original.senderId,
      senderEmail,
      senderRole,
      recipientId: recipientRole === 'admin' ? 'admin' : original.senderId,
      recipientEmail,
      recipientRole,
      content,
      isRead: false,
    });

    await reply.save();
    res.status(201).json({ success: true, data: reply });
  } catch (error) {
    next(error);
  }
});

// Mark as read / update message
router.patch('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { isRead } = req.body;

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!isAdminUser(req) && req.user?.email?.toLowerCase() !== message.recipientEmail && req.user?.email?.toLowerCase() !== message.senderEmail) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (typeof isRead === 'boolean') {
      message.isRead = isRead;
      message.readAt = isRead ? new Date() : undefined;
    }

    await message.save();
    res.json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (!isAdminUser(req) && req.user?.email?.toLowerCase() !== message.recipientEmail && req.user?.email?.toLowerCase() !== message.senderEmail) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await message.deleteOne();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
