import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../backend/dist/app.js';
import { connectDB } from '../backend/dist/config/database.js';
import { initializeFirebase } from '../backend/dist/config/firebase.js';

let _initialized = false;

async function ensureServerReady(): Promise<void> {
  if (_initialized) {
    return;
  }

  await connectDB();
  initializeFirebase();

  _initialized = true;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureServerReady();

    return new Promise<void>((resolve, reject) => {
      app(req as any, res as any, (err: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  } catch (error) {
    console.error('[Vercel API] Handler error', error);
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as any).message : undefined,
      });
    }
  }
}
