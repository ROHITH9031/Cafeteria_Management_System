import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Eye, ChevronDown, Clock, UserRound,
  Hash, PackageCheck, XCircle, ArrowRight, UtensilsCrossed, ShoppingBag, Utensils,
  Camera,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { formatDateTime } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';
import AdminOrderScannerModal from '../components/common/AdminOrderScannerModal';

const statusOptions = ['All', ...Object.values(ORDER_STATUSES)];

const nextStatus = {
  [ORDER_STATUSES.PENDING]: ORDER_STATUSES.PREPARING,
  [ORDER_STATUSES.PREPARING]: ORDER_STATUSES.READY,
  [ORDER_STATUSES.READY]: ORDER_STATUSES.COMPLETED,
  [ORDER_STATUSES.COMPLETED]: ORDER_STATUSES.DELIVERED,
};

export default function AdminOrders() {
  const { orders, activeOrderCount, totalOrderCount, updateStatus, bulkUpdateStatus, socketConnected, hasMoreOrders, loadingMoreOrders, loadMoreOrders, reloadOrders } = useOrders();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Preparing');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const filtersMounted = useRef(false);

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => sort === 'oldest'
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt));
  }, [orders, sort]);

  useEffect(() => {
    if (!filtersMounted.current) {
      filtersMounted.current = true;
      return undefined;
    }
    setSelectedOrderIds([]);
    const timer = setTimeout(() => {
      reloadOrders({ status, q: query.trim(), from: fromDate, to: toDate })
        .catch((error) => console.error('[AdminOrders] Failed to filter orders:', error));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, status, fromDate, toDate, reloadOrders]);

  const toggleOrderSelection = (orderId) => {
    if (!selectedOrderIds.includes(orderId) && selectedOrderIds.length >= 100) {
      window.alert('Bulk updates support up to 100 orders at a time.');
      return;
    }
    setSelectedOrderIds((selected) => selected.includes(orderId)
      ? selected.filter((id) => id !== orderId)
      : [...selected, orderId]);
  };

  const applyBulkStatus = async () => {
    if (!selectedOrderIds.length) return;
    setBulkUpdating(true);
    try {
      await bulkUpdateStatus(selectedOrderIds, bulkStatus);
      setSelectedOrderIds([]);
    } catch (error) {
      console.error('[AdminOrders] Bulk status update failed:', error);
      window.alert(error.message || 'Could not update selected orders');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">Operations</p>
            <h1 className="font-display text-3xl font-bold text-charcoal dark:text-white mt-1">Order Management</h1>
            <p className="text-sm text-charcoal-muted dark:text-slate-400 mt-1">{activeOrderCount} active · {totalOrderCount} matching filters</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-brand-500/20"
            >
              <Camera className="w-4 h-4" />
              Scan Pickup QR
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 rounded-xl text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse-dot' : 'bg-amber-400'}`} />
              {socketConnected ? 'Live WebSocket Queue' : 'Reconnecting...'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3 mb-5 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search token, customer, or order ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400"
              />
            </div>
            <div className="grid grid-cols-2 sm:flex gap-2 min-w-0">
              <div className="relative min-w-0">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-muted dark:text-slate-400 pointer-events-none" />
                <select
                  value={status}
                  onChange={(event) => {
                    const nextStatus = event.target.value;
                    setStatus(nextStatus);
                    setSelectedOrderIds([]);
                  }}
                  className="appearance-none w-full min-w-0 pl-9 pr-8 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-charcoal dark:text-white sm:w-auto"
                >
                  {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal-muted dark:text-slate-400 pointer-events-none" />
              </div>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full min-w-0 px-3 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-charcoal dark:text-white sm:w-auto"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="text-xs font-medium text-charcoal-muted dark:text-slate-400">From
                <input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setSelectedOrderIds([]); }} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-charcoal dark:text-white" />
              </label>
              <label className="text-xs font-medium text-charcoal-muted dark:text-slate-400">To
                <input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setSelectedOrderIds([]); }} className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-charcoal dark:text-white" />
              </label>
            </div>
          </div>
        </div>

        {filteredOrders.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
            <label className="inline-flex items-center gap-2 text-sm text-charcoal-muted dark:text-slate-300">
              <input type="checkbox" checked={filteredOrders.length > 0 && filteredOrders.slice(0, 100).every((order) => selectedOrderIds.includes(order.id))} onChange={(event) => setSelectedOrderIds(event.target.checked ? filteredOrders.slice(0, 100).map((order) => order.id) : [])} />
              Select up to 100 loaded orders
            </label>
            {selectedOrderIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-charcoal-muted dark:text-slate-400">{selectedOrderIds.length} selected</span>
                <select value={bulkStatus} onChange={(event) => setBulkStatus(event.target.value)} aria-label="Set selected order status" className="px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-charcoal dark:text-white">
                  {Object.values(ORDER_STATUSES).map((option) => <option key={option}>{option}</option>)}
                </select>
                <button type="button" onClick={applyBulkStatus} disabled={bulkUpdating} className="px-3 py-2 rounded-lg bg-brand-500 text-white text-sm font-semibold disabled:opacity-50">{bulkUpdating ? 'Updating…' : 'Apply status'}</button>
              </div>
            )}
          </div>
        )}

        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 px-5 py-16 sm:py-20 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mx-auto mb-5">
              <PackageCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="font-display text-xl font-semibold text-charcoal dark:text-white">
              {orders.length === 0 ? 'Your order queue is clear' : 'No matching orders'}
            </h2>
            <p className="text-sm text-charcoal-muted dark:text-slate-400 mt-2 max-w-sm mx-auto">
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
                <button onClick={() => { setQuery(''); setStatus('All'); setFromDate(''); setToDate(''); setSelectedOrderIds([]); }} className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold hover:bg-brand-600">
                  Clear filters
                </button>
              )}
              <Link to="/admin/menu" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-charcoal-muted dark:text-slate-400 text-sm font-semibold hover:border-brand-200 hover:text-brand-600">
                Manage menu
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} selected={selectedOrderIds.includes(order.id)} onSelect={toggleOrderSelection} onStatusChange={updateStatus} onView={setSelectedOrder} />
            ))}
          </div>
        )}

        {hasMoreOrders && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => loadMoreOrders().catch((error) => console.error('[AdminOrders] Failed to load more orders:', error))}
              disabled={loadingMoreOrders}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-charcoal dark:text-white hover:border-brand-400 disabled:opacity-50"
            >
              {loadingMoreOrders ? 'Loading…' : 'Load older orders'}
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onStatusChange={updateStatus}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Admin QR Scanner Modal */}
      <AdminOrderScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        orders={orders}
        onSelectOrder={setSelectedOrder}
        onStatusChange={updateStatus}
      />
    </div>
  );
}

