import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Coffee, 
  Home, 
  Car, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  Briefcase, 
  Smartphone, 
  X,
  FolderPlus
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />,
  HeartPulse: <HeartPulse className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Tag: <Tag className="w-5 h-5" />,
};

const PALETTE = [
  '#059669', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6', 
  '#ec4899', '#f43f5e', '#ef4444', '#f59e0b', '#10b981'
];

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, confirmDelete } = useFinance();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [color, setColor] = useState('#059669');
  const [icon, setIcon] = useState('Tag');

  const incomeCats = categories.filter(c => c.type === 'income' || c.type === 'both');
  const expenseCats = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const handleOpenNew = (t: 'expense' | 'income' = 'expense') => {
    setEditingCategory(null);
    setName('');
    setType(t);
    setColor('#059669');
    setIcon('Tag');
    setModalOpen(true);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type === 'income' ? 'income' : 'expense');
    setColor(cat.color);
    setIcon(cat.icon || 'Tag');
    setModalOpen(true);
  };

  const handleDelete = (cat: Category) => {
    confirmDelete({
      title: `¿Eliminar categoría "${cat.name}"?`,
      message: 'Esta acción eliminará la categoría. Las transacciones existentes mantendrán su historial.',
      confirmText: 'Eliminar Categoría',
      onConfirm: () => {
        deleteCategory(cat.id);
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: name.trim(),
        type,
        color,
        icon
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
        color,
        icon
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Categorías
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Personaliza tus etiquetas de ingresos y gastos con iconos y colores representativos.
          </p>
        </div>

        <button
          onClick={() => handleOpenNew('expense')}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid: Categorías de Gastos vs Categorías de Ingresos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gastos */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-rose-500 font-extrabold text-sm sm:text-base">
              <TrendingDown className="w-5 h-5" />
              <span>Categorías de Gastos ({expenseCats.length})</span>
            </div>
            <button
              onClick={() => handleOpenNew('expense')}
              className="text-xs text-rose-500 font-bold hover:underline"
            >
              + Añadir
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expenseCats.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    {CATEGORY_ICONS[c.icon] || <Tag className="w-4 h-4" />}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {c.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingresos */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-500 font-extrabold text-sm sm:text-base">
              <TrendingUp className="w-5 h-5" />
              <span>Categorías de Ingresos ({incomeCats.length})</span>
            </div>
            <button
              onClick={() => handleOpenNew('income')}
              className="text-xs text-emerald-500 font-bold hover:underline"
            >
              + Añadir
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {incomeCats.map(c => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  >
                    {CATEGORY_ICONS[c.icon] || <Tag className="w-4 h-4" />}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {c.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la categoría *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Entretenimiento, Educación..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de flujo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === 'expense'
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      type === 'income'
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-xl transition-transform ${
                        color === c ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'opacity-80'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Icono */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Icono
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(CATEGORY_ICONS).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setIcon(iconKey)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                        icon === iconKey
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {CATEGORY_ICONS[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                >
                  Guardar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
