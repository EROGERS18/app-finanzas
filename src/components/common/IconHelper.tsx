import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-5 h-5', size }) => {
  const iconsMap = LucideIcons as unknown as Record<string, React.ElementType>;
  const IconComponent = iconsMap[name] || LucideIcons.CircleDot;
  return <IconComponent className={className} size={size} />;
};
