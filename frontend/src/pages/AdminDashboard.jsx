import { useEffect, useState } from 'react';
import { ArrowRight, Download, ShoppingBag, DollarSign, Star, Clock, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest, authHeaders } from '../services/apiClient';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { timeAgo } from '../utils/dateFormatter';

const today = new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const { orders } = useOrders();
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    Promise.resolve().then(() => {
      if (!active) return null;
      setLoading(true);
      setError('');
      return apiRequest(`/orders/reports?${params}`, { headers: authHeaders() });
    }).then((data) => { if (active && data) setReport(data); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [from, to]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ['Date', 'Orders', 'Revenue'],
      ...report.dailySales.map((day) => [day.date, day.orderCount, day.revenue]),
      [],
      ['Popular item', 'Quantity sold', 'Revenue'],
      ...report.popularItems.map((item) => [item.name, item.quantity, item.revenue]),
      [],
      ['Status', 'Orders'],
      ...Object.entries(report.statusCounts),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `cafeteria-sales-${from || 'all'}-to-${to || 'all'}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary || { orderCount: 0, revenue: 0, averageOrderValue: 0 };
  const maxDailyRevenue = Math.max(1, ...(report?.dailySales || []).map((day) => day.revenue));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div><h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal dark:text-white">Sales Dashboard</h1><p className="mt-1 text-sm text-charcoal-muted dark:text-slate-400">Revenue and item sales across the selected dates</p></div>
          <div className="flex flex-col sm:flex-row gap-2">
            <label className="text-xs text-charcoal-muted dark:text-slate-400">From<input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-charcoal dark:text-white" /></label>
            <label className="text-xs text-charcoal-muted dark:text-slate-400">To<input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-charcoal dark:text-white" /></label>
            <button onClick={exportCsv} disabled={!report || loading} className="self-end inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold disabled:opacity-50"><Download className="w-4 h-4" />Export CSV</button>
          </div>
        </div>
        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">Could not load sales report: {error}</div>}
        {loading && !report && <p className="mb-4 text-sm text-charcoal-muted dark:text-slate-400">Loading report…</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Metric icon={ShoppingBag} label="Orders" value={summary.orderCount} />
          <Metric icon={DollarSign} label="Revenue (excluding cancellations)" value={formatCurrency(summary.revenue)} />
          <Metric icon={PackageCheck} label="Average order value" value={formatCurrency(summary.averageOrderValue)} />
        </div>

        <div className="grid lg:grid-cols-2 gap-5">
          <section className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display font-bold text-charcoal dark:text-white mb-4">Daily sales</h2>
            {report?.dailySales?.length ? <div className="space-y-3">{report.dailySales.map((day) => <div key={day.date} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm"><span className="text-charcoal-muted dark:text-slate-400">{day.date}</span><div className="h-2 rounded-full bg-gray-100 dark:bg-slate-800"><div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(2, day.revenue / maxDailyRevenue * 100)}%` }} /></div><span className="font-semibold text-charcoal dark:text-white">{formatCurrency(day.revenue)}</span></div>)}</div> : <p className="text-sm text-charcoal-muted dark:text-slate-400">No sales for these dates.</p>}
          </section>
          <section className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display font-bold text-charcoal dark:text-white mb-4">Popular items</h2>
            {report?.popularItems?.length ? <div className="space-y-3">{report.popularItems.map((item, index) => <div key={item.name} className="flex items-center gap-3"><span className="w-7 h-7 grid place-items-center rounded-lg bg-amber-50 text-amber-700 text-xs font-bold dark:bg-amber-950/40 dark:text-amber-300">{index + 1}</span><span className="flex-1 min-w-0 truncate text-sm font-medium text-charcoal dark:text-white">{item.name}</span><span className="text-xs text-charcoal-muted dark:text-slate-400">{item.quantity} sold</span><span className="text-sm font-semibold text-charcoal dark:text-white">{formatCurrency(item.revenue)}</span></div>)}</div> : <p className="text-sm text-charcoal-muted dark:text-slate-400">No items sold for these dates.</p>}
          </section>
          <section className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h2 className="font-display font-bold text-charcoal dark:text-white mb-4">Order counts by status</h2>
            <div className="flex flex-wrap gap-2">{Object.entries(report?.statusCounts || {}).map(([status, count]) => <div key={status} className="flex items-center gap-2 rounded-xl bg-gray-50 dark:bg-slate-800 px-3 py-2"><StatusBadge status={status} /><strong className="text-sm text-charcoal dark:text-white">{count}</strong></div>)}</div>
          </section>
          <section className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-3"><h2 className="font-display font-bold text-charcoal dark:text-white">Recent orders</h2><Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400">View all <ArrowRight className="w-3 h-3" /></Link></div>
            {orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center gap-3 py-2 border-t border-gray-100 dark:border-slate-800"><Clock className="w-4 h-4 text-charcoal-muted" /><span className="font-semibold text-brand-600 dark:text-brand-400">{order.token}</span><span className="flex-1 truncate text-sm text-charcoal dark:text-white">{order.customerName} · {timeAgo(order.createdAt)}</span><StatusBadge status={order.status} /></div>)}
            {!orders.length && <p className="text-sm text-charcoal-muted dark:text-slate-400">No recent orders.</p>}
          </section>
        </div>
        <div className="mt-6 flex gap-3"><Link to="/admin/orders" className="px-4 py-2.5 rounded-xl bg-brand-500 text-white text-sm font-semibold">Manage orders</Link><Link to="/admin/menu" className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-sm font-semibold text-charcoal dark:text-white">Manage menu</Link><span className="ml-auto inline-flex items-center gap-1 text-xs text-charcoal-muted dark:text-slate-400"><Star className="w-3.5 h-3.5" />Reports use all matching database records.</span></div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"><div className="flex items-center gap-2 text-brand-600 dark:text-brand-400"><Icon className="w-5 h-5" /><span className="text-xs font-semibold">{label}</span></div><p className="mt-3 font-display text-2xl font-bold text-charcoal dark:text-white">{value}</p></div>;
}
