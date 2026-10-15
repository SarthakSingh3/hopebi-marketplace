import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Shield, MessageCircle, Send, CheckCircle2, Clock, Building2 } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const ContactGrievancePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orderNumber: '',
    topic: 'order_status',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-stone-500 mb-6 flex items-center gap-1.5">
        <Link to="/" className="hover:text-amber-800">Home</Link>
        <span>/</span>
        <span className="text-stone-900 font-semibold">Contact & Grievance Redressal</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white p-8 rounded-3xl shadow-md mb-10">
        <div className="flex items-center gap-2.5 mb-2">
          <Building2 className="w-6 h-6 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Consumer Assistance & Statutory Disclosures</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
          Contact Us & Grievance Redressal
        </h1>
        <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Reach our dedicated artisan support desk in New Delhi or access official Grievance Redressal under the Consumer Protection (E-Commerce) Rules, 2020.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Contact & Official Grievance Officer Box */}
        <div className="lg:col-span-5 space-y-6">
          {/* Direct Support Channels */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Customer Care & Concierge
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Toll-Free Helpline</p>
                  <p className="text-stone-600 font-mono mt-0.5">1800-419-4673 (1800-419-HOPE)</p>
                  <p className="text-[10px] text-stone-400">Mon - Sat: 9:30 AM – 6:30 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">WhatsApp Artisan Support</p>
                  <a
                    href="https://wa.me/919810023456?text=Hi%20HOPEBI%20Support,%20I%20have%20an%20inquiry%20regarding%20an%20artisan%20order"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline font-mono mt-0.5 block font-bold"
                  >
                    +91 98100 23456
                  </a>
                  <p className="text-[10px] text-stone-400">Instant chat assistance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Customer Support Email</p>
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-amber-800 hover:underline font-mono mt-0.5 block">
                    {siteConfig.contact.email}
                  </a>
                  <p className="text-[10px] text-stone-400">Replies within 4 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-stone-900">Registered Office</p>
                  <p className="text-stone-600 mt-0.5 leading-relaxed">
                    HOPEBI Internet Private Limited<br />
                    Heritage Craft Complex, Hauz Khas Village<br />
                    New Delhi, Delhi - 110016, India
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 font-mono">CIN: U72900DL2024PTC398214</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Grievance Redressal Officer (Mandatory Under Consumer Protection Rules 2020) */}
          <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-700" />
              <h3 className="font-serif text-sm font-bold text-amber-950 uppercase tracking-wide">
                Nodal Grievance Officer
              </h3>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              In accordance with Rule 5(9) of the Consumer Protection (E-Commerce) Rules, 2020, the contact details of the official Grievance Officer are published below:
            </p>
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 text-xs space-y-1.5 text-stone-700">
              <p><strong>Name:</strong> Shri Vikramaditya Sen</p>
              <p><strong>Designation:</strong> Head of Consumer Protection & Guild Compliance</p>
              <p><strong>Email:</strong> <a href="mailto:grievance-officer@hopebi.in" className="text-amber-800 underline font-mono font-bold">grievance-officer@hopebi.in</a></p>
              <p><strong>Postal Address:</strong> Grievance Cell, HOPEBI Internet Pvt. Ltd., Hauz Khas Village, New Delhi - 110016</p>
              <p className="text-[11px] text-stone-500 pt-1">
                <strong>Statutory SLA:</strong> Acknowledged within 48 hours; resolved within 30 days of receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Send Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-stone-900 mb-2">
              Send an Inquiry or Feedback
            </h2>
            <p className="text-xs text-stone-500 mb-6">
              Our craft concierges will respond to your query directly.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-emerald-950">Inquiry Received</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. Your ticket has been logged with ticket ID <span className="font-mono font-bold">TKT-{Math.floor(100000 + Math.random() * 900000)}</span>. Our artisan support desk will respond to <strong>{formData.email}</strong> within 4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: '', email: '', phone: '', orderNumber: '', topic: 'order_status', message: '' });
                  }}
                  className="mt-4 text-xs font-bold text-amber-800 hover:underline cursor-pointer"
                >
                  Submit another inquiry →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Iyer"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ananya@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Mobile Phone (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+91 98223 34455"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Order Number (If applicable)</label>
                    <input
                      type="text"
                      placeholder="e.g. ORD-202610-1001"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Inquiry Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900 bg-white"
                  >
                    <option value="order_status">Order Status & Delivery Tracking</option>
                    <option value="artisan_inquiry">Custom Artisan Craft / Bulk Gifting</option>
                    <option value="transit_damage">Damaged or Defective Item Received</option>
                    <option value="seller_guild">Artisan Maker Guild Application</option>
                    <option value="grievance">Formal Consumer Grievance</option>
                    <option value="other">Other Question</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Message *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Please describe your query in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-700 text-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry to Guild Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ContactGrievancePage;
