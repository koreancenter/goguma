import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, ArrowLeft,
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
      case 1:
      case 2: {
        return null;
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

      case 7:
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
        {/* Chapter 8 Canvas Body - Generous airy padding */}
        <div className={`flex-1 w-full mx-auto px-8 sm:px-12 py-12 flex flex-col transition-all duration-300 ease-in-out ${
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

  // Chapters 1 to 7: Single Airy Minimalist Editorial Canvas
  return (
    <section 
      className="flex-1 min-w-0 w-full h-full flex flex-col bg-[#FFFFFF] overflow-y-auto selection:bg-[#EFF6FF] selection:text-[#1E3A8A]"
      aria-label="집필 캔버스"
    >
      {/* Main Unified Canvas Body */}
      <div className={`flex-1 w-full mx-auto px-8 sm:px-12 pt-12 pb-16 flex flex-col space-y-10 transition-all duration-300 ease-in-out ${
        isPreviewCollapsed ? 'max-w-4xl' : 'max-w-3xl'
      }`}>
        {/* Crisp Editorial Title Only (Generous top/bottom padding, zero breadcrumb or subtitle clutter) */}
        <div className="pt-2 pb-6 border-b border-[#E5E7EB]/70 flex items-start justify-between gap-4">
          <h1 className={`font-sans font-semibold text-[#111827] tracking-[-0.025em] leading-[1.3] ${
            largeTextMode ? 'text-4xl sm:text-5xl' : 'text-[32px]'
          }`} style={{ textWrap: 'balance' }}>
            {section.title}
          </h1>

          <div className="flex items-center gap-2 shrink-0 pt-1.5">
            {isChapterLocked && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1E3A8A] text-[11px] font-medium whitespace-nowrap">
                <Lock size={11} className="shrink-0" />
                <span>Locked · AI Protected</span>
              </span>
            )}

            {onToggleChapterLock && (
              <button
                type="button"
                onClick={() => onToggleChapterLock(currentChapter)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isChapterLocked
                    ? 'text-[#1E3A8A] hover:bg-[#EFF6FF]'
                    : 'text-[#6B7280] hover:text-[#1E3A8A] hover:bg-[#F7F8FA]'
                }`}
                title={isChapterLocked ? '챕터 잠금 해제 (편집 허용)' : '챕터 사양 잠금 (AI context drift 방지)'}
                aria-label={isChapterLocked ? 'Unlock Chapter Spec' : 'Lock Chapter Spec'}
              >
                {isChapterLocked ? (
                  <>
                    <Unlock size={13} />
                    <span>Unlock</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Lock Spec</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* 1. Natural Language Writing Area — Direct Fine White Paper */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className={`font-sans font-semibold text-[#111827] tracking-[-0.015em] ${largeTextMode ? 'text-xl' : 'text-[18px]'}`}>
                Thinking Canvas
              </h2>
              <span className="font-sans text-xs tabular-nums text-[#9CA3AF]">
                {currentValue.length}자
              </span>
            </div>

            {/* Lightweight Borderless Ghost AI Co-pilot Action */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInlineRefine}
                disabled={isRefining || isChapterLocked}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  isChapterLocked
                    ? 'text-[#9CA3AF] cursor-not-allowed'
                    : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#F7F8FA] disabled:opacity-50 cursor-pointer'
                }`}
                title={isChapterLocked ? '잠금 상태에서는 AI 초안 작성이 비활성화됩니다' : '일상 서술을 명확한 엔지니어링 요구사항 문장으로 다듬기'}
              >
                <Sparkles size={13} className={`${isChapterLocked ? 'text-[#9CA3AF]' : 'text-[#1E3A8A]'} ${isRefining ? 'animate-spin' : ''}`} />
                <span>{isRefining ? '생성 중...' : 'AI 초안'}</span>
              </button>

              {previousValueBeforeRefine !== null && !isChapterLocked && (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-sans font-medium text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors cursor-pointer whitespace-nowrap"
                  title="이전 원고로 되돌리기"
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

        {/* 3. Unified Chapter Interactive Widget Section (Chapters 3-6) */}
        {renderChapterInteractiveWidget() && (
          <div
            aria-disabled={isChapterLocked}
            className={isChapterLocked ? 'pointer-events-none opacity-80 select-none' : undefined}
          >
            {renderChapterInteractiveWidget()}
          </div>
        )}

        {/* Bottom Actions Bar — Lightweight Borderless Ghost Buttons */}
        <div className="pt-6 border-t border-[#E5E7EB]/70 flex items-center justify-between gap-3 flex-nowrap">
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed text-[#9CA3AF]'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] cursor-pointer'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs font-sans tabular-nums text-[#9CA3AF]">
            <span>{chapter.id}장</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{isLastSection ? '배포 허브' : '다음 단계'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
