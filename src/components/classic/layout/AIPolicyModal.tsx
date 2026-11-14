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
            className="fixed inset-0 bg-[#111827]/35 backdrop-blur-xs z-[9998]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] h-[580px] bg-[#FFFFFF] rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] z-[9999] overflow-hidden flex flex-col border border-[#E5E7EB] text-[#111827] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#EFF6FF] border border-[#1E3A8A]/20 text-[#1E3A8A] rounded-lg flex items-center justify-center font-bold shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#111827] uppercase tracking-wide">{t('ai_policy')}</h2>
                  <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">Ethical Intelligence & Privacy Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll space-y-4 flex-1 bg-[#FFFFFF]">
              {sections.map((section) => (
                <section key={section.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#F7F8FA] border border-[#E5E7EB] flex items-center justify-center text-[#1E3A8A] shrink-0">
                      <section.icon size={13} />
                    </div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">{section.title}</h3>
                    {section.highlight && (
                      <span className="px-1.5 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20 text-[9px] font-mono uppercase tracking-wider rounded">Verified</span>
                    )}
                  </div>
                  
                  <div className="p-4 rounded-xl border border-[#E5E7EB] bg-[#F7F8FA] space-y-2">
                    <p className="text-xs leading-relaxed font-sans text-[#374151]">
                      {section.desc}
                    </p>
                    
                    {section.id === 'security' && (
                      <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-[#E5E7EB]">
                        <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded text-[10px] font-mono text-[#374151]">TLS 1.3 Encryption</span>
                        <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded text-[10px] font-mono text-[#374151]">AES-256 at Rest</span>
                      </div>
                    )}

                    {section.id === 'training' && (
                      <div className="mt-2 flex items-center gap-2 pt-2 border-t border-[#E5E7EB]">
                        <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-[#1E3A8A] uppercase tracking-wider">Zero-Training Verified (No Model Retraining)</span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-[#FFFFFF] hover:bg-[#F1F5F9] border border-[#E5E7EB] text-[#111827] rounded-lg text-xs font-medium transition-colors cursor-pointer"
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
