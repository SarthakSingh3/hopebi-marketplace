import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowRight, Tag, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await applyCoupon(code);
      if (!res.valid) {
        setCouponError(res.message);
      } else {
        setCouponInput('');
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your shopping bag is empty</h2>
        <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
          Explore handcrafted brass, regional teas, and natural handloom discoveries from selected Indian makers.
        </p>
        <Link
          to="/catalogue"
          className="inline-flex items-center bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-6 py-3 rounded-xl transition shadow"
        >
          Explore Catalogue <ArrowRight className="w-4 h-4 ml-1.5" />
        </Link>
      </div>
    );
  }

  const freeShippingThreshold = 999;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);
  const freeShippingProgress = Math.min(100, (cart.subtotal / freeShippingThreshold) * 100);

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalCalculatedTotal = Math.max(0, cart.subtotal - discountAmount + cart.estimatedShipping);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">Shopping Bag</h1>
          <p className="text-xs text-stone-500 mt-1">{cart.totalItemCount} items ready for checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-red-600 transition"
        >
          Clear Bag
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="my-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
        <div className="flex justify-between items-center text-xs font-semibold mb-2">
          {amountNeededForFreeShipping > 0 ? (
            <span className="text-amber-900">
              Add <strong className="text-amber-700">₹{amountNeededForFreeShipping}</strong> more to unlock <strong>Free Pan-India Delivery</strong>
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center font-bold">
              <Check className="w-4 h-4 mr-1 text-emerald-600" />
              🎉 You've unlocked Free Pan-India Delivery!
            </span>
          )}
          <span className="text-amber-800">{Math.round(freeShippingProgress)}%</span>
        </div>
        <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center space-x-4">
                <Link to={`/product/${item.productSlug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                  <img
                    src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div>
                  <span className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider block">
                    {item.sellerName || 'Verified Manufacturer'}
                  </span>
                  <Link to={`/product/${item.productSlug}`} className="font-serif font-semibold text-stone-900 text-sm sm:text-base hover:text-amber-800 transition line-clamp-1">
                    {item.productName}
                  </Link>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">SKU: {item.sku}</p>
                  <p className="text-xs font-bold text-stone-900 mt-1">
                    ₹{item.unitPrice} each
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 overflow-hidden text-xs">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-bold text-stone-900">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.availableStock}
                    className="px-2.5 py-1 text-stone-600 hover:bg-stone-200 transition font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <span className="font-serif font-bold text-sm sm:text-base text-stone-900 min-w-[70px] text-right">
                  ₹{item.lineTotal}
                </span>

                {/* Remove Item */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 transition"
                  title="Remove from bag"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Box */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center">
              <Tag className="w-3.5 h-3.5 mr-1.5 text-amber-700" /> Apply Coupon
            </h4>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-800">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-emerald-600">{appliedCoupon.message}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-red-600 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs p-2.5 border border-stone-300 rounded-xl uppercase font-mono focus:outline-none focus:border-amber-700"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-semibold px-4 rounded-xl transition"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1.5">{couponError}</p>
                )}

                {/* Sample coupon hints */}
                <div className="pt-2 text-[11px] text-stone-500">
                  <span>Try: </span>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('HOPEBI50')}
                    className="text-amber-800 font-mono font-semibold underline mr-2 hover:text-amber-900"
                  >
                    HOPEBI50
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('FIRST10')}
                    className="text-amber-800 font-mono font-semibold underline hover:text-amber-900"
                  >
                    FIRST10
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Order Summary</h3>

            <div className="space-y-2.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">₹{cart.subtotal}</span>
              </div>

              {appliedCoupon && appliedCoupon.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-stone-900">
                  {cart.estimatedShipping === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase">Free</span>
                  ) : (
                    `₹${cart.estimatedShipping}`
                  )}
                </span>
              </div>

              {cart.savings > 0 && (
                <div className="flex justify-between text-amber-800 font-medium pt-1">
                  <span>Artisan Direct Savings</span>
                  <span>₹{cart.savings}</span>
                </div>
              )}

              <div className="border-t border-stone-200 pt-3 flex justify-between text-sm sm:text-base font-bold text-stone-900">
                <span>Payable Total</span>
                <span className="font-serif text-xl font-bold text-stone-900">
                  ₹{finalCalculatedTotal}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={cart.hasUnavailableItems}
              className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center disabled:opacity-50"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-stone-400 text-center pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure Indian Payment Gateways</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
