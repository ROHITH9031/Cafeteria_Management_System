import { useParams, useLocation, Link } from 'react-router-dom';
import {
  Hash, ArrowLeft, Clock,
  User, Phone, CreditCard, PartyPopper, MapPin, ShoppingBag, Utensils,
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { StatusProgress } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';

export default function OrderDetails() {
  const { orderId } = useParams();
  const { getOrderById, cancelOrder } = useOrders();
  const location = useLocation();
  const justPlaced = location.state?.justPlaced;

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Hash className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal">Order Not Found</h2>
        <p className="mt-2 text-charcoal-muted">This order doesn't exist or may have been removed.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-500 text-white font-semibold rounded-2xl hover:bg-brand-600 transition-colors"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-sm text-charcoal-muted hover:text-charcoal mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Success Banner (only shown right after placing order) */}
      {justPlaced && (
        <div className="mb-6 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-center animate-slide-up">
          <PartyPopper className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h2 className="font-display text-xl font-bold text-emerald-800">Order Placed Successfully!</h2>
          <p className="mt-1 text-sm text-emerald-600">Your order is in the kitchen queue. Show your token when it is ready.</p>
        </div>
      )}

      {/* Token Card */}
      <div className="bg-linear-to-br from-brand-500 to-brand-600 rounded-3xl p-8 text-center text-white mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative">
          <p className="text-sm font-medium text-white/70 uppercase tracking-wider mb-2">Your Token</p>
          <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
            <Hash className="w-7 h-7 text-white/80" />
            <span className="font-display text-4xl font-extrabold tracking-wider">{order.token}</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-white/70 text-sm">
            <MapPin className="w-4 h-4" />
            Show this token at the cafeteria counter
          </div>
        </div>
      </div>

      {/* Status Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-display font-bold text-charcoal mb-6">Order Status</h3>
        <StatusProgress status={order.status} />
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-display font-bold text-charcoal mb-4">Order Details</h3>

        {/* Customer Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-charcoal-muted" />
            <span className="text-charcoal-muted">Name:</span>
            <span className="font-medium text-charcoal">{order.customerName}</span>
          </div>
          {order.studentId && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="w-4 h-4 text-charcoal-muted" />
              <span className="text-charcoal-muted">Student ID:</span>
              <span className="font-medium text-charcoal">{order.studentId}</span>
            </div>
          )}
          {order.contactInfo && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-charcoal-muted" />
              <span className="text-charcoal-muted">Contact:</span>
              <span className="font-medium text-charcoal">{order.contactInfo}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-charcoal-muted" />
            <span className="text-charcoal-muted">Ordered:</span>
            <span className="font-medium text-charcoal">{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {order.orderType === 'Parcel' ? (
              <ShoppingBag className="w-4 h-4 text-charcoal-muted" />
            ) : (
              <Utensils className="w-4 h-4 text-charcoal-muted" />
            )}
            <span className="text-charcoal-muted">Serving:</span>
            <span className="font-medium text-charcoal">{order.orderType || 'Dine-in'}</span>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-charcoal font-medium">{item.name}</span>
                <span className="text-charcoal-muted ml-2">× {item.quantity}</span>
              </div>
              <span className="font-medium text-charcoal">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
          <span className="font-display font-bold text-charcoal">Total</span>
          <span className="font-display font-bold text-xl text-brand-600">{formatCurrency(order.totalAmount)}</span>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-charcoal-muted bg-gray-50 rounded-xl px-3 py-2">
          <CreditCard className="w-3.5 h-3.5" />
          Payment: Pay at Counter (Demo)
        </div>
      </div>

      {/* Cancel Order (only for Pending) */}
      {order.status === ORDER_STATUSES.PENDING && (
        <div className="text-center">
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this order?')) {
                cancelOrder(order.id);
              }
            }}
            className="px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}
