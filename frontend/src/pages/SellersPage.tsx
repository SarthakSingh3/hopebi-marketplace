import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { sellerService } from '../services/sellerService';
import { SellerPublic } from '../types';

export const SellersPage: React.FC = () => {
  const [sellers, setSellers] = useState<SellerPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getApprovedSellers()
      .then(setSellers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold text-amber-700 tracking-wider uppercase">Regional Artisan Clusters</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
          Curated Indian Manufacturers
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
          From Gujarat's 70-year bell metal foundries to Kashmir's generational pashmina weavers and Kerala spice cooperatives. Each partner enterprise is vetted for authentic craftsmanship and direct delivery capability.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-64 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : sellers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller) => (
            <div
              key={seller.id}
              className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    <MapPin className="w-3 h-3 mr-1 text-amber-700" />
                    {seller.city}, {seller.state}
                  </span>
                  {seller.verificationStatus === 'VERIFIED' && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>

                <h3 className="font-serif font-bold text-xl text-stone-900 group-hover:text-amber-800 transition">
                  {seller.companyName}
                </h3>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {seller.companyDescription}
                </p>

                {seller.manufacturerHeritage && (
                  <p className="text-[11px] text-stone-500 italic border-l-2 border-amber-600 pl-2">
                    {seller.manufacturerHeritage}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                <Link
                  to={`/sellers/${seller.slug}`}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 inline-flex items-center"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to={`/catalogue?seller=${seller.slug}`}
                  className="text-[11px] text-stone-400 hover:text-stone-700"
                >
                  Catalogue →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 text-stone-500">
          No manufacturers found.
        </div>
      )}
    </div>
  );
};
