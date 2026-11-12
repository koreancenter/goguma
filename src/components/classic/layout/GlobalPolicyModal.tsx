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
            className="fixed inset-0 m-auto w-full max-w-2xl h-[580px] bg-[#0E1217] rounded-[4px] shadow-2xl z-[9999] overflow-hidden flex flex-col border border-white/[0.08] text-[#F0F3F6] font-sans"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#13181F] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-950/60 border border-blue-800/60 text-[#38BDF8] rounded-[2px] flex items-center justify-center font-bold shadow-xs shrink-0">
                  <Globe size={16} />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">{t('global_policy')}</h2>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-[2px] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-4 bg-[#0E1217]">
              {language === 'ko' ? (
                <div className="space-y-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-white mt-8 mb-4 flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-[#2563EB] rounded-[1px]" />
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-relaxed text-zinc-300 mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-xs text-zinc-300">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 mb-6 text-xs text-zinc-300">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      table: ({ children }) => (
                        <div className="my-6 overflow-hidden rounded-[2px] border border-white/[0.08] bg-[#13181F]">
                          <table className="w-full text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-[#18202A] text-white">{children}</thead>,
                      th: ({ children }) => (
                        <th className="px-4 py-3 font-semibold text-white uppercase tracking-widest text-xs border-b border-white/[0.08]">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-xs text-zinc-300 border-b border-white/[0.08] last:border-0 align-top">
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-white">{children}</strong>
                      ),
                    }}
                  >
                    {t('korean_privacy_policy_content')}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <Shield size={16} className="text-[#38BDF8]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">1. Strategy & Identity</h3>
                    </div>
                    <div className="space-y-3 p-5 bg-[#13181F] rounded-[4px] border border-white/[0.08]">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Operator Information</p>
                      <p className="text-xs leading-relaxed text-white font-semibold">
                        {t('company_display_name')}
                      </p>
                      <p className="text-[10px] leading-relaxed text-zinc-400 whitespace-pre-line pt-2 border-t border-white/[0.08] italic font-mono">
                        {t('company_footer_id')}
                      </p>
                      <p className="text-xs leading-relaxed text-zinc-300 pt-2">
                        {t('policy_intro', { company: t('company_display_name') })}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldCheck size={16} className="text-[#38BDF8]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">2. {t('payment_stripe_title')}</h3>
                    </div>
                    <div className="p-5 bg-[#13181F] rounded-[4px] border border-white/[0.08] space-y-3">
                      <p className="text-xs leading-relaxed text-zinc-300">
                        {t('payment_stripe_desc')}
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0E1217] rounded-[2px] border border-white/[0.08] w-fit">
                        <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-full animate-pulse" />
                        <span className="text-[9px] font-mono text-[#38BDF8] uppercase tracking-widest">100% FREE & ZERO FINANCIAL DATA</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <Globe size={16} className="text-[#38BDF8]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">3. International Compliance</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-[#13181F] rounded-[4px] border border-white/[0.08] space-y-3">
                        <h4 className="text-[10px] font-mono text-white uppercase tracking-widest">{t('europe_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-zinc-400 font-sans">
                          We comply with the GDPR for our European users, ensuring transparency in automated processing and the "Right to be Forgotten".
                        </p>
                      </div>
                      <div className="p-5 bg-[#13181F] rounded-[4px] border border-white/[0.08] space-y-3">
                        <h4 className="text-[10px] font-mono text-white uppercase tracking-widest">{t('california_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-zinc-400 font-sans">
                          Pursuant to the CCPA, California residents have the right to request disclosure of personal information collected.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-1.5 h-1.5 bg-[#38BDF8] rounded-[1px]" />
                      <h3 className="text-xs font-semibold uppercase tracking-widest">4. Data Governance</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">
                      GOGUMA utilizes a Zero-Trust architecture. All data transfers are encrypted via TLS 1.3, and access is strictly controlled through audited RBAC (Role-Based Access Control) protocols managed by <strong>PT. KOREAN CENTER INDONESIA</strong>.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-white">
                      <div className="w-8 h-8 bg-blue-950/60 border border-blue-800/60 rounded-[2px] flex items-center justify-center text-[#38BDF8] flex-shrink-0">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest">5. {t('policy_google_ai_title')}</h3>
                    </div>
                    <div className="p-6 bg-[#13181F] border border-white/[0.08] rounded-[4px] text-zinc-200 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-widest">{t('policy_google_ai_sharing_title')}</h4>
                        <p className="text-xs leading-relaxed text-zinc-300">
                          {t('policy_google_ai_sharing_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-sky-400 uppercase tracking-widest">{t('policy_ai_training_title')}</h4>
                        <p className="text-xs leading-relaxed text-zinc-300">
                          {t('policy_ai_training_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-widest">{t('policy_transfer_title')}</h4>
                        <p className="text-xs leading-relaxed text-zinc-300">
                          {t('policy_transfer_desc')}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-[#0E1217] rounded-[2px] text-[8px] font-mono uppercase tracking-widest border border-white/[0.08] text-zinc-400">Google Cloud Partner</div>
                        <div className="px-2 py-0.5 bg-[#0E1217] rounded-[2px] text-[8px] font-mono uppercase tracking-widest border border-white/[0.08] text-zinc-400">AI Safety Verified</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.08] bg-[#13181F] flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
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
