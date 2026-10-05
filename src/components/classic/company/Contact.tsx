import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Clock, MapPin, Send, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
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

      const mailtoUrl = `mailto:master@goguma.app?subject=${encodeURIComponent(`[GOGUMA Feedback] ${name.trim()}`)}&body=${encodeURIComponent(`From: ${name.trim()} (${email.trim()})\n\nMessage:\n${message.trim()}`)}`;
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
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-12"
        >
          <ArrowLeft size={14} />
          {t('back')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-12"
          >
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-4">{t('contact_us')}</h1>
              <p className="text-slate-500 font-medium tracking-tight">{t('contact_subtitle')}</p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('support_email')}</p>
                  <p className="font-bold text-slate-900">master@goguma.app</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-slate-100">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('consultation_hours')}</p>
                  <p className="font-bold text-slate-900">{t('consultation_hours_desc')}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('global_hq')}</p>
                  <p className="font-bold text-slate-900">
                    {region === 'korea' ? '대한민국' : 'Bali, Indonesia'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 bg-white rounded-[3rem] p-12 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('name')}</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('message')}</label>
                <textarea 
                  rows={6} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none" 
                  placeholder={t('tell_us_about')}
                ></textarea>
              </div>

              {/* 개인정보 수집·이용 동의서 (Privacy Policy Consent) */}
              <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-slate-950">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0" />
                  <span className="font-extrabold text-xs uppercase tracking-wide">{t('privacy_agreement_title')}</span>
                </div>
                
                <ul className="space-y-1 text-xs text-slate-500 font-medium list-disc list-inside">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>



                <div className="pt-3 border-t border-slate-200">
                  <p className="text-xs font-bold text-slate-800 mb-3">{t('privacy_agreement_question')}</p>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="agree"
                        checked={agreement === 'agree'}
                        onChange={() => setAgreement('agree')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {t('privacy_agreement_agree')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="privacy_agreement" 
                        value="disagree"
                        checked={agreement === 'disagree'}
                        onChange={() => setAgreement('disagree')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                {t('send_message')}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
