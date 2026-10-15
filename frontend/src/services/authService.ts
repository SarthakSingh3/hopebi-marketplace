import { api } from './api';
import { ApiResponse, AuthResponse, UserSummary } from '../types';

export const authService = {
  async register(data: { fullName: string; email: string; password: string; phone?: string; role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER' }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  async loginWithGoogle(data: { email: string; name?: string; photoUrl?: string; idToken?: string; password?: string; role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER' }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/google', data);
    return res.data.data;
  },

  async updatePassword(newPassword: string): Promise<string> {
    const res = await api.post<ApiResponse<string>>('/auth/password', { newPassword });
    return res.data.data;
  },

  async sendOtp(phone: string): Promise<import('../types').OtpResponse> {
    const res = await api.post<ApiResponse<import('../types').OtpResponse>>('/auth/otp/send', { phone });
    return res.data.data;
  },

  async verifyOtp(data: { phone: string; otp: string; name?: string; role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER' }): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/otp/verify', data);
    return res.data.data;
  },

  async getCurrentUser(): Promise<UserSummary> {
    const res = await api.get<ApiResponse<UserSummary>>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('hopebi_token');
    localStorage.removeItem('hopebi_user');
  }
};
