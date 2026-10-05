import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 5 : position === 'bottom' ? -5 : 0 }}
            className={`absolute z-[100] whitespace-nowrap px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg shadow-xl pointer-events-none ${getPositionClasses()}`}
          >
            {content}
            {/* Tooltip Arrow */}
            <div className={`absolute w-2 h-2 bg-slate-900 rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface IconButtonProps {
  icon: React.ElementType;
  tooltip: string;
  label?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'ai' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  position?: 'top' | 'bottom' | 'left' | 'right';
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  tooltip,
  label,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  position = 'top',
  isLoading = false,
  disabled = false,
  className = ''
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary': return 'bg-goguma text-white hover:bg-fuchsia-950 shadow-sm shadow-goguma/20 active:bg-goguma';
      case 'secondary': return 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200/80 shadow-xs';
      case 'danger': return 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 shadow-xs';
      case 'warning': return 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 shadow-xs';
      case 'ai': return 'bg-goguma text-white hover:bg-fuchsia-950 shadow-sm ring-2 ring-goguma-light ring-offset-1';
      case 'ghost': return 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 shadow-none';
      default: return 'bg-goguma text-white';
    }
  };

  const getSizeClasses = () => {
    if (label) {
      switch (size) {
        case 'sm': return 'px-3 py-1.5 rounded-lg gap-1.5';
        case 'md': return 'px-4 py-2.5 rounded-xl gap-2';
        case 'lg': return 'px-6 py-4 rounded-2xl gap-3';
        default: return 'px-4 py-2.5 rounded-xl gap-2';
      }
    }
    switch (size) {
      case 'sm': return 'p-1.5 rounded-lg';
      case 'md': return 'p-2.5 rounded-xl';
      case 'lg': return 'p-4 rounded-2xl';
      default: return 'p-2.5 rounded-xl';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 16;
      case 'md': return 20;
      case 'lg': return 24;
      default: return 20;
    }
  };

  return (
    <Tooltip content={tooltip} position={position}>
      <button
        type={type}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) {
            onClick(e);
          }
        }}
        disabled={disabled || isLoading}
        className={`
          flex items-center justify-center 
          transition-all duration-200 
          shadow-lg hover:scale-105 active:scale-95 
          disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100
          ${getVariantClasses()} ${getSizeClasses()} ${className}
        `}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <svg className="w-5 h-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            {label && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
          </div>
        ) : (
          <>
            <Icon size={getIconSize()} />
            {label && <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>}
          </>
        )}
      </button>
    </Tooltip>
  );
};
