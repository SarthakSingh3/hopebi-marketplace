import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  Shield,
  Lock,
  CheckCircle2,
  ArrowRight,
  Store,
  Package,
  KeyRound,
  Loader2,
  AlertCircle,
  Camera,
  Heart,
  Sparkles,
  Upload,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { addressService, AddressData } from '../services/addressService';
import { Address } from '../types';

const CURATED_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Jaipur Heritage',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'avatar-2',
    label: 'Kashmiri Weaves',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'avatar-3',
    label: 'Master Potter',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'avatar-4',
    label: 'Studio Weaver',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'avatar-5',
    label: 'Spice Harvester',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
  },
  {
    id: 'avatar-6',
    label: 'Artisan Curator',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
  }
];

export const CustomerProfilePage: React.FC = () => {
  const { user, updatePassword, updateProfile, isSeller } = useAuth();
  const { wishlistCount } = useWishlist();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newAddr, setNewAddr] = useState<AddressData>({
    recipientName: user?.fullName || '',
    phoneNumber: user?.phone || '',
    streetAddress: '',
    locality: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'HOME',
    default: false
  });

  const loadAddresses = () => {
    setLoading(true);
    addressService.getAddresses()
      .then(setAddresses)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl || undefined
      });
      setProfileSuccess('Profile details and avatar updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setAvatarUrl(dataUrl);
      try {
        await updateProfile({ avatarUrl: dataUrl });
        setProfileSuccess('Custom profile picture updated!');
        setTimeout(() => setProfileSuccess(null), 3000);
      } catch (err) {
        console.error('Failed to save avatar', err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectCuratedAvatar = async (url: string) => {
    setAvatarUrl(url);
    setAvatarModalOpen(false);
    try {
      await updateProfile({ avatarUrl: url });
      setProfileSuccess('Avatar updated successfully!');
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to save avatar', err);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addressService.createAddress(newAddr);
      setShowAddressForm(false);
      setNewAddr({
        recipientName: user?.fullName || '',
        phoneNumber: user?.phone || '',
        streetAddress: '',
        locality: '',
        city: '',
        state: '',
        pincode: '',
        landmark: '',
        addressType: 'HOME',
        default: false
      });
      loadAddresses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this delivery address?')) return;
    try {
      await addressService.deleteAddress(id);
      loadAddresses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Could not delete address.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(newPassword);
      setPasswordSuccess('Your account password has been updated. You can now use this password with your email to sign in on any device!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPasswordError(e.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Profile Overview Card with Interactive Photo Avatar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          {/* Avatar Picture with Camera Button */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.fullName}
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-serif font-black text-3xl flex items-center justify-center border-4 border-amber-400/80 shadow-md">
                {user?.fullName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Change Avatar Button */}
            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-stone-900 hover:bg-amber-600 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
              title="Change Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-stone-900">{user?.fullName}</h1>
              {user?.companyName && (
                <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  {user.companyName}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
            {user?.phone && <p className="text-xs text-stone-600 font-medium">📞 +91 {user.phone}</p>}
            {user?.bio && <p className="text-xs text-stone-600 italic mt-1 max-w-md">"{user.bio}"</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            {user?.role.replace('ROLE_', '')}
          </span>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            {user?.accountStatus}
          </span>
        </div>
      </div>

      {/* 2. Quick Account Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="p-5 bg-white border border-stone-200 rounded-2xl hover:border-amber-600 hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-900">Your Orders</p>
              <p className="text-xs text-stone-500">Track shipments & invoices</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition" />
        </Link>

        <Link
          to="/wishlist"
          className="p-5 bg-white border border-stone-200 rounded-2xl hover:border-red-400 hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-900">Saved Watchlist</p>
              <p className="text-xs text-stone-500">{wishlistCount} items bookmarked</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-red-600 transition" />
        </Link>

        <Link
          to="/catalogue"
          className="p-5 bg-white border border-stone-200 rounded-2xl hover:border-amber-600 hover:shadow-sm transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center group-hover:scale-105 transition">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-stone-900">Curated Crafts</p>
              <p className="text-xs text-stone-500">Direct regional forges</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 transition" />
        </Link>
      </div>

      {/* 3. Edit Personal Information & Bio */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center">
            <User className="w-5 h-5 mr-2 text-amber-700" /> Edit Personal Information
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Keep your profile details, contact information, and craft preferences up to date.
          </p>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                Phone Number (+91)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Craft Interests & Bio
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Enthusiast of Moradabad bell metal cookware, single-estate Assam teas, and Jaipur studio pottery."
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700 resize-none"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
            >
              {savingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Password & Account Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center">
            <KeyRound className="w-5 h-5 mr-2 text-amber-700" /> Account Password & Security
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Set or update your password. If you signed in with Google, you can set a password to sign in via email & password on any device.
          </p>
        </div>

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:border-amber-700"
              required
            />
          </div>

          <div className="sm:col-span-2 flex justify-end pt-1">
            <button
              type="submit"
              disabled={passwordLoading || !newPassword}
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Save Password
            </button>
          </div>
        </form>
      </div>

      {/* 5. Saved Addresses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-amber-700" /> Saved Delivery Addresses
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Manage your shipping destinations across India</p>
          </div>
          {!showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Address
            </button>
          )}
        </div>

        {/* Add Address Form Modal/Panel */}
        {showAddressForm && (
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm animate-in fade-in duration-200">
            <h3 className="font-bold text-sm text-stone-900 mb-4">Add New Delivery Address</h3>
            <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.recipientName}
                    onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phoneNumber}
                    onChange={(e) => setNewAddr({ ...newAddr, phoneNumber: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                    placeholder="10-digit Indian Mobile"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">Street Address / House No. *</label>
                <input
                  type="text"
                  required
                  value={newAddr.streetAddress}
                  onChange={(e) => setNewAddr({ ...newAddr, streetAddress: e.target.value })}
                  className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  placeholder="Flat, House no., Building, Company, Apartment"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">City / District *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full p-2.5 border border-stone-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                    placeholder="6 digits"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address Cards */}
        {loading ? (
          <div className="p-8 text-center text-xs text-stone-400">Loading saved addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center">
            <p className="text-xs text-stone-500">No saved addresses yet. Add an address for faster 1-click checkout.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div key={a.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-stone-900">{a.recipientName}</span>
                    <span className="text-[10px] uppercase font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                      {a.addressType}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{a.streetAddress}</p>
                  <p className="text-xs text-stone-600 mt-1 font-medium">
                    {a.city}, {a.state} - {a.pincode}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">📞 {a.phoneNumber}</p>
                </div>
                <div className="pt-3 border-t border-stone-100 mt-4 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(a.id)}
                    className="text-stone-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden File Input for Custom Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Avatar Selection Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Choose Profile Picture
              </h3>
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            {/* Option A: Upload Custom Photo */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-amber-950">Upload from Device</p>
                <p className="text-[11px] text-amber-800">JPEG, PNG or WebP</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
              </button>
            </div>

            {/* Option B: Choose Curated Indian Cultural Avatar */}
            <div>
              <p className="font-bold text-xs text-stone-800 uppercase tracking-wider mb-3">
                Or Select an Indian Heritage Avatar
              </p>
              <div className="grid grid-cols-3 gap-3">
                {CURATED_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => handleSelectCuratedAvatar(av.url)}
                    className="group p-2 rounded-2xl border border-stone-200 hover:border-amber-500 hover:shadow-md transition text-center flex flex-col items-center cursor-pointer"
                  >
                    <img
                      src={av.url}
                      alt={av.label}
                      className="w-16 h-16 rounded-full object-cover mb-2 border-2 border-transparent group-hover:border-amber-500 group-hover:scale-105 transition"
                    />
                    <span className="text-[11px] font-semibold text-stone-700 group-hover:text-amber-800">
                      {av.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
