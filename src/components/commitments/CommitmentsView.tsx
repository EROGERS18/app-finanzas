import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Calendar, 
  CheckCheck, 
  AlertCircle, 
  Filter,
  Plus
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';

export const CommitmentsView: React.FC = () => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    displayCurrency, 
    toggleTransactionStatus, 
    openQuickModal,
    metrics,
    selectedFortnight,
    setSelectedFortnight
  } = useFinance();

  const [statusFilter, setStatusFilter] = useState<'pending' | 'paid' | 'all'>('pending');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Gastos (compromisos) filtrados por quincena global y estado
  const commitments = transactions
    .filter(tx => tx.type === 'expense')
    .filter(tx => {
      if (selectedFortnight !== 'all' && tx.fortnight !== selectedFortnight) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    })
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
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Próximos Pagos & Quincenas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gestiona compromisos fijos y pagos programados para proteger tu disponible real.
          </p>
        </div>

        <button
          onClick={() => openQuickModal('expense')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Programar Pago</span>
        </button>
      </div>

      {/* Pestañas de Quincena y Filtros de Estado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-3">
        
        {/* Selector de Quincena (Sincronizado con Navbar superior) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setSelectedFortnight('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFortnight === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todas las Quincenas
          </button>
          <button
            onClick={() => setSelectedFortnight('q1')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFortnight === 'q1'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            1ra Quincena (1-15)
          </button>
          <button
            onClick={() => setSelectedFortnight('q2')}
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFortnight === 'q2'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            2da Quincena (16-Fin)
          </button>
        </div>

        {/* Filtro de Estado */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold hidden sm:inline">Mostrar:</span>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'paid'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pagados
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

      </div>

      {/* Grid de Tarjetas de Compromisos */}
      {commitments.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-80" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No hay compromisos en esta sección
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cambia los filtros o añade un nuevo compromiso haciendo clic en "Programar Pago".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {commitments.map((bill) => {
            const cat = categories.find(c => c.id === bill.categoryId);
            const pm = paymentMethods.find(p => p.id === bill.paymentMethodId);
            const badge = getDueBadge(bill.dueDate || bill.date);
            const isPaid = bill.status === 'paid';

            return (
              <div
                key={bill.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isPaid
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 shadow-md hover:border-indigo-500/50 hover:shadow-xl'
                }`}
              >
                <div>
                  {/* Cabecera de la Tarjeta */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: cat?.color || '#6366f1' }}
                      >
                        <IconHelper name={cat?.icon || 'Tag'} className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                          {bill.title}
                        </h4>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {cat?.name || 'General'}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                      isPaid
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                        : badge.color
                    }`}>
                      {isPaid ? '✓ Pagado' : badge.text}
                    </span>
                  </div>

                  {/* Monto */}
                  <div className="my-4">
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                      {formatCurrency(bill.amount, bill.currency)}
                    </div>
                    {bill.currency !== displayCurrency && (
                      <span className="block text-xs text-slate-400 mt-0.5">
                        ≈ {formatCurrency(bill.amount, displayCurrency)}
                      </span>
                    )}
                  </div>

                  {/* Detalles adicionales */}
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl mb-4">
                    <div className="flex justify-between">
                      <span>Cuenta de Pago:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{pm?.name || 'Efectivo'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vencimiento:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{bill.dueDate || bill.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quincena:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">
                        {bill.fortnight === 'q1' ? '1ra Quincena (1-15)' : '2da Quincena (16-Fin)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón de Pago / Desmarcar */}
                <button
                  onClick={() => toggleTransactionStatus(bill.id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isPaid
                      ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 active:scale-98'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isPaid ? 'Marcar como Pendiente' : 'Marcar como Pagado'}</span>
                </button>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
