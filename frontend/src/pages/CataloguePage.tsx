import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ArrowUpDown, Tag, Check, Sparkles } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { Product, Category, PageResponse } from '../types';
import { ProductCard } from '../components/ProductCard';

export const CataloguePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [productsPage, setProductsPage] = useState<PageResponse<Product> | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Read URL query params
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const inStockParam = searchParams.get('inStock') === 'true';
  const sortByParam = searchParams.get('sortBy') || searchParams.get('sort') || 'newest';
  const minPriceParam = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : null;
  const maxPriceParam = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : null;
  const pageParam = parseInt(searchParams.get('page') || '0', 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  const priceBuckets = [
    { label: 'All Prices', min: null, max: null },
    { label: 'Under ₹499', min: null, max: 499 },
    { label: '₹500 - ₹1,499', min: 500, max: 1499 },
    { label: '₹1,500 - ₹2,999', min: 1500, max: 2999 },
    { label: '₹3,000 & Above', min: 3000, max: null }
  ];

  const isBucketActive = (min: number | null, max: number | null) => {
    if (min === null && max === null) {
      return minPriceParam === null && maxPriceParam === null;
    }
    return minPriceParam === min && maxPriceParam === max;
  };

  const handlePriceBucket = (min: number | null, max: number | null) => {
    const next = new URLSearchParams(searchParams);
    if (min !== null) next.set('minPrice', min.toString());
    else next.delete('minPrice');
    if (max !== null) next.set('maxPrice', max.toString());
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({
          category: categoryParam || undefined,
          search: searchParam || undefined,
          inStock: inStockParam ? true : undefined,
          sortBy: sortByParam,
          page: pageParam,
          size: (minPriceParam !== null || maxPriceParam !== null || sortByParam === 'discount') ? 50 : 12
        });
        
        let filtered = res.content;
        if (minPriceParam !== null) {
          filtered = filtered.filter(p => p.effectivePrice >= minPriceParam);
        }
        if (maxPriceParam !== null) {
          filtered = filtered.filter(p => p.effectivePrice <= maxPriceParam);
        }
        if (sortByParam === 'discount') {
          filtered = [...filtered].sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));
        }

        if (minPriceParam !== null || maxPriceParam !== null || sortByParam === 'discount') {
          setProductsPage({
            ...res,
            content: filtered,
            totalElements: filtered.length,
            totalPages: Math.max(1, Math.ceil(filtered.length / 12))
          });
        } else {
          setProductsPage(res);
        }
      } catch (err) {
        console.error('Failed to load catalogue', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [categoryParam, searchParam, inStockParam, sortByParam, minPriceParam, maxPriceParam, pageParam]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    next.delete('page'); // Reset page when filter changes
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchInput.trim() || null);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = !!(
    categoryParam ||
    searchParam ||
    inStockParam ||
    minPriceParam !== null ||
    maxPriceParam !== null ||
    (sortByParam !== 'newest' && sortByParam !== 'default')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Curated Catalogue
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse authentic products crafted by verified Indian manufacturers.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Search by product, material, brand..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white text-stone-900 placeholder-stone-400 text-xs sm:text-sm rounded-xl pl-9 pr-16 py-2.5 border border-stone-300 focus:outline-none focus:border-amber-700"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-amber-700 text-white text-xs px-2.5 py-1 rounded-lg"
            >
              Search
            </button>
          </form>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="md:hidden p-2.5 rounded-xl border border-stone-300 bg-white text-stone-700 flex items-center justify-center shrink-0"
            aria-label="Filter"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-semibold text-xs tracking-wider uppercase text-stone-900 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-amber-700" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-amber-800 hover:underline flex items-center"
              >
                Reset All <X className="w-3 h-3 ml-0.5" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-serif font-semibold text-sm text-stone-900 mb-3">Category</h4>
            <div className="space-y-1.5">
              <button
                onClick={() => updateParam('category', null)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  !categoryParam ? 'bg-amber-100/70 text-amber-900 font-semibold' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    categoryParam === cat.slug
                      ? 'bg-amber-100/70 text-amber-900 font-semibold'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="font-serif font-semibold text-sm text-stone-900 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-700" /> Price Budget
            </h4>
            <div className="space-y-1.5">
              {priceBuckets.map((b, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePriceBucket(b.min, b.max)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isBucketActive(b.min, b.max)
                      ? 'bg-amber-100/80 text-amber-950 font-bold border border-amber-300 shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-stone-200">
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-stone-700 font-medium select-none">
              <input
                type="checkbox"
                checked={inStockParam}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
              />
              <span>In-Stock Items Only</span>
            </label>
          </div>

          {/* Artisan Direct Guarantee Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/60 text-xs space-y-1.5 text-amber-950">
            <span className="font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Direct Artisan Guarantee
            </span>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Every item ships directly from the regional forge or loom cluster with guaranteed 100% fair artisan compensation.
            </p>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between bg-white p-3 rounded-xl border border-stone-200 text-xs gap-3">
            <span className="text-stone-600 font-medium">
              Showing <strong className="text-stone-900">{productsPage?.totalElements || 0}</strong> products
              {categoryParam && ` in ${categories.find(c => c.slug === categoryParam)?.name || categoryParam}`}
            </span>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-stone-500 flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" /> Sort by:
              </span>
              <select
                value={sortByParam}
                onChange={(e) => updateParam('sortBy', e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1 text-xs text-stone-800 focus:outline-none focus:border-amber-700 font-medium cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="discount">Biggest Discount (%)</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Product Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : productsPage && productsPage.content.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productsPage.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-stone-900">No matching products found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                Try clearing your search query or choosing another craft category.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {productsPage && productsPage.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              {Array.from({ length: productsPage.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', i.toString())}
                  className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                    productsPage.pageNumber === i
                      ? 'bg-amber-700 text-white shadow'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-700" />
                <h3 className="font-serif font-bold text-base text-stone-900">Filters & Sort</h3>
              </div>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-900 transition"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 text-xs">
              {/* Reset shortcut */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      clearAllFilters();
                      setFilterDrawerOpen(false);
                    }}
                    className="text-xs font-semibold text-amber-800 underline flex items-center gap-1"
                  >
                    Reset All Filters <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Sort By */}
              <div>
                <h4 className="font-serif font-semibold text-sm text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" /> Sort By
                </h4>
                <select
                  value={sortByParam}
                  onChange={(e) => updateParam('sortBy', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-700 cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="discount">Biggest Discount (%)</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-serif font-semibold text-sm text-stone-900 mb-2.5">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam('category', null)}
                    className={`w-full text-left px-3 py-2 rounded-xl font-medium transition ${
                      !categoryParam ? 'bg-amber-100 text-amber-900 font-bold' : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => updateParam('category', cat.slug)}
                      className={`w-full text-left px-3 py-2 rounded-xl font-medium transition ${
                        categoryParam === cat.slug
                          ? 'bg-amber-100 text-amber-900 font-bold'
                          : 'text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Budget */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="font-serif font-semibold text-sm text-stone-900 mb-2.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-700" /> Price Budget
                </h4>
                <div className="space-y-1.5">
                  {priceBuckets.map((b, i) => {
                    const active = isBucketActive(b.min, b.max);
                    return (
                      <button
                        key={i}
                        onClick={() => handlePriceBucket(b.min, b.max)}
                        className={`w-full text-left px-3 py-2 rounded-xl font-medium flex items-center justify-between transition ${
                          active
                            ? 'bg-amber-800 text-white font-semibold shadow-xs'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span>{b.label}</span>
                        {active && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-stone-100">
                <h4 className="font-serif font-semibold text-sm text-stone-900 mb-2">Availability</h4>
                <label className="flex items-center space-x-2 text-stone-700 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                    className="rounded text-amber-700 focus:ring-amber-700 w-4 h-4 cursor-pointer"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-serif font-medium text-sm rounded-xl shadow-md transition"
              >
                Apply & View Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
