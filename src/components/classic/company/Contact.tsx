import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { collection, addDoc, serverTimestamp, db, handleFirestoreError, OperationType } from '../../../lib/localDb';
import { toast } from 'react-toastify';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function Contact() {
  const { t, region } = useLanguage();
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: EditorialTabItem[] = [
    { id: 'contact', label: '문의 및 피드백', to: '/contact' },
    { id: 'support', label: '도움말 및 가이드', to: '/support' },
    { id: 'about', label: 'GOGUMA 소개', to: '/about' },
    { id: 'community', label: '오픈 아키텍처', to: '/community' },
  ];

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
        updatedAt: serverTimestamp(),
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
    <EditorialPageLayout
      category="DISPATCH CHANNEL · CONTACT"
      title={t('contact_us')}
      subtitle={t('contact_subtitle')}
      tabs={tabs}
      activeTabId="contact"
    >
      <EditorialSection chapter="제1장 연락처 및 문의 접수">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-2">
          {/* Left Contact Metadata */}
          <div className="lg:col-span-5 divide-y divide-[#E4E2DC] border-t border-b border-[#000000] h-fit">
            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[#52524E]">
                {t('support_email')}
              </div>
              <div className="text-[20px] font-extrabold text-[#000000]">
                master@goguma.app
              </div>
            </div>

            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[#52524E]">
                {t('consultation_hours')}
              </div>
              <div className="text-[19px] font-semibold text-[#111111]">
                {t('consultation_hours_desc')}
              </div>
            </div>

            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[#52524E]">
                {t('global_hq')}
              </div>
              <div className="text-[19px] font-semibold text-[#111111]">
                {region === 'korea' ? '대한민국 경기도 부천시' : 'Seoul / Global Edge'}
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#000000] rounded-none p-7 sm:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[#000000]">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[18px] text-[#000000] placeholder-[#8C8B85] outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[#000000]">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[18px] text-[#000000] placeholder-[#8C8B85] outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[#000000]">
                  {t('message')}
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-[18px] text-[#000000] placeholder-[#8C8B85] outline-none resize-none leading-[1.7] transition-colors"
                  placeholder={t('tell_us_about')}
                />
              </div>

              {/* 개인정보 수집·이용 동의서 */}
              <div className="bg-[#F6F5F1] border-l-4 border-l-[#000000] border border-[#E4E2DC] rounded-none p-6 space-y-4">
                <div className="text-[18px] font-extrabold text-[#000000]">
                  {t('privacy_agreement_title')}
                </div>

                <ul className="space-y-1.5 text-[17px] text-[#3F3F3C] list-disc list-inside leading-[1.7]">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>

                <div className="pt-4 border-t border-[#E4E2DC] space-y-3">
                  <p className="text-[17px] font-bold text-[#111111]">
                    {t('privacy_agreement_question')}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 text-[18px]">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy_agreement"
                        value="agree"
                        checked={agreement === 'agree'}
                        onChange={() => setAgreement('agree')}
                        className="w-4 h-4 accent-[#000000] cursor-pointer"
                      />
                      <span className="font-semibold text-[#000000]">
                        {t('privacy_agreement_agree')}
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy_agreement"
                        value="disagree"
                        checked={agreement === 'disagree'}
                        onChange={() => setAgreement('disagree')}
                        className="w-4 h-4 accent-[#000000] cursor-pointer"
                      />
                      <span className="text-[#52524E]">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-4 px-6 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-[18px] font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Send size={17} />
                <span>{t('send_message')}</span>
              </button>
            </form>
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
