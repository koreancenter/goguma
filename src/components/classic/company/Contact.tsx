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
    <div className="min-h-screen bg-[#0B0C10] text-[#F0F3F6] pt-28 pb-24 font-sans selection:bg-[#2563EB]/30 selection:text-[#F0F3F6]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#64748B] hover:text-[#F0F3F6] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#38BDF8]" />
          <span>{t('back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-10"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#38BDF8]">DISPATCH CHANNEL</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F0F3F6] tracking-tight uppercase mt-0.5 mb-2">{t('contact_us')}</h1>
              <p className="text-[#94A3B8] font-sans text-xs sm:text-sm">{t('contact_subtitle')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-3.5 bg-[#0E1217] border border-white/[0.08] rounded-[2px]">
                <div className="w-9 h-9 bg-[#13181F] rounded-[2px] flex items-center justify-center text-[#38BDF8] border border-white/[0.08] shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('support_email')}</p>
                  <p className="font-mono text-xs text-[#F0F3F6] truncate font-medium">master@goguma.app</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-[#0E1217] border border-white/[0.08] rounded-[2px]">
                <div className="w-9 h-9 bg-[#13181F] rounded-[2px] flex items-center justify-center text-[#38BDF8] border border-white/[0.08] shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('consultation_hours')}</p>
                  <p className="text-xs text-[#F0F3F6] font-medium">{t('consultation_hours_desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-[#0E1217] border border-white/[0.08] rounded-[2px]">
                <div className="w-9 h-9 bg-[#13181F] rounded-[2px] flex items-center justify-center text-[#38BDF8] border border-white/[0.08] shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('global_hq')}</p>
                  <p className="text-xs text-[#F0F3F6] font-medium">
                    {region === 'korea' ? '대한민국' : 'Seoul / Global Edge'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-[#0E1217] rounded-[2px] p-6 sm:p-10 border border-white/[0.08] shadow-2xl"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('name')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#13181F] border border-white/[0.08] rounded-[2px] text-xs font-medium text-[#F0F3F6] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/40 transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#13181F] border border-white/[0.08] rounded-[2px] text-xs font-mono text-[#F0F3F6] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/40 transition-all outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#64748B]">{t('message')}</label>
                <textarea 
                  rows={5} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-[#13181F] border border-white/[0.08] rounded-[2px] text-xs text-[#F0F3F6] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/40 transition-all outline-none resize-none leading-relaxed" 
                  placeholder={t('tell_us_about')}
                />
              </div>

              {/* 개인정보 수집·이용 동의서 */}
              <div className="bg-[#13181F] border border-white/[0.08] rounded-[2px] p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#F0F3F6]">
                  <ShieldCheck size={16} className="text-[#38BDF8] shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wide">{t('privacy_agreement_title')}</span>
                </div>
                
                <ul className="space-y-1 text-[11px] text-[#64748B] font-sans list-disc list-inside">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>

                <div className="pt-2.5 border-t border-white/[0.08]">
                  <p className="text-[11px] font-medium text-[#94A3B8] mb-2">{t('privacy_agreement_question')}</p>
                  
                  <div className="flex flex-wrap items-center gap-5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="agree"
                        checked={agreement === 'agree'}
                        onChange={() => setAgreement('agree')}
                        className="w-3.5 h-3.5 accent-[#2563EB] cursor-pointer"
                      />
                      <span className="text-[#F0F3F6]">
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
                        className="w-3.5 h-3.5 accent-[#2563EB] cursor-pointer"
                      />
                      <span className="text-[#64748B]">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
