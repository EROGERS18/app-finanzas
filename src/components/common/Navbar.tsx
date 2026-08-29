import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  DollarSign, 
  Bell, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { CloudSyncStatus } from './CloudSyncStatus';

interface NavbarProps {
  onToggleSidebarMobile: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebarMobile, onOpenProfile }) => {
  const { 
    settings, 
    updateSettings, 
    displayCurrency, 
    setDisplayCurrency, 
    selectedMonth, 
    setSelectedMonth,
    selectedFortnight,
    setSelectedFortnight,
    alerts,
    dismissAlert,
    isCloudSyncing,
    syncCloudData
  } = useFinance();

  const { currentUser, logout } = useAuth();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Navegación de mes anterior / siguiente
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const date = new Date(year, month, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  const formatMonthTitle = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    const formatted = date.toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const toggleCurrency = () => {
    const next = displayCurrency === 'DOP' ? 'USD' : 'DOP';
    setDisplayCurrency(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0b0f19]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo y Botón móvil */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebarMobile}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

            <Logo size="md" />
          </div>

          {/* Selector de Mes Central */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
              <span>{formatMonthTitle(selectedMonth)}</span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
              title="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Quincena Rápido en Barra Superior */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              onClick={() => setSelectedFortnight('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFortnight === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Mes Completo
            </button>
            <button
              onClick={() => setSelectedFortnight('q1')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFortnight === 'q1'
                  ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              1ra Q (1-15)
            </button>
            <button
              onClick={() => setSelectedFortnight('q2')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFortnight === 'q2'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              2da Q (16-Fin)
            </button>
          </div>

          {/* Acciones del lado derecho */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Indicador de Sincronización en la Nube */}
            <CloudSyncStatus compact isSyncing={isCloudSyncing} onManualSync={syncCloudData} />

            {/* Toggle Moneda (RD$ / USD) */}
            <button
              onClick={toggleCurrency}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 transition-all"
              title="Cambiar divisa de visualización"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>{displayCurrency === 'DOP' ? 'RD$' : 'US$'}</span>
            </button>

            {/* Campana de Recordatorios / Alertas */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                aria-label="Alertas y recordatorios"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Menú desplegable de Alertas */}
              {showAlertsDropdown && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white text-sm">
                      <Bell className="w-4 h-4 text-emerald-500" />
                      <span>Recordatorios & Alertas</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                        {alerts.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowAlertsDropdown(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
                    {alerts.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-xs">
                        <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                        Todo al día. No tienes alertas pendientes.
                      </div>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                          <div className="flex items-start gap-2.5">
                            <div className={`p-1.5 rounded-lg mt-0.5 ${
                              alert.severity === 'high' 
                                ? 'bg-rose-500/10 text-rose-500' 
                                : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{alert.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{alert.message}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => dismissAlert(alert.id)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Modo Oscuro / Claro */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
              title={settings.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* PERFIL DE USUARIO Y AVATAR */}
            {currentUser && (
              <div className="relative pl-1">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500/50 transition-all text-left"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-xl object-cover border border-emerald-500/50"
                  />
                  <span className="hidden sm:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown del usuario */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs animate-in fade-in zoom-in duration-150">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenProfile();
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        <User className="w-4 h-4 text-emerald-500" />
                        <span>Mi Perfil & Contraseña</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 rounded-xl hover:bg-rose-500/10 text-rose-600 font-semibold mt-1"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
