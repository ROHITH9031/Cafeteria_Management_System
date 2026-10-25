import {
  ShoppingBag, Clock, ChefHat, PackageCheck, CheckCircle,
  TrendingUp, DollarSign, Star, Hash, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/currency';
import { timeAgo } from '../utils/dateFormatter';
import { ORDER_STATUSES } from '../services/orderService';

export default function AdminDashboard() {
  const { orders, getTodayOrders } = useOrders();

  const todayOrders = getTodayOrders();

  // Stats
  const totalToday = todayOrders.length;
  const pending = todayOrders.filter((o) => o.status === ORDER_STATUSES.PENDING).length;
  const preparing = todayOrders.filter((o) => o.status === ORDER_STATUSES.PREPARING).length;
  const ready = todayOrders.filter((o) => o.status === ORDER_STATUSES.READY).length;
  const completed = todayOrders.filter((o) => o.status === ORDER_STATUSES.COMPLETED).length;
  const delivered = todayOrders.filter((o) => o.status === ORDER_STATUSES.DELIVERED).length;
  const cancelled = todayOrders.filter((o) => o.status === ORDER_STATUSES.CANCELLED).length;
  const revenue = todayOrders
    .filter((o) => o.status !== ORDER_STATUSES.CANCELLED)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Popular items (from all orders)
  const itemCounts = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!itemCounts[item.name]) itemCounts[item.name] = 0;
      itemCounts[item.name] += item.quantity;
    });
  });
  const popularItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  // Status distribution for chart
  const statusDist = [
    { label: 'Pending', count: pending, color: 'bg-amber-500', textColor: 'text-amber-700' },
    { label: 'Preparing', count: preparing, color: 'bg-blue-500', textColor: 'text-blue-700' },
    { label: 'Ready', count: ready, color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'Completed', count: completed, color: 'bg-gray-400', textColor: 'text-gray-700' },
    { label: 'Delivered', count: delivered, color: 'bg-purple-500', textColor: 'text-purple-700' },
    { label: 'Cancelled', count: cancelled, color: 'bg-red-400', textColor: 'text-red-700' },
  ];
  const maxCount = Math.max(...statusDist.map((s) => s.count), 1);

  const stats = [
    { label: 'Total Orders', value: totalToday, icon: ShoppingBag, color: 'bg-brand-50 text-brand-600' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Preparing', value: preparing, icon: ChefHat, color: 'bg-blue-50 text-blue-600' },
    { label: 'Ready', value: ready, icon: PackageCheck, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: 'bg-gray-100 text-gray-600' },
    { label: 'Delivered', value: delivered, icon: PackageCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: formatCurrency(revenue), icon: DollarSign, color: 'bg-green-50 text-green-600', isRevenue: true },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">Dashboard</h1>
          <p className="mt-1 text-charcoal-muted text-sm">Today's cafeteria overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-charcoal-muted font-medium">{stat.label}</p>
              <p className="font-display font-bold text-xl text-charcoal mt-0.5">
                {stat.isRevenue ? stat.value : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display font-bold text-charcoal mb-4">Order Status Distribution</h3>
            {totalToday === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-charcoal-muted">No orders today yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statusDist.map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${s.textColor}`}>{s.label}</span>
                      <span className="text-xs font-bold text-charcoal">{s.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${s.color}`}
                        style={{ width: `${(s.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Popular Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-display font-bold text-charcoal mb-4">Popular Items</h3>
            {popularItems.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-charcoal-muted">No orders to analyze yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {popularItems.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
                      ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-100 text-gray-600' : 'bg-brand-50 text-brand-600'}
                    `}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{name}</p>
                    </div>
                    <span className="text-sm font-bold text-charcoal-muted">{count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-charcoal">Recent Orders</h3>
              <Link
                to="/admin/orders"
                className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-charcoal-muted">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-1 px-2 py-1 bg-brand-50 rounded-lg">
                      <Hash className="w-3 h-3 text-brand-500" />
                      <span className="text-xs font-bold text-brand-700">{order.token}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">{order.customerName}</p>
                      <p className="text-[10px] text-charcoal-muted">{timeAgo(order.createdAt)}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <Link
            to="/admin/orders"
            className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 card-hover group"
          >
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-charcoal">Manage Orders</h3>
              <p className="text-sm text-charcoal-muted">View and update order statuses</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/admin/menu"
            className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4 card-hover group"
          >
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-charcoal">Manage Menu</h3>
              <p className="text-sm text-charcoal-muted">Edit items, prices, and availability</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
