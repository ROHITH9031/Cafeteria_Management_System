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

export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS[ORDER_STATUSES.PENDING];
  const Icon = statusIcons[status] || Clock;

  return (
    <span className={`status-badge ${colors.bg} ${colors.text} ${colors.border} border`}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

export function StatusProgress({ status }) {
  if (status === ORDER_STATUSES.CANCELLED) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-red-50 rounded-xl border border-red-200">
        <Ban className="w-5 h-5 text-red-500" />
        <span className="text-sm font-medium text-red-700">This order has been cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center justify-between relative">
      {/* Progress Line */}
      <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200">
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
                  : 'bg-white border-gray-300 text-gray-400'
                }
                ${isCurrent ? 'ring-4 ring-brand-100 scale-110' : ''}
              `}
            >
              <Icon className="w-4.5 h-4.5" />
            </div>
            <span className={`mt-2 text-xs font-medium ${isCompleted ? 'text-brand-700' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
