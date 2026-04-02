import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase.js';
import { userService } from '../services/UserService.js';

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
 * Used for Firebase authentication flow
 */
export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      console.warn('[Auth] No token provided in Authorization header');
      res.status(401).json({ message: 'No authorization token provided' });
      return;
    }

    console.debug('[Auth] Verifying Firebase token...');
    const firebaseAuth = getFirebaseAuth();
    const decodedToken = await firebaseAuth.verifyIdToken(token);

    console.debug('[Auth] Token verified successfully for user:', decodedToken.email);

    // Get user from database to include role, if available
    let user;
    try {
      user = await userService.getUserById(decodedToken.uid);
    } catch (dbErr) {
      // If user is not found, let the route handle it (e.g., /auth/register creates user)
      if ((dbErr as any).status === 404 || (dbErr as any).message?.includes('not found')) {
        console.warn('[Auth] User not found in DB, continuing with decoded token only');
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          email_verified: decodedToken.email_verified,
          role: 'student',
          authProvider: 'firebase',
          displayName: (decodedToken as any).name || (decodedToken as any).displayName || '',
          photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL || '',
        };
        return next();
      }

      throw dbErr;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      role: user.role,
      authProvider: user.authProvider,
      displayName: (decodedToken as any).name || (decodedToken as any).displayName || user.displayName,
      photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL || user.profileImage,
    };

    next();
  } catch (error) {
    const err = error as any;
    console.error('[Auth] Firebase token verification failed:');
    console.error('  Error Type:', err.code || err.name);
    console.error('  Message:', err.message);
    console.error('  Details:', err.errorInfo || 'N/A');
    res.status(401).json({ 
      message: 'Invalid or expired token',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}

/**
 * Optional auth middleware - doesn't require auth but attaches user if present
 */
export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      next();
      return;
    }

    // Try Firebase token
    try {
      const firebaseAuth = getFirebaseAuth();
      const decodedToken = await firebaseAuth.verifyIdToken(token);

      // Get user from database to include role
      const user = await userService.getUserById(decodedToken.uid);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        role: user.role,
        authProvider: user.authProvider,
        displayName: (decodedToken as any).name || (decodedToken as any).displayName || user.displayName,
        photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL || user.profileImage,
      };
    } catch (error) {
      // Token invalid but optional, continue without user
    }

    next();
  } catch (error) {
    next();
  }
}

/**
 * Admin-only middleware - checks if user has admin role
 */
export async function adminOnlyMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  // First check if user is authenticated
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
}
