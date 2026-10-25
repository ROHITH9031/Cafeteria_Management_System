import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger' }) {
  if (!isOpen) return null;

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-brand-600 hover:bg-brand-700 text-white',
  };

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center p-4 backdrop-animate">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-charcoal-muted dark:text-slate-400"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${variant === 'danger' ? 'bg-red-100 dark:bg-red-950/40' : 'bg-amber-100 dark:bg-amber-950/40'}`}>
            <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-charcoal dark:text-white">{title}</h3>
            <p className="mt-1.5 text-sm text-charcoal-muted dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-charcoal-muted dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${btnColors[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
