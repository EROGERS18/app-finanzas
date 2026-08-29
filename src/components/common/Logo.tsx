import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8 rounded-xl', text: 'text-base', subtitle: 'text-[9px]' },
    md: { box: 'w-10 h-10 rounded-2xl', text: 'text-xl', subtitle: 'text-[10px]' },
    lg: { box: 'w-14 h-14 rounded-2xl', text: 'text-2xl', subtitle: 'text-xs' },
    xl: { box: 'w-24 h-24 rounded-3xl', text: 'text-4xl', subtitle: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Isotipo Oficial Creado para DomiFinan */}
      <div className={`relative ${currentSize.box} shrink-0 bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 p-[1.5px] shadow-lg shadow-emerald-500/25 group cursor-pointer transition-transform hover:scale-105 overflow-hidden`}>
        <div className="w-full h-full bg-slate-950 rounded-[inherit] overflow-hidden flex items-center justify-center">
          <img 
            src="/domifinan_icon.jpg" 
            alt="DomiFinan Shield Icon" 
            className="w-full h-full object-cover rounded-[inherit]"
          />
        </div>
      </div>

      {/* Marca Nominal DomiFinan */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-sans tracking-tight font-black ${currentSize.text} leading-none text-slate-900 dark:text-white flex items-center`}>
            <span>Domi</span>
            <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent ml-0.5">
              Finan
            </span>
          </div>
          <span className={`${currentSize.subtitle} font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-0.5`}>
            Control Financiero
          </span>
        </div>
      )}
    </div>
  );
};
