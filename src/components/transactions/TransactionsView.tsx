import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Edit2, 
  Trash2, 
  Download
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../services/financeCalculations';
import { IconHelper } from '../common/IconHelper';
import { Transaction } from '../../types';

interface TransactionsViewProps {
  initialType?: 'all' | 'income' | 'expense';
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ 
  initialType = 'all' 
}) => {
  const { 
    transactions, 
    categories, 
    paymentMethods, 
    displayCurrency, 
    toggleTransactionStatus, 
    deleteTransaction,
    setEditingTransaction,
    openQuickModal,
    confirmDelete,
    selectedFortnight,
    setSelectedFortnight
  } = useFinance();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>(initialType);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Sincronizar filterType si cambia la pestaña (Ingresos vs Gastos)
  React.useEffect(() => {
    setFilterType(initialType);
  }, [initialType]);

  const filteredList = useMemo(() => {
    return transactions.filter(tx => {
      // Búsqueda por título o notas
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchTitle = tx.title.toLowerCase().includes(term);
        const matchNotes = tx.notes?.toLowerCase().includes(term);
        if (!matchTitle && !matchNotes) return false;
      }

      // Filtro Tipo
      if (filterType !== 'all' && tx.type !== filterType) return false;

      // Filtro Estado
      if (filterStatus !== 'all' && tx.status !== filterStatus) return false;

      // Filtro Quincena (sincronizado globalmente con el Navbar superior)
      if (selectedFortnight !== 'all' && tx.fortnight !== selectedFortnight) return false;

      // Filtro Categoría
      if (filterCategory !== 'all' && tx.categoryId !== filterCategory) return false;

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterStatus, selectedFortnight, filterCategory]);

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    openQuickModal(tx.type);
  };

  const handleDelete = (id: string, title?: string) => {
    confirmDelete({
      title: `¿Eliminar "${title || 'este registro'}"?`,
      message: '¿Estás seguro de que deseas eliminar este registro? Esta acción recalculará inmediatamente tus saldos y gráficos.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: () => {
        deleteTransaction(id);
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['ID,Concepto,Monto,Moneda,Tipo,Categoría,Cuenta,Fecha,Quincena,Estado,Notas\n'];
    const rows = filteredList.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId)?.name || 'General';
      const pm = paymentMethods.find(p => p.id === tx.paymentMethodId)?.name || 'Efectivo';
      return `"${tx.id}","${tx.title}","${tx.amount}","${tx.currency}","${tx.type}","${cat}","${pm}","${tx.date}","${tx.fortnight}","${tx.status}","${tx.notes || ''}"\n`;
    });

    const blob = new Blob([headers.concat(rows).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_finandom_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {filterType === 'income' 
              ? 'Gestión de Ingresos Quincenales' 
              : filterType === 'expense' 
                ? 'Gestión de Gastos de Consumo' 
                : 'Historial de Transacciones'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {filterType === 'income' 
              ? 'Administra, registra y consulta todos tus ingresos por quincena.' 
              : filterType === 'expense' 
                ? 'Administra, registra y consulta todos tus gastos y compromisos por quincena.' 
                : 'Administra, filtra y exporta todos tus movimientos financieros.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-sm"
            title="Exportar a CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => openQuickModal(filterType === 'income' ? 'income' : 'expense')}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all active:scale-95 ${
              filterType === 'income'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-500 hover:to-pink-400 shadow-rose-500/20'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>
              {filterType === 'income' 
                ? '+ Registrar Ingreso' 
                : filterType === 'expense' 
                  ? '+ Registrar Gasto' 
                  : '+ Nuevo Registro'}
            </span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="glass-panel p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Búsqueda por texto */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por concepto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filtro Categoría */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todas las Categorías</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro Tipo */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todos los Tipos</option>
              <option value="income">Ingresos (+)</option>
              <option value="expense">Gastos / Pagos (-)</option>
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Todos los Estados</option>
              <option value="paid">Pagados / Cobrados</option>
              <option value="pending">Pendientes / Compromisos</option>
            </select>
          </div>

          {/* Filtro Quincena (Sincronizado con Navbar superior) */}
          <div>
            <select
              value={selectedFortnight}
              onChange={(e) => setSelectedFortnight(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Ambas Quincenas</option>
              <option value="q1">1ra Quincena (1-15)</option>
              <option value="q2">2da Quincena (16-Fin)</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tabla / Lista de Transacciones */}
      <div className="glass-panel overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs sm:text-sm">
            No se encontraron movimientos con los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Concepto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Cuenta / Método</th>
                  <th className="py-3.5 px-4">Fecha / Q</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredList.map((tx) => {
                  const cat = categories.find(c => c.id === tx.categoryId);
                  const pm = paymentMethods.find(p => p.id === tx.paymentMethodId);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Concepto */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: cat?.color || '#10b981' }}
                          >
                            <IconHelper name={cat?.icon || 'Tag'} className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {tx.title}
                            </span>
                            {tx.notes && (
                              <span className="text-[11px] text-slate-400 block line-clamp-1">
                                {tx.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {cat?.name || 'General'}
                      </td>

                      {/* Cuenta / Método */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {pm?.name || 'Efectivo'}
                      </td>

                      {/* Fecha y Quincena */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <div className="font-medium">{tx.date}</div>
                        <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                          {tx.fortnight === 'q1' ? '1ra Quincena' : '2da Quincena'}
                        </span>
                      </td>

                      {/* Monto */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <span className={`font-black text-sm ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                        </span>
                        {tx.currency !== displayCurrency && (
                          <span className="block text-[10px] text-slate-400">
                            ≈ {formatCurrency(tx.amount, displayCurrency)}
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleTransactionStatus(tx.id)}
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                            tx.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
                          }`}
                          title="Clic para alternar estado"
                        >
                          {tx.status === 'paid' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pagado</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendiente</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id, tx.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-500/10"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
