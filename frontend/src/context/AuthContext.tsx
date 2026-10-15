import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSummary } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserSummary | null;
  token: string | null;
  isAuthenticated: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  loginWithGoogle: (data: { email: string; name?: string; photoUrl?: string; idToken?: string; password?: string; role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER' }) => Promise<UserSummary>;
  sendOtp: (phone: string) => Promise<import('../types').OtpResponse>;
  loginWithOtp: (phone: string, otp: string, name?: string, role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER') => Promise<UserSummary>;
  register: (fullName: string, email: string, password: string, phone?: string, role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER') => Promise<UserSummary>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (data: Partial<UserSummary>) => Promise<UserSummary>;
  logout: () => Promise<void>;
  quickLoginAs: (role: 'CUSTOMER' | 'SELLER' | 'ADMIN') => Promise<UserSummary>;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSummary | null>(() => {
    const saved = localStorage.getItem('hopebi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hopebi_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authService.getCurrentUser()
        .then(u => {
          setUser(u);
          localStorage.setItem('hopebi_user', JSON.stringify(u));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('hopebi_token');
          localStorage.removeItem('hopebi_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<UserSummary> => {
    const res = await authService.login({ email, password });
    localStorage.setItem('hopebi_token', res.token);
    localStorage.setItem('hopebi_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (googleData: { email: string; name?: string; photoUrl?: string; idToken?: string; password?: string; role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER' }): Promise<UserSummary> => {
    const res = await authService.loginWithGoogle(googleData);
    localStorage.setItem('hopebi_token', res.token);
    localStorage.setItem('hopebi_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const sendOtp = async (phone: string): Promise<import('../types').OtpResponse> => {
    return await authService.sendOtp(phone);
  };

  const loginWithOtp = async (phone: string, otp: string, name?: string, role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER'): Promise<UserSummary> => {
    const res = await authService.verifyOtp({ phone, otp, name, role });
    localStorage.setItem('hopebi_token', res.token);
    localStorage.setItem('hopebi_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (fullName: string, email: string, password: string, phone?: string, role?: 'ROLE_CUSTOMER' | 'ROLE_SELLER'): Promise<UserSummary> => {
    const res = await authService.register({ fullName, email, password, phone, role });
    localStorage.setItem('hopebi_token', res.token);
    localStorage.setItem('hopebi_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    await authService.updatePassword(newPassword);
  };

  const updateProfile = async (data: Partial<UserSummary>): Promise<UserSummary> => {
    if (!user) throw new Error('No user logged in');
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('hopebi_user', JSON.stringify(updated));
    return updated;
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
  };

  const quickLoginAs = async (role: 'CUSTOMER' | 'SELLER' | 'ADMIN'): Promise<UserSummary> => {
    if (role === 'ADMIN') {
      return await login('admin@hopebi.com', 'AdminPassword123!');
    } else if (role === 'SELLER') {
      return await login('seller@hopebi.com', 'SellerPassword123!');
    } else {
      return await login('customer@hopebi.com', 'CustomerPassword123!');
    }
  };

  const refreshUser = async () => {
    try {
      const u = await authService.getCurrentUser();
      setUser(u);
      localStorage.setItem('hopebi_user', JSON.stringify(u));
    } catch {
      // User might be logged out
    }
  };

  const isAuthenticated = !!user;
  const isSeller = user?.role === 'ROLE_SELLER' || user?.role === 'ROLE_ADMIN';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isSeller,
      isAdmin,
      login,
      loginWithGoogle,
      sendOtp,
      loginWithOtp,
      register,
      updatePassword,
      updateProfile,
      logout,
      quickLoginAs,
      refreshUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
