import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuth } from '../config/firebase.js';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    // optional profile fields that may be present on decoded Firebase token
    displayName?: string;
    photoURL?: string;
  };
}

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
    console.error('[Auth] Token verification failed:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function optionalAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      next();
      return;
    }

    getFirebaseAuth().verifyIdToken(token).then((decodedToken) => {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        email_verified: decodedToken.email_verified,
      };
      next();
    }).catch(() => {
      // Token invalid but optional, continue
      next();
    });
  } catch (error) {
    next();
  }
}
