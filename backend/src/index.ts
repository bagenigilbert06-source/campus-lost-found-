import app from './app.js';
import { initializeServerless } from './serverless.js';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function bootstrap(): Promise<void> {
  try {
    console.log('[Backend] Bootstrapping starting...');

    await initializeServerless();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Backend] Server running on port ${PORT}`);
      console.log(`[Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Backend] Bootstrapping failed:', error);
    process.exit(1);
  }
}

bootstrap();
