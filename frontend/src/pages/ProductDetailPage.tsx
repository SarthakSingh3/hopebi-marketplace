import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  ShieldCheck,
  MapPin,
  Truck,
  RefreshCw,
  Star,
  Sparkles,
  AlertCircle,
  Camera,
  UploadCloud,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Heart,
  MessageSquare,
  Clock,
  Calendar,
  Award,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Droplets,
  Sun
} from 'lucide-react';
import { productService } from '../services/productService';
import { uploadService } from '../services/uploadService';
import { browsingHistory } from '../utils/browsingHistory';
import { ProductDetail, Review } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { AddedToCartModal } from '../components/AddedToCartModal';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addedToCartModalOpen, setAddedToCartModalOpen] = useState(false);
  const [careGuideOpen, setCareGuideOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delivery estimator states
  const [deliveryPincode, setDeliveryPincode] = useState(() => localStorage.getItem('hopebi_delivery_pincode') || '110001');
  const [deliveryCity, setDeliveryCity] = useState(() => localStorage.getItem('hopebi_delivery_city') || 'Delhi NCR');
  const [editingPincode, setEditingPincode] = useState(false);
  const [inputPincode, setInputPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeFeedback, setPincodeFeedback] = useState<string | null>(null);

  const getEstimatedDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setPincodeFeedback('Please enter a valid 6-digit Indian PIN');
      return;
    }
    setPincodeLoading(true);
    setPincodeFeedback(null);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`);
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success') {
        const po = data[0].PostOffice?.[0];
        const city = po?.District || po?.State || 'India';
        setDeliveryPincode(clean);
        setDeliveryCity(city);
        localStorage.setItem('hopebi_delivery_pincode', clean);
        localStorage.setItem('hopebi_delivery_city', city);
        setPincodeFeedback(`Delivery available to ${city} by ${getEstimatedDate()}`);
        setEditingPincode(false);
      } else {
        setPincodeFeedback('Postal code not serviceable');
      }
    } catch {
      setDeliveryPincode(clean);
      localStorage.setItem('hopebi_delivery_pincode', clean);
      setEditingPincode(false);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewImageUrl, setReviewImageUrl] = useState<string>('');
  const [uploadingReviewImage, setUploadingReviewImage] = useState(false);
  const [reviewUploadError, setReviewUploadError] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productService.getProductBySlug(slug)
      .then(p => {
        setProduct(p);
        browsingHistory.recordView(p);
        if (p.images && p.images.length > 0) {
          setSelectedImage(p.images[0].imageUrl);
        } else {
          setSelectedImage('https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80');
        }
        return productService.getProductReviews(p.id);
      })
      .then(setReviews)
      .catch(err => {
        setError(err.response?.data?.message || 'Product not found');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleReviewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setReviewUploadError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    try {
      setUploadingReviewImage(true);
      setReviewUploadError(null);
      const res = await uploadService.uploadImage(file);
      setReviewImageUrl(res.fileUrl);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setReviewUploadError(e.response?.data?.message || 'Failed to upload photo from device.');
    } finally {
      setUploadingReviewImage(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !product.inStock || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity);
      setAdded(true);
      setAddedToCartModalOpen(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Could not add product to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      const created = await productService.submitReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
        imageUrl: reviewImageUrl || undefined
      });
      setReviews([created, ...reviews]);
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewTitle('');
        setReviewComment('');
        setReviewImageUrl('');
        setReviewUploadError(null);
      }, 1500);
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Only verified buyers can review this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-stone-200 aspect-square rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-6 bg-stone-200 rounded w-1/4" />
            <div className="h-24 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-stone-900">Product Unavailable</h2>
        <p className="text-stone-600 text-sm mt-1">{error || 'This listing is not accessible or currently unapproved.'}</p>
        <Link to="/catalogue" className="mt-6 inline-block bg-amber-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl">
          Return to Catalogue
        </Link>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 space-y-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-stone-500 overflow-x-auto pb-1">
        <Link to="/" className="hover:text-amber-800 transition">Home</Link>
        <span>/</span>
        <Link to="/catalogue" className="hover:text-amber-800 transition">Curated Catalogue</Link>
        {product.categoryName && (
          <>
            <span>/</span>
            <Link to={`/catalogue?category=${product.categorySlug}`} className="hover:text-amber-800 transition truncate max-w-[150px]">
              {product.categoryName}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
      </nav>

      {/* Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Images Area */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.imageUrl)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition ${
                    selectedImage === img.imageUrl ? 'border-amber-700 shadow-sm' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Purchase & Info Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            {/* Manufacturer Badge */}
            {product.seller && (
              <Link
                to={`/sellers/${product.seller.slug}`}
                className="inline-flex items-center text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full transition mb-2"
              >
                <MapPin className="w-3.5 h-3.5 mr-1 text-amber-700" />
                <span>Made by {product.seller.companyName} ({product.seller.city}, {product.seller.state})</span>
              </Link>
            )}

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
              {product.name}
            </h1>

            {product.verifiedClaims && (
              <p className="mt-2 text-xs text-stone-500 flex items-center font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
                {product.verifiedClaims}
              </p>
            )}
          </div>

          {/* Price Block */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-serif font-bold text-stone-900">
                  {formattedEffectivePrice}
                </span>
                {product.salePrice && product.salePrice < product.regularPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    {formattedRegularPrice}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-500">Inclusive of all taxes • Free shipping ₹999+</span>
            </div>

            {product.discountPercentage && product.discountPercentage > 0 && (
              <span className="bg-amber-700 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                Save {product.discountPercentage}%
              </span>
            )}
          </div>

          {/* Stock Availability */}
          <div className="flex items-center space-x-2 text-xs">
            {product.inStock ? (
              <span className="text-emerald-700 font-semibold flex items-center">
                <Check className="w-4 h-4 mr-1 text-emerald-600" />
                In Stock ({product.stockQuantity} units available)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Currently Out of Stock</span>
            )}
          </div>

          {/* Indian PIN Delivery Estimator Box */}
          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <Truck className="w-4 h-4 text-amber-700" />
                <span>Deliver to: {deliveryCity} ({deliveryPincode})</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingPincode(!editingPincode)}
                className="text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer text-[11px]"
              >
                {editingPincode ? 'Cancel' : 'Change PIN'}
              </button>
            </div>

            {editingPincode && (
              <form onSubmit={handleCheckPincode} className="flex gap-2 pt-1">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit PIN"
                  value={inputPincode}
                  onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
                  className="bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs w-36 font-mono outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={pincodeLoading}
                  className="bg-stone-900 hover:bg-stone-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                >
                  {pincodeLoading ? 'Checking...' : 'Check'}
                </button>
              </form>
            )}

            {pincodeFeedback && (
              <p className="text-[11px] text-emerald-800 font-bold">{pincodeFeedback}</p>
            )}

            <div className="pt-1 flex flex-col gap-1 text-[11px] text-stone-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>
                  Order in next <strong className="text-stone-900">3 hrs 45 mins</strong> for delivery by{' '}
                  <strong className="text-emerald-800 font-bold">{getEstimatedDate()}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cash on Delivery (COD) available at this location</span>
              </div>
            </div>
          </div>

          {/* Quantity and Add to Bag */}
          {product.inStock && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 transition text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100 transition text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center transition shadow-md cursor-pointer ${
                    added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-700 hover:bg-amber-800 text-white hover:shadow-lg'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to Shopping Bag!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Add to Bag • {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.effectivePrice * quantity)}
                    </>
                  )}
                </button>

                {/* Dedicated Watchlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-xl border transition flex items-center justify-center cursor-pointer shadow-xs ${
                    isInWishlist(product.id)
                      ? 'bg-red-50 border-red-300 text-red-600'
                      : 'bg-white hover:bg-stone-50 border-stone-300 text-stone-600 hover:text-red-600'
                  }`}
                  title={isInWishlist(product.id) ? 'Saved in Watchlist' : 'Save to Watchlist'}
                  aria-label="Toggle Watchlist"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current text-red-600' : ''}`} />
                </button>
              </div>

              {/* Chat with Artisan on WhatsApp Button */}
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(
                  `Hi HOPEBI! I am interested in ${product.name} (SKU: ${product.sku}). Can you assist me with dispatch dates and customization?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/40 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Chat with Artisan Workshop on WhatsApp</span>
              </a>
            </div>
          )}

          {/* Delivery & Assurance Guarantees */}
          <div className="space-y-3 pt-4 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex items-center space-x-3">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Ships securely from manufacturer workshop within 48 hours</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{product.returnPolicy || '7-day replacement guarantee if damaged on arrival'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Verified authentic regional enterprise listing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-10 border-t border-stone-200">
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-3">Product Description</h2>
            <div className="prose text-stone-600 text-sm leading-relaxed whitespace-pre-line">
              {product.fullDescription}
            </div>
          </div>

          {/* Specifications Table */}
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900 mb-3">Materials & Specifications</h3>
            <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 p-3 bg-stone-50 border-b border-stone-200">
                <span className="font-semibold text-stone-500">Materials</span>
                <span className="col-span-2 text-stone-900 font-medium">{product.materials || 'Pure regional craft material'}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-white border-b border-stone-200">
                <span className="font-semibold text-stone-500">Origin</span>
                <span className="col-span-2 text-stone-900 font-medium">{product.originCityState || 'India'}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-stone-50 border-b border-stone-200">
                <span className="font-semibold text-stone-500">SKU</span>
                <span className="col-span-2 text-stone-900 font-mono">{product.sku}</span>
              </div>
              {product.dimensions && (
                <div className="grid grid-cols-3 p-3 bg-white">
                  <span className="font-semibold text-stone-500">Dimensions</span>
                  <span className="col-span-2 text-stone-900 font-medium">{product.dimensions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Artisanal Care & Longevity Guide */}
          <div className="bg-amber-50/50 rounded-2xl border border-amber-200/70 p-5 space-y-3">
            <button
              type="button"
              onClick={() => setCareGuideOpen(!careGuideOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif text-sm font-bold text-stone-900 group-hover:text-amber-900">
                  Artisanal Care & Longevity Guide
                </h3>
              </div>
              {careGuideOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            {careGuideOpen && (
              <div className="pt-2 border-t border-amber-200/50 space-y-2.5 text-xs text-stone-700 animate-in fade-in duration-150">
                <p className="leading-relaxed">
                  Every piece on HOPEBI is shaped individually by hand. Follow these master craft guidelines to preserve its heirloom luster:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-amber-700" /> Cleaning & Polishing
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      For brass & copper, polish with lemon & salt or Pitambari powder. For ceramics, hand-wash gently with mild eco-detergent.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-700" /> Storage & Handling
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      Store in a dry location away from harsh chemical vapors. For handlooms and silks, wrap in pure cotton muslin with dried neem leaves.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Manufacturer Heritage Card */}
        <div className="lg:col-span-5">
          {product.seller && (
            <div className="bg-stone-100 rounded-3xl p-6 border border-stone-200/80 space-y-4">
              <span className="text-[10px] font-bold tracking-widest text-amber-800 uppercase">
                About The Manufacturer
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {product.seller.companyName}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {product.seller.companyDescription}
              </p>
              {product.seller.manufacturerHeritage && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 text-xs text-stone-700 italic">
                  "{product.seller.manufacturerHeritage}"
                </div>
              )}
              <Link
                to={`/sellers/${product.seller.slug}`}
                className="inline-block text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
              >
                View all products by this manufacturer →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Verified Customer Reviews Section */}
      <div className="pt-10 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900">
              Verified Buyer Reviews
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Only verified purchasers who completed an order on HOPEBI can submit reviews.
            </p>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                alert('Please sign in as a verified buyer to post a review.');
              } else {
                setReviewModalOpen(true);
              }
            }}
            className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  {rev.verifiedPurchase && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center">
                      <Check className="w-2.5 h-2.5 mr-1" /> Verified Buyer
                    </span>
                  )}
                </div>

                {rev.title && (
                  <h4 className="font-semibold text-sm text-stone-900">{rev.title}</h4>
                )}

                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>

                {rev.imageUrl && (
                  <div className="pt-2">
                    <img
                      src={rev.imageUrl}
                      alt="Customer review photo"
                      className="w-20 h-20 object-cover rounded-xl border border-stone-200 hover:scale-105 transition cursor-pointer shadow-xs"
                      onClick={() => window.open(rev.imageUrl, '_blank')}
                      title="Click to view full photo taken by customer"
                    />
                    <span className="text-[10px] text-stone-400 block mt-0.5">Photo from verified buyer</span>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-stone-400">
                  Reviewed by <span className="text-stone-600 font-medium">{rev.reviewerName || 'Customer'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
            No reviews submitted for this product yet. Verified buyers are invited to leave first impressions.
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200">
            <h3 className="font-serif text-xl font-bold text-stone-900">Write a Verified Buyer Review</h3>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Your feedback helps Indian artisans and other shoppers on HOPEBI.
            </p>

            {reviewSuccess ? (
              <div className="text-center py-6 text-emerald-700 font-semibold text-sm">
                Thank you! Your verified review has been published.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Title (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Authentic quality and sturdy brass"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Review</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your detailed experience with the craftsmanship, packaging, and use..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>

                {/* Photo upload dropzone */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Add Product Photo (Optional)
                  </label>
                  {reviewUploadError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-600">
                      {reviewUploadError}
                    </div>
                  )}
                  {reviewImageUrl ? (
                    <div className="flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <img
                        src={reviewImageUrl}
                        alt="Uploaded review photo"
                        className="w-14 h-14 object-cover rounded-lg border border-stone-200"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Photo Attached
                        </span>
                        <p className="text-[10px] text-stone-400 truncate">{reviewImageUrl}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReviewImageUrl('')}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg transition"
                        title="Remove photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-stone-300 rounded-xl p-3 text-center hover:border-amber-700 transition bg-stone-50/50">
                      <input
                        type="file"
                        id="review-photo-input"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleReviewPhotoUpload}
                        disabled={uploadingReviewImage}
                        className="hidden"
                      />
                      <label
                        htmlFor="review-photo-input"
                        className="cursor-pointer flex items-center justify-center gap-2 text-xs font-medium text-amber-800 hover:underline"
                      >
                        {uploadingReviewImage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                            <span>Uploading photo...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 text-amber-700" />
                            <span>Upload photo of product from your device</span>
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Bag Action Bar */}
      {product && product.inStock && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <img
              src={selectedImage || product.primaryImageUrl}
              alt=""
              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 truncate">{product.name}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-stone-900">
                  ₹{product.effectivePrice.toLocaleString('en-IN')}
                </span>
                {product.discountPercentage && product.discountPercentage > 0 ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                    {product.discountPercentage}% off
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isInWishlist(product.id)
                  ? 'bg-red-50 border-red-300 text-red-600'
                  : 'bg-white border-stone-300 text-stone-600'
              }`}
              aria-label="Toggle Watchlist"
            >
              <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current text-red-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center transition shadow-md cursor-pointer ${
                added ? 'bg-emerald-600 text-white' : 'bg-amber-700 hover:bg-amber-800 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                  Add to Bag
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Added to Bag & Similar Items Cross-Sell Modal */}
      <AddedToCartModal
        isOpen={addedToCartModalOpen}
        onClose={() => setAddedToCartModalOpen(false)}
        product={product}
        quantity={quantity}
      />
    </div>
  );
};
