// Firebase Configuration and Initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required environment variables are present
const requiredVars = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
};

const missing = Object.keys(requiredVars).filter((k) => !requiredVars[k]);
if (missing.length > 0) {
  const msg =
    `Firebase configuration is incomplete. Missing environment variables: ${missing.join(
      ', '
    )}.\n` +
    'Please copy `.env.example` to `.env.local` and add your Firebase web app config (see README / SETUP_GUIDE.md).\n' +
    'Example keys: VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_APP_ID';
  // Provide a clear console message during development and stop initialization to avoid downstream Firebase errors
  console.error(msg);
  // Throw so the bundler/dev server shows a clear error and prevents calling Firebase with invalid config
  throw new Error(msg);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Auth instance
const auth = getAuth(app);

// Get Firebase Storage instance
const storage = getStorage(app);

export { auth as default, storage };
