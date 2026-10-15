import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
  Check,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Loader2,
  FileText,
  Printer,
  Download,
  ShoppingBag,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

interface ParsedAddress {
  recipientName?: string;
  phoneNumber?: string;
  streetAddress?: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

const parseShippingAddressSnapshot = (raw?: string): ParsedAddress => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // fallback if stored as plain text
  }
  return { streetAddress: raw };
};

export const CustomerOrdersPage: React.FC = () => {
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Invoice & Reorder states
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [reorderingId, setReorderingId] = useState<number | null>(null);
  const [reorderSuccessId, setReorderSuccessId] = useState<number | null>(null);

  // Cancellation Modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    orderService.getMyOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenCancelModal = (order: Order) => {
    setCancelModalOrder(order);
    setCancelReason('Ordered by mistake');
    setCustomCancelReason('');
    setCancelError(null);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    const effectiveReason = cancelReason === 'Other' ? (customCancelReason.trim() || 'Customer requested cancellation') : cancelReason;
    setCancelling(true);
    setCancelError(null);
    try {
      await orderService.cancelOrder(cancelModalOrder.orderNumber, effectiveReason);
      setCancelModalOrder(null);
      fetchOrders();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setCancelError(e.response?.data?.message || 'Order could not be cancelled.');
    } finally {
      setCancelling(false);
    }
  };

  const handleRequestReturn = async (orderNumber: string) => {
    const reason = window.prompt('Please provide the reason for your return request:');
    if (!reason || !reason.trim()) return;
    try {
      await orderService.requestReturn(orderNumber, reason.trim());
      alert('Return request has been registered.');
      fetchOrders();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Could not process return request.');
    }
  };

  const handleBuyAgain = async (order: Order) => {
    setReorderingId(order.id);
    try {
      for (const item of order.items) {
        if (item.productId) {
          await addToCart(item.productId, item.quantity || 1);
        }
      }
      setReorderSuccessId(order.id);
      setTimeout(() => setReorderSuccessId(null), 3000);
    } catch (err) {
      console.error('Failed to reorder items', err);
    } finally {
      setReorderingId(null);
    }
  };

  interface TimelineStep {
    label: string;
    done: boolean;
    current?: boolean;
    failed?: boolean;
    desc?: string;
    reason?: string;
  }

  const getTimelineSteps = (order: Order): TimelineStep[] => {
    if (order.orderStatus === 'CANCELLED') {
      return [
        { label: 'Order Placed', done: true, failed: false, current: false, desc: 'Original order' },
        { label: 'Cancelled & Refunded', done: true, failed: true, current: true, desc: order.cancellationReason || 'Cancelled before dispatch', reason: order.cancellationReason || 'Cancelled before dispatch' }
      ];
    }

    return [
      {
        label: 'Order Placed',
        done: true,
        current: order.orderStatus === 'PENDING_PAYMENT',
        desc: 'Order routed to maker'
      },
      {
        label: 'Payment Verified',
        done: order.paymentStatus === 'PAID' || order.paymentMethod === 'COD',
        current: order.orderStatus === 'CONFIRMED',
        desc: order.paymentStatus === 'PAID' ? 'Secured' : 'COD pending delivery'
      },
      {
        label: 'Maker Workshop',
        done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
        current: order.orderStatus === 'PROCESSING',
        desc: 'Crafting & QA check'
      },
      {
        label: 'In Transit',
        done: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus),
        current: order.orderStatus === 'SHIPPED',
        desc: order.items.some(i => i.trackingNumber)
          ? `${order.items.find(i => i.trackingNumber)?.carrier}: ${order.items.find(i => i.trackingNumber)?.trackingNumber}`
          : 'Dispatched with logistics'
      },
      {
        label: 'Delivered',
        done: order.orderStatus === 'DELIVERED',
        current: order.orderStatus === 'DELIVERED',
        desc: 'At customer address'
      }
    ];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-stone-900">My Orders</h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Track production, dispatch, and delivery status directly from our partner workshops.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl h-44 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const canCancel = order.orderStatus === 'CONFIRMED' || order.orderStatus === 'PENDING_PAYMENT' || order.orderStatus === 'PROCESSING';
            const canReturn = order.orderStatus === 'DELIVERED';
            const timeline = getTimelineSteps(order);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5 transition"
              >
                {/* Header Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[11px]">Order Number</span>
                    <strong className="font-mono text-stone-900 text-sm">{order.orderNumber}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Placed On</span>
                    <span className="text-stone-700 font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Payment</span>
                    <span className={`font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[11px]">Order Status</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      order.orderStatus === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Cancelled Banner */}
                {order.orderStatus === 'CANCELLED' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      <div>
                        <p className="font-bold">Order Cancelled</p>
                        <p className="text-red-700 text-[11px]">Reason: {order.cancellationReason || 'Customer requested cancellation prior to dispatch'}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center text-[10px] bg-white border border-red-200 text-red-700 px-2.5 py-1 rounded-full font-semibold">
                      Stock Restored to Workshop
                    </span>
                  </div>
                )}

                {/* Advanced Visual Tracking Timeline */}
                {order.orderStatus !== 'CANCELLED' && (
                  <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="font-semibold text-stone-700 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-700" />
                        Live Journey
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">Direct Producer Fulfillment</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-center">
                      {timeline.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition shadow-xs ${
                              step.done
                                ? 'bg-emerald-600 text-white'
                                : step.current
                                ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                                : 'bg-stone-200 text-stone-400'
                            }`}
                          >
                            {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span className={`text-[11px] font-semibold leading-tight ${step.done || step.current ? 'text-stone-900' : 'text-stone-400'}`}>
                            {step.label}
                          </span>
                          <span className="text-[10px] text-stone-400 truncate max-w-[120px]">{step.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items in this Order with Photos */}
                <div className="space-y-3 pt-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-stone-100 last:border-0 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.productImageUrl ? (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="w-12 h-12 object-cover rounded-xl border border-stone-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-amber-800 uppercase block truncate">
                            {item.sellerName || 'Verified Manufacturer'}
                          </span>
                          <Link to={`/product/${item.productSlug}`} className="font-medium text-stone-900 text-sm hover:underline truncate block">
                            {item.productName}
                          </Link>
                          <div className="flex items-center space-x-2 text-stone-500 mt-0.5">
                            <span>Qty: {item.quantity}</span>
                            <span>•</span>
                            <span>₹{item.unitPrice} each</span>
                            {item.trackingNumber && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-medium flex items-center">
                                  <Truck className="w-3 h-3 mr-1" />
                                  {item.carrier}: {item.trackingNumber}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900 text-sm shrink-0">₹{item.lineTotal}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons & Total */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-stone-100 text-xs gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* 1. Download Tax Invoice */}
                    <button
                      type="button"
                      onClick={() => setInvoiceOrder(order)}
                      className="text-stone-700 hover:text-stone-950 font-semibold border border-stone-300 px-3 py-1.5 rounded-xl hover:bg-stone-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      <span>Download Tax Invoice</span>
                    </button>

                    {/* 2. Buy Again (1-Click Reorder) */}
                    <button
                      type="button"
                      onClick={() => handleBuyAgain(order)}
                      disabled={reorderingId === order.id}
                      className="text-amber-950 bg-amber-50 hover:bg-amber-100 font-semibold border border-amber-200 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {reorderingId === order.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                          <span>Re-adding...</span>
                        </>
                      ) : reorderSuccessId === order.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                          <span>Buy Again</span>
                        </>
                      )}
                    </button>

                    {canCancel && (
                      <button
                        onClick={() => handleOpenCancelModal(order)}
                        className="text-red-600 hover:text-red-700 font-semibold border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {canReturn && (
                      <button
                        onClick={() => handleRequestReturn(order.orderNumber)}
                        className="text-amber-800 hover:text-amber-900 font-semibold border border-amber-300 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                      >
                        Request Return / Exchange
                      </button>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-stone-500 text-xs mr-2">Grand Total:</span>
                    <span className="font-serif text-lg font-bold text-stone-900">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 space-y-4">
          <Package className="w-12 h-12 text-stone-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-stone-900">No orders placed yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Once you make your first purchase from a partner workshop, you can track production and shipment updates here.
          </p>
          <Link to="/catalogue" className="inline-block bg-amber-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow">
            Explore Curated Discoveries
          </Link>
        </div>
      )}

      {/* Cancellation Strategy Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
            <div>
              <div className="w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">Cancel Order {cancelModalOrder.orderNumber}</h3>
              <p className="text-xs text-stone-500 mt-1">
                Please tell us why you wish to cancel this order. Your cancellation will be processed immediately.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {cancelError}
              </div>
            )}

            {/* Policy Info Card */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5 text-stone-600">
              <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                HOPEBI Fair Cancellation Policy
              </p>
              <p className="text-[11px] leading-relaxed">
                • <strong>Full Refund:</strong> ₹{cancelModalOrder.totalAmount} will be refunded to your original payment method.<br />
                • <strong>Inventory Restored:</strong> Reserved handcrafted goods will be released back to the regional artisan.<br />
                • <strong>No Hidden Fees:</strong> Zero cancellation fee applies before dispatch.
              </p>
            </div>

            {/* Reason Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Reason for Cancellation</label>
              <div className="space-y-1.5">
                {[
                  'Ordered by mistake',
                  'Found alternative craft product',
                  'Expected delivery date too late',
                  'Need to modify shipping address',
                  'Other'
                ].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                      cancelReason === r ? 'border-amber-600 bg-amber-50/50 font-semibold text-amber-900' : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={cancelReason === r}
                      onChange={() => setCancelReason(r)}
                      className="accent-amber-700"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <div className="pt-2">
                  <textarea
                    rows={2}
                    placeholder="Please specify your reason..."
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                disabled={cancelling}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="px-5 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow transition flex items-center gap-1.5"
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Confirm Cancellation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Indian GST Tax Invoice Modal */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 space-y-6 my-8">
            {/* Invoice Top Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-700" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Tax Invoice • {invoiceOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInvoiceOrder(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div className="space-y-5 text-xs text-stone-800">
              {/* Header Box */}
              <div className="flex justify-between items-start border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-sm">
                      H
                    </div>
                    <span className="font-serif text-lg font-black tracking-tight text-stone-900">
                      HOPEBI Internet Pvt. Ltd.
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Heritage Craft Complex, Hauz Khas Village, New Delhi - 110016<br />
                    GSTIN: <strong className="font-mono text-stone-800">07AAACH1234F1Z8</strong> • State Code: 07-Delhi<br />
                    Email: billing@hopebi.in • Helpline: 1800-419-4673
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
                    Tax Invoice (Rule 46 CGST)
                  </span>
                  <p className="font-mono text-stone-600 text-[11px]">Invoice: INV-{invoiceOrder.orderNumber}</p>
                  <p className="text-[11px] text-stone-500">Date: {new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-700 font-bold uppercase">{invoiceOrder.paymentStatus} via {invoiceOrder.paymentMethod}</p>
                </div>
              </div>

              {/* Bill To & Ship To */}
              {(() => {
                const shipAddr = parseShippingAddressSnapshot(invoiceOrder.shippingAddressSnapshot);
                return (
                  <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    <div>
                      <span className="font-bold text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Billed & Shipped To:</span>
                      <p className="font-bold text-stone-900">{shipAddr.recipientName || 'Valued Customer'}</p>
                      <p className="text-stone-600 text-[11px] leading-relaxed">
                        {shipAddr.streetAddress}
                        {shipAddr.locality ? `, ${shipAddr.locality}` : ''}
                        {shipAddr.city ? `, ${shipAddr.city}` : ''}
                        {shipAddr.state ? `, ${shipAddr.state}` : ''}
                        {shipAddr.pincode ? ` - ${shipAddr.pincode}` : ''}
                      </p>
                      {shipAddr.phoneNumber && (
                        <p className="text-stone-500 text-[11px] mt-0.5">Phone: +91 {shipAddr.phoneNumber}</p>
                      )}
                    </div>
                    <div className="border-l border-stone-200 pl-4">
                      <span className="font-bold text-[10px] text-stone-500 uppercase tracking-wider block mb-1">Order Details:</span>
                      <p className="text-[11px]"><strong>Place of Supply:</strong> {shipAddr.state || 'India'}</p>
                      <p className="text-[11px]"><strong>Reverse Charge:</strong> No</p>
                      <p className="text-[11px]"><strong>Order ID:</strong> <span className="font-mono">{invoiceOrder.orderNumber}</span></p>
                      <p className="text-[11px] text-amber-800 font-semibold mt-1">Direct Producer Fulfillment</p>
                    </div>
                  </div>
                );
              })()}

              {/* Items Table with HSN and GST */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-stone-100/80 text-stone-600 font-semibold border-b border-stone-200">
                      <th className="p-2.5">Item & Artisan Guild</th>
                      <th className="p-2.5 text-center">HSN</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">GST (18%)</th>
                      <th className="p-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {invoiceOrder.items.map((item, idx) => {
                      const netPrice = Math.round(item.unitPrice / 1.18);
                      const taxPerItem = item.unitPrice - netPrice;
                      return (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="p-2.5">
                            <span className="font-bold text-stone-900 block">{item.productName}</span>
                            <span className="text-[10px] text-amber-800">{item.sellerName || 'Verified Guild Workshop'}</span>
                          </td>
                          <td className="p-2.5 text-center font-mono text-stone-500">741899</td>
                          <td className="p-2.5 text-center font-medium">{item.quantity}</td>
                          <td className="p-2.5 text-right">₹{netPrice}</td>
                          <td className="p-2.5 text-right text-stone-500">₹{taxPerItem * item.quantity}</td>
                          <td className="p-2.5 text-right font-bold text-stone-900">₹{item.lineTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Taxable Value:</span>
                    <span>₹{Math.round(invoiceOrder.totalAmount / 1.18)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>GST (18% inclusive):</span>
                    <span>₹{invoiceOrder.totalAmount - Math.round(invoiceOrder.totalAmount / 1.18)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pan-India Delivery:</span>
                    <span className="font-semibold text-emerald-700">FREE</span>
                  </div>
                  <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-sm text-stone-900">
                    <span>Grand Total:</span>
                    <span className="font-serif text-base text-amber-900">₹{invoiceOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Footer Declaration */}
              <div className="border-t border-stone-100 pt-4 flex items-center justify-between text-[10px] text-stone-400">
                <p>Computer generated invoice valid without physical signature under Information Technology Act, 2000.</p>
                <p className="font-semibold text-stone-600">Authorized Signatory • HOPEBI</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
