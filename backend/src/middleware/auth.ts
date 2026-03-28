import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'campus-lost-found-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    role?: string;
    authProvider?: string;
    displayName?: string;
    photoURL?: string;
  };
}

/**
 * Firebase auth middleware - verifies Firebase ID tokens
 * Used for Google sign-in flow
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ message: 'No authorization token provided' });
      return;
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      displayName: (decodedToken as any).name || (decodedToken as any).displayName,
      photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL,
    };

    next();
  } catch (error) {
    console.error('[Auth] Firebase token verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Local auth middleware - verifies local JWT tokens
 * Used for email/password sign-in flow
 */
export async function localAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ message: 'No authorization token provided' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      uid: string;
      email: string;
      role: string;
      authProvider: string;
    };

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
      authProvider: decoded.authProvider,
    };

    next();
  } catch (error) {
    console.error('[Auth] Local JWT verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Hybrid auth middleware - tries local JWT first, then Firebase
 * Use this when you need to support both auth methods
 */
export async function hybridAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ message: 'No authorization token provided' });
      return;
    }

    // Try local JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        uid: string;
        email: string;
        role: string;
        authProvider: string;
      };

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        authProvider: decoded.authProvider,
      };

      next();
      return;
    } catch (jwtError) {
      // JWT verification failed, try Firebase
    }

    // Try Firebase token
    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      displayName: (decodedToken as any).name || (decodedToken as any).displayName,
      photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL,
    };

    next();
  } catch (error) {
    console.error('[Auth] Hybrid auth verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware - doesn't require auth but attaches user if present
 */
export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      next();
      return;
    }

    // Try local JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        uid: string;
        email: string;
        role: string;
        authProvider: string;
      };

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        authProvider: decoded.authProvider,
      };

      next();
      return;
    } catch (jwtError) {
      // JWT verification failed, try Firebase
    }

    // Try Firebase token
    getFirebaseAuth().verifyIdToken(token).then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
      };
      next();
    }).catch(() => {
      // Token invalid but optional, continue without user
      next();
    });
  } catch (error) {
    next();
  }
}

/**
 * Admin only middleware - requires admin role
 */
export async function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({ message: 'No authorization token provided' });
      return;
    }

    // Try local JWT first
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        uid: string;
        email: string;
        role: string;
        authProvider: string;
      };

      if (decoded.role !== 'admin') {
        res.status(403).json({ message: 'Admin access required' });
        return;
      }

      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: decoded.role,
        authProvider: decoded.authProvider,
      };

      next();
      return;
    } catch (jwtError) {
      // JWT verification failed, try Firebase
    }

    // Try Firebase token - check admin emails
    const ADMIN_EMAILS = [
      'bagenigilbert@zetech.ac.ke',
      'admin@zetech.ac.ke',
      'security@zetech.ac.ke'
    ];

    const decodedToken = await getFirebaseAuth().verifyIdToken(token);
    
    if (!decodedToken.email || !ADMIN_EMAILS.includes(decodedToken.email.toLowerCase())) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: 'admin',
      email_verified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    console.error('[Auth] Admin verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
