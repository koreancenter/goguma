import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../contexts/LanguageContext';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTabItem,
} from '../layout/EditorialPageLayout';

export default function Community() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [copiedClone, setCopiedClone] = useState(false);

  const cloneCommand = 'git clone https://github.com/koreancenter/goguma.git';

  const copyClone = () => {
    navigator.clipboard.writeText(cloneCommand);
    setCopiedClone(true);
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const tabs: EditorialTabItem[] = [
    { id: 'community', label: '오픈 아키텍처', to: '/community' },
    { id: 'about', label: 'GOGUMA 소개', to: '/about' },
    { id: 'support', label: '도움말 및 가이드', to: '/support' },
    { id: 'contact', label: '문의 및 피드백', to: '/contact' },
  ];

  const pillars = [
    {
      index: '01',
      title: language === 'ko' ? '로컬 우선 & 제로 원격 전송' : 'Local-First & Zero Telemetry',
      description:
        language === 'ko'
          ? '기획안과 사이트맵 데이터는 중앙 서버에 수집되지 않으며 오직 사용자의 브라우저 로컬 저장소에 안전하게 보관됩니다.'
          : 'Your project sitemaps and specification documents are saved exclusively in your browser without telemetry or tracking.',
    },
    {
      index: '02',
      title: language === 'ko' ? '무과금 AI 추론의 자유' : 'Inference Freedom',
      description:
        language === 'ko'
          ? 'Google Gemini 무료 API 키(BYOK) 또는 오프라인 Ollama 데몬을 자유롭게 연동하여 이용할 수 있습니다.'
          : 'Bring Your Own Key for Gemini, or connect to your offline Ollama daemon with zero subscription fees.',
    },
    {
      index: '03',
      title: language === 'ko' ? '오픈 포맷 & 락인 해제' : 'Open JSON Portability',
      description:
        language === 'ko'
          ? '단일 프로젝트 또는 전체 워크스페이스를 원클릭 표준 JSON 파일로 백업하고 언제든 다른 기기로 복원할 수 있습니다.'
          : 'Export and restore your entire studio workspace in portable, human-readable standard JSON at any time.',
    },
  ];

  return (
    <EditorialPageLayout
      category={language === 'ko' ? 'OPEN ARCHITECTURE · 100% FREE SOFTWARE' : 'OPEN ARCHITECTURE · 100% FREE SOFTWARE'}
      title={language === 'ko' ? '독립형 웹 아키텍처 스튜디오' : 'Open Architecture Studio'}
      subtitle={
        language === 'ko'
          ? '특정 중앙 서버나 반복 구독에 종속되지 않는 로컬 우선 오픈 소프트웨어입니다. 순수 브라우저 오프라인 환경 또는 개인 BYOK AI 엔진으로 완전히 독립적으로 동작합니다.'
          : 'A local-first open architecture suite. Free from recurring subscriptions or server lock-in, it runs autonomously in your browser.'
      }
      tabs={tabs}
      activeTabId="community"
      headerActions={
        <>
          <button
            type="button"
            onClick={() => navigate('/workspace')}
            className="px-5 py-3 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-[17px] font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{language === 'ko' ? '작업실 바로 시작' : 'Open Workspace'}</span>
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => navigate('/license')}
            className="px-5 py-3 bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] border border-[#000000] text-[#000000] rounded-none text-[17px] font-bold transition-colors cursor-pointer"
          >
            <span>{language === 'ko' ? 'MIT 라이선스 보기' : 'View MIT License'}</span>
          </button>
        </>
      }
    >
      <EditorialSection chapter={language === 'ko' ? '제1장 3대 핵심 독립 원칙' : '01 · Three Architectural Pillars'}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {pillars.map((pillar) => (
            <div
              key={pillar.index}
              className="p-8 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none space-y-4"
            >
              <div className="text-[16px] font-extrabold uppercase tracking-[0.14em] text-[#52524E] tabular-nums">
                PILLAR {pillar.index}
              </div>
              <h3 className="text-[22px] sm:text-[24px] font-extrabold text-[#000000] tracking-tight leading-snug">
                {pillar.title}
              </h3>
              <p className="text-[18px] sm:text-[19px] text-[#3F3F3C] leading-[1.8]">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </EditorialSection>

      <EditorialSection chapter={language === 'ko' ? '제2장 오픈소스 저장소 및 커뮤니티 규약' : '02 · Open Source Repository & Guidelines'}>
        <div className="p-8 sm:p-10 bg-[#FFFFFF] border border-[#000000] rounded-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-[19px] sm:text-[20px] text-[#3F3F3C]">
              {language === 'ko'
                ? '누구나 코드를 열람하고, 포크(Fork)하며 기여할 수 있는 MIT 라이선스 프로젝트입니다.'
                : 'Open for inspection, improvements, and community contributions under MIT.'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/community-terms')}
              className="px-5 py-3 bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#000000] border border-[#000000] rounded-none text-[17px] font-bold transition-colors cursor-pointer shrink-0"
            >
              {language === 'ko' ? '커뮤니티 규약 보기' : 'Community Guidelines'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 p-5 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none font-mono text-[17px] sm:text-[19px] overflow-x-auto">
            <span className="text-[#000000] select-all">$ {cloneCommand}</span>
            <button
              type="button"
              onClick={copyClone}
              className="px-4 py-2 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[16px] font-sans font-bold rounded-none transition-colors shrink-0 cursor-pointer inline-flex items-center gap-2"
              title="Copy command"
            >
              {copiedClone ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedClone ? '복사됨' : '복사'}</span>
            </button>
          </div>
        </div>
      </EditorialSection>
    </EditorialPageLayout>
  );
}
