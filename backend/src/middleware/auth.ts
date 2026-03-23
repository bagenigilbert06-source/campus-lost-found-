import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
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

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decodedToken = jwt.verify(token, secret) as any;
    
    req.user = {
      uid: decodedToken.id,
      email: decodedToken.email,
      displayName: decodedToken.displayName,
      photoURL: decodedToken.photoURL,
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

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decodedToken = jwt.verify(token, secret) as any;
    req.user = {
      uid: decodedToken.id,
      email: decodedToken.email,
      displayName: decodedToken.displayName,
      photoURL: decodedToken.photoURL,
    };
    next();
  } catch (error) {
    // Token invalid but optional, continue
    next();
  }
}
