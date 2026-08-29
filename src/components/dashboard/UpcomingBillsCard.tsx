import React from 'react';
import { Clock, CheckCircle, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';

interface UpcomingBillsCardProps {
  onViewAll?: () => void;
}

export const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ onViewAll }) => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    toggleTransactionStatus, 
    displayCurrency,
    openQuickModal
  } = useFinance();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filtrar gastos pendientes ordenados por fecha de vencimiento o fecha de transacción
  const pendingBills = transactions
    .filter(tx => tx.type === 'expense' && tx.status === 'pending')
    .sort((a, b) => {
      const dateA = new Date(a.dueDate || a.date).getTime();
      const dateB = new Date(b.dueDate || b.date).getTime();
      return dateA - dateB;
    });

  const getDueBadge = (dueDateStr?: string) => {
    if (!dueDateStr) return { text: 'Pendiente', color: 'bg-slate-500/10 text-slate-400' };
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { text: `Venció hace ${Math.abs(diff)}d`, color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' };
    }
    if (diff === 0) {
      return { text: 'Vence Hoy', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-bold' };
    }
    if (diff <= 3) {
      return { text: `En ${diff} días`, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' };
    }
    return { text: `En ${diff} días`, color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' };
  };

  return (
    <div className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Próximos Pagos & Compromisos
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pagos pendientes que impactan tu Disponible Real
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Ver todos ({pendingBills.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {pendingBills.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
          <CheckCircle className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            ¡Estás al día con todos tus compromisos!
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            No tienes pagos pendientes registrados para este período.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingBills.slice(0, 6).map((bill) => {
            const cat = categories.find(c => c.id === bill.categoryId);
            const pm = paymentMethods.find(p => p.id === bill.paymentMethodId);
            const badge = getDueBadge(bill.dueDate || bill.date);

            return (
              <div
                key={bill.id}
                className="group relative p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 hover:border-indigo-500/50 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cat?.color || '#6366f1' }}
                      >
                        <IconHelper name={cat?.icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {bill.title}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {cat?.name || 'General'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>

                  <div className="my-3">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(bill.amount, bill.currency)}
                    </span>
                    {bill.currency !== displayCurrency && (
                      <span className="block text-[11px] text-slate-400">
                        ≈ {formatCurrency(bill.amount, displayCurrency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 truncate">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{bill.dueDate || bill.date}</span>
                    <span className="font-semibold text-[10px] uppercase text-indigo-500">
                      ({bill.fortnight === 'q1' ? '1ra Q' : '2da Q'})
                    </span>
                  </div>

                  <button
                    onClick={() => toggleTransactionStatus(bill.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white font-bold transition-all text-xs shrink-0"
                    title="Marcar como pagado"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Pagar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
