import mongoose, { Connection } from 'mongoose';
import { initializeGridFS } from '../services/gridfsService.js';

// Use global variable to reduce re-connection overhead in serverless environments
declare global {
  // eslint-disable-next-line no-var
  var _mongoConnection: Connection | null | undefined;
}

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const errorMsg = `\n[Database] MONGODB_URI is not set!\n`;
    console.error(errorMsg);
    throw new Error('MONGODB_URI environment variable is not set');
  }

  // Early return if already connected
  if (mongoose.connection.readyState === 1) {
    console.log('[Database] Using existing Mongoose connection (ready)');
    return;
  }

  if (mongoose.connection.readyState === 2) {
    console.log('[Database] Mongoose is currently connecting. Waiting...');
    // Wait until connection is established or errors out
    await new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(interval);
          resolve(undefined);
        } else if (mongoose.connection.readyState === 0) {
          clearInterval(interval);
          reject(new Error('Mongoose connection lost while connecting'));
        }
      }, 100);
    });
    return;
  }

  if (globalThis._mongoConnection && globalThis._mongoConnection.readyState === 1) {
    console.log('[Database] Using cached connection from globalThis');
    return;
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      family: 4,
      autoIndex: false,
      autoCreate: false,
    });

    globalThis._mongoConnection = mongoose.connection;

    console.log('[Database] MongoDB connected successfully');
    console.log(`[Database] Database: ${mongoose.connection.name}`);

    const db = mongoose.connection.db as any;
    if (!db) {
      throw new Error('MongoDB database object is not available');
    }

    initializeGridFS(db);
    console.log('[Database] GridFS initialized successfully');
  } catch (error: any) {
    console.error('[Database] MongoDB connection error:', error.message || error);

    if (error.code === 'ENOTFOUND' || (error.message && error.message.includes('ENOTFOUND'))) {
      console.error('[Database] DNS resolution failed. Check your URI and network access.');
    } else if (error.message && error.message.includes('authentication failed')) {
      console.error('[Database] Authentication failed. Check your MongoDB credentials.');
    }

    throw error;
  }
}

export function disconnectDB(): Promise<void> {
  return mongoose.disconnect();
}

export default mongoose;
