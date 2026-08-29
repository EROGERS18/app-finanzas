import React, { useState, useEffect } from 'react';
import { X, CreditCard as CardIcon, DollarSign, Calendar, Landmark } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CreditCard, CurrencyCode } from '../../types';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCard: CreditCard | null;
}

const CARD_COLORS = [
  '#059669', // Emerald
  '#0284c7', // Sky
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#e11d48', // Rose
  '#d97706', // Amber
  '#0f172a', // Slate/Dark
];

export const CreditCardModal: React.FC<CreditCardModalProps> = ({ isOpen, onClose, editingCard }) => {
  const { addCreditCard, updateCreditCard, settings } = useFinance();

  const [name, setName] = useState('');
  const [bank, setBank] = useState('Banco Popular');
  const [cardNumberMasked, setCardNumberMasked] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentDebt, setCurrentDebt] = useState('0');
  const [cutOffDay, setCutOffDay] = useState('18');
  const [paymentDueDay, setPaymentDueDay] = useState('8');
  const [interestRate, setInterestRate] = useState('');
  const [color, setColor] = useState('#059669');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.primaryCurrency);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  useEffect(() => {
    if (editingCard) {
      setName(editingCard.name);
      setBank(editingCard.bank);
      setCardNumberMasked(editingCard.cardNumberMasked);
      setCreditLimit(editingCard.creditLimit.toString());
      setCurrentDebt(editingCard.currentDebt.toString());
      setCutOffDay(editingCard.cutOffDay.toString());
      setPaymentDueDay(editingCard.paymentDueDay.toString());
      setInterestRate(editingCard.interestRate ? editingCard.interestRate.toString() : '');
      setColor(editingCard.color);
      setCurrency(editingCard.currency);
      setStatus(editingCard.status);
    } else {
      setName('');
      setBank('Banco Popular');
      setCardNumberMasked('');
      setCreditLimit('');
      setCurrentDebt('0');
      setCutOffDay('18');
      setPaymentDueDay('8');
      setInterestRate('28.0');
      setColor('#059669');
      setCurrency(settings.primaryCurrency);
      setStatus('active');
    }
  }, [isOpen, editingCard, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(creditLimit);
    const debt = parseFloat(currentDebt) || 0;
    const cutDay = parseInt(cutOffDay, 10);
    const dueDay = parseInt(paymentDueDay, 10);

    if (!name.trim() || isNaN(limit) || limit <= 0) {
      alert('Por favor ingresa un nombre y un límite de crédito válido mayor a 0');
      return;
    }

    let masked = cardNumberMasked.trim();
    if (masked && !masked.startsWith('****')) {
      masked = `**** ${masked.slice(-4)}`;
    }
    if (!masked) masked = '**** 0000';

    const cardPayload = {
      name: name.trim(),
      bank: bank.trim() || 'Banco',
      cardNumberMasked: masked,
      creditLimit: limit,
      currentDebt: debt,
      cutOffDay: cutDay || 18,
      paymentDueDay: dueDay || 8,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      color,
      currency,
      status,
    };

    if (editingCard) {
      updateCreditCard({
        ...editingCard,
        ...cardPayload
      });
    } else {
      addCreditCard(cardPayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CardIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCard ? 'Editar Tarjeta de Crédito' : 'Nueva Tarjeta de Crédito'}
              </h3>
              <p className="text-xs text-slate-400">
                Registra límites, fechas de corte y saldo adeudado
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Nombre y Banco */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de la Tarjeta *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Visa Popular Platinum"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Banco / Emisor
              </label>
              <input
                type="text"
                placeholder="Ej: Banco Popular, Banreservas, BHD"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Número enmascarado y Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Número enmascarado (últimos 4 dígitos)
              </label>
              <input
                type="text"
                placeholder="**** 4582"
                value={cardNumberMasked}
                onChange={(e) => setCardNumberMasked(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
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
                <option value="DOP">RD$</option>
                <option value="USD">US$</option>
              </select>
            </div>
          </div>

          {/* Límite de Crédito y Deuda Actual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Límite de Crédito Total *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000.00"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Saldo Actual Adeudado
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="35500.00"
                  value={currentDebt}
                  onChange={(e) => setCurrentDebt(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base text-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Fechas de Corte y Límite de Pago */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Día de Corte Mensual
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                placeholder="Ej: 18"
                value={cutOffDay}
                onChange={(e) => setCutOffDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
              <span className="text-[10px] text-slate-400">Día de cierre del estado</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Día Límite de Pago
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                placeholder="Ej: 8"
                value={paymentDueDay}
                onChange={(e) => setPaymentDueDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold text-indigo-600 dark:text-indigo-400"
              />
              <span className="text-[10px] text-slate-400">Fecha límite sin mora</span>
            </div>
          </div>

          {/* Tasa de interés opcional y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tasa de Interés Anual % (opcional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 28.0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="active">🟢 Activa</option>
                <option value="inactive">⚪ Inactiva / Bloqueada</option>
              </select>
            </div>
          </div>

          {/* Color identificativo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Color de la Tarjeta
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {CARD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-xl transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              {editingCard ? 'Guardar Cambios' : 'Registrar Tarjeta'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
