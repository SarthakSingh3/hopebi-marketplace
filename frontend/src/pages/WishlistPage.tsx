import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  PackageOpen
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [movingId, setMovingId] = useState<number | null>(null);
  const [movedId, setMovedId] = useState<number | null>(null);

  const handleMoveToBag = async (product: Product) => {
    setMovingId(product.id);
    try {
      await addToCart(product.id, 1);
      removeFromWishlist(product.id);
      setMovedId(product.id);
      setTimeout(() => setMovedId(null), 2500);
    } catch (err) {
      console.error('Failed to move item to cart', err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Your Saved Watchlist
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                {wishlist.length} {wishlist.length === 1 ? 'handcrafted item' : 'handcrafted items'} saved for later
              </p>
            </div>
          </div>
        </div>

        {wishlist.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearWishlist}
              className="text-xs text-stone-500 hover:text-red-700 underline transition cursor-pointer"
            >
              Clear Entire Watchlist
            </button>
            <Link
              to="/catalogue"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>Explore More Crafts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Your Watchlist is Empty
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 leading-relaxed">
              Explore authentic regional Indian forges, bell metal cookeries, and handloom weavers. Save any product you love with the heart icon!
            </p>
          </div>
          <Link
            to="/catalogue"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <span>Browse Handcrafted Catalogue</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-stone-200 hover:border-amber-600 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Product Thumbnail */}
              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={
                      item.primaryImageUrl ||
                      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFromWishlist(item.id)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-400 hover:text-red-600 shadow-md flex items-center justify-center transition cursor-pointer"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Discount Badge */}
                {item.discountPercentage && item.discountPercentage > 0 && (
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
                    {item.discountPercentage}% OFF
                  </span>
                )}
              </div>

              {/* Product Information */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {item.originCityState && (
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block truncate">
                      {item.originCityState}
                    </span>
                  )}
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-serif font-bold text-sm text-stone-900 group-hover:text-amber-800 transition line-clamp-2 mt-1">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-extrabold text-stone-900 text-base">
                      ₹{item.effectivePrice.toLocaleString('en-IN')}
                    </span>
                    {item.regularPrice > item.effectivePrice && (
                      <span className="text-xs text-stone-400 line-through">
                        ₹{item.regularPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action: Move to Bag */}
                <div className="pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    onClick={() => handleMoveToBag(item)}
                    disabled={movingId === item.id}
                    className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {movingId === item.id ? (
                      <span>Moving to Bag...</span>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Move to Bag</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
