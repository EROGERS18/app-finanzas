import React, { useState } from 'react';
import { 
  CreditCard as CardIcon, 
  Plus, 
  DollarSign, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  History,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { CreditCard, CreditCardMovement } from '../../types';
import { CreditCardModal } from './CreditCardModal';
import { CreditCardPaymentModal } from './CreditCardPaymentModal';

export const CreditCardsView: React.FC = () => {
  const { 
    creditCards, 
    cardMovements, 
    displayCurrency, 
    deleteCreditCard, 
    confirmDelete 
  } = useFinance();

  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<CreditCard | null>(null);

  const [selectedCardForHistory, setSelectedCardForHistory] = useState<string | null>(
    creditCards[0]?.id || null
  );

  // Cálculos globales de tarjetas
  const totalCreditLimit = creditCards.reduce((sum, c) => sum + c.creditLimit, 0);
  const totalCurrentDebt = creditCards.reduce((sum, c) => sum + c.currentDebt, 0);
  const totalAvailableCredit = Math.max(0, totalCreditLimit - totalCurrentDebt);
  const globalUtilization = totalCreditLimit > 0 ? Math.round((totalCurrentDebt / totalCreditLimit) * 100) : 0;

  const handleOpenNew = () => {
    setEditingCard(null);
    setCardModalOpen(true);
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setCardModalOpen(true);
  };

  const handleDelete = (card: CreditCard) => {
    confirmDelete({
      title: `¿Eliminar tarjeta ${card.name}?`,
      message: `Esta acción eliminará la tarjeta y sus registros de movimiento asociados. La deuda actual registrada es de ${formatCurrency(card.currentDebt, card.currency)}.`,
      confirmText: 'Eliminar Tarjeta',
      onConfirm: () => {
        deleteCreditCard(card.id);
        if (selectedCardForHistory === card.id) {
          setSelectedCardForHistory(null);
        }
      }
    });
  };

  const handleOpenPayment = (card: CreditCard) => {
    setSelectedCardForPayment(card);
    setPaymentModalOpen(true);
  };

  // Movimientos de la tarjeta seleccionada
  const activeCard = creditCards.find(c => c.id === selectedCardForHistory) || creditCards[0];
  const activeCardMovements = cardMovements
    .filter(m => m.cardId === activeCard?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y Botones de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tarjetas de Crédito
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Administra tus límites, deudas actuales, fechas de corte e historial de pagos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {creditCards.length > 0 && (
            <button
              onClick={() => {
                setSelectedCardForPayment(creditCards[0]);
                setPaymentModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20"
            >
              <DollarSign className="w-4 h-4" />
              <span>Registrar Pago</span>
            </button>
          )}

          <button
            onClick={handleOpenNew}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Tarjeta</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen Global */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Límite Total Combinado</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalCreditLimit, displayCurrency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{creditCards.length} tarjetas activas</span>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Deuda Total Actual</span>
          <div className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
            {formatCurrency(totalCurrentDebt, displayCurrency)}
          </div>
          <span className="text-[11px] text-rose-400 mt-0.5 block">Saldo a pagar a bancos</span>
        </div>

        <div className="glass-panel p-4">
          <span className="text-xs font-semibold text-slate-400 uppercase">Crédito Disponible Total</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-500 mt-1">
            {formatCurrency(totalAvailableCredit, displayCurrency)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-0.5 block">Margen libre para compras</span>
        </div>

        <div className="glass-panel p-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase">
            <span>Utilización Global</span>
            <span className={globalUtilization > 50 ? 'text-rose-500 font-bold' : 'text-emerald-500 font-bold'}>
              {globalUtilization}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                globalUtilization > 70 ? 'bg-rose-500' : globalUtilization > 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, globalUtilization)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Ideal: Mantener por debajo del 30-40%</span>
        </div>

      </div>

      {/* Grid de Tarjetas Físicas Visuales */}
      {creditCards.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <CardIcon className="w-12 h-12 mx-auto text-slate-400 mb-3 opacity-60" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No tienes tarjetas de crédito registradas
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Añade tus tarjetas para controlar tus deudas, fechas de corte y límites disponibles.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold shadow-md hover:bg-emerald-600 transition-all"
          >
            + Registrar mi primera tarjeta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {creditCards.map((card) => {
            const available = Math.max(0, card.creditLimit - card.currentDebt);
            const utilization = card.creditLimit > 0 ? Math.round((card.currentDebt / card.creditLimit) * 100) : 0;
            const isSelected = selectedCardForHistory === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCardForHistory(card.id)}
                className={`group relative p-5 rounded-3xl cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden shadow-lg ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-emerald-500 shadow-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${card.color} 0%, #0f172a 100%)`
                }}
              >
                {/* Textura sutil y chip */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 text-white space-y-4">
                  {/* Fila Superior: Banco, Nombre y Acciones */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/80 block">
                        {card.bank}
                      </span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight drop-shadow-sm">
                        {card.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(card);
                        }}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                        title="Editar tarjeta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(card);
                        }}
                        className="p-1.5 rounded-lg text-white/80 hover:text-rose-300 hover:bg-rose-500/20"
                        title="Eliminar tarjeta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Número enmascarado y Chip */}
                  <div className="flex items-center justify-between py-1">
                    <div className="w-9 h-7 rounded-md bg-amber-400/80 border border-amber-300/60 shadow-inner flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-600/40 rounded-sm" />
                    </div>
                    <span className="font-mono text-sm tracking-widest text-white/90 font-bold">
                      {card.cardNumberMasked}
                    </span>
                  </div>

                  {/* Cifras de Límite, Deuda y Disponible */}
                  <div className="bg-black/30 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Deuda actual:</span>
                      <span className="font-black text-rose-300 text-sm">
                        {formatCurrency(card.currentDebt, card.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-white/70">Crédito disponible:</span>
                      <span className="font-black text-emerald-300 text-sm">
                        {formatCurrency(available, card.currency)}
                      </span>
                    </div>

                    {/* Barra de Utilización */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] text-white/80">
                        <span>Límite: {formatCurrency(card.creditLimit, card.currency)}</span>
                        <span className="font-bold">{utilization}% utilizado</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            utilization > 70 ? 'bg-rose-400' : utilization > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                          }`}
                          style={{ width: `${Math.min(100, utilization)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fechas de corte y pago + Botón de Pago Rápido */}
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="text-white/80">
                      <div>Corte: <strong>día {card.cutOffDay}</strong></div>
                      <div>Pagar antes: <strong>día {card.paymentDueDay}</strong></div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPayment(card);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-extrabold hover:bg-slate-100 transition-all shadow-md active:scale-95 text-xs flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Abonar</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial de Movimientos de la Tarjeta Seleccionada */}
      {activeCard && (
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <History className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Historial de Movimientos: {activeCard.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Registro cronológico de compras con tarjeta y pagos realizados
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenPayment(activeCard)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs self-start sm:self-auto"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Registrar Pago a esta Tarjeta</span>
            </button>
          </div>

          {activeCardMovements.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No hay movimientos registrados para esta tarjeta aún.
              Al registrar un gasto seleccionando "Tarjeta de crédito" o hacer un pago, aparecerá aquí.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase text-[11px] font-semibold">
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Concepto</th>
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3 text-right">Movimiento</th>
                    <th className="py-2.5 px-3 text-right">Saldo Deuda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activeCardMovements.map((mov) => {
                    const isPayment = mov.type === 'payment';

                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-medium">
                          {mov.date}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">
                          {mov.concept}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            isPayment
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {isPayment ? 'Pago / Abono (-)' : 'Gasto Tarjeta (+)'}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-black whitespace-nowrap ${
                          isPayment ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          {isPayment ? '-' : '+'}{formatCurrency(mov.amount, activeCard.currency)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {formatCurrency(mov.resultingDebt, activeCard.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <CreditCardModal
        isOpen={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        editingCard={editingCard}
      />

      <CreditCardPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        selectedCard={selectedCardForPayment}
      />

    </div>
  );
};
