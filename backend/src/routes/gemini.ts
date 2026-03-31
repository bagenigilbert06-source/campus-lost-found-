import express, { Request, Response, NextFunction, Router } from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import optionalAuth from '../middleware/optionalAuth.js';
import GeminiService, { GeminiResponse } from '../services/GeminiService.js';
import FallbackAIService from '../services/FallbackAIService.js';
import AIAnalyticsService from '../services/AIAnalyticsService.js';

const router: Router = express.Router();

/**
 * Helper to convert GeminiResponse error codes to AILog status enum values
 */
function errorCodeToStatus(code?: string): 'success' | 'rate_limit' | 'timeout' | 'error' | 'not_configured' {
  if (!code) return 'error';
  
  switch (code) {
    case 'RATE_LIMIT':
      return 'rate_limit';
    case 'TIMEOUT':
      return 'timeout';
    case 'NOT_CONFIGURED':
      return 'not_configured';
    case 'INTERNAL_ERROR':
    case 'INVALID_RESPONSE':
    default:
      return 'error';
  }
}

/**
 * Validation middleware
 */
const validateMessage = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('sessionId').optional().trim(),
  body('history').optional().isArray(),
  body('context').optional().trim(),
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
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Map Gemini service response -> proper HTTP status
 * Includes fallback flag in response
 */
const sendGeminiResponse = (res: Response, result: GeminiResponse & { fallbackUsed?: boolean }) => {
  if (result.success) {
    return res.status(200).json(result);
  }

  // Return all errors as 200 with error details, allowing frontend to handle gracefully
  // HTTP 5xx/4xx codes should only be used for backend server issues, not upstream API limitations
  return res.status(200).json(result);
};

/**
 * Wrap async handlers
 */
const asyncHandler =
  (fn: (req: AuthRequest, res: Response) => Promise<any>) =>
  (req: AuthRequest, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

/**
 * POST /api/gemini/chat
 * General chat endpoint for chatbot with analytics and fallback support
 * Optional auth (works for both authenticated and public users)
 *
 * Request body:
 * - message (required): User message
 * - sessionId (optional): Chat session ID, will be auto-generated if not provided
 * - history (optional): Previous messages in conversation
 * - context (optional): Additional context for the AI
 */
router.post(
  '/chat',
  optionalAuth,
  validateMessage,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const startTime = Date.now();
    const { message, context } = req.body;
    let { sessionId, history } = req.body;

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = uuidv4();
    }

    const userEmail = req.user?.email;
    const userId = req.user?.uid;

    // Build enriched context
    let enrichedContext = context || '';
    if (userEmail) {
      enrichedContext = `User is authenticated (${userEmail}). ${enrichedContext}`;
    } else {
      enrichedContext = `User is not authenticated (public user). ${enrichedContext}`;
    }

    // Normalize history
    const messageHistory = Array.isArray(history) ? history : [];

    // Try Gemini first
    let result = await GeminiService.chat(message, enrichedContext);
    let fallbackUsed = false;

    // If Gemini fails or is not configured, try fallback
    if (!result.success && FallbackAIService.isConfigured()) {
      const canFallback =
        result.code === 'RATE_LIMIT' ||
        result.code === 'NOT_CONFIGURED' ||
        result.code === 'TIMEOUT';

      if (canFallback) {
        console.log('[Gemini Route] Gemini failed, trying fallback...');
        const fallbackResult = await FallbackAIService.chat(message, enrichedContext);
        if (fallbackResult.success) {
          result = {
            success: true,
            provider: 'fallback' as const,
            model: FallbackAIService.getModelName(),
            content: fallbackResult.content,
            usage: fallbackResult.usage,
          } as GeminiResponse;
          fallbackUsed = true;
        }
      }
    }

    // Log interaction to analytics
    const latencyMs = Date.now() - startTime;
    await AIAnalyticsService.logInteraction({
      sessionId,
      userId,
      userEmail,
      provider: fallbackUsed ? 'fallback' : result.provider,
      modelName: result.model,
      route: '/chat',
      status: result.success ? 'success' : errorCodeToStatus(result.code),
      latencyMs,
      inputTokens: result.usage?.inputTokens,
      outputTokens: result.usage?.outputTokens,
      prompt: message,
      response: result.content || result.error || '',
      messages: [
        ...messageHistory,
        { role: 'user', content: message },
        ...(result.success ? [{ role: 'assistant', content: result.content || '' }] : []),
      ],
      errorCode: result.code,
      errorMessage: result.error,
    });

    // Return response with fallback flag and session ID
    const responseData = {
      ...result,
      fallbackUsed,
      sessionId,
    };

    return sendGeminiResponse(res, responseData);
  })
);

/**
 * POST /api/gemini/improve-item
 * Improve item title, description, category, and tags
 * Authentication required
 */
router.post(
  '/improve-item',
  authMiddleware,
  validateItemImprovement,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { title, description, category, itemType } = req.body;

    const result = await GeminiService.improveItemDescription(
      title,
      description,
      category,
      itemType
    );

    return sendGeminiResponse(res, result);
  })
);

/**
 * POST /api/gemini/improve-search
 * Improve search query
 * Optional auth
 */
router.post(
  '/improve-search',
  optionalAuth,
  validateSearchQuery,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { query } = req.body;

    const result = await GeminiService.improveSearchQuery(query);
    return sendGeminiResponse(res, result);
  })
);

/**
 * POST /api/gemini/generate-claim-message
 * Generate improved claim message
 * Authentication required
 */
router.post(
  '/generate-claim-message',
  authMiddleware,
  validateClaimMessage,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { claimReason, itemTitle } = req.body;

    const result = await GeminiService.generateClaimMessage(claimReason, itemTitle);
    return sendGeminiResponse(res, result);
  })
);

/**
 * POST /api/gemini/faq-answer
 * Generate FAQ answer for a question
 * Optional auth
 */
router.post(
  '/faq-answer',
  optionalAuth,
  validateFAQQuestion,
  handleValidationErrors,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { question } = req.body;

    const result = await GeminiService.generateFAQAnswer(question);
    return sendGeminiResponse(res, result);
  })
);

/**
 * GET /api/gemini/status
 * Check if Gemini service is available
 */
router.get('/status', (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    available: GeminiService.isConfigured(),
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    requestTimeout: Number.parseInt(process.env.GEMINI_REQUEST_TIMEOUT || '30000', 10),
  });
});

/**
 * GET /api/gemini/admin/analytics
 * Get AI analytics data for admin dashboard
 * Admin authentication required
 * Query params: days=7 (default)
 */
router.get(
  '/admin/analytics',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // TODO: Add proper admin role check when admin middleware is available
    // For now, only allow authenticated users
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const days = Math.max(1, Math.min(90, Number(req.query.days) || 7));

    try {
      const analytics = await AIAnalyticsService.getAnalytics(days);
      const topRoutes = await AIAnalyticsService.getTopRoutes(days);

      return res.status(200).json({
        success: true,
        data: {
          summary: analytics,
          topRoutes,
          period: { days, startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
        },
      });
    } catch (error) {
      console.error('[Gemini Route] Analytics error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics',
      });
    }
  })
);

/**
 * Error handler for this router
 */
router.use((error: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Gemini Route] Unhandled error:', error);

  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    error: 'Internal server error',
  });
});

export default router;