import { api } from './api';
import { ApiResponse, Product, ProductDetail, SellerProfile, SellerPublic } from '../types';

export interface SellerApplicationData {
  companyName: string;
  companyDescription: string;
  city: string;
  state: string;
  manufacturerHeritage?: string;
  contactPhone: string;
  businessEmail: string;
  gstNumber?: string;
  contactPersonName?: string;
  password?: string;
}

export interface ProductCreateData {
  name: string;
  categoryId: number;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  regularPrice: number;
  salePrice?: number;
  stockQuantity: number;
  materials?: string;
  dimensions?: string;
  weightGrams?: number;
  returnPolicy?: string;
  originCityState?: string;
  verifiedClaims?: string;
  imageUrls?: string[];
}

export const sellerService = {
  async getApprovedSellers(): Promise<SellerPublic[]> {
    const res = await api.get<ApiResponse<SellerPublic[]>>('/sellers');
    return res.data.data;
  },

  async getSellerBySlug(slug: string): Promise<SellerPublic> {
    const res = await api.get<ApiResponse<SellerPublic>>(`/sellers/${slug}`);
    return res.data.data;
  },

  async apply(data: SellerApplicationData): Promise<SellerProfile> {
    const res = await api.post<ApiResponse<SellerProfile>>('/seller-applications', data);
    return res.data.data;
  },

  async getMyProfile(): Promise<SellerProfile> {
    const res = await api.get<ApiResponse<SellerProfile>>('/seller/profile');
    return res.data.data;
  },

  async getMyProducts(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/seller/products');
    return res.data.data;
  },

  async createProduct(data: ProductCreateData): Promise<ProductDetail> {
    const res = await api.post<ApiResponse<ProductDetail>>('/seller/products', data);
    return res.data.data;
  },

  async updateProduct(id: number, data: ProductCreateData): Promise<ProductDetail> {
    const res = await api.put<ApiResponse<ProductDetail>>(`/seller/products/${id}`, data);
    return res.data.data;
  },

  async submitProductForApproval(id: number): Promise<ProductDetail> {
    const res = await api.post<ApiResponse<ProductDetail>>(`/seller/products/${id}/submit`);
    return res.data.data;
  },

  async getMyOrders(): Promise<any[]> {
    const res = await api.get<ApiResponse<any[]>>('/seller/orders');
    return res.data.data;
  },

  async dispatchOrderItem(itemId: number, data: { carrier: string; trackingNumber: string }): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/seller/order-items/${itemId}/dispatch`, data);
    return res.data.data;
  },

  async markOrderItemDelivered(itemId: number): Promise<any> {
    const res = await api.post<ApiResponse<any>>(`/seller/order-items/${itemId}/deliver`);
    return res.data.data;
  },

  async getAnalytics(): Promise<any> {
    const res = await api.get<ApiResponse<any>>('/seller/analytics');
    return res.data.data;
  }
};
