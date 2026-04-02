import { Item, IItem } from '../models/Item.js';

export interface Match {
  lostItem: IItem;
  foundItem: IItem;
  score: number;
  reasons: string[];
}

export class MatchingService {
  /**
   * Find potential matches between lost and found items
   */
  async findMatches(itemId: string): Promise<Match[]> {
    const item = await Item.findById(itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    const oppositeType = item.itemType === 'Lost' ? 'Found' : 'Lost';
    const candidateItems = await Item.find({
      itemType: oppositeType,
      status: 'active',
      category: item.category,
    });

    const matches: Match[] = candidateItems
      .map((candidateItem) => ({
        lostItem: item.itemType === 'Lost' ? item : candidateItem,
        foundItem: item.itemType === 'Found' ? item : candidateItem,
        score: this.calculateMatchScore(item, candidateItem),
        reasons: this.getMatchReasons(item, candidateItem),
      }))
      .filter((match) => match.score > 0.25) // Only keep matches with >25% score
      .sort((a, b) => b.score - a.score);

    return matches;
  }

  /**
   * Calculate match score between two items (0-1)
   */
  private calculateMatchScore(item1: IItem, item2: IItem): number {
    let score = 0;
    let totalWeight = 0;

    // Category match (40% weight)
    if (item1.category === item2.category) {
      score += 0.4;
    }
    totalWeight += 0.4;

    // Sub-type match (20% weight) - if both have sub-types
    if (item1.subType && item2.subType && item1.subType === item2.subType) {
      score += 0.2;
    } else if (item1.subType && item2.subType) {
      // Partial sub-type match
      const subTypeSimilarity = this.calculateStringSimilarity(item1.subType, item2.subType);
      score += subTypeSimilarity * 0.15;
    }
    totalWeight += 0.2;

    // Title similarity (20% weight)
    const titleSimilarity = this.calculateStringSimilarity(item1.title, item2.title);
    score += titleSimilarity * 0.2;
    totalWeight += 0.2;

    // Location match (10% weight)
    const locationSimilarity = this.calculateStringSimilarity(item1.location, item2.location);
    score += locationSimilarity * 0.1;
    totalWeight += 0.1;

    // Date proximity (10% weight)
    const daysDiff = Math.abs(
      new Date(item1.dateLost).getTime() - new Date(item2.dateLost).getTime()
    ) / (1000 * 60 * 60 * 24);

    const dateScore = Math.max(0, 1 - daysDiff / 30); // Full score if within 30 days
    score += dateScore * 0.1;
    totalWeight += 0.1;

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Get reasons why items might match
   */
  private getMatchReasons(item1: IItem, item2: IItem): string[] {
    const reasons: string[] = [];

    if (item1.category === item2.category) {
      reasons.push(`Both items are ${item1.category}`);
    }

    const locationSimilarity = this.calculateStringSimilarity(item1.location, item2.location);
    if (locationSimilarity > 0.5) {
      reasons.push(`Found in similar location: "${item1.location}" and "${item2.location}"`);
    }

    const daysDiff = Math.abs(
      new Date(item1.dateLost).getTime() - new Date(item2.dateLost).getTime()
    ) / (1000 * 60 * 60 * 24);

    if (daysDiff < 7) {
      reasons.push(`Items reported close in time (${Math.round(daysDiff)} days apart)`);
    }

    if (
      item1.coordinates &&
      item2.coordinates &&
      this.calculateDistance(
        item1.coordinates.lat,
        item1.coordinates.lng,
        item2.coordinates.lat,
        item2.coordinates.lng
      ) < 1 // Within 1km
    ) {
      reasons.push('Items reported near the same location');
    }

    return reasons;
  }

  /**
   * Simple string similarity using Levenshtein-like approach
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between strings
   */
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

  /**
   * Calculate distance between two coordinates
   */
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

export const matchingService = new MatchingService();
