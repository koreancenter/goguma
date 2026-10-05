import React, { useRef, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, ArrowLeft, Check,
  Lightbulb, BookOpen, Layers, Palette, Network,
  Shield, Database, Compass, CheckCircle2
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
  const [recentlyAddedIndex, setRecentlyAddedIndex] = React.useState<number | null>(null);

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

  const handleChipClick = (chipText: string, idx: number) => {
    const nextVal = currentValue ? `${currentValue}\n${chipText}` : chipText;
    onInputChange(currentChapter, section.key, nextVal);
    setRecentlyAddedIndex(idx);
    setTimeout(() => {
      setRecentlyAddedIndex(null);
    }, 1200);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const currentSectionIdx = chapter.sections.findIndex(s => s.key === section.key);
  const isFirstSection = currentChapter === 1 && currentSectionIdx === 0;
  const isLastSection = currentChapter === 8 && currentSectionIdx === chapter.sections.length - 1;

  // Render chapter-specific interactive widgets unified in the single canvas
  const renderChapterInteractiveWidget = () => {
    switch (currentChapter) {
      case 1: {
        return (
          <div className="bg-[#13181F] rounded-[3px] p-5 border border-white/7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880]">
              <Compass size={15} />
              <span>프로젝트 기본 정보 요약</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
                <span className="text-xs text-[#9AA5B5] block">서비스 명칭</span>
                <span className="font-semibold text-[#F0F3F6] text-sm mt-1 block truncate">
                  {plan.metadata?.projectName || '새 프로젝트'}
                </span>
              </div>
              <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
                <span className="text-xs text-[#9AA5B5] block">플랫폼 대상</span>
                <span className="font-semibold text-[#C5A880] text-sm mt-1 block">
                  {plan.metadata?.platform === 'APP' ? '모바일 웹 (PWA App)' : '웹 애플리케이션 (Web)'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="bg-[#13181F] rounded-[3px] p-5 border border-white/7 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880]">
              <BookOpen size={15} />
              <span>타깃 사용자 및 결핍 정의 요약</span>
            </div>
            <p className="text-xs sm:text-sm text-[#9AA5B5] leading-relaxed">
              작성하신 페르소나와 고통 3가지는 <code className="text-[#C5A880] font-mono">docs/01_proposal.md</code>의 <strong>문제 정의(Problem Statement)</strong>와 <strong>가치 제안(Value Proposition)</strong>에 구조화되어 자동 반영됩니다.
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
          <div className="bg-[#13181F] rounded-[3px] p-5 border border-white/7 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880]">
              <Database size={15} />
              <span>장부 데이터 스키마 & TypeScript 인터페이스</span>
            </div>
            <p className="text-xs sm:text-sm text-[#9AA5B5] leading-relaxed">
              입력하신 장부 관리 항목(열 이름)과 비즈니스 규칙은 <code className="text-[#C5A880] font-mono">docs/06_DATA_SCHEMA.md</code>에 TypeScript 인터페이스와 인덱싱 규칙으로 자동 변환됩니다.
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
          <div className="bg-[#13181F] rounded-[3px] p-5 border border-white/7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880]">
              <Shield size={15} />
              <span>로컬 퍼스트 & 아키텍처 규칙</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
                <span className="font-semibold text-sm text-[#F0F3F6] block">IndexedDB 로컬 스토리지</span>
                <span className="text-xs text-[#9AA5B5] mt-1 block">외부 클라우드 전송 없이 브라우저 내 안전 보관</span>
              </div>
              <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
                <span className="font-semibold text-sm text-[#F0F3F6] block">단일 파일 완결성</span>
                <span className="text-xs text-[#9AA5B5] mt-1 block">규약에 따른 무설치 단일 파일 보장</span>
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
        className="flex-1 min-w-[640px] h-full flex flex-col bg-[#0B0C10] overflow-y-auto selection:bg-[#C5A880]/30 selection:text-[#F0F3F6]"
        aria-label="바이브 코딩 배포 허브"
      >
        {/* Top Breadcrumb Bar */}
        <div className="h-14 px-8 border-b border-white/7 bg-[#0E1217] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#9AA5B5]">
            <span className="font-mono text-[#C5A880]">제 8장</span>
            <span className="text-white/20">·</span>
            <span className="text-[#F0F3F6] font-medium">산출물 허브 및 배포</span>
            <span className="text-white/20">·</span>
            <span className="text-[#C5A880] font-medium">11종 사양서 번들</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5C6675]">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-mono text-[11px] text-[#9AA5B5]">
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
      className="flex-1 min-w-[640px] h-full flex flex-col bg-[#0B0C10] overflow-y-auto selection:bg-[#C5A880]/30 selection:text-[#F0F3F6]"
      aria-label="집필 캔버스"
    >
      {/* Canvas Top Bar: Breadcrumb and Save Status */}
      <div className="h-14 px-8 border-b border-white/7 bg-[#0E1217] flex items-center justify-between shrink-0">
        <div className={`flex items-center gap-2 text-[#9AA5B5] ${
          largeTextMode ? 'text-base' : 'text-xs sm:text-sm'
        }`}>
          <span className="font-mono text-[#C5A880]">제 {chapter.id}장</span>
          <span className="text-white/20">·</span>
          <span className="text-[#F0F3F6] font-medium">{chapter.title}</span>
          <span className="text-white/20">·</span>
          <span className="text-[#C5A880] font-medium">{section.title}</span>
        </div>

        {/* Unboxed Save Status */}
        <div className="flex items-center gap-1.5 text-xs text-[#5C6675]">
          <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="font-mono text-[11px] text-[#9AA5B5]">
            {saveStatus === 'saving' ? '보존 중' : lastSavedTime ? `${lastSavedTime} 저장` : '자동 보존됨'}
          </span>
        </div>
      </div>

      {/* Main Unified Canvas Body */}
      <div className={`flex-1 w-full mx-auto p-6 sm:p-10 flex flex-col space-y-6 ${
        isPreviewCollapsed ? 'max-w-6xl' : 'max-w-4xl'
      }`}>
        {/* Editorial Heading */}
        <div className="space-y-2 border-b border-white/7 pb-5">
          <div className="flex items-center gap-2 text-xs text-[#5C6675]">
            <span className="font-mono text-[#60A5FA]">
              0{currentSectionIdx + 1}.
            </span>
            <span>{chapter.engTitle}</span>
          </div>
          <h1 className={`font-bold text-[#F0F3F6] tracking-tight leading-tight ${
            largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
          }`} style={{ textWrap: 'balance' }}>
            {section.title}
          </h1>
          <p className={`text-[#9AA5B5] leading-relaxed font-sans ${
            largeTextMode ? 'text-lg leading-loose' : 'text-sm sm:text-base'
          }`}>
            {section.question}
          </p>
        </div>

        {/* 1. Natural Language Writing Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#9AA5B5]">
              원고 기록란 (자유 서술)
            </span>
            <span className="font-mono text-xs tabular-nums text-[#5C6675]">
              {currentValue.length}자
            </span>
          </div>

          <div className="relative flex flex-col bg-[#13181F] rounded-[4px] border border-white/10 focus-within:border-[#C5A880] focus-within:ring-1 focus-within:ring-[#C5A880]/30 transition-all shadow-inner">
            <textarea
              id="goguma-raw-input"
              ref={textareaRef}
              value={currentValue}
              onChange={(e) => onInputChange(currentChapter, section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={largeTextMode ? 6 : 5}
              className={`w-full bg-transparent p-4 sm:p-5 text-[#F0F3F6] placeholder-[#5C6675] leading-relaxed outline-none resize-none font-sans ${
                largeTextMode ? 'text-lg leading-loose' : 'text-sm sm:text-base leading-relaxed'
              }`}
            />
          </div>

          {/* One-Click Guide Cards - Tactile Interactive Chips */}
          <div className="space-y-2.5 pt-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#9AA5B5] flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#C5A880]" />
                <span>추천 표현 제안</span>
                <span className="text-[11px] font-normal text-[#5C6675]">· 클릭 시 원고에 즉시 추가</span>
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {section.guideChips.map((chip, idx) => {
                const isJustAdded = recentlyAddedIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip, idx)}
                    type="button"
                    className={`w-full text-left p-3 rounded-[4px] border transition-all duration-150 cursor-pointer flex items-center justify-between group ${
                      isJustAdded
                        ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                        : 'border-white/7 bg-[#141A23]/70 hover:bg-[#18202A] hover:border-[#C5A880]/40 text-[#9AA5B5] hover:text-[#F0F3F6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-4 h-4 rounded-[2px] flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isJustAdded
                          ? 'bg-emerald-500 text-[#0B0C10]'
                          : 'bg-white/5 text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-[#0B0C10]'
                      }`}>
                        {isJustAdded ? <Check size={11} strokeWidth={3} /> : '+'}
                      </span>
                      <span className="leading-snug truncate">{chip}</span>
                    </div>
                    <span className={`text-[11px] font-medium shrink-0 ml-3 transition-colors ${
                      isJustAdded ? 'text-emerald-400 font-semibold' : 'text-[#C5A880] opacity-80 group-hover:opacity-100'
                    }`}>
                      {isJustAdded ? '추가됨 ✓' : '추가 +'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Unified Chapter Interactive Widget Section */}
        <div className="pt-2">
          {renderChapterInteractiveWidget()}
        </div>

        {/* Bottom Actions Bar - Strict Spatial Math & Single-Line Controls */}
        <div className="pt-5 pb-2 border-t border-white/7 flex items-center justify-between gap-3 flex-nowrap">
          {/* Previous Section Button */}
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-[3px] border text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5 text-[#5C6675]'
                : 'border-white/10 bg-[#13181F] hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] cursor-pointer'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          {/* Section Step Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#5C6675]">
            <span className="text-[#C5A880]">제 {chapter.id}장</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          {/* Next Section Button */}
          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-2 px-4 py-2 min-h-[38px] rounded-[3px] bg-[#C5A880] hover:bg-[#D4AF37] active:bg-[#C5A880] text-[#0B0C10] text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{isLastSection ? '청사진 배포 허브' : '다음 단계로 전진'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.2 text-[10px] font-mono font-medium rounded-[2px] bg-[#0B0C10]/15 text-[#0B0C10]">
              ⌘ + ↵
            </kbd>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
