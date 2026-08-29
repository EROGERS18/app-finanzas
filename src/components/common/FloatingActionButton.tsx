import React, { useState } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, CheckSquare, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';

export const FloatingActionButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { openQuickModal } = useFinance();

  const handleAction = (type: TransactionType) => {
    openQuickModal(type);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Opciones Speed Dial */}
      {isOpen && (
        <div className="mb-3 flex flex-col items-end space-y-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Opción 1: Nuevo Gasto */}
          <button
            onClick={() => handleAction('expense')}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs sm:text-sm font-semibold"
          >
            <span>Nuevo Gasto</span>
            <div className="p-1.5 rounded-full bg-rose-500/10">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </button>

          {/* Opción 2: Nuevo Ingreso */}
          <button
            onClick={() => handleAction('income')}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs sm:text-sm font-semibold"
          >
            <span>Nuevo Ingreso</span>
            <div className="p-1.5 rounded-full bg-emerald-500/10">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </button>

          {/* Opción 3: Compromiso / Pago Futuro */}
          <button
            onClick={() => handleAction('expense')}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all text-xs sm:text-sm font-semibold"
          >
            <span>Programar Pago</span>
            <div className="p-1.5 rounded-full bg-indigo-500/10">
              <CheckSquare className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Botón Principal Flotante (+) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen
            ? 'bg-slate-800 dark:bg-slate-700 rotate-90 shadow-slate-900/50'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/30'
        }`}
        aria-label="Acción rápida"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7 stroke-[2.5]" />}
      </button>
    </div>
  );
};
