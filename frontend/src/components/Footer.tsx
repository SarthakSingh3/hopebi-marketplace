import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 mt-12 border-t border-stone-800">
      {/* Back to top button (Amazon style) */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-xs font-semibold py-3.5 transition text-center cursor-pointer block"
      >
        Back to top
      </button>

      {/* Value Proposition Highlights */}
      <div className="border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center sm:text-left">
            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Curated Indian Brands</h4>
                <p className="text-xs text-stone-400 mt-0.5">Strict quality & authenticity checks</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Direct Dispatch</h4>
                <p className="text-xs text-stone-400 mt-0.5">Directly shipped from regional workshops</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">7-Day Easy Returns</h4>
                <p className="text-xs text-stone-400 mt-0.5">Hassle-free return policy on defects</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">100% Safe Payments</h4>
                <p className="text-xs text-stone-400 mt-0.5">UPI, Cards, NetBanking, COD</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-lg">
                H
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              {siteConfig.subTagline}
            </p>
            <div className="pt-2 text-xs text-stone-400 space-y-1">
              <p>Email: <span className="text-stone-300">{siteConfig.contact.email}</span></p>
              <p>Headquarters: <span className="text-stone-300">{siteConfig.contact.address}</span></p>
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Discover</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/catalogue" className="hover:text-amber-400 transition">All Products</Link></li>
              <li><Link to="/catalogue?category=artisanal-cookware" className="hover:text-amber-400 transition">Artisanal Cookware</Link></li>
              <li><Link to="/catalogue?category=brass-and-copper" className="hover:text-amber-400 transition">Pure Brass & Copper</Link></li>
              <li><Link to="/catalogue?category=teas-and-spices" className="hover:text-amber-400 transition">Specialty Teas & Spices</Link></li>
              <li><Link to="/catalogue?category=sustainable-handlooms" className="hover:text-amber-400 transition">Handwoven Textiles</Link></li>
              <li><Link to="/catalogue?category=heritage-pottery" className="hover:text-amber-400 transition">Khurja & Blue Pottery</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Manufacturers</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/sellers" className="hover:text-amber-400 transition">Selected Manufacturers</Link></li>
              <li><Link to="/seller-apply" className="hover:text-amber-400 transition">Apply to Sell on {siteConfig.name}</Link></li>
              <li><Link to="/seller/dashboard" className="hover:text-amber-400 transition">Seller Portal</Link></li>
              <li><span className="text-stone-500">Fair 5% Commission Model</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Trust & Compliance</h5>
            <ul className="space-y-2 text-xs">
              <li><Link to="/policy/shipping" className="hover:text-amber-400 transition">Shipping & Delivery Policy</Link></li>
              <li><Link to="/policy/returns" className="hover:text-amber-400 transition">7-Day Returns & Replacement</Link></li>
              <li><Link to="/policy/terms" className="hover:text-amber-400 transition">Terms of Service</Link></li>
              <li><Link to="/policy/privacy" className="hover:text-amber-400 transition">Privacy Policy (DPDP Act)</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400 transition text-amber-300 font-semibold">Grievance Officer & Contact</Link></li>
              <li><Link to="/orders" className="hover:text-amber-400 transition">Track Your Shipment</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {siteConfig.fullName}. All rights reserved.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Crafted for Indian artisanal enterprises <Heart className="w-3.5 h-3.5 ml-1 text-amber-500 fill-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
