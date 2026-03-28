import { GridFSBucket, Db, ObjectId } from 'mongodb';
import { Readable } from 'stream';

let bucket: GridFSBucket;

/**
 * Sanitize metadata to ensure all values are BSON-compatible
 * Converts Date objects to ISO strings and removes functions
 */
const sanitizeMetadata = (metadata: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (value instanceof Date) {
      sanitized[key] = value.toISOString();
    } else if (typeof value === 'object') {
      // For nested objects, recursively sanitize
      if (Array.isArray(value)) {
        sanitized[key] = value.map((item) =>
          item instanceof Date ? item.toISOString() : item
        );
      } else {
        sanitized[key] = sanitizeMetadata(value);
      }
    } else if (typeof value !== 'function') {
      // Only include serializable types
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Initialize GridFS bucket
 * Call this after MongoDB connection is established
 */
export const initializeGridFS = (db: Db) => {
  bucket = new GridFSBucket(db, { bucketName: 'images' });
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
): Promise<ObjectId> => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized. Make sure MongoDB is connected before uploading files.');
  }

  return new Promise((resolve, reject) => {
    try {
      // Sanitize metadata to ensure BSON compatibility
      const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};
      
      const uploadStream = bucket.openUploadStream(filename, {
        metadata: sanitizedMetadata,
      });

      uploadStream.on('finish', () => {
        resolve(uploadStream.id as ObjectId);
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
export const downloadFile = (fileId: ObjectId | string): Readable => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  return bucket.openDownloadStream(objectId);
};

/**
 * Delete a file from MongoDB GridFS
 * @param fileId - The MongoDB ObjectId of the file
 */
export const deleteFile = async (fileId: ObjectId | string): Promise<void> => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  return bucket.delete(objectId);
};

/**
 * Get file info by ID
 * @param fileId - The MongoDB ObjectId of the file
 * @returns File info or null if not found
 */
export const getFileInfo = async (fileId: ObjectId | string) => {
  if (!bucket) {
    throw new Error('GridFS bucket not initialized');
  }
  const objectId = typeof fileId === 'string' ? new ObjectId(fileId) : fileId;
  
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
