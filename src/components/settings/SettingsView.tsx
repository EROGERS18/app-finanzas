import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Tag, 
  CreditCard, 
  DollarSign, 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Category, PaymentMethod, CurrencyCode } from '../../types';
import { IconHelper } from '../common/IconHelper';
import { CategoryModal } from './CategoryModal';
import { PaymentMethodModal } from './PaymentMethodModal';
import { BackupModal } from '../backup/BackupModal';
import { GoogleDriveSyncWidget } from '../backup/GoogleDriveSyncWidget';
import { CloudSyncStatus } from '../common/CloudSyncStatus';
import { formatCurrency } from '../../services/financeCalculations';

interface SettingsViewProps {
  onReopenTour?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onReopenTour }) => {
  const { currentUser, deleteAccount } = useAuth();
  const {
    categories,
    paymentMethods,
    settings,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    resetToDemoData,
    clearAllData,
    confirmDelete,
    isCloudSyncing,
    syncCloudData
  } = useFinance();

  // Estados para Modales
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [paymentMethodModalOpen, setPaymentMethodModalOpen] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  const [backupModalOpen, setBackupModalOpen] = useState(false);

  // Estados de Ajustes
  const [exchangeRate, setExchangeRate] = useState(settings.exchangeRateUSDToDOP.toString());
  const [primaryCurrency, setPrimaryCurrency] = useState<CurrencyCode>(settings.primaryCurrency);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Categorías
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleDeleteCat = (id: string, catName?: string) => {
    confirmDelete({
      title: `¿Eliminar categoría "${catName || 'seleccionada'}"?`,
      message: '¿Estás seguro de que deseas eliminar esta categoría? Los registros existentes permanecerán en tu historial.',
      confirmText: 'Eliminar Categoría',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deleteCategory(id);
      }
    });
  };

  // Métodos de Pago
  const handleOpenNewPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setPaymentMethodModalOpen(true);
  };

  const handleEditPaymentMethod = (pm: PaymentMethod) => {
    setEditingPaymentMethod(pm);
    setPaymentMethodModalOpen(true);
  };

  const handleDeletePm = (id: string, pmName?: string) => {
    confirmDelete({
      title: `¿Eliminar cuenta "${pmName || 'seleccionada'}"?`,
      message: '¿Estás seguro de que deseas eliminar este método de pago / cuenta? Las transacciones asociadas no se borrarán.',
      confirmText: 'Eliminar Cuenta',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deletePaymentMethod(id);
      }
    });
  };

  // Guardar Ajustes Generales
  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(exchangeRate);
    updateSettings({
      exchangeRateUSDToDOP: isNaN(rate) ? 60.50 : rate,
      primaryCurrency
    });

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configuración & Preferencias
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Personaliza tus categorías, apariencia, respaldos JSON y gestión de datos.
        </p>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span>Configuración guardada exitosamente.</span>
        </div>
      )}

      {/* Sección 1: Apariencia del Tema */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Apariencia de la Interfaz
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              settings.theme === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-100 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm">☀️ Modo claro</div>
              <div className="text-[10px] text-slate-400">Predeterminado limpio y brillante</div>
            </div>
          </button>

          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
              settings.theme === 'dark'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-900 dark:text-indigo-100 shadow-md'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-6 h-6 text-indigo-400 shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm">🌙 Modo oscuro</div>
              <div className="text-[10px] text-slate-400">Entorno nocturno descansado</div>
            </div>
          </button>

          <button
            onClick={() => {
              const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              updateSettings({ theme: systemDark ? 'dark' : 'light' });
            }}
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-3 transition-all hover:border-emerald-500"
          >
            <SettingsIcon className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="text-left">
              <div className="font-bold text-xs sm:text-sm">⚙️ Automático</div>
              <div className="text-[10px] text-slate-400">Según el sistema del dispositivo</div>
            </div>
          </button>
        </div>
      </div>

      {/* Sección 2: Moneda Principal y Tasa de Cambio */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Moneda Principal & Tasa de Cambio
          </h2>
        </div>

        <form onSubmit={handleSaveGeneralSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Moneda Principal por Defecto
            </label>
            <select
              value={primaryCurrency}
              onChange={(e) => setPrimaryCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="DOP">RD$ - Peso Dominicano (DOP)</option>
              <option value="USD">US$ - Dólar Estadounidense (USD)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tasa de Cambio (RD$ por 1 USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              Guardar Preferencias
            </button>
          </div>
        </form>
      </div>

      {/* Estado de Sincronización en la Nube */}
      <CloudSyncStatus isSyncing={isCloudSyncing} onManualSync={syncCloudData} />

      {/* Sincronización en la Nube con Google Workspace */}
      <GoogleDriveSyncWidget />

      {/* Sección 3: Respaldo JSON y Gestión de Datos */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            💾 Backup, Restauración & Borrado de Datos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Abrir Modal de Backup */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-indigo-800 dark:text-indigo-300">
                💾 Hacer / Restaurar Backup
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Genera o importa archivos JSON de respaldo estructurados de forma segura.
              </p>
            </div>
            <button
              onClick={() => setBackupModalOpen(true)}
              className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Gestión de Backup</span>
            </button>
          </div>

          {/* Cargar Datos Demo */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">
                Cargar Datos de Demostración
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Restablece transacciones, tarjetas y préstamos de prueba dominicanos.
              </p>
            </div>
            <button
              onClick={() => {
                confirmDelete({
                  title: '¿Cargar datos de prueba?',
                  message: 'Esto restablecerá las transacciones, tarjetas y préstamos de demostración.',
                  confirmText: 'Cargar Demo',
                  cancelText: 'Cancelar',
                  onConfirm: () => {
                    resetToDemoData();
                  }
                });
              }}
              className="mt-4 w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer Demo</span>
            </button>
          </div>

          {/* Limpiar Datos */}
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-rose-800 dark:text-rose-300">
                Eliminar Todos los Registros
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Deja la aplicación completamente vacía en RD$0.00 para ingresar tus datos reales.
              </p>
            </div>
            <button
              onClick={() => {
                confirmDelete({
                  title: '⚠️ Eliminar todos los datos',
                  message: 'Esta acción eliminará todos los datos financieros almacenados en la aplicación, incluyendo ingresos, gastos, tarjetas, préstamos, pagos, presupuestos y registros. Esta acción no se puede deshacer.',
                  confirmText: 'Sí, eliminar todo',
                  cancelText: 'Cancelar',
                  onConfirm: () => {
                    clearAllData();
                  }
                });
              }}
              className="mt-4 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpiar todo</span>
            </button>
          </div>

          {/* Eliminar Cuenta */}
          <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/30 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400">
                Eliminar Mi Cuenta Definitivamente
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Elimina permanentemente tu usuario, perfil y todos tus datos sincronizados en la nube de Supabase.
              </p>
            </div>
            <button
              onClick={() => {
                confirmDelete({
                  title: '⛔ ¿ELIMINAR MI CUENTA DEFINITIVAMENTE?',
                  message: `¿Estás seguro de que deseas eliminar permanentemente la cuenta (${currentUser?.email})? Se borrará tu usuario y todos tus registros de la nube de Supabase. Esta acción NO se puede deshacer.`,
                  confirmText: 'Sí, ELIMINAR MI CUENTA',
                  cancelText: 'Cancelar',
                  onConfirm: async () => {
                    await deleteAccount();
                  }
                });
              }}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>Eliminar Mi Cuenta</span>
            </button>
          </div>

        </div>
      </div>

      {/* Sección 4: Ayuda & Guía Interactiva */}
      {onReopenTour && (
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Ayuda & Tutorial Interactivo
            </h2>
          </div>

          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Guía de Inicio de FinanDOM
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vuelve a ejecutar la guía paso a paso para repasar todas las funciones.
              </p>
            </div>
            <button
              onClick={onReopenTour}
              className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-sm flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Volver a mostrar guía</span>
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={(cat) => {
          if ('id' in cat) {
            updateCategory(cat);
          } else {
            addCategory(cat);
          }
        }}
        editingCategory={editingCategory}
      />

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
        editingMethod={editingPaymentMethod}
      />

      <BackupModal
        isOpen={backupModalOpen}
        onClose={() => setBackupModalOpen(false)}
      />

    </div>
  );
};
