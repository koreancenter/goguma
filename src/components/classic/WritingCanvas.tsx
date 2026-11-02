import React, { useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft,
  BookOpen,
  Shield, Database, Compass
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity, SitePlan } from '../../types';
import PromptExtractionHub from './PromptExtractionHub';
import { FeatureMappingInteractiveWidget } from './FeatureMappingInteractiveWidget';
import { DesignSystemInteractiveWidget } from './DesignSystemInteractiveWidget';
import { NavigationArchitectureInteractiveWidget } from './NavigationArchitectureInteractiveWidget';

interface WritingCanvasProps {
  currentChapter: number;
  currentSection: string;
  formInputs: Record<string, FormInputEntity>;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  onNavigateSection: (direction: 'prev' | 'next') => void;
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSavedTime: string | null;
  largeTextMode?: boolean;
  isPreviewCollapsed?: boolean;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  currentChapter,
  currentSection,
  formInputs,
  onInputChange,
  onNavigateSection,
  plan,
  setPlan,
  saveStatus,
  lastSavedTime,
  largeTextMode = false,
  isPreviewCollapsed = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chapter: ChapterDef = GOGUMA_CHAPTERS.find(c => c.id === currentChapter) || GOGUMA_CHAPTERS[0];
  const section: SectionDef = chapter.sections.find(s => s.key === currentSection) || chapter.sections[0];
  const currentKey = `${currentChapter}_${section.key}`;
  const currentValue = formInputs[currentKey]?.userRawInput || '';

