import mongoose from 'mongoose';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Simple MongoDB Admin Setup Script
 * Directly adds admin user to MongoDB without Firebase dependency
 */

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const ADMIN_EMAIL = 'bagenigilbert@zetech.ac.ke';
const ADMIN_PASSWORD = 'junior2020';
const ADMIN_DISPLAY_NAME = 'Admin User';

async function setupAdminMongo() {
  try {
    console.log('[Admin Setup] Starting MongoDB admin user setup...');
    
    // Connect to MongoDB
    console.log('[Admin Setup] Connecting to MongoDB...');
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(MONGODB_URI);
    console.log('[Admin Setup] Connected to MongoDB');

    // Generate a unique Firebase-like UID (matching Firebase's pattern)
    // Firebase UIDs are typically 28 characters long and alphanumeric
    const adminUID = crypto.randomBytes(14).toString('hex');

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  // Check if user already exists
  let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    
  if (adminUser) {
    console.log('[Admin Setup] Admin user already exists in MongoDB');
    console.log('[Admin Setup] Email:', adminUser.email);
    console.log('[Admin Setup] User ID:', adminUser._id);

    const updates: any = {};
    if (!adminUser.authProvider || adminUser.authProvider !== 'local') {
      updates.authProvider = 'local';
    }
    if (!adminUser.role || adminUser.role !== 'admin') {
      updates.role = 'admin';
    }
    if (!adminUser.passwordHash) {
      updates.passwordHash = passwordHash;
    }
    if (!adminUser.isActive) {
      updates.isActive = true;
    }

    if (Object.keys(updates).length > 0) {
      await User.updateOne({ _id: adminUser._id }, { $set: updates });
      console.log('[Admin Setup] Admin user updated with local auth settings.');
    }
  } else {
    console.log('[Admin Setup] Creating admin user in MongoDB...');
    adminUser = new User({
      _id: adminUID,
      email: ADMIN_EMAIL,
      displayName: ADMIN_DISPLAY_NAME,
      passwordHash,
      authProvider: 'local',
      role: 'admin',
      isActive: true,
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
      adminProfile: {
        permissions: ['verify_items', 'manage_users', 'view_reports'],
        createdAt: new Date().toISOString(),
      console.log('[Admin Setup] Generated User ID:', adminUID);
    }

    console.log('\n[Admin Setup] ✅ MongoDB admin user setup complete!');
    console.log('━'.repeat(60));
    console.log('Admin Credentials (for sign-in):');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log('━'.repeat(60));
    console.log('\n📝 IMPORTANT NEXT STEPS:');
    console.log('\n1️⃣  Create the SAME credentials in Firebase:');
    console.log('   - Go to: https://console.firebase.google.com/');
    console.log('   - Project: mizizzi-1613c');
    console.log('   - Authentication → Users tab');
    console.log(`   - Click "Create user" and use:`)
    console.log(`     Email:    ${ADMIN_EMAIL}`);
    console.log(`     Password: ${ADMIN_PASSWORD}`);
    console.log('\n2️⃣  The email is already added to schoolConfig.js adminEmails');
    console.log('   ✓ Location: src/config/schoolConfig.js');
    console.log('\n3️⃣  Sign in at: http://localhost:5173/admin');
    console.log('\n⚠️  Note: Without creating the user in Firebase, ');
    console.log('   you won\'t be able to sign in. Firebase handles authentication.');

    await mongoose.disconnect();
    console.log('\n[Admin Setup] Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('[Admin Setup] Error:', error);
    process.exit(1);
  }
}

// Run the setup
setupAdminMongo();
