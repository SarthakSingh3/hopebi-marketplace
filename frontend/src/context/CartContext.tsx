import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, PromotionResult } from '../types';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  appliedCoupon: PromotionResult | null;
  applyCoupon: (code: string) => Promise<PromotionResult>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<PromotionResult | null>(null);

  const getGuestSessionId = useCallback(() => {
    let id = localStorage.getItem('hopebi_guest_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('hopebi_guest_id', id);
    }
    return id;
  }, []);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const guestId = !isAuthenticated ? getGuestSessionId() : undefined;
      const c = await cartService.getCart(guestId);
      setCart(c);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getGuestSessionId]);

  // When user logs in, merge guest cart
  useEffect(() => {
    if (isAuthenticated) {
      const guestId = localStorage.getItem('hopebi_guest_id');
      if (guestId) {
        cartService.mergeCart(guestId)
          .then((c) => {
            setCart(c);
            localStorage.removeItem('hopebi_guest_id');
          })
          .catch(() => refreshCart());
      } else {
        refreshCart();
      }
    } else {
      refreshCart();
    }
  }, [isAuthenticated, refreshCart]);

  const addToCart = async (productId: number, quantity = 1) => {
    setLoading(true);
    try {
      const guestId = !isAuthenticated ? getGuestSessionId() : undefined;
      const updated = await cartService.addItem(productId, quantity, guestId);
      setCart(updated);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    setLoading(true);
    try {
      const guestId = !isAuthenticated ? getGuestSessionId() : undefined;
      const updated = await cartService.updateQuantity(itemId, quantity, guestId);
      setCart(updated);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: number) => {
    setLoading(true);
    try {
      const guestId = !isAuthenticated ? getGuestSessionId() : undefined;
      const updated = await cartService.removeItem(itemId, guestId);
      setCart(updated);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const guestId = !isAuthenticated ? getGuestSessionId() : undefined;
      const updated = await cartService.clearCart(guestId);
      setCart(updated);
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (code: string): Promise<PromotionResult> => {
    if (!cart || cart.subtotal <= 0) {
      const res: PromotionResult = {
        valid: false,
        code,
        message: 'Cart is empty',
        discountAmount: 0,
        newTotal: 0
      };
      return res;
    }

    const res = await orderService.validateCoupon(code, cart.subtotal);
    if (res.valid) {
      setAppliedCoupon(res);
    }
    return res;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = cart?.totalItemCount || 0;

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      loading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      appliedCoupon,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
