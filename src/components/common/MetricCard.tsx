import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'emerald' | 'indigo' | 'rose' | 'amber' | 'blue' | 'purple';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  trend,
  variant = 'emerald',
  onClick
}) => {
  const variantStyles = {
    emerald: {
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      border: 'hover:border-emerald-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      glow: 'group-hover:shadow-glow-emerald',
      amountColor: 'text-slate-900 dark:text-white',
    },
    indigo: {
      gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      border: 'hover:border-indigo-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      glow: 'group-hover:shadow-glow-indigo',
      amountColor: 'text-slate-900 dark:text-white',
    },
    rose: {
      gradient: 'from-rose-500/10 via-rose-500/5 to-transparent',
      border: 'hover:border-rose-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      glow: '',
      amountColor: 'text-rose-600 dark:text-rose-400',
    },
    amber: {
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      border: 'hover:border-amber-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      glow: '',
      amountColor: 'text-amber-600 dark:text-amber-400',
    },
    blue: {
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      border: 'hover:border-blue-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      glow: '',
      amountColor: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      gradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      border: 'hover:border-purple-500/40 border-slate-200/80 dark:border-slate-800',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      glow: '',
      amountColor: 'text-purple-600 dark:text-purple-400',
    }
  };

  const currentStyle = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden p-5 rounded-2xl bg-white dark:bg-slate-900/80 backdrop-blur-md border ${currentStyle.border} ${currentStyle.glow} shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${currentStyle.gradient} pointer-events-none`} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            {title}
          </span>
          <h3 className={`text-2xl sm:text-3xl font-extrabold mt-1.5 tracking-tight ${currentStyle.amountColor}`}>
            {amount}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`p-3 rounded-2xl ${currentStyle.iconBg} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.isPositive ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
            {trend.value}
          </span>
          <span className="text-slate-400">vs quincena anterior</span>
        </div>
      )}
    </div>
  );
};
