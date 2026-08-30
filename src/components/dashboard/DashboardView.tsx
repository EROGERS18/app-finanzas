import React from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck,
  CreditCard,
  Plus,
  Landmark,
  Clock,
  Scale,
  ArrowRight,
  TrendingDown,
  Percent
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { MetricCard } from '../common/MetricCard';
import { FortnightSummary } from './FortnightSummary';
import { UpcomingBillsCard } from './UpcomingBillsCard';
import { RecentTransactions } from './RecentTransactions';
import { BudgetProgressWidget } from './BudgetProgressWidget';
import { ActiveTab } from '../common/Sidebar';
import { Tooltip } from '../common/Tooltip';
import { WelcomeOnboardingWidget } from './WelcomeOnboardingWidget';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { 
    transactions,
    paymentMethods,
    metrics, 
    creditCards, 
    loans, 
    displayCurrency, 
    openQuickModal 
  } = useFinance();

  const activeLoans = loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y Botones de Acción Rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Centro de Control Financiero
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Saldos disponibles, flujo de caja, deudas acumulativas y patrimonio neto.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('cards')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold transition-all border border-purple-500/20"
          >
            <CreditCard className="w-4 h-4" />
            <span>Tarjetas</span>
          </button>

          <button
            onClick={() => setActiveTab('loans')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-500/20"
          >
            <Landmark className="w-4 h-4" />
            <span>Préstamos</span>
          </button>

          <button
            onClick={() => openQuickModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Ingreso</span>
          </button>

          <button
            onClick={() => openQuickModal('expense')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Gasto</span>
          </button>
        </div>
      </div>

      {/* Si la cuenta no tiene registros ni cuentas creadas, mostrar Widget de Bienvenida */}
      {transactions.length === 0 && creditCards.length === 0 && loans.length === 0 && paymentMethods.length === 0 && (
        <WelcomeOnboardingWidget
          onNavigateTab={setActiveTab}
          onOpenQuickIncome={() => openQuickModal('income')}
          onOpenQuickExpense={() => openQuickModal('expense')}
          hasIncome={metrics.totalIncome > 0}
          hasDebts={metrics.totalDebts > 0}
          hasExpenses={metrics.totalExpense > 0}
        />
      )}

      {/* 6 Tarjetas de Resumen Solicitadas con Ayudas Contextuales Tooltip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        
        {/* 1. Dinero Disponible */}
        <div className="glass-panel p-4 flex flex-col justify-between border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Dinero Disponible</span>
              <Tooltip title="Dinero Disponible" content="Suma total de fondos líquidos en tus cuentas bancarias, ahorros y efectivo." />
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formatCurrency(metrics.currentBalance, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">En bancos y efectivo</span>
          </div>
        </div>

        {/* 2. Ingresos */}
        <div className="glass-panel p-4 flex flex-col justify-between border-blue-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Ingresos</span>
              <Tooltip title="Ingresos Totales" content="Monto de salario u otros ingresos cobrados en el período seleccionado." />
            </div>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(metrics.totalIncome, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">Cobrados en el período</span>
          </div>
        </div>

        {/* 3. Gastos */}
        <div className="glass-panel p-4 flex flex-col justify-between border-rose-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Gastos Consumo</span>
              <Tooltip title="Gastos de Consumo" content="Consumos del período. Se excluyen pagos a tarjetas o préstamos para no computar doble gasto." />
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-rose-500">
              {formatCurrency(metrics.totalExpense, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">Sin duplicar pagos de deuda</span>
          </div>
        </div>

        {/* 4. Deudas Totales Acumulativas */}
        <div className="glass-panel p-4 flex flex-col justify-between border-purple-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Deudas Totales</span>
              <Tooltip title="Deudas Acumulativas" content="Suma del saldo adeudado en tarjetas de crédito y saldo pendiente en préstamos activos." />
            </div>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
              {formatCurrency(metrics.totalDebts, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">Tarjetas + Préstamos</span>
          </div>
        </div>

        {/* 5. Pagos Pendientes del Período */}
        <div className="glass-panel p-4 flex flex-col justify-between border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pagos Pendientes</span>
              <Tooltip title="Pagos Pendientes" content="Gastos y facturas pendientes de pago registradas para esta quincena o mes." />
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-amber-500">
              {formatCurrency(metrics.totalPendingExpense, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">Compromisos por pagar</span>
          </div>
        </div>

        {/* 6. Crédito Disponible */}
        <div className="glass-panel p-4 flex flex-col justify-between border-teal-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Crédito Disponible</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400">
              {formatCurrency(metrics.totalAvailableCredit, displayCurrency)}
            </div>
            <span className="text-[10px] text-slate-400 block">Margen libre en tarjetas</span>
          </div>
        </div>

      </div>

      {/* Banner de Patrimonio / Situación Financiera Real */}
      <div 
        onClick={() => setActiveTab('networth')}
        className="glass-panel p-5 cursor-pointer hover:border-indigo-500/40 transition-all group"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">
                Situación Financiera & Patrimonio Neto
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span>{formatCurrency(metrics.netWorth, displayCurrency)}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  metrics.netWorth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {metrics.netWorth >= 0 ? 'Patrimonio Positivo' : 'Patrimonio Negativo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Activos Líquidos:</span>
              <span className="text-emerald-500 font-bold">+{formatCurrency(metrics.currentBalance, displayCurrency)}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Deudas Totales:</span>
              <span className="text-rose-500 font-bold">-{formatCurrency(metrics.totalDebts, displayCurrency)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 9: MIS DEUDAS (Tarjetas y Préstamos con barras de progreso) */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <TrendingDown className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Mis Deudas ({creditCards.length + activeLoans.length})
              </h3>
              <p className="text-xs text-slate-400">
                Saldos acumulativos que permanecen activos hasta saldo RD$0.00
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cards')}
              className="text-xs font-bold text-purple-500 hover:underline"
            >
              Ver Tarjetas ({creditCards.length})
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={() => setActiveTab('loans')}
              className="text-xs font-bold text-indigo-500 hover:underline"
            >
              Ver Préstamos ({activeLoans.length})
            </button>
          </div>
        </div>

        {creditCards.length === 0 && activeLoans.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No tienes deudas activas registradas. ¡Excelente salud financiera!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Tarjetas de crédito */}
            {creditCards.map(c => {
              const util = c.creditLimit > 0 ? Math.round((c.currentDebt / c.creditLimit) * 100) : 0;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveTab('cards')}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-500" />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {c.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.bank} ({c.cardNumberMasked})</span>
                    </div>

                    <span className="text-xs font-black text-rose-500">
                      {formatCurrency(c.currentDebt, c.currency)}
                    </span>
                  </div>

                  {/* Barra de Utilización */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Límite: {formatCurrency(c.creditLimit, c.currency)}</span>
                      <span className="font-bold text-purple-500">{util}% utilizado</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${util > 70 ? 'bg-rose-500' : util > 40 ? 'bg-amber-500' : 'bg-purple-500'}`}
                        style={{ width: `${Math.min(100, util)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Préstamos activos */}
            {activeLoans.map(l => {
              const paidPct = l.originalAmount > 0 
                ? Math.round(((l.originalAmount - l.pendingBalance) / l.originalAmount) * 100) 
                : 0;
              return (
                <div
                  key={l.id}
                  onClick={() => setActiveTab('loans')}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-4 h-4 text-indigo-500" />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {l.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">{l.institution} • Cuota {formatCurrency(l.monthlyPayment, l.currency)}</span>
                    </div>

                    <span className="text-xs font-black text-rose-500">
                      {formatCurrency(l.pendingBalance, l.currency)}
                    </span>
                  </div>

                  {/* Barra de Progreso de Pago */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Restante: {l.remainingInstallments} cuotas</span>
                      <span className="font-bold text-indigo-500">{paidPct}% cancelado</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, paidPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Módulo Especial de Quincenas (1-15 y 16-Fin) */}
      <FortnightSummary />

      {/* Próximos Pagos y Compromisos */}
      <UpcomingBillsCard onViewAll={() => setActiveTab('commitments')} />

      {/* Grilla inferior: Presupuestos y Transacciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgressWidget onViewAll={() => setActiveTab('budgets')} />
        <RecentTransactions onViewAll={() => setActiveTab('transactions')} />
      </div>

    </div>
  );
};
