import React, { useState, useEffect } from 'react';
import { X, DollarSign, Landmark, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Loan } from '../../types';
import { formatCurrency } from '../../services/financeCalculations';

interface LoanPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLoan?: Loan | null;
}

export const LoanPaymentModal: React.FC<LoanPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedLoan
}) => {
  const { loans, paymentMethods, payLoanInstallment } = useFinance();

  const activeLoans = loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0);
  const fundingAccounts = paymentMethods.filter(pm => pm.type !== 'credit_card');

  const [loanId, setLoanId] = useState('');
  const [amount, setAmount] = useState('');
  const [sourcePaymentMethodId, setSourcePaymentMethodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (selectedLoan) {
      setLoanId(selectedLoan.id);
      setAmount(selectedLoan.monthlyPayment ? selectedLoan.monthlyPayment.toString() : '');
    } else if (activeLoans.length > 0) {
      setLoanId(activeLoans[0].id);
      setAmount(activeLoans[0].monthlyPayment ? activeLoans[0].monthlyPayment.toString() : '');
    }
    if (fundingAccounts.length > 0) {
      setSourcePaymentMethodId(fundingAccounts[0].id);
    }
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  }, [isOpen, selectedLoan, activeLoans]);

  if (!isOpen) return null;

  const currentLoan = loans.find(l => l.id === loanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);

    if (!loanId || isNaN(payAmount) || payAmount <= 0) {
      alert('Por favor introduce un monto de cuota válido mayor a 0');
      return;
    }

    if (!sourcePaymentMethodId) {
      alert('Por favor selecciona la cuenta de donde saldrá el dinero del pago.');
      return;
    }

    payLoanInstallment(loanId, payAmount, sourcePaymentMethodId, date, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registrar Pago de Cuota
              </h3>
              <p className="text-xs text-slate-400">
                Amortiza la deuda y actualiza el saldo pendiente
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Préstamo a Pagar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Préstamo / Deuda a Pagar *
            </label>
            <select
              value={loanId}
              onChange={(e) => {
                setLoanId(e.target.value);
                const l = loans.find(loan => loan.id === e.target.value);
                if (l) setAmount(l.monthlyPayment.toString());
              }}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {activeLoans.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name} (Pendiente: {formatCurrency(l.pendingBalance, l.currency)})
                </option>
              ))}
            </select>
          </div>

          {currentLoan && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Saldo Pendiente:</span>
                <span className="font-extrabold text-rose-500 text-sm">
                  {formatCurrency(currentLoan.pendingBalance, currentLoan.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Cuotas Restantes:</span>
                <span className="font-extrabold text-indigo-500 text-sm">
                  {currentLoan.remainingInstallments} de {currentLoan.totalInstallments}
                </span>
              </div>
            </div>
          )}

          {/* Monto de la Cuota */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monto del Pago *
              </label>
              {currentLoan && (
                <button
                  type="button"
                  onClick={() => setAmount(currentLoan.monthlyPayment.toString())}
                  className="text-[11px] font-bold text-indigo-500 hover:underline"
                >
                  Cuota exacta ({formatCurrency(currentLoan.monthlyPayment, currentLoan.currency)})
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                {currentLoan?.currency || 'DOP'}
              </span>
            </div>
          </div>

          {/* Cuenta de Origen del Dinero */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              ¿De qué cuenta sale el dinero? *
            </label>
            <select
              value={sourcePaymentMethodId}
              onChange={(e) => setSourcePaymentMethodId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {fundingAccounts.map(pm => (
                <option key={pm.id} value={pm.id}>
                  {pm.name} (Saldo: {formatCurrency(pm.balance || 0, pm.currency)})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha del Pago */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Fecha del Pago
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas / Comprobante (opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Cuota 7 pagada por transferencia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <p className="text-[11px] text-slate-400 bg-indigo-500/5 p-2.5 rounded-xl border border-indigo-500/15">
            ℹ️ Este movimiento amortiza tu deuda reduciendo el saldo acumulado y descuenta el dinero de tu cuenta líquida sin duplicar gastos en los reportes.
          </p>

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
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
            >
              Registrar Cuota
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
