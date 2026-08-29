import React from 'react';
import { AlertTriangle, Clock, X, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface AlertBannerProps {
  onNavigateToCommitments?: () => void;
  onNavigateToBudgets?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  onNavigateToCommitments,
  onNavigateToBudgets
}) => {
  const { alerts, dismissAlert } = useFinance();

  if (alerts.length === 0) return null;

  // Mostrar como máximo las 2 alertas más urgentes en el banner superior
  const priorityAlerts = alerts.slice(0, 2);

  return (
    <div className="space-y-2 mb-6">
      {priorityAlerts.map((alert) => {
        const isUrgent = alert.severity === 'high';
        return (
          <div
            key={alert.id}
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300 ${
              isUrgent
                ? 'bg-rose-500/10 dark:bg-rose-950/30 border-rose-500/30 text-rose-800 dark:text-rose-200'
                : 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isUrgent ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {alert.type.includes('due') || alert.type.includes('overdue') ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
              </div>
              <div className="text-xs sm:text-sm">
                <p className="font-bold">{alert.title}</p>
                <p className="opacity-90 mt-0.5">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {alert.transactionId && onNavigateToCommitments && (
                <button
                  onClick={onNavigateToCommitments}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors ${
                    isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <span>Ver Pago</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {alert.categoryId && onNavigateToBudgets && (
                <button
                  onClick={onNavigateToBudgets}
                  className={`hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors ${
                    isUrgent
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <span>Ver Presupuesto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => dismissAlert(alert.id)}
                className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100"
                title="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
