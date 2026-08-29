import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  Database, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { GoogleDriveSyncWidget } from './GoogleDriveSyncWidget';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BackupPayload {
  backupVersion: number;
  appVersion: string;
  createdAt: string;
  userId: string;
  data: {
    categories: any[];
    paymentMethods: any[];
    creditCards: any[];
    cardMovements: any[];
    loans: any[];
    loanPayments: any[];
    transactions: any[];
    budgets: any[];
    settings: any;
  };
}

export const BackupModal: React.FC<BackupModalProps> = ({ isOpen, onClose }) => {
  const { 
    categories, 
    paymentMethods, 
    creditCards, 
    cardMovements, 
    loans, 
    loanPayments, 
    transactions, 
    budgets, 
    settings,
    resetToDemoData,
    confirmDelete
  } = useFinance();

  const { currentUser } = useAuth();

  const [restoreFile, setRestoreFile] = useState<BackupPayload | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. GENERAR Y DESCARGAR BACKUP EN JSON
  const handleCreateBackup = () => {
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const backupData: BackupPayload = {
        backupVersion: 1,
        appVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        userId: currentUser?.id || 'guest',
        data: {
          categories,
          paymentMethods,
          creditCards,
          cardMovements,
          loans,
          loanPayments,
          transactions,
          budgets,
          settings,
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `domiFinan-backup-${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg('✅ Archivo de respaldo descargado correctamente.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      alert('Error al generar el respaldo. Por favor intenta nuevamente.');
    }
  };

  // 2. SELECCIONAR Y VALIDAR ARCHIVO DE RESPALDO
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationError(null);
    setRestoreFile(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setValidationError('❌ El archivo debe ser un documento en formato .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        // Validación estricta de estructura y versión
        if (!parsed.backupVersion || !parsed.data || !Array.isArray(parsed.data.transactions)) {
          setValidationError('❌ El archivo de backup no es válido o está corrupto.');
          return;
        }

        setRestoreFile(parsed);
      } catch (err) {
        setValidationError('❌ El archivo no corresponde a una estructura JSON válida.');
      }
    };

    reader.readAsText(file);
  };

  // 3. EJECUTAR RESTAURACIÓN
  const handleConfirmRestore = () => {
    if (!restoreFile || !currentUser) return;

    confirmDelete({
      title: '⚠️ ¿Restaurar este respaldo?',
      message: 'Restaurar este backup reemplazará los datos financieros actuales. Esta acción actualizará inmediatamente tu Dashboard.',
      confirmText: 'Restaurar Datos',
      cancelText: 'Cancelar',
      onConfirm: () => {
        try {
          const uId = currentUser.id;
          const d = restoreFile.data;

          // Guardar en localStorage aislado por usuario
          localStorage.setItem(`finandom_usr_${uId}_categories`, JSON.stringify(d.categories || []));
          localStorage.setItem(`finandom_usr_${uId}_payment_methods`, JSON.stringify(d.paymentMethods || []));
          localStorage.setItem(`finandom_usr_${uId}_credit_cards`, JSON.stringify(d.creditCards || []));
          localStorage.setItem(`finandom_usr_${uId}_card_movements`, JSON.stringify(d.cardMovements || []));
          localStorage.setItem(`finandom_usr_${uId}_loans`, JSON.stringify(d.loans || []));
          localStorage.setItem(`finandom_usr_${uId}_loan_payments`, JSON.stringify(d.loanPayments || []));
          localStorage.setItem(`finandom_usr_${uId}_transactions`, JSON.stringify(d.transactions || []));
          localStorage.setItem(`finandom_usr_${uId}_budgets`, JSON.stringify(d.budgets || []));
          if (d.settings) {
            localStorage.setItem(`finandom_usr_${uId}_settings`, JSON.stringify(d.settings));
          }

          // Recargar la ventana para re-inicializar el estado reactivo limpio
          window.location.reload();
        } catch (err) {
          alert('Error al restaurar los datos.');
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Respaldo & Restauración de Datos
              </h3>
              <p className="text-xs text-slate-400">
                Guarda tus datos en un archivo JSON o restaura un respaldo previo
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          
          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Widget de Sincronización en la Nube con Google Workspace */}
          <GoogleDriveSyncWidget />

          {/* Bloque 1: Generar Backup Local */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>💾 Hacer Backup</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Descarga un archivo JSON versionado con todas tus transacciones, tarjetas, préstamos, presupuestos y categorías.
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateBackup}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Respaldo JSON</span>
            </button>
          </div>

          {/* Bloque 2: Restaurar Backup */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>♻️ Restaurar Backup</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Selecciona un archivo `.json` de respaldo para importar tu información.
              </p>
            </div>

            <div>
              <label className="block w-full p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900">
                <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Seleccionar archivo de respaldo JSON
                </span>
                <span className="text-[10px] text-slate-400">Archivos .json estructurados</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Error de Validación */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Previsualización del Backup Válido */}
            {restoreFile && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                    ✓ Backup Válido Encontrado
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Versión {restoreFile.backupVersion}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div>• Ingresos/Gastos: <strong>{restoreFile.data.transactions?.length || 0}</strong></div>
                  <div>• Tarjetas: <strong>{restoreFile.data.creditCards?.length || 0}</strong></div>
                  <div>• Préstamos: <strong>{restoreFile.data.loans?.length || 0}</strong></div>
                  <div>• Presupuestos: <strong>{restoreFile.data.budgets?.length || 0}</strong></div>
                  <div>• Categorías: <strong>{restoreFile.data.categories?.length || 0}</strong></div>
                  <div>• Creado: <strong>{new Date(restoreFile.createdAt).toLocaleDateString()}</strong></div>
                </div>

                <button
                  onClick={handleConfirmRestore}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Confirmar y Restaurar Datos</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Botón cerrar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
