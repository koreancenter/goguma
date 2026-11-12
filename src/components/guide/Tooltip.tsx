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
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: position === 'top' ? 4 : position === 'bottom' ? -4 : 0 }}
            className={`absolute z-[100] whitespace-nowrap px-2.5 py-1.5 bg-[#0E1217] text-[#F0F3F6] text-[10px] font-mono tracking-wider rounded-[2px] border border-white/[0.12] shadow-2xl pointer-events-none ${getPositionClasses()}`}
          >
            {content}
            {/* Tooltip Arrow */}
            <div className={`absolute w-2 h-2 bg-[#0E1217] border-t border-l border-white/[0.12] rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-0 border-l-0 border-b border-r' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r border-b-0 border-l-0' :
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
      case 'primary': return 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] border border-[#2563EB] font-semibold shadow-[0_0_15px_rgba(37,99,235,0.25)]';
      case 'secondary': return 'bg-[#13181F] text-[#F0F3F6] hover:bg-[#1A222C] border border-white/[0.08] shadow-xs';
      case 'danger': return 'bg-[#2A1215] text-red-300 hover:text-red-200 border border-red-900/50 shadow-xs';
      case 'warning': return 'bg-blue-950/60 text-[#38BDF8] hover:text-sky-200 border border-blue-900/50 shadow-xs';
      case 'ai': return 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] border border-[#2563EB] font-semibold shadow-[0_0_15px_rgba(37,99,235,0.25)]';
      case 'ghost': return 'bg-transparent text-zinc-400 hover:text-[#F0F3F6] hover:bg-[#13181F] border border-transparent shadow-none';
      default: return 'bg-[#2563EB] text-white border border-[#2563EB]';
    }
  };

  const getSizeClasses = () => {
    if (label) {
      switch (size) {
        case 'sm': return 'px-2.5 py-1.5 rounded-[2px] gap-1.5 text-xs';
        case 'md': return 'px-3.5 py-2 rounded-[2px] gap-2 text-xs font-semibold';
        case 'lg': return 'px-5 py-3 rounded-[2px] gap-2.5 text-sm font-semibold';
        default: return 'px-3.5 py-2 rounded-[2px] gap-2 text-xs font-semibold';
      }
    }
    switch (size) {
      case 'sm': return 'p-1.5 rounded-[2px]';
      case 'md': return 'p-2 rounded-[2px]';
      case 'lg': return 'p-3 rounded-[2px]';
      default: return 'p-2 rounded-[2px]';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 15;
      case 'md': return 18;
      case 'lg': return 22;
      default: return 18;
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
          inline-flex items-center justify-center 
          transition-colors duration-150 cursor-pointer
          disabled:opacity-40 disabled:cursor-not-allowed
          ${getVariantClasses()} ${getSizeClasses()} ${className}
        `}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <svg className="w-4 h-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            {label && <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>}
          </div>
        ) : (
          <>
            <Icon size={getIconSize()} />
            {label && <span className="font-mono text-[11px] uppercase tracking-wider">{label}</span>}
          </>
        )}
      </button>
    </Tooltip>
  );
};
