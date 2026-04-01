import app from '../backend/dist/app.js';
import { initializeServerless } from '../backend/dist/serverless.js';

// Initialize once at module load (cold start)
let initialized = false;
let initPromise = null;

async function ensureInitialized() {
  if (initialized) return;
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = initializeServerless()
    .then(() => {
      initialized = true;
      console.log('[Vercel API] Serverless backend initialized');
    })
    .catch((error) => {
      console.error('[Vercel API] Failed to initialize:', error);
      initPromise = null; // Reset for retry
      throw error;
    });

  return initPromise;
}

// Export handler for Vercel
export default async function handler(req, res) {
  try {
    await ensureInitialized();
  } catch (error) {
    console.error('[API Handler] Initialization failed:', error);
    return res.status(500).json({ 
      error: 'Backend initialization failed',
      message: error.message 
    });
  }

  // Pass request through Express app
  return app(req, res);
}
