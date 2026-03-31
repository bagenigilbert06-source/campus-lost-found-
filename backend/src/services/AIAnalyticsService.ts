import { AILog } from '../models/AILog.js';

export interface AIAnalyticsStats {
  totalRequests: number;
  successCount: number;
  rateLimitCount: number;
  timeoutCount: number;
  errorCount: number;
  notConfiguredCount: number;
  successRate: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  averageLatencyMs: number;
  averageInputTokens?: number;
  averageOutputTokens?: number;
  providerBreakdown: {
    gemini: number;
    fallback: number;
  };
  statusBreakdown: {
    success: number;
    rate_limit: number;
    timeout: number;
    error: number;
    not_configured: number;
  };
  dailyTrend?: Array<{
    date: string;
    requests: number;
    success: number;
    errors: number;
  }>;
}

export class AIAnalyticsService {
  /**
   * Log an AI interaction
   */
  async logInteraction(data: {
    sessionId: string;
    userId?: string;
    userEmail?: string;
    provider: 'gemini' | 'fallback';
    modelName: string;
    route: string;
    status: 'success' | 'rate_limit' | 'timeout' | 'error' | 'not_configured';
    latencyMs: number;
    inputTokens?: number;
    outputTokens?: number;
    prompt: string;
    response: string;
    messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    errorCode?: string;
    errorMessage?: string;
  }) {
    try {
      const log = new AILog({
        ...data,
        modelName: data.modelName,
      });
      return await log.save();
    } catch (error) {
      console.error('[AIAnalytics] Failed to log interaction:', error);
      // Don't throw - logging failure shouldn't break user experience
    }
  }

  /**
   * Get analytics for a date range (default 7 days)
   */
  async getAnalytics(days: number = 7): Promise<AIAnalyticsStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await AILog.find({
      createdAt: { $gte: startDate },
    });

    const totalRequests = logs.length;

    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        successCount: 0,
        rateLimitCount: 0,
        timeoutCount: 0,
        errorCount: 0,
        notConfiguredCount: 0,
        successRate: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        averageLatencyMs: 0,
        providerBreakdown: { gemini: 0, fallback: 0 },
        statusBreakdown: {
          success: 0,
          rate_limit: 0,
          timeout: 0,
          error: 0,
          not_configured: 0,
        },
      };
    }

    // Count by status
    const successCount = logs.filter((l) => l.status === 'success').length;
    const rateLimitCount = logs.filter((l) => l.status === 'rate_limit').length;
    const timeoutCount = logs.filter((l) => l.status === 'timeout').length;
    const errorCount = logs.filter((l) => l.status === 'error').length;
    const notConfiguredCount = logs.filter((l) => l.status === 'not_configured').length;

    // Provider breakdown
    const geminiCount = logs.filter((l) => l.provider === 'gemini').length;
    const fallbackCount = logs.filter((l) => l.provider === 'fallback').length;

    // Token and latency stats
    const logsWithTokens = logs.filter((l) => l.inputTokens && l.outputTokens);
    const totalInputTokens = logsWithTokens.reduce((sum, l) => sum + (l.inputTokens || 0), 0);
    const totalOutputTokens = logsWithTokens.reduce((sum, l) => sum + (l.outputTokens || 0), 0);
    const averageInputTokens = logsWithTokens.length > 0 ? totalInputTokens / logsWithTokens.length : 0;
    const averageOutputTokens = logsWithTokens.length > 0 ? totalOutputTokens / logsWithTokens.length : 0;
    const averageLatencyMs = logs.reduce((sum, l) => sum + l.latencyMs, 0) / totalRequests;

    // Daily trend
    const dailyData: Record<string, { requests: number; success: number; errors: number }> = {};

    logs.forEach((log) => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { requests: 0, success: 0, errors: 0 };
      }
      dailyData[dateStr].requests++;
      if (log.status === 'success') {
        dailyData[dateStr].success++;
      } else {
        dailyData[dateStr].errors++;
      }
    });

    const dailyTrend = Object.entries(dailyData)
      .sort()
      .map(([date, data]) => ({
        date,
        requests: data.requests,
        success: data.success,
        errors: data.errors,
      }));

    return {
      totalRequests,
      successCount,
      rateLimitCount,
      timeoutCount,
      errorCount,
      notConfiguredCount,
      successRate: (successCount / totalRequests) * 100,
      totalInputTokens,
      totalOutputTokens,
      averageLatencyMs: Math.round(averageLatencyMs),
      averageInputTokens: Math.round(averageInputTokens),
      averageOutputTokens: Math.round(averageOutputTokens),
      providerBreakdown: {
        gemini: geminiCount,
        fallback: fallbackCount,
      },
      statusBreakdown: {
        success: successCount,
        rate_limit: rateLimitCount,
        timeout: timeoutCount,
        error: errorCount,
        not_configured: notConfiguredCount,
      },
      dailyTrend,
    };
  }

  /**
   * Get top routes by request count
   */
  async getTopRoutes(days: number = 7, limit: number = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const routes = await AILog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$route',
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'success'] }, 1, 0],
            },
          },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return routes.map((r) => ({
      route: r._id,
      requests: r.count,
      success: r.successCount,
      successRate: (r.successCount / r.count) * 100,
    }));
  }

  /**
   * Clear old logs (older than specified days)
   */
  async clearOldLogs(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await AILog.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

export default new AIAnalyticsService();
