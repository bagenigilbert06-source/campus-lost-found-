import { Schema, model, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: string;
  itemId: string;
  createdAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: String, required: true, index: true },
    itemId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

// Create a compound unique index to prevent duplicate bookmarks
BookmarkSchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const Bookmark = model<IBookmark>('Bookmark', BookmarkSchema);
