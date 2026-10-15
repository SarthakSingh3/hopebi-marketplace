import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, MapPin, Sparkles, Heart, Eye, X, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding || !product.inStock) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const formattedRegularPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.regularPrice);

  const formattedEffectivePrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(product.effectivePrice);

  const isFavorited = isInWishlist(product.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[4/3] sm:aspect-square bg-stone-100 overflow-hidden block">
        <img
          src={product.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Watchlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition cursor-pointer z-10 ${
            isFavorited
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-white/90 hover:bg-white text-stone-400 hover:text-red-600'
          }`}
          title={isFavorited ? 'Remove from Watchlist' : 'Save to Watchlist'}
          aria-label="Toggle Watchlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-600' : ''}`} />
        </button>

        {/* Discount Badge */}
        {product.discountPercentage && product.discountPercentage > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-700 text-white font-bold text-[11px] px-2 py-0.5 rounded-md shadow-sm">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Origin / Manufacturer City Pill */}
        {product.originCityState && (
          <span className="absolute bottom-2.5 left-2.5 bg-stone-900/80 backdrop-blur-sm text-stone-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center">
            <MapPin className="w-2.5 h-2.5 mr-1 text-amber-400" />
            {product.originCityState.split(',')[0]}
          </span>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setQuickViewOpen(true);
          }}
          className="absolute inset-x-4 bottom-3 py-2 bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-bold rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center justify-center gap-1.5 shadow-lg cursor-pointer transform translate-y-2 group-hover:translate-y-0"
        >
          <Eye className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick View</span>
        </button>
      </Link>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Brand */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <Link
              to={product.sellerSlug ? `/sellers/${product.sellerSlug}` : '#'}
              className="font-medium text-amber-800 hover:text-amber-900 transition truncate max-w-[160px]"
            >
              {product.sellerName || 'Verified Manufacturer'}
            </Link>
            {product.categoryName && (
              <span className="text-[10px] text-stone-400 truncate max-w-[90px]">{product.categoryName}</span>
            )}
          </div>

          {/* Title */}
          <Link to={`/product/${product.slug}`} className="block">
            <h3 className="font-serif font-semibold text-stone-900 text-sm sm:text-base line-clamp-2 group-hover:text-amber-800 transition">
              {product.name}
            </h3>
          </Link>

          {/* Verified Claims */}
          {product.verifiedClaims && (
            <p className="mt-1 text-[11px] text-stone-500 flex items-center truncate">
              <Sparkles className="w-3 h-3 text-amber-600 mr-1 shrink-0" />
              {product.verifiedClaims.split('|')[0]}
            </p>
          )}
        </div>

        {/* Pricing and Action */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-base sm:text-lg font-bold text-stone-900">
                {formattedEffectivePrice}
              </span>
              {product.salePrice && product.salePrice < product.regularPrice && (
                <span className="text-xs text-stone-400 line-through">
                  {formattedRegularPrice}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || adding}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center transition ${
              added
                ? 'bg-emerald-600 text-white'
                : product.inStock
                ? 'bg-amber-700 hover:bg-amber-800 text-white shadow-sm hover:shadow'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
            title="Add to shopping bag"
          >
            {added ? (
              <>
                <Check className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewOpen(false);
          }}
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-4 relative"
          >
            <button
              type="button"
              onClick={() => setQuickViewOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                <img
                  src={product.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">
                      {product.sellerName || 'Verified Guild'}
                    </span>
                    {product.categoryName && (
                      <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">{product.categoryName}</span>
                    )}
                  </div>

                  <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black text-stone-900">
                      {formattedEffectivePrice}
                    </span>
                    {product.regularPrice > product.effectivePrice && (
                      <span className="text-xs text-stone-400 line-through">
                        {formattedRegularPrice}
                      </span>
                    )}
                    {product.discountPercentage && product.discountPercentage > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {product.discountPercentage}% off
                      </span>
                    )}
                  </div>

                  {product.shortDescription && (
                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {product.shortDescription}
                    </p>
                  )}

                  {product.originCityState && (
                    <p className="text-[11px] text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      Crafted in {product.originCityState}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding || !product.inStock}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center transition cursor-pointer shadow-xs ${
                      added
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-700 hover:bg-amber-800 text-white'
                    }`}
                  >
                    {added ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        Added to Bag!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 mr-1.5" />
                        Add to Bag • {formattedEffectivePrice}
                      </>
                    )}
                  </button>

                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => setQuickViewOpen(false)}
                    className="w-full py-2 px-3 text-center text-xs font-semibold text-stone-700 hover:text-amber-800 transition block hover:underline"
                  >
                    View Full Craft Story & Specs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