function OrderCard({ order, selected, onSelect, onStatusChange, onView }) {
  const upcomingStatus = nextStatus[order.status];
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  const canCancel = order.status === ORDER_STATUSES.PENDING;

  return (
    <article className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow ${selected ? 'border-brand-400 ring-1 ring-brand-400/30' : 'border-gray-100 dark:border-slate-800'}`}>
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="flex items-center gap-3 xl:w-56 shrink-0">
          <input type="checkbox" checked={selected} onChange={() => onSelect(order.id)} aria-label={`Select order ${order.token}`} />
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
            <Hash className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p className="text-lg font-display font-bold text-brand-700 dark:text-brand-400">{order.token}</p>
            <p className="text-[11px] text-charcoal-muted dark:text-slate-400">#{order.id.slice(-8)}</p>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <p className="font-semibold text-charcoal dark:text-white flex items-center gap-1.5"><UserRound className="w-3.5 h-3.5 text-charcoal-muted dark:text-slate-400" />{order.customerName}</p>
            <p className="text-xs text-charcoal-muted dark:text-slate-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{formatDateTime(order.createdAt)}</p>
          </div>
          <p className="text-sm text-charcoal-muted dark:text-slate-400 mt-1 truncate">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
          <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 flex items-center gap-1">
            {order.orderType === 'Parcel' ? <ShoppingBag className="w-3 h-3" /> : <Utensils className="w-3 h-3" />}
            {order.orderType || 'Dine-in'}
          </p>
        </div>
          <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3">
          <div className="text-left xl:text-right">
            <p className="font-display font-bold text-charcoal dark:text-white">{formatCurrency(order.totalAmount)}</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => onView(order)} className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-charcoal-muted dark:text-slate-300 hover:text-brand-600 hover:border-brand-200" aria-label="View order details"><Eye className="w-4 h-4" /></button>
            {upcomingStatus && (
              <button onClick={() => onStatusChange(order.id, upcomingStatus)} className="px-3 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600">
                Mark {upcomingStatus}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to cancel order ${order.token}?`)) {
                    onStatusChange(order.id, ORDER_STATUSES.CANCELLED);
                  }
                }}
                className="px-2.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold transition-colors"
                title="Cancel / Reject Order"
              >
                Cancel
              </button>
            )}
            {isCancelled && <XCircle className="w-5 h-5 text-red-400" aria-label="Cancelled" />}
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderDetailsModal({ order, onStatusChange, onClose }) {
  const upcomingStatus = nextStatus[order.status];
  const canCancel = order.status === ORDER_STATUSES.PENDING;

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center p-4">
      <button className="fixed inset-0 bg-black/50 backdrop-blur-sm cursor-default" onClick={onClose} aria-label="Close order details" />
      <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-5">
          <div><p className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 font-semibold">Order details</p><h2 className="font-display text-2xl font-bold text-charcoal dark:text-white mt-1">{order.token}</h2></div>
          <button onClick={onClose} className="text-sm text-charcoal-muted dark:text-slate-400 hover:text-charcoal dark:hover:text-white">Close</button>
        </div>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 rounded-xl p-3 mb-5"><span className="text-sm text-charcoal-muted dark:text-slate-400">Current status</span><StatusBadge status={order.status} /></div>
        <div className="space-y-3 mb-5">
          {order.items.map((item) => <div key={item.id} className="flex justify-between text-sm text-charcoal dark:text-slate-200"><span>{item.name} <span className="text-charcoal-muted dark:text-slate-400">× {item.quantity}</span></span><span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span></div>)}
        </div>
        <div className="border-t border-gray-100 dark:border-slate-800 pt-4 flex justify-between font-display font-bold text-charcoal dark:text-white"><span>Total</span><span className="text-brand-600 dark:text-brand-400">{formatCurrency(order.totalAmount)}</span></div>
        <div className="mt-5 text-xs text-charcoal-muted dark:text-slate-400 space-y-1">
          <p>Customer: <span className="text-charcoal dark:text-slate-200">{order.customerName}</span></p>
          <p>Serving: <span className="font-medium text-charcoal dark:text-slate-200">{order.orderType || 'Dine-in'}</span></p>
          <p>Order ID: {order.id}</p>
          <p>Placed: {formatDateTime(order.createdAt)}</p>
        </div>

        {canCancel && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                if (window.confirm(`Cancel order ${order.token}?`)) {
                  onStatusChange(order.id, ORDER_STATUSES.CANCELLED);
                  onClose();
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              Cancel Order
            </button>
            {upcomingStatus && (
              <button
                onClick={() => {
                  onStatusChange(order.id, upcomingStatus);
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 rounded-xl hover:bg-brand-600 transition-colors"
              >
                Advance to {upcomingStatus}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
