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
              top: targetRect.top - 6,
              left: targetRect.left - 6,
              width: targetRect.width + 12,
              height: targetRect.height + 12,
              border: '2px solid #C5A880',
              borderRadius: '2px',
              zIndex: 10001,
              boxShadow: '0 0 0 10000px rgba(10, 10, 12, 0.82)',
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          />
        )}

        {isActive && (
          <motion.div
            key={`tutorial-tooltip-${currentStepIndex}`}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed z-[10001] pointer-events-auto"
            style={getTooltipStyle()}
          >
            <div className="bg-[#111116] rounded-[2px] p-6 shadow-2xl border border-[#23232A] max-w-[380px] w-full text-[#F5F3ED] font-sans">
              <div className="flex items-center justify-between mb-3 border-b border-[#23232A] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#141418] border border-[#23232A] text-[#C5A880] flex items-center justify-center rounded-[2px] font-bold text-xs">
                    ✦
                  </div>
                  <span className="text-[10px] font-mono text-[#8E8B82] uppercase tracking-widest">ONBOARDING GUIDE</span>
                </div>
                <button 
                  onClick={stopTutorial}
                  className="text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-base font-semibold text-[#F5F3ED] tracking-tight mb-1.5">
                {t(currentStep.titleKey)}
              </h3>
              <p className="text-xs text-[#B8B5AC] font-sans leading-relaxed mb-6">
                {t(currentStep.descriptionKey)}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#23232A]">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={`dot-${idx}`}
                      className={`h-1 rounded-[1px] transition-all duration-300 ${
                        idx === currentStepIndex ? 'w-4 bg-[#C5A880]' : 'w-1.5 bg-[#23232A]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-1.5 text-[#8E8B82] hover:text-[#F5F3ED] transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 bg-[#C5A880] hover:bg-[#D4B992] px-4 py-1.5 rounded-[2px] text-[#0A0A0C] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{currentStepIndex === steps.length - 1 ? t('start_exploring') : t('next_step')}</span>
                    <ChevronRight size={14} />
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
