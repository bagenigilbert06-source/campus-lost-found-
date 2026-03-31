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

// List messages by role / recipient / conversation
router.get('/', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const query: any = {};

    if (req.query.conversationId) query.conversationId = req.query.conversationId;
    if (req.query.itemId) query.itemId = req.query.itemId;
    if (req.query.recipientEmail) query.recipientEmail = req.query.recipientEmail;
    if (req.query.senderEmail) query.senderEmail = req.query.senderEmail;
    if (req.query.recipientRole) query.recipientRole = req.query.recipientRole;
    if (req.query.senderRole) query.senderRole = req.query.senderRole;

    // Admin can view all
    if (isAdminUser(req)) {
      // If no query, show latest 100 for admin to avoid explosion
      const messages = await Message.find(query).sort({ createdAt: -1 }).limit(100).lean();
      return res.json({ success: true, data: messages });
    }

    // Non-admin user: only their own messages
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const email = req.user.email.toLowerCase();
    query.$or = [
      { recipientEmail: email },
      { senderEmail: email }
    ];

    const messages = await Message.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: messages });
  } catch (error) {
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
