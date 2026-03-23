import { Item, IItem } from '../models/Item.js';

export class SearchService {
  async advancedSearch(filters: SearchFilters, page: number = 1, limit: number = 10): Promise<{ items: IItem[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = { status: 'active' };

    // Filter by item type
    if (filters.itemType) {
      query.itemType = filters.itemType;
    }

    // Filter by category
    if (filters.category && filters.category !== 'all') {
      query.category = filters.category;
    }

    // Filter by location (case-insensitive substring match)
    if (filters.location) {
      query.location = new RegExp(filters.location, 'i');
    }

    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      query.dateLost = {};
      if (filters.dateFrom) {
        query.dateLost.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.dateLost.$lte = new Date(filters.dateTo);
      }
    }

    // Full-text search on title and description
    if (filters.searchTerm) {
      const searchRegex = new RegExp(filters.searchTerm, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
      ];
    }

    // Get items and total count
    const [items, total] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query),
    ]);

    return { items: items as unknown as IItem[], total };
  }

  async searchByCategory(category: string): Promise<IItem[]> {
    const items = await Item.find({ category, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return items as unknown as IItem[];
  }

  async searchByLocation(location: string, radiusKm: number = 10): Promise<IItem[]> {
    // Simple text search - for production, use geospatial queries
    const items = await Item.find({ status: 'active' })
      .lean();

    return (items as unknown as IItem[]).filter((item) => {
      const distance = this.calculateStringSimilarity(item.location, location);
      return distance > 0.4; // 40% similarity threshold
    });
  }

  async getTrendingItems(days: number = 7): Promise<IItem[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    return Item.find({
      status: 'active',
      createdAt: { $gte: sinceDate },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean() as unknown as Promise<IItem[]>;
  }

  async getCategories(): Promise<string[]> {
    const categories = await Item.distinct('category', { status: 'active' });
    return categories.filter((c) => c);
  }

  async getLocations(): Promise<string[]> {
    const locations = await Item.distinct('location', { status: 'active' });
    return locations.filter((l) => l).slice(0, 50);
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private getEditDistance(s1: string, s2: string): number {
    const costs: number[] = [];

    for (let i = 0; i <= s1.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s2.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }

    return costs[s2.length];
  }
}

export interface SearchFilters {
  searchTerm?: string;
  itemType?: 'Lost' | 'Found';
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const searchService = new SearchService();
