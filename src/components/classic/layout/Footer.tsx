import React, { useState } from 'react';
import { Github, Code2, Shield, FileText, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import RegionSelector from './RegionSelector';
import GlobalPolicyModal from './GlobalPolicyModal';
import CookiePolicyModal from './CookiePolicyModal';
import AIPolicyModal from './AIPolicyModal';
import OpenSourceLicenseModal from './OpenSourceLicenseModal';

export default function Footer() {
  const { t, language } = useLanguage();
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isCookieOpen, setIsCookieOpen] = useState(false);
  const [isAIPolicyOpen, setIsAIPolicyOpen] = useState(false);
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [licenseTab, setLicenseTab] = useState<'license' | 'community'>('license');
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#111111]/15 pt-14 pb-10 text-[#52524E] font-sans">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Brand & Local-First Identity (Col 1-5) */}
          <div className="lg:col-span-5 space-y-5">
            <Link to="/" className="inline-flex items-baseline gap-3 group">
              <span className="font-display text-2xl font-extrabold uppercase tracking-[-0.04em] text-[#111111] group-hover:opacity-75 transition-opacity">
                GOGUMA
              </span>
              <span className="text-[11px] font-sans tracking-[0.14em] uppercase text-[#8C8B85]">
                Open Architecture
              </span>
            </Link>

            <p className="text-[13px] text-[#52524E] font-normal leading-relaxed max-w-sm">
              {language === 'ko'
                ? '고구마(GOGUMA)는 누구나 자유롭게 활용할 수 있는 프라이버시 우선 무료 오픈 아키텍처 소프트웨어입니다. 모든 작업 데이터는 로컬 브라우저에 저장되며 종속 없이 독립적으로 구동됩니다.'
                : 'GOGUMA is free, privacy-first open architecture software licensed under MIT. All project data is stored locally in your browser with zero vendor lock-in.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <RegionSelector />
              <span className="text-[11px] font-sans tracking-[0.12em] uppercase text-[#8C8B85]">
                Local-First · Zero Telemetry
              </span>
            </div>
          </div>

          {/* Unified Editorial Columns (Col 6-12) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10 lg:pl-16">
            {/* Column 1: 안내 및 서비스 */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-sans font-medium text-[#8C8B85] uppercase tracking-[0.16em] pb-2 border-b border-[#E4E2DC]">
                {language === 'ko' ? '안내 및 서비스' : 'About & Service'}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/about"
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2"
                  >
                    <span>{t('about_us')}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/support"
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2"
                  >
                    <span>{language === 'ko' ? '도움말 & AI 가이드' : 'Help & AI Guide'}</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2"
                  >
                    <Github size={13} className="text-[#52524E]" />
                    <span>GitHub</span>
                    <ExternalLink size={11} className="text-[#8C8B85]" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: 라이선스 및 정책 */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-sans font-medium text-[#8C8B85] uppercase tracking-[0.16em] pb-2 border-b border-[#E4E2DC]">
                {language === 'ko' ? '라이선스 및 정책' : 'License & Policies'}
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => {
                      setLicenseTab('license');
                      setIsLicenseOpen(true);
                    }}
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Code2 size={13} className="text-[#8C8B85]" />
                    <span>{language === 'ko' ? '오픈소스 라이선스 (MIT)' : 'Open Source License (MIT)'}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsAIPolicyOpen(true)}
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Shield size={13} className="text-[#8C8B85]" />
                    <span>{t('ai_policy')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPolicyOpen(true)}
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2 cursor-pointer text-left"
                  >
                    <Shield size={13} className="text-[#8C8B85]" />
                    <span>{t('privacy_policy')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLicenseTab('community');
                      setIsLicenseOpen(true);
                    }}
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2 cursor-pointer text-left"
                  >
                    <FileText size={13} className="text-[#8C8B85]" />
                    <span>{t('community_terms')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsCookieOpen(true)}
                    className="text-[13px] font-medium text-[#1C1C1A] hover:text-[#111111] hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2 cursor-pointer text-left"
                  >
                    <FileText size={13} className="text-[#8C8B85]" />
                    <span>{t('cookie_policy')}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integrated Bottom Copyright Bar */}
        <div className="mt-12 pt-6 border-t border-[#E4E2DC] flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#8C8B85] font-normal">
          <div>
            © {year} GOGUMA · {language === 'ko' ? '무료 & 오픈소스 소프트웨어 (MIT 라이선스)' : 'Free & Open Source Software (MIT Licensed)'}
          </div>
          <div className="font-sans text-[11px] tracking-[0.12em] uppercase text-[#8C8B85]">
            100% Client-Side Specification Studio
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
