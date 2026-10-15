import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, ShieldCheck, ArrowLeft } from 'lucide-react';
import { sellerService } from '../services/sellerService';
import { productService } from '../services/productService';
import { SellerPublic, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

export const SellerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [seller, setSeller] = useState<SellerPublic | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      sellerService.getSellerBySlug(slug),
      productService.getProducts({ seller: slug, size: 24 })
    ])
      .then(([s, prods]) => {
        setSeller(s);
        setProducts(prods.content);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-8">
        <div className="h-44 bg-stone-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => <div key={n} className="h-64 bg-stone-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Manufacturer Profile Not Found</h2>
        <Link to="/sellers" className="mt-4 inline-block text-xs font-semibold text-amber-700 underline">
          View all verified manufacturers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <Link to="/sellers" className="inline-flex items-center text-xs font-semibold text-stone-500 hover:text-stone-900">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to all manufacturers
      </Link>

      {/* Brand Profile Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 sm:p-12 border border-stone-800 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center text-xs font-semibold bg-amber-500/20 text-amber-300 px-3 py-0.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 mr-1" />
              {seller.city}, {seller.state}
            </span>
            {seller.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Workshop
              </span>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            {seller.companyName}
          </h1>

          <p className="text-sm text-stone-300 leading-relaxed">
            {seller.companyDescription}
          </p>

          {seller.manufacturerHeritage && (
            <div className="pt-2 text-xs text-amber-200/90 italic border-l-2 border-amber-400 pl-3">
              "{seller.manufacturerHeritage}"
            </div>
          )}
        </div>
      </div>

      {/* Products by this maker */}
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Crafted by {seller.companyName}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Browse all demandable products currently available for direct Pan-India dispatch.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 text-xs text-stone-500">
            No active products listed currently for this manufacturer.
          </div>
        )}
      </div>
    </div>
  );
};
