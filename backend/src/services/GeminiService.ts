import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * GeminiService - Reusable AI service for campus lost & found platform
 * Production-ready version with:
 * - consistent error handling
 * - rate limit parsing
 * - real timeout handling via Promise.race
 * - shared JSON parsing helpers
 * - shared text generation helper
 */

export interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
  provider: 'gemini' | 'fallback';
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  rateLimit?: {
    isLimited: boolean;
    resetTime?: string;
    resetIn?: number;
    message?: string;
  };
  code?: 'RATE_LIMIT' | 'TIMEOUT' | 'NOT_CONFIGURED' | 'INVALID_RESPONSE' | 'INTERNAL_ERROR';
}

const SYSTEM_PROMPT = `You are a helpful assistant for a campus lost and found platform.
Your role is to:
1. Help users understand how to use the website (reporting items, searching, claiming)
2. Improve form content (better titles, descriptions, categories)
3. Improve search queries (typo correction, keyword expansion)
4. Provide guidance on platform features
5. Keep responses concise and helpful

IMPORTANT RULES:
- Do NOT invent database records or claim items exist unless the user explicitly mentioned them
- Do NOT provide personal data or private information
- Do NOT make up claim results or search results
- Be accurate and honest about platform limitations
- Keep responses under 150 words
- Use simple, friendly language`;

