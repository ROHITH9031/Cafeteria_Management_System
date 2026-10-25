import { useMemo, useState } from 'react';
import {
  Search, SlidersHorizontal, Eye, ChevronDown, Clock, UserRound,
  Hash, PackageCheck, XCircle, ArrowRight, UtensilsCrossed,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';

const statusOptions = ['All', ...Object.values(ORDER_STATUSES)];

const nextStatus = {
  [ORDER_STATUSES.PENDING]: ORDER_STATUSES.PREPARING,
  [ORDER_STATUSES.PREPARING]: ORDER_STATUSES.READY,
  [ORDER_STATUSES.READY]: ORDER_STATUSES.COMPLETED,
  [ORDER_STATUSES.COMPLETED]: ORDER_STATUSES.DELIVERED,
};

export default function AdminOrders() {
  const { orders, updateStatus } = useOrders();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return [...orders]
      .filter((order) => status === 'All' || order.status === status)
      .filter((order) => !normalizedQuery
        || order.token.toLowerCase().includes(normalizedQuery)
        || order.customerName.toLowerCase().includes(normalizedQuery)
        || order.id.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => sort === 'oldest'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, query, status, sort]);

  const activeCount = orders.filter((order) =>
    [ORDER_STATUSES.PENDING, ORDER_STATUSES.PREPARING, ORDER_STATUSES.READY].includes(order.status)
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Operations</p>
            <h1 className="font-display text-3xl font-bold text-charcoal mt-1">Order Management</h1>
            <p className="text-sm text-charcoal-muted mt-1">{activeCount} active order{activeCount !== 1 ? 's' : ''} need attention</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-medium text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            Live demo queue
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-3 mb-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search token, customer, or order ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted pointer-events-none" />
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="appearance-none pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  {statusOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted pointer-events-none" />
              </div>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 px-5 py-16 sm:py-20 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-5">
              <PackageCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-semibold text-charcoal">
              {orders.length === 0 ? 'Your order queue is clear' : 'No matching orders'}
            </h2>
            <p className="text-sm text-charcoal-muted mt-2 max-w-sm mx-auto">
              {orders.length === 0
                ? 'Orders placed from the customer menu will appear here for preparation and collection tracking.'
                : 'Try clearing the search or selecting a different status filter.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              {orders.length === 0 ? (
                <Link to="/menu" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600">
                  <UtensilsCrossed className="w-4 h-4" />
                  Open customer menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button onClick={() => { setQuery(''); setStatus('All'); }} className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600">
                  Clear filters
                </button>
              )}
              <Link to="/admin/menu" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-charcoal-muted text-sm font-semibold hover:border-brand-200 hover:text-brand-600">
                Manage menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={updateStatus} onView={setSelectedOrder} />
            ))}
          </div>
        )}
      </div>
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
}

function OrderCard({ order, onStatusChange, onView }) {
  const upcomingStatus = nextStatus[order.status];
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  return (
    <article className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex items-center gap-3 xl:w-52 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
            <Hash className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-lg font-display font-bold text-brand-700">{order.token}</p>
            <p className="text-[11px] text-charcoal-muted">#{order.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="font-semibold text-charcoal flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-charcoal-muted" />{order.customerName}</p>
            <p className="text-xs text-charcoal-muted flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDateTime(order.createdAt)}</p>
          </div>
          <p className="text-sm text-charcoal-muted mt-1 truncate">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
        </div>
        <div className="flex items-center justify-between xl:justify-end gap-4">
          <div className="text-left xl:text-right">
            <p className="font-display font-bold text-charcoal">{formatCurrency(order.totalAmount)}</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onView(order)} className="p-2.5 rounded-xl border border-gray-200 text-charcoal-muted hover:text-brand-600 hover:border-brand-200" aria-label="View order details"><Eye className="w-4 h-4" /></button>
            {upcomingStatus && (
              <button onClick={() => onStatusChange(order.id, upcomingStatus)} className="px-3 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600">
                Mark {upcomingStatus}
              </button>
            )}
            {isCancelled && <XCircle className="w-5 h-5 text-red-400" aria-label="Cancelled" />}
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderDetailsModal({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close order details" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-5">
          <div><p className="text-xs uppercase tracking-widest text-brand-600 font-semibold">Order details</p><h2 className="font-display text-2xl font-bold text-charcoal mt-1">{order.token}</h2></div>
          <button onClick={onClose} className="text-sm text-charcoal-muted hover:text-charcoal">Close</button>
        </div>
        <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-5"><span className="text-sm text-charcoal-muted">Current status</span><StatusBadge status={order.status} /></div>
        <div className="space-y-3 mb-5">
          {order.items.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.name} <span className="text-charcoal-muted">× {item.quantity}</span></span><span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span></div>)}
        </div>
        <div className="border-t border-gray-100 pt-4 flex justify-between font-display font-bold"><span>Total</span><span className="text-brand-600">{formatCurrency(order.totalAmount)}</span></div>
        <div className="mt-5 text-xs text-charcoal-muted space-y-1"><p>Customer: {order.customerName}</p><p>Order ID: {order.id}</p><p>Placed: {formatDateTime(order.createdAt)}</p></div>
      </div>
    </div>
  );
}
