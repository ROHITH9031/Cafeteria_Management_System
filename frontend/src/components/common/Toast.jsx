import { useCart } from '../../context/CartContext';
import { CheckCircle, ShoppingCart, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { notification, dismissNotification } = useCart();
  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <ShoppingCart className="w-5 h-5 text-brand-500" />,
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-charcoal dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-charcoal dark:text-red-200',
    info: 'bg-brand-50 dark:bg-slate-900/90 border-brand-200 dark:border-brand-500/30 text-charcoal dark:text-white',
  };

  return (
    <div className="fixed top-4 right-4 z-100">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${
          bgColors[notification.type] || bgColors.success
        } toast-enter`}
      >
        {icons[notification.type] || icons.success}
        <span className="text-sm font-medium">
          {notification.message}
        </span>
        <button
          onClick={dismissNotification}
          className="ml-2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
}
