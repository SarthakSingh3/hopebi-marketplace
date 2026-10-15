import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, Scale, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-amber-800">Home</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Terms of Service</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Scale className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Legal Agreement</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
          Terms of Service & User Agreement
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Statutory terms governing marketplace interactions, artisan guild listings, transactions, and consumer protections.
        </p>
        <p className="text-[11px] text-amber-300/80 mt-4">
          Effective date: October 2026 • Governed by Information Technology Act, 2000 & Consumer Protection Act, 2019
        </p>
      </div>

      <div className="space-y-8 text-stone-700 text-sm leading-relaxed">
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or placing orders on HOPEBI (operated by HOPEBI Internet Private Limited), you confirm that you are at least 18 years of age and agree to be legally bound by these Terms of Service, our Privacy Policy, and all applicable Indian statutory guidelines.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">2. Marketplace Facilitation & The 5% Fair Guild Model</h2>
          <p>
            HOPEBI operates as a managed marketplace connecting consumers with verified Indian manufacturers, artisan guilds, and craft cooperatives. Unlike corporate platforms charging 25%–35% markups, HOPEBI operates on a transparent 5% platform commission to preserve maximum financial value for the Indian craft communities.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">3. Pricing, Taxes & Invoicing</h2>
          <p>
            All prices displayed across the catalogue are quoted in Indian Rupees (INR ₹) and are inclusive of Goods and Services Tax (GST) under Indian taxation laws. Tax invoices issued with orders reflect the GSTIN of the originating regional artisan enterprise or manufacturer guild.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">4. Geographical Indications (GI) & Intellectual Property</h2>
          <p>
            All traditional artisan designations, Geographical Indications (GI tags such as Moradabad Metal Craft, Jaipur Blue Pottery, Kashmir Pashmina, Tellicherry Pepper), photography, guild origin stories, and software design are protected intellectual property. Unauthorized commercial scraping or reproduction is strictly prohibited.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">5. Governing Law & Dispute Jurisdiction</h2>
          <p>
            These terms are governed by the laws of the Republic of India. In the event of any legal dispute arising from transactions on this platform, the competent courts at New Delhi, India shall have exclusive jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
};
export default TermsPage;
