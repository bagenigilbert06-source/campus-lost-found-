import express, { Router, Request, Response, NextFunction } from 'express';
import multer, { Multer } from 'multer';
import mongoose from 'mongoose';
import { hybridAuthMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadFile, downloadFile, deleteFile, getFileInfo } from '../services/gridfsService.js';

const router: Router = express.Router();

// Configure multer for memory storage (we'll stream directly to GridFS)
const storage = multer.memoryStorage();
const upload: Multer = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

/**
 * Upload profile photo
 * POST /api/images/profile
 */
router.post(
  '/profile',
  hybridAuthMiddleware,
  upload.single('file'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const timestamp = Date.now();
      const filename = `profile-${userId}-${timestamp}`;

      // Upload to GridFS with sanitized metadata
      const fileId = await uploadFile(filename, req.file.buffer, {
        userId: String(userId),
        type: 'profilePhoto',
        originalName: String(req.file.originalname),
        uploadedAt: new Date().toISOString(),
        mimeType: String(req.file.mimetype),
      });

      const absoluteUrl = `${req.protocol}://${req.get('host')}/api/images/download/${fileId.toString()}`;
      res.json({
        success: true,
        fileId: fileId.toString(),
        filename,
        url: absoluteUrl,
      });
    } catch (error) {
      console.error('[Images] Error uploading profile photo:', error);
      // Convert to AppError for consistent error handling
      if (error instanceof Error) {
        if (error.message.includes('not initialized')) {
          next(new AppError('Image service not ready. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
        } else if (error.message.includes('No file')) {
          next(new AppError('No file provided', 400, 'NO_FILE'));
        } else {
          next(new AppError(error.message, 500, 'UPLOAD_ERROR'));
        }
      } else {
        next(new AppError('Failed to upload profile photo', 500, 'UPLOAD_ERROR'));
      }
    }
  }
);

/**
 * Upload item photo
 * POST /api/images/item
 */
router.post(
  '/item',
  hybridAuthMiddleware,
  upload.single('file'),
  async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const timestamp = Date.now();
      const filename = `item-${userId}-${timestamp}`;

      // Upload to GridFS with sanitized metadata
      const fileId = await uploadFile(filename, req.file.buffer, {
        userId: String(userId),
        type: 'itemPhoto',
        originalName: String(req.file.originalname),
        uploadedAt: new Date().toISOString(),
        mimeType: String(req.file.mimetype),
      });

      const absoluteUrl = `${req.protocol}://${req.get('host')}/api/images/download/${fileId.toString()}`;
      res.json({
        success: true,
        fileId: fileId.toString(),
        filename,
        url: absoluteUrl,
      });
    } catch (error) {
      console.error('[Images] Error uploading item photo:', error);
      // Convert to AppError for consistent error handling
      if (error instanceof Error) {
        if (error.message.includes('not initialized')) {
          next(new AppError('Image service not ready. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
        } else if (error.message.includes('No file')) {
          next(new AppError('No file provided', 400, 'NO_FILE'));
        } else {
          next(new AppError(error.message, 500, 'UPLOAD_ERROR'));
        }
      } else {
        next(new AppError('Failed to upload item photo', 500, 'UPLOAD_ERROR'));
      }
    }
  }
);

/**
 * Download/Stream image
 * GET /api/images/download/:fileId
 */
router.get(
  '/download/:fileId',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;

      // Validate fileId format
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ error: 'Invalid file ID' });
      }

      // Get file info first
      const fileInfo = await getFileInfo(fileId);
      if (!fileInfo) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Set response headers
      res.set('Content-Type', (fileInfo as any).contentType || 'application/octet-stream');
      res.set('Content-Length', String((fileInfo as any).length || 0));
      res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      // Stream the file
      const downloadStream = downloadFile(fileId);
      downloadStream.pipe(res);

      downloadStream.on('error', () => {
        res.status(404).json({ error: 'File not found' });
      });
    } catch (error) {
      console.error('[Images] Error downloading file:', error);
      if (error instanceof Error && error.message.includes('not initialized')) {
        next(new AppError('Image service not ready. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
      } else {
        next(error);
      }
    }
  }
);

/**
 * Delete image
 * DELETE /api/images/:fileId
 */
router.delete(
  '/:fileId',
  hybridAuthMiddleware,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { fileId } = req.params;
      const userId = req.user?.uid;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Validate fileId format
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ error: 'Invalid file ID' });
      }

      // Get file info to verify ownership
      const fileInfo = await getFileInfo(fileId);
      if (!fileInfo) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Check if user owns the file
      if ((fileInfo as any).metadata?.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete the file
      await deleteFile(fileId);

      res.json({ success: true, message: 'File deleted' });
    } catch (error) {
      console.error('[Images] Error deleting file:', error);
      if (error instanceof Error && error.message.includes('not initialized')) {
        next(new AppError('Image service not ready. Please try again later.', 503, 'SERVICE_UNAVAILABLE'));
      } else {
        next(error);
      }
    }
  }
);

export default router;
