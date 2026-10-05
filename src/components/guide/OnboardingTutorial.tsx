import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTutorial } from '../../contexts/TutorialContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

export const OnboardingTutorial: React.FC = () => {
  const { isActive, currentStepIndex, steps, nextStep, prevStep, stopTutorial } = useTutorial();
  const { t } = useLanguage();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isActive && currentStep.targetId) {
      const updateRect = () => {
        const element = document.getElementById(currentStep.targetId);
        if (element) {
          setTargetRect(element.getBoundingClientRect());
        } else if (currentStep.position === 'center') {
          setTargetRect(null);
        }
      };

      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect);
      
      const interval = setInterval(updateRect, 500); // Poll for layout changes

      return () => {
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect);
        clearInterval(interval);
      };
    }
  }, [isActive, currentStepIndex, steps]);

  if (!isActive) return null;

  const getTooltipStyle = (): React.CSSProperties => {
    let style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 10001,
      pointerEvents: 'auto'
    };

    if (currentStep.position === 'center' || !targetRect) {
      style = {
        ...style,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(90vw, 400px)'
      };
    } else {
      const margin = 20;
      switch (currentStep.position) {
        case 'bottom':
          style.top = targetRect.bottom + margin;
          style.left = targetRect.left + (targetRect.width / 2);
          style.transform = 'translateX(-50%)';
          break;
        case 'top':
          style.bottom = (window.innerHeight - targetRect.top) + margin;
          style.left = targetRect.left + (targetRect.width / 2);
          style.transform = 'translateX(-50%)';
          break;
        case 'left':
          style.top = targetRect.top + (targetRect.height / 2);
          style.right = (window.innerWidth - targetRect.left) + margin;
          style.transform = 'translateY(-50%)';
          break;
        case 'right':
          style.top = targetRect.top + (targetRect.height / 2);
          style.left = targetRect.right + margin;
          style.transform = 'translateY(-50%)';
          break;
      }
    }
    return style;
  };

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none">
      <AnimatePresence>
        {/* Backdrop with hole */}
        <motion.div
          key="tutorial-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"
          style={{
            clipPath: targetRect ? (
              `polygon(
                0% 0%, 0% 100%, 
                ${targetRect.left}px 100%, 
                ${targetRect.left}px ${targetRect.top}px, 
                ${targetRect.right}px ${targetRect.top}px, 
                ${targetRect.right}px ${targetRect.bottom}px, 
                ${targetRect.left}px ${targetRect.bottom}px, 
                ${targetRect.left}px 100%, 100% 100%, 100% 0%
              )`
            ) : 'none'
          }}
        />

        {/* Highlight ring */}
        {targetRect && (
          <motion.div
            key="tutorial-highlight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              border: '4px solid #702283',
              borderRadius: '24px',
              zIndex: 10001,
              boxShadow: '0 0 0 10000px rgba(15, 23, 42, 0.6), 0 0 40px rgba(112,34,131,0.5)',
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        )}

        {isActive && (
          <motion.div
            key={`tutorial-tooltip-${currentStepIndex}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed z-[10001] pointer-events-auto"
            style={getTooltipStyle()}
          >
            <div className="bg-white rounded-[32px] p-8 shadow-[0_32px_64px_-16px_rgba(112,34,131,0.25)] border-2 border-goguma/10 max-w-[400px] w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-goguma-light flex items-center justify-center rounded-xl text-goguma">
                    <Sparkles size={18} />
                  </div>
                  <span className="text-[10px] font-black text-goguma uppercase tracking-widest">Master Architect</span>
                </div>
                <button 
                  onClick={stopTutorial}
                  className="text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                {t(currentStep.titleKey)}
              </h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                {t(currentStep.descriptionKey)}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  {steps.map((_, idx) => (
                    <div 
                      key={`dot-${idx}`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === currentStepIndex ? 'w-6 bg-goguma' : 'w-1.5 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-3 text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-goguma px-6 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-goguma/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    {currentStepIndex === steps.length - 1 ? t('start_exploring') : t('next_step')}
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
