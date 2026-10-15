import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { sellerService, SellerApplicationData } from '../services/sellerService';
import { useAuth } from '../context/AuthContext';

export const SellerApplyPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SellerApplicationData>({
    companyName: '',
    companyDescription: '',
    city: '',
    state: '',
    manufacturerHeritage: '',
    contactPhone: user?.phone || '',
    businessEmail: user?.email || '',
    gstNumber: '',
    contactPersonName: user?.fullName || '',
    password: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await sellerService.apply(formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Application failed. Please inspect fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900">Application Submitted!</h2>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Your manufacturer application for <strong>{formData.companyName}</strong> has been received by HOPEBI administrators. Our curation team will review your workshop details and notify you once approved.
        </p>
        <div className="pt-4">
          <Link to="/" className="bg-stone-900 text-white text-xs font-semibold px-6 py-3 rounded-xl shadow inline-block">
            Return to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <span className="text-xs font-semibold text-amber-700 tracking-wider uppercase">Direct B2C Onboarding</span>
        <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
          Apply to Sell on HOPEBI
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
          Are you an Indian manufacturer, artisan collective, or emerging brand crafting distinctive goods? Join our curated marketplace to introduce your products directly to Indian households with a transparent baseline 5% commission.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6 text-xs">
        {/* Company Details */}
        <div className="space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            1. Enterprise & Workshop Profile
          </h2>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Company / Workshop Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Patan Kansa Craft Guild"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Workshop City *</label>
              <input
                type="text"
                required
                placeholder="e.g. Moradabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">State *</label>
              <input
                type="text"
                required
                placeholder="e.g. Uttar Pradesh"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Company Overview & Craft Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe your manufacturing process, primary raw materials, workshop capacity..."
              value={formData.companyDescription}
              onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Manufacturer Heritage / Story</label>
            <textarea
              rows={2}
              placeholder="Generations of craft heritage, regional artisan traditions, GI registrations..."
              value={formData.manufacturerHeritage}
              onChange={(e) => setFormData({ ...formData, manufacturerHeritage: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
            />
          </div>
        </div>

        {/* Contact & Verification */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h2 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
            2. Contact & Commercial Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                required
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official Contact Phone *</label>
              <input
                type="tel"
                required
                placeholder="+91 9811223344"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Business Email *</label>
              <input
                type="email"
                required
                value={formData.businessEmail}
                onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">GSTIN (Optional during MVP)</label>
              <input
                type="text"
                placeholder="09AABCM1234F1Z8"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
          </div>

          {!isAuthenticated && (
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Account Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Choose password for your seller portal login"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700"
              />
            </div>
          )}
        </div>

        {/* Agreement */}
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start space-x-3 text-stone-700">
          <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            By applying, you agree to dispatch authentic, verified Indian-made goods directly to customers upon verified payment. Platform commission defaults to 5% with zero hidden subscription costs.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition"
        >
          {submitting ? 'Submitting Application...' : 'Submit Application for Admin Review'}
        </button>
      </form>
    </div>
  );
};
