import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Wallet, 
  CreditCard, 
  Landmark, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  Info,
  Building2
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { PaymentMethodModal } from '../settings/PaymentMethodModal';
import { PaymentMethod } from '../../types';

export const NetWorthView: React.FC = () => {
  const { 
    paymentMethods, 
    creditCards, 
    loans, 
    metrics, 
    displayCurrency,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    confirmDelete
  } = useFinance();

  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // Activos Líquidos (Bancos + Efectivo)
  const liquidAssets = paymentMethods.filter(pm => pm.type !== 'credit_card');

  const totalAssets = metrics.currentBalance;
  const totalCardDebts = metrics.totalCardDebt;
  const totalLoanDebts = metrics.totalLoanDebt;
  const totalLiabilities = metrics.totalDebts;
  const netWorth = metrics.netWorth;

  const handleOpenNewAccount = () => {
    setEditingMethod(null);
    setPaymentMethodModalOpen(true);
  };

  const handleEditAccount = (pm: PaymentMethod) => {
    setEditingMethod(pm);
    setPaymentMethodModalOpen(true);
  };

  const handleDeleteAccount = (id: string, name: string) => {
    confirmDelete({
      title: `¿Eliminar cuenta "${name}"?`,
      message: '¿Estás seguro de que deseas eliminar esta cuenta bancaria? Las transacciones registradas históricamente permanecerán intactas.',
      confirmText: 'Eliminar Cuenta',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deletePaymentMethod(id);
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Patrimonio & Situación Financiera Real
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Balance general consolidado: lo que tienes (activos) versus lo que debes (deudas y préstamos).
          </p>
        </div>

        <button
          onClick={handleOpenNewAccount}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nueva Cuenta Bancaria / Efectivo</span>
        </button>
      </div>

      {/* Explicación Transparente de Origen de Fondos */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-slate-700 dark:text-slate-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
            💡 ¿Cómo se alimentan tus Cuentas Bancarias y Activos Líquidos?
          </span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Tus activos líquidos corresponden a los saldos iniciales de tus cuentas bancarias (Banreservas, Banco Popular, Efectivo, etc.) más tus ingresos registrados cobrados. Puedes hacer clic en el botón <strong>"Editar Saldo"</strong> en cualquiera de tus cuentas para colocar tu saldo bancario real.
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Patrimonio Neto */}
      <div className={`relative overflow-hidden p-6 sm:p-8 rounded-3xl border shadow-xl ${
        netWorth >= 0 
          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/30' 
          : 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/30'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Scale className="w-4 h-4 text-emerald-500" />
              <span>Patrimonio Neto Consolidado</span>
            </div>
            
            <div className={`text-3xl sm:text-5xl font-black tracking-tight ${
              netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {formatCurrency(netWorth, displayCurrency)}
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              {netWorth >= 0
                ? '¡Tu patrimonio es positivo! Posees más capital en activos líquidos que el total acumulado de tus deudas.'
                : 'Tu patrimonio neto es negativo. Tus compromisos acumulados superan tu liquidez disponible actual.'}
            </p>
          </div>

          {/* Comparativa visual Rápida */}
          <div className="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-3 min-w-[240px]">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> Activos Líquidos:
              </span>
              <span className="font-extrabold text-white">
                +{formatCurrency(totalAssets, displayCurrency)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> Deudas Tarjetas:
              </span>
              <span className="font-extrabold text-rose-400">
                -{formatCurrency(totalCardDebts, displayCurrency)}
              </span>
            </div>

            <div className="flex justify-between text-xs">
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" /> Préstamos:
              </span>
              <span className="font-extrabold text-rose-400">
                -{formatCurrency(totalLoanDebts, displayCurrency)}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex justify-between text-xs font-black">
              <span className="text-slate-300">Balance Neto:</span>
              <span className={netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {formatCurrency(netWorth, displayCurrency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Desglose de Activos vs Pasivos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Activos y Dinero Disponible */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Dinero & Activos Líquidos ({liquidAssets.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Total en cuentas bancarias, ahorros y efectivo
                </p>
              </div>
            </div>

            <span className="text-base font-black text-emerald-500">
              +{formatCurrency(totalAssets, displayCurrency)}
            </span>
          </div>

          <div className="space-y-2.5">
            {liquidAssets.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No tienes cuentas bancarias registradas. Haz clic en "+ Nueva Cuenta Bancaria" para agregar tu primer saldo.
              </p>
            ) : (
              liquidAssets.map(acc => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {acc.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block">
                        {acc.bankName || 'General'} • {acc.type === 'savings_account' ? 'Cuenta de Ahorros' : acc.type === 'cash' ? 'Efectivo en Mano' : 'Cuenta Corriente'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mr-1">
                      {formatCurrency(acc.balance || 0, acc.currency)}
                    </span>
                    
                    <button
                      onClick={() => handleEditAccount(acc)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 dark:text-emerald-400 hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shrink-0"
                      title="Editar saldo de esta cuenta"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar esta cuenta bancaria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Pasivos y Deudas Acumuladas */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deudas & Pasivos Totales
                </h3>
                <p className="text-xs text-slate-400">
                  Tarjetas de crédito adeudadas y préstamos pendientes
                </p>
              </div>
            </div>

            <span className="text-base font-black text-rose-500">
              -{formatCurrency(totalLiabilities, displayCurrency)}
            </span>
          </div>

          <div className="space-y-3">
            {/* Tarjetas de Crédito */}
            <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <CreditCard className="w-4 h-4" />
                  <span>Deudas en Tarjetas de Crédito ({creditCards.length})</span>
                </span>
                <span className="text-rose-500 font-extrabold">
                  -{formatCurrency(totalCardDebts, displayCurrency)}
                </span>
              </div>
            </div>

            {/* Préstamos Activos */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Landmark className="w-4 h-4" />
                  <span>Préstamos Activos ({loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0).length})</span>
                </span>
                <span className="text-rose-500 font-extrabold">
                  -{formatCurrency(totalLoanDebts, displayCurrency)}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de creación y edición de cuenta */}
      <PaymentMethodModal
        isOpen={paymentMethodModalOpen}
        onClose={() => setPaymentMethodModalOpen(false)}
        onSave={(pm) => {
          if ('id' in pm) {
            updatePaymentMethod(pm);
          } else {
            addPaymentMethod(pm);
          }
        }}
        editingMethod={editingMethod}
      />

    </div>
  );
};
