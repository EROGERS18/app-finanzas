import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Key,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { googleDriveService } from '../../services/googleDriveService';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

export const GoogleDriveSyncWidget: React.FC = () => {
  const { currentUser } = useAuth();
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
    resetToDemoData 
  } = useFinance();

  const [tokenInput, setTokenInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(
    localStorage.getItem('domifinan_gdrive_last_synced')
  );
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setIsConnected(googleDriveService.isConnected());
    const existingToken = googleDriveService.getAccessToken();
    if (existingToken) {
      setTokenInput(existingToken);
    }
  }, []);

  const handleConnectToken = (tokenToUse?: string) => {
    const token = tokenToUse || tokenInput.trim();
    if (!token) {
      setMessage({ type: 'error', text: 'Por favor ingresa un Access Token válido de Google OAuth.' });
      return;
    }
    googleDriveService.setAccessToken(token);
    setIsConnected(true);
    setMessage({ type: 'success', text: '¡Conectado exitosamente con tu cuenta de Google Workspace!' });
  };

  const handleDisconnect = () => {
    googleDriveService.disconnect();
    setIsConnected(false);
    setTokenInput('');
    setMessage({ type: 'success', text: 'Sesión de Google Drive desconectada.' });
  };

  // Subir datos actuales a Google Drive
  const handleUploadToDrive = async () => {
    if (!currentUser) return;
    setLoading(true);
    setMessage(null);

    const payloadData = {
      categories,
      paymentMethods,
      creditCards,
      cardMovements,
      loans,
      loanPayments,
      transactions,
      budgets,
      settings
    };

    const result = await googleDriveService.uploadDataToDrive(payloadData);
    setLoading(false);

    if (result.success) {
      const nowStr = new Date().toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' });
      setLastSyncedAt(nowStr);
      localStorage.setItem('domifinan_gdrive_last_synced', nowStr);
      setMessage({ type: 'success', text: '¡Tus datos financieros se guardaron en tu Google Drive corporativo!' });
    } else {
      if (!googleDriveService.isConnected()) {
        setIsConnected(false);
      }
      setMessage({ type: 'error', text: result.error || 'Error al sincronizar con Google Drive' });
    }
  };

  // Descargar datos desde Google Drive y actualizar la App
  const handleDownloadFromDrive = async () => {
    if (!currentUser) return;
    setLoading(true);
    setMessage(null);

    const result = await googleDriveService.downloadDataFromDrive();
    setLoading(false);

    if (result.success && result.data) {
      const data = result.data;
      const userId = currentUser.id;

      if (data.categories) storageService.saveCategories(userId, data.categories);
      if (data.paymentMethods) storageService.savePaymentMethods(userId, data.paymentMethods);
      if (data.creditCards) storageService.saveCreditCards(userId, data.creditCards);
      if (data.cardMovements) storageService.saveCardMovements(userId, data.cardMovements);
      if (data.loans) storageService.saveLoans(userId, data.loans);
      if (data.loanPayments) storageService.saveLoanPayments(userId, data.loanPayments);
      if (data.transactions) storageService.saveTransactions(userId, data.transactions);
      if (data.budgets) storageService.saveBudgets(userId, data.budgets);
      if (data.settings) storageService.saveSettings(userId, data.settings);

      const nowStr = new Date().toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' });
      setLastSyncedAt(nowStr);
      localStorage.setItem('domifinan_gdrive_last_synced', nowStr);

      setMessage({ type: 'success', text: '¡Datos sincronizados exitosamente desde Google Drive! La página se actualizará...' });
      
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } else {
      if (!googleDriveService.isConnected()) {
        setIsConnected(false);
      }
      setMessage({ type: 'error', text: result.error || 'Error al descargar datos desde Google Drive' });
    }
  };

  return (
    <div className="glass-panel p-6 space-y-5 border border-indigo-500/20 bg-gradient-to-br from-slate-900/60 to-indigo-950/20">
      
      {/* Cabecera del Widget */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Sincronización con Google Workspace (Google Drive)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                Privado
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Guarda y sincroniza tus datos financieros cifrados en tu propio Google Drive sin intermediarios.
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Conectado</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold shrink-0">
            <span>No conectado</span>
          </div>
        )}
      </div>

      {/* Alertas y Mensajes */}
      {message && (
        <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
          message.type === 'success'
            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-medium'
            : 'bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 font-medium'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Estado Conectado: Botones de Guardar / Cargar */}
      {isConnected ? (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Subir a Google Drive */}
            <button
              onClick={handleUploadToDrive}
              disabled={loading}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudUpload className="w-4 h-4" />}
              <span>☁️ Guardar en Google Drive</span>
            </button>

            {/* Descargar de Google Drive */}
            <button
              onClick={handleDownloadFromDrive}
              disabled={loading}
              className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2.5 border border-slate-700 transition-all active:scale-98 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
              <span>📥 Cargar desde Google Drive</span>
            </button>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tus datos se guardan en el archivo privado <strong>domifinan_backup_data.json</strong> de tu cuenta.</span>
            </div>
            
            {lastSyncedAt && (
              <span className="font-semibold text-slate-300">
                Última Sincronización: {lastSyncedAt}
              </span>
            )}
          </div>

          <button
            onClick={handleDisconnect}
            className="text-[11px] font-bold text-slate-400 hover:text-rose-400 underline transition-colors"
          >
            Desconectar cuenta de Google Drive
          </button>

        </div>
      ) : (
        /* Formulario de Conexión */
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Para sincronizar automáticamente tus movimientos entre tu celular y tu PC usando tu cuenta de Google Workspace (`@domifinan.com`), vincula tu cuenta de Google con un Access Token de Google OAuth:
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Google OAuth Token / Credencial de Workspace:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Key className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  placeholder="Pega tu token de Google OAuth aquí..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleConnectToken()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                Conectar
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
              <Globe className="w-3.5 h-3.5" />
              <span>Sincronización 100% Privada con Google Workspace</span>
            </div>
            <p>
              Al hacer clic en <strong>"Guardar en Google Drive"</strong> en tu teléfono, tus registros se guardan en tu propia cuenta. Al dar a <strong>"Cargar desde Google Drive"</strong> en tu PC, los datos aparecerán al instante.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
