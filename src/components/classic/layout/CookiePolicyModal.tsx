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
            className="fixed inset-0 bg-black/80 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
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
                  <Cookie size={18} />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-[#F5F3ED] uppercase tracking-wide">{t('cookie_policy')}</h2>
                  <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">Privacy & Local Storage Transparency</p>
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
              {/* Essential Cookies */}
              <div className="p-4 bg-[#141418] rounded-[2px] border border-[#23232A] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#0E0E12] rounded-[2px] border border-[#23232A] flex items-center justify-center text-[#C5A880] shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider">{t('essential_cookies_title')}</h3>
                    <span className="px-2 py-0.5 bg-[#16161F] text-[#C5A880] border border-[#C5A880]/30 rounded-[2px] text-[9px] font-mono uppercase tracking-wider">
                      {t('always_on')}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#B8B5AC] font-sans">
                    {t('essential_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-[#141418] rounded-[2px] border border-[#23232A] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#0E0E12] rounded-[2px] border border-[#23232A] flex items-center justify-center text-[#C5A880] shrink-0">
                  <BarChart3 size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider">{t('analytics_cookies_title')}</h3>
                    <button 
                      onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                      className={`relative w-9 h-5 rounded-[2px] transition-colors cursor-pointer ${analyticsEnabled ? 'bg-[#C5A880]' : 'bg-[#23232A]'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-[1px] transition-all ${analyticsEnabled ? 'left-4.5 bg-[#0A0A0C]' : 'left-0.5 bg-[#8E8B82]'}`} />
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-[#B8B5AC] font-sans">
                    {t('analytics_cookies_desc')}
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-[#141418] rounded-[2px] border border-[#23232A] flex items-start gap-3.5">
                <div className="w-8 h-8 bg-[#0E0E12] rounded-[2px] border border-[#23232A] flex items-center justify-center text-[#8E8B82] shrink-0">
                  <Megaphone size={16} />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider">{t('marketing_cookies_title')}</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0E0E12] text-[#8E8B82] border border-[#23232A] rounded-[2px] text-[9px] font-mono uppercase tracking-wider">
                      <X size={9} />
                      <span>{t('not_collected')}</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-[#8E8B82] font-sans">
                    {t('marketing_cookies_desc')}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#23232A]">
                <p className="text-[11px] text-[#8E8B82] font-mono text-center">
                  Zero telemetry & zero third-party commercial trackers guarantee.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 border-t border-[#23232A] bg-[#0E0E12] flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-4 py-1.5 bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] rounded-[2px] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
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
