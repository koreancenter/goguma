import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cookie, ShieldCheck, BarChart3, Megaphone, Check } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface CookiePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CookiePolicyModal({ isOpen, onClose }: CookiePolicyModalProps) {
  const { t } = useLanguage();
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-fit max-h-[85vh] bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <Cookie size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('cookie_policy')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Privacy & Trust</p>
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
            <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Essential Cookies */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                <div className="w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <ShieldCheck size={18} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('essential_cookies_title')}</h3>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[8px] font-black uppercase tracking-widest">
                      {t('always_on')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {t('essential_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-6 bg-blue-50/30 rounded-2xl border border-blue-100/50 flex items-start gap-4">
                <div className="w-8 h-8 bg-white rounded-lg border border-blue-100 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <BarChart3 size={18} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('analytics_cookies_title')}</h3>
                    <button 
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${analyticsEnabled ? 'bg-blue-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${analyticsEnabled ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {t('analytics_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-6 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex items-start gap-4">
                <div className="w-8 h-8 bg-white rounded-lg border border-rose-100 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <Megaphone size={18} />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t('marketing_cookies_title')}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-100 text-rose-600 rounded text-[8px] font-black uppercase tracking-widest">
                      <X size={8} />
                      {t('not_collected')}
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {t('marketing_cookies_desc')}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <p className="text-[10px] text-slate-400 leading-relaxed italic text-center">
                   Managing your privacy helps us improve the Google AI Ecosystem for all users while respecting your choices.
                 </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-goguma transition-all shadow-lg shadow-slate-900/10 flex items-center gap-2"
              >
                <Check size={14} />
                {t('save_preferences')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
