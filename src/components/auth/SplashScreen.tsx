import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, CreditCard, Landmark, Wallet, Scale } from 'lucide-react';
import { Logo } from '../common/Logo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [scene, setScene] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Detectar preferencia del sistema para reducir animaciones
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      // Transición ultra rápida para usuarios que requieren movimiento reducido
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        setTimeout(onFinish, 300);
      }, 600);
      return () => clearTimeout(timer);
    }

    // Cronograma dinámico de escenas (duración total 4.2 segundos)
    const sceneTimers = [
      setTimeout(() => setScene(2), 700),   // Escena 2: Formación del Isotipo
      setTimeout(() => setScene(3), 1600),  // Escena 3: Marca FinanDOM
      setTimeout(() => setScene(4), 2600),  // Escena 4: Conceptos Financieros
      setTimeout(() => setScene(5), 3600),  // Escena 5: Finalización y Transición
    ];

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(onFinish, 500);
          }, 200);
          return 100;
        }
        return prev + 1;
      });
    }, 38);

    return () => {
      sceneTimers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [onFinish, prefersReducedMotion]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 300);
  };

  const concepts = [
    { label: 'Ingresos', icon: TrendingUp, color: 'text-emerald-400 border-emerald-500/30' },
    { label: 'Gastos', icon: Wallet, color: 'text-rose-400 border-rose-500/30' },
    { label: 'Tarjetas', icon: CreditCard, color: 'text-purple-400 border-purple-500/30' },
    { label: 'Préstamos', icon: Landmark, color: 'text-indigo-400 border-indigo-500/30' },
    { label: 'Patrimonio', icon: Scale, color: 'text-teal-400 border-teal-500/30' },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white transition-opacity duration-700 overflow-hidden select-none ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* ESCENA 1: Fondo & Destellos de Luz */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Botón Omitir Intro */}
      <div className="w-full flex justify-end z-20">
        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 backdrop-blur-md text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all shadow-md active:scale-95 border border-slate-300/50 dark:border-white/10"
        >
          <span>Omitir intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ESCENA 2 & 3: Isotipo y Marca Construyéndose */}
      <div className="flex flex-col items-center justify-center text-center z-10 my-auto space-y-6">
        
        {/* Contenedor del Logo con Animación de Escala Elástica */}
        <div className={`transition-all duration-700 transform ${
          scene >= 2 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}>
          <div className="relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-indigo-500/20 blur-2xl animate-spin" style={{ animationDuration: '10s' }} />
            
            <Logo size="xl" showText={false} />
          </div>
        </div>

        {/* ESCENA 3: Nombre de la Aplicación y Tagline */}
        <div className={`space-y-3 transition-all duration-700 transform ${
          scene >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-sans text-slate-900 dark:text-white">
            Domi<span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent">Finan</span>
          </h1>

          <p className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
            Centro de Control Financiero Personal
          </p>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Control Quincenal • Multi-usuario Seguro</span>
          </div>
        </div>

        {/* ESCENA 4: Conceptos Financieros Integrados */}
        <div className={`flex items-center justify-center gap-2 flex-wrap max-w-md pt-2 transition-all duration-700 ${
          scene >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {concepts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border ${item.color} text-xs font-bold shadow-lg backdrop-blur-md animate-in zoom-in-75`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>

      </div>

      {/* ESCENA 5: Barra de Carga e Indicador de Inicio */}
      <div className="w-full max-w-xs z-10 space-y-2">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Iniciando entorno financiero...</span>
          <span className="text-emerald-400 font-bold">{progress}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-center text-[10px] text-slate-500 pt-1">
          Datos cifrados y aislados localmente
        </p>
      </div>

    </div>
  );
};
