import React, { useState } from 'react';
import { 
  PieChart, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertAmount } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';
import { BudgetModal } from './BudgetModal';
import { Budget } from '../../types';

export const BudgetsView: React.FC = () => {
  const { 
    budgets, 
    categories, 
    transactions, 
    displayCurrency, 
    settings, 
    deleteBudget,
    confirmDelete
  } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleOpenNew = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const handleEdit = (bgt: Budget) => {
    setEditingBudget(bgt);
    setModalOpen(true);
  };

  const handleDelete = (id: string, categoryName?: string) => {
    confirmDelete({
      title: `¿Eliminar presupuesto de ${categoryName || 'categoría'}?`,
      message: '¿Estás seguro de que deseas eliminar este límite de presupuesto? La categoría y tus gastos permanecerán intactos.',
      confirmText: 'Eliminar Presupuesto',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deleteBudget(id);
      }
    });
  };

  const budgetsCalculated = budgets.map(b => {
    const cat = categories.find(c => c.id === b.categoryId);
    const spent = transactions
      .filter(tx => tx.type === 'expense' && tx.categoryId === b.categoryId)
      .reduce((sum, tx) => {
        return sum + convertAmount(tx.amount, tx.currency, displayCurrency, settings.exchangeRateUSDToDOP);
      }, 0);

    const limit = convertAmount(b.monthlyLimit, b.currency, displayCurrency, settings.exchangeRateUSDToDOP);
    const remaining = limit - spent;
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;

    return {
      budget: b,
      cat,
      spent,
      limit,
      remaining,
      percentage: Math.round(percentage)
    };
  });

  const totalBudgeted = budgetsCalculated.reduce((acc, b) => acc + b.limit, 0);
  const totalSpentInBudgets = budgetsCalculated.reduce((acc, b) => acc + b.spent, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Presupuestos por Categoría
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Establece techos de gasto y recibe alertas preventivas al acercarte al límite.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Presupuesto</span>
        </button>
      </div>

      {/* Resumen Global de Presupuesto */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Límite Total Presupuestado</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalBudgeted, displayCurrency)}
          </div>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Consumido Acumulado</span>
          <div className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
            {formatCurrency(totalSpentInBudgets, displayCurrency)}
          </div>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Margen Disponible Global</span>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${
            totalBudgeted - totalSpentInBudgets >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {formatCurrency(totalBudgeted - totalSpentInBudgets, displayCurrency)}
          </div>
        </div>
      </div>

      {/* Lista de Tarjetas de Presupuesto */}
      {budgetsCalculated.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <PieChart className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No tienes presupuestos configurados
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crea tu primer presupuesto mensual para controlar tus gastos por categoría.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetsCalculated.map(({ budget, cat, spent, limit, remaining, percentage }) => {
            const isExceeded = percentage >= 100;
            const isWarning = percentage >= (budget.alertThreshold || 85) && !isExceeded;

            let barBg = 'bg-emerald-500';
            if (isExceeded) barBg = 'bg-rose-500';
            else if (isWarning) barBg = 'bg-amber-500';

            return (
              <div
                key={budget.id}
                className="glass-panel p-5 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cat?.color || '#10b981' }}
                      >
                        <IconHelper name={cat?.icon || 'Tag'} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {cat?.name || 'Categoría'}
                        </h4>
                        <span className="text-xs text-slate-400">
                          Alerta al {budget.alertThreshold}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Editar presupuesto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const catName = categories.find(c => c.id === budget.categoryId)?.name || 'Categoría';
                          handleDelete(budget.id, catName);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                        title="Eliminar presupuesto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cifras: Gastado vs Límite */}
                  <div className="flex items-end justify-between my-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Gastado este mes</span>
                      <span className={`text-xl sm:text-2xl font-black ${isExceeded ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                        {formatCurrency(spent, displayCurrency)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Límite Mensual</span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                        {formatCurrency(limit, displayCurrency)}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className={isExceeded ? 'text-rose-500' : isWarning ? 'text-amber-500' : 'text-emerald-500'}>
                        {percentage}% consumido
                      </span>
                      <span className={remaining < 0 ? 'text-rose-500' : 'text-slate-400'}>
                        {remaining >= 0 ? `Quedan ${formatCurrency(remaining, displayCurrency)}` : `Excedido por ${formatCurrency(Math.abs(remaining), displayCurrency)}`}
                      </span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Banner de Estado */}
                {isExceeded && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Has superado el límite fijado para esta categoría.</span>
                  </div>
                )}
                {isWarning && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Estás próximo al límite ({percentage}% alcanzado).</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingBudget={editingBudget}
      />

    </div>
  );
};
