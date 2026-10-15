import { api } from './api';
import { ApiResponse, Order, PaymentMethod, PromotionResult } from '../types';

export interface CheckoutData {
  addressId: number;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  idempotencyKey?: string;
}

export const orderService = {
  async checkout(data: CheckoutData): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>('/orders', data);
    return res.data.data;
  },

  async getMyOrders(): Promise<Order[]> {
    const res = await api.get<ApiResponse<Order[]>>('/orders');
    return res.data.data;
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
    return res.data.data;
  },

  async cancelOrder(orderNumber: string, reason?: string): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>(`/orders/${orderNumber}/cancel`, { reason });
    return res.data.data;
  },

  async requestReturn(orderNumber: string, reason: string): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>(`/orders/${orderNumber}/return`, null, {
      params: { reason }
    });
    return res.data.data;
  },

  async validateCoupon(code: string, subtotal: number): Promise<PromotionResult> {
    const res = await api.post<ApiResponse<PromotionResult>>('/promotions/validate', { code, subtotal });
    return res.data.data;
  }
};
