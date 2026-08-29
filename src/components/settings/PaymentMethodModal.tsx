import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { PaymentMethod, PaymentMethodType, CurrencyCode } from '../../types';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pm: Omit<PaymentMethod, 'id'> | PaymentMethod) => void;
  editingMethod: PaymentMethod | null;
}

export const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingMethod
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodType>('bank_account');
  const [bankName, setBankName] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('DOP');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [cutOffDay, setCutOffDay] = useState('');
  const [paymentDueDay, setPaymentDueDay] = useState('');

  useEffect(() => {
    if (editingMethod) {
      setName(editingMethod.name);
      setType(editingMethod.type);
      setBankName(editingMethod.bankName || '');
      setLastFour(editingMethod.lastFour || '');
      setCurrency(editingMethod.currency);
      setBalance(editingMethod.balance !== undefined ? editingMethod.balance.toString() : '');
      setCreditLimit(editingMethod.creditLimit !== undefined ? editingMethod.creditLimit.toString() : '');
      setCutOffDay(editingMethod.cutOffDay ? editingMethod.cutOffDay.toString() : '');
      setPaymentDueDay(editingMethod.paymentDueDay ? editingMethod.paymentDueDay.toString() : '');
    } else {
      setName('');
      setType('bank_account');
      setBankName('Banco Popular');
      setLastFour('');
      setCurrency('DOP');
      setBalance('');
      setCreditLimit('');
      setCutOffDay('18');
      setPaymentDueDay('8');
    }
  }, [isOpen, editingMethod]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      type,
      bankName: bankName.trim() || undefined,
      lastFour: lastFour.trim() || undefined,
      currency,
      balance: balance ? parseFloat(balance) : 0,
      creditLimit: type === 'credit_card' && creditLimit ? parseFloat(creditLimit) : undefined,
      cutOffDay: type === 'credit_card' && cutOffDay ? parseInt(cutOffDay, 10) : undefined,
      paymentDueDay: type === 'credit_card' && paymentDueDay ? parseInt(paymentDueDay, 10) : undefined,
      color: type === 'credit_card' ? '#e11d48' : '#0284c7'
    };

    if (editingMethod) {
      onSave({
        ...editingMethod,
        ...payload
      });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingMethod ? 'Editar Cuenta / Método' : 'Nueva Cuenta o Tarjeta'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Cuenta / Tarjeta *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Nómina Banreservas, Tarjeta BHD Visa..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tipo de Método y Moneda */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PaymentMethodType)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="bank_account">Cuenta Corriente / Nómina</option>
                <option value="savings_account">Cuenta de Ahorros</option>
                <option value="credit_card">Tarjeta de Crédito</option>
                <option value="debit_card">Tarjeta de Débito</option>
                <option value="cash">Efectivo en Mano</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="DOP">RD$ (DOP)</option>
                <option value="USD">US$ (USD)</option>
              </select>
            </div>
          </div>

          {/* Banco e Identificador */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Banco / Entidad
              </label>
              <input
                type="text"
                placeholder="Ej: Banreservas, Popular, BHD..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Últimos 4 dígitos
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ej: 4589"
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Campos específicos de Tarjeta de Crédito */}
          {type === 'credit_card' ? (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                  Límite de Crédito ({currency})
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    Día de Corte
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ej: 18"
                    value={cutOffDay}
                    onChange={(e) => setCutOffDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-indigo-900 dark:text-indigo-200 mb-1">
                    Día Límite Pago
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Ej: 8"
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Saldo Inicial / Actual ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

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
              Guardar Cuenta
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
