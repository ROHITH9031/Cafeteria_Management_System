import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UtensilsCrossed, ArrowLeft, Home, Compass, ClipboardList, ShieldAlert } from 'lucide-react';

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full text-center">
        {/* Animated Visual Badge */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-8">
          <div className="absolute inset-0 bg-brand-500/15 rounded-3xl rotate-6 animate-pulse" />
          <div className="relative w-full h-full bg-linear-to-br from-brand-500 to-amber-500 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-500/25">
            <UtensilsCrossed className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 bg-charcoal text-white text-xs font-bold rounded-full shadow-md">
            404
          </span>
        </div>

        {/* Text */}
        <p className="text-xs font-bold tracking-widest text-brand-600 dark:text-brand-400 uppercase">Page Not Found</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-charcoal dark:text-white tracking-tight">
          Lost in the Cafeteria?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-charcoal-muted dark:text-slate-400 leading-relaxed max-w-md mx-auto">
          We couldn't find <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-brand-700 dark:text-brand-300 text-xs font-mono">{location.pathname}</code>.
          The page might have moved, or you might have taken a wrong turn on the menu.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-semibold text-charcoal dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          {isAdminPath ? (
            <Link
              to="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Dashboard
            </Link>
          ) : (
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-sm font-semibold text-white hover:bg-brand-600 transition-colors shadow-md shadow-brand-500/20"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs font-medium text-charcoal-muted dark:text-slate-400 mb-3">Popular pages you might want to visit:</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 rounded-lg text-charcoal-muted dark:text-slate-300 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-brand-500" />
              Browse Menu
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 rounded-lg text-charcoal-muted dark:text-slate-300 transition-colors"
            >
              <ClipboardList className="w-3.5 h-3.5 text-brand-500" />
              My Orders
            </Link>
            <Link
              to="/cart"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-500/20 hover:text-brand-600 dark:hover:text-brand-300 rounded-lg text-charcoal-muted dark:text-slate-300 transition-colors"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-brand-500" />
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
