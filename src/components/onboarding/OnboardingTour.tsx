import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  Landmark, 
  Clock, 
  CalendarDays, 
  PieChart, 
  BarChart3, 
  Settings,
  CheckCircle2
} from 'lucide-react';
import { ActiveTab } from '../common/Sidebar';

interface OnboardingTourProps {
  isOpen: boolean;
  onFinish: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
}

interface TourStep {
  stepIndex: number;
  title: string;
  description: string;
  tabTarget: ActiveTab;
  icon: React.ReactNode;
}

export const TOUR_STEPS: TourStep[] = [
  {
    stepIndex: 1,
    title: 'Dashboard / Centro de Control',
    description: 'Aquí puedes consultar rápidamente tu situación financiera completa, incluyendo saldo disponible, ingresos, gastos, compromisos y patrimonio neto.',
    tabTarget: 'dashboard',
    icon: <LayoutDashboard className="w-6 h-6 text-emerald-500" />
  },
  {
    stepIndex: 2,
    title: 'Ingresos Quincenales',
    description: 'Registra tu salario por quincena, ingresos adicionales, extras o cobros recurrentes para calcular tu flujo disponible real.',
    tabTarget: 'income',
    icon: <ArrowUpRight className="w-6 h-6 text-emerald-500" />
  },
  {
    stepIndex: 3,
    title: 'Gastos de Consumo',
    description: 'Registra tus compras y consumos diarios para conocer exactamente en qué utilizas tu dinero cada quincena.',
    tabTarget: 'expenses',
    icon: <ArrowDownRight className="w-6 h-6 text-rose-500" />
  },
  {
    stepIndex: 4,
    title: 'Tarjetas de Crédito',
    description: 'Administra tus tarjetas de crédito, límites aprobados, fechas de corte, días de pago y saldos adeudados con su historial de movimientos.',
    tabTarget: 'cards',
    icon: <CreditCard className="w-6 h-6 text-purple-500" />
  },
  {
    stepIndex: 5,
    title: 'Préstamos & Deudas Acumulativas',
    description: 'Mantén un seguimiento de tus préstamos personales o bancarios. Las deudas permanecen activas hasta que el saldo pendiente sea RD$0.00.',
    tabTarget: 'loans',
    icon: <Landmark className="w-6 h-6 text-indigo-500" />
  },
  {
    stepIndex: 6,
    title: 'Próximos Pagos & Vencimientos',
    description: 'Encuentra las facturas, cuotas y compromisos de tarjetas con alertas de días restantes para evitar mora.',
    tabTarget: 'commitments',
    icon: <Clock className="w-6 h-6 text-amber-500" />
  },
  {
    stepIndex: 7,
    title: 'Calendario Financiero',
    description: 'Consulta de forma visual el calendario mensual con los días exactos de vencimiento de tus gastos y cuotas.',
    tabTarget: 'calendar',
    icon: <CalendarDays className="w-6 h-6 text-blue-500" />
  },
  {
    stepIndex: 8,
    title: 'Presupuestos por Categoría',
    description: 'Define límites mensuales de gasto por categoría (ej: Supermercado, Combustible) y monitorea las barras de progreso.',
    tabTarget: 'budgets',
    icon: <PieChart className="w-6 h-6 text-teal-500" />
  },
  {
    stepIndex: 9,
    title: 'Reportes & Análisis',
    description: 'Analiza la evolución de tus finanzas con gráficos comparativos de ingresos vs gastos, distribución por categoría y salud patrimonial.',
    tabTarget: 'reports',
    icon: <BarChart3 className="w-6 h-6 text-emerald-500" />
  },
  {
    stepIndex: 10,
    title: 'Configuración & Backup',
    description: 'Desde aquí puedes cambiar tu apariencia (Modo Claro/Oscuro), gestionar tus datos, hacer respaldos JSON y restaurarlos.',
    tabTarget: 'settings',
    icon: <Settings className="w-6 h-6 text-slate-500" />
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onFinish, onNavigateTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish();
    } else {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (onNavigateTab) {
        onNavigateTab(TOUR_STEPS[nextIdx].tabTarget);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (onNavigateTab) {
        onNavigateTab(TOUR_STEPS[prevIdx].tabTarget);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 space-y-5 animate-in zoom-in-95">
        
        {/* Barra de Progreso Superior */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Guía de Inicio • Paso {currentStep + 1} de {TOUR_STEPS.length}
            </span>
          </div>

          <button
            onClick={onFinish}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Saltar guía
          </button>
        </div>

        {/* Indicador de Línea de Progreso */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Contenido del Paso */}
        <div className="space-y-3 py-2 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto sm:mx-0 shadow-inner">
            {step.icon}
          </div>

          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {step.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Botones de Navegación del Tour */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
              currentStep === 0
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Atrás</span>
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>{isLast ? 'Comenzar a utilizar la aplicación' : 'Siguiente'}</span>
            {isLast ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </div>
  );
};
