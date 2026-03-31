import { Schema, model, Document } from 'mongoose';

export interface IAILog extends Document {
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
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  errorCode?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AILogSchema = new Schema<IAILog>(
  {
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    userEmail: { type: String, index: true },
    provider: {
      type: String,
      enum: ['gemini', 'fallback'],
      required: true,
      index: true,
    },
    modelName: { type: String, required: true },
    route: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['success', 'rate_limit', 'timeout', 'error', 'not_configured'],
      required: true,
      index: true,
    },
    latencyMs: { type: Number, required: true },
    inputTokens: { type: Number },
    outputTokens: { type: Number },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
      },
    ],
    errorCode: { type: String },
    errorMessage: { type: String },
  },
  {
    timestamps: true,
  }
);

// Index for common queries
AILogSchema.index({ createdAt: -1 });
AILogSchema.index({ provider: 1, createdAt: -1 });
AILogSchema.index({ status: 1, createdAt: -1 });
AILogSchema.index({ sessionId: 1, createdAt: -1 });

export const AILog = model<IAILog>('AILog', AILogSchema);
