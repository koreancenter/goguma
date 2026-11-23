import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTutorial } from '../../contexts/TutorialContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

export const OnboardingTutorial: React.FC = () => {
  const { isActive, currentStepIndex, steps, nextStep, prevStep, stopTutorial } = useTutorial();
  const { t, pick } = useLanguage();
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
              border: '2px solid var(--theme-ink-strong)',
              borderRadius: '10px',
              zIndex: 10001,
              boxShadow: '0 0 0 10000px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 0, 0, 0.25)',
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
            <div className="bg-[var(--theme-elevated)] rounded-2xl p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.28)] border border-[var(--theme-border-hairline)] max-w-[380px] w-full text-[var(--theme-ink-primary)] font-sans">
              <div className="flex items-center justify-between mb-3 border-b border-[var(--theme-border-hairline)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[var(--theme-active-bg)] border border-[var(--theme-border-strong)] text-[var(--theme-active-text)] flex items-center justify-center rounded-md font-bold text-xs">
                    ✦
                  </div>
                  <span className="text-[10px] font-sans font-semibold text-[var(--theme-ink-muted)] uppercase tracking-widest">
                    {pick({ ko: '스튜디오 가이드', en: 'ONBOARDING GUIDE', ja: 'スタジオガイド', id: 'PANDUAN STUDIO' })}
                  </span>
                </div>
                <button 
                  onClick={stopTutorial}
                  className="text-[var(--theme-ink-muted)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-base font-semibold text-[var(--theme-ink-strong)] tracking-tight mb-1.5">
                {t(currentStep.titleKey)}
              </h3>
              <p className="text-xs text-[var(--theme-ink-secondary)] font-sans leading-relaxed mb-6">
                {t(currentStep.descriptionKey)}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--theme-border-hairline)]">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, idx) => (
                    <div 
                      key={`dot-${idx}`}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === currentStepIndex ? 'w-4 bg-[var(--theme-ink-strong)]' : 'w-1.5 bg-[var(--theme-border-hairline)]'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {currentStepIndex > 0 && (
                    <button
                      onClick={prevStep}
                      className="p-1.5 text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors cursor-pointer"
                    >
                      <ChevronLeft size={16} />
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] px-4 py-1.5 rounded-lg text-[var(--theme-btn-text)] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>
                      {currentStepIndex === steps.length - 1
                        ? t('start_exploring')
                        : pick({ ko: '다음 단계', en: 'Next Step', ja: '次へ', id: 'Langkah Berikutnya' })}
                    </span>
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
