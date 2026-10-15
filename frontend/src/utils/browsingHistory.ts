import { Product, ProductDetail } from '../types';

export interface ViewedProductItem {
  id: number;
  name: string;
  slug: string;
  primaryImageUrl?: string;
  effectivePrice: number;
  regularPrice: number;
  sellerName?: string;
  originCityState?: string;
  viewCount: number;
  lastViewedAt: number;
}

const STORAGE_KEY = 'hopebi_browsing_history_v1';

export const browsingHistory = {
  /**
   * Record a view on a product detail page
   */
  recordView(product: Product | ProductDetail): void {
    if (!product || !product.id) return;

    try {
      const history = this.getAll();
      const existingIndex = history.findIndex(item => item.id === product.id);

      const imageUrl = 'primaryImageUrl' in product && product.primaryImageUrl
        ? product.primaryImageUrl
        : ('images' in product && product.images?.length > 0 ? product.images[0].imageUrl : undefined);

      if (existingIndex >= 0) {
        history[existingIndex].viewCount += 1;
        history[existingIndex].lastViewedAt = Date.now();
        history[existingIndex].effectivePrice = product.effectivePrice;
        history[existingIndex].regularPrice = product.regularPrice;
        if (imageUrl) history[existingIndex].primaryImageUrl = imageUrl;
      } else {
        history.unshift({
          id: product.id,
          name: product.name,
          slug: product.slug,
          primaryImageUrl: imageUrl,
          effectivePrice: product.effectivePrice,
          regularPrice: product.regularPrice,
          sellerName: product.sellerName,
          originCityState: product.originCityState,
          viewCount: 1,
          lastViewedAt: Date.now(),
        });
      }

      // Keep max 20 products
      const trimmed = history.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to record browsing history', e);
    }
  },

  /**
   * Get all viewed products
   */
  getAll(): ViewedProductItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  /**
   * Get products viewed frequently (viewCount >= 2 or sorted by highest views)
   */
  getFrequentOrRecent(limit = 6): ViewedProductItem[] {
    const all = this.getAll();
    // Sort primarily by view count desc, secondarily by recency
    return all
      .sort((a, b) => {
        if (b.viewCount !== a.viewCount) {
          return b.viewCount - a.viewCount;
        }
        return b.lastViewedAt - a.lastViewedAt;
      })
      .slice(0, limit);
  },

  /**
   * Clear history
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};
