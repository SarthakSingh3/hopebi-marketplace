import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, HelpCircle } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-amber-800">Home</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Returns & Replacement Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <RefreshCw className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Customer Protection</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
          Returns, Refunds & Artisan Replacement Policy
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          7-Day doorstep replacement and refund guarantee honoring both consumer peace of mind and Indian handicraft authenticity.
        </p>
        <p className="text-[11px] text-amber-300/80 mt-4">
          Last revised: October 2026 • In accordance with Indian Consumer Protection (E-Commerce) Rules, 2020
        </p>
      </div>

      <div className="space-y-8 text-stone-700 text-sm leading-relaxed">
        {/* Section 1: 7-Day Window */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            1. 7-Day Hassle-Free Return Window
          </h2>
          <p>
            You may request a return or replacement within <strong>7 calendar days</strong> from the delivery timestamp shown on your shipment tracking. All eligible returns receive 100% free doorstep pickup by our logistics carriers.
          </p>
        </section>

        {/* Section 2: Handcrafted Character vs Actual Defects */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-700" />
            2. Understanding Handcrafted Artistry
          </h2>
          <p>
            Unlike mass factory injection molds, authentic Indian crafts are shaped individually by hand. Please note the distinction between natural artisanal uniqueness and transit defects:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-amber-700" /> Hallmarks of Authenticity (Not Defects)
              </span>
              <ul className="text-xs text-amber-950/80 space-y-1.5 list-disc pl-4">
                <li>Subtle hand-hammered texture variations in pure brass/copper</li>
                <li>Slight tonal shifts in natural botanical indigo or madder dye baths</li>
                <li>Artisanal micro-crazing or glaze pinholes in wood-fired pottery</li>
                <li>Natural grain knots in organic reclaimed teak and rosewood</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/80 space-y-2">
              <span className="text-xs font-bold text-red-900 uppercase tracking-wide flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-red-700" /> Fully Eligible for Free Replacement
              </span>
              <ul className="text-xs text-red-950/80 space-y-1.5 list-disc pl-4">
                <li>Items cracked, shattered, or severely dented during transit</li>
                <li>Severe structural or functional defect rendering craft unusable</li>
                <li>Wrong item, size, or material variation dispatched by error</li>
                <li>Missing components, lids, or accessories</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Non-Returnable Items */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            3. Non-Returnable Categories
          </h2>
          <p className="text-xs text-stone-600">
            Due to hygiene, safety, and individual artisan customization, the following cannot be returned once delivered intact:
          </p>
          <ul className="space-y-1.5 text-xs text-stone-600 list-disc pl-5">
            <li>Single-estate teas, whole spices, and edible gourmet goods once the vacuum seal has been opened</li>
            <li>Custom personalized engraved or monogrammed artisan pieces</li>
            <li>Products that show clear signs of post-delivery usage, washing, or modification</li>
          </ul>
        </section>

        {/* Section 4: Refund Process & Timeline */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            4. Refund Processing & SLA Timelines
          </h2>
          <ul className="space-y-2 text-xs text-stone-600">
            <li><strong>UPI & NetBanking:</strong> Refund credit within 24 to 48 hours following courier pickup.</li>
            <li><strong>Credit & Debit Cards:</strong> Refund reflected in credit card statement within 3 to 5 banking days.</li>
            <li><strong>Cash on Delivery (COD):</strong> Refund transferred directly to your designated bank account (via NEFT/IMPS) or UPI ID upon pickup verification.</li>
          </ul>
        </section>

        {/* Section 5: How to Initiate a Return */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            5. How to Initiate a Return
          </h2>
          <p>
            Simply visit your <strong>Orders</strong> page, locate the delivered order, click <strong>"Request Return / Replacement"</strong>, select your reason, and optionally attach a photo of the damaged piece. Our team approves return pickups within 4 hours.
          </p>
          <div className="pt-2">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 px-5 py-2.5 rounded-xl transition"
            >
              <span>Go to Your Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
export default ReturnPolicyPage;
