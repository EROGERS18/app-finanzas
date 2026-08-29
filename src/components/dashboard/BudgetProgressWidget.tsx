import React from 'react';
import { PieChart, AlertTriangle, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertAmount } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';

interface BudgetProgressWidgetProps {
  onViewAll?: () => void;
}

export const BudgetProgressWidget: React.FC<BudgetProgressWidgetProps> = ({ onViewAll }) => {
  const { budgets, categories, transactions, displayCurrency, settings } = useFinance();

  const budgetsWithSpent = budgets.map(budget => {
    const cat = categories.find(c => c.id === budget.categoryId);
    const spent = transactions
      .filter(tx => tx.type === 'expense' && tx.categoryId === budget.categoryId)
      .reduce((sum, tx) => {
        return sum + convertAmount(tx.amount, tx.currency, displayCurrency, settings.exchangeRateUSDToDOP);
      }, 0);

    const limitInDisplay = convertAmount(budget.monthlyLimit, budget.currency, displayCurrency, settings.exchangeRateUSDToDOP);
    const percentage = limitInDisplay > 0 ? Math.round((spent / limitInDisplay) * 100) : 0;

    return {
      budget,
      cat,
      spent,
      limit: limitInDisplay,
      percentage
    };
  });

  return (
    <div className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Presupuestos por Categoría
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Límites mensuales y control de consumo
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Gestionar presupuestos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {budgetsWithSpent.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-500">
          No has configurado presupuestos para este mes.
        </div>
      ) : (
        <div className="space-y-4">
          {budgetsWithSpent.slice(0, 4).map(({ budget, cat, spent, limit, percentage }) => {
            const isExceeded = percentage >= 100;
            const isWarning = percentage >= (budget.alertThreshold || 85) && !isExceeded;

            let barColor = 'bg-emerald-500';
            if (isExceeded) barColor = 'bg-rose-500';
            else if (isWarning) barColor = 'bg-amber-500';

            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: cat?.color || '#10b981' }}
                    >
                      <IconHelper name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {cat?.name || 'General'}
                    </span>
                    {isExceeded && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-rose-500/10 text-rose-500">
                        Excedido
                      </span>
                    )}
                    {isWarning && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded bg-amber-500/10 text-amber-500">
                        Alerta {budget.alertThreshold}%
                      </span>
                    )}
                  </div>

                  <div className="text-right font-medium">
                    <span className={`font-bold ${isExceeded ? 'text-rose-500' : 'text-slate-900 dark:text-slate-200'}`}>
                      {formatCurrency(spent, displayCurrency)}
                    </span>
                    <span className="text-slate-400 text-[11px]"> / {formatCurrency(limit, displayCurrency)}</span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
