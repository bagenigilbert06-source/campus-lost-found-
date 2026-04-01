# Corrected Key Files for Vercel Deployment

## File 1: api/index.js (Vercel Handler)
**Location:** `/api/index.js`
**Purpose:** Main serverless handler that Vercel executes

```javascript
import app from '../backend/dist/app.js';
import { initializeServerless } from '../backend/dist/serverless.js';

// Initialize once at module load (cold start)
let initialized = false;
let initPromise = null;

async function ensureInitialized() {
  if (initialized) return;
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = initializeServerless()
    .then(() => {
      initialized = true;
      console.log('[Vercel API] Serverless backend initialized');
    })
    .catch((error) => {
      console.error('[Vercel API] Failed to initialize:', error);
      initPromise = null; // Reset for retry
      throw error;
    });

  return initPromise;
}

// Export handler for Vercel
export default async function handler(req, res) {
  try {
    await ensureInitialized();
  } catch (error) {
    console.error('[API Handler] Initialization failed:', error);
    return res.status(500).json({ 
      error: 'Backend initialization failed',
      message: error.message 
    });
  }

  // Pass request through Express app
  return app(req, res);
}
```

---

## File 2: backend/src/serverless.ts (Initialization Logic)
**Location:** `/backend/src/serverless.ts`
**Purpose:** Handles database and Firebase initialization for serverless context

```typescript
import { connectDB } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initializeServerless(): Promise<void> {
  if (initialized) {
    return;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    console.log('[Serverless] initializing database and firebase');

    await connectDB();
    console.log('[Serverless] database connected');

    initializeFirebase();
    console.log('[Serverless] firebase initialized');

    initialized = true;
  })();

  return initPromise;
}
```

---

## File 3: backend/src/index.ts (Local Entry Point)
**Location:** `/backend/src/index.ts`
**Purpose:** Bootstraps the application locally, skipped in Vercel

```typescript
import app from './app.js';
import { initializeServerless } from './serverless.js';

const PORT = process.env.PORT || 3001;

async function bootstrap(): Promise<void> {
  try {
    console.log('[Backend] Bootstrapping starting...');

    await initializeServerless();

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`[Backend] Server running on port ${PORT}`);
        console.log(`[Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } else {
      console.log('[Backend] Running in Vercel serverless mode; no permanent listener started.');
    }
  } catch (error) {
    console.error('[Backend] Bootstrapping failed:', error);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
  }
}

if (!process.env.VERCEL) {
  bootstrap();
}

export default app;
```

---

## File 4: backend/src/app.ts (Express App Configuration)
**Location:** `/backend/src/app.ts`
**Purpose:** Configures Express middleware and routes
**Key Points:**
- Does NOT call `app.listen()`
- Does NOT call `connectDB()` or `initializeFirebase()`
- Includes `/api/health` endpoint (important for testing)
- Registers routes with `/api` prefix
- Exports the Express app object

```typescript
import './setup.js'; // Load environment variables first

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import searchRoutes from './routes/search.js';
import matchRoutes from './routes/matches.js';
import notificationRoutes from './routes/notifications.js';
import messagesRoutes from './routes/messages.js';
import bookmarkRoutes from './routes/bookmarks.js';
import claimsRoutes from './routes/claims.js';
import usersRoutes from './routes/users.js';
import imagesRoutes from './routes/images.js';
import geminiRoutes from './routes/gemini.js';
import { connectDB } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';

