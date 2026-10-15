import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  Shield,
  Store,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Flame,
  Sparkles,
  Heart,
  HelpCircle,
  Truck,
  CheckCircle2,
  TrendingUp,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { siteConfig } from '../config/siteConfig';
import { productService } from '../services/productService';
import { Product } from '../types';
import { LocationModal } from './LocationModal';
import { MegaSidebar } from './MegaSidebar';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout, quickLoginAs } = useAuth();
  const { itemCount, cart } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal and drawer states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMegaSidebarOpen, setIsMegaSidebarOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Delivery Location state (defaults to Delhi 110001, persisted in localStorage)
  const [deliveryPincode, setDeliveryPincode] = useState('110001');
  const [deliveryCity, setDeliveryCity] = useState('Delhi NCR');

  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedPin = localStorage.getItem('hopebi_delivery_pincode');
    const savedCity = localStorage.getItem('hopebi_delivery_city');
    if (savedPin) setDeliveryPincode(savedPin);
    if (savedCity) setDeliveryCity(savedCity);
  }, []);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Auto-complete state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const trendingSearches = [
    'Moradabad Brass',
    'Jaipur Blue Pottery',
    'Kashmiri Pashmina',
    'Tellicherry Black Pepper',
    'Cast Iron Skillet',
    'Darjeeling First Flush'
  ];

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setLiveResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({
          search: trimmed,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          size: 5
        });
        setLiveResults(res.content || []);
      } catch (err) {
        console.error('Failed to fetch live search results:', err);
        setLiveResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 220);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const handleSearchClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleSearchClickOutside);
    return () => document.removeEventListener('mousedown', handleSearchClickOutside);
  }, []);

  const handleSelectLocation = (pincode: string, city: string) => {
    setDeliveryPincode(pincode);
    setDeliveryCity(city);
    localStorage.setItem('hopebi_delivery_pincode', pincode);
    localStorage.setItem('hopebi_delivery_city', city);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();

    if (query) {
      params.set('search', query);
    }
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const targetUrl = params.toString() ? `/catalogue?${params.toString()}` : '/catalogue';
    navigate(targetUrl);
    setMobileSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-lg">
        {/* Top Notification & Demo Role Switcher Strip */}
        <div className="bg-[#120f0d] text-stone-300 text-xs py-1.5 px-3 sm:px-6 flex flex-wrap justify-between items-center border-b border-amber-950/40">
          <div className="flex items-center space-x-2">
            <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs">
              Curated Indian Marketplace
            </span>
            <span className="hidden md:inline text-[11px] text-stone-300">
              ⚡ Free Express Delivery on ₹999+ | Direct from Regional Artisans & Master Forges
            </span>
          </div>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="flex items-center space-x-1.5 ml-auto text-[11px]">
            <span className="text-stone-400 hidden lg:inline mr-1">Demo Quick Switch:</span>
            <button
              onClick={() => quickLoginAs('CUSTOMER')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                user?.role === 'ROLE_CUSTOMER' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Test as Customer (Ananya Iyer)"
            >
              Customer
            </button>
            <button
              onClick={() => quickLoginAs('SELLER')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                user?.role === 'ROLE_SELLER' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Test as Seller (Moradabad Metalcrafts Guild)"
            >
              Seller
            </button>
            <button
              onClick={() => quickLoginAs('ADMIN')}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition cursor-pointer ${
                user?.role === 'ROLE_ADMIN' ? 'bg-amber-500 text-stone-950 font-bold shadow-xs' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Test as Admin (Platform Admin)"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Main Luxurious Indian Heritage Header (Warm Espresso Walnut Palette) */}
        <div className="bg-gradient-to-r from-[#171412] via-[#201b17] to-[#171412] text-white border-b border-amber-900/30">
          <div className="max-w-[1536px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
            {/* 1. Logo & Brand (Indian Luxury Boutique Style) */}
            <Link
              to="/"
              className="flex items-center space-x-2.5 shrink-0 p-1 rounded-xl hover:bg-white/5 transition group"
              aria-label="HOPEBI Home"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-stone-950 flex items-center justify-center shadow-md font-serif text-lg font-black tracking-tight border border-amber-400/40 group-hover:scale-105 transition-transform">
                H
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-stone-50 leading-none">
                  HOPEBI<span className="text-amber-400 font-sans text-xs ml-0.5 font-bold">.in</span>
                </span>
                <span className="text-[9px] tracking-widest text-amber-300/90 uppercase font-bold block mt-0.5 leading-none">
                  Curated Indian Crafts
                </span>
              </div>
            </Link>

            {/* 2. Indian Delivery Location Pill (Glassmorphic Rounded Pill) */}
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer shrink-0 max-w-[200px]"
              title="Choose Indian delivery location"
            >
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[10px] text-stone-400 leading-none truncate">
                  Deliver to {isAuthenticated && user?.fullName ? user.fullName.split(' ')[0] : 'India'}
                </p>
                <p className="text-xs font-bold text-white leading-tight truncate">
                  {deliveryCity} {deliveryPincode}
                </p>
              </div>
            </button>

            {/* 3. Sleek Modern Pill Search Bar with Category Dropdown & Auto-complete */}
            <div ref={searchContainerRef} className="flex-1 max-w-2xl mx-1 sm:mx-2 hidden sm:block relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative flex w-full shadow-inner rounded-full overflow-hidden bg-white border border-stone-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-all">
                  {/* Category Selector inside search */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3 py-2 border-r border-stone-200 focus:outline-none cursor-pointer appearance-none pr-6 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:8px_8px] bg-[right_8px_center] bg-no-repeat shrink-0 rounded-l-full"
                  >
                    <option value="all">All Crafts</option>
                    <option value="brass-and-copper">Brass & Copper</option>
                    <option value="heritage-pottery">Pottery & Ceramics</option>
                    <option value="sustainable-handlooms">Handloom & Pashmina</option>
                    <option value="teas-and-spices">Estate Teas & Spices</option>
                    <option value="natural-wood-craft">Natural Woodcrafts</option>
                    <option value="artisanal-cookware">Artisanal Cookware</option>
                    <option value="handcrafted-leatherware">Leatherware</option>
                  </select>

                  {/* Search Text Input */}
                  <input
                    type="text"
                    placeholder="Search brass cookware, winter teas, pashmina, blue pottery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full bg-white text-stone-900 placeholder-stone-400 text-sm px-4 py-2 focus:outline-none"
                  />

                  {/* Amber Search Submit Button */}
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold px-5 py-2 transition flex items-center justify-center shrink-0 cursor-pointer rounded-r-full shadow-xs"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </form>

              {/* Auto-complete Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-stone-800">
                  {/* State 1: When user types < 2 chars, show Trending Queries & Guilds */}
                  {searchQuery.trim().length < 2 && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Trending Across Indian Guilds</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSearchQuery(term);
                              setIsSearchFocused(false);
                              navigate(`/catalogue?search=${encodeURIComponent(term)}`);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200/60 transition cursor-pointer font-medium flex items-center gap-1"
                          >
                            <Search className="w-3 h-3 text-amber-600" />
                            {term}
                          </button>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                        <span>⚡ Direct from verified regional artisan clusters</span>
                        <Link
                          to="/catalogue"
                          onClick={() => setIsSearchFocused(false)}
                          className="text-amber-800 font-semibold hover:underline"
                        >
                          Browse all crafts
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* State 2: While searching */}
                  {searchQuery.trim().length >= 2 && searchLoading && (
                    <div className="p-6 flex items-center justify-center space-x-2 text-stone-500 text-xs">
                      <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                      <span>Searching Indian master craft inventories...</span>
                    </div>
                  )}

                  {/* State 3: Search results */}
                  {searchQuery.trim().length >= 2 && !searchLoading && liveResults.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-500">
                        <span className="font-semibold text-stone-700">Matching Authentic Crafts</span>
                        <span className="text-[11px]">{liveResults.length} quick matches</span>
                      </div>
                      <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                        {liveResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              navigate(`/product/${product.slug}`);
                            }}
                            className="p-3 hover:bg-amber-50/50 cursor-pointer transition flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={product.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=80&q=80'}
                                alt={product.name}
                                className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-stone-900 group-hover:text-amber-900 truncate">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-stone-500 truncate flex items-center gap-1.5 mt-0.5">
                                  <span>{product.sellerName || 'Verified Guild'}</span>
                                  <span>•</span>
                                  <span className="text-stone-400">{product.categoryName}</span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-stone-900">₹{product.effectivePrice.toLocaleString('en-IN')}</p>
                              {product.discountPercentage && product.discountPercentage > 0 ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {product.discountPercentage}% off
                                </span>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="w-full py-2.5 px-4 bg-amber-50 hover:bg-amber-100 border-t border-amber-100 text-xs font-bold text-amber-900 flex items-center justify-center gap-1 cursor-pointer transition"
                      >
                        <span>View all results for "{searchQuery}"</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* State 4: No matching results */}
                  {searchQuery.trim().length >= 2 && !searchLoading && liveResults.length === 0 && (
                    <div className="p-6 text-center space-y-2">
                      <p className="text-xs text-stone-700 font-medium">
                        No artisanal crafts found matching <span className="font-bold">"{searchQuery}"</span>
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Try searching for broad terms like brass, copper, tea, shawl, or pottery.
                      </p>
                      <button
                        type="button"
                        onClick={handleSearch}
                        className="mt-2 text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                      >
                        Search Full Catalogue anyway →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. Country & Currency Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer shrink-0">
              <span className="text-base">🇮🇳</span>
              <span className="text-xs font-bold uppercase tracking-wider text-stone-200">IN (₹)</span>
            </div>

            {/* 5. Watchlist Button with Live Count Badge */}
            <Link
              to="/wishlist"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition text-stone-200 hover:text-white shrink-0 relative group"
              aria-label="View Saved Watchlist"
              title="Your Saved Watchlist"
            >
              <div className="relative">
                <Heart className="w-6 h-6 text-stone-200 group-hover:text-red-400 group-hover:fill-red-400 transition" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 bg-red-600 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[10px] text-stone-400 leading-none">Your</span>
                <span className="text-xs font-bold text-white leading-tight">Watchlist</span>
              </div>
            </Link>

            {/* 6. Account & Lists Dropdown with User Profile Picture */}
            <div
              className="relative shrink-0"
              ref={accountMenuRef}
              onMouseEnter={() => setIsAccountMenuOpen(true)}
              onMouseLeave={() => setIsAccountMenuOpen(false)}
            >
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-white/10 text-left transition cursor-pointer"
              >
                {/* Profile Picture / Avatar */}
                <div className="relative">
                  {isAuthenticated && user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold text-xs flex items-center justify-center border-2 border-amber-400/80 shadow-sm">
                      {isAuthenticated && user?.fullName ? user.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-stone-950" />}
                    </div>
                  )}
                  {isAuthenticated && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#171412] rounded-full" />
                  )}
                </div>

                <div className="overflow-hidden hidden sm:block">
                  <p className="text-[10px] text-stone-400 leading-none truncate">
                    Hello, {isAuthenticated && user?.fullName ? user.fullName.split(' ')[0] : 'Sign in'}
                  </p>
                  <p className="text-xs font-bold text-white leading-tight flex items-center gap-0.5">
                    Account & Lists
                    <ChevronDown className="w-3 h-3 text-stone-400 mt-0.5" />
                  </p>
                </div>
              </button>

              {/* Mega Dropdown Menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 sm:w-96 bg-white text-stone-800 rounded-2xl shadow-2xl border border-stone-200 p-4 z-50 animate-in fade-in duration-150">
                  {/* Top CTA: Sign In or Welcome */}
                  {!isAuthenticated ? (
                    <div className="text-center pb-4 border-b border-stone-100">
                      <Link
                        to="/login"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="inline-block w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-sm rounded-xl shadow-xs transition"
                      >
                        Sign in
                      </Link>
                      <p className="text-xs text-stone-600 mt-2">
                        New customer?{' '}
                        <Link
                          to="/register"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="text-amber-700 hover:text-amber-800 font-semibold underline"
                        >
                          Start here.
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {user?.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-amber-400"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold text-base flex items-center justify-center">
                            {user?.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="text-xs text-stone-500">Signed in as</p>
                          <p className="text-sm font-bold text-stone-900 truncate">{user?.fullName}</p>
                          {user?.companyName && (
                            <p className="text-[11px] text-amber-800 font-semibold truncate">
                              🏢 {user.companyName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {user?.role.replace('ROLE_', '')}
                      </span>
                    </div>
                  )}

                  {/* Two-Column Section: Your Lists vs Your Account */}
                  <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                    {/* Left Column: Your Lists */}
                    <div className="space-y-2 border-r border-stone-100 pr-3">
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                        Your Lists
                      </h4>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-between text-stone-600 hover:text-amber-700 hover:underline py-1"
                      >
                        <span>Saved Watchlist</span>
                        {wishlistCount > 0 && (
                          <span className="bg-red-100 text-red-700 font-bold text-[10px] px-1.5 py-0.2 rounded-full">
                            {wishlistCount}
                          </span>
                        )}
                      </Link>
                      <Link
                        to="/catalogue"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block text-stone-600 hover:text-amber-700 hover:underline py-1"
                      >
                        Discover Regional Crafts
                      </Link>
                      <Link
                        to="/sellers"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block text-stone-600 hover:text-amber-700 hover:underline py-1"
                      >
                        Followed Artisan Guilds
                      </Link>
                      <Link
                        to="/seller-apply"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block text-stone-600 hover:text-amber-700 hover:underline py-1"
                      >
                        Corporate & Bulk Gifting
                      </Link>
                    </div>

                    {/* Right Column: Your Account */}
                    <div className="space-y-2 pl-1">
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-2">
                        Your Account
                      </h4>
                      <Link
                        to="/profile"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block text-stone-600 hover:text-amber-700 hover:underline py-1 font-medium"
                      >
                        Edit Profile & Picture
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block text-stone-600 hover:text-amber-700 hover:underline py-1"
                      >
                        Your Orders & Tracking
                      </Link>

                      {isSeller && (
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="block text-emerald-800 font-bold hover:underline py-1"
                        >
                          Seller Portal & Inventory
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="block text-indigo-800 font-bold hover:underline py-1"
                        >
                          Platform Admin Console
                        </Link>
                      )}

                      {!isSeller && !isAdmin && (
                        <Link
                          to="/seller-apply"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="block text-amber-800 font-semibold hover:underline py-1"
                        >
                          Register Maker Workshop
                        </Link>
                      )}

                      {isAuthenticated && (
                        <button
                          onClick={() => {
                            logout();
                            setIsAccountMenuOpen(false);
                          }}
                          className="w-full text-left text-red-600 hover:underline pt-2 border-t border-stone-100 flex items-center gap-1.5 cursor-pointer font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Cart with Badge & Subtotal */}
            <Link
              to="/cart"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition shrink-0"
              aria-label="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-amber-400" />
                <span className="absolute -top-1 -right-1.5 bg-amber-500 text-stone-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                  {itemCount}
                </span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-[10px] text-amber-300 font-bold leading-none">
                  ₹{cart?.subtotal ? Math.round(cart.subtotal).toLocaleString('en-IN') : '0'}
                </span>
                <span className="text-xs font-bold text-white leading-tight">Cart</span>
              </div>
            </Link>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="sm:hidden p-1.5 text-stone-300 hover:text-white"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Search Bar Dropdown */}
          {mobileSearchOpen && (
            <div className="sm:hidden px-3 pb-3 pt-1 border-t border-amber-950/40 space-y-2">
              <form onSubmit={handleSearch} className="flex rounded-full overflow-hidden bg-white border border-stone-300">
                <input
                  type="text"
                  placeholder="Search brass, teas, handloom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white text-stone-900 text-sm px-4 py-2 focus:outline-none"
                />
                <button type="submit" className="bg-amber-500 text-stone-950 px-4 py-2 font-bold text-xs">
                  Go
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {trendingSearches.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      setMobileSearchOpen(false);
                      navigate(`/catalogue?search=${encodeURIComponent(term)}`);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subnav Ribbon (Refined Warm Stone Aesthetic) */}
        <div className="bg-[#1c1714] text-stone-200 text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto scrollbar-none border-t border-stone-800/80">
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {/* ☰ All Categories Button -> Triggers MegaSidebar */}
            <button
              onClick={() => setIsMegaSidebarOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:bg-white/10 font-bold transition cursor-pointer text-white"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span>All Crafts</span>
            </button>

            {/* Direct Deal and Category Ribbon Links */}
            <Link
              to="/catalogue?sort=discount"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-white/10 text-amber-300 font-semibold transition"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Artisan Deals</span>
            </Link>

            <Link
              to="/catalogue?maxPrice=499"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Under ₹499 Bazaar
            </Link>

            <Link
              to="/catalogue?category=brass-and-copper"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Moradabad Brass
            </Link>

            <Link
              to="/catalogue?category=heritage-pottery"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Jaipur Blue Pottery
            </Link>

            <Link
              to="/catalogue?category=sustainable-handlooms"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Pure Handloom & Silks
            </Link>

            <Link
              to="/catalogue?category=teas-and-spices"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Single-Estate Spices
            </Link>

            <Link
              to="/sellers"
              className="px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Direct From Forges
            </Link>

            <Link
              to="/catalogue"
              className="hidden md:inline-block px-2.5 py-1 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition whitespace-nowrap"
            >
              Full Catalogue
            </Link>
          </div>

          {/* Right Trust Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-300/90 font-semibold pl-4 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>100% Verified Indian Artisans • Zero Middleman Markup</span>
          </div>
        </div>
      </header>

      {/* Indian PIN Delivery Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentPincode={deliveryPincode}
        currentCity={deliveryCity}
        onSelectLocation={handleSelectLocation}
      />

      {/* Slide-out Mega Navigation Drawer (☰ All) */}
      <MegaSidebar
        isOpen={isMegaSidebarOpen}
        onClose={() => setIsMegaSidebarOpen(false)}
      />
    </>
  );
};
