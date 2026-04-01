import admin from 'firebase-admin';

let firebaseApp: admin.app.App;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // For production (Vercel), use environment variables
  // For development, fall back to service account file if available
  let credential: admin.credential.Credential;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Production: Use environment variables
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
    const privateKey = rawPrivateKey
      .replace(/\\n/g, '\n')
      .replace(/^\"|\"$/g, '');

    if (!privateKey || privateKey.includes('YOUR_PRIVATE_KEY')) {
      throw new Error('Invalid FIREBASE_PRIVATE_KEY provided. Please set it in environment variables.');
    }

    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Development: Use service account file
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error('Firebase credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY for production, or GOOGLE_APPLICATION_CREDENTIALS for development.');
  }

  firebaseApp = admin.initializeApp({
    credential,
  });

  return firebaseApp;
}

export function getFirebaseAuth(): admin.auth.Auth {
  if (!firebaseApp) {
    console.error('[Firebase] App not initialized! Call initializeFirebase() first');
    throw new Error('Firebase app not initialized');
  }
  return admin.auth(firebaseApp);
}

export function getFirebaseDB(): admin.database.Database {
  return admin.database();
}

export default admin;
