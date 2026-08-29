import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Category } from '../../types';
import { IconHelper } from '../common/IconHelper';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Omit<Category, 'id'> | Category) => void;
  editingCategory: Category | null;
}

const AVAILABLE_ICONS = [
  'Briefcase', 'Laptop', 'TrendingUp', 'Home', 'ShoppingCart', 'Zap',
  'Car', 'CreditCard', 'Film', 'HeartPulse', 'GraduationCap', 'MoreHorizontal',
  'Coffee', 'Plane', 'Smartphone', 'Gift', 'Shield', 'Utensils'
];

const AVAILABLE_COLORS = [
  '#10b981', '#059669', '#3b82f6', '#0284c7', '#8b5cf6', '#a855f7',
  '#ef4444', '#f59e0b', '#d97706', '#06b6d4', '#ec4899', '#64748b'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'both'>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#10b981');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setType(editingCategory.type);
      setIcon(editingCategory.icon);
      setColor(editingCategory.color);
    } else {
      setName('');
      setType('expense');
      setIcon('Tag');
      setColor('#10b981');
    }
  }, [isOpen, editingCategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      onSave({
        ...editingCategory,
        name: name.trim(),
        type,
        icon,
        color
      });
    } else {
      onSave({
        name: name.trim(),
        type,
        icon,
        color
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Tag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Mantenimiento, Suscripciones..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Aplica a:
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'income' | 'expense' | 'both')}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="expense">Gastos Solamente</option>
              <option value="income">Ingresos Solamente</option>
              <option value="both">Ambos (Ingresos y Gastos)</option>
            </select>
          </div>

          {/* Selector de Icono */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Icono Representativo
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconName) => (
                <button
                  type="button"
                  key={iconName}
                  onClick={() => setIcon(iconName)}
                  className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                    icon === iconName
                      ? 'bg-emerald-500 text-white border-emerald-500 scale-105'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <IconHelper name={iconName} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Color Distintivo
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
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
              Guardar Categoría
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
