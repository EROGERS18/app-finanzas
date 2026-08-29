import React from 'react';
import { ArrowDownRight, ArrowUpRight, Calendar, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';

export const FortnightSummary: React.FC = () => {
  const { metrics, displayCurrency, selectedFortnight, setSelectedFortnight } = useFinance();

  const q1TotalIn = metrics.q1.incomePaid + metrics.q1.incomePending;
  const q1TotalOut = metrics.q1.expensePaid + metrics.q1.expensePending;
  const q2TotalIn = metrics.q2.incomePaid + metrics.q2.incomePending;
  const q2TotalOut = metrics.q2.expensePaid + metrics.q2.expensePending;

  return (
    <div className="glass-panel p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Control de Quincenas
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Flujo de caja comparativo: 1–15 vs 16–Fin de mes
          </p>
        </div>

        {/* Selector de Quincena */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSelectedFortnight('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedFortnight === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Ambas
          </button>
          <button
            onClick={() => setSelectedFortnight('q1')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedFortnight === 'q1'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            1ra Q (1-15)
          </button>
          <button
            onClick={() => setSelectedFortnight('q2')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedFortnight === 'q2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            2da Q (16-Fin)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Tarjeta Quincena 1 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          selectedFortnight === 'q1' || selectedFortnight === 'all'
            ? 'bg-gradient-to-br from-emerald-500/10 via-slate-50 to-white dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-slate-900 border-emerald-500/30 ring-2 ring-emerald-500/20'
            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                1ra Quincena (1 – 15)
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Neto: {formatCurrency(metrics.q1.netCashFlow, displayCurrency)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Entradas Totales</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                {formatCurrency(q1TotalIn, displayCurrency)}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Cobrado: {formatCurrency(metrics.q1.incomePaid, displayCurrency)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Salidas Totales</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                {formatCurrency(q1TotalOut, displayCurrency)}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Pagado: {formatCurrency(metrics.q1.expensePaid, displayCurrency)}
              </div>
            </div>
          </div>

          {/* Barra de Proporción Salidas vs Entradas */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Compromiso de ingresos</span>
              <span>{q1TotalIn > 0 ? Math.round((q1TotalOut / q1TotalIn) * 100) : 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, q1TotalIn > 0 ? (q1TotalOut / q1TotalIn) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tarjeta Quincena 2 */}
        <div className={`p-4 rounded-2xl border transition-all ${
          selectedFortnight === 'q2' || selectedFortnight === 'all'
            ? 'bg-gradient-to-br from-indigo-500/10 via-slate-50 to-white dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-slate-900 border-indigo-500/30 ring-2 ring-indigo-500/20'
            : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                2da Quincena (16 – Fin)
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Neto: {formatCurrency(metrics.q2.netCashFlow, displayCurrency)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Entradas Totales</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
                {formatCurrency(q2TotalIn, displayCurrency)}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Cobrado: {formatCurrency(metrics.q2.incomePaid, displayCurrency)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 font-medium block">Salidas Totales</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                {formatCurrency(q2TotalOut, displayCurrency)}
              </span>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Pendiente: {formatCurrency(metrics.q2.expensePending, displayCurrency)}
              </div>
            </div>
          </div>

          {/* Barra de Proporción Salidas vs Entradas */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Compromiso de ingresos</span>
              <span>{q2TotalIn > 0 ? Math.round((q2TotalOut / q2TotalIn) * 100) : 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, q2TotalIn > 0 ? (q2TotalOut / q2TotalIn) * 100 : 0)}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
