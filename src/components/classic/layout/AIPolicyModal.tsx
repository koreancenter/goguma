import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Brain, Cpu, Globe, AlertCircle, Lock } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AIPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIPolicyModal({ isOpen, onClose }: AIPolicyModalProps) {
  const { t } = useLanguage();

  const sections = [
    {
      id: 'intro',
      title: t('ai_policy_intro_title'),
      desc: t('ai_policy_intro_desc'),
      icon: Globe
    },
    {
      id: 'training',
      title: t('ai_policy_training_title'),
      desc: t('ai_policy_training_desc'),
      icon: Brain,
      highlight: true
    },
    {
      id: 'security',
      title: t('ai_policy_security_title'),
      desc: t('ai_policy_security_desc'),
      icon: Lock
    },
    {
      id: 'transfer',
      title: t('ai_policy_transfer_title'),
      desc: t('ai_policy_transfer_desc'),
      icon: Cpu
    },
    {
      id: 'liability',
      title: t('ai_policy_liability_title'),
      desc: t('ai_policy_liability_desc'),
      icon: AlertCircle
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[9998]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-[580px] bg-[#111116] rounded-[2px] shadow-2xl z-[9999] overflow-hidden flex flex-col border border-[#23232A] text-[#F5F3ED] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#23232A] flex items-center justify-between bg-[#0E0E12] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#141418] border border-[#23232A] text-[#C5A880] rounded-[2px] flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#F5F3ED] uppercase tracking-wide">{t('ai_policy')}</h2>
                  <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">Ethical Intelligence & Privacy Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-4 flex-1 bg-[#111116]">
              {sections.map((section) => (
                <section key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-[2px] bg-[#141418] border border-[#23232A] flex items-center justify-center text-[#C5A880] shrink-0">
                      <section.icon size={13} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED]">{section.title}</h3>
                    {section.highlight && (
                      <span className="px-1.5 py-0.5 bg-[#16161F] text-[#C5A880] border border-[#C5A880]/30 text-[9px] font-mono uppercase tracking-wider rounded-[2px]">Verified</span>
                    )}
                  </div>
                  
                  <div className="p-4 rounded-[2px] border border-[#23232A] bg-[#141418] space-y-2">
                    <p className="text-xs leading-relaxed font-sans text-[#B8B5AC]">
                      {section.desc}
                    </p>
                    
                    {section.id === 'security' && (
                      <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-[#23232A]">
                        <span className="px-2 py-0.5 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-[10px] font-mono text-[#B8B5AC]">TLS 1.3 Encryption</span>
                        <span className="px-2 py-0.5 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-[10px] font-mono text-[#B8B5AC]">AES-256 at Rest</span>
                      </div>
                    )}

                    {section.id === 'training' && (
                      <div className="mt-2 flex items-center gap-2 pt-2 border-t border-[#23232A]">
                        <div className="w-1.5 h-1.5 bg-[#C5A880] rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-wider">Zero-Training Verified (No Model Retraining)</span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#23232A] bg-[#0E0E12] flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-[#141418] hover:bg-[#1A1A22] border border-[#23232A] text-[#F5F3ED] rounded-[2px] text-xs font-medium transition-colors cursor-pointer"
              >
                닫기
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
