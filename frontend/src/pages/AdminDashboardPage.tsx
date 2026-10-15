import React, { useEffect, useState } from 'react';
import { Shield, Users, Store, Package, Check, X, Ban, DollarSign, Activity, FileText } from 'lucide-react';
import { adminService, AdminDashboardData, AuditLog } from '../services/adminService';
import { SellerProfile, Product, Order } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sellers' | 'products' | 'orders' | 'settings' | 'audit'>('overview');
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Commission settings state
  const [commissionRate, setCommissionRate] = useState<number>(5.0);
  const [commissionSaving, setCommissionSaving] = useState(false);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [dash, slrs, prods, ords, logs] = await Promise.all([
        adminService.getDashboard(),
        adminService.getAllSellers(),
        adminService.getAllProducts(),
        adminService.getAllOrders(),
        adminService.getAuditLogs()
      ]);
      setDashboard(dash);
      setSellers(slrs);
      setProducts(prods);
      setOrders(ords);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleUpdateSellerStatus = async (sellerId: number, status: string, reason?: string) => {
    try {
      await adminService.updateSellerStatus(sellerId, status, reason);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update seller status');
    }
  };

  const handleModerateProduct = async (productId: number, approvalStatus: string, pubStatus?: string) => {
    try {
      await adminService.moderateProduct(productId, approvalStatus, pubStatus);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to moderate product');
    }
  };

  const handleSaveCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommissionSaving(true);
    try {
      await adminService.updateCommissionRate(commissionRate);
      alert('Platform commission updated successfully.');
      loadAllAdminData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update commission rate');
    } finally {
      setCommissionSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-28 bg-stone-200 rounded-3xl" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-32 bg-stone-200 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Console Header */}
      <div className="bg-stone-900 text-stone-100 rounded-3xl p-6 sm:p-8 border border-stone-800 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase flex items-center">
            <Shield className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Platform Governance Console
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            HOPEBI Administration
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time management of manufacturers, listing moderations, orders, and commission settings.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-stone-200 space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'overview' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'sellers' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Sellers & Approvals ({sellers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'products' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Moderation ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'orders' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Marketplace Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'settings' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Commission Model</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition flex items-center space-x-1.5 shrink-0 ${
            activeTab === 'audit' ? 'text-amber-700 border-b-2 border-amber-700 font-bold' : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && dashboard && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Gross Merchandise Value</span>
              <p className="font-serif text-3xl font-bold text-stone-900 mt-2">₹{dashboard.grossMerchandiseValue}</p>
              <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">From verified paid orders</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Platform Commission Earned</span>
              <p className="font-serif text-3xl font-bold text-amber-700 mt-2">₹{dashboard.platformRevenue}</p>
              <span className="text-[11px] text-stone-500 mt-1 block">Configurable 5% baseline</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Customer Accounts</span>
              <p className="font-serif text-3xl font-bold text-stone-900 mt-2">{dashboard.totalCustomers}</p>
              <span className="text-[11px] text-stone-500 mt-1 block">Registered shoppers</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Manufacturers</span>
              <p className="font-serif text-3xl font-bold text-stone-900 mt-2">
                {dashboard.approvedSellers} <span className="text-sm font-normal text-amber-700">({dashboard.pendingSellers} Pending)</span>
              </p>
              <span className="text-[11px] text-stone-500 mt-1 block">Active verified workshops</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-serif font-bold text-base text-stone-900 mb-4">Orders by Status</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(dashboard.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-0">
                    <span className="font-semibold text-stone-700">{status}</span>
                    <span className="font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
              <h3 className="font-serif font-bold text-base text-stone-900 mb-4">Payments by Status</h3>
              <div className="space-y-2 text-xs">
                {Object.entries(dashboard.paymentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center py-1.5 border-b border-stone-100 last:border-0">
                    <span className="font-semibold text-stone-700">{status}</span>
                    <span className="font-bold text-stone-900 px-2 py-0.5 bg-stone-100 rounded">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Seller Approvals */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
              <tr>
                <th className="p-4">Enterprise</th>
                <th className="p-4">Location</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/50">
                  <td className="p-4">
                    <p className="font-serif font-bold text-stone-900 text-sm">{s.companyName}</p>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{s.companyDescription}</p>
                  </td>
                  <td className="p-4">{s.city}, {s.state}</td>
                  <td className="p-4">
                    <p>{s.businessEmail}</p>
                    <p className="text-[11px] text-stone-400">{s.contactPhone}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      s.sellerStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {s.sellerStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-semibold">{s.commissionRate || 5.0}%</td>
                  <td className="p-4 space-x-1.5">
                    {s.sellerStatus !== 'APPROVED' && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, 'APPROVED', 'Application verified')}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        title="Approve Seller"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {s.sellerStatus !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, 'REJECTED', 'Documents incomplete')}
                        className="p-1.5 bg-stone-600 hover:bg-stone-700 text-white rounded-lg"
                        title="Reject Application"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {s.sellerStatus !== 'SUSPENDED' && (
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, 'SUSPENDED', 'Policy breach')}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        title="Suspend Seller"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Product Moderation */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Manufacturer</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50">
                  <td className="p-4">
                    <p className="font-serif font-bold text-stone-900 text-sm">{p.name}</p>
                    <p className="text-[11px] text-stone-400 font-mono">SKU: {p.sku}</p>
                  </td>
                  <td className="p-4 font-medium text-stone-800">{p.sellerName}</td>
                  <td className="p-4 font-bold text-stone-900">₹{p.effectivePrice}</td>
                  <td className="p-4">{p.stockQuantity} units</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleModerateProduct(p.id, 'APPROVED', 'PUBLISHED')}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg"
                    >
                      Approve & Publish
                    </button>
                    <button
                      onClick={() => handleModerateProduct(p.id, 'REJECTED', 'UNPUBLISHED')}
                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-semibold text-[11px] rounded-lg"
                    >
                      Unpublish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Marketplace Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
              <tr>
                <th className="p-4">Order Number</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Total</th>
                <th className="p-4">Commission</th>
                <th className="p-4">Items Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/50">
                  <td className="p-4 font-mono font-bold text-stone-900">{o.orderNumber}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-stone-100 text-stone-800">
                      {o.orderStatus}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold uppercase ${o.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {o.paymentStatus} ({o.paymentMethod})
                    </span>
                  </td>
                  <td className="p-4 font-bold text-stone-900">₹{o.totalAmount}</td>
                  <td className="p-4 font-semibold text-amber-800">
                    ₹{((o.subtotal * 5.0) / 100).toFixed(2)}
                  </td>
                  <td className="p-4">{o.items?.length || 0} items</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Platform Commission Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm max-w-xl space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900">Platform Commission Configuration</h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            Configure the global baseline commission charged on marketplace transactions. This is automatically applied to seller orders unless a seller-specific override exists.
          </p>

          <form onSubmit={handleSaveCommission} className="space-y-4 pt-2 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Baseline Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 font-bold text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={commissionSaving}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-xl shadow"
            >
              {commissionSaving ? 'Saving...' : 'Update Platform Commission'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 6: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 text-stone-900 font-semibold border-b border-stone-200 uppercase text-[10px]">
              <tr>
                <th className="p-4">Action</th>
                <th className="p-4">Performed By</th>
                <th className="p-4">Target Entity</th>
                <th className="p-4">Details</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50/50">
                  <td className="p-4 font-bold text-stone-900">{log.action}</td>
                  <td className="p-4 font-mono text-[11px]">{log.performedBy}</td>
                  <td className="p-4">{log.entityType} #{log.entityId}</td>
                  <td className="p-4 text-stone-500">{log.details}</td>
                  <td className="p-4 text-stone-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
