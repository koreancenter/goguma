import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Heart, 
  ShieldCheck, 
  Cpu, 
  FolderArchive, 
  Terminal, 
  Copy, 
  Check, 
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import OpenSourceLicenseModal from '../layout/OpenSourceLicenseModal';

export default function Community() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isLicenseOpen, setIsLicenseOpen] = useState(false);
  const [licenseTab, setLicenseTab] = useState<'license' | 'community'>('license');
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = 'git clone https://github.com/goguma-app/goguma.git';

  const copyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#F0F3F6] pt-28 pb-20 px-4 sm:px-6 font-sans selection:bg-[#2563EB]/30 selection:text-[#F0F3F6]">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[2px] bg-blue-950/60 border border-blue-500/30 text-[#38BDF8] text-[11px] font-mono uppercase tracking-wider">
            <Heart size={13} className="text-[#38BDF8] fill-[#38BDF8]" />
            <span>{language === 'ko' ? '100% 무료 & 오픈 아키텍처 소프트웨어' : '100% Free & Open Architecture Software'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold text-[#F0F3F6] tracking-tight uppercase">
            {language === 'ko' ? '독립형 웹 아키텍처 스튜디오' : 'Open Architecture Studio'}
          </h1>

          <p className="text-[#94A3B8] text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            {language === 'ko' 
              ? '특정 중앙 서버나 반복 구독에 종속되지 않는 로컬 우선 오픈 소프트웨어입니다. 순수 브라우저 오프라인 환경 또는 개인 BYOK AI 엔진으로 완전히 독립적으로 동작합니다.'
              : 'A local-first open architecture suite. Free from recurring subscriptions or server lock-in, it runs autonomously in your browser.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/workspace')}
              className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-[2px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{language === 'ko' ? '작업실 바로 시작' : 'Open Workspace'}</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => {
                setLicenseTab('license');
                setIsLicenseOpen(true);
              }}
              className="px-6 py-2.5 bg-[#13181F] hover:bg-[#1A222D] border border-white/[0.08] text-[#F0F3F6] rounded-[2px] text-xs font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <Code2 size={14} className="text-[#38BDF8]" />
              <span>{language === 'ko' ? 'MIT 라이선스 보기' : 'View MIT License'}</span>
            </button>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#0E1217] rounded-[2px] p-6 border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#13181F] text-[#38BDF8] border border-white/[0.08] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F0F3F6]">
              {language === 'ko' ? '로컬 우선 & 제로 원격 전송' : 'Local-First & Zero Telemetry'}
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed font-sans">
              {language === 'ko'
                ? '기획안과 사이트맵 데이터는 중앙 서버에 수집되지 않으며 오직 사용자의 브라우저 로컬 저장소에 안전하게 보관됩니다.'
                : 'Your project sitemaps and specification documents are saved exclusively in your browser without telemetry or tracking.'}
            </p>
          </div>

          <div className="bg-[#0E1217] rounded-[2px] p-6 border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#13181F] text-[#38BDF8] border border-white/[0.08] flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F0F3F6]">
              {language === 'ko' ? '무과금 AI 추론의 자유' : 'Inference Freedom'}
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed font-sans">
              {language === 'ko'
                ? 'Google Gemini 무료 API 키(BYOK) 또는 오프라인 Ollama 데몬을 자유롭게 연동하여 이용할 수 있습니다.'
                : 'Bring Your Own Key for Gemini, or connect to your offline Ollama daemon with zero subscription fees.'}
            </p>
          </div>

          <div className="bg-[#0E1217] rounded-[2px] p-6 border border-white/[0.08] space-y-3">
            <div className="w-9 h-9 rounded-[2px] bg-[#13181F] text-[#38BDF8] border border-white/[0.08] flex items-center justify-center">
              <FolderArchive size={18} />
            </div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#F0F3F6]">
              {language === 'ko' ? '오픈 포맷 & 락인 해제' : 'Open JSON Portability'}
            </h2>
            <p className="text-xs text-[#64748B] leading-relaxed font-sans">
              {language === 'ko'
                ? '단일 프로젝트 또는 전체 워크스페이스를 원클릭 표준 JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.'
                : 'Export and restore your entire studio workspace in portable, human-readable standard JSON at any time.'}
            </p>
          </div>
        </div>

        {/* Code & Contribution Box */}
        <div className="bg-[#0E1217] rounded-[2px] p-7 border border-white/[0.08] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#F0F3F6] flex items-center gap-2">
                <Terminal size={16} className="text-[#38BDF8]" />
                <span>{language === 'ko' ? '오픈소스 저장소 및 기여' : 'Open Source Repository'}</span>
              </h2>
              <p className="text-xs text-[#64748B] font-sans">
                {language === 'ko'
                  ? '누구나 코드를 열람하고, 포크(Fork)하며 기여할 수 있는 MIT 라이선스 프로젝트입니다.'
                  : 'Open for inspection, improvements, and community contributions under MIT.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLicenseTab('community');
                  setIsLicenseOpen(true);
                }}
                className="px-3.5 py-1.5 bg-[#13181F] hover:bg-[#1A222D] text-[#94A3B8] hover:text-[#F0F3F6] border border-white/[0.08] rounded-[2px] text-xs font-medium transition-colors cursor-pointer"
              >
                {language === 'ko' ? '커뮤니티 규약' : 'Community Guidelines'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0B0C10] border border-white/[0.08] rounded-[2px] font-mono text-xs overflow-x-auto">
            <span className="text-[#94A3B8] select-all font-mono">$ {cloneCommand}</span>
            <button
              onClick={copyClone}
              className="ml-3 p-1 rounded-[2px] bg-[#13181F] hover:bg-[#1A222D] text-[#38BDF8] transition-colors shrink-0 cursor-pointer border border-white/[0.08]"
              title="Copy command"
            >
              {copiedClone ? <Check size={14} className="text-[#38BDF8]" /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>

      <OpenSourceLicenseModal
        isOpen={isLicenseOpen}
        onClose={() => setIsLicenseOpen(false)}
        defaultTab={licenseTab}
      />
    </div>
  );
}
