import admin from 'firebase-admin';

let firebaseApp: admin.app.App;

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  // Normalize and sanitize the raw private key coming from environment variables.
  // Common issues:
  // - Newlines are escaped as "\\n" (common when storing in .env or in some CI systems)
  // - The value might be wrapped in extra quotes
  // - The value might already be a JSON string with escapes
  let rawPk = process.env.FIREBASE_PRIVATE_KEY;

  if (rawPk && typeof rawPk === 'string') {
    // Work with a narrowed local variable to preserve string type across try/catch
    let pk: string = rawPk.trim();

    // If the value looks like a JSON-encoded string (starts and ends with a quote), try to parse it
    if ((pk.startsWith('"') && pk.endsWith('"')) || (pk.startsWith("'") && pk.endsWith("'"))) {
      try {
        // JSON.parse will unescape sequences like \n -> newline
        pk = JSON.parse(pk) as string;
      } catch (err) {
        // Fall back to stripping surrounding quotes if JSON.parse fails
        pk = pk.substring(1, pk.length - 1);
      }
    }

    // Replace any remaining escaped newlines (\n) with actual newlines
    pk = pk.replace(/\\n/g, '\n');

    // Assign back to the outer variable
    rawPk = pk;
  }

  const serviceAccount = {
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: rawPk,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  // Validate private key early to give clearer developer guidance
  const pk = serviceAccount.private_key;
  if (!pk || typeof pk !== 'string' || !pk.includes('BEGIN PRIVATE KEY')) {
    console.error(`\n[Firebase] FIREBASE_PRIVATE_KEY is not set or is invalid.\n` +
      `Ensure you have pasted the service account private key into your environment.\n` +
      `Recommended (in development): add to backend/.env.local as\n` +
      `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n<KEY_CONTENT>\\n-----END PRIVATE KEY-----\\n"\n` +
      `Or set it in your shell with: export FIREBASE_PRIVATE_KEY=$'-----BEGIN PRIVATE KEY-----\\n<KEY_CONTENT>\\n-----END PRIVATE KEY-----\\n'\n` +
      `Do NOT commit your service account key to source control.`);
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is missing or invalid');
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
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
