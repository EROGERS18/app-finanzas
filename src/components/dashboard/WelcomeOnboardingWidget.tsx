import React from 'react';
import { Sparkles, ArrowUpRight, CreditCard, ArrowDownRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { ActiveTab } from '../common/Sidebar';

interface WelcomeOnboardingWidgetProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenQuickIncome: () => void;
  onOpenQuickExpense: () => void;
  hasIncome: boolean;
  hasDebts: boolean;
  hasExpenses: boolean;
  onDismiss?: () => void;
}

export const WelcomeOnboardingWidget: React.FC<WelcomeOnboardingWidgetProps> = ({
  onNavigateTab,
  onOpenQuickIncome,
  onOpenQuickExpense,
  hasIncome,
  hasDebts,
  hasExpenses,
  onDismiss
}) => {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/10 border border-emerald-500/30 shadow-xl space-y-6">
      
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Configuración Inicial de DomiFinan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            ¡Bienvenido a tu Centro de Control Financiero!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            Sigue estos 3 sencillos pasos para configurar tu situación financiera y transformar este panel en tu resumen inteligente en tiempo real.
          </p>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            Ocultar Guía
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Paso 1: Agrega tus ingresos */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          hasIncome 
            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-100' 
            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                Paso 1
              </span>
              {hasIncome ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ArrowUpRight className="w-5 h-5 text-slate-400" />}
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              💰 Agrega tus Ingresos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra tu salario por quincena o tus ingresos recurrentes.
            </p>
          </div>

          <button
            onClick={onOpenQuickIncome}
            className="mt-4 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <span>+ Agregar Ingreso</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Paso 2: Registra tus tarjetas/préstamos */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          hasDebts 
            ? 'bg-purple-500/10 border-purple-500/40 text-purple-900 dark:text-purple-100' 
            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-purple-600 dark:text-purple-400">
                Paso 2
              </span>
              {hasDebts ? <CheckCircle2 className="w-5 h-5 text-purple-500" /> : <CreditCard className="w-5 h-5 text-slate-400" />}
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              💳 Registra tus Tarjetas y Préstamos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Añade tus tarjetas de crédito y préstamos para calcular tu patrimonio real.
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('cards')}
            className="mt-4 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <span>Configurar Tarjetas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Paso 3: Comienza a registrar tus gastos */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
          hasExpenses 
            ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-100' 
            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-rose-600 dark:text-rose-400">
                Paso 3
              </span>
              {hasExpenses ? <CheckCircle2 className="w-5 h-5 text-rose-500" /> : <ArrowDownRight className="w-5 h-5 text-slate-400" />}
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              🧾 Registra tus Gastos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra tus consumos quincenales para controlar tu presupuesto.
            </p>
          </div>

          <button
            onClick={onOpenQuickExpense}
            className="mt-4 py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <span>+ Registrar Gasto</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
