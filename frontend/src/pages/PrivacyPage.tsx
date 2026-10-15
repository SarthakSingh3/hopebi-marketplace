import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, KeyRound, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-amber-800">Home</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Privacy Policy</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Shield className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Data Privacy & Security</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
          Privacy Policy
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          How HOPEBI collects, secures, and honors customer data under India's Digital Personal Data Protection Act (DPDP Act, 2023).
        </p>
        <p className="text-[11px] text-amber-300/80 mt-4">
          Last revised: October 2026 • Strict zero-ad-broker policy
        </p>
      </div>

      <div className="space-y-8 text-stone-700 text-sm leading-relaxed">
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600" />
            1. Our Ironclad Commitment: Zero Sale of Personal Data
          </h2>
          <p>
            HOPEBI <strong>NEVER</strong> sells, leases, rents, or trades customer telephone numbers, addresses, purchase history, or email identities to third-party ad brokers, telemarketers, or affiliate data resellers. Your information is utilized strictly to fulfill your artisanal order and maintain account security.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-amber-700" />
            2. Information We Collect
          </h2>
          <ul className="space-y-2 text-xs text-stone-600 list-disc pl-5">
            <li><strong>Authentication Data:</strong> Name, verified Indian mobile phone number (via OTP), and email address.</li>
            <li><strong>Delivery Information:</strong> Pincode, locality, street address, recipient name, and dispatch instructions provided for courier logistics.</li>
            <li><strong>Transactional Data:</strong> Order line items, payment timestamps, and invoice snapshots. We do not store raw card numbers or CVV on our servers; payments are processed directly via RBI-authorized payment aggregators (e.g., Razorpay/UPI gateway).</li>
          </ul>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-700" />
            3. Data Security & Encryption Standards
          </h2>
          <p>
            All communications are encrypted end-to-end using 256-bit TLS/SSL encryption. Customer passwords utilize industry-standard multi-round bcrypt salted hashing. Database systems are hosted in ISO 27001 certified sovereign cloud infrastructure located physically within the Republic of India.
          </p>
        </section>

        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-3">
          <h2 className="font-serif text-lg font-bold text-stone-900">
            4. Your Rights Under DPDP Act 2023
          </h2>
          <p className="text-xs text-stone-600">
            You hold statutory rights to access your personal data, rectify inaccuracies, or request permanent deletion of your customer profile and saved delivery addresses. To exercise your rights, email our Data Protection Team at <span className="font-mono text-amber-800 font-semibold">privacy@hopebi.in</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
export default PrivacyPage;
