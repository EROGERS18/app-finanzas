import React, { useState, useEffect } from 'react';
import { X, PieChart, Tag, DollarSign, AlertCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Budget, CurrencyCode } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBudget: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, editingBudget }) => {
  const { categories, budgets, addBudget, updateBudget, selectedMonth, settings } = useFinance();

  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.primaryCurrency);
  const [alertThreshold, setAlertThreshold] = useState('85');

  // Categorías de gastos que aún no tienen presupuesto asignado este mes (o la actual en edición)
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');
  const availableCategories = expenseCategories.filter(cat => {
    if (editingBudget && editingBudget.categoryId === cat.id) return true;
    return !budgets.some(b => b.categoryId === cat.id && b.month === selectedMonth);
  });

  useEffect(() => {
    if (editingBudget) {
      setCategoryId(editingBudget.categoryId);
      setMonthlyLimit(editingBudget.monthlyLimit.toString());
      setCurrency(editingBudget.currency);
      setAlertThreshold(editingBudget.alertThreshold.toString());
    } else {
      setCategoryId(availableCategories[0]?.id || expenseCategories[0]?.id || '');
      setMonthlyLimit('');
      setCurrency(settings.primaryCurrency);
      setAlertThreshold('85');
    }
  }, [isOpen, editingBudget]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(monthlyLimit);
    const threshold = parseInt(alertThreshold, 10);

    if (!categoryId || isNaN(limit) || limit <= 0) {
      alert('Por favor selecciona una categoría y un límite válido mayor a 0');
      return;
    }

    if (editingBudget) {
      updateBudget({
        ...editingBudget,
        categoryId,
        monthlyLimit: limit,
        currency,
        alertThreshold: threshold || 85,
      });
    } else {
      addBudget({
        categoryId,
        monthlyLimit: limit,
        currency,
        month: selectedMonth,
        alertThreshold: threshold || 85,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBudget ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
              </h3>
              <p className="text-xs text-slate-500">
                Fija un límite de gasto mensual para una categoría
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Categoría de Gasto *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {availableCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Límite Mensual y Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Límite Mensual Máximo *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="DOP">RD$</option>
                <option value="USD">US$</option>
              </select>
            </div>
          </div>

          {/* Umbral de Alerta Porcentual */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Avisarme cuando alcance el:
              </label>
              <span className="text-xs font-extrabold text-amber-500">
                {alertThreshold}% del presupuesto
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(e.target.value)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50% (Temprano)</span>
              <span>85% (Recomendado)</span>
              <span>95% (Crítico)</span>
            </div>
          </div>

          {/* Botones */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
            >
              {editingBudget ? 'Guardar Cambios' : 'Crear Presupuesto'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
