import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test';

async function migrateStatus() {
  try {
    await mongoose.connect(mongoUri);
    console.log('[Migration] Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('items');

    // Update all items with status 'claimed' to 'claim_in_progress'
    const result = await collection.updateMany(
      { status: 'claimed' },
      { $set: { status: 'claim_in_progress' } }
    );

    console.log(`[Migration] Updated ${result.modifiedCount} items from 'claimed' to 'claim_in_progress'`);

    await mongoose.disconnect();
    console.log('[Migration] Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('[Migration] Error:', error);
    process.exit(1);
  }
}

migrateStatus();
