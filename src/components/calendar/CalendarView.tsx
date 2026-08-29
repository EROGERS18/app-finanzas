import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';
import { Transaction } from '../../types';

export const CalendarView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    displayCurrency, 
    toggleTransactionStatus,
    openQuickModal,
    selectedMonth,
    setSelectedMonth 
  } = useFinance();

  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().slice(0, 10));

  const [year, month] = selectedMonth.split('-').map(Number);

  // Navegación de mes
  const handlePrevMonth = () => {
    const date = new Date(year, month - 2, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  const handleNextMonth = () => {
    const date = new Date(year, month, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  // Construcción de la cuadrícula de días
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0: Dom, 1: Lun, etc.
  const daysInMonth = new Date(year, month, 0).getDate();

  // Ajustar para que la semana empiece en Lunes (0: Lun ... 6: Dom)
  const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const calendarDays = [];
  for (let i = 0; i < adjustedFirstDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarDays.push(dayStr);
  }

  // Transacciones del día seleccionado
  const selectedDayTransactions = transactions.filter(tx => {
    const targetDate = tx.dueDate || tx.date;
    return targetDate === selectedDay;
  });

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Calendario de Compromisos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visualiza cuándo vencen tus facturas, cuotas e ingresos programados.
          </p>
        </div>

        {/* Selector de Mes */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize min-w-[140px] text-center">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cuadrícula del Calendario y Panel Lateral */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendario (2 Columnas) */}
        <div className="lg:col-span-2 glass-panel p-5 sm:p-6">
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mié</div>
            <div>Jue</div>
            <div>Vie</div>
            <div>Sáb</div>
            <div>Dom</div>
          </div>

          {/* Días del Mes */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((dayStr, index) => {
              if (!dayStr) {
                return <div key={`empty-${index}`} className="h-16 sm:h-20 rounded-xl bg-slate-50/40 dark:bg-slate-900/20" />;
              }

              const dayNumber = parseInt(dayStr.split('-')[2], 10);
              const dayTxList = transactions.filter(tx => (tx.dueDate || tx.date) === dayStr);
              
              const hasIncome = dayTxList.some(tx => tx.type === 'income');
              const hasPendingExpense = dayTxList.some(tx => tx.type === 'expense' && tx.status === 'pending');
              const hasPaidExpense = dayTxList.some(tx => tx.type === 'expense' && tx.status === 'paid');

              const isSelected = selectedDay === dayStr;
              const isToday = new Date().toISOString().slice(0, 10) === dayStr;

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDay(dayStr)}
                  className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all relative ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
                      : isToday
                      ? 'bg-slate-100 dark:bg-slate-800 border-indigo-500/50'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs sm:text-sm font-bold ${
                      isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {dayNumber}
                    </span>
                    {dayNumber === 15 && (
                      <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/10 text-emerald-500 hidden sm:inline">
                        1ra Q
                      </span>
                    )}
                    {dayNumber === daysInMonth && (
                      <span className="text-[9px] font-bold px-1 rounded bg-indigo-500/10 text-indigo-500 hidden sm:inline">
                        2da Q
                      </span>
                    )}
                  </div>

                  {/* Indicadores de Eventos */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {hasIncome && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Ingreso" />
                    )}
                    {hasPendingExpense && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Pago Pendiente" />
                    )}
                    {hasPaidExpense && (
                      <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-600" title="Gasto Pagado" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Leyenda del Calendario */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Ingreso / Cobro</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Pago Pendiente / Compromiso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span>Gasto Pagado</span>
            </div>
          </div>

        </div>

        {/* Panel Lateral: Detalle del Día Seleccionado */}
        <div className="glass-panel p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Eventos del Día
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDay}
                </h3>
              </div>
              <button
                onClick={() => openQuickModal('expense')}
                className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                title="Añadir evento a este día"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {selectedDayTransactions.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                <CalendarIcon className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                No hay compromisos ni movimientos programados para esta fecha.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDayTransactions.map(tx => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: cat?.color || '#10b981' }}
                          >
                            <IconHelper name={cat?.icon || 'Tag'} className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {tx.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {cat?.name}
                            </span>
                          </div>
                        </div>

                        <span className={`text-xs font-extrabold ${
                          isIncome ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px]">
                        <span className={`font-semibold ${tx.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {tx.status === 'paid' ? '✓ Pagado' : '⏳ Pendiente'}
                        </span>

                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {tx.status === 'paid' ? 'Marcar Pendiente' : 'Marcar Pagado'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Usa el calendario para planificar pagos antes del corte quincenal.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
