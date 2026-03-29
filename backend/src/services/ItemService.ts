import { Item, IItem } from '../models/Item.js';
import { NotFound, BadRequest } from '../middleware/errorHandler.js';
import { userService } from './UserService.js';

export class ItemService {
  async createItem(data: Partial<IItem>, userId: string): Promise<IItem> {
    const item = new Item({
      ...data,
      userId,
      status: 'active',
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

    const query: any = { status: filters.status || 'active' };

    if (filters.category) query.category = filters.category;
    if (filters.location) query.location = new RegExp(filters.location, 'i');
    if (filters.itemType) query.itemType = filters.itemType;
    if (filters.userId) query.userId = filters.userId;

    const [items, total] = await Promise.all([
      Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Item.countDocuments(query),
    ]);

    return { items, total };
  }

  async updateItem(itemId: string, userId: string, data: Partial<IItem>): Promise<IItem> {
    const item = await Item.findById(itemId);

    if (!item) {
      throw NotFound('Item not found');
    }

    if (item.userId !== userId) {
      throw new Error('Unauthorized to update this item');
    }

    Object.assign(item, data);
    await item.save();
    return item;
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

    item.status = 'claimed';
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