type RateLimitInfo = {
  isLimited: boolean;
  resetTime?: string;
  resetIn?: number;
  message?: string;
};

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;
  private requestTimeout: number;
  private maxOutputTokens: number;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini] API key not configured. AI features will be disabled.');
    }

    this.client = new GoogleGenerativeAI(apiKey || '');
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.requestTimeout = Number.parseInt(process.env.GEMINI_REQUEST_TIMEOUT || '30000', 10);
    this.maxOutputTokens = Number.parseInt(process.env.GEMINI_MAX_TOKENS || '500', 10);
  }

  /**
   * Public helper for routes to know if AI is configured
   */
  isConfigured(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  /**
   * Parse Gemini/Google rate limit style errors
   */
  private parseRateLimitError(error: any): RateLimitInfo {
    if (!error) return { isLimited: false };

    const errorMessage = String(
      error?.message ||
      error?.response?.data?.error ||
      error?.error ||
      ''
    ).toLowerCase();

    const errorStatus = error?.status || error?.response?.status;

    const isQuotaError =
      errorStatus === 429 ||
      errorMessage.includes('resource has been exhausted') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      error?.response?.data?.code === 429;

    if (!isQuotaError) {
      return { isLimited: false };
    }

    let resetIn = 60;
    let resetTime: string | undefined;

    // Retry-After header
    const retryAfterHeader = error?.response?.headers?.['retry-after'];
    if (retryAfterHeader) {
      const retryAfterSeconds = Number(retryAfterHeader);
      if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
        resetIn = Math.ceil(retryAfterSeconds);
      }
    }

    // Google-style retryDelay from error details
    const detailRetryDelay =
      error?.details?.retryDelay ||
      error?.errorDetails?.find?.(
        (d: any) => d?.['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
      )?.retryDelay;

    if (typeof detailRetryDelay === 'string') {
      // Example: "6s"
      const match = detailRetryDelay.match(/^(\d+)\s*s$/i);
      if (match) {
        resetIn = Number(match[1]);
      }
    } else if (detailRetryDelay?.seconds || detailRetryDelay?.nanos) {
      resetIn = Math.ceil(
        (detailRetryDelay.seconds || 0) + (detailRetryDelay.nanos || 0) / 1e9
      );
    }

    // Optional retryAfter in payload
    if (error?.response?.data?.retryAfter) {
      const payloadRetry = Number(error.response.data.retryAfter);
      if (!Number.isNaN(payloadRetry) && payloadRetry > 0) {
        resetIn = Math.ceil(payloadRetry);
      }
    }

    // Optional reset time
    if (error?.response?.data?.resetTime) {
      const maybeDate = new Date(error.response.data.resetTime);
      if (!Number.isNaN(maybeDate.getTime())) {
        resetTime = maybeDate.toLocaleTimeString();
        resetIn = Math.max(1, Math.ceil((maybeDate.getTime() - Date.now()) / 1000));
      }
    }

    if (!resetTime) {
      const resetDate = new Date(Date.now() + resetIn * 1000);
      resetTime = resetDate.toLocaleTimeString();
    }

    const until = resetIn > 0 ? `${Math.ceil(resetIn / 60)}m` : 'soon';
    const isTomorrow = resetIn >= 24 * 60 * 60;
    const baseMsg = isTomorrow
      ? `Rate limit reached. Please try again tomorrow at ${resetTime}.`
      : `Rate limit reached. Please try again at ${resetTime} (in ${until}).`;

    return {
      isLimited: true,
      resetIn,
      resetTime,
      message: `${baseMsg} Upgrade billing or switch to a paid Gemini tier for higher limits.`,
    };
  }

  /**
   * Standardized error -> GeminiResponse
   */
  private buildErrorResponse(error: any, fallbackMessage = 'Unknown error occurred'): GeminiResponse {
    const rateLimit = this.parseRateLimitError(error);
    if (rateLimit.isLimited) {
      return {
        success: false,
        provider: 'gemini',
        model: this.model,
        code: 'RATE_LIMIT',
        error: rateLimit.message || `Google API rate limit reached. Please try again at ${rateLimit.resetTime}.`,
        rateLimit,
      };
    }

    if (error?.message === 'REQUEST_TIMEOUT') {
      return {
        success: false,
        provider: 'gemini',
        model: this.model,
        code: 'TIMEOUT',
        error: 'Request timeout - AI service took too long',
      };
    }

    // Detect network errors
    const errorMessage = error?.message || fallbackMessage;
    const isNetworkError = 
      errorMessage?.includes('fetch failed') ||
      errorMessage?.includes('ECONNREFUSED') ||
      errorMessage?.includes('ENOTFOUND') ||
      errorMessage?.includes('ERR_HTTP2_');
    
    if (isNetworkError) {
      console.error('[Gemini] Network error details:', {
        message: errorMessage,
        code: error?.code,
        cause: error?.cause,
        url: error?.url,
      });
    }

    return {
      success: false,
      provider: 'gemini',
      model: this.model,
      code: 'INTERNAL_ERROR',
      error: errorMessage,
    };
  }

  /**
   * Shared generate call with real timeout handling
   */
  private async generateText(prompt: string, maxOutputTokens: number, temperature: number): Promise<GeminiResponse> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          provider: 'gemini',
          model: this.model,
          code: 'NOT_CONFIGURED',
          error: 'AI service not configured',
        };
      }

      const model = this.client.getGenerativeModel({ model: this.model });

      const generatePromise = model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens,
          temperature,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          reject(new Error('REQUEST_TIMEOUT'));
        }, this.requestTimeout);
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const result = response.response;
      const text = result.text();

      return {
        success: true,
        provider: 'gemini',
        model: this.model,
        content: text?.trim?.() ?? '',
        usage: result?.usageMetadata
          ? {
              inputTokens: result.usageMetadata.promptTokenCount || 0,
              outputTokens: result.usageMetadata.candidatesTokenCount || 0,
            }
          : undefined,
      };
    } catch (error: any) {
      console.error('[Gemini] Generate text error:', {
        message: error?.message,
        name: error?.name,
        code: error?.code,
        status: error?.status,
      });
      return this.buildErrorResponse(error);
    }
  }

  /**
   * Extract and validate JSON object from AI response
   */
  private parseJsonObject(text: string): GeminiResponse {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          provider: 'gemini',
          model: this.model,
          code: 'INVALID_RESPONSE',
          error: 'Invalid response format',
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        provider: 'gemini',
        model: this.model,
        content: JSON.stringify(parsed),
      };
    } catch (error) {
      console.error('[Gemini] JSON parse error:', error);
      return {
        success: false,
        provider: 'gemini',
        model: this.model,
        code: 'INVALID_RESPONSE',
        error: 'Failed to parse AI response',
      };
    }
  }

  /**
   * Sanitize user input to reduce abuse / prompt injection surface
   */
  private sanitizeInput(input: string): string {
    return String(input || '')
      .trim()
      .substring(0, 1000)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  }

  /**
   * Chat - general conversational endpoint for chatbot
   */
  async chat(message: string, context?: string): Promise<GeminiResponse> {
    const validatedMessage = this.sanitizeInput(message);
    const finalContext = context
      ? `${SYSTEM_PROMPT}\n\nCurrent context: ${context}`
      : SYSTEM_PROMPT;

    const prompt = `${finalContext}\n\nUser Question: ${validatedMessage}`;

    return this.generateText(prompt, this.maxOutputTokens, 0.7);
  }

  /**
   * Improve item description/title for form submission
   */
  async improveItemDescription(
    title: string,
    description: string,
    category?: string,
    itemType?: string
  ): Promise<GeminiResponse> {
    const safeTitle = this.sanitizeInput(title);
    const safeDescription = this.sanitizeInput(description);
    const safeCategory = category ? this.sanitizeInput(category) : '';
    const safeItemType = itemType ? this.sanitizeInput(itemType) : '';

    const prompt = `You are helping improve a lost/found item report on a campus platform.
Current submission:
- Title: "${safeTitle}"
- Description: "${safeDescription}"
${safeCategory ? `- Category: ${safeCategory}` : ''}
${safeItemType ? `- Item Type: ${safeItemType}` : ''}

Improve this report by:
1. Making the title clearer and more descriptive (max 10 words)
2. Enhancing the description with better details (keep it under 100 words)
3. Suggesting a category if not provided
4. Suggesting 3-4 relevant tags/keywords

Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "improvedTitle": "...",
  "improvedDescription": "...",
  "suggestedCategory": "...",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}

Be concise and practical.`;

    const response = await this.generateText(prompt, 300, 0.5);
    if (!response.success || !response.content) {
      return response;
    }

    return this.parseJsonObject(response.content);
  }

  /**
   * Improve search query for better database matching
   */
  async improveSearchQuery(query: string): Promise<GeminiResponse> {
    const safeQuery = this.sanitizeInput(query);

    const prompt = `You are helping improve a search query for a campus lost and found platform.

User search query: "${safeQuery}"

Improve this query by:
1. Fixing typos
2. Expanding with synonyms
3. Cleaning up wording
4. Suggesting alternative phrasings

Return ONLY valid JSON (no markdown or backticks):
{
  "improvedQuery": "...",
  "alternatives": ["...", "...", "..."]
}`;

    const response = await this.generateText(prompt, 150, 0.5);
    if (!response.success || !response.content) {
      return response;
    }

    return this.parseJsonObject(response.content);
  }

  /**
   * Generate claim message suggestions
   */
  async generateClaimMessage(claimReason: string, itemTitle: string): Promise<GeminiResponse> {
    const safeClaimReason = this.sanitizeInput(claimReason);
    const safeItemTitle = this.sanitizeInput(itemTitle);

    const prompt = `Help improve a claim message for a campus lost and found item.

Item: "${safeItemTitle}"
Initial message: "${safeClaimReason}"

Rewrite this message to be:
1. Clear and professional
2. Concise (under 50 words)
3. Convincing proof of ownership
4. Friendly but factual

Return the improved message ONLY, no quotes or explanation.`;

    return this.generateText(prompt, 100, 0.6);
  }

  /**
   * Suggest FAQ answer
   */
  async generateFAQAnswer(question: string): Promise<GeminiResponse> {
    const safeQuestion = this.sanitizeInput(question);

    const prompt = `${SYSTEM_PROMPT}

User Question: "${safeQuestion}"

Provide a helpful, concise answer (under 100 words) specific to this campus lost and found platform.`;

    return this.generateText(prompt, 150, 0.7);
  }
}

export default new GeminiService();