import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Shield, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useLanguage } from '../../../contexts/LanguageContext';

interface GlobalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalPolicyModal({ isOpen, onClose }: GlobalPolicyModalProps) {
  const { t, language } = useLanguage();

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-[580px] bg-white rounded-[2px] shadow-2xl z-[9999] overflow-hidden flex flex-col border border-stone-200/90 text-stone-900 font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-50 border border-amber-200 text-[#D97706] rounded-[2px] flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Globe size={16} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">{t('global_policy')}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-[2px] text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-4 bg-white">
              {language === 'ko' ? (
                <div className="space-y-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-stone-900 mt-8 mb-4 flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-[#D97706] rounded-[1px]" />
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-relaxed text-stone-600 mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-xs text-stone-600">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 mb-6 text-xs text-stone-600">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      table: ({ children }) => (
                        <div className="my-6 overflow-hidden rounded-[2px] border border-stone-200 bg-stone-50">
                          <table className="w-full text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-stone-100/80">{children}</thead>,
                      th: ({ children }) => (
                        <th className="px-4 py-3 font-semibold text-stone-900 uppercase tracking-widest text-xs border-b border-stone-200">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-xs text-stone-600 border-b border-stone-200 last:border-0 align-top">
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-stone-900">{children}</strong>
                      ),
                    }}
                  >
                    {t('korean_privacy_policy_content')}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-900">
                      <Shield size={16} className="text-[#D97706]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">1. Strategy & Identity</h3>
                    </div>
                    <div className="space-y-3 p-5 bg-stone-50/70 rounded-[2px] border border-stone-200">
                      <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Operator Information</p>
                      <p className="text-xs leading-relaxed text-stone-900 font-semibold">
                        {t('company_display_name')}
                      </p>
                      <p className="text-[10px] leading-relaxed text-stone-500 whitespace-pre-line pt-2 border-t border-stone-200 italic font-mono">
                        {t('company_footer_id')}
                      </p>
                      <p className="text-xs leading-relaxed text-stone-600 pt-2">
                        {t('policy_intro', { company: t('company_display_name') })}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-900">
                      <ShieldCheck size={16} className="text-[#D97706]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">2. {t('payment_stripe_title')}</h3>
                    </div>
                    <div className="p-5 bg-stone-50/70 rounded-[2px] border border-stone-200 space-y-3">
                      <p className="text-xs leading-relaxed text-stone-600">
                        {t('payment_stripe_desc')}
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-[2px] border border-stone-200 w-fit">
                        <div className="w-1.5 h-1.5 bg-[#D97706] rounded-full animate-pulse" />
                        <span className="text-[9px] font-mono text-[#D97706] uppercase tracking-widest">100% FREE & ZERO FINANCIAL DATA</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-900">
                      <Globe size={16} className="text-[#D97706]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">3. International Compliance</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-stone-50/70 rounded-[2px] border border-stone-200 space-y-3">
                        <h4 className="text-[10px] font-mono text-stone-900 uppercase tracking-widest">{t('europe_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-stone-500 font-sans">
                          We comply with the GDPR for our European users, ensuring transparency in automated processing and the "Right to be Forgotten".
                        </p>
                      </div>
                      <div className="p-5 bg-stone-50/70 rounded-[2px] border border-stone-200 space-y-3">
                        <h4 className="text-[10px] font-mono text-stone-900 uppercase tracking-widest">{t('california_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-stone-500 font-sans">
                          Pursuant to the CCPA, California residents have the right to request disclosure of personal information collected.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-900">
                      <div className="w-1.5 h-1.5 bg-[#D97706] rounded-[1px]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">4. Data Governance</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-stone-600">
                      GOGUMA utilizes a Zero-Trust architecture. All data transfers are encrypted via TLS 1.3, and access is strictly controlled through audited RBAC (Role-Based Access Control) protocols managed by <strong>PT. KOREAN CENTER INDONESIA</strong>.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-900">
                      <div className="w-8 h-8 bg-amber-50 border border-amber-200 rounded-[2px] flex items-center justify-center text-[#D97706] flex-shrink-0">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest">5. {t('policy_google_ai_title')}</h3>
                    </div>
                    <div className="p-6 bg-stone-50/70 border border-stone-200 rounded-[2px] text-stone-900 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#D97706] uppercase tracking-widest">{t('policy_google_ai_sharing_title')}</h4>
                        <p className="text-xs leading-relaxed text-stone-600">
                          {t('policy_google_ai_sharing_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest">{t('policy_ai_training_title')}</h4>
                        <p className="text-xs leading-relaxed text-stone-600">
                          {t('policy_ai_training_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#D97706] uppercase tracking-widest">{t('policy_transfer_title')}</h4>
                        <p className="text-xs leading-relaxed text-stone-600">
                          {t('policy_transfer_desc')}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-white rounded-[2px] text-[8px] font-mono uppercase tracking-widest border border-stone-200 text-stone-600">Google Cloud Partner</div>
                        <div className="px-2 py-0.5 bg-white rounded-[2px] text-[8px] font-mono uppercase tracking-widest border border-stone-200 text-stone-600">AI Safety Verified</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200/80 bg-stone-50/70 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
              >
                {t('close')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
