import React, { useState } from 'react';
import { Github, Sparkles, Code2, Heart, Shield, FileText, ExternalLink } from 'lucide-react';
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
    <footer className="w-full bg-white border-t border-slate-200/80 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Brand & Local-First Identity (Col 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 bg-goguma rounded-xl flex items-center justify-center text-white shadow-md shadow-goguma/20">
                <Sparkles size={18} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black uppercase tracking-tight text-slate-900">GOGUMA</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                  Open Source
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
              {language === 'ko' 
                ? '고구마(GOGUMA)는 누구나 자유롭게 활용할 수 있는 프라이버시 우선 무료 오픈 아키텍처 소프트웨어입니다. 모든 작업 데이터는 로컬 브라우저에 저장되며 종속 없이 독립적으로 구동됩니다.'
                : 'GOGUMA is free, privacy-first open architecture software licensed under MIT. All project data is stored locally in your browser with zero vendor lock-in.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <RegionSelector />
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50/80 border border-emerald-200/70">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Local-First Ready</span>
              </div>
            </div>
          </div>

          {/* Unified Links & Policy Grid (Col 6-12) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8 lg:pl-12">
            {/* Column 1: 안내 & 소스코드 */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {language === 'ko' ? '안내 및 서비스' : 'About & Service'}
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/about"
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-2"
                  >
                    <span>{t('about_us')}</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/support"
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-2"
                  >
                    <span>{language === 'ko' ? '도움말 & AI 가이드' : 'Help & AI Guide'}</span>
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-2"
                  >
                    <Github size={14} />
                    <span>GitHub</span>
                    <ExternalLink size={10} className="text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2: 라이선스 및 정책 */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                {language === 'ko' ? '라이선스 및 정책' : 'License & Policies'}
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => {
                      setLicenseTab('license');
                      setIsLicenseOpen(true);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Code2 size={13} className="text-goguma" />
                    <span>{language === 'ko' ? '오픈소스 라이선스 (MIT)' : 'Open Source License (MIT)'}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsAIPolicyOpen(true)}
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Sparkles size={13} className="text-amber-500" />
                    <span>{t('ai_policy')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsPolicyOpen(true)}
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Shield size={13} className="text-emerald-600" />
                    <span>{t('privacy_policy')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLicenseTab('community');
                      setIsLicenseOpen(true);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <Heart size={13} className="text-rose-500" />
                    <span>{t('community_terms')}</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setIsCookieOpen(true)}
                    className="text-xs font-bold text-slate-600 hover:text-goguma transition-colors inline-flex items-center gap-1.5 cursor-pointer text-left"
                  >
                    <FileText size={13} className="text-slate-400" />
                    <span>{t('cookie_policy')}</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Integrated Bottom Copyright Bar */}
        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] text-slate-400 font-medium">
          <div>
            © {year} GOGUMA • {language === 'ko' ? '무료 & 오픈소스 소프트웨어 (MIT 라이선스)' : 'Free & Open Source Software (MIT Licensed)'}
          </div>
          <div className="font-mono text-[10px] text-slate-400">
            Zero Server Dependency • 100% Client-Side
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
