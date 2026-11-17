import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
  backTo = '/workspace',
  backLabel = '작업실로 돌아가기',
  tabs,
  activeTabId,
  headerActions,
  maxWidthClass = 'max-w-5xl',
  children,
}: EditorialPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-14rem)] bg-[#FFFFFF] text-[#111111] font-sans selection:bg-[#000000] selection:text-[#FFFFFF]">
      <div className={`${maxWidthClass} mx-auto px-5 sm:px-8 pt-10 pb-20`}>
        {/* Top Back Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="inline-flex items-center gap-2 px-3 py-1.5 -ml-3 text-[13px] font-bold text-[#3F3F3C] hover:bg-[#000000] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{backLabel}</span>
          </button>

          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#52524E]">
            {category}
          </span>
        </div>

        {/* Sejong Editorial Document Title Header */}
        <div className="border-t-2 border-t-[#000000] border-b border-b-[#E4E2DC] pt-7 pb-7 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.03em] text-[#000000] leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#52524E] leading-relaxed max-w-3xl">
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
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
              const className = `px-3 py-3.5 text-center text-[13px] font-bold tracking-tight transition-colors rounded-none cursor-pointer flex items-center justify-center whitespace-nowrap ${
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
        <div className="pt-10 space-y-10 text-[13px] sm:text-[14px] leading-[1.8] text-[#2B2B29]">
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
    <section className="space-y-4">
      {chapter && (
        <h2 className="text-lg sm:text-xl font-extrabold text-[#000000] tracking-[-0.02em] pb-2.5 border-b border-[#000000]">
          {chapter}
        </h2>
      )}
      {title && (
        <h3 className="text-sm sm:text-base font-extrabold text-[#000000] tracking-[-0.01em] pt-2">
          {title}
        </h3>
      )}
      <div className="space-y-2.5">{children}</div>
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
    <div className="overflow-x-auto border-t-2 border-t-[#000000] border-b border-b-[#000000] my-4">
      <table className="w-full text-left border-collapse min-w-[540px]">
        <thead>
          <tr className="bg-[#000000] text-[#FFFFFF]">
            {headers.map((header, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-xs sm:text-[13px] font-bold tracking-tight border-r border-white/15 last:border-r-0"
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
                  className={`px-4 py-3 text-xs sm:text-[13px] leading-relaxed border-r border-[#E4E2DC] last:border-r-0 align-top ${
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
