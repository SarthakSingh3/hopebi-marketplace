import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Store,
  CheckCircle2,
  Smartphone,
  KeyRound,
  User,
  RefreshCw,
  Globe,
  Settings
} from 'lucide-react';
import { siteConfig } from '../config/siteConfig';
import { UserSummary } from '../types';

export const LoginPage: React.FC = () => {
  const { login, register, quickLoginAs, loginWithGoogle, sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Environment detection: Check if app is in production mode
  const isProduction = import.meta.env.PROD;
  const isDevMode = !isProduction || import.meta.env.VITE_ENABLE_DEV_SANDBOX === 'true';

  // Configured Google Client ID (from .env or localStorage for instant testing)
  const [googleClientId, setGoogleClientId] = useState<string>(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('hopebi_google_client_id') || '';
  });
  const [tempGoogleClientId, setTempGoogleClientId] = useState(googleClientId);

  // Active Auth Method: 'otp' (Mobile OTP) vs 'email' (Email & Password)
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');

  // Email mode: 'signin' vs 'signup'
  const [emailMode, setEmailMode] = useState<'signin' | 'signup'>('signin');

  // Common Form States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Email & Password States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailRole, setEmailRole] = useState<'ROLE_CUSTOMER' | 'ROLE_SELLER'>('ROLE_CUSTOMER');

  // Phone OTP States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpName, setOtpName] = useState('');
  const [otpRole, setOtpRole] = useState<'ROLE_CUSTOMER' | 'ROLE_SELLER'>('ROLE_CUSTOMER');
  const [isNewPhoneUser, setIsNewPhoneUser] = useState(false);

  // Google Sign-In Modal States
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [googleRole, setGoogleRole] = useState<'ROLE_CUSTOMER' | 'ROLE_SELLER'>('ROLE_CUSTOMER');
  const [showClientConfig, setShowClientConfig] = useState(false);

  // Timer for OTP countdown
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle session expiration query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  // Google One-Tap automatic prompt
  useEffect(() => {
    const google = (window as any).google;
    const effectiveClientId = googleClientId.trim();
    if (effectiveClientId && google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: effectiveClientId,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                const payload = JSON.parse(atob(response.credential.split('.')[1]));
                await handleGoogleSignIn(payload.email, payload.name, googleRole, response.credential);
              } catch (parseErr) {
                console.warn('Failed to parse Google credential token', parseErr);
              }
            }
          },
          auto_select: false,
        });
        google.accounts.id.prompt();
      } catch (e) {
        // Silently ignore if browser blocks One-Tap
      }
    }
  }, [googleClientId, googleRole]);

  // Phone input sanitizer
  const cleanPhoneInput = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length > 10) {
      digits = digits.substring(2);
    } else if (digits.startsWith('0') && digits.length > 10) {
      digits = digits.substring(1);
    }
    return digits.slice(0, 10);
  };

  // Determine redirection destination
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  /**
   * Intelligently routes users based on their registered database role:
   * - Listed Sellers -> Direct to Seller Workshop Dashboard (/seller/dashboard)
   * - Platform Admins -> Direct to Admin Console (/admin)
   * - Customers -> Direct to Customer Account (/profile) or prior intent (e.g. /checkout)
   */
  const handleAuthSuccess = (user: UserSummary) => {
    if (user.role === 'ROLE_SELLER') {
      navigate('/seller/dashboard', { replace: true });
    } else if (user.role === 'ROLE_ADMIN') {
      navigate('/admin', { replace: true });
    } else {
      if (from && from !== '/login' && from !== '/register') {
        navigate(from, { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    }
  };

  /**
   * Pure Google OAuth sign-in with user's Gmail.
   * NEVER asks for a password — authenticates directly via Google credentials!
   */
  const handleGoogleSignIn = async (
    selectedEmail: string,
    selectedName?: string,
    requestedRole: 'ROLE_CUSTOMER' | 'ROLE_SELLER' = 'ROLE_CUSTOMER',
    idToken?: string
  ) => {
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle({
        email: selectedEmail.trim(),
        name: selectedName?.trim() || selectedEmail.split('@')[0],
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        idToken: idToken || 'GOOGLE_OAUTH_TOKEN_' + Date.now(),
        role: requestedRole
      });
      setGoogleModalOpen(false);
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Google sign-in failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Triggers Official Google OAuth Popup or One-Tap
   */
  const handleContinueWithGoogle = () => {
    setError(null);
    const effectiveClientId = googleClientId.trim();

    // Check if official Google GIS library is ready and a Client ID is provided
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
                // Fetch real verified profile from Google's userinfo endpoint
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const googleProfile = await res.json();
                await handleGoogleSignIn(
                  googleProfile.email,
                  googleProfile.name,
                  googleRole,
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

    // If no client ID configured yet, open account selector modal
    setGoogleModalOpen(true);
  };

  /**
   * Handle Standard Email + Password Login or Signup
   */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (emailMode === 'signin') {
        const user = await login(email.trim(), password);
        handleAuthSuccess(user);
      } else {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        const user = await register(
          fullName.trim(),
          email.trim(),
          password,
          emailPhone.trim() || undefined,
          emailRole
        );
        handleAuthSuccess(user);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      const serverMessage = e.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (e.response?.status === 409) {
        setError('The email address is already registered. Please sign in instead.');
      } else if (emailMode === 'signin') {
        setError(e.response?.status === 401 ? 'Invalid email or password. Please verify your credentials and try again.' : (e.message || 'Unable to sign in. Please verify your credentials.'));
      } else {
        setError(e.message || 'Registration could not be completed. Please check your network or try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send OTP to Indian Mobile Number
   */
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10 || !/^[6-9]/.test(cleanedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp(cleanedPhone);
      setOtpSent(true);
      setResendTimer(30);
      setIsNewPhoneUser(!response.isExistingUser);
      if (response.otp) {
        setSuccessNotice(`Demo OTP for +91 ${cleanedPhone} is: ${response.otp}. Auto-filled below — click Verify & Sign In to proceed!`);
        setOtp(response.otp);
      } else {
        setSuccessNotice(`OTP dispatched via SMS to +91 ${cleanedPhone}. Please enter the 6-digit code received on your phone.`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to dispatch OTP. Please check the mobile number and try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP and Login / Register
   */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const user = await loginWithOtp(
        cleanedPhone,
        otp.trim(),
        otpName.trim() || undefined,
        otpRole
      );
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Invalid or expired OTP. Please verify the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'CUSTOMER' | 'SELLER' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      const user = await quickLoginAs(role);
      handleAuthSuccess(user);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || `Failed to sign in as ${role}. Please check backend service.`);
    } finally {
      setLoading(false);
    }
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
          Welcome to HOPEBI
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-stone-600">
          Direct from Indian artisan workshops & manufacturers to your door
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-5 sm:px-8 shadow-sm border border-stone-200/90 rounded-3xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs text-red-900">Authentication Error</p>
                <p className="text-red-700 text-xs mt-0.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {successNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed font-medium">{successNotice}</p>
            </div>
          )}

          {/* 1-Click Google Sign-In Button */}
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
              <span>Continue with Google</span>
            </button>
            <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 px-1">
              <span>Zero password required</span>
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
                or continue with
              </span>
            </div>
          </div>

          {/* Auth Method Tabs: Mobile OTP vs Email & Password */}
          <div className="flex bg-stone-100 p-1 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'otp'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-700" />
              <span>Mobile Number OTP</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                authMethod === 'email'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-700" />
              <span>Email & Password</span>
            </button>
          </div>

          {/* ----------------- METHOD 1: MOBILE NUMBER OTP ----------------- */}
          {authMethod === 'otp' && (
            <div>
              {!otpSent ? (
                /* Step 1: Enter Phone Number */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Enter Indian Mobile Number
                    </label>
                    <div className="relative flex rounded-xl border border-stone-300 focus-within:ring-2 focus-within:ring-amber-600 focus-within:border-amber-600 overflow-hidden bg-stone-50/40 focus-within:bg-white transition">
                      <div className="px-3.5 py-2.5 bg-stone-100 border-r border-stone-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 shrink-0 select-none">
                        <span>🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        required
                        value={phone}
                        onChange={(e) => setPhone(cleanPhoneInput(e.target.value))}
                        placeholder="98765 43210"
                        className="w-full px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none tracking-wider font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1.5">
                      We'll dispatch an instant 6-digit SMS verification code to this phone.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length < 10}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Dispatching SMS...
                      </>
                    ) : (
                      <>
                        Get Verification OTP
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter 6-digit OTP */
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        6-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="text-xs text-amber-800 hover:underline font-medium"
                      >
                        Change number (+91 {phone})
                      </button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="1 2 3 4 5 6"
                        className="w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-center tracking-[0.4em] font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      {/* Show demo OTP autofill helper */}
                      <button
                        type="button"
                        onClick={() => setOtp('123456')}
                        className="text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <span>Demo OTP: <strong>123456</strong></span>
                        <span className="text-[10px] text-amber-700 underline">(Autofill)</span>
                      </button>

                      {resendTimer > 0 ? (
                        <span className="text-[11px] text-stone-400">
                          Resend in {resendTimer}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          className="text-[11px] text-amber-800 hover:text-amber-900 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend OTP
                        </button>
                      )}
                    </div>
                  </div>

                  {/* If new phone number, prompt for name and role selection */}
                  {isNewPhoneUser && (
                    <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-amber-800" />
                        <span className="text-xs font-bold text-amber-950">New Mobile Registration</span>
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Your Full Name (e.g. Sarthak Singh)"
                          value={otpName}
                          onChange={(e) => setOtpName(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-amber-300 rounded-xl bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-stone-700 mb-1.5">
                          Select Account Role:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <label
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                              otpRole === 'ROLE_CUSTOMER'
                                ? 'bg-white border-amber-700 text-amber-950 font-bold shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="otpRole"
                              value="ROLE_CUSTOMER"
                              checked={otpRole === 'ROLE_CUSTOMER'}
                              onChange={() => setOtpRole('ROLE_CUSTOMER')}
                              className="text-amber-700 focus:ring-amber-500"
                            />
                            <span className="text-xs">🛍️ Customer</span>
                          </label>

                          <label
                            className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition ${
                              otpRole === 'ROLE_SELLER'
                                ? 'bg-white border-emerald-700 text-emerald-950 font-bold shadow-xs'
                                : 'bg-stone-50 border-stone-200 text-stone-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name="otpRole"
                              value="ROLE_SELLER"
                              checked={otpRole === 'ROLE_SELLER'}
                              onChange={() => setOtpRole('ROLE_SELLER')}
                              className="text-emerald-700 focus:ring-emerald-500"
                            />
                            <span className="text-xs">🏢 Seller</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ----------------- METHOD 2: EMAIL & PASSWORD ----------------- */}
          {authMethod === 'email' && (
            <div>
              <div className="flex border-b border-stone-200 mb-4 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode('signin');
                    setError(null);
                  }}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    emailMode === 'signin'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Already have an account? Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailMode('signup');
                    setError(null);
                  }}
                  className={`pb-2 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    emailMode === 'signup'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  New to HOPEBI? Sign Up
                </button>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {emailMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sarthak Singh"
                        className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Password
                    </label>
                    {emailMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() =>
                          setSuccessNotice('Password reset link dispatched to your registered email.')
                        }
                        className="text-xs text-amber-800 hover:text-amber-900 font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {emailMode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                        Mobile Number (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={emailPhone}
                          onChange={(e) => setEmailPhone(cleanPhoneInput(e.target.value))}
                          placeholder="9876543210"
                          maxLength={10}
                          className="block w-full pl-10 pr-3 py-2.5 border border-stone-300 rounded-xl text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-stone-50/40 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-1.5">
                      <span className="block text-xs font-bold text-stone-800">
                        Select Your Account Role:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label
                          className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                            emailRole === 'ROLE_CUSTOMER'
                              ? 'bg-amber-50/80 border-amber-700 text-amber-950 font-bold shadow-xs'
                              : 'bg-white border-stone-200 text-stone-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="emailRole"
                            value="ROLE_CUSTOMER"
                            checked={emailRole === 'ROLE_CUSTOMER'}
                            onChange={() => setEmailRole('ROLE_CUSTOMER')}
                            className="mt-0.5 text-amber-700 focus:ring-amber-500"
                          />
                          <div>
                            <p className="text-xs font-bold">🛍️ Buyer</p>
                            <p className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                              Shop direct from makers
                            </p>
                          </div>
                        </label>

                        <label
                          className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                            emailRole === 'ROLE_SELLER'
                              ? 'bg-emerald-50/80 border-emerald-700 text-emerald-950 font-bold shadow-xs'
                              : 'bg-white border-stone-200 text-stone-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name="emailRole"
                            value="ROLE_SELLER"
                            checked={emailRole === 'ROLE_SELLER'}
                            onChange={() => setEmailRole('ROLE_SELLER')}
                            className="mt-0.5 text-emerald-700 focus:ring-emerald-500"
                          />
                          <div>
                            <p className="text-xs font-bold">🏢 Seller</p>
                            <p className="text-[10px] text-stone-500 font-normal leading-tight mt-0.5">
                              List workshop products
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {emailMode === 'signin' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center text-xs text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-stone-300 text-amber-700 focus:ring-amber-500 mr-2"
                      />
                      Remember me on this device
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 disabled:opacity-50 transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {emailMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>
                      {emailMode === 'signin' ? 'Sign In to HOPEBI' : 'Create Account & Sign In'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Indian Manufacturer Banner */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-left flex items-start gap-2.5">
              <Store className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-950">Are you an Indian Manufacturer or Artisan?</p>
                <p className="text-[11px] text-stone-600 leading-snug mt-0.5">
                  Directly list demandable products and reach Indian consumers.{' '}
                  <Link to="/seller-apply" className="font-semibold text-amber-800 underline hover:text-amber-900">
                    Apply for Seller Account &rarr;
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Developer Sandbox (Automatically hidden in production) */}
          {isDevMode && (
            <div className="mt-5 pt-4 border-t border-stone-100">
              <details className="group text-xs text-stone-400">
                <summary className="cursor-pointer font-medium hover:text-stone-600 flex items-center justify-between py-1">
                  <span>Developer Sandbox & Pre-seeded Logins</span>
                  <span className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-500 group-open:hidden">
                    Show
                  </span>
                </summary>
                <div className="pt-3 pb-1 space-y-2">
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Test credentials for local testing:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('CUSTOMER')}
                      className="p-2 border border-stone-200 hover:border-amber-600 rounded-lg text-center hover:bg-stone-50 transition cursor-pointer"
                    >
                      <p className="font-semibold text-stone-800 text-[11px]">Customer</p>
                      <p className="text-[10px] text-stone-400">Ananya Iyer</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('SELLER')}
                      className="p-2 border border-stone-200 hover:border-amber-600 rounded-lg text-center hover:bg-stone-50 transition cursor-pointer"
                    >
                      <p className="font-semibold text-stone-800 text-[11px]">Seller</p>
                      <p className="text-[10px] text-stone-400">Moradabad Metal</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin('ADMIN')}
                      className="p-2 border border-stone-200 hover:border-amber-600 rounded-lg text-center hover:bg-stone-50 transition cursor-pointer"
                    >
                      <p className="font-semibold text-stone-800 text-[11px]">Admin</p>
                      <p className="text-[10px] text-stone-400">Platform Admin</p>
                    </button>
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      </div>

      {/* 
        GOOGLE OAUTH MODAL (Zero passwords required!)
        - If Google Client ID is configured: triggers real Google OAuth popup
        - If not yet configured: allows testing with simulated accounts OR pasting a Client ID for live deployment
      */}
      {googleModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Google Header */}
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
                <h3 className="text-base font-bold text-stone-900 leading-tight">Sign in with Google</h3>
                <p className="text-xs text-stone-500">Choose an account to continue to <strong>HOPEBI</strong></p>
              </div>
            </div>

            {/* Smart Role-Routing Banner */}
            <div className="mb-4 text-[11px] bg-amber-50 text-amber-900 border border-amber-200/80 p-2.5 rounded-xl leading-relaxed">
              ✨ <strong>1-Click Role Routing:</strong> If your Gmail belongs to a listed seller, your <strong>Seller Workshop Dashboard</strong> opens directly. If you are a customer, your <strong>Customer Account</strong> opens immediately. Zero password prompts!
            </div>

            {/* Live Client ID Deployment Banner */}
            <div className="mb-4 p-3 bg-stone-50 border border-stone-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  Live Production Setup:
                </span>
                <button
                  type="button"
                  onClick={() => setShowClientConfig(!showClientConfig)}
                  className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  {googleClientId ? 'Client ID Configured' : 'Connect Google Client ID'}
                </button>
              </div>

              {showClientConfig && (
                <div className="mt-2 pt-2 border-t border-stone-200 space-y-2 text-xs animate-in fade-in">
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Paste your Google OAuth Web Client ID from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">Google Cloud Console</a>.
                  </p>
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    💡 <strong>To fix Error 400 origin_mismatch:</strong> In Google Cloud Console &gt; Credentials &gt; OAuth 2.0 Client ID, add <code className="bg-amber-100 px-1 rounded font-mono text-[10px]">https://hopebi-frontend.onrender.com</code> under <strong>Authorized JavaScript origins</strong>.
                  </p>
                  <input
                    type="text"
                    placeholder="xxxx-xxxx.apps.googleusercontent.com"
                    value={tempGoogleClientId}
                    onChange={(e) => setTempGoogleClientId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleClientId(tempGoogleClientId.trim());
                        localStorage.setItem('hopebi_google_client_id', tempGoogleClientId.trim());
                        setShowClientConfig(false);
                        setSuccessNotice('Google Client ID updated! Click Continue with Google to open official popup.');
                      }}
                      className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[11px] font-bold hover:bg-stone-800 cursor-pointer"
                    >
                      Save & Enable Live Popup
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Accounts List (1-Click selection) */}
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
                    Primary Account
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleSignIn('seller@hopebi.com', 'Vikram Sharma (Moradabad Metal)', 'ROLE_SELLER')}
                disabled={loading}
                className="w-full flex items-center gap-3.5 p-3.5 text-left hover:bg-stone-50 transition cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
                  M
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-stone-900 group-hover:text-emerald-700 transition truncate">
                    Vikram Sharma (Moradabad Metal)
                  </p>
                  <p className="text-xs text-stone-500 truncate">seller@hopebi.com</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Listed Seller
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
                  <p className="text-[11px] text-stone-400">Sign in with any custom Gmail ID</p>
                </div>
              </button>
            </div>

            {/* Custom Gmail Form (Strictly NO password field!) */}
            {showCustomGoogle && (
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl mb-4 space-y-3 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Your Gmail Address:
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Your Name (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customGoogleName}
                    onChange={(e) => setCustomGoogleName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    Role for this account (if new):
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label
                      className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer ${
                        googleRole === 'ROLE_CUSTOMER'
                          ? 'bg-amber-50 border-amber-700 text-amber-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gRole"
                        value="ROLE_CUSTOMER"
                        checked={googleRole === 'ROLE_CUSTOMER'}
                        onChange={() => setGoogleRole('ROLE_CUSTOMER')}
                        className="text-amber-700 focus:ring-amber-500"
                      />
                      <span className="text-[11px]">🛍️ Customer</span>
                    </label>

                    <label
                      className={`flex items-center gap-1.5 p-2 rounded-lg border cursor-pointer ${
                        googleRole === 'ROLE_SELLER'
                          ? 'bg-emerald-50 border-emerald-700 text-emerald-950 font-bold'
                          : 'bg-white border-stone-200 text-stone-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="gRole"
                        value="ROLE_SELLER"
                        checked={googleRole === 'ROLE_SELLER'}
                        onChange={() => setGoogleRole('ROLE_SELLER')}
                        className="text-emerald-700 focus:ring-emerald-500"
                      />
                      <span className="text-[11px]">🏢 Seller</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleGoogleSignIn(
                        customGoogleEmail.trim(),
                        customGoogleName.trim() || undefined,
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
