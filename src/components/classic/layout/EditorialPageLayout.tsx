import React from 'react';
import { Link } from 'react-router-dom';
import { Language } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

export interface EditorialTabItem {
  id: string;
  label: string;
  to?: string;
  onClick?: () => void;
}

const LEGAL_TAB_LABELS: Record<Language, Record<string, string>> = {
  ko: {
    privacy: '개인정보처리방침',
    terms: '이용약관',
    license: '오픈소스 라이선스',
    'ai-policy': '인공지능 정책',
    'community-terms': '커뮤니티 이용 규약',
    cookies: '쿠키 정책',
  },
  en: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    license: 'Open Source License',
    'ai-policy': 'AI Policy',
    'community-terms': 'Community Guidelines',
    cookies: 'Cookie Policy',
  },
  ja: {
    privacy: 'プライバシーポリシー',
    terms: '利用規約',
    license: 'OSSライセンス',
    'ai-policy': 'AIポリシー',
    'community-terms': 'コミュニティ規約',
    cookies: 'Cookieポリシー',
  },
  id: {
    privacy: 'Kebijakan Privasi',
    terms: 'Ketentuan Layanan',
    license: 'Lisensi Open Source',
    'ai-policy': 'Kebijakan AI',
    'community-terms': 'Pedoman Komunitas',
    cookies: 'Kebijakan Cookie',
  },
};

export function getLegalNavTabs(language: Language): EditorialTabItem[] {
  const labels = LEGAL_TAB_LABELS[language] || LEGAL_TAB_LABELS.en;
  return [
    { id: 'privacy', label: labels.privacy, to: '/privacy' },
    { id: 'terms', label: labels.terms, to: '/terms' },
    { id: 'license', label: labels.license, to: '/license' },
    { id: 'ai-policy', label: labels['ai-policy'], to: '/ai-policy' },
    { id: 'community-terms', label: labels['community-terms'], to: '/community-terms' },
    { id: 'cookies', label: labels.cookies, to: '/cookies' },
  ];
}

export const LEGAL_NAV_TABS: EditorialTabItem[] = getLegalNavTabs('ko');

interface EditorialPageLayoutProps {
  category: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  tabs?: EditorialTabItem[];
  activeTabId?: string;
  headerActions?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function EditorialPageLayout({
  category,
  title,
  subtitle,
  tabs,
  activeTabId,
  headerActions,
  maxWidthClass = 'max-w-6xl',
  children,
}: EditorialPageLayoutProps) {
  const { pick } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-14rem)] bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] font-sans selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)]">
      <div className={`${maxWidthClass} mx-auto px-6 sm:px-10 lg:px-12 pt-14 sm:pt-16 pb-24 sm:pb-32`}>
        {/* Top Editorial Category Rule */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.16em] text-[var(--theme-ink-secondary)]">
            {category}
          </span>
        </div>

        {/* Sejong Editorial Document Title Header */}
        <div className="border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-border-hairline)] pt-9 pb-9 sm:pt-11 sm:pb-11 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[var(--theme-ink-strong)] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[18px] sm:text-[21px] text-[var(--theme-ink-secondary)] leading-[1.65] max-w-4xl">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex flex-wrap items-center gap-3 shrink-0 no-print">
              {headerActions}
            </div>
          )}
        </div>

        {/* Horizontal Rectangular Tab Strip (Sejong Navigation Strip) */}
        {tabs && tabs.length > 0 && (
          <nav
            className={`no-print grid ${
              tabs.length === 2
                ? 'grid-cols-2'
                : tabs.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : tabs.length === 4
                ? 'grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            } border-b border-[var(--theme-border-hairline)] divide-x divide-y sm:divide-y-0 divide-[var(--theme-border-hairline)]`}
            aria-label={pick({ ko: '문서 및 기능 탭', en: 'Document and feature tabs', ja: 'ドキュメント・機能タブ', id: 'Tab dokumen dan fitur' })}
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const className = `px-4 py-4 sm:py-5 text-center text-[17px] sm:text-[19px] font-bold tracking-tight transition-colors rounded-none cursor-pointer flex items-center justify-center whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`;

              if (tab.to) {
                return (
                  <Link key={tab.id} to={tab.to} className={className}>
                    {tab.label}
                  </Link>
                );
              }
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.onClick}
                  className={className}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}

        {/* Document / Page Body */}
        <div className="pt-12 sm:pt-16 space-y-14 sm:space-y-16 text-[19px] sm:text-[21px] leading-[1.85] text-[var(--theme-ink-body)]">
          {children}
        </div>
      </div>
    </div>
  );
}

export function EditorialSection({
  chapter,
  title,
  children,
}: {
  chapter?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 sm:space-y-6">
      {chapter && (
        <h2 className="text-[26px] sm:text-[30px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] pb-3.5 border-b border-[var(--theme-ink-strong)] leading-snug">
          {chapter}
        </h2>
      )}
      {title && (
        <h3 className="text-[21px] sm:text-[24px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.01em] pt-2 leading-snug">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function EditorialTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-ink-strong)] my-6">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-[17px] sm:text-[19px] font-bold tracking-tight border-r border-[var(--theme-border-hairline)]/25 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--theme-border-hairline)] bg-[var(--theme-canvas)]">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[var(--theme-stage)]/70 transition-colors">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-6 py-4 text-[17px] sm:text-[19px] leading-[1.7] border-r border-[var(--theme-border-hairline)] last:border-r-0 align-top ${
                    cIdx === 0 ? 'font-bold text-[var(--theme-ink-strong)] bg-[var(--theme-stage)]/50' : 'text-[var(--theme-ink-body)]'
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
