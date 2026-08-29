import React, { useMemo } from 'react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank,
  Wallet,
  Calendar,
  CreditCard,
  Landmark,
  Scale
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency, convertAmount } from '../../services/financeCalculations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const ReportsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    creditCards,
    loans,
    displayCurrency, 
    settings, 
    metrics, 
    selectedMonth 
  } = useFinance();

  // 1. Distribución de Gastos por Categoría (Excluyendo pagos de deuda para no duplicar)
  const categoryExpenses = useMemo(() => {
    const map = new Map<string, number>();

    transactions
      .filter(tx => tx.type === 'expense' && !tx.isDebtPayment)
      .forEach(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        const name = cat?.name || 'Otros';
        const converted = convertAmount(tx.amount, tx.currency, displayCurrency, settings.exchangeRateUSDToDOP);
        map.set(name, (map.get(name) || 0) + converted);
      });

    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    const colors = labels.map(name => {
      const cat = categories.find(c => c.name === name);
      return cat?.color || '#6366f1';
    });

    return { labels, data, colors };
  }, [transactions, categories, displayCurrency, settings]);

  // 2. Gráfico Comparativo Quincenal
  const fortnightChartData = {
    labels: ['1ra Quincena (1-15)', '2da Quincena (16-Fin)', 'Total Mes'],
    datasets: [
      {
        label: 'Ingresos Totales',
        data: [
          metrics.q1.incomePaid + metrics.q1.incomePending,
          metrics.q2.incomePaid + metrics.q2.incomePending,
          metrics.totalIncome + metrics.totalPendingIncome
        ],
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Gastos de Consumo',
        data: [
          metrics.q1.expensePaid + metrics.q1.expensePending,
          metrics.q2.expensePaid + metrics.q2.expensePending,
          metrics.totalExpense + metrics.totalPendingExpense
        ],
        backgroundColor: '#f43f5e',
        borderRadius: 8,
      }
    ]
  };

  const doughnutData = {
    labels: categoryExpenses.labels,
    datasets: [
      {
        data: categoryExpenses.data,
        backgroundColor: categoryExpenses.colors.length > 0 ? categoryExpenses.colors : ['#10b981'],
        borderWidth: 2,
        borderColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: settings.theme === 'dark' ? '#94a3b8' : '#475569',
          font: {
            family: 'Outfit, Inter, sans-serif',
            size: 11
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: settings.theme === 'dark' ? '#94a3b8' : '#475569' },
        grid: { color: settings.theme === 'dark' ? '#1e293b' : '#f1f5f9' }
      },
      y: {
        ticks: { color: settings.theme === 'dark' ? '#94a3b8' : '#475569' },
        grid: { color: settings.theme === 'dark' ? '#1e293b' : '#f1f5f9' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: settings.theme === 'dark' ? '#94a3b8' : '#475569',
          font: {
            family: 'Outfit, Inter, sans-serif',
            size: 11
          },
          boxWidth: 12
        }
      }
    }
  };

  const totalInMonth = metrics.totalIncome + metrics.totalPendingIncome;
  const totalOutMonth = metrics.totalExpense + metrics.totalPendingExpense;
  const netSavings = totalInMonth - totalOutMonth;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reportes & Análisis Financiero
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evolución del flujo de caja, distinción estricta de deudas y salud patrimonial.
        </p>
      </div>

      {/* Tarjetas de Resumen Ejecutivo y Ecuación Financiera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Flujo Neto Mensual</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${netSavings >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(netSavings, displayCurrency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ingresos menos gastos de consumo
          </p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Pagos a Deudas en el Mes</span>
            <Landmark className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">
            {formatCurrency(metrics.totalDebtPayments, displayCurrency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Abonos a tarjetas y cuotas de préstamos
          </p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Deuda Acumulada Total</span>
            <CreditCard className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-500">
            {formatCurrency(metrics.totalDebts, displayCurrency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Saldos pendientes que persisten en el tiempo
          </p>
        </div>

        <div className="glass-panel p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Patrimonio Neto</span>
            <Scale className="w-4 h-4 text-indigo-500" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${metrics.netWorth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {formatCurrency(metrics.netWorth, displayCurrency)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Activos líquidos menos deudas totales
          </p>
        </div>

      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Comparativa Quincenas e Ingresos vs Gastos */}
        <div className="glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ingresos vs Gastos de Consumo por Quincena
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Comparación quincenal sin duplicar pagos de deuda
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <Bar data={fortnightChartData} options={chartOptions} />
          </div>
        </div>

        {/* Gráfico 2: Distribución de Gastos por Categoría */}
        <div className="glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Distribución de Gastos por Categoría
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Porcentaje y monto gastado en cada rubro de consumo
            </p>
          </div>

          {categoryExpenses.data.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No hay datos de gastos registrados en este período.
            </div>
          ) : (
            <div className="h-64 sm:h-72 w-full">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          )}
        </div>

      </div>

      {/* Desglose de Tarjetas y Préstamos en Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tarjetas de Crédito */}
        <div className="glass-panel p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <CreditCard className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Estado de Tarjetas de Crédito
            </h3>
          </div>

          {creditCards.length === 0 ? (
            <p className="text-xs text-slate-400">No hay tarjetas registradas.</p>
          ) : (
            <div className="space-y-3">
              {creditCards.map(c => {
                const util = c.creditLimit > 0 ? Math.round((c.currentDebt / c.creditLimit) * 100) : 0;
                return (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{c.name}</span>
                      <span className="text-rose-500">{formatCurrency(c.currentDebt, c.currency)} adeudado</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Límite: {formatCurrency(c.creditLimit, c.currency)}</span>
                      <span>{util}% utilizado</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${Math.min(100, util)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Préstamos */}
        <div className="glass-panel p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Landmark className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Progreso de Amortización de Préstamos
            </h3>
          </div>

          {loans.filter(l => l.status !== 'completed').length === 0 ? (
            <p className="text-xs text-slate-400">No hay préstamos activos pendientes.</p>
          ) : (
            <div className="space-y-3">
              {loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0).map(l => {
                const pct = l.originalAmount > 0 ? Math.round(((l.originalAmount - l.pendingBalance) / l.originalAmount) * 100) : 0;
                return (
                  <div key={l.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-900 dark:text-white">{l.name}</span>
                      <span className="text-rose-500">{formatCurrency(l.pendingBalance, l.currency)} pendiente</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Monto original: {formatCurrency(l.originalAmount, l.currency)}</span>
                      <span>{pct}% amortizado</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
