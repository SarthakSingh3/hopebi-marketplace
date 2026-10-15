import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Award,
  ShieldCheck,
  MapPin,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  BadgePercent,
  Hammer
} from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { sellerService } from '../services/sellerService';
import { Product, Category, SellerPublic } from '../types';
import { ProductCard } from '../components/ProductCard';
import { siteConfig } from '../config/siteConfig';
import { browsingHistory, ViewedProductItem } from '../utils/browsingHistory';

// Vibrant Deal Showcase Items (Matching Screenshot 1 top carousel)
const DEAL_CAROUSEL_ITEMS = [
  {
    id: 'deal-1',
    title: 'Single-Estate Tellicherry Peppercorns & Teas',
    dealTag: 'Under ₹399',
    discount: 'Min 25% Off',
    subtitle: 'Direct from Idukki, Kerala harvest',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=teas-and-spices'
  },
  {
    id: 'deal-2',
    title: 'Jaipur Blue Pottery & Glazed Ceramics',
    dealTag: 'Under ₹499',
    discount: 'Limited Deal',
    subtitle: 'Hand-painted floral motifs by master potters',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=heritage-pottery'
  },
  {
    id: 'deal-3',
    title: 'Hand-Hammered Moradabad Brassware & Kansa',
    dealTag: 'Under ₹899',
    discount: 'Direct from Forge',
    subtitle: 'Heavy-gauge bell metal & brass cookware',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=brass-and-copper'
  },
  {
    id: 'deal-4',
    title: 'Pure Kashmiri Handloom & Pashmina Stoles',
    dealTag: 'Under ₹1,499',
    discount: 'GI Certified',
    subtitle: 'Authentic needle Sozni embroidered wool',
    imageUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=sustainable-handlooms'
  },
  {
    id: 'deal-5',
    title: 'Channapatna Lacquerware Balancing Birds & Toys',
    dealTag: 'Under ₹699',
    discount: 'Natural Vegetable Dyes',
    subtitle: 'Ivory wood balancing craft from Karnataka',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=natural-wood-craft'
  },
  {
    id: 'deal-6',
    title: 'Hand-Braided Kolhapuri Pure Leather Footwear',
    dealTag: 'Under ₹1,799',
    discount: 'Vegetable Tanned',
    subtitle: 'Artisanal leathercraft from Maharashtra',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=handcrafted-leatherware'
  },
  {
    id: 'deal-7',
    title: 'Rustic Stoneware Matte Glaze Ramen Bowls',
    dealTag: 'Under ₹999',
    discount: 'Set of 2 Deals',
    subtitle: 'High-fire studio stoneware from Khurja',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=500&q=80',
    link: '/product/rustic-stoneware-matte-glaze-bowls'
  },
  {
    id: 'deal-8',
    title: 'Pure Copper Handcrafted Water Bottles & Tumblers',
    dealTag: 'Under ₹599',
    discount: 'Ayurvedic Pure',
    subtitle: 'Seamless copper vessels for wellness',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80',
    link: '/catalogue?category=brass-and-copper'
  }
];

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<SellerPublic[]>([]);
  const [viewedProducts, setViewedProducts] = useState<ViewedProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Carousel ref for scroll buttons
  const carouselRef = useRef<HTMLDivElement>(null);

  // Countdown timer for Lightning Deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setViewedProducts(browsingHistory.getFrequentOrRecent(4));
    const fetchData = async () => {
      try {
        const [prods, cats, slrs] = await Promise.all([
          productService.getFeaturedDiscoveries(8),
          categoryService.getCategories(),
          sellerService.getApprovedSellers()
        ]);
        setFeaturedProducts(prods);
        setCategories(cats);
        setSellers(slrs.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f0f2f2] min-h-screen space-y-6 pb-16">
      {/* 1. TOP DEAL SPOTLIGHT CAROUSEL (Matching Screenshot 1 top) */}
      <section className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 pt-5 pb-6 text-white shadow-inner">
        <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-stone-950 text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" />
                Featured Deal Showcase
              </span>
              <h2 className="text-sm sm:text-base font-bold text-stone-100 hidden sm:inline">
                Top Handcrafted Deals from Regional Forges & Guilds
              </h2>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scrollCarousel('left')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollCarousel('right')}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Deal Ribbon */}
          <div
            ref={carouselRef}
            className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2"
          >
            {DEAL_CAROUSEL_ITEMS.map((item) => (
              <Link
                key={item.id}
                to={item.link}
                className="group shrink-0 w-64 sm:w-72 bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between text-stone-900 border border-stone-200 hover:border-amber-500"
              >
                <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-sm">
                      {item.dealTag}
                    </span>
                    <span className="bg-stone-900/85 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded">
                      {item.discount}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-stone-900 group-hover:text-amber-800 transition line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-amber-700 font-bold">
                    <span>Shop Limited Deal</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. THE 4-COLUMN QUAD CARDS GRID (Matching Screenshot 1 bottom layout) */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: ⚡ Today's Lightning Deals */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-serif font-black text-lg text-stone-900 flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-amber-600 fill-amber-500" />
                  Today's Lightning Deals
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-stone-600 mb-3 bg-red-50 text-red-700 px-2.5 py-1 rounded-md font-semibold w-fit">
                <Clock className="w-3.5 h-3.5 animate-pulse text-red-600" />
                <span>
                  Ends in {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
              </div>

              {/* 2x2 Grid of Lightning Deal Items */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/catalogue?category=brass-and-copper"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80"
                      alt="Brass Cookware"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Brass Kansa Bowl</p>
                  <p className="text-[10px] text-red-700 font-extrabold">Up to 40% off</p>
                </Link>

                <Link
                  to="/product/nilgiri-silver-needle-white-tea"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80"
                      alt="Silver Needle White Tea"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Silver Needle Tea</p>
                  <p className="text-[10px] text-red-700 font-extrabold">Flat ₹150 off</p>
                </Link>

                <Link
                  to="/product/jaipur-blue-pottery-decorative-platter"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"
                      alt="Jaipur Blue Pottery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Jaipur Platter 10"</p>
                  <p className="text-[10px] text-red-700 font-extrabold">Min 35% off</p>
                </Link>

                <Link
                  to="/product/channapatna-wooden-balancing-birds"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80"
                      alt="Balancing Wooden Birds"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Balancing Birds</p>
                  <p className="text-[10px] text-red-700 font-extrabold">Up to 30% off</p>
                </Link>
              </div>
            </div>

            <Link
              to="/catalogue?sort=discount"
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center justify-between"
            >
              <span>See all lightning deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Explore India by Craft Heritage */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Explore by Craft Heritage
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Direct from authentic regional artisan clusters
              </p>

              {/* 2x2 Grid of Craft Clusters */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/catalogue?category=brass-and-copper"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80"
                      alt="Moradabad Brass"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Moradabad (UP)</p>
                  <p className="text-[10px] text-stone-500">Brass & Bell Metal</p>
                </Link>

                <Link
                  to="/catalogue?category=heritage-pottery"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"
                      alt="Jaipur Blue Pottery"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Jaipur (Rajasthan)</p>
                  <p className="text-[10px] text-stone-500">Blue Pottery & Glaze</p>
                </Link>

                <Link
                  to="/catalogue?category=sustainable-handlooms"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=300&q=80"
                      alt="Kashmir Handloom"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Srinagar (J&K)</p>
                  <p className="text-[10px] text-stone-500">Handwoven Pashmina</p>
                </Link>

                <Link
                  to="/catalogue?category=natural-wood-craft"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80"
                      alt="Woodcrafts"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Channapatna (KA)</p>
                  <p className="text-[10px] text-stone-500">Natural Wood Craft</p>
                </Link>
              </div>
            </div>

            <Link
              to="/catalogue"
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center justify-between"
            >
              <span>Explore all craft regions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Budget Artisan Stores */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Budget Artisan Stores
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                Direct maker prices with zero retail markup
              </p>

              {/* 2x2 Grid of Budget Stores */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/catalogue?maxPrice=399"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80"
                      alt="Under ₹399"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Under ₹399 Store</p>
                  <p className="text-[10px] text-amber-800 font-bold">Spices, Tea & Diyas</p>
                </Link>

                <Link
                  to="/catalogue?maxPrice=599"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"
                      alt="Under ₹599"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Under ₹599 Store</p>
                  <p className="text-[10px] text-amber-800 font-bold">Chai Kulhads & Cups</p>
                </Link>

                <Link
                  to="/catalogue?maxPrice=999"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=300&q=80"
                      alt="Under ₹999"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Under ₹999 Store</p>
                  <p className="text-[10px] text-amber-800 font-bold">Stoneware Bowls</p>
                </Link>

                <Link
                  to="/catalogue?maxPrice=1999"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80"
                      alt="Under ₹1,999"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Under ₹1,999 Store</p>
                  <p className="text-[10px] text-amber-800 font-bold">Leather & Silks</p>
                </Link>
              </div>
            </div>

            <Link
              to="/catalogue?maxPrice=499"
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center justify-between"
            >
              <span>Explore all budget stores</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Meet Verified Maker Guilds */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <h3 className="font-serif font-black text-lg text-stone-900">
                Meet Verified Guilds
              </h3>
              <p className="text-xs text-stone-500 mb-3">
                100% genuine maker pricing, verified credentials
              </p>

              {/* 2x2 Grid of Guilds */}
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to="/sellers/moradabad-metalcrafts"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80"
                      alt="Moradabad Guild"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Moradabad Guild</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">50+ Yrs Heritage</p>
                </Link>

                <Link
                  to="/sellers"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=300&q=80"
                      alt="Kashmir Weavers"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Kashmir Weavers</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">GI Certified</p>
                </Link>

                <Link
                  to="/sellers"
                  className="group block bg-stone-50 rounded-lg p-2 hover:bg-amber-50/50 transition border border-stone-100"
                >
                  <div className="aspect-square rounded-md overflow-hidden bg-white mb-1.5 border border-stone-200">
                    <img
                      src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=300&q=80"
                      alt="Jaipur Potteries"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-stone-900 line-clamp-1">Jaipur Potteries</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Lead-Free Glaze</p>
                </Link>

                <Link
                  to="/seller-apply"
                  className="group block bg-amber-50/80 rounded-lg p-2 hover:bg-amber-100/60 transition border border-amber-200 flex flex-col justify-between"
                >
                  <div className="aspect-square rounded-md bg-white mb-1.5 border border-amber-300 flex flex-col items-center justify-center p-2 text-center">
                    <Award className="w-8 h-8 text-amber-700 mb-1" />
                    <span className="text-[10px] font-black text-amber-900 leading-tight">Join as Maker</span>
                  </div>
                  <p className="text-[11px] font-bold text-amber-950 line-clamp-1">Sell on HOPEBI</p>
                  <p className="text-[10px] text-amber-800 font-semibold">5% Baseline Fee</p>
                </Link>
              </div>
            </div>

            <Link
              to="/sellers"
              className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center justify-between"
            >
              <span>Meet all verified manufacturers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PAN-INDIA ASSURANCE & TRUST STRIP */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-stone-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 leading-tight">Free Express Delivery</p>
              <p className="text-[11px] text-stone-500">On all orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 leading-tight">100% Genuine Craft</p>
              <p className="text-[11px] text-stone-500">Verified raw materials & GI tags</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 leading-tight">Direct Forge Pricing</p>
              <p className="text-[11px] text-stone-500">Zero middleman markup (5% commission)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-900 leading-tight">7-Day Easy Returns</p>
              <p className="text-[11px] text-stone-500">Hassle-free replacement policy</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PICK UP WHERE YOU LEFT OFF (Personalized Browsing History) */}
      {viewedProducts.length > 0 && (
        <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
          <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="font-serif font-black text-lg text-stone-900">
                  Pick Up Where You Left Off
                </h2>
                <span className="text-xs text-stone-500 hidden sm:inline">
                  — Items you viewed during your visits
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  browsingHistory.clear();
                  setViewedProducts([]);
                }}
                className="text-xs text-stone-400 hover:text-stone-700 underline cursor-pointer"
              >
                Clear History
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {viewedProducts.map((item) => (
                <Link
                  key={item.id}
                  to={`/product/${item.slug}`}
                  className="group bg-stone-50 rounded-xl p-3 border border-stone-200 hover:border-amber-500 transition flex flex-col justify-between"
                >
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-white mb-2.5">
                    <img
                      src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-stone-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Viewed {item.viewCount}x
                    </div>
                  </div>
                  <div>
                    {item.originCityState && (
                      <span className="text-[10px] text-amber-800 font-bold uppercase block truncate">
                        {item.originCityState}
                      </span>
                    )}
                    <h4 className="font-bold text-xs text-stone-900 group-hover:text-amber-800 transition line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-baseline space-x-1.5 mt-1">
                      <span className="font-extrabold text-stone-900 text-sm">₹{item.effectivePrice}</span>
                      {item.regularPrice > item.effectivePrice && (
                        <span className="text-xs text-stone-400 line-through">₹{item.regularPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. SHOP BY SPECIALTY CRAFT CATEGORIES */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif font-black text-lg text-stone-900">
                Explore by Craft Specialty
              </h2>
              <p className="text-xs text-stone-500">
                Traditional Indian making techniques categorized for easy browsing
              </p>
            </div>
            <Link
              to="/catalogue"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center"
            >
              All Categories <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?category=${cat.slug}`}
                className="group bg-stone-50 rounded-xl p-3 border border-stone-200 hover:border-amber-600 hover:shadow-sm transition text-center flex flex-col items-center justify-between"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white mb-2 border border-stone-200 group-hover:scale-105 transition-transform shadow-xs">
                  <img
                    src={cat.imageUrl || 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=200&q=80'}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-xs text-stone-800 group-hover:text-amber-800 leading-snug line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FRESHLY LISTED CURATED DISCOVERIES (Real Backend Catalog) */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-xl p-5 shadow-xs border border-stone-200">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Direct-from-Maker Listings
              </span>
              <h2 className="font-serif font-black text-xl text-stone-900 mt-0.5">
                Freshly Listed Discoveries
              </h2>
            </div>
            <Link
              to="/catalogue"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center"
            >
              Browse Full Catalog <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-stone-100 rounded-xl h-72 animate-pulse border border-stone-200" />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
              <p className="text-stone-500 text-sm">Products are being catalogued. Please check back shortly.</p>
            </div>
          )}
        </div>
      </section>

      {/* 7. VERIFIED PRODUCERS & MAKERS SPOTLIGHT */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-widest uppercase">
                Direct From Source
              </span>
              <h2 className="font-serif font-black text-2xl sm:text-3xl text-white mt-1">
                Approved Indian Regional Workshops
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl mt-1.5 leading-relaxed">
                HOPEBI independently verifies manufacturing facilities, raw material authenticity, and ethical labor standards before publishing maker workshops.
              </p>
            </div>
            <Link
              to="/sellers"
              className="inline-flex items-center text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2.5 rounded-lg transition self-start md:self-auto shadow-md"
            >
              Browse All Guilds <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sellers.map((seller) => (
              <Link
                key={seller.id}
                to={`/sellers/${seller.slug}`}
                className="bg-stone-900/80 backdrop-blur-xs rounded-xl p-5 border border-stone-700/80 hover:border-amber-400 hover:bg-stone-850 transition flex flex-col justify-between group"
              >
                <div>
                  <span className="inline-flex items-center text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded mb-2.5">
                    <MapPin className="w-3 h-3 mr-1" />
                    {seller.city}, {seller.state}
                  </span>
                  <h3 className="font-serif font-bold text-base text-white group-hover:text-amber-300 transition">
                    {seller.companyName}
                  </h3>
                  <p className="text-xs text-stone-300 mt-2 line-clamp-3 leading-relaxed">
                    {seller.companyDescription}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-amber-400 font-bold">
                  <span>View Story & Guild Products</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 8. VERIFICATION STANDARDS & CONSUMER GUARANTEE */}
      <section className="max-w-[1536px] mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-bold text-amber-700 tracking-wider uppercase">
              The HOPEBI Standard
            </span>
            <h2 className="font-serif font-black text-2xl text-stone-900">
              Why Buy Direct on HOPEBI?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Eliminating retail distributor markup while ensuring master artisans and regional manufacturers earn fair livelihoods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <Hammer className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">1. Production Authenticity</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Products are genuinely handcrafted or forged by Indian artisans using food-safe, pure regional materials rather than factory plastic imitations.
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">2. Low 5% Platform Fee</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Unlike mega-marketplaces that charge 25% to 35% commission, HOPEBI operates on a transparent 5% platform baseline, passing huge savings directly to you.
              </p>
            </div>

            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900">3. Verified Quality Claims</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                All claims of "GI Tagged", "Pure Kansa Bell Metal", "Lead-Free Ceramic", or "Single Estate Harvest" undergo strict verification before publication.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
