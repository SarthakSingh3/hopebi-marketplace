import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2, CheckCircle2, Sparkles, Store, ShoppingBag } from 'lucide-react';
import { siteConfig } from '../config/siteConfig';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Environment detection: Check if app is in production mode
  const isProduction = import.meta.env.PROD;
  const isDevMode = !isProduction || import.meta.env.VITE_ENABLE_DEV_SANDBOX === 'true';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'ROLE_CUSTOMER' | 'ROLE_SELLER'>('ROLE_CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google Sign-In state
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleRole, setGoogleRole] = useState<'ROLE_CUSTOMER' | 'ROLE_SELLER'>('ROLE_CUSTOMER');

  const handleAuthSuccess = (user: { role: string }) => {
    if (user.role === 'ROLE_SELLER') {
      navigate('/seller/dashboard', { replace: true });
    } else if (user.role === 'ROLE_ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/profile', { replace: true });
    }
  };

  const handleGoogleSignIn = async (
    selectedEmail: string,
    selectedName: string,
    requestedRole: 'ROLE_CUSTOMER' | 'ROLE_SELLER' = 'ROLE_CUSTOMER',
    idToken?: string
  ) => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle({
        email: selectedEmail.trim(),
        name: selectedName.trim(),
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        idToken: idToken || ('GOOGLE_SECURE_TOKEN_' + Date.now()),
        role: requestedRole
      });
      setGoogleModalOpen(false);
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('hopebi_google_client_id') || '';

  const handleContinueWithGoogle = () => {
    setError(null);
    const effectiveClientId = googleClientId.trim();

    const google = (window as any).google;
    if (effectiveClientId && google?.accounts?.oauth2) {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: effectiveClientId,
          scope: 'email profile openid',
          error_callback: () => {
            setGoogleModalOpen(true);
          },
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setGoogleModalOpen(true);
              return;
            }
            if (tokenResponse.access_token) {
              setLoading(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await res.json();
                await handleGoogleSignIn(
                  googleProfile.email,
                  googleProfile.name,
                  role,
                  tokenResponse.access_token
                );
              } catch (fetchErr) {
                setError('Failed to fetch Google profile. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        });
        tokenClient.requestAccessToken();
        return;
      } catch (err) {
        console.warn('Google Identity Services invocation error:', err);
        setGoogleModalOpen(true);
        return;
      }
    }

    setGoogleModalOpen(true);
  };

  const cleanPhoneInput = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0') && digits.length > 10) {
      digits = digits.substring(1);
    }
    return digits.slice(0, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      setError('Please provide a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9).');
      return;
    }

    setLoading(true);
    try {
      const user = await register(fullName.trim(), email.trim(), password, phone.trim() || undefined, role);
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const serverMessage = e.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (e.response?.status === 409) {
        setError('The email address is already registered. Please sign in instead.');
      } else {
        setError(e.message || 'Registration could not be completed. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetRole: 'ROLE_CUSTOMER' | 'ROLE_SELLER') => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    if (targetRole === 'ROLE_SELLER') {
      setFullName(`Jaipur Pottery Works ${randomSuffix}`);
      setEmail(`artisan${randomSuffix}@hopebi.in`);
      setPhone(`98765${randomSuffix}`);
      setPassword('SellerPass123!');
      setConfirmPassword('SellerPass123!');
      setRole('ROLE_SELLER');
    } else {
      setFullName(`Rohan Sharma ${randomSuffix}`);
      setEmail(`buyer${randomSuffix}@example.in`);
      setPhone(`98765${randomSuffix}`);
      setPassword('CustomerPass123!');
      setConfirmPassword('CustomerPass123!');
      setRole('ROLE_CUSTOMER');
    }
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-[#fbf9f6]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-900 text-white font-serif font-black text-2xl flex items-center justify-center shadow-md">
              {siteConfig.shortName.charAt(0)}
            </span>
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-2xl tracking-tight text-stone-900 group-hover:text-amber-800 transition">
                {siteConfig.name}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-amber-700 font-semibold">
                Curated Indian B2C Marketplace
              </span>
            </div>
          </Link>
        </div>

        <h2 className="mt-5 text-center text-2xl sm:text-3xl font-serif font-bold tracking-tight text-stone-900">
          Create your account
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-stone-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-amber-800 hover:text-amber-900 hover:underline">
            Sign in to your account &rarr;
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-sm border border-stone-200/90 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-red-900">Registration Issue</p>
                <p className="text-red-700 text-xs mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Google Quick Registration (NO PASSWORDS) */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleContinueWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-stone-50 border border-stone-300 rounded-2xl text-stone-700 font-semibold text-sm transition shadow-xs hover:border-stone-400 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>1-Click Sign up with Google</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 px-1">
              <span>Zero password hassle</span>
              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                className="text-amber-800 font-medium hover:underline cursor-pointer"
              >
                Instant Google Sign-in / Demo &rarr;
              </button>
            </div>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-stone-400 font-semibold tracking-wider">
                or register with details
              </span>
            </div>
          </div>

          {/* Quick Fill Testing Helper (Development Only) */}
          {isDevMode && (
            <div className="mb-5 p-2.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
              <span className="text-stone-700 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                Quick fill test:
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('ROLE_CUSTOMER')}
                  className="text-[11px] bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-amber-900 font-semibold hover:border-amber-600 transition cursor-pointer"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ROLE_SELLER')}
                  className="text-[11px] bg-white border border-stone-200 px-2 py-0.5 rounded-lg text-emerald-900 font-semibold hover:border-emerald-600 transition cursor-pointer"
                >
                  Seller
                </button>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Account Role Selector */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
              <span className="block text-xs font-bold text-stone-800">
                I am joining HOPEBI as:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    role === 'ROLE_CUSTOMER'
                      ? 'bg-amber-50/80 border-amber-700 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_CUSTOMER"
                    checked={role === 'ROLE_CUSTOMER'}
                    onChange={() => setRole('ROLE_CUSTOMER')}
                    className="mt-0.5 text-amber-700 focus:ring-amber-500"
                  />
                  <div>
                    <p className="text-xs font-bold">🛍️ Buyer / Customer</p>
                    <p className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                      Shop direct from artisans
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                    role === 'ROLE_SELLER'
                      ? 'bg-emerald-50/80 border-emerald-700 text-emerald-950 font-bold shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ROLE_SELLER"
                    checked={role === 'ROLE_SELLER'}
                    onChange={() => setRole('ROLE_SELLER')}
                    className="mt-0.5 text-emerald-700 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="text-xs font-bold">🏢 Seller / Workshop</p>
                    <p className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                      List & sell products
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Full Name / Business Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarthak Singh"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Indian Mobile Number <span className="text-stone-400 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600 overflow-hidden bg-stone-50/40 focus-within:bg-white transition">
                <div className="px-3.5 py-2.5 bg-stone-100 border-r border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1 shrink-0 select-none">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(cleanPhoneInput(e.target.value))}
                  placeholder="98765 43210"
                  className="w-full px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-stone-400">Min. 6 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  {role === 'ROLE_SELLER' ? 'Register Seller Workshop' : 'Create Customer Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500 mb-1">Looking for Phone OTP Login?</p>
            <Link
              to="/login"
              className="text-xs font-semibold text-amber-800 hover:text-amber-900 hover:underline inline-flex items-center gap-1"
            >
              Use Indian Mobile Number OTP &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Selector Modal */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-stone-100">
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-tight">Sign up with Google</h3>
                <p className="text-xs text-stone-500">Choose an account to continue to <strong>HOPEBI</strong></p>
              </div>
            </div>

            {/* Role picker for Google signup */}
            <div className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
              <span className="block text-xs font-bold text-stone-800">
                Join with Google as:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer ${
                    googleRole === 'ROLE_CUSTOMER'
                      ? 'bg-amber-50 border-amber-700 text-amber-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="gRoleRegister"
                    value="ROLE_CUSTOMER"
                    checked={googleRole === 'ROLE_CUSTOMER'}
                    onChange={() => setGoogleRole('ROLE_CUSTOMER')}
                    className="text-amber-700 focus:ring-amber-500"
                  />
                  <span className="text-xs">🛍️ Customer</span>
                </label>

                <label
                  className={`flex items-center gap-1.5 p-2 rounded-xl border cursor-pointer ${
                    googleRole === 'ROLE_SELLER'
                      ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-bold'
                      : 'bg-white border-stone-200 text-stone-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="gRoleRegister"
                    value="ROLE_SELLER"
                    checked={googleRole === 'ROLE_SELLER'}
                    onChange={() => setGoogleRole('ROLE_SELLER')}
                    className="text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="text-xs">🏢 Seller</span>
                </label>
              </div>
            </div>

            {/* Detected Accounts List (From User Screenshot) */}
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden mb-4">
              <button
                type="button"
                onClick={() => handleGoogleSignIn('sarthakks38@gmail.com', 'Sarthak Singh', googleRole)}
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-stone-50 transition cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                  S
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 group-hover:text-blue-600 transition truncate">
                    Sarthak Singh
                  </p>
                  <p className="text-xs text-stone-500 truncate">sarthakks38@gmail.com</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    Active Account
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomGoogle(!showCustomGoogle)}
                className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-stone-50 transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-600 font-bold text-lg flex items-center justify-center shrink-0">
                  +
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-800">Use another Google account</p>
                  <p className="text-[11px] text-stone-400">Sign up with any Gmail address</p>
                </div>
              </button>
            </div>

            {/* Custom Google Email input */}
            {showCustomGoogle && (
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl mb-4 space-y-2.5 animate-in fade-in">
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <input
                  type="text"
                  placeholder="Your Full Name (optional)"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleGoogleSignIn(
                        customGoogleEmail.trim(),
                        customGoogleName.trim() || customGoogleEmail.split('@')[0],
                        googleRole
                      );
                    }
                  }}
                  disabled={!customGoogleEmail.trim() || loading}
                  className="w-full py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Continue with this Gmail
                </button>
              </div>
            )}

            <p className="text-[10px] text-stone-400 text-center leading-relaxed">
              To continue, Google will share your name, email address, language preference, and profile picture with HOPEBI. Before using this app, you can review HOPEBI's privacy policy and terms of service.
            </p>

            <div className="mt-4 pt-3 border-t border-stone-100 text-center">
              <button
                type="button"
                onClick={() => setGoogleModalOpen(false)}
                className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
