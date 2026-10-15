import React, { useState, useEffect } from 'react';
import {
  MapPin,
  X,
  Check,
  Navigation,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Compass
} from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPincode: string;
  currentCity: string;
  onSelectLocation: (pincode: string, city: string) => void;
}

const POPULAR_CITIES = [
  { city: 'Delhi NCR', pincode: '110001' },
  { city: 'Mumbai', pincode: '400001' },
  { city: 'Bengaluru', pincode: '560001' },
  { city: 'Jaipur', pincode: '302001' },
  { city: 'Hyderabad', pincode: '500001' },
  { city: 'Kolkata', pincode: '700001' },
  { city: 'Chennai', pincode: '600001' },
  { city: 'Ahmedabad', pincode: '380001' },
  { city: 'Pune', pincode: '411001' },
  { city: 'Lucknow', pincode: '226001' }
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentPincode,
  currentCity,
  onSelectLocation
}) => {
  const [inputPincode, setInputPincode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectStatus, setDetectStatus] = useState<string | null>(null);

  // Live PIN validation state
  const [validatingPin, setValidatingPin] = useState(false);
  const [verifiedDetails, setVerifiedDetails] = useState<{
    office: string;
    district: string;
    state: string;
  } | null>(null);

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setInputPincode('');
      setError(null);
      setDetectStatus(null);
      setVerifiedDetails(null);
    }
  }, [isOpen]);

  // Auto-verify PIN code when 6 digits are typed
  useEffect(() => {
    const clean = inputPincode.trim();
    if (clean.length === 6 && /^\d{6}$/.test(clean)) {
      let isMounted = true;
      setValidatingPin(true);
      setError(null);

      fetch(`https://api.postalpincode.in/pincode/${clean}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
            const first = data[0].PostOffice[0];
            setVerifiedDetails({
              office: first.Name,
              district: first.District,
              state: first.State
            });
          } else {
            setVerifiedDetails(null);
            setError('PIN code not found in Indian postal directory');
          }
        })
        .catch(() => {
          if (!isMounted) return;
          // Fallback heuristic if postal API fails
          setVerifiedDetails(null);
        })
        .finally(() => {
          if (isMounted) setValidatingPin(false);
        });

      return () => {
        isMounted = false;
      };
    } else {
      setVerifiedDetails(null);
      if (clean.length > 0 && clean.length < 6) {
        setError(null);
      }
    }
  }, [inputPincode]);

  if (!isOpen) return null;

  // Actual Browser GPS & IP Geolocation Fetcher
  const handleDetectCurrentLocation = async () => {
    setIsDetecting(true);
    setError(null);
    setDetectStatus('Requesting device GPS location...');

    const fallbackToIp = async () => {
      setDetectStatus('Detecting via network IP...');
      try {
        const res = await fetch('https://freeipapi.com/api/json');
        const ipData = await res.json();
        const city = ipData.cityName || ipData.regionName || 'Delhi';
        const zip = ipData.zipCode && /^\d{6}$/.test(ipData.zipCode) ? ipData.zipCode : '';

        // If IP gives latitude/longitude, reverse geocode to get exact Indian PIN
        if (!zip && ipData.latitude && ipData.longitude) {
          try {
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${ipData.latitude}&lon=${ipData.longitude}`
            );
            const revData = await revRes.json();
            const revPin = revData?.address?.postcode?.replace(/\D/g, '') || '';
            const detectedCity = revData?.address?.city || revData?.address?.state_district || city;

            if (revPin && revPin.length === 6) {
              onSelectLocation(revPin, detectedCity);
              onClose();
              return;
            }
          } catch {
            // Ignore and use city
          }
        }

        const finalPin = zip || '110001';
        onSelectLocation(finalPin, city);
        onClose();
      } catch (ipErr) {
        setError('Unable to detect location. Please enter your 6-digit PIN code.');
      } finally {
        setIsDetecting(false);
        setDetectStatus(null);
      }
    };

    if (!navigator.geolocation) {
      await fallbackToIp();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setDetectStatus('Locating your Indian postal district...');

        try {
          // 1. Reverse-geocode with OpenStreetMap Nominatim
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const osmData = await osmRes.json();
          const address = osmData?.address || {};

          let detectedPin = address.postcode ? address.postcode.replace(/\D/g, '') : '';
          let detectedCity =
            address.city ||
            address.town ||
            address.suburb ||
            address.state_district ||
            address.state ||
            'India';

          // 2. If postcode missing, try BigDataCloud reverse geocode
          if (!detectedPin || detectedPin.length !== 6) {
            try {
              const bdcRes = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const bdcData = await bdcRes.json();
              if (bdcData.postcode && /^\d{6}$/.test(bdcData.postcode.replace(/\D/g, ''))) {
                detectedPin = bdcData.postcode.replace(/\D/g, '');
              }
              if (bdcData.city || bdcData.locality) {
                detectedCity = bdcData.city || bdcData.locality;
              }
            } catch {
              // Ignore
            }
          }

          // If still no 6-digit PIN, query common city prefixes or fallback
          if (!detectedPin || detectedPin.length !== 6) {
            detectedPin = '110001';
          }

          onSelectLocation(detectedPin, detectedCity);
          onClose();
        } catch (revErr) {
          console.warn('Reverse geocode failed, falling back to IP', revErr);
          await fallbackToIp();
        } finally {
          setIsDetecting(false);
          setDetectStatus(null);
        }
      },
      async (geoError) => {
        console.warn('GPS position failed or denied, using IP fallback', geoError.message);
        await fallbackToIp();
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000
      }
    );
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputPincode.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    let detectedCity = verifiedDetails?.district || verifiedDetails?.state || 'India';
    if (!verifiedDetails) {
      if (clean.startsWith('11')) detectedCity = 'Delhi';
      else if (clean.startsWith('20')) detectedCity = 'Noida / Ghaziabad';
      else if (clean.startsWith('40')) detectedCity = 'Mumbai';
      else if (clean.startsWith('56')) detectedCity = 'Bengaluru';
      else if (clean.startsWith('30')) detectedCity = 'Jaipur';
      else if (clean.startsWith('50')) detectedCity = 'Hyderabad';
      else if (clean.startsWith('70')) detectedCity = 'Kolkata';
      else if (clean.startsWith('60')) detectedCity = 'Chennai';
      else if (clean.startsWith('38')) detectedCity = 'Ahmedabad';
      else if (clean.startsWith('41')) detectedCity = 'Pune';
      else if (clean.startsWith('22')) detectedCity = 'Lucknow';
      else if (clean.startsWith('19')) detectedCity = 'Srinagar';
      else detectedCity = `PIN ${clean}`;
    }

    onSelectLocation(clean, detectedCity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header (Amazon Slate Style) */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Choose your delivery location</h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            Select your Indian delivery address to see live dispatch times and local maker shipping fees.
          </p>

          {/* 1. ACTUAL LIVE GPS & NETWORK LOCATION FETCHER BUTTON */}
          <button
            type="button"
            onClick={handleDetectCurrentLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group border border-amber-500"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                <span>{detectStatus || 'Detecting location...'}</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 text-stone-950 group-hover:scale-110 transition-transform" />
                <span>Use My Current Location (GPS / Network)</span>
              </>
            )}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-semibold text-[10px]">
                or enter an Indian pincode
              </span>
            </div>
          </div>

          {/* 2. ENTER INDIAN PIN CODE WITH LIVE POSTAL VERIFICATION */}
          <form onSubmit={handleApply} className="space-y-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={6}
                  value={inputPincode}
                  onChange={(e) => {
                    setInputPincode(e.target.value.replace(/\D/g, ''));
                    setError(null);
                  }}
                  placeholder="e.g. 110091 or 560001"
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-wider"
                />
                {validatingPin && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
              >
                Apply
              </button>
            </div>

            {/* Postal verification indicator */}
            {verifiedDetails && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    {verifiedDetails.district}, {verifiedDetails.state}
                  </p>
                  <p className="text-[11px] text-emerald-700">
                    Post Office: {verifiedDetails.office}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-semibold text-[10px]">
                or select a major Indian city
              </span>
            </div>
          </div>

          {/* 3. QUICK METRO CITIES */}
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {POPULAR_CITIES.map((item) => {
              const isSelected = currentPincode === item.pincode;
              return (
                <button
                  key={item.pincode}
                  type="button"
                  onClick={() => {
                    onSelectLocation(item.pincode, item.city);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 text-amber-950 font-bold'
                      : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold">{item.city}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{item.pincode}</p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Current Selection Summary */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Currently delivering to:</span>
            <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
              {currentCity} ({currentPincode || 'Pan-India'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
