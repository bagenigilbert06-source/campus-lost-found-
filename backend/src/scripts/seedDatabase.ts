import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Item } from '../models/Item.js';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local for development
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-lost-found';

const sampleItems = [
  {
    itemType: 'Lost',
    title: 'Black Laptop Backpack',
    description: 'Dell XPS 13 laptop with black backpack. Backpack has a small tear on the right side.',
    category: 'Electronics',
    location: 'Library Main Floor',
    dateLost: new Date('2024-03-20'),
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    ],
    userId: 'user123',
    email: 'john@example.com',
    name: 'John Doe',
    status: 'active',
    verificationStatus: 'pending',
  },
  {
    itemType: 'Found',
    title: 'Silver iPhone 15',
    description: 'Found an iPhone 15 in silver color near the cafeteria. Device is locked but in good condition.',
    category: 'Electronics',
    location: 'Cafeteria Area',
    dateLost: new Date('2024-03-22'),
    images: [
      'https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop',
    ],
    userId: 'user456',
    email: 'jane@example.com',
    name: 'Jane Smith',
    status: 'active',
    verificationStatus: 'verified',
  },
  {
    itemType: 'Lost',
    title: 'Blue Canvas Backpack',
    description: 'Lost a blue canvas backpack with books and assignments inside. Has name tag "Alex" on it.',
    category: 'Bags & Accessories',
    location: 'Student Center',
    dateLost: new Date('2024-03-21'),
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&q=60',
    ],
    userId: 'user789',
    email: 'alex@example.com',
    name: 'Alex Johnson',
    status: 'active',
    verificationStatus: 'pending',
  },
  {
    itemType: 'Found',
    title: 'Keys with Blue Keychain',
    description: 'Found a set of keys with a blue rocket-shaped keychain in the library.',
    category: 'Personal Items',
    location: 'Library 3rd Floor',
    dateLost: new Date('2024-03-23'),
    images: [
      'https://images.unsplash.com/photo-1585399572355-b4cf89cbbdc1?w=500&h=500&fit=crop',
    ],
    userId: 'user321',
    email: 'mike@example.com',
    name: 'Mike Wilson',
    status: 'recovered',
    verificationStatus: 'verified',
    recoveredBy: {
      email: 'alex@example.com',
      name: 'Alex Johnson',
      date: new Date('2024-03-24'),
    },
  },
  {
    itemType: 'Lost',
    title: 'Red Umbrella',
    description: 'Lost a red umbrella with wooden handle during heavy rain near the gym.',
    category: 'Accessories',
    location: 'Gymnasium',
    dateLost: new Date('2024-03-19'),
    images: [
      'https://images.unsplash.com/photo-1506025613140-f3cdc3474dc9?w=500&h=500&fit=crop',
    ],
    userId: 'user654',
    email: 'sarah@example.com',
    name: 'Sarah Davis',
    status: 'active',
    verificationStatus: 'pending',
  },
  {
    itemType: 'Found',
    title: 'Wallet with ID',
    description: 'Found a brown leather wallet near the main entrance with ID cards inside.',
    category: 'Personal Items',
    location: 'Main Entrance',
    dateLost: new Date('2024-03-24'),
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop',
    ],
    userId: 'admin123',
    email: 'admin@campus.edu',
    name: 'Admin User',
    status: 'active',
    verificationStatus: 'verified',
  },
];

async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[Seed] Connected to MongoDB');

    console.log('[Seed] Clearing existing items...');
    await Item.deleteMany({});

    console.log('[Seed] Inserting sample items...');
    const insertedItems = await Item.insertMany(sampleItems);
    console.log(`[Seed] Successfully inserted ${insertedItems.length} items`);

    console.log('[Seed] Sample data summary:');
    const stats = await Item.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('[Seed] Items by status:', stats);

    const typeStats = await Item.aggregate([
      {
        $group: {
          _id: '$itemType',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('[Seed] Items by type:', typeStats);

    await mongoose.disconnect();
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
