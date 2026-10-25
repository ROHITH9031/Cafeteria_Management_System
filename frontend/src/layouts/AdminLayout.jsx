import { Link, useLocation, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { isAuthenticated, admin, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Frontend route guard — does NOT replace backend authorization
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
    { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-charcoal text-white fixed inset-y-0 left-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-sm leading-none">SRKR Admin</span>
            <span className="block text-[10px] text-white/50 leading-none mt-0.5">Cafeteria Management</span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mx-4 mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] text-amber-300 font-medium">Demo Mode — Not Production</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive(link.to, link.exact)
                  ? 'bg-brand-500/20 text-brand-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <link.icon className="w-4.5 h-4.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-brand-400">{admin?.name?.[0] || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{admin?.name || 'Admin'}</p>
              <p className="text-[10px] text-white/40 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Back to Customer */}
        <div className="px-4 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/40 hover:text-white/60 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Customer View
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-charcoal h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white/60 hover:text-white rounded-lg transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 backdrop-animate">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-charcoal text-white animate-slide-up pt-14">
            {/* Demo Notice */}
            <div className="mx-4 mt-4 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-amber-300 font-medium">Demo Mode</span>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive(link.to, link.exact)
                      ? 'bg-brand-500/20 text-brand-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-4 mt-4 space-y-2">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/40 hover:text-white/60 hover:bg-white/5 rounded-xl transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Customer View
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
