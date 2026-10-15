import { api } from './api';
import { Address, ApiResponse } from '../types';

export interface AddressData {
  recipientName: string;
  phoneNumber: string;
  streetAddress: string;
  locality?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  addressType?: string;
  default?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const res = await api.get<ApiResponse<Address[]>>('/me/addresses');
    return res.data.data;
  },

  async createAddress(data: AddressData): Promise<Address> {
    const res = await api.post<ApiResponse<Address>>('/me/addresses', data);
    return res.data.data;
  },

  async updateAddress(id: number, data: AddressData): Promise<Address> {
    const res = await api.put<ApiResponse<Address>>(`/me/addresses/${id}`, data);
    return res.data.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/me/addresses/${id}`);
  }
};
