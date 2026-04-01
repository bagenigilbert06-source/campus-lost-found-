import app from './app.js';
import { initializeServerless } from './serverless.js';

const PORT = process.env.PORT || 3001;

async function bootstrap(): Promise<void> {
  try {
    console.log('[Backend] Bootstrapping starting...');

    await initializeServerless();

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`[Backend] Server running on port ${PORT}`);
        console.log(`[Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } else {
      console.log('[Backend] Running in Vercel serverless mode; no permanent listener started.');
    }
  } catch (error) {
    console.error('[Backend] Bootstrapping failed:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default app;
