import mongoose from 'mongoose';
import { Readable } from 'stream';

let bucket: mongoose.mongo.GridFSBucket;

/**
 * Sanitize metadata to ensure all values are BSON-compatible
 * Converts Date objects to ISO strings, removes functions, and ensures plain objects
 */
const sanitizeMetadata = (metadata: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (value instanceof Date) {
      // Convert Date to ISO string
      sanitized[key] = value.toISOString();
    } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      // Primitive types are safe
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      // Handle arrays recursively
      sanitized[key] = value.map((item) => {
        if (item instanceof Date) {
          return item.toISOString();
        } else if (item !== null && typeof item === 'object') {
          // Recursively sanitize nested objects in arrays
          return sanitizeMetadata(item);
        }
        return item;
      });
    } else if (typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeMetadata(value);
    }
    // Skip functions and other non-serializable types
  }
  
  return sanitized;
};

/**
 * Initialize GridFS bucket
 * Call this after MongoDB connection is established
 */
export const initializeGridFS = (db: mongoose.mongo.Db) => {
  bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'images' });
};

/**
 * Upload a file to MongoDB GridFS
 * @param filename - Name of the file
 * @param fileContent - Buffer or stream of file content
 * @param metadata - Additional metadata to store with the file
 * @returns Promise with file ID
 */
export const uploadFile = async (
  filename: string,
  fileContent: Buffer | Readable,
  metadata?: Record<string, any>
): Promise<mongoose.Types.ObjectId> => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Make sure MongoDB is connected before uploading files.');
  }

  return new Promise((resolve, reject) => {
    try {
      // Sanitize metadata to ensure BSON compatibility
      const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};
      
      // Convert to plain object to ensure BSON serialization works
      const cleanMetadata = JSON.parse(JSON.stringify(sanitizedMetadata));
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: cleanMetadata,
      });

      uploadStream.on('finish', () => {
        resolve(uploadStream.id as mongoose.mongo.ObjectId);
      });

      uploadStream.on('error', reject);

      if (Buffer.isBuffer(fileContent)) {
        uploadStream.end(fileContent);
      } else {
        fileContent.pipe(uploadStream);
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Download a file from MongoDB GridFS
 * @param fileId - The MongoDB ObjectId of the file
 * @returns ReadableStream of file content
 */
export const downloadFile = (fileId: mongoose.mongo.ObjectId | string): Readable => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
};

/**
 * Delete a file from MongoDB GridFS
 * @param fileId - The MongoDB ObjectId of the file
 */
export const deleteFile = async (fileId: mongoose.mongo.ObjectId | string): Promise<void> => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  return bucket.delete(objectId);
};

/**
 * Get file info by ID
 * @param fileId - The MongoDB ObjectId of the file
 * @returns File info or null if not found
 */
export const getFileInfo = async (fileId: mongoose.mongo.ObjectId | string) => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  
  const files = await bucket.find({ _id: objectId }).toArray();
  return files.length > 0 ? files[0] : null;
};

export default {
  initializeGridFS,
  uploadFile,
  downloadFile,
  deleteFile,
  getFileInfo,
};
