import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Hash, Maximize2, X, Check, Copy, Sparkles, MapPin } from 'lucide-react';

export default function OrderTokenQR({ order, isReady = false }) {
  const [qrUrl, setQrUrl] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('qr'); // 'qr' or 'token'

  const token = order?.token || 'UNKNOWN';
  const orderId = order?.id || order?._id || '';

  // Standard payload for admin counter verification
  const qrPayload = JSON.stringify({
    service: 'SRKR_CAFETERIA',
    token,
    orderId,
    customerName: order?.customerName || '',
    total: order?.totalAmount || 0,
    timestamp: order?.createdAt || new Date().toISOString(),
  });

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 1.5,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (isMounted) setQrUrl(url);
      })
      .catch((err) => {
        console.error('[OrderTokenQR] Generation error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrPayload]);

  const copyToken = () => {
    navigator.clipboard?.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-linear-to-br from-brand-500 to-brand-600 rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden shadow-xl shadow-brand-500/20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />

      {/* Top Bar / View Switcher */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-white/20 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            {isReady ? 'Order Ready for Pickup' : 'Order Pickup Token'}
          </span>
          <p className="text-xs text-white/70 mt-0.5">
            Present this QR or token code at the cafeteria counter
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="inline-flex items-center bg-black/20 p-1 rounded-xl backdrop-blur-sm border border-white/10">
          <button
            type="button"
            onClick={() => setViewMode('qr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'qr'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Pickup QR
          </button>
          <button
            type="button"
            onClick={() => setViewMode('token')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'token'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" />
            Token No
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex flex-col items-center justify-center">
        {viewMode === 'qr' ? (
          <div className="flex flex-col items-center">
            {/* Scannable QR Code Box */}
            <div className="relative group bg-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border-4 border-white/30 backdrop-blur-sm">
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt={`Pickup QR code for token ${token}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 rounded-xl object-contain"
                />
              ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center bg-gray-50 rounded-xl">
                  <span className="text-xs text-charcoal-muted font-medium">Generating QR...</span>
                </div>
              )}

              {/* Enlarge Overlay Button */}
              <button
                type="button"
                onClick={() => setFullscreen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl flex items-center justify-center gap-2 text-white font-semibold text-xs transition-opacity backdrop-blur-xs"
                title="Enlarge QR for scanning"
              >
                <Maximize2 className="w-4 h-4" />
                Tap to Enlarge
              </button>
            </div>

            {/* Token Badge underneath QR */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-white/70">Token:</span>
              <span className="font-display font-extrabold text-2xl tracking-wider text-white">
                {token}
              </span>
              <button
                type="button"
                onClick={copyToken}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors"
                title="Copy token number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="mt-2 text-xs text-white/80 text-center flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-yellow-300" />
              Cafeteria staff will scan this QR to hand over your order
            </p>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
              Token Number
            </p>
            <div className="inline-flex items-center gap-3 px-8 py-5 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-inner">
              <Hash className="w-8 h-8 text-white/90" />
              <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-wider">
                {token}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={copyToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Token'}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('qr')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-brand-700 hover:bg-gray-100 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                Show QR Code
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Enlarge Modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-90 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-gray-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-charcoal dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close enlarged QR"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
              SRKR Cafeteria Counter
            </span>
            <h3 className="font-display text-xl font-bold text-charcoal dark:text-white mt-1">
              Scan for Order Pickup
            </h3>

            <div className="mt-5 p-4 bg-white rounded-2xl border-2 border-brand-500/30 inline-block shadow-lg">
              {qrUrl && (
                <img
                  src={qrUrl}
                  alt={`Enlarged QR code for token ${token}`}
                  className="w-64 h-64 object-contain mx-auto"
                />
              )}
            </div>

            <div className="mt-4">
              <p className="font-display text-3xl font-extrabold text-charcoal dark:text-white">
                {token}
              </p>
              <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
                Order ID: #{orderId.slice(-8)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
