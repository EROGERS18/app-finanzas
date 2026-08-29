import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Tag, CreditCard, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Transaction, TransactionType, TransactionStatus, FrequencyType, CurrencyCode } from '../../types';
import { getFortnightFromDate, formatCurrency } from '../../services/financeCalculations';

export const TransactionModal: React.FC = () => {
  const {
    quickModalOpen,
    quickModalType,
    closeQuickModal,
    categories,
    paymentMethods,
    creditCards,
    settings,
    addTransaction,
    updateTransaction,
    editingTransaction
  } = useFinance();

  const [type, setType] = useState<TransactionType>(quickModalType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(settings.primaryCurrency);
  const [categoryId, setCategoryId] = useState('');
  
  // Métodos de pago
  const [paymentMethodType, setPaymentMethodType] = useState<'cash' | 'bank_account' | 'debit_card' | 'credit_card'>('bank_account');
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [linkedCardId, setLinkedCardId] = useState('');

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('paid');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<FrequencyType>('monthly');
  const [fortnight, setFortnight] = useState<'q1' | 'q2'>('q1');
  const [notes, setNotes] = useState('');

  // Actualizar estado al abrir modal o recibir edición
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setTitle(editingTransaction.title);
      setAmount(editingTransaction.amount.toString());
      setCurrency(editingTransaction.currency);
      setCategoryId(editingTransaction.categoryId);
      setPaymentMethodId(editingTransaction.paymentMethodId);
      
      if (editingTransaction.linkedCardId) {
        setPaymentMethodType('credit_card');
        setLinkedCardId(editingTransaction.linkedCardId);
      } else {
        const foundPm = paymentMethods.find(p => p.id === editingTransaction.paymentMethodId);
        if (foundPm?.type === 'cash') setPaymentMethodType('cash');
        else if (foundPm?.type === 'debit_card') setPaymentMethodType('debit_card');
        else setPaymentMethodType('bank_account');
        setLinkedCardId('');
      }

      setDate(editingTransaction.date);
      setDueDate(editingTransaction.dueDate || '');
      setStatus(editingTransaction.status);
      setIsRecurring(editingTransaction.isRecurring);
      setRecurrenceFrequency(editingTransaction.recurrenceFrequency || 'monthly');
      setFortnight(editingTransaction.fortnight);
      setNotes(editingTransaction.notes || '');
    } else {
      setType(quickModalType);
      setTitle('');
      setAmount('');
      setCurrency(settings.primaryCurrency);
      const filteredCats = categories.filter(c => c.type === quickModalType || c.type === 'both');
      setCategoryId(filteredCats[0]?.id || categories[0]?.id || '');
      
      setPaymentMethodType('bank_account');
      setPaymentMethodId(paymentMethods[0]?.id || '');
      setLinkedCardId(creditCards[0]?.id || '');

      const todayStr = new Date().toISOString().slice(0, 10);
      setDate(todayStr);
      setDueDate('');
      setStatus(quickModalType === 'income' ? 'paid' : 'paid');
      setIsRecurring(false);
      setRecurrenceFrequency('monthly');
      setFortnight(getFortnightFromDate(todayStr, settings.q1EndDay));
      setNotes('');
    }
  }, [quickModalOpen, quickModalType, editingTransaction, categories, paymentMethods, creditCards, settings]);

  // Actualizar automáticamente la quincena al cambiar la fecha
  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setFortnight(getFortnightFromDate(newDate, settings.q1EndDay));
  };

  const filteredCategories = categories.filter(
    cat => cat.type === type || cat.type === 'both'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Por favor introduce un concepto válido y un monto mayor a 0');
      return;
    }

    const isCreditCardExpense = type === 'expense' && paymentMethodType === 'credit_card';

    if (isCreditCardExpense && !linkedCardId && creditCards.length > 0) {
      alert('Por favor selecciona qué tarjeta de crédito utilizaste');
      return;
    }

    const txPayload = {
      title: title.trim(),
      amount: parsedAmount,
      currency,
      type,
      categoryId: categoryId || filteredCategories[0]?.id || '',
      paymentMethodId: isCreditCardExpense ? (creditCards.find(c => c.id === linkedCardId)?.id || paymentMethodId) : (paymentMethodId || paymentMethods[0]?.id || ''),
      date,
      dueDate: dueDate || undefined,
      status,
      isRecurring,
      recurrenceFrequency: isRecurring ? recurrenceFrequency : undefined,
      fortnight,
      notes: notes.trim() || undefined,
      linkedCardId: isCreditCardExpense ? linkedCardId : undefined
    };

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        ...txPayload,
      });
    } else {
      addTransaction(txPayload);
    }

    closeQuickModal();
  };

  if (!quickModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Encabezado del Modal */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              type === 'income' 
                ? 'bg-emerald-500/10 text-emerald-500' 
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Editar Registro' : type === 'income' ? 'Nuevo Ingreso' : 'Nuevo Gasto'}
              </h3>
              <p className="text-xs text-slate-400">
                {type === 'income' 
                  ? 'Registra nómina, honorarios o ingresos quincenales' 
                  : 'Controla pagos, compras y compromisos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeQuickModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Selector de Tipo (Ingreso / Gasto) si no está editando */}
          {!editingTransaction && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-xs ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                💸 Registrar Gasto
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`py-2 px-3 rounded-xl font-bold transition-all text-xs ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                💰 Registrar Ingreso
              </button>
            </div>
          )}

          {/* Concepto / Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Concepto / Descripción *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Supermercado Nacional, Nómina Quincenal, Combustible..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Monto y Moneda */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Monto *
              </label>
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
                  {currency}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="DOP">RD$ (DOP)</option>
                <option value="USD">US$ (USD)</option>
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Categoría</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* MÉTODO DE PAGO Y VINCULACIÓN CON TARJETA DE CRÉDITO */}
          {type === 'expense' ? (
            <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Método de pago
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('cash')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      paymentMethodType === 'cash'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('bank_account')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      paymentMethodType === 'bank_account'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🏦 Transferencia
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('debit_card')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      paymentMethodType === 'debit_card'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    💳 T. Débito
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethodType('credit_card')}
                    className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all text-center ${
                      paymentMethodType === 'credit_card'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    💳 T. Crédito
                  </button>
                </div>
              </div>

              {/* SEGUNDO CAMPO DINÁMICO: ¿Qué tarjeta utilizaste? */}
              {paymentMethodType === 'credit_card' ? (
                <div className="pt-2 animate-in fade-in duration-200">
                  <label className="block text-xs font-extrabold text-purple-600 dark:text-purple-400 mb-1 flex items-center justify-between">
                    <span>¿Qué tarjeta utilizaste? *</span>
                    <span className="text-[10px] font-normal text-slate-400">Aumentará la deuda de la tarjeta</span>
                  </label>

                  {creditCards.length === 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-600 dark:text-amber-400">
                      No tienes tarjetas registradas aún. Regístrala en la sección "Tarjetas de crédito".
                    </div>
                  ) : (
                    <select
                      value={linkedCardId}
                      onChange={(e) => setLinkedCardId(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-purple-500/40 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    >
                      {creditCards.map(c => {
                        const avail = Math.max(0, c.creditLimit - c.currentDebt);
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.cardNumberMasked}) — Disp: {formatCurrency(avail, c.currency)}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cuenta / Fondo origen
                  </label>
                  <select
                    value={paymentMethodId}
                    onChange={(e) => setPaymentMethodId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                  >
                    {paymentMethods.filter(p => p.type !== 'credit_card').map(pm => (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} (Saldo: {formatCurrency(pm.balance || 0, pm.currency)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cuenta de Depósito Destino
              </label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {paymentMethods.filter(p => p.type !== 'credit_card').map(pm => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name} ({pm.currency})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Fecha y Quincena */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Fecha</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Quincena Asignada
              </label>
              <select
                value={fortnight}
                onChange={(e) => setFortnight(e.target.value as 'q1' | 'q2')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="q1">1ra Quincena (Días 1 - 15)</option>
                <option value="q2">2da Quincena (Días 16 - Fin)</option>
              </select>
            </div>
          </div>

          {/* Estado: Pagado vs Pendiente */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Estado del Registro
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                  status === 'paid'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ✓ Realizado / Pagado
              </button>
              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all text-xs flex items-center justify-center gap-1.5 ${
                  status === 'pending'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                ⏳ Pendiente (Compromiso)
              </button>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas adicionales (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Botones de acción */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={closeQuickModal}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-6 py-2 rounded-xl font-bold text-white shadow-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
              }`}
            >
              {editingTransaction ? 'Guardar Cambios' : 'Registrar Movimiento'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
