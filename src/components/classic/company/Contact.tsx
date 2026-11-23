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
  const { t, region, pick } = useLanguage();
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabs: EditorialTabItem[] = [
    { id: 'contact', label: pick({ ko: '문의 및 피드백', en: 'Contact & Feedback', ja: 'お問い合わせ', id: 'Kontak & Masukan' }), to: '/contact' },
    { id: 'support', label: pick({ ko: '도움말 및 가이드', en: 'Help & Guide', ja: 'ヘルプ・ガイド', id: 'Bantuan & Panduan' }), to: '/support' },
    { id: 'about', label: pick({ ko: 'GOGUMA 소개', en: 'About GOGUMA', ja: 'GOGUMA 紹介', id: 'Tentang GOGUMA' }), to: '/about' },
    { id: 'community', label: pick({ ko: '오픈 아키텍처', en: 'Open Architecture', ja: 'オープン設計', id: 'Arsitektur Terbuka' }), to: '/community' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error(pick({ ko: '모든 항목을 입력해주세요.', en: 'Please fill in all fields.', ja: 'すべての項目を入力してください。', id: 'Harap isi semua kolom.' }));
      return;
    }
    if (agreement !== 'agree') {
      toast.error(pick({ ko: '개인정보 수집 및 이용에 동의해야 합니다.', en: 'You must agree to the privacy policy.', ja: 'プライバシーポリシーに同意する必要があります。', id: 'Anda harus menyetujui kebijakan privasi.' }));
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

      toast.success(pick({
        ko: '문의 내용이 준비되었습니다. 이메일 클라이언트가 열립니다.',
        en: 'Feedback recorded. Opening your email client.',
        ja: 'お問い合わせ内容が準備できました。メールクライアントを開きます。',
        id: 'Masukan dicatat. Membuka klien email Anda.',
      }));
      setName('');
      setEmail('');
      setMessage('');
      setAgreement(null);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'inquiries', false);
      toast.error(pick({
        ko: '제출에 실패했습니다. 다시 시도해 주세요.',
        en: 'Failed to submit inquiry. Please try again.',
        ja: '送信に失敗しました。もう一度お試しください。',
        id: 'Gagal mengirim pertanyaan. Silakan coba lagi.',
      }));
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
      <EditorialSection chapter={pick({ ko: '제1장 연락처 및 문의 접수', en: '01 · Direct Contact & Inquiry', ja: '第1章 連絡先＆お問い合わせ', id: '01 · Kontak Langsung & Pertanyaan' })}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-2">
          {/* Left Contact Metadata */}
          <div className="lg:col-span-5 divide-y divide-[var(--theme-border-hairline)] border-t border-b border-[var(--theme-ink-strong)] h-fit">
            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                {t('support_email')}
              </div>
              <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">
                master@goguma.app
              </div>
            </div>

            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                {t('consultation_hours')}
              </div>
              <div className="text-[19px] font-semibold text-[var(--theme-ink-primary)]">
                {t('consultation_hours_desc')}
              </div>
            </div>

            <div className="py-6 space-y-1.5">
              <div className="text-[15px] font-bold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                {t('global_hq')}
              </div>
              <div className="text-[19px] font-semibold text-[var(--theme-ink-primary)]">
                {region === 'korea'
                  ? pick({ ko: '대한민국 경기도 부천시', en: 'Bucheon, Gyeonggi-do, South Korea', ja: '大韓民国 京畿道 富川市', id: 'Bucheon, Gyeonggi-do, Korea Selatan' })
                  : 'Seoul / Global Edge'}
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-[var(--theme-canvas)] border border-[var(--theme-ink-strong)] rounded-none p-7 sm:p-10">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                    {t('name')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)]">
                  {t('message')}
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none resize-none leading-[1.7] transition-colors"
                  placeholder={t('tell_us_about')}
                />
              </div>

              {/* 개인정보 수집·이용 동의서 */}
              <div className="bg-[var(--theme-stage)] border-l-4 border-l-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] rounded-none p-6 space-y-4">
                <div className="text-[18px] font-extrabold text-[var(--theme-ink-strong)]">
                  {t('privacy_agreement_title')}
                </div>

                <ul className="space-y-1.5 text-[17px] text-[var(--theme-ink-body)] list-disc list-inside leading-[1.7]">
                  <li>{t('privacy_agreement_purpose')}</li>
                  <li>{t('privacy_agreement_items')}</li>
                  <li>{t('privacy_agreement_period')}</li>
                  <li>{t('privacy_agreement_rejection')}</li>
                </ul>

                <div className="pt-4 border-t border-[var(--theme-border-hairline)] space-y-3">
                  <p className="text-[17px] font-bold text-[var(--theme-ink-primary)]">
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
                        className="w-4 h-4 accent-[var(--theme-ink-strong)] cursor-pointer"
                      />
                      <span className="font-semibold text-[var(--theme-ink-strong)]">
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
                        className="w-4 h-4 accent-[var(--theme-ink-strong)] cursor-pointer"
                      />
                      <span className="text-[var(--theme-ink-secondary)]">
                        {t('privacy_agreement_disagree')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={agreement !== 'agree'}
                className="w-full py-4 px-6 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[18px] font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
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
