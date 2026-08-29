import React, { useState } from 'react';
import { 
  Landmark, 
  Plus, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  History, 
  Edit2, 
  Trash2,
  Award,
  AlertTriangle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { Loan, LoanPayment } from '../../types';
import { LoanModal } from './LoanModal';
import { LoanPaymentModal } from './LoanPaymentModal';

export const LoansView: React.FC = () => {
  const { loans, loanPayments, displayCurrency, deleteLoan, confirmDelete } = useFinance();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState<Loan | null>(null);

  const [selectedLoanForHistory, setSelectedLoanForHistory] = useState<string | null>(
    loans[0]?.id || null
  );

  const activeLoans = loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0);
  const completedLoans = loans.filter(l => l.status === 'completed' || l.pendingBalance <= 0);

  // Cálculos globales
  const totalOriginalDebt = activeLoans.reduce((sum, l) => sum + l.originalAmount, 0);
  const totalPendingDebt = activeLoans.reduce((sum, l) => sum + l.pendingBalance, 0);
  const totalAmortized = Math.max(0, totalOriginalDebt - totalPendingDebt);
  const globalProgress = totalOriginalDebt > 0 ? Math.round((totalAmortized / totalOriginalDebt) * 100) : 0;
  const totalMonthlyCommitment = activeLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);

  const handleOpenNew = () => {
    setEditingLoan(null);
    setLoanModalOpen(true);
  };

  const handleEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setLoanModalOpen(true);
  };

  const handleDelete = (loan: Loan) => {
    confirmDelete({
      title: `¿Eliminar préstamo ${loan.name}?`,
      message: `Esta acción eliminará el préstamo y todo su historial de pagos. El saldo pendiente actual es de ${formatCurrency(loan.pendingBalance, loan.currency)}.`,
      confirmText: 'Eliminar Préstamo',
      onConfirm: () => {
        deleteLoan(loan.id);
        if (selectedLoanForHistory === loan.id) {
          setSelectedLoanForHistory(null);
        }
      }
    });
  };

  const handleOpenPayment = (loan: Loan) => {
    setSelectedLoanForPayment(loan);
    setPaymentModalOpen(true);
  };

  const displayedLoans = activeTab === 'active' ? activeLoans : completedLoans;

  // Préstamo e historial activo
  const activeLoanObj = loans.find(l => l.id === selectedLoanForHistory) || displayedLoans[0];
  const activeLoanHistory = loanPayments
    .filter(p => p.loanId === activeLoanObj?.id)
    .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Préstamos & Deudas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Saldos acumulativos: cada deuda permanece activa a través de los meses hasta saldo RD$0.00.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeLoans.length > 0 && (
            <button
              onClick={() => {
                setSelectedLoanForPayment(activeLoans[0]);
                setPaymentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all border border-indigo-500/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Cuota</span>
            </button>
          )}

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Préstamo</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Monto Original Total</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalOriginalDebt, displayCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{activeLoans.length} préstamos activos</span>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Saldo Pendiente Global</span>
          <div className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
            {formatCurrency(totalPendingDebt, displayCurrency)}
          </div>
          <span className="text-[11px] text-rose-400 mt-0.5 block">Capital adeudado por pagar</span>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Amortizado (Pagado)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-500 mt-1">
            {formatCurrency(totalAmortized, displayCurrency)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">Capital ya cancelado</span>
        </div>

        <div className="glass-panel p-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Progreso Amortización</span>
            <span className="text-indigo-500 font-bold">{globalProgress}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, globalProgress)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Compromiso mensual: {formatCurrency(totalMonthlyCommitment, displayCurrency)}/mes
          </span>
        </div>

      </div>

      {/* Pestañas: Deudas Activas vs Deudas Completadas */}
      <div className="flex items-center justify-between glass-panel p-2">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>Deudas Activas ({activeLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Deudas Completadas ({completedLoans.length})</span>
          </button>
        </div>
      </div>

      {/* Lista de Préstamos */}
      {displayedLoans.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          {activeTab === 'active' ? (
            <>
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-3 opacity-80" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                ¡Felicidades! No tienes préstamos activos pendientes
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Todas tus deudas registradas están completadas o no has agregado ninguna aún.
              </p>
            </>
          ) : (
            <>
              <History className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No hay deudas en el historial completado
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cuando una deuda activa llegue a saldo RD$0.00, se archivará automáticamente aquí.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedLoans.map((loan) => {
            const isCompleted = loan.status === 'completed' || loan.pendingBalance <= 0;
            const paidPct = loan.originalAmount > 0 
              ? Math.round(((loan.originalAmount - loan.pendingBalance) / loan.originalAmount) * 100) 
              : 100;
            const isSelected = selectedLoanForHistory === loan.id;

            return (
              <div
                key={loan.id}
                onClick={() => setSelectedLoanForHistory(loan.id)}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg'
                    : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                } ${isCompleted ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30' : ''}`}
              >
                <div>
                  {/* Cabecera */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                        style={{ backgroundColor: isCompleted ? '#10b981' : loan.color }}
                      >
                        {isCompleted ? <Award className="w-6 h-6" /> : <Landmark className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                          {loan.name}
                        </h3>
                        <span className="text-xs text-slate-400">
                          {loan.institution}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(loan); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(loan); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <div className="mb-3">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>COMPLETADA ✅ (RD$0.00)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold">
                        <span>🟢 Activa • Vence día {loan.dueDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Cifras de Saldo Pendiente vs Original */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Saldo pendiente:</span>
                      <span className={`font-black text-base ${isCompleted ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(loan.pendingBalance, loan.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Monto inicial:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(loan.originalAmount, loan.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Cuota:</span>
                      <span className="font-bold text-indigo-500">
                        {formatCurrency(loan.monthlyPayment, loan.currency)} / {loan.frequency === 'biweekly' ? 'quincena' : 'mes'}
                      </span>
                    </div>

                    {/* Barra de Progreso de Amortización */}
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{loan.paidInstallments} de {loan.totalInstallments} cuotas pagadas</span>
                        <span className="font-bold text-emerald-500">{paidPct}% pagado</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, paidPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mb-3">
                    <span>Restantes: <strong className="text-slate-700 dark:text-slate-200">{loan.remainingInstallments} cuotas</strong></span>
                    <span>Tasa: <strong className="text-slate-700 dark:text-slate-200">{loan.interestRate ? `${loan.interestRate}%` : 'Fija'}</strong></span>
                  </div>
                </div>

                {/* Botón Pagar Cuota (Solo si está activa) */}
                {!isCompleted ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPayment(loan);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md shadow-indigo-500/20 active:scale-98 flex items-center justify-center gap-1.5"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Pagar Cuota ({formatCurrency(loan.monthlyPayment, loan.currency)})</span>
                  </button>
                ) : (
                  <div className="text-center py-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 rounded-xl">
                    ✓ Totalmente Cancelado
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Historial de Pagos del Préstamo Seleccionado */}
      {activeLoanObj && (
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Historial de Amortización: {activeLoanObj.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Registro de cada cuota pagada y la evolución del saldo pendiente
                </p>
              </div>
            </div>

            {activeLoanObj.status !== 'completed' && (
              <button
                onClick={() => handleOpenPayment(activeLoanObj)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs self-start sm:self-auto"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Pagar Cuota a este Préstamo</span>
              </button>
            )}
          </div>

          {activeLoanHistory.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay pagos individuales registrados en el historial aún.
              Al registrar pagos de cuota, aparecerán listados aquí.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Cuota #</th>
                    <th className="py-2.5 px-3">Notas</th>
                    <th className="py-2.5 px-3 text-right">Monto Pagado</th>
                    <th className="py-2.5 px-3 text-right">Saldo Restante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeLoanHistory.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-medium">
                        {pay.paymentDate}
                      </td>
                      <td className="py-3 px-3 font-bold text-indigo-500">
                        Cuota #{pay.installmentNumber}
                      </td>
                      <td className="py-3 px-3 text-slate-400">
                        {pay.notes || 'Abono periódico'}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-500 whitespace-nowrap">
                        -{formatCurrency(pay.amount, activeLoanObj.currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(pay.resultingBalance, activeLoanObj.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <LoanModal
        isOpen={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        editingLoan={editingLoan}
      />

      <LoanPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedLoan={selectedLoanForPayment}
      />

    </div>
  );
};
