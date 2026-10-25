import { ORDER_STATUSES, STATUS_COLORS, STATUS_STEPS } from '../../services/orderService';
import { Check, Clock, ChefHat, PackageCheck, Ban, Truck } from 'lucide-react';

const statusIcons = {
  [ORDER_STATUSES.PENDING]: Clock,
  [ORDER_STATUSES.PREPARING]: ChefHat,
  [ORDER_STATUSES.READY]: PackageCheck,
  [ORDER_STATUSES.COMPLETED]: Check,
  [ORDER_STATUSES.DELIVERED]: Truck,
  [ORDER_STATUSES.CANCELLED]: Ban,
};

const darkBadgeStyles = {
  [ORDER_STATUSES.PENDING]: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  [ORDER_STATUSES.PREPARING]: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  [ORDER_STATUSES.READY]: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  [ORDER_STATUSES.COMPLETED]: 'dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  [ORDER_STATUSES.DELIVERED]: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
  [ORDER_STATUSES.CANCELLED]: 'dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
};

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS[ORDER_STATUSES.PENDING];
  const Icon = statusIcons[status] || Clock;
  const darkStyle = darkBadgeStyles[status] || 'dark:bg-slate-800 dark:text-slate-300';

  return (
    <span className={`status-badge ${colors.bg} ${colors.text} ${colors.border} ${darkStyle} border`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export function StatusProgress({ status }) {
  if (status === ORDER_STATUSES.CANCELLED) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
        <Ban className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700 dark:text-red-300">This order has been cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 dark:bg-slate-700">
        <div
          className="h-full bg-brand-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {STATUS_STEPS.map((step, index) => {
        const Icon = statusIcons[step];
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step} className="flex flex-col items-center z-10 relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                }
                ${isCurrent ? 'ring-4 ring-brand-100 dark:ring-brand-500/30 scale-110' : ''}
              `}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-brand-700 dark:text-brand-300 font-semibold' : 'text-gray-400 dark:text-slate-500'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
