import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera, X, CheckCircle2, AlertTriangle,
  Sparkles, User, Utensils, ShoppingBag,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { ORDER_STATUSES } from '../../services/orderService';

export default function AdminOrderScannerModal({
  isOpen,
  onClose,
  orders = [],
  onSelectOrder,
  onStatusChange,
}) {
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [matchedOrder, setMatchedOrder] = useState(null);
  const [unmatchedToken, setUnmatchedToken] = useState('');
  const scannerRef = useRef(null);
  const readerElementId = 'admin-order-scanner-reader';

  const handleScanSuccess = useCallback((text) => {
    let scannedToken = '';
    let scannedOrderId = '';

    try {
      const data = JSON.parse(text);
      if (data.token) scannedToken = data.token;
      if (data.orderId) scannedOrderId = data.orderId;
    } catch {
      // Plain text parsing
      scannedToken = text.trim();
    }

    // Find in orders list
    const found = orders.find(
      (o) =>
        (scannedToken && o.token?.toLowerCase() === scannedToken.toLowerCase()) ||
        (scannedOrderId && (o.id === scannedOrderId || o._id === scannedOrderId))
    );

    if (found) {
      setMatchedOrder(found);
      setUnmatchedToken('');
    } else {
      setMatchedOrder(null);
      setUnmatchedToken(scannedToken || text);
    }

    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.pause(true);
    }
  }, [orders]);

  useEffect(() => {
    if (!isOpen) return;

    let html5QrCode = null;
    let isCancelled = false;

    const startScanner = async () => {
      setCameraError('');
      setMatchedOrder(null);
      setUnmatchedToken('');

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
          () => {}
        );

        if (!isCancelled) {
          setScannerActive(true);
        }
      } catch (err) {
        console.warn('[AdminOrderScannerModal] Camera error:', err);
        if (!isCancelled) {
          setCameraError(
            err.message?.includes('Permission')
              ? 'Camera permission denied. Allow camera in your browser settings or use the test simulator below.'
              : 'Could not access camera device.'
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
    setMatchedOrder(null);
    setUnmatchedToken('');
    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch {
        // Fallback
      }
    }
  };

  const simulateScanFirstActiveOrder = () => {
    const active = orders.find(
      (o) => o.status === ORDER_STATUSES.READY || o.status === ORDER_STATUSES.PREPARING || o.status === ORDER_STATUSES.PENDING
    ) || orders[0];

    if (active) {
      handleScanSuccess(JSON.stringify({ token: active.token, orderId: active.id }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-slate-800 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-charcoal dark:text-white">
                Scan Customer Pickup QR
              </h3>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Point camera at customer's screen to verify and dispense order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-charcoal-muted dark:text-slate-400 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Result */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-4">
          {!matchedOrder && !unmatchedToken ? (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-gray-800">
              <div id={readerElementId} className="w-full h-full" />

              {scannerActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-brand-400/80 rounded-2xl relative">
                    <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-brand-400 rounded-tl-lg" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-brand-400 rounded-tr-lg" />
                    <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-brand-400 rounded-bl-lg" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-brand-400 rounded-br-lg" />
                    <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-brand-400/70 shadow-lg shadow-brand-400 animate-pulse" />
                  </div>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center bg-slate-900/95 text-white">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                  <p className="text-sm font-semibold">{cameraError}</p>
                </div>
              )}
            </div>
          ) : matchedOrder ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 animate-slide-up">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Customer Order Matched!
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-gray-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 rounded-lg font-display font-bold text-lg">
                      {matchedOrder.token}
                    </span>
                    <span className="text-xs text-charcoal-muted dark:text-slate-400">
                      #{matchedOrder.id.slice(-8)}
                    </span>
                  </div>
                  <span className="font-display font-bold text-lg text-charcoal dark:text-white">
                    {formatCurrency(matchedOrder.totalAmount)}
                  </span>
                </div>

                <div className="text-xs text-charcoal-muted dark:text-slate-400 space-y-1 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <p className="flex items-center gap-1 text-charcoal dark:text-slate-200 font-medium">
                    <User className="w-3.5 h-3.5" />
                    {matchedOrder.customerName}
                  </p>
                  <p className="flex items-center gap-1">
                    {matchedOrder.orderType === 'Parcel' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                    {matchedOrder.orderType || 'Dine-in'} · Current Status: <strong className="text-brand-600">{matchedOrder.status}</strong>
                  </p>
                  <p className="truncate">
                    Items: {matchedOrder.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {matchedOrder.status !== ORDER_STATUSES.COMPLETED && (
                  <button
                    type="button"
                    onClick={() => {
                      onStatusChange(matchedOrder.id, ORDER_STATUSES.COMPLETED);
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    Mark as Completed / Handed Over
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onSelectOrder(matchedOrder);
                    onClose();
                  }}
                  className="py-2.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  View Details
                </button>
                <button
                  type="button"
                  onClick={resumeScanning}
                  className="py-2.5 px-3 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-charcoal dark:text-white rounded-xl text-xs font-semibold hover:bg-gray-50 transition-colors"
                >
                  Scan Next
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl p-5 text-center animate-slide-up">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">
                No Matching Order Found
              </h4>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Scanned payload "{unmatchedToken}" does not correspond to any active order.
              </p>
              <button
                type="button"
                onClick={resumeScanning}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Quick Simulation Option */}
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={simulateScanFirstActiveOrder}
              className="w-full py-2 px-3 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Simulate Customer QR Scan (Active Order)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
