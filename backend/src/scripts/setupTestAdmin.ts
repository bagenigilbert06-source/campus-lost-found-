import mongoose from 'mongoose';
import { initializeFirebase } from '../config/firebase.js';
import { User } from '../models/User.js';
import admin from 'firebase-admin';

/**
 * Setup Test Admin User Script
 * Creates a test admin user in both Firebase and MongoDB for E2E testing
 *
 * Usage: npx ts-node src/scripts/setupTestAdmin.ts
 */

const ADMIN_EMAIL = 'admin@zetech.ac.ke';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_DISPLAY_NAME = 'Test Admin User';

async function setupTestAdmin() {
  try {
    console.log('[Test Admin Setup] Starting test admin user setup...');

    // Initialize Firebase Admin SDK
    console.log('[Test Admin Setup] Initializing Firebase Admin SDK...');
    const firebaseAdmin = initializeFirebase();

    // Connect to MongoDB
    console.log('[Test Admin Setup] Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('[Test Admin Setup] Connected to MongoDB');

    // Step 1: Check if user already exists in Firebase
    let firebaseUser;
    try {
      console.log(`[Test Admin Setup] Checking if Firebase user exists: ${ADMIN_EMAIL}`);
      firebaseUser = await firebaseAdmin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('[Test Admin Setup] Firebase user already exists:', firebaseUser.uid);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.log('[Test Admin Setup] Firebase user does not exist, creating new user...');
        firebaseUser = await firebaseAdmin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_DISPLAY_NAME,
        });
        console.log('[Test Admin Setup] Firebase user created successfully');
        console.log('[Test Admin Setup] User UID:', firebaseUser.uid);
      } else {
        throw err;
      }
    }

    // Step 2: Check if user exists in MongoDB
    let mongoDBUser = await User.findById(firebaseUser.uid);

    if (!mongoDBUser) {
      console.log('[Test Admin Setup] Creating MongoDB user...');
      mongoDBUser = new User({
        _id: firebaseUser.uid,
        email: ADMIN_EMAIL,
        displayName: ADMIN_DISPLAY_NAME,
        profileImage: '',
        notificationPreferences: {
          emailOnMatch: true,
          emailOnRecovery: true,
          emailOnVerification: true,
          emailWeeklyDigest: false,
        },
        stats: {
          itemsPosted: 0,
          itemsRecovered: 0,
          itemsClaimed: 0,
        },
      });
      await mongoDBUser.save();
      console.log('[Test Admin Setup] MongoDB user created successfully');
    } else {
      console.log('[Test Admin Setup] MongoDB user already exists');
    }

    console.log('\n[Test Admin Setup] ✅ Test admin user setup complete!');
    console.log('━'.repeat(50));
    console.log('Test Admin Credentials:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('━'.repeat(50));
    console.log('\nYou can now sign in at: http://localhost:5173/admin-login');

    await mongoose.disconnect();
    console.log('[Test Admin Setup] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('[Test Admin Setup] Error:', error);
    process.exit(1);
  }
}

setupTestAdmin();