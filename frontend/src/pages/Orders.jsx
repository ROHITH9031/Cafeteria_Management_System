import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowRight, UtensilsCrossed, Hash, ShoppingBag, Utensils, Search } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, timeAgo } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';

export default function Orders() {
  const { orders, hasMoreOrders, loadingMoreOrders, loadMoreOrders } = useOrders();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const visibleOrders = useMemo(() => {
    const search = query.trim().toLowerCase();
    return orders.filter((order) => (status === 'All' || order.status === status)
      && (!search || order.token?.toLowerCase().includes(search) || order.id?.toLowerCase().includes(search)));
  }, [orders, query, status]);

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <ClipboardList className="w-10 h-10 text-gray-300 dark:text-slate-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-charcoal dark:text-white">No Orders Yet</h2>
        <p className="mt-2 text-charcoal-muted dark:text-slate-400">Place your first order from our delicious menu.</p>
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
        <h1 className="font-display text-3xl font-bold text-charcoal dark:text-white">My Orders</h1>
        <p className="mt-1 text-charcoal-muted dark:text-slate-400">Track your current and past orders in real time</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-3 mb-5">
        <label className="relative block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by token or order ID" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-charcoal dark:text-white" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter orders by status" className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-sm text-charcoal dark:text-white">
          <option value="All">All statuses</option>
          {Object.values(ORDER_STATUSES).map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {visibleOrders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="block bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 card-hover group shadow-xs"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Token Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-500/20 rounded-xl border border-brand-100 dark:border-brand-500/30">
                  <Hash className="w-4 h-4 text-brand-500" />
                  <span className="font-display font-bold text-brand-700 dark:text-brand-300 text-lg">{order.token}</span>
                </div>
                <StatusBadge status={order.status} />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="text-sm text-charcoal dark:text-slate-200">
                  {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
                </p>
                <p className="text-xs text-charcoal-muted dark:text-slate-400 mt-1">
                  {formatDateTime(order.createdAt)} · {timeAgo(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-muted dark:text-slate-400">
                  {order.orderType === 'Parcel' ? <ShoppingBag className="w-3.5 h-3.5" /> : <Utensils className="w-3.5 h-3.5" />}
                  {order.orderType || 'Dine-in'}
                </span>
                <p className="font-display font-bold text-brand-600 dark:text-brand-400 text-lg">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visibleOrders.length === 0 && orders.length > 0 && (
        <div className="py-10 text-center text-sm text-charcoal-muted dark:text-slate-400">No loaded orders match these filters. Load older orders or change the filters.</div>
      )}
      {hasMoreOrders && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => loadMoreOrders().catch((error) => console.error('[Orders] Failed to load more orders:', error))}
            disabled={loadingMoreOrders}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-charcoal dark:text-white hover:border-brand-400 disabled:opacity-50"
          >
            {loadingMoreOrders ? 'Loading…' : 'Load older orders'}
          </button>
        </div>
      )}
    </div>
  );
}
