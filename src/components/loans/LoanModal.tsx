import React, { useState, useEffect } from 'react';
import { X, Landmark, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Loan, CurrencyCode } from '../../types';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLoan: Loan | null;
}

const LOAN_COLORS = [
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#059669', // Emerald
  '#ef4444', // Red
];

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, editingLoan }) => {
  const { addLoan, updateLoan, settings } = useFinance();

  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Banco BHD');
  const [originalAmount, setOriginalAmount] = useState('');
  const [pendingBalance, setPendingBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('15');
  const [frequency, setFrequency] = useState<'monthly' | 'biweekly'>('monthly');
  const [interestRate, setInterestRate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('12');
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [category, setCategory] = useState<'personal' | 'vehicle' | 'mortgage' | 'business' | 'other'>('personal');
  const [color, setColor] = useState('#3b82f6');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.primaryCurrency);

  useEffect(() => {
    if (editingLoan) {
      setName(editingLoan.name);
      setInstitution(editingLoan.institution);
      setOriginalAmount(editingLoan.originalAmount.toString());
      setPendingBalance(editingLoan.pendingBalance.toString());
      setMonthlyPayment(editingLoan.monthlyPayment.toString());
      setStartDate(editingLoan.startDate);
      setDueDate(editingLoan.dueDate);
      setFrequency(editingLoan.frequency);
      setInterestRate(editingLoan.interestRate ? editingLoan.interestRate.toString() : '');
      setTotalInstallments(editingLoan.totalInstallments.toString());
      setPaidInstallments(editingLoan.paidInstallments.toString());
      setCategory(editingLoan.category);
      setColor(editingLoan.color);
      setCurrency(editingLoan.currency);
    } else {
      setName('');
      setInstitution('Banco BHD');
      setOriginalAmount('');
      setPendingBalance('');
      setMonthlyPayment('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setDueDate('15');
      setFrequency('monthly');
      setInterestRate('14.5');
      setTotalInstallments('12');
      setPaidInstallments('0');
      setCategory('personal');
      setColor('#3b82f6');
      setCurrency(settings.primaryCurrency);
    }
  }, [isOpen, editingLoan, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const origAmt = parseFloat(originalAmount);
    const pendBal = pendingBalance ? parseFloat(pendingBalance) : origAmt;
    const payment = parseFloat(monthlyPayment);
    const totalInst = parseInt(totalInstallments, 10) || 1;
    const paidInst = parseInt(paidInstallments, 10) || 0;
    const remaining = Math.max(0, totalInst - paidInst);

    if (!name.trim() || isNaN(origAmt) || origAmt <= 0) {
      alert('Por favor ingresa un nombre y monto de préstamo válido');
      return;
    }

    const isCompleted = pendBal <= 0;

    const status: 'active' | 'ending_soon' | 'completed' = isCompleted ? 'completed' : remaining <= 2 ? 'ending_soon' : 'active';

    const payload = {
      name: name.trim(),
      institution: institution.trim() || 'Entidad',
      originalAmount: origAmt,
      pendingBalance: pendBal,
      monthlyPayment: isNaN(payment) ? Math.round(origAmt / totalInst) : payment,
      startDate,
      dueDate,
      frequency,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      totalInstallments: totalInst,
      paidInstallments: paidInst,
      remainingInstallments: remaining,
      status,
      category,
      color,
      currency,
      completedAt: isCompleted ? new Date().toISOString() : undefined
    };

    if (editingLoan) {
      updateLoan({
        ...editingLoan,
        ...payload
      });
    } else {
      addLoan(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLoan ? 'Editar Préstamo / Deuda' : 'Registrar Nuevo Préstamo'}
              </h3>
              <p className="text-xs text-slate-400">
                La deuda permanecerá activa hasta que su saldo sea RD$0.00
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Nombre y Entidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Préstamo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Préstamo Vehículo, Personal..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institución / Persona
              </label>
              <input
                type="text"
                placeholder="Ej: Banco BHD, Popular, Amigo..."
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Monto Original y Saldo Pendiente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monto Original Prestado *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000.00"
                  value={originalAmount}
                  onChange={(e) => {
                    setOriginalAmount(e.target.value);
                    if (!editingLoan && !pendingBalance) {
                      setPendingBalance(e.target.value);
                    }
                  }}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Saldo Pendiente Actual *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="100000.00"
                  value={pendingBalance}
                  onChange={(e) => setPendingBalance(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-base text-rose-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Cuota Mensual y Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cuota Periódica a Pagar *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="10000.00"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

          {/* Cuotas Totales y Cuotas Pagadas */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Número Total de Cuotas
              </label>
              <input
                type="number"
                min={1}
                required
                placeholder="20"
                value={totalInstallments}
                onChange={(e) => setTotalInstallments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                Cuotas ya Pagadas
              </label>
              <input
                type="number"
                min={0}
                required
                placeholder="6"
                value={paidInstallments}
                onChange={(e) => setPaidInstallments(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Día de vencimiento y Frecuencia */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Día del Mes que Vence
              </label>
              <input
                type="number"
                min={1}
                max={31}
                placeholder="Ej: 20"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Frecuencia de Pago
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'monthly' | 'biweekly')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
              >
                <option value="monthly">Mensual</option>
                <option value="biweekly">Quincenal</option>
              </select>
            </div>
          </div>

          {/* Categoría y Tasa de interés */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Categoría del Préstamo
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              >
                <option value="personal">Préstamo Personal</option>
                <option value="vehicle">Préstamo de Vehículo</option>
                <option value="mortgage">Hipotecario / Vivienda</option>
                <option value="business">Comercial / Negocio</option>
                <option value="other">Deuda con Amigo/Familiar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tasa de Interés % (opcional)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Ej: 14.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
            </div>
          </div>

          {/* Color identificativo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Color Identificativo
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {LOAN_COLORS.map((c) => (
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
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/20"
            >
              {editingLoan ? 'Guardar Cambios' : 'Registrar Préstamo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
