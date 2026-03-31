import { Item, IItem } from '../models/Item.js';
import { NotFound, BadRequest, Forbidden } from '../middleware/errorHandler.js';
import { userService } from './UserService.js';

export class ItemService {
  async createItem(data: Partial<IItem>, userId: string, isAdmin = false): Promise<IItem> {
    const props = data as any;
    const itemType = (props.itemType || props.postType || 'Lost') as 'Lost' | 'Found' | 'Recovered';

    if (!['Lost', 'Found', 'Recovered'].includes(itemType)) {
      throw BadRequest('Invalid post type');
    }

    if (!isAdmin && !['Lost', 'Found'].includes(itemType)) {
      throw BadRequest('Normal users can only create Lost or Found items');
    }

    const item = new Item({
      ...data,
      userId,
      status: 'active',
      itemType,
      postType: itemType,
    });

    await item.save();
    await userService.incrementUserStats(userId, 'itemsPosted');
    return item;
  }

  async getItemById(itemId: string): Promise<IItem> {
    const item = await Item.findById(itemId);
    if (!item) {
      throw NotFound('Item not found');
    }
    return item;
  }

  async getItems(filters: any = {}, page: number = 1, limit: number = 10): Promise<{ items: IItem[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: any = {};
    
    // Only filter by status if explicitly provided.
    // For public search (no specific user) default to active items only,
    // but for user-specific queries we should include all statuses.
    if (filters.status !== undefined) {
      // Support legacy status value from older data, map to current value.
      query.status = filters.status === 'claimed' ? 'claim_in_progress' : filters.status;
    } else if (!filters.userId && !filters.userEmail) {
      query.status = 'active'; // Default to showing only active items for public listings
    }

    if (filters.category) query.category = filters.category;
    if (filters.location) query.location = new RegExp(filters.location, 'i');
    // post type (Lost/Found/Recovered) alias:
    if (filters.postType) query.itemType = filters.postType;
    if (filters.itemType) query.itemType = filters.itemType;
    if (filters.subType) query.subType = filters.subType;
    if (filters.userId) query.userId = filters.userId;
    if (filters.email) query.email = filters.email.toLowerCase();
    if (filters.userEmail) query.email = filters.userEmail.toLowerCase();

    const [items, total] = await Promise.all([
      Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(query),
    ]);

    return { items, total };
  }

  async updateItem(itemId: string, userId: string, data: Partial<IItem>, isAdmin = false): Promise<IItem> {
    try {
      const item = await Item.findById(itemId);

      if (!item) {
        throw NotFound('Item not found');
      }

      // Backwards compatibility: legacy items may still have status "claimed".
      // Normalize to current canonical value before running validation/update logic.
      if ((item as any).status === 'claimed') {
        (item as any).status = 'claim_in_progress';
      }

      if (!isAdmin) {
        const currentUser = await userService.getUserById(userId);
        const currentEmail = currentUser?.email?.toLowerCase() || '';
        const itemOwnerId = item.userId || '';
        const itemOwnerEmail = (item.email || '').toLowerCase();

        const isOwner = itemOwnerId === userId || (itemOwnerId === '' && itemOwnerEmail && itemOwnerEmail === currentEmail);

        if (!isOwner) {
          throw Forbidden('Unauthorized to update this item');
        }
      }

      const patch = data as any;

      // Ensure dateLost is a proper Date object
      if (patch.dateLost && typeof patch.dateLost === 'string') {
        patch.dateLost = new Date(patch.dateLost);
      }

      if (!isAdmin) {
        const safeFields = [
          'title',
          'description',
          'category',
          'location',
          'dateLost',
          'subType',
          'images',
          'distinguishingFeatures',
          'coordinates',
          'itemType',
        ];
        const blockedFields = [
          'status',
          'verificationStatus',
          'claimedBy',
          'recoveredBy',
          'claimedAt',
          'recoveredAt',
          'postType',
          'metadata',
        ];

        for (const field of Object.keys(patch)) {
          if (!safeFields.includes(field)) {
            throw BadRequest(`Field '${field}' cannot be updated by normal users`);
          }
        }

        if (patch.itemType && !['Lost', 'Found'].includes(patch.itemType)) {
          throw BadRequest('Normal users can only set itemType to Lost or Found');
        }

        if (patch.postType && !['Lost', 'Found'].includes(patch.postType)) {
          throw BadRequest('Normal users can only set postType to Lost or Found');
        }

        if (blockedFields.some((f) => Object.prototype.hasOwnProperty.call(patch, f))) {
          throw BadRequest('Attempt to modify admin-only fields');
        }
      }

      // Normalize patch status from legacy value if present
      if (patch.status === 'claimed') {
        patch.status = 'claim_in_progress';
      }

      if (patch.itemType || patch.postType) {
        const resolvedType = patch.itemType || patch.postType;
        if (!['Lost', 'Found', 'Recovered'].includes(resolvedType as string)) {
          throw BadRequest('Invalid post type');
        }
        item.itemType = resolvedType as 'Lost' | 'Found' | 'Recovered';
        (item as any).postType = resolvedType as 'Lost' | 'Found' | 'Recovered';
      }

      if (patch.subType) {
        item.subType = patch.subType;
      }

      // apply safe updates
      const allowedUpdate = isAdmin
        ? patch
        : {
            title: patch.title,
            description: patch.description,
            category: patch.category,
            location: patch.location,
            dateLost: patch.dateLost,
            subType: patch.subType,
            images: patch.images,
            distinguishingFeatures: patch.distinguishingFeatures,
            coordinates: patch.coordinates,
            itemType: patch.itemType,
            postType: patch.postType,
          };

      Object.assign(item, Object.keys(allowedUpdate).reduce((acc, key) => {
        if (allowedUpdate[key] !== undefined) acc[key] = allowedUpdate[key];
        return acc;
      }, {} as any));

      await item.save();
      return item;
    } catch (error) {
      console.error('[ItemService] Error updating item:', {
        itemId,
        userId,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  async deleteItem(itemId: string, userId: string): Promise<void> {
    const item = await Item.findById(itemId);

    if (!item) {
      throw NotFound('Item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Unauthorized to delete this item');
    }

    await Item.findByIdAndDelete(itemId);
  }

  async claimItem(itemId: string, userId: string): Promise<IItem> {
    const item = await Item.findById(itemId);

    if (!item) {
      throw NotFound('Item not found');
    }

    if (item.status !== 'active') {
      throw BadRequest('Item is already claimed or recovered');
    }

    // Get user details for claimedBy field
    const user = await userService.getUserById(userId);

    item.status = 'claim_in_progress';
    item.claimedBy = {
      email: user.email,
      name: user.displayName,
      date: new Date(),
    };
    item.claimedAt = new Date();
    await item.save();

    await userService.incrementUserStats(userId, 'itemsClaimed');
    if (item.userId) {
      await userService.incrementUserStats(item.userId, 'itemsRecovered');
    }

    return item;
  }

  async searchNearby(lat: number, lng: number, radiusKm: number = 5): Promise<IItem[]> {
    // Simple distance calculation (for production, use geospatial indexes)
    const items = await Item.find({ status: 'active' });

    return items.filter((item) => {
      if (!item.coordinates) return false;
      const distance = this.calculateDistance(
        lat,
        lng,
        item.coordinates.lat,
        item.coordinates.lng
      );
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const itemService = new ItemService();
