import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Code2, 
  Github, 
  Heart, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  FolderArchive, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
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
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-goguma/10 border border-goguma/20 text-goguma text-xs font-bold">
            <Heart size={14} className="text-rose-500 fill-rose-500" />
            <span>{language === 'ko' ? '100% 무료 & 오픈소스 소프트웨어' : '100% Free & Open Source Software'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            {language === 'ko' ? '자유로운 웹 아키텍처 커뮤니티' : 'Free & Open Architecture Studio'}
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            {language === 'ko' 
              ? '고구마(GOGUMA)는 특정 기업이나 서버에 종속되지 않는 로컬 우선 오픈 소프트웨어입니다. 중앙 구독료 없이 사용자의 브라우저 또는 개인 로컬 AI(WebLLM / Ollama) 환경에서 완전히 독립적으로 동작합니다.'
              : 'GOGUMA is a local-first open architecture suite. Free from recurring subscriptions or server lock-in, it runs autonomously in your browser powered by on-device local storage and BYOK / Local AI.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/workspace')}
              className="px-6 py-3 bg-goguma hover:bg-fuchsia-950 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-goguma/20 flex items-center gap-2"
            >
              <span>{language === 'ko' ? '워크스페이스 바로 시작' : 'Open Workspace'}</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                setLicenseTab('license');
                setIsLicenseOpen(true);
              }}
              className="px-6 py-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
            >
              <Code2 size={14} className="text-goguma" />
              <span>{language === 'ko' ? 'MIT 라이선스 보기' : 'View MIT License'}</span>
            </button>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {language === 'ko' ? '로컬 우선 & 제로 원격 전송' : 'Local-First & Zero Telemetry'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === 'ko'
                ? '기획안과 사이트맵 데이터는 중앙 서버에 수집되지 않으며 오직 사용자의 브라우저 로컬 저장소에 암호화 보관됩니다.'
                : 'Your project sitemaps and specification documents are saved exclusively in your browser without telemetry or tracking.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-fuchsia-50 text-goguma flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {language === 'ko' ? '무과금 AI 추론의 자유' : 'Inference Freedom'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === 'ko'
                ? 'Google Gemini 무료 API 키(BYOK), WebGPU 가속 기반 브라우저 내장 WebLLM, 또는 오프라인 Ollama를 자유롭게 선택할 수 있습니다.'
                : 'Bring Your Own Key for Gemini, run in-browser WebGPU WebLLM, or connect to your offline Ollama daemon with zero subscription fees.'}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderArchive size={20} />
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {language === 'ko' ? '오픈 포맷 & 락인 해제' : 'Open JSON Portability'}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {language === 'ko'
                ? '단일 프로젝트 또는 전체 워크스페이스를 원클릭 표준 JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.'
                : 'Export and restore your entire studio workspace in portable, human-readable standard JSON at any time.'}
            </p>
          </div>
        </div>

        {/* Code & Contribution Box */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
                <Terminal size={18} className="text-goguma" />
                <span>{language === 'ko' ? '오픈소스 저장소 및 기여' : 'Open Source Repository'}</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ko'
                  ? 'GOGUMA는 누구나 코드를 열람하고, 포크(Fork)하며 기여할 수 있는 MIT 라이선스 프로젝트입니다.'
                  : 'GOGUMA is open for inspection, improvements, and community contributions under MIT.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLicenseTab('community');
                  setIsLicenseOpen(true);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
              >
                {language === 'ko' ? '커뮤니티 규약' : 'Community Guidelines'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl text-slate-100 font-mono text-xs overflow-x-auto">
            <span className="text-slate-400 select-all">$ {cloneCommand}</span>
            <button
              onClick={copyClone}
              className="ml-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0"
              title="Copy command"
            >
              {copiedClone ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
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
