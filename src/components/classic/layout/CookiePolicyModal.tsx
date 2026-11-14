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
            className="fixed inset-0 bg-[#111827]/35 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
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
                  <Cookie size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#111827] uppercase tracking-wide">{t('cookie_policy')}</h2>
                  <p className="text-[11px] text-[#6B7280] font-mono mt-0.5">Privacy & Local Storage Transparency</p>
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
              {/* Essential Cookies */}
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#1E3A8A] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">{t('essential_cookies_title')}</h3>
                    <span className="px-2 py-0.5 bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20 rounded text-[9px] font-mono uppercase tracking-wider">
                      {t('always_on')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#4B5563] font-sans">
                    {t('essential_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#1E3A8A] shrink-0">
                  <BarChart3 size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">{t('analytics_cookies_title')}</h3>
                    <button 
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${analyticsEnabled ? 'bg-[#1E3A8A]' : 'bg-[#D1D5DB]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-2xs ${analyticsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-[#4B5563] font-sans">
                    {t('analytics_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#FFFFFF] rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0">
                  <Megaphone size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#111827] uppercase tracking-wider">{t('marketing_cookies_title')}</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#FFFFFF] text-[#4B5563] border border-[#E5E7EB] rounded text-[9px] font-mono uppercase tracking-wider">
                      <X size={9} />
                      <span>{t('not_collected')}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#4B5563] font-sans">
                    {t('marketing_cookies_desc')}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5E7EB]">
                <p className="text-[11px] text-[#6B7280] font-mono text-center">
                  Zero telemetry & zero third-party commercial trackers guarantee.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>{t('save_preferences')}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
