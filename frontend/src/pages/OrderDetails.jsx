import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Hash, ArrowLeft, Clock,
  User, Phone, CreditCard, PartyPopper, ShoppingBag, Utensils,
  AlertCircle, Loader2, Sparkles, Camera, CheckCircle2,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { StatusProgress } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';
import { joinOrderRoom, leaveOrderRoom, socket } from '../services/socketService';
import OrderTokenQR from '../components/common/OrderTokenQR';
import PriceCameraScanner from '../components/common/PriceCameraScanner';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { getOrderById, fetchOrderById, cancelOrder, socketConnected } = useOrders();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const order = getOrderById(orderId);
  const [loading, setLoading] = useState(() => !order);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [verifiedPrice, setVerifiedPrice] = useState(null);

  // Initial fetch if order not found in memory
  useEffect(() => {
    let isMounted = true;
    if (!order && orderId) {
      fetchOrderById(orderId)
        .catch((err) => console.warn('[OrderDetails] Fetch failed:', err))
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [orderId, order, fetchOrderById]);

  // Join dedicated WebSocket room for this order
  useEffect(() => {
    if (!orderId) return;

    joinOrderRoom(orderId);

    const handleSocketUpdate = (updatedOrder) => {
      if (updatedOrder && (updatedOrder._id === orderId || updatedOrder.id === orderId)) {
        fetchOrderById(orderId);
      }
    };

    socket.on('order:status_updated', handleSocketUpdate);

    return () => {
      leaveOrderRoom(orderId);
      socket.off('order:status_updated', handleSocketUpdate);
    };
  }, [orderId, fetchOrderById]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    setCancelling(true);
    setCancelError('');
    try {
      await cancelOrder(order.id);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
        <p className="text-sm text-charcoal-muted dark:text-slate-400 font-medium">Loading your order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Hash className="w-10 h-10 text-gray-300 dark:text-slate-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal dark:text-white">Order Not Found</h2>
        <p className="mt-2 text-charcoal-muted dark:text-slate-400">This order doesn't exist or may have been removed.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-500 text-white font-semibold rounded-2xl hover:bg-brand-600 transition-colors"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  const isReady = order.status === ORDER_STATUSES.READY;
  const isCompleted = order.status === ORDER_STATUSES.COMPLETED || order.status === ORDER_STATUSES.DELIVERED;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Ready Alert Banner */}
      {isReady && (
        <div className="mb-6 bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/20 animate-bounce">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
          <h2 className="font-display text-2xl font-extrabold">Your Order is Ready for Pickup!</h2>
          <p className="mt-1 text-sm text-emerald-100">
            Please proceed to the cafeteria counter and present your QR code or token <strong>{order.token}</strong>.
          </p>
        </div>
      )}

      {/* Success Banner (only shown right after placing order) */}
      {justPlaced && !isReady && !isCompleted && (
        <div className="mb-6 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center animate-slide-up">
          <PartyPopper className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-emerald-800 dark:text-emerald-300">Order Placed Successfully!</h2>
          <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">Your order is in the kitchen queue. Show your QR token when it is ready.</p>
        </div>
      )}

      {/* Token Card Changed to Scannable QR Component */}
      <OrderTokenQR order={order} isReady={isReady} />

      {/* Camera Price Scanner Callout (Enabled when Order reaches Complete State) */}
      {isCompleted && (
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-3xl p-6 sm:p-7 mb-6 shadow-xl shadow-indigo-600/15 relative overflow-hidden animate-slide-up">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_70%)] pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wide uppercase">
                <Camera className="w-3.5 h-3.5 text-blue-200" />
                Order Completed · Camera Price Scanner
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold">
                Scan & Verify Counter Price
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 max-w-md">
                Enable your camera to scan the cafeteria counter price tag or printed receipt and verify settlement against your total ({formatCurrency(order.totalAmount)}).
              </p>
              {verifiedPrice !== null && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 rounded-xl text-xs font-semibold mt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  Verified at {formatCurrency(verifiedPrice)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-indigo-700 font-bold text-sm shadow-lg hover:bg-blue-50 transition-all hover:scale-102 shrink-0"
            >
              <Camera className="w-4.5 h-4.5 text-indigo-600" />
              {verifiedPrice !== null ? 'Scan Again' : 'Enable Camera to Scan'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Price Scanner */}
      <PriceCameraScanner
        order={order}
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onVerified={(price) => setVerifiedPrice(price)}
      />

      {/* Status Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-charcoal dark:text-white">Order Status</h3>
          <span className="text-xs text-charcoal-muted dark:text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            {socketConnected ? 'Live persistent connection' : 'Reconnecting...'}
          </span>
        </div>
        <StatusProgress status={order.status} />
      </div>

      {/* Order Details */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 mb-6 shadow-sm">
        <h3 className="font-display font-bold text-charcoal dark:text-white mb-4">Order Details</h3>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 pb-5 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
            <span className="text-charcoal-muted dark:text-slate-400">Name:</span>
            <span className="font-medium text-charcoal dark:text-white">{order.customerName}</span>
          </div>
          {order.studentId && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
              <span className="text-charcoal-muted dark:text-slate-400">Student ID:</span>
              <span className="font-medium text-charcoal dark:text-white">{order.studentId}</span>
            </div>
          )}
          {order.contactInfo && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
              <span className="text-charcoal-muted dark:text-slate-400">Contact:</span>
              <span className="font-medium text-charcoal dark:text-white">{order.contactInfo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
            <span className="text-charcoal-muted dark:text-slate-400">Ordered:</span>
            <span className="font-medium text-charcoal dark:text-white">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {order.orderType === 'Parcel' ? (
              <ShoppingBag className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
            ) : (
              <Utensils className="w-4 h-4 text-charcoal-muted dark:text-slate-400" />
            )}
            <span className="text-charcoal-muted dark:text-slate-400">Serving:</span>
            <span className="font-medium text-charcoal dark:text-white">{order.orderType || 'Dine-in'}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-charcoal dark:text-slate-200 font-medium">{item.name}</span>
                <span className="text-charcoal-muted dark:text-slate-400 ml-2">× {item.quantity}</span>
              </div>
              <span className="font-medium text-charcoal dark:text-slate-200">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 mt-4 pt-4 flex items-center justify-between">
          <span className="font-display font-bold text-charcoal dark:text-white">Total</span>
          <span className="font-display font-bold text-xl text-brand-600 dark:text-brand-400">{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-charcoal-muted dark:text-slate-400 bg-gray-50 dark:bg-slate-800/60 rounded-xl px-3 py-2">
          <CreditCard className="w-3.5 h-3.5" />
          Payment: Pay at Counter (Demo)
        </div>
      </div>

      {cancelError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {cancelError}
        </div>
      )}

      {/* Cancel Order (only for Pending) */}
      {order.status === ORDER_STATUSES.PENDING && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-6 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900 transition-colors disabled:opacity-50"
          >
            {cancelling ? 'Cancelling order...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}
