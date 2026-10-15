import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  X,
  ShoppingBag,
  ArrowRight,
  Plus,
  Check,
  Sparkles,
  MapPin,
  Flame,
  Truck
} from 'lucide-react';
import { Product, ProductDetail } from '../types';
import { useCart } from '../context/CartContext';
import { productService } from '../services/productService';

interface AddedToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | ProductDetail | null;
  quantity?: number;
}

export const AddedToCartModal: React.FC<AddedToCartModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity = 1
}) => {
  const { cart, itemCount, addToCart } = useCart();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!isOpen || !product) return;

    let isMounted = true;
    // Fetch complementary discoveries
    productService
      .getProducts({
        category: product.categorySlug || undefined,
        size: 6
      })
      .then((res) => {
        if (!isMounted) return;
        // Exclude the currently added product
        const filtered = res.content.filter((p) => p.id !== product.id).slice(0, 3);
        if (filtered.length > 0) {
          setRecommendations(filtered);
        } else {
          // If none in same category, fetch featured
          return productService.getFeaturedDiscoveries(4).then((featured) => {
            if (isMounted) {
              setRecommendations(featured.filter((p) => p.id !== product.id).slice(0, 3));
            }
          });
        }
      })
      .catch((err) => console.warn('Could not load upsell recommendations', err));

    return () => {
      isMounted = false;
    };
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleQuickAdd = async (recProduct: Product) => {
    if (addingId !== null) return;
    setAddingId(recProduct.id);
    try {
      await addToCart(recProduct.id, 1);
      setAddedIds((prev) => [...prev, recProduct.id]);
    } catch (err) {
      console.error('Failed to add recommendation to cart', err);
    } finally {
      setAddingId(null);
    }
  };

  const lineTotal = product.effectivePrice * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Notification Bar */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-sm sm:text-base">
              Added to Your Shopping Bag!
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. Added Item Row + Cart Total Summary */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0">
                <img
                  src={
                    product.primaryImageUrl ||
                    'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                  {product.originCityState || 'Verified Indian Workshop'}
                </span>
                <h4 className="font-serif font-bold text-sm text-stone-900 truncate max-w-xs">
                  {product.name}
                </h4>
                <p className="text-xs text-stone-600 mt-0.5">
                  Qty: <span className="font-bold text-stone-900">{quantity}</span> • ₹
                  {lineTotal.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Cart Subtotal & Primary CTA */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-stone-200 pt-3 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-stone-500 block">
                  Bag Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):
                </span>
                <span className="text-base font-serif font-black text-stone-900">
                  ₹{cart?.subtotal ? Math.round(cart.subtotal).toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/cart');
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Bag & Checkout</span>
              </button>
            </div>
          </div>

          {/* Delivery perk callout */}
          <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
            <Truck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              {cart && cart.subtotal >= 999 ? (
                <strong className="text-emerald-800">
                  🎉 Congratulations! Your order qualifies for FREE Express Pan-India Delivery!
                </strong>
              ) : (
                <span>
                  Add ₹{(999 - (cart?.subtotal || 0)).toFixed(0)} more to unlock{' '}
                  <strong>FREE Express Delivery</strong> across India!
                </span>
              )}
            </span>
          </div>

          {/* 2. FREQUENTLY PAIRED TOGETHER (CROSS-SELL & UPSELL SUGGESTIONS) */}
          {recommendations.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="font-serif font-bold text-sm sm:text-base text-stone-900">
                    Frequently Paired Together • Handcrafted Add-Ons
                  </h4>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  Direct Forge Deals
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Shoppers who selected this craft also added these authentic regional items:
              </p>

              {/* 3 Add-on Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((rec) => {
                  const isAdded = addedIds.includes(rec.id);
                  const isProcessing = addingId === rec.id;

                  return (
                    <div
                      key={rec.id}
                      className="bg-white rounded-2xl p-3 border border-stone-200 hover:border-amber-400 hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2.5">
                          <img
                            src={
                              rec.primaryImageUrl ||
                              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={rec.name}
                            className="w-full h-full object-cover"
                          />
                          {rec.discountPercentage && rec.discountPercentage > 0 && (
                            <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                              {rec.discountPercentage}% OFF
                            </span>
                          )}
                        </div>

                        {rec.originCityState && (
                          <span className="text-[9px] text-stone-500 font-semibold block truncate">
                            {rec.originCityState}
                          </span>
                        )}
                        <h5 className="font-bold text-xs text-stone-900 line-clamp-1 mt-0.5">
                          {rec.name}
                        </h5>

                        <div className="flex items-baseline gap-1.5 mt-1 mb-3">
                          <span className="text-xs font-black text-stone-900">
                            ₹{rec.effectivePrice.toLocaleString('en-IN')}
                          </span>
                          {rec.regularPrice > rec.effectivePrice && (
                            <span className="text-[10px] text-stone-400 line-through">
                              ₹{rec.regularPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 1-Click Quick Add Button */}
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(rec)}
                        disabled={isAdded || isProcessing}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 hover:bg-amber-500 text-amber-950 hover:text-stone-950 border border-amber-300'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Added to Bag</span>
                          </>
                        ) : isProcessing ? (
                          <span>Adding...</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-amber-800" />
                            <span>Add for ₹{rec.effectivePrice}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-stone-50 border-t border-stone-200 px-5 py-3.5 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 font-semibold text-xs px-3 py-2 rounded-xl transition cursor-pointer"
          >
            ← Continue Shopping
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/cart');
              }}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              View Shopping Bag
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/checkout');
              }}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
