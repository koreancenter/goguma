import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowRight, ArrowLeft,
  Undo2, Check, Lock, Unlock
} from 'lucide-react';
import { getChapters, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity, DomainBusinessRule, SectionAttachment, SitePlan } from '../../types';
import { getAISettings } from '../../lib/aiConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  buildChapterAIContext,
  serializeSectionBusinessRulesToMarkdown,
} from '../../lib/businessRulesSerializer';
import {
  normalizeAttachments,
  stripHtmlToPlainText,
  markdownOrTextToHtml,
} from '../../lib/documentAttachmentParser';
import PromptExtractionHub from './PromptExtractionHub';
import { ApplicationTypeInteractiveWidget } from './ApplicationTypeInteractiveWidget';
import { FeatureMappingInteractiveWidget } from './FeatureMappingInteractiveWidget';
import { DesignSystemInteractiveWidget } from './DesignSystemInteractiveWidget';
import { NavigationArchitectureInteractiveWidget } from './NavigationArchitectureInteractiveWidget';
import { VisualSchemaBridgeWidget } from './VisualSchemaBridgeWidget';
import { RoadmapInteractiveWidget } from './RoadmapInteractiveWidget';
import { TiptapThinkingCanvas } from './TiptapThinkingCanvas';

export interface WritingCanvasProps {
  currentChapter: number;
  currentSection: string;
  formInputs: Record<string, FormInputEntity>;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  onBusinessRulesChange?: (chapterId: number, sectionKey: string, rules: DomainBusinessRule[]) => void;
  onAttachmentsChange?: (chapterId: number, sectionKey: string, attachments: SectionAttachment[]) => void;
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
  onAttachmentsChange,
  onNavigateSection,
  plan,
  setPlan,
  largeTextMode = false,
  lockedChapters = [],
  updatedChapters,
  onToggleChapterLock,
}) => {
  const { language, pick } = useLanguage();
  const chapters = getChapters(language);
  const chapter: ChapterDef = chapters.find(c => c.id === currentChapter) || chapters[0];
  const scrollContainerRef = useRef<HTMLElement>(null);

  const isChapterLocked = Boolean(
    lockedChapters.includes(currentChapter) ||
      chapter.sections.some(sec => formInputs[`${currentChapter}_${sec.key}`]?.isLocked)
  );

  // Per-section Inline AI Co-pilot State
  const [previousValuesBySection, setPreviousValuesBySection] = useState<Record<string, string | null>>({});
  const [notificationsBySection, setNotificationsBySection] = useState<Record<string, string | null>>({});
  const [refiningBySection, setRefiningBySection] = useState<Record<string, boolean>>({});

  // Reset per-section refine state and scroll to top when switching chapters
  useEffect(() => {
    setPreviousValuesBySection({});
    setNotificationsBySection({});
    setRefiningBySection({});
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentChapter]);

  // Smoothly scroll to a specific section if navigated via D3 diagram / preview panel
  useEffect(() => {
    if (!currentSection || currentSection === chapter.sections[0]?.key) return;
    const target = document.getElementById(`spec-section-${currentChapter}-${currentSection}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentChapter, currentSection, chapter.sections]);

  const isFirstChapter = currentChapter === 1;
  const isNextReleaseHub = currentChapter === chapters.length - 1;

  // 1. Inline AI Refinement: synthesizes editor text + attached documents + domain rules into crisp spec prose
  const buildDeterministicRefinement = (
    targetSection: SectionDef,
    rawPlain: string,
    attachments: SectionAttachment[]
  ): string => {
    const rulesMarkdown = serializeSectionBusinessRulesToMarkdown(currentChapter, targetSection.key, formInputs);
    const lines: string[] = [];

    if (rawPlain) {
      if (currentChapter === 1 && targetSection.key === 'project_name') {
        lines.push(`서비스 공식 명칭: ${rawPlain} (시스템 식별자: ${rawPlain.replace(/\s+/g, '-').toLowerCase()})`);
      } else if (
        currentChapter === 1 &&
        (targetSection.key === 'target_user' ||
          targetSection.key === 'primary_goal' ||
          targetSection.key === 'problem_background')
      ) {
        lines.push(`## 핵심 정의`);
        lines.push(`- **핵심 내용**: ${rawPlain}`);
        lines.push(`- **충족 가치**: 직관적인 실시간 데이터 매핑 및 무설치 로컬 퍼스트 사용자 경험 제공`);
        lines.push(`- **성공 지표**: 업무 소요 시간 단축 및 데이터 입력 오류 0건 달성`);
      } else if (currentChapter === 4) {
        const tokens = rawPlain.split(/[,;\n/·]+/).map(t => t.trim()).filter(Boolean);
        lines.push(`## 데이터 구조 요구사항`);
        tokens.forEach((t, i) => {
          lines.push(`${i + 1}. **${t}**: 필수 입력값 유효성 검증 및 스키마 1:1 매핑`);
        });
      } else if (currentChapter === 3) {
        lines.push(`## 기능 상세 명세`);
        lines.push(`- **핵심 기능**: ${rawPlain}`);
        lines.push(`- **실행 주체**: 인증된 시스템 사용자`);
        lines.push(`- **사전 조건**: 필수 항목 유효성 검증 통과`);
        lines.push(`- **사후 결과**: 로컬 IndexedDB 즉시 반영 및 상태 동기화`);
      } else if (currentChapter === 8) {
        lines.push(`## 빅테크 표준 제품/엔지니어링 로드맵 (${targetSection.title})`);
        lines.push(`- **단계별 실행 기준**: ${rawPlain}`);
        lines.push(`- **스코프 분류**: P0 (Must-Ship Blocker) / P1 (Fast-Follow) / P2 (Backlog)`);
        lines.push(`- **출시 승인 게이트 (LRR)**: 5xx < 0.1%, Core Web Vitals LCP < 1.8s, Feature Flag 카나리 롤백 < 60s`);
      } else {
        lines.push(`## 공식 규격 명세`);
        lines.push(`- **핵심 내용**: ${rawPlain}`);
        lines.push(`- **기술 규약**: 100% 무설치 로컬 퍼스트 아키텍처 준수`);
        lines.push(`- **무결성 원칙**: 즉각 반응 및 브라우저 IndexedDB 영구 보존`);
      }
    }

    if (attachments.length > 0) {
      lines.push(`## 첨부 문서 기반 정제 명세 (${targetSection.title})`);
      for (const att of attachments) {
        const extractedLines = (att.extractedText || '')
          .split(/\r?\n/)
          .map(l => l.replace(/^#+\s*/, '').trim())
          .filter(l => l.length > 0 && !/^\[(Page|Slide|Sheet)\s+\d+\]$/i.test(l));

        lines.push(`### ${att.name} (${att.extension})`);
        if (extractedLines.length > 0) {
          const highlights = extractedLines.slice(0, 12);
          highlights.forEach(item => {
            const cleanItem = item.replace(/^[-*•]\s+/, '');
            lines.push(`- ${cleanItem}`);
          });
          if (extractedLines.length > 12) {
            lines.push(`- 외 ${extractedLines.length - 12}개 세부 항목 문서 참조`);
          }
        } else {
          lines.push(`- 첨부 문서(${att.name})가 참조 사양으로 연결되었습니다. 텍스트 추출 가능한 원고나 Gemini API 연동 시 본문 전체가 자동 정제됩니다.`);
        }
      }
    }

    if (rulesMarkdown && !lines.join('\n').includes('WHEN:')) {
      lines.push(`## 적용된 도메인 제약 요약`);
      lines.push(rulesMarkdown);
    }

    return lines.join('\n\n');
  };

  const setSectionNotification = (sectionKey: string, message: string, durationMs = 3200) => {
    setNotificationsBySection(prev => ({ ...prev, [sectionKey]: message }));
    setTimeout(() => {
      setNotificationsBySection(prev => (prev[sectionKey] === message ? { ...prev, [sectionKey]: null } : prev));
    }, durationMs);
  };

  const handleInlineRefine = async (targetSection: SectionDef) => {
    if (isChapterLocked) return;
    const secKey = `${currentChapter}_${targetSection.key}`;
    const secValue = formInputs[secKey]?.userRawInput || '';
    const secAttachments = normalizeAttachments(formInputs[secKey]?.attachments);
    const rawPlain = stripHtmlToPlainText(secValue);
    const hasAttachments = secAttachments.length > 0;

    if (!rawPlain && !hasAttachments) {
      const defaultStarter =
        targetSection.placeholder ||
        pick({
          ko: `${targetSection.title}에 대한 요구사항 명세`,
          en: `Requirements specification for ${targetSection.title}`,
          ja: `${targetSection.title}に関する要件定義`,
          id: `Spesifikasi kebutuhan untuk ${targetSection.title}`,
        });
      onInputChange(
        currentChapter,
        targetSection.key,
        markdownOrTextToHtml(
          `${pick({ ko: '[요구사항 정의]', en: '[Requirements]', ja: '[要件定義]', id: '[Kebutuhan]' })} ${defaultStarter}`
        )
      );
      return;
    }

    setPreviousValuesBySection(prev => ({ ...prev, [targetSection.key]: secValue }));

    const chapterContext = buildChapterAIContext(
      currentChapter,
      targetSection.key,
      formInputs,
      plan.metadata?.projectName,
      lockedChapters
    );
    const aiSettings = getAISettings();
    const canUseRemoteGemini = aiSettings.provider === 'gemini';
    const canUseLocalOllama = aiSettings.provider === 'ollama';

    if (canUseRemoteGemini || canUseLocalOllama) {
      setRefiningBySection(prev => ({ ...prev, [targetSection.key]: true }));
      try {
        const promptText = [
          `You are refining a software engineering PRD section ("${targetSection.title}").`,
          'Synthesize both the user narrative draft and ALL Attached Reference Documents below into one clean, structured, unambiguous Korean engineering specification.',
          'Strictly enforce all Domain Rules & Constraints below.',
          'Output clean Korean Markdown using headings (##, ###) and bullet lists (- ) without extra conversational preamble.',
          '',
          chapterContext,
        ].join('\n');

        let aiText = '';

        if (canUseRemoteGemini) {
          const pdfParts = secAttachments
            .filter(att => att.base64Pdf && (!att.extractedText || att.extractedText.trim().length < 200))
            .slice(0, 2)
            .map(att => ({
              inlineData: {
                mimeType: 'application/pdf',
                data: att.base64Pdf as string,
              },
            }));

          const contentsPayload =
            pdfParts.length > 0
              ? { parts: [...pdfParts, { text: promptText }] }
              : promptText;

          const modelName =
            !aiSettings.gemini.model || aiSettings.gemini.model === 'gemini-3.8-flash'
              ? 'gemini-4-hydrogen'
              : aiSettings.gemini.model;

          const res = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: modelName,
              contents: contentsPayload,
              apiKey: aiSettings.gemini.apiKey?.trim() || undefined,
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
          onInputChange(currentChapter, targetSection.key, markdownOrTextToHtml(aiText));
          setSectionNotification(
            targetSection.key,
            hasAttachments
              ? pick({
                  ko: 'AI가 첨부 문서와 원고 내용을 통합해 명세를 정제했습니다.',
                  en: 'AI refined the specification combining your draft and attached documents.',
                  ja: 'AIが添付資料と下書きを統合して仕様書を精製しました。',
                  id: 'AI menyempurnakan spesifikasi dengan menggabungkan draf dan dokumen terlampir.',
                })
              : pick({
                  ko: 'AI가 도메인 규칙 제약을 반영해 명세를 정제했습니다.',
                  en: 'AI refined the specification with domain rule constraints.',
                  ja: 'AIがドメインルール制約を反映して仕様書を精製しました。',
                  id: 'AI menyempurnakan spesifikasi berdasarkan aturan domain.',
                })
          );
          return;
        }
      } catch {
        // Fallback seamlessly to local deterministic refinement
      } finally {
        setRefiningBySection(prev => ({ ...prev, [targetSection.key]: false }));
      }
    }

    const refined = buildDeterministicRefinement(targetSection, rawPlain, secAttachments);
    onInputChange(currentChapter, targetSection.key, markdownOrTextToHtml(refined));
    setSectionNotification(
      targetSection.key,
      hasAttachments
        ? pick({
            ko: '첨부 문서의 핵심 내용을 포함해 전문 명세 어조로 정제되었습니다.',
            en: 'Refined into engineering spec prose including attached documents.',
            ja: '添付資料の要点を含めて技術仕様書トーンに整理されました。',
            id: 'Disempurnakan ke gaya spesifikasi teknis termasuk dokumen terlampir.',
          })
        : pick({
            ko: '전문 엔지니어링 명세 어조로 정제되었습니다.',
            en: 'Refined into clean engineering specification prose.',
            ja: '技術仕様書フォーマットに整理されました。',
            id: 'Disempurnakan ke gaya spesifikasi teknis profesional.',
          })
    );
  };

  // 2. Undo Refine
  const handleUndoRefine = (targetSection: SectionDef) => {
    if (isChapterLocked) return;
    const prevValue = previousValuesBySection[targetSection.key];
    if (prevValue !== undefined && prevValue !== null) {
      onInputChange(currentChapter, targetSection.key, prevValue);
      setPreviousValuesBySection(prev => ({ ...prev, [targetSection.key]: null }));
      setSectionNotification(
        targetSection.key,
        pick({
          ko: '정제 전 원래 원고로 되돌렸습니다.',
          en: 'Reverted to your original draft.',
          ja: '整理前の元のテキストに戻しました。',
          id: 'Dikembalikan ke draf awal sebelum penyempurnaan.',
        }),
        2500
      );
    }
  };

  // Render chapter-specific interactive widgets unified in the single canvas
  const renderChapterInteractiveWidget = () => {
    switch (currentChapter) {
      case 1: {
        return (
          <ApplicationTypeInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      case 2: {
        return null;
      }

      case 3: {
        return (
          <FeatureMappingInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      case 4: {
        // Chapter 4: Dedicated Visual Schema Bridge (Translates domain terms to Spreadsheet & TypeScript Schema)
        return (
          <VisualSchemaBridgeWidget
            rawInput={formInputs['4_data_columns']?.userRawInput || ''}
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      case 5: {
        return (
          <DesignSystemInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      case 6: {
        return (
          <NavigationArchitectureInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      case 7:
        return null;

      case 8: {
        return (
          <RoadmapInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
            largeTextMode={largeTextMode}
          />
        );
      }

      default:
        return null;
    }
  };

  // Chapter 9 is the dedicated Master Artifacts & Vibe Coding Hub
  if (currentChapter === 9) {
    return (
      <section 
        ref={scrollContainerRef}
        className="flex-1 min-w-0 w-full h-full flex flex-col bg-[var(--theme-canvas)] overflow-y-auto selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)]"
        aria-label={pick({ ko: '산출물 사출 허브', en: 'Artifact Dispatch Hub', ja: '成果物出力ハブ', id: 'Hub Ekspor Artefak' })}
      >
        <div className="flex-1 w-full mx-auto px-6 sm:px-12 lg:px-14 pt-12 sm:pt-14 pb-24 flex flex-col max-w-4xl">
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

  const chapterWidget = renderChapterInteractiveWidget();

  // Chapters 1 to 8: Unified Single-Page Chapter Writing Canvas
  return (
    <section 
      ref={scrollContainerRef}
      className="flex-1 min-w-0 w-full h-full flex flex-col bg-[var(--theme-canvas)] overflow-y-auto selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)]"
      aria-label={pick({ ko: '집필 캔버스', en: 'Writing Canvas', ja: '執筆キャンバス', id: 'Kanvas Penulisan' })}
    >
      <div className="flex-1 w-full mx-auto px-6 sm:px-12 lg:px-14 pt-12 sm:pt-14 pb-24 flex flex-col space-y-14 sm:space-y-16 max-w-4xl">
        {/* Top Category Eyebrow Rule + Chapter Header */}
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.16em] text-[var(--theme-ink-secondary)] tabular-nums">
              CHAPTER 0{chapter.id} · {chapter.engTitle}
            </span>

            <div className="flex items-center gap-3 shrink-0">
              {isChapterLocked && (
                <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[var(--theme-danger)] whitespace-nowrap">
                  <Lock size={14} className="shrink-0" />
                  <span>{pick({ ko: '잠금 보호 중', en: 'Locked', ja: 'ロック保護中', id: 'Terkunci' })}</span>
                </span>
              )}

              {onToggleChapterLock && (
                <button
                  type="button"
                  onClick={() => onToggleChapterLock(currentChapter)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-[15px] sm:text-[16px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                    isChapterLocked
                      ? 'border-[var(--theme-ink-strong)] bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)]'
                      : 'border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:border-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                  }`}
                  title={
                    isChapterLocked
                      ? pick({ ko: '챕터 잠금 해제 (편집 허용)', en: 'Unlock chapter to allow editing', ja: 'チャプターロック解除（編集許可）', id: 'Buka kunci bab untuk mengedit' })
                      : pick({ ko: '챕터 사양 잠금 (AI context drift 방지)', en: 'Lock chapter spec to prevent AI drift', ja: 'チャプター仕様をロック（AIドリフト防止）', id: 'Kunci spesifikasi bab untuk mencegah pergeseran AI' })
                  }
                  aria-label={isChapterLocked ? 'Unlock Chapter Spec' : 'Lock Chapter Spec'}
                >
                  {isChapterLocked ? (
                    <>
                      <Unlock size={15} />
                      <span>{pick({ ko: 'Unlock', en: 'Unlock', ja: '解除', id: 'Buka Kunci' })}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={15} />
                      <span>{pick({ ko: 'Lock Spec', en: 'Lock Spec', ja: 'ロック', id: 'Kunci' })}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <header className="border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-border-hairline)] pt-8 pb-8 sm:pt-10 sm:pb-10 space-y-3">
            <h1
              className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.03em] leading-tight ${
                largeTextMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
              }`}
              style={{ textWrap: 'balance' }}
            >
              {chapter.title}
            </h1>
            {chapter.description && (
              <p className={`text-[var(--theme-ink-secondary)] leading-relaxed ${largeTextMode ? 'text-[18px]' : 'text-[16px]'}`}>
                {chapter.description}
              </p>
            )}
          </header>
        </div>

        {/* All Sections of this Chapter Rendered Sequentially on One Page */}
        <div className="flex flex-col space-y-16">
          {chapter.sections.map((sec, secIdx) => {
            const secKey = `${currentChapter}_${sec.key}`;
            const secValue = formInputs[secKey]?.userRawInput || '';
            const secAttachments = normalizeAttachments(formInputs[secKey]?.attachments);
            const isSecRefining = Boolean(refiningBySection[sec.key]);
            const prevSecValue = previousValuesBySection[sec.key] ?? null;
            const secNotification = notificationsBySection[sec.key] ?? null;

            return (
              <div
                key={secKey}
                id={`spec-section-${chapter.id}-${sec.key}`}
                className={`scroll-mt-8 space-y-10 ${
                  secIdx > 0 ? 'pt-14 border-t-2 border-t-[var(--theme-ink-strong)]' : ''
                }`}
              >
                {/* Section Writing Area */}
                <div className="space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[var(--theme-ink-strong)]">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-baseline gap-3.5">
                        <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em] shrink-0">
                          0{secIdx + 1}
                        </span>
                        <h2
                          className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] leading-snug ${
                            largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'
                          }`}
                        >
                          {sec.title}
                        </h2>
                      </div>
                      {sec.question && (
                        <p className={`text-[var(--theme-ink-secondary)] pl-9 ${largeTextMode ? 'text-[17px]' : 'text-[15px]'}`}>
                          {sec.question}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInlineRefine(sec)}
                        disabled={isSecRefining || isChapterLocked}
                        className={`inline-flex items-center justify-center px-5 py-2 rounded-none text-[16px] font-bold transition-colors whitespace-nowrap border ${
                          isChapterLocked
                            ? 'text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)] cursor-not-allowed'
                            : 'text-[var(--theme-ink-primary)] border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] disabled:opacity-50 cursor-pointer'
                        }`}
                        title={
                          isChapterLocked
                            ? pick({ ko: '잠금 상태에서는 AI 정제가 비활성화됩니다', en: 'AI Refine is disabled while locked', ja: 'ロック中はAI精製が無効です', id: 'Penyempurnaan AI dinonaktifkan saat terkunci' })
                            : pick({ ko: '에디터 원고와 첨부 문서를 명확한 엔지니어링 명세로 정제', en: 'Refine draft and attached docs into structured engineering spec', ja: 'テキストと添付資料を技術仕様書に精製', id: 'Sempurnakan draf dan dokumen terlampir menjadi spesifikasi teknis' })
                        }
                      >
                        <span>
                          {isSecRefining
                            ? pick({ ko: '정제 중...', en: 'Refining...', ja: '精製中...', id: 'Menyempurnakan...' })
                            : pick({ ko: 'AI 정제', en: 'AI Refine', ja: 'AI精製', id: 'Sempurnakan AI' })}
                        </span>
                      </button>

                      {prevSecValue !== null && !isChapterLocked && (
                        <button
                          type="button"
                          onClick={() => handleUndoRefine(sec)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-[16px] font-bold border border-[var(--theme-border-hairline)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)] transition-colors cursor-pointer whitespace-nowrap"
                          title={pick({ ko: '이전 원고로 되돌리기', en: 'Revert to previous draft', ja: '元の下書きに戻す', id: 'Kembalikan ke draf sebelumnya' })}
                        >
                          <Undo2 size={15} />
                          <span>{pick({ ko: '되돌리기', en: 'Undo', ja: '元に戻す', id: 'Urungkan' })}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {secNotification && (
                    <div className="px-5 py-3.5 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2.5">
                      <Check size={17} className="stroke-[2.5] shrink-0" />
                      <span>{secNotification}</span>
                    </div>
                  )}

                  <div
                    className={`relative flex flex-col transition-colors duration-200 ${
                      isChapterLocked
                        ? 'bg-[var(--theme-stage)] rounded-none px-6 py-5 border border-[var(--theme-border-hairline)]'
                        : 'bg-[var(--theme-canvas)]'
                    }`}
                  >
                    <TiptapThinkingCanvas
                      key={`${chapter.id}_${sec.key}`}
                      value={secValue}
                      onChange={(newText) => onInputChange(currentChapter, sec.key, newText)}
                      placeholder={sec.placeholder}
                      largeTextMode={largeTextMode}
                      readOnly={isChapterLocked}
                      attachments={secAttachments}
                      onAttachmentsChange={(nextAttachments) =>
                        onAttachmentsChange?.(currentChapter, sec.key, nextAttachments)
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified Chapter Interactive Widget Section (Chapters 3, 4, 5, 6, 8) */}
        {chapterWidget && (
          <div
            aria-disabled={isChapterLocked}
            className={`pt-12 border-t-2 border-t-[var(--theme-ink-strong)] ${isChapterLocked ? 'pointer-events-none opacity-80 select-none' : ''}`}
          >
            {chapterWidget}
          </div>
        )}

        {/* Bottom Editorial Pagination (Chapter-to-Chapter) */}
        <div className="pt-10 border-t-2 border-t-[var(--theme-ink-strong)] flex items-center justify-between gap-4 flex-nowrap">
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstChapter}
            type="button"
            className={`flex items-center gap-2.5 rounded-none px-5 py-3 text-[17px] font-bold transition-colors whitespace-nowrap border ${
              isFirstChapter
                ? 'opacity-30 cursor-not-allowed text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)]'
                : 'text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] cursor-pointer'
            }`}
          >
            <ArrowLeft size={17} />
            <span>{pick({ ko: '이전 챕터', en: 'Previous', ja: '前の章', id: 'Sebelumnya' })}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 text-[16px] font-bold tabular-nums tracking-[0.12em] uppercase text-[var(--theme-ink-secondary)]">
            <span>0{chapter.id} / 0{chapters.length}</span>
          </div>

          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-2.5 rounded-none px-6 py-3 text-[17px] font-bold bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>
              {isNextReleaseHub
                ? pick({ ko: '배포 허브', en: 'Release Hub', ja: 'デプロイハブ', id: 'Hub Rilis' })
                : pick({ ko: '다음 챕터', en: 'Next Chapter', ja: '次の章', id: 'Bab Berikutnya' })}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};

