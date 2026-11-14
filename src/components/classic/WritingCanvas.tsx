import React, { useRef, useEffect, useState } from 'react';
import { 
  ArrowRight, ArrowLeft,
  BookOpen,
  Shield, Database, Compass,
  Maximize2, Minimize2,
  Sparkles, Undo2, Check, Lock, Unlock
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity, DomainBusinessRule, SitePlan } from '../../types';
import { getAISettings } from '../../lib/aiConfig';
import {
  getSectionBusinessRules,
  buildChapterAIContext,
  serializeSectionBusinessRulesToMarkdown,
} from '../../lib/businessRulesSerializer';
import PromptExtractionHub from './PromptExtractionHub';
import { FeatureMappingInteractiveWidget } from './FeatureMappingInteractiveWidget';
import { DesignSystemInteractiveWidget } from './DesignSystemInteractiveWidget';
import { NavigationArchitectureInteractiveWidget } from './NavigationArchitectureInteractiveWidget';
import { VisualSchemaBridgeWidget } from './VisualSchemaBridgeWidget';
import { TiptapThinkingCanvas } from './TiptapThinkingCanvas';
import { DomainRulesSection } from './DomainRulesSection';
import { Tooltip } from '../guide/Tooltip';

export interface WritingCanvasProps {
  currentChapter: number;
  currentSection: string;
  formInputs: Record<string, FormInputEntity>;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  onBusinessRulesChange?: (chapterId: number, sectionKey: string, rules: DomainBusinessRule[]) => void;
  onNavigateSection: (direction: 'prev' | 'next') => void;
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSavedTime: string | null;
  largeTextMode?: boolean;
  isPreviewCollapsed?: boolean;
  onTogglePreviewCollapse?: () => void;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
  onToggleChapterLock?: (chapterId: number) => void;
}

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  currentChapter,
  currentSection,
  formInputs,
  onInputChange,
  onBusinessRulesChange,
  onNavigateSection,
  plan,
  setPlan,
  saveStatus,
  lastSavedTime,
  largeTextMode = false,
  isPreviewCollapsed = false,
  onTogglePreviewCollapse,
  lockedChapters = [],
  updatedChapters,
  onToggleChapterLock,
}) => {
  const chapter: ChapterDef = GOGUMA_CHAPTERS.find(c => c.id === currentChapter) || GOGUMA_CHAPTERS[0];
  const section: SectionDef = chapter.sections.find(s => s.key === currentSection) || chapter.sections[0];
  const currentKey = `${currentChapter}_${section.key}`;
  const currentValue = formInputs[currentKey]?.userRawInput || '';
  const currentBusinessRules = getSectionBusinessRules(formInputs[currentKey]);
  const isChapterLocked = Boolean(
    lockedChapters.includes(currentChapter) || formInputs[currentKey]?.isLocked
  );

  // Inline AI Co-pilot State
  const [previousValueBeforeRefine, setPreviousValueBeforeRefine] = useState<string | null>(null);
  const [coPilotNotification, setCoPilotNotification] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);

  // Reset refine state when switching sections
  useEffect(() => {
    setPreviousValueBeforeRefine(null);
  }, [currentChapter, currentSection]);

  // Keyboard shortcut: Cmd/Ctrl + P to toggle 2-track Wide Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onTogglePreviewCollapse?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePreviewCollapse]);

  const currentSectionIdx = chapter.sections.findIndex(s => s.key === section.key);
  const isFirstSection = currentChapter === 1 && currentSectionIdx === 0;
  const isLastSection = currentChapter === 8 && currentSectionIdx === chapter.sections.length - 1;

  // 1. Inline AI Co-pilot: [✨ 1-Line Refine] with deterministic chapter context + businessRules constraints
  const buildDeterministicRefinement = (raw: string): string => {
    const rulesMarkdown = serializeSectionBusinessRulesToMarkdown(currentChapter, section.key, formInputs);
    let refined = '';

    if (currentChapter === 1 && section.key === 'project_name') {
      refined = `서비스 공식 명칭: ${raw} (시스템 식별자: ${raw.replace(/\s+/g, '-').toLowerCase()})`;
    } else if (currentChapter === 1 && (section.key === 'target_user' || section.key === 'primary_goal' || section.key === 'problem_background')) {
      refined = `[핵심 타깃] ${raw}\n[충족 가치] 실시간 엑셀 장부 매핑 및 무설치 로컬 퍼스트 사용자 경험 제공\n[성공 지표] 업무 소요 시간 70% 단축 및 입력 실수 0건 달성`;
    } else if (currentChapter === 4) {
      const tokens = raw.split(/[,;\n/·]+/).map(t => t.trim()).filter(Boolean);
      refined = tokens.map((t, i) => `${i + 1}. ${t}: 필수 입력값 검증 및 실시간 장부 1:1 매핑`).join('\n');
    } else if (currentChapter === 3) {
      refined = `[기능 명세] ${raw}\n- 실행 주체: 인증된 시스템 사용자\n- 사전 조건: 필수 항목 유효성 검증 통과\n- 사후 결과: 데이터베이스 즉시 반영 및 감사 로그 기록`;
    } else {
      refined = `[공식 규격 명세]\n- 핵심 내용: ${raw}\n- 기술 규약: 100% 무설치 로컬 퍼스트 아키텍처 준수\n- 무결성 원칙: 0ms 즉각 반응 및 브라우저 IndexedDB 영구 보존`;
    }

    if (rulesMarkdown && !refined.includes('WHEN:')) {
      refined = `${refined}\n\n[적용된 도메인 제약 요약]\n${rulesMarkdown}`;
    }

    return refined;
  };

  const handleInlineRefine = async () => {
    if (isChapterLocked) return;
    const raw = currentValue.trim();
    if (!raw) {
      const defaultStarter = section.placeholder || `${section.title}에 대한 요구사항 명세`;
      onInputChange(currentChapter, section.key, `[요구사항 정의] ${defaultStarter}`);
      return;
    }

    setPreviousValueBeforeRefine(currentValue);

    const chapterContext = buildChapterAIContext(
      currentChapter,
      section.key,
      formInputs,
      plan.metadata?.projectName,
      lockedChapters
    );
    const aiSettings = getAISettings();
    const canUseRemoteGemini = aiSettings.provider === 'gemini' && Boolean(aiSettings.gemini.apiKey?.trim());
    const canUseLocalOllama = aiSettings.provider === 'ollama';

    if (canUseRemoteGemini || canUseLocalOllama) {
      setIsRefining(true);
      try {
        const promptText = `You are refining a software engineering PRD section. Strictly enforce all Domain Rules & Constraints below.\n\n${chapterContext}\n\nReturn only the refined, unambiguous Korean engineering specification text.`;
        let aiText = '';

        if (canUseRemoteGemini) {
          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: aiSettings.gemini.model,
              contents: promptText,
              apiKey: aiSettings.gemini.apiKey.trim(),
            }),
          });
          if (res.ok) {
            const data = await res.json();
            aiText = (data.text || '').trim();
          }
        } else if (canUseLocalOllama) {
          const res = await fetch('/api/ollama/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              endpoint: aiSettings.ollama.endpoint,
              model: aiSettings.ollama.model,
              messages: [{ role: 'user', content: promptText }],
              stream: false,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            aiText = (data.text || '').trim();
          }
        }

        if (aiText) {
          onInputChange(currentChapter, section.key, aiText);
          setCoPilotNotification('✨ 3-Tier AI가 도메인 규칙 제약을 반영해 명세를 정제했습니다.');
          setTimeout(() => setCoPilotNotification(null), 3000);
          return;
        }
      } catch {
        // Fallback seamlessly to local deterministic refinement
      } finally {
        setIsRefining(false);
      }
    }

    const refined = buildDeterministicRefinement(raw);
    onInputChange(currentChapter, section.key, refined);
    setCoPilotNotification('✨ 전문 엔지니어링 명세 어조로 정제되었습니다.');
    setTimeout(() => setCoPilotNotification(null), 3000);
  };

  // 2. Undo Refine
  const handleUndoRefine = () => {
    if (isChapterLocked) return;
    if (previousValueBeforeRefine !== null) {
      onInputChange(currentChapter, section.key, previousValueBeforeRefine);
      setPreviousValueBeforeRefine(null);
      setCoPilotNotification('정제 전 원래 원고로 되돌렸습니다.');
      setTimeout(() => setCoPilotNotification(null), 2500);
    }
  };

  // Render chapter-specific interactive widgets unified in the single canvas
  const renderChapterInteractiveWidget = () => {
    switch (currentChapter) {
      case 1: {
        return (
          <div className="bg-[#F7F8FA] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <Compass size={15} className="text-[#1E3A8A]" />
              <span className="font-sans font-semibold">프로젝트 기본 정보 요약</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] px-4 py-3 rounded-lg">
                <span className="text-[11px] text-[#4B5563] block font-mono">서비스 명칭</span>
                <span className="font-sans font-semibold text-[#111827] text-sm mt-1 block truncate">
                  {plan.metadata?.projectName || '새 프로젝트'}
                </span>
              </div>
              <div className="bg-[#FFFFFF] px-4 py-3 rounded-lg">
                <span className="text-[11px] text-[#4B5563] block font-mono">플랫폼 대상</span>
                <span className="font-sans font-medium text-[#111827] text-sm mt-1 block">
                  {plan.metadata?.platform === 'APP' ? '모바일 웹 (PWA App)' : '웹 애플리케이션 (Web)'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="bg-[#F7F8FA] rounded-xl p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <BookOpen size={15} className="text-[#1E3A8A]" />
              <span className="font-sans font-semibold">타깃 사용자 및 결핍 정의 요약</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-[1.7]">
              작성하신 페르소나와 결핍 사항은 <code className="text-[#1E3A8A] font-mono bg-[#EFF6FF] px-1.5 py-0.5 rounded">docs/01_proposal.md</code>의 <strong className="text-[#111827]">문제 정의(Problem Statement)</strong>와 <strong className="text-[#111827]">가치 제안(Value Proposition)</strong>에 구조화되어 자동 반영됩니다.
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
        // Chapter 4: Dedicated Visual Schema Bridge (Translates domain terms to Spreadsheet & TypeScript Schema)
        return (
          <VisualSchemaBridgeWidget
            rawInput={currentValue}
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
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
          <div className="bg-[#F7F8FA] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A]">
              <Shield size={15} className="text-[#1E3A8A]" />
              <span className="font-sans font-semibold">로컬 퍼스트 & 아키텍처 규칙</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFFFFF] px-4 py-3 rounded-lg">
                <span className="font-sans font-semibold text-sm text-[#111827] block">IndexedDB 로컬 스토리지</span>
                <span className="text-xs text-[#4B5563] mt-1 block">외부 클라우드 전송 없이 브라우저 내 안전 보관</span>
              </div>
              <div className="bg-[#FFFFFF] px-4 py-3 rounded-lg">
                <span className="font-sans font-semibold text-sm text-[#111827] block">단일 파일 완결성</span>
                <span className="text-xs text-[#4B5563] mt-1 block">규약에 따른 무설치 단일 파일 보장</span>
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
        className="flex-1 min-w-0 w-full h-full flex flex-col bg-[#FFFFFF] overflow-y-auto selection:bg-[#EFF6FF] selection:text-[#1E3A8A]"
        aria-label="산출물 사출 허브"
      >
        {/* Top Breadcrumb Bar */}
        <div className="h-12 px-6 sm:px-8 border-b border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#4B5563] min-w-0 truncate">
            <span className="font-mono text-[#1E3A8A] font-semibold shrink-0">CHAPTER 08</span>
            <span className="text-[#D1D5DB] shrink-0">·</span>
            <span className="text-[#111827] font-medium font-sans truncate">산출물 허브 및 배포</span>
            <span className="text-[#D1D5DB] shrink-0">·</span>
            <span className="text-[#1E3A8A] font-mono font-medium shrink-0">11종 사양서 번들</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTogglePreviewCollapse && (
              <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'} position="bottom">
                <button
                  onClick={onTogglePreviewCollapse}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                    isPreviewCollapsed
                      ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                      : 'bg-transparent text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9]'
                  }`}
                  aria-label={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'}
                >
                  {isPreviewCollapsed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Chapter 8 Canvas Body - Smooth width expansion in 2-Track Focus Mode */}
        <div className={`flex-1 w-full mx-auto px-6 sm:px-10 py-8 sm:py-10 flex flex-col transition-all duration-300 ease-in-out ${
          isPreviewCollapsed ? 'max-w-5xl' : 'max-w-3xl'
        }`}>
          <PromptExtractionHub
            formInputs={formInputs}
            onBack={() => onNavigateSection('prev')}
            onSave={() => {}}
            largeTextMode={largeTextMode}
            lockedChapters={lockedChapters}
            updatedChapters={updatedChapters}
          />
        </div>
      </section>
    );
  }

  // Chapters 1 to 7: Single Unified Canvas
  return (
    <section 
      className="flex-1 min-w-0 w-full h-full flex flex-col bg-[#FFFFFF] overflow-y-auto selection:bg-[#EFF6FF] selection:text-[#1E3A8A]"
      aria-label="집필 캔버스"
    >
      {/* Canvas Top Bar: Minimalist Breadcrumb */}
      <div className="h-12 px-6 sm:px-8 border-b border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-between shrink-0 gap-3">
        <div className={`flex items-center gap-2 text-[#4B5563] truncate min-w-0 ${
          largeTextMode ? 'text-base' : 'text-xs sm:text-sm'
        }`}>
          <span className="font-mono text-[#1E3A8A] font-semibold text-xs shrink-0 tracking-wider">CHAPTER 0{chapter.id}</span>
          <span className="text-[#D1D5DB] shrink-0 select-none">/</span>
          <span className="text-[#111827] font-sans font-medium truncate">{chapter.title}</span>
          <span className="text-[#D1D5DB] shrink-0 select-none">·</span>
          <span className="text-[#4B5563] truncate">{section.title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isChapterLocked && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E3A8A] text-white text-[11px] font-medium whitespace-nowrap">
              <Lock size={11} className="shrink-0" />
              <span>Locked · AI Protected</span>
            </span>
          )}

          {onToggleChapterLock && (
            <button
              type="button"
              onClick={() => onToggleChapterLock(currentChapter)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isChapterLocked
                  ? 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE]'
                  : 'bg-[#F7F8FA] text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#EFF6FF]'
              }`}
              title={isChapterLocked ? '챕터 잠금 해제 (편집 허용)' : '챕터 사양 잠금 (AI context drift 및 실수 수정 방지)'}
              aria-label={isChapterLocked ? 'Unlock Chapter Spec' : 'Lock Chapter Spec'}
            >
              {isChapterLocked ? (
                <>
                  <Unlock size={12} />
                  <span>Unlock</span>
                </>
              ) : (
                <>
                  <Lock size={12} />
                  <span>Lock Spec</span>
                </>
              )}
            </button>
          )}

          {onTogglePreviewCollapse && (
            <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'} position="bottom">
              <button
                onClick={onTogglePreviewCollapse}
                className={`h-7 w-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isPreviewCollapsed
                    ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'bg-transparent text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9]'
                }`}
                aria-label={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'}
              >
                {isPreviewCollapsed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Main Unified Canvas Body */}
      <div className={`flex-1 w-full mx-auto px-8 sm:px-10 py-10 flex flex-col space-y-10 transition-all duration-300 ease-in-out ${
        isPreviewCollapsed ? 'max-w-4xl' : 'max-w-3xl'
      }`}>
        {/* Editorial Heading */}
        <div className="space-y-2.5 border-b border-[#E5E7EB] pb-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-[#4B5563]">
              <span className="font-mono text-[#1E3A8A] font-semibold">
                0{currentSectionIdx + 1}.
              </span>
              <span className={`uppercase tracking-wider font-mono text-[#4B5563] ${largeTextMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
                {chapter.engTitle}
              </span>
            </div>

            {isChapterLocked && (
              <span className="inline-flex sm:hidden items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E3A8A] text-white text-[11px] font-medium whitespace-nowrap">
                <Lock size={10} className="shrink-0" />
                <span>Locked · AI Protected</span>
              </span>
            )}
          </div>
          <h1 className={`font-sans font-bold text-[#111827] tracking-[-0.025em] leading-[1.3] ${
            largeTextMode ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-[28px]'
          }`} style={{ textWrap: 'balance' }}>
            {section.title}
          </h1>
          <p className={`leading-[1.7] font-sans ${
            largeTextMode ? 'text-lg sm:text-xl text-[#4B5563]' : 'text-[15px] text-[#4B5563]'
          }`}>
            {section.question}
          </p>
        </div>

        {/* 1. Natural Language Writing Area — Direct Fine White Paper (or Calm #F7F8FA Read-Only Surface when Locked) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className={`font-sans font-semibold text-[#111827] tracking-[-0.015em] ${largeTextMode ? 'text-xl' : 'text-[18px]'}`}>
                Thinking Canvas
              </h2>
              <span className="font-mono text-xs tabular-nums text-[#9CA3AF]">
                {currentValue.length}자
              </span>
              {isChapterLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E3A8A] bg-[#EFF6FF] px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Lock size={10} />
                  <span>Locked · AI Protected</span>
                </span>
              )}
            </div>

            {/* Inline AI Co-pilot Action */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleInlineRefine}
                disabled={isRefining || isChapterLocked}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isChapterLocked
                    ? 'bg-[#F7F8FA] text-[#9CA3AF] cursor-not-allowed'
                    : 'bg-[#F7F8FA] hover:bg-[#EFF6FF] disabled:opacity-50 text-[#111827] hover:text-[#1E3A8A] cursor-pointer'
                }`}
                title={isChapterLocked ? '잠금 상태에서는 AI 자동 정제가 비활성화됩니다' : '일상 구어체 서술을 명확한 엔지니어링 개발 요구사항 문장으로 정제'}
              >
                <Sparkles size={12} className={`${isChapterLocked ? 'text-[#9CA3AF]' : 'text-[#1E3A8A]'} ${isRefining ? 'animate-spin' : ''}`} />
                <span>{isRefining ? '정제 중...' : 'AI 정제'}</span>
              </button>

              {previousValueBeforeRefine !== null && !isChapterLocked && (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                  title="정제 전 원고로 복원"
                >
                  <Undo2 size={11} />
                  <span>되돌리기</span>
                </button>
              )}
            </div>
          </div>

          {/* Co-pilot Feedback Notification */}
          {coPilotNotification && (
            <div className="px-4 py-2.5 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] text-xs font-medium flex items-center gap-2">
              <Check size={13} className="stroke-[2.5] shrink-0" />
              <span>{coPilotNotification}</span>
            </div>
          )}

          {/* Direct-on-Paper Tiptap v3 Writing Canvas */}
          <div className={`relative flex flex-col transition-all duration-200 ${
            isChapterLocked
              ? 'bg-[#F7F8FA] rounded-xl px-5 py-4 border border-[#E5E7EB]/80'
              : 'bg-[#FFFFFF]'
          }`}>
            <TiptapThinkingCanvas
              value={currentValue}
              onChange={(newText) => onInputChange(currentChapter, section.key, newText)}
              placeholder={section.placeholder}
              largeTextMode={largeTextMode}
              readOnly={isChapterLocked}
            />
          </div>

          <p className="text-xs text-[#9CA3AF]">
            {isChapterLocked
              ? '이 챕터는 잠금 상태입니다. AI 컨텍스트 불변 제약으로 보호되며 상단 Unlock 버튼을 누르면 다시 편집할 수 있습니다.'
              : '생각나는 내용을 한 줄 또는 문장으로 서술해 주세요. 우측 화면에 실시간으로 반영됩니다.'}
          </p>
        </div>

        {/* 2. Domain Rules & Constraints Builder (When - Then - Except When) */}
        <DomainRulesSection
          rules={currentBusinessRules}
          onChange={(updatedRules) => {
            onBusinessRulesChange?.(currentChapter, section.key, updatedRules);
          }}
          largeTextMode={largeTextMode}
          isParentLocked={isChapterLocked}
        />

        {/* 3. Unified Chapter Interactive Widget Section */}
        <div
          aria-disabled={isChapterLocked}
          className={isChapterLocked ? 'pointer-events-none opacity-80 select-none' : undefined}
        >
          {renderChapterInteractiveWidget()}
        </div>

        {/* Bottom Actions Bar */}
        <div className="pt-5 pb-4 border-t border-[#E5E7EB] flex items-center justify-between gap-3 flex-nowrap">
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2 rounded-lg border font-medium transition-colors whitespace-nowrap ${
              largeTextMode ? 'px-5 py-2.5 min-h-[44px] text-sm sm:text-base' : 'px-4 py-2 min-h-[38px] text-xs sm:text-sm'
            } ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed bg-transparent border-[#E5E7EB] text-[#9CA3AF]'
                : 'border-[#E5E7EB] bg-[#FFFFFF] hover:bg-[#F7F8FA] text-[#4B5563] hover:text-[#111827] cursor-pointer'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono tabular-nums text-[#4B5563]">
            <span className="text-[#111827] font-semibold">제 {chapter.id}장</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className={`flex items-center gap-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white font-medium transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
              largeTextMode ? 'px-6 py-2.5 min-h-[44px] text-sm sm:text-base' : 'px-5 py-2 min-h-[38px] text-xs sm:text-sm'
            }`}
          >
            <span>{isLastSection ? '청사진 배포 허브' : '다음 단계로 전진'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white/15 text-white">
              ⌘ + ↵
            </kbd>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
