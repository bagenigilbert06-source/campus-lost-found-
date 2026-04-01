import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase.js';

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
 * Optional auth middleware - attempts to verify JWT/Firebase token if present
 * Does not fail if token is missing, allowing anonymous access
 * Used for endpoints that support both authenticated and unauthenticated requests
 */
export async function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      // No token provided - continue without user context
      return next();
    }

    try {
      const decodedToken = await getFirebaseAuth().verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
        displayName: (decodedToken as any).name || (decodedToken as any).displayName,
        photoURL: (decodedToken as any).picture || (decodedToken as any).photoURL,
      };

      return next();
    } catch (firebaseError) {
      // Invalid token but don't fail - just continue without user context
      console.warn('[OptionalAuth] Firebase token verification failed, continuing unauthenticated');
      return next();
    }
  } catch (error) {
    // Unexpected error - continue without user context
    console.warn('[OptionalAuth] Unexpected error during authentication:', error);
    return next();
  }
}

export default optionalAuthMiddleware;
