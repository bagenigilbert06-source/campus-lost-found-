/**
 * FallbackAI Service
 * Abstraction for fallback AI provider
 * Currently uses placeholder responses, but can be extended to support real providers
 */

export interface FallbackAIResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class FallbackAIService {
  private isEnabled: boolean;
  private provider: string;
  private model: string;

  constructor() {
    // Check if fallback is configured via environment
    this.isEnabled = process.env.FALLBACK_AI_ENABLED === 'true';
    this.provider = process.env.FALLBACK_AI_PROVIDER || 'placeholder';
    this.model = process.env.FALLBACK_AI_MODEL || 'placeholder-v1';
  }

  /**
   * Check if fallback AI is configured and available
   */
  isConfigured(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the model name
   */
  getModelName(): string {
    return this.model;
  }

  /**
   * Get the provider name
   */
  getProvider(): string {
    return this.provider;
  }

  /**
   * Chat with fallback AI
   * Currently returns placeholder responses
   *Future: Implement real fallback provider (e.g., Claude, Mistral, Local LLM, etc.)
   */
  async chat(message: string, context?: string): Promise<FallbackAIResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        error: 'Fallback AI is not enabled',
      };
    }

    try {
      // Placeholder response - replace with real provider
      const response = await this.generatePlaceholderResponse(message, context);
      return {
        success: true,
        content: response,
        usage: {
          inputTokens: Math.ceil(message.length / 4),
          outputTokens: Math.ceil(response.length / 4),
        },
      };
    } catch (error) {
      console.error('[FallbackAI] Error:', error);
      return {
        success: false,
        error: 'Fallback AI service error',
      };
    }
  }

  /**
   * Generate a placeholder response
   * TODO: Replace with real fallback provider implementation
   */
  private async generatePlaceholderResponse(message: string, context?: string): Promise<string> {
    // Simulated response - in production, this would call a real AI service
    await new Promise((resolve) => setTimeout(resolve, 300));

    const responses: Record<string, string> = {
      'how do i post': 'To post a lost or found item, go to the dashboard and click "Post Item". Fill in the details, upload photos, and submit.',
      'how do i search': 'Use the search bar at the top to find items by keyword, category, or location. You can also browse all items.',
      'claim': 'To claim an item, click on the item details and fill out the claim form with proof of ownership.',
      'report': 'To report a found item, go to dashboard and select "Post Found Item". Provide clear descriptions and photos.',
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default response
    return `I can help you with the campus lost and found platform. Common questions include: how to post items, how to search, how to claim items, and how to report found items. Please ask me more specifically.`;
  }
}

export default new FallbackAIService();
