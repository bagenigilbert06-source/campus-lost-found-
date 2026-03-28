import mongoose, { Connection } from 'mongoose';
import { initializeGridFS } from '../services/gridfsService.js';

let mongooseConnection: Connection;

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    const errorMsg = `
      [Database] MONGODB_URI is not set!
      
      To fix this:
      1. Create a MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
      2. Create a cluster and database user
      3. Get your connection string from the Atlas Dashboard
      4. Add to .env.local: MONGODB_URI=mongodb+srv://user:password@cluster0.mongodb.net/dbname
      
      See MONGODB_SETUP.md for detailed instructions.
    `;
    console.error(errorMsg);
    throw new Error('MONGODB_URI environment variable is not set');
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    mongooseConnection = mongoose.connection;
    console.log('[Database] MongoDB connected successfully');
    console.log(`[Database] Database: ${mongoose.connection.name}`);
    
    // Initialize GridFS for image storage
    try {
      // Get the MongoDB database from mongoose connection
      const db = mongoose.connection.db as any;
      if (!db) {
        throw new Error('MongoDB database object is not available');
      }
      initializeGridFS(db);
      console.log('[Database] GridFS initialized successfully');
    } catch (gridfsError: any) {
      console.error('[Database] GridFS initialization error:', gridfsError.message);
      throw gridfsError;
    }
  } catch (error: any) {
    console.error('[Database] MongoDB connection error:', error.message);
    
    // Provide helpful error messages based on error type
    if (error.code === 'ENOTFOUND' || error.message.includes('ENOTFOUND')) {
      console.error(`
        [Database] DNS Resolution Failed
        
        Possible causes:
        1. Invalid MongoDB connection string
        2. Network/firewall blocking MongoDB Atlas
        3. IP not whitelisted in MongoDB Atlas Network Access
        4. Invalid credentials in connection string
        
        Solutions:
        1. Check .env.local for correct MONGODB_URI
        2. Verify your IP is whitelisted in MongoDB Atlas
        3. Try with 0.0.0.0/0 (allows all IPs) temporarily
        4. See MONGODB_SETUP.md for detailed help
      `);
    } else if (error.message.includes('authentication failed')) {
      console.error(`
        [Database] Authentication Failed
        
        Possible causes:
        1. Incorrect username or password
        2. Special characters in password not URL-encoded
        3. User doesn't have database access role
        
        Solutions:
        1. Verify username and password in MONGODB_URI
        2. URL-encode special characters (@ = %40, # = %23)
        3. Ensure user has "Atlas admin" role in MongoDB Atlas
      `);
    }
    
    throw error;
  }
}

export function disconnectDB(): Promise<void> {
  return mongoose.disconnect();
}

export default mongoose;
