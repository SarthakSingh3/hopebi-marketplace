import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Store, Truck, Plus, Check, Clock, TrendingUp, AlertCircle, X, ExternalLink, UploadCloud, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { sellerService, ProductCreateData } from '../services/sellerService';
import { uploadService } from '../services/uploadService';
import { categoryService } from '../services/categoryService';
import { Product, Category, OrderItem, SellerProfile } from '../types';

export const SellerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics'>('products');
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductCreateData>({
    name: '',
    categoryId: 1,
    sku: '',
    shortDescription: '',
    fullDescription: '',
    regularPrice: 999,
    salePrice: 799,
    stockQuantity: 15,
    materials: '',
    dimensions: '',
    originCityState: '',
    verifiedClaims: '',
    imageUrls: ['']
  });

  // Dispatch modal state
  const [dispatchModalItem, setDispatchModalItem] = useState<OrderItem | null>(null);
  const [carrier, setCarrier] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Device image upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [customImageUrlInput, setCustomImageUrlInput] = useState('');

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        setUploadError('Please select valid image files (JPEG, PNG, WebP).');
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setUploadError(`File ${f.name} exceeds the 10MB limit.`);
        return;
      }
    }

    try {
      setUploadingImage(true);
      setUploadError(null);
      const results = await uploadService.uploadMultipleImages(files);
      const newUrls = results.map(r => r.fileUrl);
      setNewProduct(prev => {
        const existing = (prev.imageUrls || []).filter(u => u && u.trim().length > 0);
        return { ...prev, imageUrls: [...existing, ...newUrls] };
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setUploadError(e.response?.data?.message || 'Failed to upload images from device. Please check backend.');
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    setNewProduct(prev => {
      const urls = [...(prev.imageUrls || [])];
      if (index >= 0 && index < urls.length) {
        const [selected] = urls.splice(index, 1);
        urls.unshift(selected);
      }
      return { ...prev, imageUrls: urls };
    });
  };

  const handleRemoveImage = (index: number) => {
    setNewProduct(prev => {
      const urls = [...(prev.imageUrls || [])];
      urls.splice(index, 1);
      return { ...prev, imageUrls: urls };
    });
  };

  const handleAddImageUrl = () => {
    if (!customImageUrlInput.trim()) return;
    setNewProduct(prev => {
      const existing = (prev.imageUrls || []).filter(u => u && u.trim().length > 0);
      return { ...prev, imageUrls: [...existing, customImageUrlInput.trim()] };
    });
    setCustomImageUrlInput('');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prof, prods, ords, anl, cats] = await Promise.all([
        sellerService.getMyProfile(),
        sellerService.getMyProducts(),
        sellerService.getMyOrders(),
        sellerService.getAnalytics(),
        categoryService.getCategories()
      ]);
      setProfile(prof);
      setProducts(prods);
      setOrders(ords);
      setAnalytics(anl);
      setCategories(cats);
      if (cats.length > 0) {
        setNewProduct(prev => ({ ...prev, categoryId: cats[0].id }));
      }
    } catch (err) {
      console.error('Failed to load seller dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const validImages = newProduct.imageUrls?.filter(url => url.trim().length > 0);
      await sellerService.createProduct({
        ...newProduct,
        imageUrls: validImages && validImages.length > 0 ? validImages : undefined
      });
      setShowProductModal(false);
      loadData();
      alert('Product created successfully and submitted for administrator review.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product listing.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalItem || !trackingNumber.trim()) return;
    setActionLoading(true);
    try {
      await sellerService.dispatchOrderItem(dispatchModalItem.id, {
        carrier: carrier.trim(),
        trackingNumber: trackingNumber.trim()
      });
      setDispatchModalItem(null);
      setTrackingNumber('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not dispatch item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async (itemId: number) => {
    if (!window.confirm('Mark this item as successfully delivered?')) return;
    try {
      await sellerService.markOrderItemDelivered(itemId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Action failed.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-28 bg-stone-200 rounded-3xl" />
        <div className="h-96 bg-stone-200 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
              Manufacturer Portal
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              profile?.sellerStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {profile?.sellerStatus?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            {profile?.companyName || 'Seller Dashboard'}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {profile?.city}, {profile?.state} • Commission Rate: {profile?.commissionRate || 5.0}%
          </p>
        </div>

        {profile?.sellerStatus === 'APPROVED' && (
          <button
            onClick={() => setShowProductModal(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow flex items-center transition self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-1.5" /> List New Product
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'products'
              ? 'text-amber-700 border-b-2 border-amber-700 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'text-amber-700 border-b-2 border-amber-700 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Customer Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 transition flex items-center space-x-2 ${
            activeTab === 'analytics'
              ? 'text-amber-700 border-b-2 border-amber-700 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Sales & Analytics</span>
        </button>
      </div>

      {/* Tab 1: Products */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {products.length > 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-medium text-stone-900 flex items-center space-x-3">
                        <img
                          src={p.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=60&q=80'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-serif font-bold text-sm">{p.name}</span>
                      </td>
                      <td className="p-4 font-mono text-[11px]">{p.sku}</td>
                      <td className="p-4 font-bold text-stone-900">₹{p.effectivePrice}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${p.stockQuantity > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td className="p-4">{p.categoryName || 'General'}</td>
                      <td className="p-4">
                        <Link
                          to={`/product/${p.slug}`}
                          className="text-amber-700 hover:text-amber-800 font-semibold flex items-center"
                        >
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
              <Package className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-stone-900">No products listed yet</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Add your crafted products with descriptions, pricing, and stock to begin receiving consumer orders.
              </p>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl"
              >
                List First Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Orders & Fulfilment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length > 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Fulfilment Status</th>
                    <th className="p-4">Tracking</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="p-4">
                        <p className="font-serif font-bold text-sm text-stone-900">{item.productName}</p>
                        <p className="text-[11px] font-mono text-stone-400">SKU: {item.sku}</p>
                      </td>
                      <td className="p-4 font-semibold">{item.quantity}</td>
                      <td className="p-4 font-bold text-stone-900">₹{item.lineTotal}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          item.fulfilmentStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.fulfilmentStatus === 'DISPATCHED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.fulfilmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-[11px]">
                        {item.trackingNumber ? (
                          <span>{item.carrier}: <strong className="font-mono">{item.trackingNumber}</strong></span>
                        ) : (
                          <span className="text-stone-400 italic">Not dispatched</span>
                        )}
                      </td>
                      <td className="p-4 space-x-2">
                        {item.fulfilmentStatus !== 'DISPATCHED' && item.fulfilmentStatus !== 'DELIVERED' && (
                          <button
                            onClick={() => setDispatchModalItem(item)}
                            className="bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg shadow-sm"
                          >
                            Dispatch
                          </button>
                        )}
                        {item.fulfilmentStatus === 'DISPATCHED' && (
                          <button
                            onClick={() => handleMarkDelivered(item.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 text-stone-500 text-xs">
              No orders received yet. Active product listings will receive direct notifications here.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Sales Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Total Units Sold</span>
            <p className="font-serif text-3xl font-bold text-stone-900 mt-2">{analytics.totalUnitsSold}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Gross Sales Value</span>
            <p className="font-serif text-3xl font-bold text-stone-900 mt-2">₹{analytics.grossSales}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Active Products</span>
            <p className="font-serif text-3xl font-bold text-stone-900 mt-2">{analytics.totalProducts}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <span className="text-xs text-stone-500 uppercase tracking-wider block">Commission Rate</span>
            <p className="font-serif text-3xl font-bold text-amber-700 mt-2">{analytics.commissionPercent}%</p>
          </div>
        </div>
      )}

      {/* Modal: List New Product */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="font-serif font-bold text-xl text-stone-900">List New Crafted Product</h3>
              <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hand-Turned Khurja Ceramic Tea Jar"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category *</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MMG-CER-01"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Regular Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProduct.regularPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, regularPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sale Price (₹ optional)</label>
                  <input
                    type="number"
                    value={newProduct.salePrice || ''}
                    onChange={(e) => setNewProduct({ ...newProduct, salePrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newProduct.stockQuantity}
                    onChange={(e) => setNewProduct({ ...newProduct, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Short Description (Summary) *</label>
                <input
                  type="text"
                  required
                  placeholder="One or two sentences highlighting the craft or material"
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Elaborate on production method, craft tradition, dimensions, and care instructions..."
                  value={newProduct.fullDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, fullDescription: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Materials</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Solid Brass"
                    value={newProduct.materials}
                    onChange={(e) => setNewProduct({ ...newProduct, materials: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Verified Craft Claims</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead-Free | Hand-Hammered"
                    value={newProduct.verifiedClaims}
                    onChange={(e) => setNewProduct({ ...newProduct, verifiedClaims: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
              </div>

              {/* Product Image Selection: Device Upload vs URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-stone-700">Product Image *</label>
                  <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        imageInputMode === 'upload' ? 'bg-white shadow-xs text-amber-800' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Upload from Device
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        imageInputMode === 'url' ? 'bg-white shadow-xs text-amber-800' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Web URL
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Multi-Photo Gallery Preview */}
                {newProduct.imageUrls && newProduct.imageUrls.filter(u => u && u.trim().length > 0).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>{newProduct.imageUrls.filter(u => u && u.trim().length > 0).length} photo(s) selected</span>
                      <span className="text-[11px] text-amber-800 font-medium">★ First photo is Primary Display</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {newProduct.imageUrls.filter(u => u && u.trim().length > 0).map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-xl overflow-hidden border-2 transition ${
                            idx === 0 ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <img
                            src={url}
                            alt={`Product photo ${idx + 1}`}
                            className="w-full h-24 object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-1 left-1 bg-amber-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              ★ Primary
                            </span>
                          )}
                          <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(idx)}
                                className="p-1 bg-white hover:bg-amber-50 text-amber-800 rounded text-[10px] font-semibold transition"
                                title="Set as primary product photo"
                              >
                                Set Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded transition"
                              title="Delete this photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload or Add URL Controls */}
                {imageInputMode === 'upload' ? (
                  /* Device Multi-File Upload Dropzone */
                  <div className="relative border-2 border-dashed border-stone-300 hover:border-amber-600 rounded-2xl p-5 text-center transition bg-stone-50/50 hover:bg-amber-50/20">
                    <input
                      type="file"
                      id="device-image-file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    <label
                      htmlFor="device-image-file"
                      className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
                          <span className="text-xs font-semibold text-stone-700">Uploading photos from device...</span>
                          <span className="text-[10px] text-stone-400">Storing images securely on HOPEBI server</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-800 hover:underline">
                              Click to select multiple photos from your device
                            </span>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Select one or more photos (JPEG, PNG, WebP up to 10MB each)
                            </p>
                          </div>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  /* Web Image URL Input */
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={customImageUrlInput}
                      onChange={(e) => setCustomImageUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                      className="flex-1 p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition"
                    >
                      Add Photo
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow"
                >
                  {actionLoading ? 'Saving...' : 'Submit Product for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Dispatch Order Item */}
      {dispatchModalItem && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Dispatch Order Item</h3>
            <p className="text-xs text-stone-500">
              Confirm shipment details for <strong>{dispatchModalItem.productName}</strong>.
            </p>

            <form onSubmit={handleDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Logistics Carrier</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 bg-white"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="India Post Speed Post">India Post Speed Post</option>
                  <option value="DTDC">DTDC</option>
                  <option value="Ekart">Ekart</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Air Waybill / Tracking Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DLV123456789IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalItem(null)}
                  className="px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-xl shadow"
                >
                  {actionLoading ? 'Updating...' : 'Confirm Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
