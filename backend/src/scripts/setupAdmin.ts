import mongoose from 'mongoose';
import { initializeFirebase } from '../config/firebase.js';
import { User } from '../models/User.js';
import { userService } from '../services/UserService.js';
import admin from 'firebase-admin';

/**
 * Setup Admin User Script
 * Creates an admin user in both Firebase and MongoDB
 * 
 * Usage: npx ts-node src/scripts/setupAdmin.ts
 */

const ADMIN_EMAIL = 'bagenigilbert@zetech.ac.ke';
const ADMIN_PASSWORD = 'junior2020';
const ADMIN_DISPLAY_NAME = 'Admin User';

async function setupAdmin() {
  try {
    console.log('[Admin Setup] Starting admin user setup...');
    
    // Initialize Firebase Admin SDK
    console.log('[Admin Setup] Initializing Firebase Admin SDK...');
    const firebaseAdmin = initializeFirebase();

    // Connect to MongoDB
    console.log('[Admin Setup] Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('[Admin Setup] Connected to MongoDB');

    // Step 1: Check if user already exists in Firebase
    let firebaseUser;
    try {
      console.log(`[Admin Setup] Checking if Firebase user exists: ${ADMIN_EMAIL}`);
      firebaseUser = await firebaseAdmin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log('[Admin Setup] Firebase user already exists:', firebaseUser.uid);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        console.log('[Admin Setup] Firebase user does not exist, creating new user...');
        firebaseUser = await firebaseAdmin.auth().createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          displayName: ADMIN_DISPLAY_NAME,
        });
        console.log('[Admin Setup] Firebase user created successfully');
        console.log('[Admin Setup] User UID:', firebaseUser.uid);
      } else {
        throw err;
      }
    }

    // Step 2: Check if user exists in MongoDB
    let mongoDBUser = await User.findById(firebaseUser.uid);
    
    if (!mongoDBUser) {
      console.log('[Admin Setup] Creating MongoDB user...');
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
      console.log('[Admin Setup] MongoDB user created successfully');
    } else {
      console.log('[Admin Setup] MongoDB user already exists');
    }

    console.log('\n[Admin Setup] ✅ Admin user setup complete!');
    console.log('━'.repeat(50));
    console.log('Admin Credentials:');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('━'.repeat(50));
    console.log('\nYou can now sign in at: http://localhost:5173/admin');
    console.log('\nMake sure the email is in schoolConfig.js adminEmails array');
    console.log('(Already added: src/config/schoolConfig.js)');

    await mongoose.disconnect();
    console.log('[Admin Setup] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('[Admin Setup] Error:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdmin();