  // Focus textarea when switching sections
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentChapter, currentSection]);

  const currentSectionIdx = chapter.sections.findIndex(s => s.key === section.key);
  const isFirstSection = currentChapter === 1 && currentSectionIdx === 0;
  const isLastSection = currentChapter === 8 && currentSectionIdx === chapter.sections.length - 1;

  // Render chapter-specific interactive widgets unified in the single canvas
  const renderChapterInteractiveWidget = () => {
    switch (currentChapter) {
      case 1: {
        return (
          <div className="bg-[#121216] rounded-[2px] p-5 border border-[#23232A] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3ED]">
              <Compass size={15} className="text-[#C5A880]" />
              <span className="font-sans font-semibold">프로젝트 기본 정보 요약</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A]">
                <span className="text-xs text-[#78756E] block font-mono">서비스 명칭</span>
                <span className="font-sans font-semibold text-[#F5F3ED] text-sm mt-1 block truncate">
                  {plan.metadata?.projectName || '새 프로젝트'}
                </span>
              </div>
              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A]">
                <span className="text-xs text-[#78756E] block font-mono">플랫폼 대상</span>
                <span className="font-sans font-medium text-[#F5F3ED] text-sm mt-1 block">
                  {plan.metadata?.platform === 'APP' ? '모바일 웹 (PWA App)' : '웹 애플리케이션 (Web)'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="bg-[#121216] rounded-[2px] p-5 border border-[#23232A] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3ED]">
              <BookOpen size={15} className="text-[#C5A880]" />
              <span className="font-sans font-semibold">타깃 사용자 및 결핍 정의 요약</span>
            </div>
            <p className="text-xs sm:text-sm text-[#B8B5AC] leading-relaxed">
              작성하신 페르소나와 결핍 사항은 <code className="text-[#F5F3ED] font-mono bg-[#1A1A22] px-1.5 py-0.5 rounded-[2px] border border-[#262632]">docs/01_proposal.md</code>의 <strong>문제 정의(Problem Statement)</strong>와 <strong>가치 제안(Value Proposition)</strong>에 구조화되어 자동 반영됩니다.
            </p>
          </div>
        );
      }

      case 3: {
        return (
          <FeatureMappingInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 4: {
        return (
          <div className="bg-[#121216] rounded-[2px] p-5 border border-[#23232A] space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#23232A] pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3ED]">
                <Database size={15} className="text-[#C5A880]" />
                <span className="font-sans font-semibold">데이터 모델 및 엔터티 스키마 (06_DATA_SCHEMA.md)</span>
              </div>
              <span className="text-[10px] font-mono text-[#78756E] bg-[#16161C] px-2 py-0.5 rounded-[2px] border border-[#23232A]">
                TypeScript & IndexedDB
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F5F3ED]">ProjectEntity</span>
                  <span className="text-[10px] font-mono text-[#C5A880] bg-[#C5A880]/15 px-1.5 py-0.5 rounded-[2px]">SSOT</span>
                </div>
                <p className="text-[11px] text-[#B8B5AC] font-mono">
                  id: UUID · name: string · plan: SitePlan · updatedAt: ISO8601
                </p>
              </div>

              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F5F3ED]">FormInputEntity</span>
                  <span className="text-[10px] font-mono text-[#C5A880] bg-[#C5A880]/15 px-1.5 py-0.5 rounded-[2px]">Input State</span>
                </div>
                <p className="text-[11px] text-[#B8B5AC] font-mono">
                  sectionKey: string · userRawInput: string · lastSavedAt: ISO8601
                </p>
              </div>

              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F5F3ED]">TargetAppItem</span>
                  <span className="text-[10px] font-mono text-[#C5A880] bg-[#C5A880]/15 px-1.5 py-0.5 rounded-[2px]">Prototype CRUD</span>
                </div>
                <p className="text-[11px] text-[#B8B5AC] font-mono">
                  id: string · title: string · status: PENDING | CONFIRMED · createdAt: ISO8601
                </p>
              </div>

              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#F5F3ED]">SpecificationBundle</span>
                  <span className="text-[10px] font-mono text-[#78756E] bg-[#23232A] px-1.5 py-0.5 rounded-[2px]">Export Artifact</span>
                </div>
                <p className="text-[11px] text-[#B8B5AC] font-mono">
                  11 Markdown Docs + 1 Standalone prototype.html Package
                </p>
              </div>
            </div>

            <p className="text-xs text-[#B8B5AC] leading-relaxed pt-1">
              기획서에서 정의하는 엔터티와 필드는 <code className="text-[#F5F3ED] font-mono bg-[#16161C] px-1.5 py-0.5 rounded-[2px] border border-[#23232A]">docs/06_DATA_SCHEMA.md</code>에 엄격한 타입 정의 및 비즈니스 유효성 검증 규칙으로 사출됩니다.
            </p>
          </div>
        );
      }

      case 5: {
        return (
          <DesignSystemInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 6: {
        return (
          <NavigationArchitectureInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 7: {
        return (
          <div className="bg-[#121216] rounded-[2px] p-5 border border-[#23232A] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F3ED]">
              <Shield size={15} className="text-[#C5A880]" />
              <span className="font-sans font-semibold">로컬 퍼스트 & 아키텍처 규칙</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A]">
                <span className="font-sans font-medium text-sm text-[#F5F3ED] block">IndexedDB 로컬 스토리지</span>
                <span className="text-xs text-[#B8B5AC] mt-1 block">외부 클라우드 전송 없이 브라우저 내 안전 보관</span>
              </div>
              <div className="bg-[#16161C] p-3.5 rounded-[2px] border border-[#23232A]">
                <span className="font-sans font-medium text-sm text-[#F5F3ED] block">단일 파일 완결성</span>
                <span className="text-xs text-[#B8B5AC] mt-1 block">규약에 따른 무설치 단일 파일 보장</span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Chapter 8 is the dedicated Master Artifacts & Vibe Coding Hub
  if (currentChapter === 8) {
    return (
      <section 
        className="flex-1 min-w-[640px] h-full flex flex-col bg-[#0A0A0C] overflow-y-auto selection:bg-[#2F2922] selection:text-[#F5F3ED]"
        aria-label="산출물 사출 허브"
      >
        {/* Top Breadcrumb Bar */}
        <div className="h-14 px-8 border-b border-[#23232A] bg-[#0E0E12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#B8B5AC]">
            <span className="font-mono text-[#F5F3ED] font-semibold">CHAPTER 08</span>
            <span className="text-[#78756E]/40">·</span>
            <span className="text-[#F5F3ED] font-medium font-sans">산출물 허브 및 배포</span>
            <span className="text-[#78756E]/40">·</span>
            <span className="text-[#C5A880] font-mono font-medium">11종 사양서 번들</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#78756E]">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-[#C5A880] animate-pulse' : 'bg-[#1D3A2F]'}`} />
            <span className="font-mono text-[11px] text-[#B8B5AC]">
              {saveStatus === 'saving' ? '보존 중' : '자동 보존됨'}
            </span>
          </div>
        </div>

        {/* Chapter 8 Canvas Body */}
        <div className={`flex-1 w-full mx-auto p-6 sm:p-10 flex flex-col ${
          isPreviewCollapsed ? 'max-w-6xl' : 'max-w-5xl'
        }`}>
          <PromptExtractionHub
            formInputs={formInputs}
            onBack={() => onNavigateSection('prev')}
            onSave={() => {}}
            largeTextMode={largeTextMode}
          />
        </div>
      </section>
    );
  }

  // Chapters 1 to 7: Single Unified Canvas
  return (
    <section 
      className="flex-1 min-w-[640px] h-full flex flex-col bg-[#0A0A0C] overflow-y-auto selection:bg-[#2F2922] selection:text-[#F5F3ED]"
      aria-label="집필 캔버스"
    >
      {/* Canvas Top Bar: Breadcrumb and Save Status */}
      <div className="h-14 px-8 border-b border-[#23232A] bg-[#0E0E12] flex items-center justify-between shrink-0">
        <div className={`flex items-center gap-2 text-[#B8B5AC] ${
          largeTextMode ? 'text-base' : 'text-xs sm:text-sm'
        }`}>
          <span className="font-mono text-[#78756E] font-semibold">CHAPTER 0{chapter.id}</span>
          <span className="text-[#78756E]/40">·</span>
          <span className="text-[#F5F3ED] font-sans font-medium">{chapter.title}</span>
          <span className="text-[#78756E]/40">·</span>
          <span className="text-[#B8B5AC]">{section.title}</span>
        </div>

        {/* Unboxed Save Status */}
        <div className="flex items-center gap-1.5 text-xs text-[#78756E]">
          <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-[#C5A880] animate-pulse' : 'bg-[#1D3A2F]'}`} />
          <span className="font-mono text-[11px] text-[#B8B5AC]">
            {saveStatus === 'saving' ? '보존 중' : lastSavedTime ? `${lastSavedTime} 저장` : '자동 보존됨'}
          </span>
        </div>
      </div>

      {/* Main Unified Canvas Body */}
      <div className={`flex-1 w-full mx-auto p-6 sm:p-10 flex flex-col space-y-6 ${
        isPreviewCollapsed ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        {/* Editorial Heading */}
        <div className="space-y-2 border-b border-[#23232A] pb-5">
          <div className="flex items-center gap-2 text-xs text-[#78756E]">
            <span className="font-mono text-[#C5A880] font-semibold">
              0{currentSectionIdx + 1}.
            </span>
            <span className="uppercase tracking-wider font-mono text-[11px] text-[#B8B5AC]">{chapter.engTitle}</span>
          </div>
          <h1 className={`font-sans font-bold text-[#F5F3ED] tracking-tight leading-tight ${
            largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`} style={{ textWrap: 'balance' }}>
            {section.title}
          </h1>
          <p className={`text-[#B8B5AC] leading-relaxed font-sans ${
            largeTextMode ? 'text-lg leading-loose' : 'text-sm sm:text-base'
          }`}>
            {section.question}
          </p>
        </div>

        {/* 1. Natural Language Writing Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-sans font-medium text-[#F5F3ED]">
              기획 원고 서술 (Thinking Canvas)
            </span>
            <span className="font-mono text-xs tabular-nums text-[#78756E]">
              {currentValue.length}자
            </span>
          </div>

          <div className="relative flex flex-col bg-[#121216] rounded-[2px] border border-[#23232A] focus-within:border-[#C5A880] focus-within:ring-1 focus-within:ring-[#C5A880]/20 transition-all shadow-xs">
            <textarea
              id="goguma-raw-input"
              ref={textareaRef}
              value={currentValue}
              onChange={(e) => onInputChange(currentChapter, section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={largeTextMode ? 6 : 5}
              className={`w-full bg-transparent p-4 sm:p-5 text-[#F5F3ED] placeholder-[#5A5852] leading-relaxed outline-none resize-none font-sans ${
                largeTextMode ? 'text-lg leading-loose' : 'text-sm sm:text-base leading-relaxed'
              }`}
            />
          </div>
        </div>

        {/* 2. Unified Chapter Interactive Widget Section */}
        <div className="pt-2">
          {renderChapterInteractiveWidget()}
        </div>

        {/* Bottom Actions Bar - Strict Spatial Math & Single-Line Controls */}
        <div className="pt-5 pb-4 border-t border-[#23232A] flex items-center justify-between gap-3 flex-nowrap">
          {/* Previous Section Button */}
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-[2px] border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed bg-transparent border-[#23232A] text-[#78756E]'
                : 'border-[#23232A] bg-[#141418] hover:bg-[#1A1A22] text-[#B8B5AC] hover:text-[#F5F3ED] cursor-pointer'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          {/* Section Step Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#78756E]">
            <span className="text-[#F5F3ED] font-semibold">제 {chapter.id}장</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          {/* Next Section Button */}
          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-2 px-5 py-2 min-h-[38px] rounded-[2px] bg-[#F5F3ED] hover:bg-white active:bg-[#EAE6DC] text-[#0A0A0C] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs"
          >
            <span>{isLastSection ? '청사진 배포 허브' : '다음 단계로 전진'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-[2px] bg-black/15 text-[#0A0A0C]">
              ⌘ + ↵
            </kbd>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
