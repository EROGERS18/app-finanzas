import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { SplashScreen } from './components/auth/SplashScreen';
import { AuthView } from './components/auth/AuthView';
import { Navbar } from './components/common/Navbar';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { AlertBanner } from './components/common/AlertBanner';
import { FloatingActionButton } from './components/common/FloatingActionButton';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { OnboardingTour } from './components/onboarding/OnboardingTour';

import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { CreditCardsView } from './components/cards/CreditCardsView';
import { LoansView } from './components/loans/LoansView';
import { CommitmentsView } from './components/commitments/CommitmentsView';
import { CalendarView } from './components/calendar/CalendarView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { ReportsView } from './components/reports/ReportsView';
import { NetWorthView } from './components/networth/NetWorthView';
import { CategoriesView } from './components/categories/CategoriesView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Estado del Tour Onboarding (Solo se abre si el usuario lo solicita manualmente en Configuración)
  const [tourOpen, setTourOpen] = useState(false);

  const handleFinishTour = () => {
    if (currentUser) {
      localStorage.setItem(`finandom_onboarding_done_${currentUser.id}`, 'true');
    }
    setTourOpen(false);
  };

  const handleReopenTour = () => {
    setTourOpen(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'income':
        return <TransactionsView initialType="income" />;
      case 'expenses':
        return <TransactionsView initialType="expense" />;
      case 'cards':
        return <CreditCardsView />;
      case 'loans':
        return <LoansView />;
      case 'commitments':
        return <CommitmentsView />;
      case 'calendar':
        return <CalendarView />;
      case 'budgets':
        return <BudgetsView />;
      case 'reports':
        return <ReportsView />;
      case 'networth':
        return <NetWorthView />;
      case 'categories':
        return <CategoriesView />;
      case 'settings':
        return <SettingsView onReopenTour={handleReopenTour} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Barra de Navegación Superior */}
      <Navbar
        onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Contenedor Principal con Sidebar y Área de Contenido */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Sidebar Lateral */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        {/* Vista Activa */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full">
          {/* Banner de Alertas y Recordatorios Internos */}
          <AlertBanner
            onNavigateToCommitments={() => setActiveTab('commitments')}
            onNavigateToBudgets={() => setActiveTab('budgets')}
          />

          {renderActiveView()}
        </main>
      </div>

      {/* Botón Flotante de Acción Rápida (+) */}
      <FloatingActionButton />

      {/* Modal de Transacciones */}
      <TransactionModal />

      {/* Modal de Perfil de Usuario */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Guía Onboarding Interactiva */}
      <OnboardingTour
        isOpen={tourOpen}
        onFinish={handleFinishTour}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React ErrorBoundary capturó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">DomiFinan - Recuperación del Sistema</h2>
          <p className="text-slate-300 mb-4 max-w-md">Ocurrió un error inesperado al cargar la vista. Haz clic abajo para reiniciar la aplicación limpiamente.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 font-semibold rounded-xl text-slate-950 transition"
          >
            Reiniciar Aplicación
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <FinanceProvider>
      <MainLayout />
    </FinanceProvider>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
