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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-2xl h-[80vh] bg-white rounded-3xl shadow-2xl z-[9999] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-goguma/10 rounded-xl flex items-center justify-center text-goguma">
                  <Globe size={20} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('global_policy')}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {language === 'ko' ? '개정일자: 2026.09.20 (금융·결제정보 제로화 반영)' : 'Updated: 2026.09.20 (Zero Financial Data)'}
                  </p>
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
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              {language === 'ko' ? (
                <div className="space-y-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h3: ({ children }) => (
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mt-8 mb-4 flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-goguma rounded-full" />
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-xs leading-relaxed text-slate-600 mb-4">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 space-y-2 mb-6 text-xs text-slate-600">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 space-y-2 mb-6 text-xs text-slate-600">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed">{children}</li>
                      ),
                      table: ({ children }) => (
                        <div className="my-6 overflow-hidden rounded-xl border border-slate-100 bg-white">
                          <table className="w-full text-left border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-slate-50">{children}</thead>,
                      th: ({ children }) => (
                        <th className="px-4 py-3 font-black text-slate-900 uppercase tracking-widest text-xs border-b border-slate-100">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-3 text-xs text-slate-600 border-b border-slate-50 last:border-0 align-top">
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-black text-slate-900">{children}</strong>
                      ),
                    }}
                  >
                    {t('korean_privacy_policy_content')}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Shield size={16} className="text-goguma" />
                      <h3 className="text-xs font-black uppercase tracking-widest">1. Strategy & Identity</h3>
                    </div>
                    <div className="space-y-3 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Information</p>
                      <p className="text-xs leading-relaxed text-slate-900 font-bold">
                        {t('company_display_name')}
                      </p>
                      <p className="text-[10px] leading-relaxed text-slate-500 whitespace-pre-line pt-2 border-t border-slate-100 italic">
                        {t('company_footer_id')}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-600 pt-2">
                        {t('policy_intro', { company: t('company_display_name') })}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest">2. {t('payment_stripe_title')}</h3>
                    </div>
                    <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 space-y-3">
                      <p className="text-xs leading-relaxed text-slate-700 font-medium">
                        {t('payment_stripe_desc')}
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-emerald-100 w-fit">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">100% FREE & ZERO FINANCIAL DATA</span>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Globe size={16} className="text-blue-500" />
                      <h3 className="text-xs font-black uppercase tracking-widest">3. International Compliance</h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('europe_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-slate-500">
                          We comply with the GDPR for our European users, ensuring transparency in automated processing and the "Right to be Forgotten".
                        </p>
                      </div>
                      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{t('california_residents')}</h4>
                        <p className="text-[10px] leading-relaxed text-slate-500">
                          Pursuant to the CCPA, California residents have the right to request disclosure of personal information collected.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <div className="w-1.5 h-1.5 bg-goguma rounded-full" />
                      <h3 className="text-xs font-black uppercase tracking-widest">4. Data Governance</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">
                      GOGUMA utilizes a Zero-Trust architecture. All data transfers are encrypted via TLS 1.3, and access is strictly controlled through audited RBAC (Role-Based Access Control) protocols managed by <strong>PT. KOREAN CENTER INDONESIA</strong>.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Shield size={16} />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest">5. {t('policy_google_ai_title')}</h3>
                    </div>
                    <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('policy_google_ai_sharing_title')}</h4>
                        <p className="text-xs leading-relaxed text-blue-50">
                          {t('policy_google_ai_sharing_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('policy_ai_training_title')}</h4>
                        <p className="text-xs leading-relaxed text-emerald-50">
                          {t('policy_ai_training_desc')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest">{t('policy_transfer_title')}</h4>
                        <p className="text-xs leading-relaxed text-amber-50">
                          {t('policy_transfer_desc')}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black uppercase tracking-widest border border-white/20">Google Cloud Partner</div>
                        <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-black uppercase tracking-widest border border-white/20">AI Safety Verified</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-goguma transition-colors shadow-lg shadow-slate-900/10"
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
