import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, ArrowDownRight, Calendar } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard as CardType } from '../../types';
import { formatCurrency } from '../../services/financeCalculations';

interface CreditCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCard?: CardType | null;
}

export const CreditCardPaymentModal: React.FC<CreditCardPaymentModalProps> = ({
  isOpen,
  onClose,
  selectedCard
}) => {
  const { creditCards, paymentMethods, payCreditCard, displayCurrency } = useFinance();

  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [sourcePaymentMethodId, setSourcePaymentMethodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Filtrar cuentas de débito / ahorro / efectivo disponibles para pagar
  const fundingAccounts = paymentMethods.filter(pm => pm.type !== 'credit_card');

  useEffect(() => {
    if (selectedCard) {
      setCardId(selectedCard.id);
      setAmount(selectedCard.currentDebt > 0 ? selectedCard.currentDebt.toString() : '');
    } else if (creditCards.length > 0) {
      setCardId(creditCards[0].id);
      setAmount(creditCards[0].currentDebt > 0 ? creditCards[0].currentDebt.toString() : '');
    }
    if (fundingAccounts.length > 0) {
      setSourcePaymentMethodId(fundingAccounts[0].id);
    }
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  }, [isOpen, selectedCard, creditCards]);

  if (!isOpen) return null;

  const currentSelectedCard = creditCards.find(c => c.id === cardId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);

    if (!cardId || isNaN(payAmount) || payAmount <= 0) {
      alert('Por favor introduce un monto de pago válido mayor a 0');
      return;
    }

    if (!sourcePaymentMethodId) {
      alert('Por favor selecciona la cuenta de donde saldrá el dinero del pago.');
      return;
    }

    payCreditCard(cardId, payAmount, sourcePaymentMethodId, date, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Registrar Pago a Tarjeta
              </h3>
              <p className="text-xs text-slate-400">
                Reduce la deuda y libera crédito disponible
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Tarjeta a Pagar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tarjeta de Crédito Destino *
            </label>
            <select
              value={cardId}
              onChange={(e) => {
                setCardId(e.target.value);
                const c = creditCards.find(card => card.id === e.target.value);
                if (c && c.currentDebt > 0) setAmount(c.currentDebt.toString());
              }}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {creditCards.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Deuda: {formatCurrency(c.currentDebt, c.currency)})
                </option>
              ))}
            </select>
          </div>

          {currentSelectedCard && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block">Deuda Actual:</span>
                <span className="font-extrabold text-rose-500 text-sm">
                  {formatCurrency(currentSelectedCard.currentDebt, currentSelectedCard.currency)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block">Crédito Disponible:</span>
                <span className="font-extrabold text-emerald-500 text-sm">
                  {formatCurrency(Math.max(0, currentSelectedCard.creditLimit - currentSelectedCard.currentDebt), currentSelectedCard.currency)}
                </span>
              </div>
            </div>
          )}

          {/* Monto del Pago */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monto del Pago / Abono *
              </label>
              {currentSelectedCard && currentSelectedCard.currentDebt > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentSelectedCard.currentDebt.toString())}
                  className="text-[11px] font-bold text-emerald-500 hover:underline"
                >
                  Pagar Total
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
                {currentSelectedCard?.currency || 'DOP'}
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

          {/* Fecha */}
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
              placeholder="Ej: Pago total del corte de agosto..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
            />
          </div>

          <p className="text-[11px] text-slate-400 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/15">
            ℹ️ Este movimiento descontará el dinero de tu cuenta líquida y reducirá la deuda de la tarjeta sin duplicarse como gasto de consumo en los reportes.
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
              className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
            >
              Confirmar Pago
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
