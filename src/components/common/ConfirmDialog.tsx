import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export interface ConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmDialogProps {
  isOpen: boolean;
  options: ConfirmDialogOptions | null;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, options, onClose }) => {
  if (!isOpen || !options) return null;

  const handleConfirm = () => {
    options.onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (options.onCancel) options.onCancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
        
        {/* Icono y Título */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {options.title || '¿Estás seguro de que deseas eliminar este registro?'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {options.message || 'Esta acción no se puede deshacer y actualizará inmediatamente tus totales y saldos.'}
            </p>
          </div>
        </div>

        {/* Botones Cancelar / Eliminar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {options.cancelText || 'Cancelar'}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{options.confirmText || 'Eliminar'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
