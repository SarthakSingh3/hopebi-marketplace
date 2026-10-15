import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Plus,
  Check,
  ArrowRight,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  AlertCircle,
  Gift,
  QrCode,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressService, AddressData } from '../services/addressService';
import { orderService } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { Address, PaymentMethod } from '../types';

export const CheckoutPage: React.FC = () => {
  const { cart, appliedCoupon } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TEST_SIMULATOR');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Festive Gift Wrapping State
  const [giftWrapEnabled, setGiftWrapEnabled] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');

  // Interactive Payment states
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('gpay');
  const [upiId, setUpiId] = useState('');
  const [cardData, setCardData] = useState({
    number: '',
    name: user?.fullName || '',
    expiry: '',
    cvv: ''
  });

  // New Address form state
  const [newAddress, setNewAddress] = useState<AddressData>({
    recipientName: user?.fullName || '',
    phoneNumber: user?.phone || '',
    streetAddress: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'HOME',
    default: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    addressService.getAddresses()
      .then((addrs) => {
        setAddresses(addrs);
        if (addrs.length > 0) {
          const defaultAddr = addrs.find(a => a.default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
        } else {
          setShowNewAddressForm(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate, user]);

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await addressService.createAddress(newAddress);
      setAddresses([created, ...addresses]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save address. Check fields.');
    }
  };

  const handlePlaceOrderAndPay = async () => {
    if (!selectedAddressId) {
      setError('Please select or add a shipping address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create order on backend (server calculates authoritative totals and snapshot)
      const idempotencyKey = 'IDEM_' + Math.random().toString(36).substring(2, 14);
      const order = await orderService.checkout({
        addressId: selectedAddressId,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        idempotencyKey
      });

      // 2. If COD, order is immediately confirmed
      if (paymentMethod === 'COD') {
        navigate(`/order-confirmed/${order.orderNumber}`);
        return;
      }

      // 3. Initiate payment
      const paymentInit = await paymentService.initiate(order.orderNumber, paymentMethod);

      // 4. Verify payment via test simulation adapter
      const verifyRes = await paymentService.verify({
        orderNumber: order.orderNumber,
        providerOrderId: paymentInit.providerOrderId,
        simulateSuccess: true
      });

      if (verifyRes.verified) {
        navigate(`/order-confirmed/${order.orderNumber}`);
      } else {
        setError('Payment verification failed. Please try another payment method.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed. Please inspect order items.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-stone-900">Your bag is empty</h2>
        <p className="text-xs text-stone-500">Please add items to your cart before proceeding to checkout.</p>
        <Link to="/catalogue" className="inline-block bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl">
          Browse Products
        </Link>
      </div>
    );
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const giftWrapFee = giftWrapEnabled ? 99 : 0;
  const finalPayable = Math.max(0, cart.subtotal - discountAmount + cart.estimatedShipping + giftWrapFee);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="pb-6 border-b border-stone-200">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">Secure Checkout</h1>
        <p className="text-xs text-stone-500 mt-1">Direct fulfilment from authentic Indian manufacturers</p>
      </div>

      {error && (
        <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-xs text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Delivery Address */}
          <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-amber-700" /> 1. Delivery Address
              </h2>
              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-semibold text-amber-800 hover:text-amber-900 flex items-center"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses List */}
            {!showNewAddressForm && addresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-amber-700 bg-amber-50/30'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-stone-900">{addr.recipientName}</span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 font-semibold px-2 py-0.5 rounded uppercase">
                          {addr.addressType}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {addr.streetAddress}, {addr.locality && `${addr.locality}, `}
                        {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                      </p>
                      <p className="text-xs text-stone-500 mt-2 font-medium">📞 +91 {addr.phoneNumber}</p>
                    </div>

                    {selectedAddressId === addr.id && (
                      <span className="mt-3 text-[11px] font-bold text-amber-800 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> Deliver to this address
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleSaveAddress} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">10-Digit Mobile Number</label>
                    <input
                      type="tel"
                      required
                      pattern="^[6-9]\d{9}$"
                      placeholder="e.g. 9822334455"
                      value={newAddress.phoneNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Flat, House no., Building, Street</label>
                  <input
                    type="text"
                    required
                    value={newAddress.streetAddress}
                    onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">6-Digit PIN Code</label>
                    <input
                      type="text"
                      required
                      pattern="^[1-9][0-9]{5}$"
                      placeholder="e.g. 560038"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bengaluru"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Karnataka"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Luxury Festive Indian Gifting & Packaging (Optional) */}
          <section className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6 rounded-3xl border border-amber-200/80 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Gift className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-serif text-base font-bold text-stone-900">
                      2. Festive Luxury Gift Wrapping & Calligraphy Card
                    </h2>
                    <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      +₹99
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Individually hand-wrapped in eco-friendly handcrafted banana-fibre paper, tied with raw golden jute twine, stamped with HOPEBI's traditional wax seal, and accompanied by a custom hand-lettered message card.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={giftWrapEnabled}
                onChange={(e) => setGiftWrapEnabled(e.target.checked)}
                className="w-5 h-5 text-amber-700 rounded border-amber-300 focus:ring-amber-500 cursor-pointer mt-1 shrink-0"
              />
            </div>

            {giftWrapEnabled && (
              <div className="pt-3 border-t border-amber-200/60 space-y-3 animate-in fade-in duration-200">
                <label className="block text-xs font-semibold text-stone-800">
                  Personalized Calligraphy Card Message (Handwritten by our Guild calligraphers):
                </label>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="e.g. Wishing you abundance, joy and health on Diwali! With warmest love from the Sharma family."
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 placeholder-stone-400"
                />
                <div className="flex items-center justify-between text-[11px] text-amber-900/80">
                  <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Package invoice will have prices hidden for the recipient.
                  </span>
                  <span>{giftMessage.length}/200</span>
                </div>
              </div>
            )}
          </section>

          {/* Step 3: Payment Method */}
          <section className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center pb-3 border-b border-stone-100">
              <CreditCard className="w-5 h-5 mr-2 text-amber-700" /> 3. Payment Method
            </h2>

            <div className="space-y-3">
              {/* Test Simulator */}
              <label className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                paymentMethod === 'TEST_SIMULATOR' ? 'border-amber-700 bg-amber-50/40 shadow-xs' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="TEST_SIMULATOR"
                    checked={paymentMethod === 'TEST_SIMULATOR'}
                    onChange={() => setPaymentMethod('TEST_SIMULATOR')}
                    className="text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Development Payment Simulator</span>
                    <span className="text-[11px] text-stone-500">Instant test transaction without requiring external payment gateway credentials</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                  Test Mode
                </span>
              </label>

              {/* UPI */}
              <div className={`p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'UPI' ? 'border-amber-700 bg-amber-50/20 shadow-xs' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-700" /> UPI Instant Transfer (GPay, PhonePe, Paytm, BHIM)
                      </span>
                      <span className="text-[11px] text-stone-500">Zero surcharge instant bank transfer directly to artisan escrow</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Fastest
                  </span>
                </label>

                {paymentMethod === 'UPI' && (
                  <div className="mt-4 pt-3 border-t border-amber-200/50 space-y-3 pl-7">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'phonepe', name: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm' },
                        { id: 'bhim', name: 'BHIM UPI' },
                        { id: 'qr', name: 'Scan UPI QR' }
                      ].map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(app.id as any)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition cursor-pointer ${
                            selectedUpiApp === app.id
                              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                          }`}
                        >
                          {app.name}
                        </button>
                      ))}
                    </div>

                    {selectedUpiApp === 'qr' ? (
                      <div className="p-4 bg-white rounded-2xl border border-stone-200 text-center max-w-xs mx-auto space-y-2">
                        <div className="w-36 h-36 mx-auto bg-stone-900 p-2 rounded-xl flex items-center justify-center">
                          <div className="w-full h-full bg-white p-2 rounded-lg flex flex-col items-center justify-center border-2 border-stone-900">
                            <QrCode className="w-24 h-24 text-stone-950" />
                          </div>
                        </div>
                        <p className="text-xs font-bold text-stone-900">Scan & Pay ₹{finalPayable}</p>
                        <p className="text-[10px] text-stone-500">Scan with any UPI App • Dynamic VPA</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-stone-700">
                          Enter your UPI ID / VPA:
                        </label>
                        <div className="flex gap-2 max-w-md">
                          <input
                            type="text"
                            placeholder="e.g. mobile@upi or username@okhdfcbank"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
                          />
                          <button
                            type="button"
                            className="text-xs px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl border border-stone-200"
                          >
                            Verify VPA
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card */}
              <div className={`p-4 rounded-2xl border-2 transition ${
                paymentMethod === 'CARD' ? 'border-amber-700 bg-amber-50/20 shadow-xs' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-indigo-700" /> Credit / Debit Card (Visa, RuPay, Mastercard)
                      </span>
                      <span className="text-[11px] text-stone-500">256-bit SSL encrypted PCI-DSS compliant checkout</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-black tracking-tight text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">RuPay</span>
                    <span className="text-[10px] font-black tracking-tight text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">VISA</span>
                  </div>
                </label>

                {paymentMethod === 'CARD' && (
                  <div className="mt-4 pt-3 border-t border-amber-200/50 space-y-3 pl-7 max-w-md">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="4532 •••• •••• 8892"
                        maxLength={19}
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-700 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cash On Delivery */}
              <label className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition ${
                paymentMethod === 'COD' ? 'border-amber-700 bg-amber-50/40 shadow-xs' : 'border-stone-200 hover:border-stone-300'
              }`}>
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-amber-700 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 flex items-center">
                      <Banknote className="w-4 h-4 mr-1 text-amber-700" /> Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-stone-500">Pay cash or UPI upon delivery by the carrier courier</span>
                  </div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary & Confirmation Button */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-lg text-stone-900">Review Items ({cart.totalItemCount})</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0">
                  <div className="flex items-center space-x-2.5 truncate max-w-[200px]">
                    <img
                      src={item.primaryImageUrl || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=80&q=80'}
                      alt=""
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-medium text-stone-900 truncate">{item.productName}</p>
                      <p className="text-[10px] text-stone-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900">₹{item.lineTotal}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-3 space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{cart.subtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Pan-India Delivery</span>
                <span className="font-semibold text-stone-900">
                  {cart.estimatedShipping === 0 ? 'FREE' : `₹${cart.estimatedShipping}`}
                </span>
              </div>

              {giftWrapEnabled && (
                <div className="flex justify-between text-amber-800 font-medium">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-amber-700" /> Festive Luxury Gift Wrapping
                  </span>
                  <span>+₹99</span>
                </div>
              )}

              <div className="border-t border-stone-200 pt-2 flex justify-between text-base font-bold text-stone-900">
                <span>Total Payable</span>
                <span className="font-serif text-xl font-bold text-stone-900">
                  ₹{finalPayable}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrderAndPay}
              disabled={submitting || !selectedAddressId}
              className="w-full py-4 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center"
            >
              {submitting ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <span>Place Order & Pay ₹{finalPayable}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

            <div className="text-[11px] text-stone-400 text-center flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct regional manufacturer dispatch guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
