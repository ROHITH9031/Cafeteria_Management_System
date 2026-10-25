import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera, X, CheckCircle2, AlertTriangle, RefreshCw, Zap,
  Sparkles, DollarSign, Volume2, ShieldCheck,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

/**
 * Helper to extract numeric price from various scanned formats:
 * - UPI QR (e.g., upi://pay?...&am=120&...)
 * - JSON payload (e.g., {"price": 120} or {"amount": 120} or {"total": 120})
 * - Raw string / price barcode (e.g., "₹120", "Rs 120", "120.00", "ITEM-120")
 */
function parseScannedPrice(rawText) {
  if (!rawText || typeof rawText !== 'string') return null;
  const text = rawText.trim();

  // 1. Try parsing JSON
  try {
    const data = JSON.parse(text);
    if (data.price !== undefined) return Number(data.price);
    if (data.amount !== undefined) return Number(data.amount);
    if (data.total !== undefined) return Number(data.total);
    if (data.totalAmount !== undefined) return Number(data.totalAmount);
  } catch {
    // Not JSON, continue to string match
  }

  // 2. Try parsing UPI QR Code URI
  if (text.startsWith('upi://pay')) {
    try {
      const url = new URL(text);
      const am = url.searchParams.get('am');
      if (am && !Number.isNaN(Number(am))) {
        return Number(am);
      }
    } catch {
      // Fallback regex for upi query params
      const match = text.match(/[?&]am=([0-9.]+)/i);
      if (match && match[1]) return Number(match[1]);
    }
  }

  // 3. Match currency symbols like ₹, Rs, INR followed by numbers
  const currencyMatch = text.match(/(?:₹|rs\.?|inr|\$)\s*([0-9]+(?:\.[0-9]{1,2})?)/i);
  if (currencyMatch && currencyMatch[1]) {
    return Number(currencyMatch[1]);
  }

  // 4. Match plain decimal or integer (e.g. 150 or 150.00)
  const plainMatch = text.match(/\b([0-9]+(?:\.[0-9]{1,2})?)\b/);
  if (plainMatch && plainMatch[1]) {
    return Number(plainMatch[1]);
  }

  return null;
}

// Gentle Web Audio beep feedback
function playBeep(type = 'success') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.setValueAtTime(261.63, ctx.currentTime + 0.1); // C4
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // Audio context not allowed or blocked
  }
}

export default function PriceCameraScanner({ order, isOpen, onClose, onVerified }) {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannedResult, setScannedResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const readerElementId = 'price-scanner-reader';

  const expectedAmount = Number(order?.totalAmount || 0);

  const handleScanSuccess = useCallback((text) => {
    const price = parseScannedPrice(text);
    const isMatch = price !== null && Math.abs(price - expectedAmount) < 0.01;

    playBeep(isMatch ? 'success' : 'warning');

    setScannedResult({
      rawText: text,
      price,
      isMatch,
      timestamp: new Date().toLocaleTimeString(),
    });

    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.pause(true);
    }

    if (isMatch && onVerified) {
      onVerified(price);
    }
  }, [expectedAmount, onVerified]);

  // Initialize camera scanner when modal opens
  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;
    let isCancelled = false;

    const startScanner = async () => {
      setCameraError('');
      setScannedResult(null);

      try {
        html5QrCode = new Html5Qrcode(readerElementId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isCancelled) return;
            handleScanSuccess(decodedText);
          },
          () => {
            // Frame parse error - ignore standard frame miss
          }
        );

        if (!isCancelled) {
          setScannerActive(true);
        }
      } catch (err) {
        console.warn('[PriceCameraScanner] Camera start error:', err);
        if (!isCancelled) {
          setCameraError(
            err.message?.includes('Permission')
              ? 'Camera permission was denied. Please allow camera access in your browser settings or use manual simulation.'
              : 'Could not access camera device. You can simulate counter scan below.'
          );
          setScannerActive(false);
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {}).finally(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          });
        } else {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }
      }
    };
  }, [isOpen, handleScanSuccess]);

  const resumeScanning = () => {
    setScannedResult(null);
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch {
        // Fallback re-init
      }
    }
  };

  const simulateCounterScan = (priceToSimulate) => {
    const payload = `upi://pay?pa=srkr_cafeteria@upi&pn=SRKR+Cafeteria&am=${priceToSimulate}&cu=INR`;
    handleScanSuccess(payload);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    const price = parseFloat(manualInput);
    if (!Number.isNaN(price)) {
      handleScanSuccess(`MANUAL_COUNTER_PRICE:₹${price}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal dark:text-white">
                Scan Counter Price / Bill
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Order Bill: <strong className="text-brand-600 dark:text-brand-400">{formatCurrency(expectedAmount)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-charcoal-muted dark:text-slate-400 transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {!scannedResult ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-gray-800 shadow-inner">
              <div id={readerElementId} className="w-full h-full" />

              {/* Viewfinder Decorative Overlay */}
              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative">
                    <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-emerald-400/70 shadow-lg shadow-emerald-400 animate-pulse" />
                  </div>
                </div>
              )}

              {/* Camera Error / No Device Fallback */}
              {cameraError && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/95 text-white">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold">{cameraError}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    You can use the simulation or manual entry options below to test price verification.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Scanned Result Banner */
            <div className={`p-5 rounded-2xl border ${
              scannedResult.isMatch
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
            } text-center animate-slide-up`}>
              {scannedResult.isMatch ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-emerald-800 dark:text-emerald-300">
                    Price Verified & Matched!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    Scanned price exactly matches your cafeteria bill total.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-amber-500/20">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-amber-800 dark:text-amber-300">
                    Price Discrepancy Detected
                  </h4>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    The scanned counter price does not match your active order bill.
                  </p>
                </>
              )}

              {/* Price Comparison Badges */}
              <div className="mt-4 grid grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted dark:text-slate-400">
                    Scanned Price
                  </span>
                  <p className="font-display font-extrabold text-xl text-charcoal dark:text-white mt-0.5">
                    {scannedResult.price !== null ? formatCurrency(scannedResult.price) : 'Unrecognized'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-muted dark:text-slate-400">
                    Order Total
                  </span>
                  <p className="font-display font-extrabold text-xl text-brand-600 dark:text-brand-400 mt-0.5">
                    {formatCurrency(expectedAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={resumeScanning}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-charcoal dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Scan Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Confirm & Close
                </button>
              </div>
            </div>
          )}

          {/* Quick Simulation & Manual Test Controls */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-charcoal-muted dark:text-slate-400">
              <span className="font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Test Tools
              </span>
              <span>Point at counter QR or use below</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => simulateCounterScan(expectedAmount)}
                className="flex-1 py-2 px-3 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Simulate Match ({formatCurrency(expectedAmount)})
              </button>
              <button
                type="button"
                onClick={() => simulateCounterScan(expectedAmount + 30)}
                className="py-2 px-3 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-charcoal-muted dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-medium transition-colors"
                title="Test with an intentionally mismatched price"
              >
                Test Mismatch
              </button>
            </div>

            {/* Manual Price Entry Form */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted dark:text-slate-400" />
                <input
                  type="number"
                  step="any"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Or enter price printed on receipt..."
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-charcoal dark:text-white focus:outline-none focus:border-brand-400"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-charcoal dark:text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Check
              </button>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-charcoal-muted dark:text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Counter Bill Verification
          </span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-brand-500" />
            Audio Chime Enabled
          </span>
        </div>
      </div>
    </div>
  );
}
