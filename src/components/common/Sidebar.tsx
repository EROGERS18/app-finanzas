import React from 'react';
import { 
  LayoutDashboard, 
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight, 
  CreditCard,
  Landmark,
  Scale,
  Clock, 
  CalendarDays, 
  PieChart, 
  BarChart3, 
  Tag,
  Settings as SettingsIcon,
  X,
  User,
  LogOut
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../services/financeCalculations';

export type ActiveTab = 
  | 'dashboard' 
  | 'income' 
  | 'expenses' 
  | 'transactions'
  | 'cards' 
  | 'loans' 
  | 'commitments' 
  | 'calendar' 
  | 'budgets' 
  | 'reports' 
  | 'networth' 
  | 'categories' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onOpenProfile
}) => {
  const { metrics, creditCards, loans, displayCurrency } = useFinance();
  const { currentUser, logout } = useAuth();

  const activeLoansCount = loans.filter(l => l.status !== 'completed' && l.pendingBalance > 0).length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'income' as ActiveTab, label: 'Ingresos', icon: ArrowUpRight, badge: null },
    { id: 'expenses' as ActiveTab, label: 'Gastos', icon: ArrowDownRight, badge: null },
    { id: 'cards' as ActiveTab, label: 'Tarjetas de Crédito', icon: CreditCard, badge: creditCards.length > 0 ? `${creditCards.length}` : null },
    { id: 'loans' as ActiveTab, label: 'Préstamos & Deudas', icon: Landmark, badge: activeLoansCount > 0 ? `${activeLoansCount}` : null },
    { id: 'commitments' as ActiveTab, label: 'Próximos Pagos', icon: Clock, badge: metrics.totalPendingExpense > 0 ? 'Pendiente' : null },
    { id: 'calendar' as ActiveTab, label: 'Calendario', icon: CalendarDays, badge: null },
    { id: 'budgets' as ActiveTab, label: 'Presupuestos', icon: PieChart, badge: null },
    { id: 'reports' as ActiveTab, label: 'Reportes Financieros', icon: BarChart3, badge: null },
    { id: 'networth' as ActiveTab, label: 'Patrimonio Neto', icon: Scale, badge: null },
    { id: 'categories' as ActiveTab, label: 'Categorías', icon: Tag, badge: null },
    { id: 'settings' as ActiveTab, label: 'Configuración', icon: SettingsIcon, badge: null },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar contenedor */}
      <aside
        className={`fixed md:sticky top-0 md:top-20 h-full md:h-[calc(100vh-5rem)] w-64 bg-white dark:bg-[#0b0f19] border-r border-slate-200/80 dark:border-slate-800/80 z-50 md:z-10 flex flex-col justify-between p-3.5 transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Cabecera Móvil */}
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Navegación</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Navegación con Scroll */}
        <nav className="space-y-1 mt-1 flex-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-l-4 border-emerald-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Widget Inferior: Perfil de Usuario & Disponible */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-2">
          {/* Tarjeta de Disponible Rápido */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:to-slate-800/50 border border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              Disponible Líquido
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(metrics.currentBalance, displayCurrency)}
            </div>
            <div className="text-[10px] text-slate-400 flex justify-between mt-1">
              <span>Deudas:</span>
              <span className="text-rose-500 font-bold">-{formatCurrency(metrics.totalDebts, displayCurrency)}</span>
            </div>
          </div>

          {/* Botón de Perfil con Avatar y Logout */}
          {currentUser && (
            <div className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 text-left flex-1 truncate hover:opacity-80 transition-opacity"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 shrink-0"
                />
                <div className="truncate">
                  <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    Mi Perfil & Ajustes
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                title="Cerrar sesión"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </aside>
    </>
  );
};
