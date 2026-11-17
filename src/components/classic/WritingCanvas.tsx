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
        className="flex-1 min-w-0 w-full h-full flex flex-col bg-[#FFFFFF] overflow-y-auto selection:bg-[#111111] selection:text-[#FFFFFF]"
        aria-label="산출물 사출 허브"
      >
        <div className="flex-1 w-full mx-auto px-8 sm:px-14 py-14 flex flex-col max-w-3xl">
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

  // Chapters 1 to 7: Sejong Monograph Editorial Writing Canvas
  return (
    <section 
      className="flex-1 min-w-0 w-full h-full flex flex-col bg-[#FFFFFF] overflow-y-auto selection:bg-[#111111] selection:text-[#FFFFFF]"
      aria-label="집필 캔버스"
    >
      <div className="flex-1 w-full mx-auto px-8 sm:px-14 pt-12 pb-20 flex flex-col space-y-12 max-w-3xl">
        {/* Monograph Chapter Kicker + Serif Editorial Title */}
        <header className="pt-2 pb-7 border-b border-[#111111]/20 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-sans font-medium uppercase tracking-[0.18em] text-[#8C8B85] tabular-nums">
              Chapter 0{chapter.id} · {chapter.engTitle}
            </span>

            <div className="flex items-center gap-3 shrink-0">
              {isChapterLocked && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8B261D] whitespace-nowrap">
                  <Lock size={11} className="shrink-0" />
                  <span>Locked · AI Protected</span>
                </span>
              )}

              {onToggleChapterLock && (
                <button
                  type="button"
                  onClick={() => onToggleChapterLock(currentChapter)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                    isChapterLocked
                      ? 'border-[#111111] bg-[#111111] text-[#FFFFFF]'
                      : 'border-[#E4E2DC] text-[#52524E] hover:text-[#111111] hover:border-[#111111]'
                  }`}
                  title={isChapterLocked ? '챕터 잠금 해제 (편집 허용)' : '챕터 사양 잠금 (AI context drift 방지)'}
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
            </div>
          </div>

          <h1
            className={`font-display font-bold text-[#111111] tracking-[-0.03em] leading-[1.18] ${
              largeTextMode ? 'text-4xl sm:text-5xl' : 'text-[34px] sm:text-[38px]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            {section.title}
          </h1>
        </header>

        {/* 01. Natural Language Writing Area — Direct Fine Paper */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-[11px] font-sans tabular-nums text-[#8C8B85] tracking-[0.12em]">
                01
              </span>
              <h2 className={`font-sans font-semibold text-[#111111] tracking-[-0.015em] ${largeTextMode ? 'text-xl' : 'text-[17px]'}`}>
                Thinking Canvas
              </h2>
              <span className="font-sans text-xs tabular-nums text-[#8C8B85]">
                {currentValue.length}자
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInlineRefine}
                disabled={isRefining || isChapterLocked}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-xs font-medium transition-colors whitespace-nowrap ${
                  isChapterLocked
                    ? 'text-[#8C8B85] cursor-not-allowed'
                    : 'text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1] disabled:opacity-50 cursor-pointer'
                }`}
                title={isChapterLocked ? '잠금 상태에서는 AI 초안 작성이 비활성화됩니다' : '일상 서술을 명확한 엔지니어링 요구사항 문장으로 다듬기'}
              >
                <Sparkles size={13} className={`${isChapterLocked ? 'text-[#8C8B85]' : 'text-[#111111]'} ${isRefining ? 'animate-spin' : ''}`} />
                <span>{isRefining ? '생성 중...' : 'AI 초안'}</span>
              </button>

              {previousValueBeforeRefine !== null && !isChapterLocked && (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[2px] text-[11px] font-sans font-medium text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1] transition-colors cursor-pointer whitespace-nowrap"
                  title="이전 원고로 되돌리기"
                >
                  <Undo2 size={11} />
                  <span>되돌리기</span>
                </button>
              )}
            </div>
          </div>

          {coPilotNotification && (
            <div className="px-4 py-2.5 rounded-[2px] bg-[#F6F5F1] border border-[#CBC8BF] text-[#111111] text-xs font-medium flex items-center gap-2">
              <Check size={13} className="stroke-[2.5] shrink-0" />
              <span>{coPilotNotification}</span>
            </div>
          )}

          <div className={`relative flex flex-col transition-colors duration-200 ${
            isChapterLocked
              ? 'bg-[#F6F5F1] rounded-[2px] px-5 py-4 border border-[#E4E2DC]'
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

        {/* 02. Domain Rules & Constraints Builder */}
        <div className="pt-8 border-t border-[#E4E2DC]">
          <DomainRulesSection
            rules={currentBusinessRules}
            onChange={(updatedRules) => {
              onBusinessRulesChange?.(currentChapter, section.key, updatedRules);
            }}
            largeTextMode={largeTextMode}
            isParentLocked={isChapterLocked}
          />
        </div>

        {/* 03. Unified Chapter Interactive Widget Section (Chapters 3-6) */}
        {renderChapterInteractiveWidget() && (
          <div
            aria-disabled={isChapterLocked}
            className={`pt-8 border-t border-[#E4E2DC] ${isChapterLocked ? 'pointer-events-none opacity-80 select-none' : ''}`}
          >
            {renderChapterInteractiveWidget()}
          </div>
        )}

        {/* Bottom Editorial Pagination */}
        <div className="pt-8 border-t border-[#111111]/20 flex items-center justify-between gap-3 flex-nowrap">
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2 rounded-[2px] px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed text-[#8C8B85]'
                : 'text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1] cursor-pointer'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-sans tabular-nums tracking-[0.12em] uppercase text-[#8C8B85]">
            <span>0{chapter.id} / 08</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-2 rounded-[2px] px-4 py-2 text-xs font-medium bg-[#111111] hover:bg-[#2A2A28] text-[#FFFFFF] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{isLastSection ? '배포 허브' : '다음 단계'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
