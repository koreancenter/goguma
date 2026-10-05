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
      icon: Globe,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'training',
      title: t('ai_policy_training_title'),
      desc: t('ai_policy_training_desc'),
      icon: Brain,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      highlight: true
    },
    {
      id: 'security',
      title: t('ai_policy_security_title'),
      desc: t('ai_policy_security_desc'),
      icon: Lock,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      id: 'transfer',
      title: t('ai_policy_transfer_title'),
      desc: t('ai_policy_transfer_desc'),
      icon: Cpu,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'liability',
      title: t('ai_policy_liability_title'),
      desc: t('ai_policy_liability_desc'),
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50'
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('ai_policy')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ethical Intelligence Protocol</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              {sections.map((section) => (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${section.bgColor} rounded-lg flex items-center justify-center ${section.color} flex-shrink-0`}>
                      <section.icon size={18} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">{section.title}</h3>
                    {section.highlight && (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest rounded">Crucial</span>
                    )}
                  </div>
                  
                  <div className={`p-6 rounded-2xl border transition-all duration-300 ${
                    section.highlight 
                      ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/10' 
                      : 'bg-white border-slate-100'
                  }`}>
                    <p className={`text-xs leading-relaxed font-medium ${
                      section.highlight ? 'text-slate-200' : 'text-slate-600'
                    }`}>
                      {section.desc}
                    </p>
                    
                    {section.id === 'security' && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-bold text-indigo-600 uppercase tracking-wider">TLS 1.3 Encryption</div>
                        <div className="px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[9px] font-bold text-indigo-600 uppercase tracking-wider">AES-256 at Rest</div>
                      </div>
                    )}

                    {section.id === 'training' && (
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Zero-Training Verified</span>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-slate-900/10"
              >
                Close Policy
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
