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

app.get('/health', (req: Request, res: Response) => {
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
