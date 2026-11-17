import React, { useState, useRef, useEffect } from 'react';
import { Github, ChevronDown } from 'lucide-react';
import GlobalPolicyModal from './GlobalPolicyModal';
import CookiePolicyModal from './CookiePolicyModal';
import AIPolicyModal from './AIPolicyModal';
import OpenSourceLicenseModal from './OpenSourceLicenseModal';

const RELATED_SITES = [
  { label: 'nettodot.org', url: 'https://nettodot.org' },
  { label: 'eerum.goguma.app', url: 'https://eerum.goguma.app' },
  { label: 'vibevault.goguma.app', url: 'https://vibevault.goguma.app' },
  { label: 'vibecalendar.goguma.app', url: 'https://vibecalendar.goguma.app' },
  { label: 'koreancenter.net', url: 'https://koreancenter.net' },
  { label: 'slide.koreancenter.net', url: 'https://slide.koreancenter.net' },
  { label: 'projects.koreancenter.net', url: 'https://projects.koreancenter.net' },
  { label: 'aipodium.net', url: 'https://aipodium.net' },
];

export default function Footer() {
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isCookieOpen, setIsCookieOpen] = useState(false);
  const [isAIPolicyOpen, setIsAIPolicyOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [licenseTab, setLicenseTab] = useState<'terms' | 'license' | 'community'>('license');
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<{ label: string; url: string } | null>(null);
  const siteDropdownRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!isSiteMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(e.target as Node)) {
        setIsSiteMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSiteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSiteMenuOpen]);

  return (
    <footer className="w-full bg-[#FFFFFF] text-[#111111] font-sans border-t border-[#E4E2DC]">
      {/* Top Black Utility Menu Strip — Same Font & Sharp Editorial Scale as Top Bar */}
      <div className="w-full bg-[#000000] text-[#FFFFFF]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 min-h-14 py-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          {/* 6 Editorial Policy Menu Items */}
          <nav className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2" aria-label="푸터 정책 메뉴">
            <button
              type="button"
              onClick={() => setIsPolicyOpen(true)}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFE600] hover:underline underline-offset-4 rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              개인정보처리방침
            </button>
            <button
              type="button"
              onClick={() => {
                setLicenseTab('terms');
                setIsLicenseOpen(true);
              }}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              이용약관
            </button>
            <button
              type="button"
              onClick={() => {
                setLicenseTab('license');
                setIsLicenseOpen(true);
              }}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              오픈소스 라이선스
            </button>
            <button
              type="button"
              onClick={() => setIsAIPolicyOpen(true)}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              인공지능 정책
            </button>
            <button
              type="button"
              onClick={() => {
                setLicenseTab('community');
                setIsLicenseOpen(true);
              }}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              커뮤니티 이용 규약
            </button>
            <button
              type="button"
              onClick={() => setIsCookieOpen(true)}
              className="text-[13px] sm:text-[14px] font-bold tracking-tight text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors cursor-pointer whitespace-nowrap"
            >
              쿠키 정책
            </button>
          </nav>

          {/* Right Social Media Icon: GitHub (Matches Sejong SNS Position) */}
          <div className="flex items-center shrink-0">
            <a
              href="https://github.com/koreancenter/goguma.git"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              title="GitHub: https://github.com/koreancenter/goguma.git"
              className="p-1.5 -mr-1.5 text-[#FFFFFF] hover:text-[#FFE600] rounded-none transition-colors inline-flex items-center justify-center"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Middle White Band: Emblem & Company Info | Net-to-Dot Movement Member | Related Sites */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Architectural Mark + Company Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            {/* Architectural Square Emblem */}
            <div className="shrink-0 flex items-center" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="44" height="44" stroke="#000000" strokeWidth="2.5" />
                <path
                  d="M15 29C15 22.4 21.2 15 29.6 15C32.4 15 34 16.8 34 19.6C34 26.8 27.4 33 19.6 33C16.6 33 15 31.4 15 29Z"
                  fill="#000000"
                />
                <path d="M29 15C30.4 12.6 32.6 11.2 35 11" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </div>

            {/* Company Info Lines */}
            <div className="text-[13px] text-[#3F3F3C] leading-[1.75] space-y-0.5 font-medium">
              <p className="text-[#000000] font-bold">
                한국센터글로벌네트워크 지식관리실 고구마앱팀
              </p>
              <p>경기도 부천시 원미구 역곡로 19번길 108동 803호</p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                <span>사업자등록번호 141-82-83410</span>
                <span className="text-[#CBC8BF]" aria-hidden="true">|</span>
                <span>통신판매업신고번호 제2025-부천원미-1090호</span>
              </p>
            </div>
          </div>

          {/* Right: Net-to-Dot Movement Member Logo Lockup + Related Sites Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 shrink-0">
            {/* Logo Slot: Net-to-Dot Movement Member */}
            <a
              href="https://nettodot.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-[#E4E2DC] hover:border-[#000000] px-4 py-2.5 rounded-none transition-colors"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 text-[#000000]"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="5" cy="6" r="2.2" fill="#000000" />
                <circle cx="19" cy="6" r="2.2" fill="#000000" />
                <circle cx="5" cy="18" r="2.2" fill="#000000" />
                <circle cx="19" cy="18" r="2.2" fill="#DC2626" />
              </svg>
              <div className="leading-tight">
                <div className="text-[13px] font-extrabold tracking-[-0.02em] text-[#000000] group-hover:text-[#DC2626] transition-colors">
                  Net-to-Dot
                </div>
                <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#52524E]">
                  Movement Member
                </div>
              </div>
            </a>

            {/* Related Sites Box: [ 관련 사이트 v | 이동 ] */}
            <div ref={siteDropdownRef} className="relative flex items-stretch h-11 border border-[#111111]/35 bg-[#FFFFFF] rounded-none">
              <button
                type="button"
                onClick={() => setIsSiteMenuOpen(prev => !prev)}
                className="min-w-[205px] sm:min-w-[225px] px-4 flex items-center justify-between gap-3 text-[13px] font-bold text-[#111111] hover:bg-[#F6F5F1] transition-colors cursor-pointer rounded-none"
                aria-haspopup="listbox"
                aria-expanded={isSiteMenuOpen}
              >
                <span className="truncate">{selectedSite ? selectedSite.label : '관련 사이트'}</span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-[#52524E] transition-transform ${isSiteMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {selectedSite ? (
                <a
                  href={selectedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 border-l border-[#111111]/35 flex items-center justify-center text-[13px] font-bold text-[#111111] hover:bg-[#000000] hover:text-[#FFE600] transition-colors rounded-none whitespace-nowrap"
                >
                  이동
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSiteMenuOpen(true)}
                  className="px-4 border-l border-[#111111]/35 flex items-center justify-center text-[13px] font-bold text-[#111111] hover:bg-[#000000] hover:text-[#FFE600] transition-colors cursor-pointer rounded-none whitespace-nowrap"
                >
                  이동
                </button>
              )}

              {isSiteMenuOpen && (
                <div
                  role="listbox"
                  aria-label="관련 사이트 목록"
                  className="absolute left-0 right-0 bottom-full mb-1 bg-[#FFFFFF] border border-[#000000] shadow-xl z-50 rounded-none divide-y divide-[#E4E2DC] max-h-72 overflow-y-auto"
                >
                  {RELATED_SITES.map((site) => (
                    <button
                      key={site.label}
                      type="button"
                      role="option"
                      aria-selected={selectedSite?.label === site.label}
                      onClick={() => {
                        setSelectedSite(site);
                        setIsSiteMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors cursor-pointer rounded-none flex items-center justify-between ${
                        selectedSite?.label === site.label
                          ? 'bg-[#000000] text-[#FFE600]'
                          : 'text-[#111111] hover:bg-[#000000] hover:text-[#FFE600]'
                      }`}
                    >
                      <span>{site.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Hairline Bar */}
        <div className="mt-8 pt-5 border-t border-[#E4E2DC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[12px] text-[#52524E] font-medium">
          <div>
            COPYRIGHT(C) {year} KOREAN CENTER GLOBAL NETWORK · GOGUMA APP TEAM. ALL RIGHTS RESERVED.
          </div>
          <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#52524E]">
            100% LOCAL-FIRST · ZERO TELEMETRY · MIT LICENSE
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      <GlobalPolicyModal isOpen={isPolicyOpen} onClose={() => setIsPolicyOpen(false)} />
      <CookiePolicyModal isOpen={isCookieOpen} onClose={() => setIsCookieOpen(false)} />
      <AIPolicyModal isOpen={isAIPolicyOpen} onClose={() => setIsAIPolicyOpen(false)} />
      <OpenSourceLicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        defaultTab={licenseTab}
      />
    </footer>
  );
}
