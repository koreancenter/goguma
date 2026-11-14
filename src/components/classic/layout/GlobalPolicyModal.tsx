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
            className="fixed inset-0 bg-[#111827]/35 backdrop-blur-xs z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] h-[580px] bg-[#FFFFFF] rounded-2xl shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] z-[9999] overflow-hidden flex flex-col border border-[#E5E7EB] text-[#111827] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F7F8FA] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#EFF6FF] border border-[#1E3A8A]/20 text-[#1E3A8A] rounded-lg flex items-center justify-center font-bold shrink-0">
                  <Globe size={16} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight">{t('global_policy')}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#E5E7EB]/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-4 bg-[#FFFFFF]">
              {language === 'ko' ? (
                <div className="space-y-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#111827] mt-8 mb-4 flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-[#1E3A8A] rounded-full" />
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-relaxed text-[#374151] mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-xs text-[#374151]">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 mb-6 text-xs text-[#374151]">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      table: ({ children }) => (
                        <div className="my-6 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#FFFFFF]">
                          <table className="w-full text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-[#F7F8FA] text-[#111827]">{children}</thead>,
                      th: ({ children }) => (
                        <th className="px-4 py-3 font-semibold text-[#111827] uppercase tracking-widest text-xs border-b border-[#E5E7EB]">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-xs text-[#374151] border-b border-[#E5E7EB] last:border-0 align-top">
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-[#111827]">{children}</strong>
                      ),
                    }}
                  >
                    {t('korean_privacy_policy_content')}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <Shield size={16} className="text-[#1E3A8A]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">1. Strategy & Identity</h3>
                    </div>
                    <div className="space-y-3 p-5 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB]">
                      <p className="text-[10px] font-mono text-[#6B7280] uppercase tracking-widest">Operator Information</p>
                      <p className="text-xs leading-relaxed text-[#111827] font-semibold">
                        {t('company_display_name')}
                      </p>
                      <p className="text-[10px] leading-relaxed text-[#6B7280] whitespace-pre-line pt-2 border-t border-[#E5E7EB] italic font-mono">
                        {t('company_footer_id')}
                      </p>
                      <p className="text-xs leading-relaxed text-[#374151] pt-2">
                        {t('policy_intro', { company: t('company_display_name') })}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <ShieldCheck size={16} className="text-[#1E3A8A]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">2. {t('payment_stripe_title')}</h3>
                    </div>
                    <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-3">
                      <p className="text-xs leading-relaxed text-[#374151]">
                        {t('payment_stripe_desc')}
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] rounded-lg border border-[#1E3A8A]/20 w-fit">
                        <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full animate-pulse" />
                        <span className="text-[9px] font-mono text-[#1E3A8A] uppercase tracking-widest">100% FREE & ZERO FINANCIAL DATA</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <Globe size={16} className="text-[#1E3A8A]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">3. International Compliance</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-3">
                        <h4 className="text-[10px] font-mono text-[#111827] uppercase tracking-widest">{t('europe_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-[#4B5563] font-sans">
                          We comply with the GDPR for our European users, ensuring transparency in automated processing and the "Right to be Forgotten".
                        </p>
                      </div>
                      <div className="p-5 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-3">
                        <h4 className="text-[10px] font-mono text-[#111827] uppercase tracking-widest">{t('california_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-[#4B5563] font-sans">
                          Pursuant to the CCPA, California residents have the right to request disclosure of personal information collected.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <div className="w-1.5 h-1.5 bg-[#1E3A8A] rounded-full" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">4. Data Governance</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-[#374151]">
                      GOGUMA utilizes a Zero-Trust architecture. All data transfers are encrypted via TLS 1.3, and access is strictly controlled through audited RBAC (Role-Based Access Control) protocols managed by <strong>PT. KOREAN CENTER INDONESIA</strong>.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-[#111827]">
                      <div className="w-8 h-8 bg-[#EFF6FF] border border-[#1E3A8A]/20 rounded-lg flex items-center justify-center text-[#1E3A8A] flex-shrink-0">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest">5. {t('policy_google_ai_title')}</h3>
                    </div>
                    <div className="p-6 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl text-[#374151] space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#1E3A8A] uppercase tracking-widest">{t('policy_google_ai_sharing_title')}</h4>
                        <p className="text-xs leading-relaxed text-[#374151]">
                          {t('policy_google_ai_sharing_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#1E3A8A] uppercase tracking-widest">{t('policy_ai_training_title')}</h4>
                        <p className="text-xs leading-relaxed text-[#374151]">
                          {t('policy_ai_training_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#1E3A8A] uppercase tracking-widest">{t('policy_transfer_title')}</h4>
                        <p className="text-xs leading-relaxed text-[#374151]">
                          {t('policy_transfer_desc')}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-[#FFFFFF] rounded text-[8px] font-mono uppercase tracking-widest border border-[#E5E7EB] text-[#4B5563]">Google Cloud Partner</div>
                        <div className="px-2 py-0.5 bg-[#FFFFFF] rounded text-[8px] font-mono uppercase tracking-widest border border-[#E5E7EB] text-[#4B5563]">AI Safety Verified</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E5E7EB] bg-[#F7F8FA] flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#1E3A8A] hover:bg-[#172554] text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
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
