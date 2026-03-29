import express, { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import GeminiService from '../services/GeminiService.js';
import { body, validationResult } from 'express-validator';

const router: Router = express.Router();

/**
 * Validate required body fields
 */
const validateMessage = [
  body('message').trim().notEmpty().withMessage('Message is required'),
];

const validateItemImprovement = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('category').optional().trim(),
  body('itemType').optional().trim(),
];

const validateSearchQuery = [
  body('query').trim().notEmpty().withMessage('Query is required'),
];

const validateClaimMessage = [
  body('claimReason').trim().notEmpty().withMessage('Claim reason is required'),
  body('itemTitle').trim().notEmpty().withMessage('Item title is required'),
];

const validateFAQQuestion = [
  body('question').trim().notEmpty().withMessage('Question is required'),
];

/**
 * Handle validation errors
 */
const handleValidationErrors = (req: Request, res: Response, next: Function) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

/**
 * POST /api/gemini/chat
 * General chat endpoint for chatbot
 * Optional auth (works for both authenticated and public users)
 */
router.post('/chat', optionalAuth, validateMessage, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { message, context } = req.body;
    const userEmail = req.user?.email;

    // Build context for authenticated users
    let enrichedContext = context;
    if (userEmail) {
      enrichedContext = `User is authenticated (${userEmail}). ${context || ''}`;
    } else {
      enrichedContext = `User is not authenticated (public user). ${context || ''}`;
    }

    const result = await GeminiService.chat(message, enrichedContext);
    res.json(result);
  } catch (error: any) {
    console.error('[Gemini Route] Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/gemini/improve-item
 * Improve item title, description, category, and tags
 * Authentication required
 */
router.post('/improve-item', authMiddleware, validateItemImprovement, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, itemType } = req.body;

    const result = await GeminiService.improveItemDescription(title, description, category, itemType);
    res.json(result);
  } catch (error: any) {
    console.error('[Gemini Route] Item improvement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/gemini/improve-search
 * Improve search query
 * Optional auth
 */
router.post('/improve-search', optionalAuth, validateSearchQuery, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;

    const result = await GeminiService.improveSearchQuery(query);
    res.json(result);
  } catch (error: any) {
    console.error('[Gemini Route] Search improvement error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/gemini/generate-claim-message
 * Generate improved claim message
 * Authentication required
 */
router.post('/generate-claim-message', authMiddleware, validateClaimMessage, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { claimReason, itemTitle } = req.body;

    const result = await GeminiService.generateClaimMessage(claimReason, itemTitle);
    res.json(result);
  } catch (error: any) {
    console.error('[Gemini Route] Claim message error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/gemini/faq-answer
 * Generate FAQ answer for a question
 * Optional auth
 */
router.post('/faq-answer', optionalAuth, validateFAQQuestion, handleValidationErrors, async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body;

    const result = await GeminiService.generateFAQAnswer(question);
    res.json(result);
  } catch (error: any) {
    console.error('[Gemini Route] FAQ answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * GET /api/gemini/status
 * Check if Gemini service is available
 */
router.get('/status', (req: Request, res: Response) => {
  const isConfigured = !!process.env.GEMINI_API_KEY;
  res.json({
    available: isConfigured,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  });
});

export default router;
