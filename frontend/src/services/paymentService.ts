import { api } from './api';
import { ApiResponse, PaymentMethod } from '../types';

export interface PaymentInitiateResponse {
  orderNumber: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  paymentProvider: string;
  testMode: boolean;
  message: string;
}

export interface PaymentVerifyResponse {
  verified: boolean;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
  transactionId?: string;
  message: string;
}

export const paymentService = {
  async initiate(orderNumber: string, paymentMethod: PaymentMethod): Promise<PaymentInitiateResponse> {
    const res = await api.post<ApiResponse<PaymentInitiateResponse>>('/payments/initiate', {
      orderNumber,
      paymentMethod
    });
    return res.data.data;
  },

  async verify(data: {
    orderNumber: string;
    providerOrderId: string;
    providerPaymentId?: string;
    simulateSuccess: boolean;
  }): Promise<PaymentVerifyResponse> {
    const res = await api.post<ApiResponse<PaymentVerifyResponse>>('/payments/verify', data);
    return res.data.data;
  }
};