const app: Express = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:', process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3001'],
      connectSrc: ["'self'", 'https:', process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3001'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // Alternative dev port
      'http://localhost:3001', // Backend dev port
      process.env.FRONTEND_URL, // Deployed frontend URL
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined, // Vercel preview URLs
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.set('etag', false);

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

app.use(requestLogger);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/claims', claimsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/gemini', geminiRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

app.use(errorHandler);

export default app;
```

---

## File 5: vercel.json (Deployment Configuration)
**Location:** `/vercel.json`
**Purpose:** Tells Vercel how to build and route requests

```json
{
  "version": 2,
  "installCommand": "NODE_OPTIONS='--no-deprecation' pnpm install",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "env": {
    "NODE_OPTIONS": "--no-deprecation"
  },
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "^/(assets/.*|favicon\\.ico|robots\\.txt|sitemap\\.xml)$",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Key Configuration Points:**
- `"builds"`: Tells Vercel that `api/index.js` is a Node.js serverless function
- `"routes"`: 
  - First rule: All `/api/*` requests → `api/index.js` handler
  - Second rule: Static assets served directly
  - Third rule: Everything else → `index.html` (SPA fallback)

---

## File 6: .env.local (Development Environment)
**Location:** `/.env.local`
**Purpose:** Development environment variables

```
# MongoDB Configuration
MONGODB_URI=mongodb+srv://infocontactgilbertdev_db_user:junior2020@cluster0.ryskebn.mongodb.net/?appName=Cluster0

# Firebase Configuration for Backend (Admin SDK)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=mizizzi-1613c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@mizizzi-1613c.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=104754232610222300630
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40mizizzi-1613c.iam.gserviceaccount.com

# Firebase Configuration for Frontend (Vite)
VITE_FIREBASE_API_KEY=AIzaSyDkBlK0XJgxCWAStSdC31xJALv6KOVFDc0
VITE_FIREBASE_AUTH_DOMAIN=mizizzi-1613c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mizizzi-1613c
VITE_FIREBASE_STORAGE_BUCKET=mizizzi-1613c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=539425993253
VITE_FIREBASE_APP_ID=1:539425993253:web:4a26956229571ba25a85cc

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Frontend API Configuration
# For local development, frontend uses relative /api path which proxies to localhost:3001
# For Vercel production, set VITE_API_URL to your deployed backend URL
# Example: VITE_API_URL=https://your-backend.vercel.app/api
# Leave empty for relative path (works in same domain deployments)
VITE_API_URL=

LOG_LEVEL=info

# Google Gemini Configuration (AI Features)
GEMINI_API_KEY=AIzaSyB-Pv_hRZmMgQ7dGCKVVTtOgjzp_pVBa4I
GEMINI_MODEL=gemini-2.5-flash
GEMINI_REQUEST_TIMEOUT=30000
GEMINI_MAX_TOKENS=500
```

---

## File 7: api/[...all].ts (Catch-All Route)
**Location:** `/api/[...all].ts`
**Purpose:** Catch-all route that re-exports the handler

```typescript
import handler from './index.js';

export default handler;
```

---

## Compilation Outputs

After running `npm run build` in the backend directory, the following files in `backend/dist/` are critical:

```
backend/dist/
├── app.js              ← Express app configuration
├── app.d.ts            ← TypeScript definitions
├── index.js            ← Entry point for local dev
├── index.d.ts
├── serverless.js       ← Initialization logic (was missing, now generated)
├── serverless.d.ts
├── setup.js            ← Environment setup
├── setup.d.ts
├── config/
│   ├── database.js     ← MongoDB connection
│   └── firebase.js     ← Firebase initialization
├── routes/
│   ├── auth.js
│   ├── items.js        ← Accessed via /api/items
│   ├── search.js
│   └── ...
└── ...
```

---

## Testing the Corrected Setup

### Build & Compile
```bash
cd backend
npm run build
cd ..
```

### Local Testing
```bash
# Terminal 1: Backend
cd backend
npm run dev
# Output: [Backend] Server running on port 3001

# Terminal 2: Frontend
npm run dev
# Output: VITE dev server running...

# Test API (Terminal 3)
curl http://localhost:3001/api/health
# Response: {"status":"ok","timestamp":"2024-04-01T..."}
```

### Deployment to Vercel
```bash
git add .
git commit -m "Fix Vercel serverless deployment"
git push origin main
# Vercel auto-deploys

# After deployment
curl https://your-app.vercel.app/api/health
# Response: {"status":"ok","timestamp":"2024-04-01T..."}
```

---

**All files are now ready for Vercel serverless deployment!**
