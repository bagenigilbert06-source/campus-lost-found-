import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * GeminiService - Reusable AI service for campus lost & found platform
 * Provides free-tier-friendly Gemini integration with safe defaults
 */

interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
  rateLimit?: {
    isLimited: boolean;
    resetTime?: string;
    resetIn?: number; // seconds until reset
    message?: string;
  };
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

export class GeminiService {
  private client: GoogleGenerativeAI;
  private model: string;
  private requestTimeout: number;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini] API key not configured. AI features will be disabled.');
    }

    this.client = new GoogleGenerativeAI(apiKey || '');
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    this.requestTimeout = parseInt(process.env.GEMINI_REQUEST_TIMEOUT || '30000');
  }

  /**
   * Parse rate limit error and extract reset time
   */
  private parseRateLimitError(error: any): { isLimited: boolean; resetTime?: string; resetIn?: number; message?: string } {
    if (!error) return { isLimited: false };

    const errorMessage = error?.message || error?.response?.data?.error || '';
    const errorStatus = error?.status || error?.response?.status;

    // Check for 429 or rate limit indicators
    if (
      errorStatus === 429 ||
      errorMessage.toLowerCase().includes('resource has been exhausted') ||
      errorMessage.toLowerCase().includes('quota') ||
      (error?.response?.data?.code && error?.response?.data?.code === 429)
    ) {
      let resetIn = 60; // Fallback default seconds
      let resetTime: string | undefined;

      // Prefer explicit Retry-After header
      const retryAfterHeader = error?.response?.headers?.['retry-after'];
      if (retryAfterHeader) {
        const retryAfterSeconds = Number(retryAfterHeader);
        if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
          resetIn = Math.ceil(retryAfterSeconds);
        }
      }

      // Fallback from details
      if (error?.details?.retryDelay) {
        resetIn = Math.ceil((error.details.retryDelay.seconds || 0) + (error.details.retryDelay.nanos || 0) / 1e9);
      }

      // Optional from response payload
      if (error?.response?.data?.retryAfter) {
        const payloadRetry = Number(error.response.data.retryAfter);
        if (!Number.isNaN(payloadRetry) && payloadRetry > 0) {
          resetIn = Math.ceil(payloadRetry);
        }
      }

      // Support ISO or timestamp
      if (error?.response?.data?.resetTime) {
        const maybeDate = new Date(error.response.data.resetTime);
        if (!Number.isNaN(maybeDate.getTime())) {
          resetTime = maybeDate.toLocaleTimeString();
          resetIn = Math.ceil((maybeDate.getTime() - Date.now()) / 1000);
        }
      }

      if (!resetTime) {
        const resetDate = new Date(Date.now() + resetIn * 1000);
        resetTime = resetDate.toLocaleTimeString();
      }

      const until = resetIn > 0 ? `${Math.ceil(resetIn / 60)}m` : 'moment';
      return {
        isLimited: true,
        resetIn,
        resetTime,
        message: `Rate limit reached. Please try again at ${resetTime} (about ${until}). Consider upgrading to Gemini Pro for higher throughput.`,
      };
    }

    return { isLimited: false };
  }

  /**
   * Chat - General conversational endpoint for chatbot
   * @param message User message
   * @param context Optional context about current app state
   */
  async chat(message: string, context?: string): Promise<GeminiResponse> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'AI service not configured',
        };
      }

      const validatedMessage = this.sanitizeInput(message);
      const finalContext = context ? `${SYSTEM_PROMPT}\n\nCurrent context: ${context}` : SYSTEM_PROMPT;

      const model = this.client.getGenerativeModel({ model: this.model });

      // Use timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

      try {
        const response = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${finalContext}\n\nUser Question: ${validatedMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '500'),
            temperature: 0.7,
          },
        });

        clearTimeout(timeoutId);

        const result = response.response;
        const text = result.text();

        return {
          success: true,
          content: text,
          usage: result.usageMetadata && {
            inputTokens: result.usageMetadata.promptTokenCount || 0,
            outputTokens: result.usageMetadata.candidatesTokenCount || 0,
          },
        };
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: any) {
      console.error('[Gemini] Chat error:', error);

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - AI service took too long',
        };
      }

      const rateLimit = this.parseRateLimitError(error);

      return {
        success: false,
        error: rateLimit.isLimited 
          ? `Google API rate limit reached. Please try again at ${rateLimit.resetTime}.`
          : error?.message || 'Unknown error occurred',
        rateLimit: rateLimit.isLimited ? rateLimit : undefined,
      };
    }
  }

  /**
   * Improve item description/title for form submission
   * @param title Current item title
   * @param description Current item description
   * @param category Item category
   * @param itemType Lost/Found/Recovered
   */
  async improveItemDescription(
    title: string,
    description: string,
    category?: string,
    itemType?: string
  ): Promise<GeminiResponse> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'AI service not configured',
        };
      }

      const prompt = `You are helping improve a lost/found item report on a campus platform.
Current submission:
- Title: "${title}"
- Description: "${description}"
${category ? `- Category: ${category}` : ''}
${itemType ? `- Item Type: ${itemType}` : ''}

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

      const model = this.client.getGenerativeModel({ model: this.model });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 300,
          temperature: 0.5,
        },
      });

      const text = response.response.text();

      // Parse JSON response carefully
      try {
        // Try to extract JSON object even if there's extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return {
            success: false,
            error: 'Invalid response format',
          };
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          content: JSON.stringify(parsed),
        };
      } catch (parseError) {
        console.error('[Gemini] JSON parse error:', parseError);
        return {
          success: false,
          error: 'Failed to parse AI response',
        };
      }
    } catch (error: any) {
      console.error('[Gemini] Item improvement error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Improve search query for better database matching
   * @param query User search query
   */
  async improveSearchQuery(query: string): Promise<GeminiResponse> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'AI service not configured',
        };
      }

      const prompt = `You are helping improve a search query for a campus lost and found platform.

