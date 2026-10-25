import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, UtensilsCrossed, Hash, ShoppingBag, Utensils } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, timeAgo } from '../utils/dateFormatter';

export default function Orders() {
  const { orders } = useOrders();

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ClipboardList className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal">No Orders Yet</h2>
        <p className="mt-2 text-charcoal-muted">Place your first order from our delicious menu.</p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-brand-500 text-white font-semibold rounded-2xl hover:bg-brand-600 transition-colors"
        >
          <UtensilsCrossed className="w-4 h-4" />
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-charcoal">My Orders</h1>
        <p className="mt-1 text-charcoal-muted">Track your current and past orders</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white rounded-2xl border border-gray-100 p-5 card-hover group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Token Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 rounded-xl border border-brand-100">
                  <Hash className="w-4 h-4 text-brand-500" />
                  <span className="font-display font-bold text-brand-700 text-lg">{order.token}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm text-charcoal">
                  {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                </p>
                <p className="text-xs text-charcoal-muted mt-1">
                  {formatDateTime(order.createdAt)} · {timeAgo(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-muted">
                  {order.orderType === 'Parcel' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                  {order.orderType || 'Dine-in'}
                </span>
                <p className="font-display font-bold text-brand-600 text-lg">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
