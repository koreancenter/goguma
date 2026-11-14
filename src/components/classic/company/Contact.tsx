import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Clock, MapPin, Send, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, db, handleFirestoreError, OperationType } from '../../../lib/localDb';
import { toast } from 'react-toastify';

export default function Contact() {
  const { t, region } = useLanguage();
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(region === 'korea' ? '모든 항목을 입력해주세요.' : 'Please fill in all fields.');
      return;
    }
    if (agreement !== 'agree') {
      toast.error(region === 'korea' ? '개인정보 수집 및 이용에 동의해야 합니다.' : 'You must agree to the privacy policy.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'inquiries'), {
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const mailtoUrl = `mailto:master@goguma.app?subject=${encodeURIComponent(`[Feedback] ${name.trim()}`)}&body=${encodeURIComponent(`From: ${name.trim()} (${email.trim()})\n\nMessage:\n${message.trim()}`)}`;
      window.location.href = mailtoUrl;

      toast.success(region === 'korea' ? '문의 내용이 준비되었습니다. 이메일 클라이언트가 열립니다.' : 'Feedback recorded. Opening your email client.');
      setName('');
      setEmail('');
      setMessage('');
      setAgreement(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'inquiries', false);
      toast.error(region === 'korea' ? '제출에 실패했습니다. 다시 시도해 주세요.' : 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] pt-28 pb-24 font-sans selection:bg-[#1E3A8A]/15 selection:text-[#111827]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#1E3A8A]" />
          <span>{t('back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-10"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#1E3A8A] font-semibold">DISPATCH CHANNEL</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#111827] tracking-tight uppercase mt-0.5 mb-2">{t('contact_us')}</h1>
              <p className="text-[#4B5563] font-sans text-xs sm:text-sm">{t('contact_subtitle')}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xs">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-[#1E3A8A] border border-[#1E3A8A]/15 shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('support_email')}</p>
                  <p className="font-mono text-xs text-[#111827] truncate font-medium">master@goguma.app</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xs">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-[#1E3A8A] border border-[#1E3A8A]/15 shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('consultation_hours')}</p>
                  <p className="text-xs text-[#111827] font-medium">{t('consultation_hours_desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-xs">
                <div className="w-9 h-9 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-[#1E3A8A] border border-[#1E3A8A]/15 shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('global_hq')}</p>
                  <p className="text-xs text-[#111827] font-medium">
                    {region === 'korea' ? '대한민국' : 'Seoul / Global Edge'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-[#FFFFFF] rounded-2xl p-6 sm:p-10 border border-[#E5E7EB] shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)]"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('name')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] focus:bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-xs font-medium text-[#111827] placeholder-[#9CA3AF] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#F7F8FA] focus:bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-xs font-mono text-[#111827] placeholder-[#9CA3AF] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">{t('message')}</label>
                <textarea 
                  rows={5} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-[#F7F8FA] focus:bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg text-xs text-[#111827] placeholder-[#9CA3AF] focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10 transition-all outline-none resize-none leading-relaxed" 
                  placeholder={t('tell_us_about')}
                />
              </div>

              {/* 개인정보 수집·이용 동의서 */}
              <div className="bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#111827]">
                  <ShieldCheck size={16} className="text-[#1E3A8A] shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wide">{t('privacy_agreement_title')}</span>
                </div>
                
                <ul className="space-y-1 text-[11px] text-[#4B5563] font-sans list-disc list-inside">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>

                <div className="pt-2.5 border-t border-[#E5E7EB]">
                  <p className="text-[11px] font-medium text-[#374151] mb-2">{t('privacy_agreement_question')}</p>
                  
                  <div className="flex flex-wrap items-center gap-5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="agree"
                        checked={agreement === 'agree'}
                        onChange={() => setAgreement('agree')}
                        className="w-3.5 h-3.5 accent-[#1E3A8A] cursor-pointer"
                      />
                      <span className="text-[#111827]">
                        {t('privacy_agreement_agree')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="disagree"
                        checked={agreement === 'disagree'}
                        onChange={() => setAgreement('disagree')}
                        className="w-3.5 h-3.5 accent-[#1E3A8A] cursor-pointer"
                      />
                      <span className="text-[#6B7280]">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Send size={14} />
                <span>{t('send_message')}</span>
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
