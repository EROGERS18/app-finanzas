import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: string;
  title?: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, title, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setIsVisible(!isVisible);
        }}
        className="p-1 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors focus:outline-none"
        aria-label="Información adicional"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {isVisible && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 p-3 bg-slate-900 text-white rounded-2xl shadow-xl z-50 text-xs animate-in fade-in duration-150 border border-slate-700/80 pointer-events-none"
        >
          {title && <h5 className="font-bold text-emerald-400 mb-1">{title}</h5>}
          <p className="text-[11px] text-slate-300 leading-relaxed">{content}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
