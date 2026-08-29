import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from '../../services/supabaseClient';

interface CloudSyncStatusProps {
  isSyncing?: boolean;
  onManualSync?: () => void;
  compact?: boolean;
}

export const CloudSyncStatus: React.FC<CloudSyncStatusProps> = ({ 
  isSyncing = false, 
  onManualSync, 
  compact = false 
}) => {
  const isCloudActive = isSupabaseConfigured();

  if (compact) {
    return (
      <button 
        onClick={onManualSync}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
          isCloudActive
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
        }`}
        title={isCloudActive ? 'Base de datos en la nube conectada' : 'Modo local en este dispositivo'}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
        ) : isCloudActive ? (
          <Cloud className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <CloudOff className="w-3.5 h-3.5 text-amber-400" />
        )}
        <span>{isCloudActive ? (isSyncing ? 'Sincronizando...' : 'Nube Activa') : 'Local'}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isCloudActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {isCloudActive ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-200">
              {isCloudActive ? 'Sincronización en la Nube Activa' : 'Modo Almacenamiento Local'}
            </h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${
              isCloudActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {isCloudActive ? 'Conectado' : 'Offline / Local'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isCloudActive 
              ? 'Tus movimientos se sincronizan automáticamente entre PC y Móvil.' 
              : 'Los datos se guardan solo en este dispositivo. Configura VITE_SUPABASE_URL para activar la nube.'}
          </p>
        </div>
      </div>

      {isCloudActive && onManualSync && (
        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Sincronizando' : 'Sincronizar Ya'}</span>
        </button>
      )}
    </div>
  );
};
