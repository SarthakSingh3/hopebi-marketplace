import { api } from './api';
import { ApiResponse, PageResponse, Product, ProductDetail, Review } from '../types';

export interface ProductFilterParams {
  category?: string;
  seller?: string;
  inStock?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

export const productService = {
  async getProducts(params: ProductFilterParams = {}): Promise<PageResponse<Product>> {
    const res = await api.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },

  async getFeaturedDiscoveries(limit = 8): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products/featured', { params: { limit } });
    return res.data.data;
  },

  async getProductBySlug(slug: string): Promise<ProductDetail> {
    const res = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
    return res.data.data;
  },

  async getProductReviews(productId: number): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>(`/products/${productId}/reviews`);
    return res.data.data;
  },

  async submitReview(data: { productId: number; rating: number; title?: string; comment: string; imageUrl?: string }): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>('/me/reviews', data);
    return res.data.data;
  }
};
