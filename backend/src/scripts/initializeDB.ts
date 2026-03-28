import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Notification } from '../models/Notification.js';

/**
 * Initialize Database
 * This script sets up database indexes and seed data if needed
 */

async function initializeDatabase() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('[Database] Connected to MongoDB');

    // Create indexes
    console.log('[Database] Creating indexes...');

    // User indexes
    await User.collection.createIndex({ email: 1 });

    // Item indexes
    await Item.collection.createIndex({ userId: 1, status: 1 });
    await Item.collection.createIndex({ category: 1, location: 1 });
    await Item.collection.createIndex({ itemType: 1, status: 1 });
    await Item.collection.createIndex({ createdAt: -1 });

    // Notification indexes
    await Notification.collection.createIndex({ userId: 1, status: 1 });
    await Notification.collection.createIndex({ createdAt: -1 });

    console.log('[Database] Indexes created successfully');

    // Optional: Seed initial data
    await seedSampleData();

    console.log('[Database] Initialization complete');
    await mongoose.disconnect();
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    process.exit(1);
  }
}

async function seedSampleData() {
  try {
    const itemCount = await Item.countDocuments();

    if (itemCount > 0) {
      console.log('[Database] Sample data already exists, skipping seed');
      return;
    }

    console.log('[Database] Seeding sample data...');

    // Sample items
    const sampleItems = [
      {
        itemType: 'Lost',
        title: 'Black Wallet',
        description: 'Lost black leather wallet with ID and credit cards',
        category: 'Accessories',
        location: 'Campus Main Gate',
        coordinates: { lat: 1.3521, lng: 103.8198 },
        dateLost: new Date('2024-01-10'),
        images: [],
        userId: 'demo-user-1',
        status: 'active',
      },
      {
        itemType: 'Found',
        title: 'iPhone 14 Pro',
        description: 'Found an iPhone 14 Pro in the library',
        category: 'Electronics',
        location: 'University Library',
        coordinates: { lat: 1.3527, lng: 103.8208 },
        dateLost: new Date('2024-01-15'),
        images: [],
        userId: 'demo-user-2',
        status: 'active',
      },
      {
        itemType: 'Lost',
        title: 'Blue Backpack',
        description: 'Blue North Face backpack with laptop',
        category: 'Bags',
        location: 'Cafeteria',
        coordinates: { lat: 1.3515, lng: 103.8190 },
        dateLost: new Date('2024-01-12'),
        images: [],
        userId: 'demo-user-1',
        status: 'active',
      },
    ];

    await Item.insertMany(sampleItems);
    console.log('[Database] Sample items created:', sampleItems.length);
  } catch (error) {
    console.error('[Database] Seeding failed:', error);
  }
}

// Run initialization if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };
