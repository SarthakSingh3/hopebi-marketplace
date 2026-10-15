import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, Truck, MapPin, ShieldCheck, Clock, Check, Sparkles, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { Order, Product } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderNumber) return;
    orderService.getOrderByNumber(orderNumber)
      .then(ord => {
        setOrder(ord);
        return productService.getFeaturedDiscoveries(6);
      })
      .then(prods => {
        setRelatedProducts(prods.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="w-16 h-16 bg-stone-200 rounded-full mx-auto mb-4" />
        <div className="h-6 bg-stone-200 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Order Not Found</h2>
        <Link to="/orders" className="mt-4 inline-block text-xs font-semibold text-amber-700 underline">
          View all your orders
        </Link>
      </div>
    );
  }

  let parsedAddress: any = null;
  try {
    parsedAddress = JSON.parse(order.shippingAddressSnapshot);
  } catch {
    parsedAddress = { streetAddress: order.shippingAddressSnapshot };
  }

  // Tracking timeline calculations
  const trackingSteps = [
    { label: 'Order Placed', desc: 'Received & routed to maker', done: true, current: order.orderStatus === 'PENDING_PAYMENT' },
    { label: 'Payment Verified', desc: order.paymentStatus === 'PAID' ? 'Secured' : 'COD / Pending', done: order.paymentStatus === 'PAID' || order.paymentMethod === 'COD', current: order.orderStatus === 'CONFIRMED' },
    { label: 'Artisan Workshop', desc: 'Crafting & packing', done: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus), current: order.orderStatus === 'PROCESSING' },
    { label: 'Dispatched in Transit', desc: 'Handed to courier', done: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus), current: order.orderStatus === 'SHIPPED' },
    { label: 'Delivered', desc: 'At your doorstep', done: order.orderStatus === 'DELIVERED', current: order.orderStatus === 'DELIVERED' }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Success Hero */}
      <div className="text-center space-y-3 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
          Order Confirmed & Verified
        </span>
        <h1 className="font-serif text-3xl font-bold text-stone-900">
          Thank you for supporting Indian makers!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
          Your order <strong className="font-mono text-stone-900">{order.orderNumber}</strong> has been received and routed directly to the respective manufacturer workshops.
        </p>

        <div className="inline-flex items-center space-x-2 bg-stone-100 px-3.5 py-1.5 rounded-full text-xs text-stone-700 mt-2">
          <span>Payment Status:</span>
          <strong className="text-emerald-700 font-bold uppercase">{order.paymentStatus}</strong>
          <span>•</span>
          <span>Method: <strong className="text-stone-900">{order.paymentMethod}</strong></span>
        </div>
      </div>

      {/* Advanced Order Tracking Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <h2 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
          <Truck className="w-4 h-4 text-amber-700" />
          Live Order Tracking Timeline
        </h2>
        <div className="relative pt-2">
          <div className="hidden sm:grid grid-cols-5 gap-2 text-center">
            {trackingSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition mb-2 shadow-xs ${
                    step.done
                      ? 'bg-emerald-600 text-white'
                      : step.current
                      ? 'bg-amber-600 text-white ring-4 ring-amber-100 animate-pulse'
                      : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {step.done ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-xs font-semibold leading-tight ${step.done || step.current ? 'text-stone-900' : 'text-stone-400'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-stone-400 mt-0.5">{step.desc}</span>
              </div>
            ))}
          </div>

          {/* Mobile view */}
          <div className="sm:hidden space-y-3">
            {trackingSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    step.done ? 'bg-emerald-600 text-white' : step.current ? 'bg-amber-600 text-white ring-2 ring-amber-100' : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  {step.done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${step.done || step.current ? 'text-stone-900' : 'text-stone-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[10px] text-stone-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order & Fulfilment Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center">
            <Package className="w-5 h-5 mr-2 text-amber-700" /> Ordered Items ({order.items.length})
          </h2>
          <span className="text-xs text-stone-500">Total: ₹{order.totalAmount}</span>
        </div>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0 text-xs">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  {item.sellerName || 'Manufacturer'}
                </span>
                <p className="font-medium text-stone-900">{item.productName}</p>
                <div className="flex items-center space-x-2 text-stone-500 mt-0.5">
                  <span>Qty: {item.quantity}</span>
                  <span>•</span>
                  <span>Unit: ₹{item.unitPrice}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold uppercase">{item.fulfilmentStatus}</span>
                </div>
              </div>
              <span className="font-bold text-stone-900 text-sm">₹{item.lineTotal}</span>
            </div>
          ))}
        </div>

        {/* Shipping Destination */}
        <div className="pt-4 border-t border-stone-100 bg-stone-50 p-4 rounded-2xl">
          <h3 className="text-xs font-bold text-stone-900 flex items-center mb-1">
            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-700" /> Shipping Destination
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            <strong>{parsedAddress.recipientName}</strong> (📞 +91 {parsedAddress.phoneNumber})<br />
            {parsedAddress.streetAddress}, {parsedAddress.locality && `${parsedAddress.locality}, `}
            {parsedAddress.city}, {parsedAddress.state} - <strong>{parsedAddress.pincode}</strong>
          </p>
        </div>
      </div>

      {/* Related Item Suggestions Upon Purchase */}
      {relatedProducts.length > 0 && (
        <div className="bg-stone-50 rounded-3xl p-6 sm:p-8 border border-stone-200/90 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Frequently Paired Regional Crafts
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900 mt-0.5">
                Complementary Discoveries for Your Order
              </h2>
            </div>
            <Link to="/catalogue" className="text-xs text-amber-800 hover:underline font-semibold hidden sm:block">
              View All Crafts &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((prod) => (
              <Link
                key={prod.id}
                to={`/product/${prod.slug}`}
                className="group bg-white rounded-2xl p-3 border border-stone-200 hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2">
                  <img
                    src={prod.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-amber-800 uppercase block truncate">
                    {prod.sellerName || 'Verified Maker'}
                  </span>
                  <h3 className="font-serif font-bold text-xs text-stone-900 group-hover:text-amber-800 transition line-clamp-2">
                    {prod.name}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-bold text-stone-900 text-xs">₹{prod.effectivePrice}</span>
                    {prod.regularPrice > prod.effectivePrice && (
                      <span className="text-[10px] text-stone-400 line-through">₹{prod.regularPrice}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Action Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-6 py-3 rounded-xl transition shadow"
        >
          <span>View All Orders & Tracking</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
        <Link
          to="/catalogue"
          className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold px-6 py-3 rounded-xl border border-stone-300 transition"
        >
          <span>Continue Shopping</span>
        </Link>
      </div>
    </div>
  );
};
