import { api } from './api';
import { ApiResponse, Cart } from '../types';

export const cartService = {
  async getCart(guestSessionId?: string): Promise<Cart> {
    const res = await api.get<ApiResponse<Cart>>('/cart', {
      params: guestSessionId ? { guestSessionId } : {}
    });
    return res.data.data;
  },

  async addItem(productId: number, quantity = 1, guestSessionId?: string): Promise<Cart> {
    const res = await api.post<ApiResponse<Cart>>('/cart/items', {
      productId,
      quantity,
      guestSessionId
    });
    return res.data.data;
  },

  async updateQuantity(itemId: number, quantity: number, guestSessionId?: string): Promise<Cart> {
    const res = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }, {
      params: guestSessionId ? { guestSessionId } : {}
    });
    return res.data.data;
  },

  async removeItem(itemId: number, guestSessionId?: string): Promise<Cart> {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
      params: guestSessionId ? { guestSessionId } : {}
    });
    return res.data.data;
  },

  async clearCart(guestSessionId?: string): Promise<Cart> {
    const res = await api.delete<ApiResponse<Cart>>('/cart', {
      params: guestSessionId ? { guestSessionId } : {}
    });
    return res.data.data;
  },

  async mergeCart(guestSessionId?: string, localItems?: { productId: number; quantity: number }[]): Promise<Cart> {
    const res = await api.post<ApiResponse<Cart>>('/cart/merge', {
      guestSessionId,
      localItems
    });
    return res.data.data;
  }
};
