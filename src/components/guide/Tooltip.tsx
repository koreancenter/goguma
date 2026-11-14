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
            className={`absolute z-[100] whitespace-nowrap px-2.5 py-1.5 bg-[#FFFFFF] text-[#111827] text-[11px] font-medium rounded-md border border-[#E5E7EB] shadow-[0_8px_24px_-4px_rgba(15,23,42,0.12)] pointer-events-none ${getPositionClasses()}`}
          >
            {content}
            {/* Tooltip Arrow */}
            <div className={`absolute w-2 h-2 bg-[#FFFFFF] border-t border-l border-[#E5E7EB] rotate-45 ${
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
      case 'primary': return 'bg-[#1E3A8A] text-white hover:bg-[#172554] border border-[#1E3A8A] font-semibold shadow-xs';
      case 'secondary': return 'bg-[#F7F8FA] text-[#111827] hover:bg-[#F1F5F9] border border-[#E5E7EB]';
      case 'danger': return 'bg-[#FEF2F2] text-[#B91C1C] hover:bg-[#FEE2E2] border border-[#FECACA]';
      case 'warning': return 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] border border-[#BFDBFE]';
      case 'ai': return 'bg-[#1E3A8A] text-white hover:bg-[#172554] border border-[#1E3A8A] font-semibold shadow-xs';
      case 'ghost': return 'bg-transparent text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9] border border-transparent shadow-none';
      default: return 'bg-[#1E3A8A] text-white border border-[#1E3A8A]';
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