User search query: "${query}"

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

      const model = this.client.getGenerativeModel({ model: this.model });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.5,
        },
      });

      const text = response.response.text();

      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return {
            success: false,
            error: 'Invalid response format',
          };
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          content: JSON.stringify(parsed),
        };
      } catch (parseError) {
        console.error('[Gemini] JSON parse error:', parseError);
        return {
          success: false,
          error: 'Failed to parse AI response',
        };
      }
    } catch (error: any) {
      console.error('[Gemini] Search improvement error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Generate claim message suggestions
   * @param claimReason User's reason for claiming
   * @param itemTitle Title of the item being claimed
   */
  async generateClaimMessage(claimReason: string, itemTitle: string): Promise<GeminiResponse> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'AI service not configured',
        };
      }

      const prompt = `Help improve a claim message for a campus lost and found item.

Item: "${itemTitle}"
Initial message: "${claimReason}"

Rewrite this message to be:
1. Clear and professional
2. Concise (under 50 words)
3. Convincing proof of ownership
4. Friendly but factual

Return the improved message ONLY, no quotes or explanation.`;

      const model = this.client.getGenerativeModel({ model: this.model });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 100,
          temperature: 0.6,
        },
      });

      const text = response.response.text();

      return {
        success: true,
        content: text.trim(),
      };
    } catch (error: any) {
      console.error('[Gemini] Claim message error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Suggest FAQ answer
   * @param question User question
   */
  async generateFAQAnswer(question: string): Promise<GeminiResponse> {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return {
          success: false,
          error: 'AI service not configured',
        };
      }

      const prompt = `${SYSTEM_PROMPT}

User Question: "${question}"

Provide a helpful, concise answer (under 100 words) specific to this campus lost and found platform.`;

      const model = this.client.getGenerativeModel({ model: this.model });

      const response = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      });

      const text = response.response.text();

      return {
        success: true,
        content: text.trim(),
      };
    } catch (error: any) {
      console.error('[Gemini] FAQ answer error:', error);
      return {
        success: false,
        error: error?.message || 'Unknown error occurred',
      };
    }
  }

  /**
   * Sanitize user input to prevent prompt injection
   */
  private sanitizeInput(input: string): string {
    return input
      .trim()
      .substring(0, 1000) // Limit input length
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // Remove control characters
  }
}

export default new GeminiService();
