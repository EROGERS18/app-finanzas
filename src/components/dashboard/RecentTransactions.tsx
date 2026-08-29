import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, MoreVertical, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';
import { Transaction } from '../../types';

interface RecentTransactionsProps {
  onViewAll?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ onViewAll }) => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    displayCurrency, 
    toggleTransactionStatus, 
    deleteTransaction,
    setEditingTransaction,
    openQuickModal,
    confirmDelete
  } = useFinance();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Ordenar por fecha descendente
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    openQuickModal(tx.type);
    setActiveMenuId(null);
  };

  const handleDelete = (tx: Transaction) => {
    setActiveMenuId(null);
    confirmDelete({
      title: `¿Eliminar "${tx.title}"?`,
      message: '¿Estás seguro de que deseas eliminar este registro? Los saldos y el Dashboard se actualizarán inmediatamente.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deleteTransaction(tx.id);
      }
    });
  };

  return (
    <div className="glass-panel p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Últimos Movimientos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingresos y gastos recientes registrados
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Ver historial completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500">
          No hay movimientos registrados este mes. Haz clic en el botón (+) para agregar uno.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {recent.map((tx) => {
            const cat = categories.find(c => c.id === tx.categoryId);
            const pm = paymentMethods.find(p => p.id === tx.paymentMethodId);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: cat?.color || '#10b981' }}
                  >
                    <IconHelper name={cat?.icon || 'Tag'} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{tx.date}</span>
                      <span>•</span>
                      <span className="truncate">{pm?.name || 'Efectivo'}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {tx.fortnight === 'q1' ? '1ra Q' : '2da Q'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`text-xs sm:text-sm font-extrabold block ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </span>
                    
                    <button
                      onClick={() => toggleTransactionStatus(tx.id)}
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 transition-colors ${
                        tx.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                      title="Clic para cambiar estado"
                    >
                      {tx.status === 'paid' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Pagado</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Pendiente</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Menú de acciones */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(activeMenuId === tx.id ? null : tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuId === tx.id && (
                      <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 py-1 text-xs animate-in fade-in">
                        <button
                          onClick={() => handleEdit(tx)}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-500/10 text-rose-600 font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
