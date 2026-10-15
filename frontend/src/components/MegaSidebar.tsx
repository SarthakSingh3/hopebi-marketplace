import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  User,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Store,
  Flame,
  Award,
  Package,
  HelpCircle,
  LogOut,
  LogIn,
  Bot,
  Heart,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MegaSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MegaSidebar: React.FC<MegaSidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark backdrop blur */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* User Greeting Header (Deep Slate / Dark Amazon-style) */}
        <div className="bg-stone-900 text-white px-6 py-5 flex items-center justify-between shrink-0 shadow-md">
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            onClick={onClose}
            className="flex items-center gap-3 group"
          >
            {isAuthenticated && user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-xs"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-stone-700 border-2 border-amber-500/80 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:border-amber-400 transition">
                {isAuthenticated && user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-stone-200" />}
              </div>
            )}
            <div>
              <p className="text-sm font-bold leading-tight group-hover:text-amber-400 transition">
                {isAuthenticated ? `Hello, ${user?.fullName?.split(' ')[0]}` : 'Hello, sign in'}
              </p>
              <p className="text-[11px] text-stone-400">
                {isAuthenticated ? 'View your profile & orders' : 'Browse or create your account'}
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 text-stone-800 text-sm">
          {/* Section 1: Trending & Fast Access */}
          <div className="py-3">
            <h4 className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Trending on HOPEBI
            </h4>
            <div className="space-y-0.5">
              <Link
                to="/catalogue?sort=popular"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>Bestsellers (Direct from Makers)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue?sort=newest"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>New Regional Arrivals</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/sellers"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Top Rated Indian Workshops</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/wishlist"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition text-red-700"
              >
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 fill-current text-red-600" />
                  <span className="font-semibold">Your Saved Watchlist</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            </div>
          </div>

          {/* Section 2: Shop by Heritage Craft */}
          <div className="py-3">
            <h4 className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Shop by Heritage Craft & Category
            </h4>
            <div className="space-y-0.5">
              <Link
                to="/catalogue?category=brass-and-copper"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <span>Brassware & Metalcrafts (Moradabad)</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue?category=heritage-pottery"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <span>Jaipur Blue Pottery & Terracotta</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue?category=sustainable-handlooms"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <span>Pure Handloom, Khadi & Pashmina</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue?category=teas-and-spices"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <span>Single-Estate Teas & Heritage Spices</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue?category=natural-wood-craft"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <span>Wood Carving & Channapatna Lacquerware</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/catalogue"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 text-amber-800 font-bold hover:bg-amber-50/60 transition"
              >
                <span>View All 50,000+ Curated Products &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Section 3: Programs & Manufacturer Features */}
          <div className="py-3">
            <h4 className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Programs & Features
            </h4>
            <div className="space-y-0.5">
              <Link
                to="/sellers"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-stone-500" />
                  <span>Meet the Manufacturers & Forges</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
              <Link
                to="/seller-apply"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 bg-amber-50/50 hover:bg-amber-100/60 text-amber-950 font-semibold transition"
              >
                <div className="flex items-center gap-2.5">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span>Sell on HOPEBI (Manufacturer Onboarding)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-700" />
              </Link>
            </div>
          </div>

          {/* Section 4: Help & Settings */}
          <div className="py-3">
            <h4 className="px-6 py-2 text-xs font-bold uppercase tracking-wider text-stone-500">
              Help & Settings
            </h4>
            <div className="space-y-0.5">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-stone-500" />
                  <span>Your Account</span>
                </div>
              </Link>
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center justify-between px-6 py-2.5 hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-stone-500" />
                  <span>Your Orders & Live Tracking</span>
                </div>
              </Link>
              <div className="flex items-center justify-between px-6 py-2.5 text-stone-600">
                <span>Currency & Language</span>
                <span className="font-semibold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                  🇮🇳 INR (₹)
                </span>
              </div>
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2.5 px-6 py-2.5 text-left text-red-700 hover:bg-red-50 transition cursor-pointer font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center gap-2.5 px-6 py-2.5 text-amber-800 hover:bg-amber-50 font-bold transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
