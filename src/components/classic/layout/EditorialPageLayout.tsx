import React from 'react';
import { Link } from 'react-router-dom';

export interface EditorialTabItem {
  id: string;
  label: string;
  to?: string;
  onClick?: () => void;
}

export const LEGAL_NAV_TABS: EditorialTabItem[] = [
  { id: 'privacy', label: '개인정보처리방침', to: '/privacy' },
  { id: 'terms', label: '이용약관', to: '/terms' },
  { id: 'license', label: '오픈소스 라이선스', to: '/license' },
  { id: 'ai-policy', label: '인공지능 정책', to: '/ai-policy' },
  { id: 'community-terms', label: '커뮤니티 이용 규약', to: '/community-terms' },
  { id: 'cookies', label: '쿠키 정책', to: '/cookies' },
];

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
  return (
    <div className="min-h-[calc(100vh-14rem)] bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#000000] selection:text-[#FFFFFF]">
      <div className={`${maxWidthClass} mx-auto px-6 sm:px-10 lg:px-12 pt-14 sm:pt-16 pb-24 sm:pb-32`}>
        {/* Top Editorial Category Rule */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <span className="text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.16em] text-[#52524E]">
            {category}
          </span>
        </div>

        {/* Sejong Editorial Document Title Header */}
        <div className="border-t-2 border-t-[#000000] border-b border-b-[#E4E2DC] pt-9 pb-9 sm:pt-11 sm:pb-11 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#000000] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[18px] sm:text-[21px] text-[#52524E] leading-[1.65] max-w-4xl">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {headerActions}
            </div>
          )}
        </div>

        {/* Horizontal Rectangular Tab Strip (Sejong Navigation Strip) */}
        {tabs && tabs.length > 0 && (
          <nav
            className={`grid ${
              tabs.length === 2
                ? 'grid-cols-2'
                : tabs.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : tabs.length === 4
                ? 'grid-cols-2 lg:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
            } border-b border-[#E4E2DC] divide-x divide-y sm:divide-y-0 divide-[#E4E2DC]`}
            aria-label="문서 및 기능 탭"
          >
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              const className = `px-4 py-4 sm:py-5 text-center text-[17px] sm:text-[19px] font-bold tracking-tight transition-colors rounded-none cursor-pointer flex items-center justify-center whitespace-nowrap ${
                isActive
                  ? 'bg-[#000000] text-[#FFE600]'
                  : 'bg-[#F6F5F1] text-[#111111] hover:bg-[#DC2626] hover:text-[#FFE600]'
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
        <div className="pt-12 sm:pt-16 space-y-14 sm:space-y-16 text-[19px] sm:text-[21px] leading-[1.85] text-[#2B2B29]">
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
        <h2 className="text-[26px] sm:text-[30px] font-extrabold text-[#000000] tracking-[-0.02em] pb-3.5 border-b border-[#000000] leading-snug">
          {chapter}
        </h2>
      )}
      {title && (
        <h3 className="text-[21px] sm:text-[24px] font-extrabold text-[#000000] tracking-[-0.01em] pt-2 leading-snug">
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
    <div className="overflow-x-auto border-t-2 border-t-[#000000] border-b border-b-[#000000] my-6">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-[#000000] text-[#FFFFFF]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-[17px] sm:text-[19px] font-bold tracking-tight border-r border-white/15 last:border-r-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E4E2DC] bg-[#FFFFFF]">
          {rows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-[#F6F5F1]/70 transition-colors">
              {row.map((cell, cIdx) => (
                <td
                  key={cIdx}
                  className={`px-6 py-4 text-[17px] sm:text-[19px] leading-[1.7] border-r border-[#E4E2DC] last:border-r-0 align-top ${
                    cIdx === 0 ? 'font-bold text-[#000000] bg-[#F6F5F1]/50' : 'text-[#3F3F3C]'
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
