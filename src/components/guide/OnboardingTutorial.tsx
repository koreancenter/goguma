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
          className="absolute inset-0 bg-[#111827]/40 backdrop-blur-[2px]"
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
              border: '2px solid #1E3A8A',
              borderRadius: '10px',
              zIndex: 10001,
              boxShadow: '0 0 0 10000px rgba(17, 24, 39, 0.42), 0 0 24px rgba(30, 58, 138, 0.28)',
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
            <div className="bg-[#FFFFFF] rounded-2xl p-6 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] border border-[#E5E7EB] max-w-[380px] w-full text-[#111827] font-sans">
              <div className="flex items-center justify-between mb-3 border-b border-[#E5E7EB] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#EFF6FF] border border-[#1E3A8A]/20 text-[#1E3A8A] flex items-center justify-center rounded-md font-bold text-xs">
                    ✦
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest">ONBOARDING GUIDE</span>
                </div>
                <button 
                  onClick={stopTutorial}
                  className="text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-base font-semibold text-[#111827] tracking-tight mb-1.5">
                {t(currentStep.titleKey)}
              </h3>
              <p className="text-xs text-[#4B5563] font-sans leading-relaxed mb-6">
                {t(currentStep.descriptionKey)}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={`dot-${idx}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentStepIndex ? 'w-4 bg-[#1E3A8A]' : 'w-1.5 bg-[#E5E7EB]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-1.5 text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 bg-[#1E3A8A] hover:bg-[#172554] px-4 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
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
