import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Clock, MapPin, Package, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-amber-800">Home</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Shipping & Delivery Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Truck className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Pan-India Artisan Fulfillment</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
          Shipping & Delivery Policy
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Direct regional artisan dispatches with insured packaging, tracked couriers, and zero middleman markups across all 19,000+ Indian PIN codes.
        </p>
        <p className="text-[11px] text-amber-300/80 mt-4">
          Last revised: October 2026 • Compliant with Consumer Protection (E-Commerce) Rules, 2020
        </p>
      </div>

      <div className="space-y-8 text-stone-700 text-sm leading-relaxed">
        {/* Section 1: The Artisan Direct Model */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-700" />
            1. The Direct Artisan Fulfillment Model
          </h2>
          <p>
            HOPEBI operates on a decentralized, artisan-direct model. When you purchase handcrafted brassware from Moradabad, blue pottery from Jaipur, or pashmina textiles from Kashmir, your order is inspected, packed, and dispatched directly from the respective maker's workshop or guild forge.
          </p>
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-xs text-amber-950 space-y-1">
            <p className="font-bold">Multi-Origin Shipments:</p>
            <p>
              If your cart contains items from different artisan clusters across India, they may ship in separate parcels with individual tracking numbers. You will never be charged extra shipping for split shipments.
            </p>
          </div>
        </section>

        {/* Section 2: Turnaround & Delivery Timelines */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-700" />
            2. Estimated Delivery Timelines
          </h2>
          <p>
            Each handcrafted craft undergoes a quality stamp and bespoke protective packaging before handover to our courier partners:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Metro Cities</span>
              <p className="font-serif text-xl font-black text-stone-900">3 - 5 Days</p>
              <p className="text-[11px] text-stone-500 mt-1">Delhi NCR, Mumbai, Bengaluru, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Tier 2 & 3 Hubs</span>
              <p className="font-serif text-xl font-black text-stone-900">5 - 7 Days</p>
              <p className="text-[11px] text-stone-500 mt-1">State capitals, industrial zones, district headquarters across India</p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Remote & Hill Regions</span>
              <p className="font-serif text-xl font-black text-stone-900">7 - 10 Days</p>
              <p className="text-[11px] text-stone-500 mt-1">J&K, Ladakh, North-East states, Andaman & Nicobar, Lakshadweep</p>
            </div>
          </div>
        </section>

        {/* Section 3: Shipping Rates */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            3. Transparent Shipping Rates
          </h2>
          <ul className="space-y-2.5 text-xs text-stone-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span><strong>Orders above ₹999:</strong> 100% Free Express Pan-India Delivery.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span><strong>Orders below ₹999:</strong> Flat nominal shipping fee of ₹79 per order to subsidize insured fragile transport.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span><strong>Cash on Delivery (COD):</strong> Available on orders up to ₹10,000 across serviceable PIN codes at zero additional COD fee.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Insured Fragile Packaging */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            4. Artisanal Fragile Packaging Guarantee
          </h2>
          <p>
            Pottery, brassware, and handcrafted glassware are packed using custom 5-ply honeycomb corrugated armor boxes, biodegradeable air pillows, and tamper-evident sealing tapes. In the rare event of transit damage, our 7-Day Replacement Guarantee ensures an immediate free replacement without lengthy courier disputes.
          </p>
        </section>

        {/* Section 5: Courier Partners & Tracking */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-700" />
            5. Logistics Partners & Live Tracking
          </h2>
          <p>
            HOPEBI partners with verified Indian tier-1 logistics carriers: Delhivery, BlueDart, DTDC, XpressBees, and India Post Speed Post. As soon as your order leaves the artisan's workshop, you will receive an SMS and WhatsApp update with your live tracking AWB link.
          </p>
          <div className="pt-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 px-5 py-2.5 rounded-xl transition shadow-xs"
            >
              <span>Track Your Existing Shipment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
export default ShippingPolicyPage;
