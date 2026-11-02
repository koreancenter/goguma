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
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F3ED] pt-28 pb-24 font-sans selection:bg-[#2A241D] selection:text-[#F5F3ED]">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#8E8B82] hover:text-[#F5F3ED] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} className="text-[#C5A880]" />
          <span>{t('back')}</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-10"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A880]">DISPATCH CHANNEL</span>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F3ED] tracking-tight uppercase mt-0.5 mb-2">{t('contact_us')}</h1>
              <p className="text-[#B8B5AC] font-sans text-xs sm:text-sm">{t('contact_subtitle')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-3.5 bg-[#111116] border border-[#23232A] rounded-[2px]">
                <div className="w-9 h-9 bg-[#141418] rounded-[2px] flex items-center justify-center text-[#C5A880] border border-[#23232A] shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('support_email')}</p>
                  <p className="font-mono text-xs text-[#F5F3ED] truncate font-medium">master@goguma.app</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-[#111116] border border-[#23232A] rounded-[2px]">
                <div className="w-9 h-9 bg-[#141418] rounded-[2px] flex items-center justify-center text-[#C5A880] border border-[#23232A] shrink-0">
                  <Clock size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('consultation_hours')}</p>
                  <p className="text-xs text-[#F5F3ED] font-medium">{t('consultation_hours_desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3.5 bg-[#111116] border border-[#23232A] rounded-[2px]">
                <div className="w-9 h-9 bg-[#141418] rounded-[2px] flex items-center justify-center text-[#C5A880] border border-[#23232A] shrink-0">
                  <MapPin size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('global_hq')}</p>
                  <p className="text-xs text-[#F5F3ED] font-medium">
                    {region === 'korea' ? '대한민국' : 'Seoul / Global Edge'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-[#111116] rounded-[2px] p-6 sm:p-10 border border-[#23232A] shadow-2xl"
          >
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('name')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs font-medium text-[#F5F3ED] focus:border-[#C5A880] transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:border-[#C5A880] transition-all outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-[#8E8B82]">{t('message')}</label>
                <textarea 
                  rows={5} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-3.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs text-[#F5F3ED] focus:border-[#C5A880] transition-all outline-none resize-none leading-relaxed" 
                  placeholder={t('tell_us_about')}
                />
              </div>

              {/* 개인정보 수집·이용 동의서 */}
              <div className="bg-[#141418] border border-[#23232A] rounded-[2px] p-4 space-y-3">
                <div className="flex items-center gap-2 text-[#F5F3ED]">
                  <ShieldCheck size={16} className="text-[#C5A880] shrink-0" />
                  <span className="font-semibold text-xs uppercase tracking-wide">{t('privacy_agreement_title')}</span>
                </div>
                
                <ul className="space-y-1 text-[11px] text-[#8E8B82] font-sans list-disc list-inside">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>

                <div className="pt-2.5 border-t border-[#23232A]">
                  <p className="text-[11px] font-medium text-[#B8B5AC] mb-2">{t('privacy_agreement_question')}</p>
                  
                  <div className="flex flex-wrap items-center gap-5 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="agree"
                        checked={agreement === 'agree'}
                        onChange={() => setAgreement('agree')}
                        className="w-3.5 h-3.5 accent-[#C5A880] cursor-pointer"
                      />
                      <span className="text-[#F5F3ED]">
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
                        className="w-3.5 h-3.5 accent-[#C5A880] cursor-pointer"
                      />
                      <span className="text-[#8E8B82]">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-3 bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] rounded-[2px] text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
