import { api } from './api';
import { ApiResponse, Order, Product, ProductDetail, SellerProfile } from '../types';

export interface AdminDashboardData {
  totalCustomers: number;
  approvedSellers: number;
  pendingSellers: number;
  publishedProducts: number;
  pendingProductApprovals: number;
  totalOrders: number;
  grossMerchandiseValue: number;
  platformRevenue: number;
  ordersByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
}

export interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  timestamp: string;
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardData> {
    const res = await api.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return res.data.data;
  },

  async getAllSellers(): Promise<SellerProfile[]> {
    const res = await api.get<ApiResponse<SellerProfile[]>>('/admin/sellers');
    return res.data.data;
  },

  async updateSellerStatus(sellerId: number, status: string, reason?: string, commissionRate?: number): Promise<SellerProfile> {
    const res = await api.post<ApiResponse<SellerProfile>>(`/admin/sellers/${sellerId}/status`, {
      status,
      reason,
      commissionRate
    });
    return res.data.data;
  },

  async getAllProducts(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/admin/products');
    return res.data.data;
  },

  async moderateProduct(productId: number, approvalStatus: string, publicationStatus?: string): Promise<ProductDetail> {
    const res = await api.post<ApiResponse<ProductDetail>>(`/admin/products/${productId}/moderate`, null, {
      params: { approvalStatus, publicationStatus }
    });
    return res.data.data;
  },

  async getAllOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/admin/orders');
    return res.data.data;
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await api.get<ApiResponse<AuditLog[]>>('/admin/audit-logs');
    return res.data.data;
  },

  async updateCommissionRate(commissionRate: number): Promise<void> {
    await api.post('/admin/settings/commission', { commissionRate });
  }
};
