import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, ArrowLeft,
  Undo2, Check, Lock, Unlock
} from 'lucide-react';
import { getChapters, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity, DomainBusinessRule, SectionAttachment, SitePlan } from '../../types';
import { getAISettings } from '../../lib/aiConfig';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  getSectionBusinessRules,
  buildChapterAIContext,
  serializeSectionBusinessRulesToMarkdown,
} from '../../lib/businessRulesSerializer';
import {
  normalizeAttachments,
  stripHtmlToPlainText,
  markdownOrTextToHtml,
} from '../../lib/documentAttachmentParser';
import PromptExtractionHub from './PromptExtractionHub';
import { FeatureMappingInteractiveWidget } from './FeatureMappingInteractiveWidget';
import { DesignSystemInteractiveWidget } from './DesignSystemInteractiveWidget';
import { NavigationArchitectureInteractiveWidget } from './NavigationArchitectureInteractiveWidget';
import { VisualSchemaBridgeWidget } from './VisualSchemaBridgeWidget';
import { RoadmapInteractiveWidget } from './RoadmapInteractiveWidget';
import { TiptapThinkingCanvas } from './TiptapThinkingCanvas';
import { DomainRulesSection } from './DomainRulesSection';

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
  onBusinessRulesChange,
  onAttachmentsChange,
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
  const { language, pick } = useLanguage();
  const chapters = getChapters(language);
  const chapter: ChapterDef = chapters.find(c => c.id === currentChapter) || chapters[0];
  const section: SectionDef = chapter.sections.find(s => s.key === currentSection) || chapter.sections[0];
  const currentKey = `${currentChapter}_${section.key}`;
  const currentValue = formInputs[currentKey]?.userRawInput || '';
  const currentBusinessRules = getSectionBusinessRules(formInputs[currentKey]);
  const currentAttachments = normalizeAttachments(formInputs[currentKey]?.attachments);
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
  const isLastSection = currentChapter === chapters.length && currentSectionIdx === chapter.sections.length - 1;

  // 1. Inline AI Refinement: synthesizes editor text + attached documents + domain rules into crisp spec prose
  const buildDeterministicRefinement = (rawPlain: string, attachments: SectionAttachment[]): string => {
    const rulesMarkdown = serializeSectionBusinessRulesToMarkdown(currentChapter, section.key, formInputs);
    const lines: string[] = [];

    if (rawPlain) {
      if (currentChapter === 1 && section.key === 'project_name') {
        lines.push(`서비스 공식 명칭: ${rawPlain} (시스템 식별자: ${rawPlain.replace(/\s+/g, '-').toLowerCase()})`);
      } else if (currentChapter === 1 && (section.key === 'target_user' || section.key === 'primary_goal' || section.key === 'problem_background')) {
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
        lines.push(`## 빅테크 표준 제품/엔지니어링 로드맵 (${section.title})`);
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
      lines.push(`## 첨부 문서 기반 정제 명세 (${section.title})`);
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

  const handleInlineRefine = async () => {
    if (isChapterLocked) return;
    const rawPlain = stripHtmlToPlainText(currentValue);
    const hasAttachments = currentAttachments.length > 0;

    if (!rawPlain && !hasAttachments) {
      const defaultStarter =
        section.placeholder ||
        pick({
          ko: `${section.title}에 대한 요구사항 명세`,
          en: `Requirements specification for ${section.title}`,
          ja: `${section.title}に関する要件定義`,
          id: `Spesifikasi kebutuhan untuk ${section.title}`,
        });
      onInputChange(
        currentChapter,
        section.key,
        markdownOrTextToHtml(
          `${pick({ ko: '[요구사항 정의]', en: '[Requirements]', ja: '[要件定義]', id: '[Kebutuhan]' })} ${defaultStarter}`
        )
      );
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
    const canUseRemoteGemini = aiSettings.provider === 'gemini';
    const canUseLocalOllama = aiSettings.provider === 'ollama';

    if (canUseRemoteGemini || canUseLocalOllama) {
      setIsRefining(true);
      try {
        const promptText = [
          `You are refining a software engineering PRD section ("${section.title}").`,
          'Synthesize both the user narrative draft and ALL Attached Reference Documents below into one clean, structured, unambiguous Korean engineering specification.',
          'Strictly enforce all Domain Rules & Constraints below.',
          'Output clean Korean Markdown using headings (##, ###) and bullet lists (- ) without extra conversational preamble.',
          '',
          chapterContext,
        ].join('\n');

        let aiText = '';

        if (canUseRemoteGemini) {
          const pdfParts = currentAttachments
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
          onInputChange(currentChapter, section.key, markdownOrTextToHtml(aiText));
          setCoPilotNotification(
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
          setTimeout(() => setCoPilotNotification(null), 3200);
          return;
        }
      } catch {
        // Fallback seamlessly to local deterministic refinement
      } finally {
        setIsRefining(false);
      }
    }

    const refined = buildDeterministicRefinement(rawPlain, currentAttachments);
    onInputChange(currentChapter, section.key, markdownOrTextToHtml(refined));
    setCoPilotNotification(
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
    setTimeout(() => setCoPilotNotification(null), 3200);
  };

  // 2. Undo Refine
  const handleUndoRefine = () => {
    if (isChapterLocked) return;
    if (previousValueBeforeRefine !== null) {
      onInputChange(currentChapter, section.key, previousValueBeforeRefine);
      setPreviousValueBeforeRefine(null);
      setCoPilotNotification(
        pick({
          ko: '정제 전 원래 원고로 되돌렸습니다.',
          en: 'Reverted to your original draft.',
          ja: '整理前の元のテキストに戻しました。',
          id: 'Dikembalikan ke draf awal sebelum penyempurnaan.',
        })
      );
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
        return null;

      case 8: {
        return (
          <RoadmapInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
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

  // Chapters 1 to 8: Sejong Editorial Magazine Writing Canvas
  return (
    <section 
      className="flex-1 min-w-0 w-full h-full flex flex-col bg-[var(--theme-canvas)] overflow-y-auto selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)]"
      aria-label={pick({ ko: '집필 캔버스', en: 'Writing Canvas', ja: '執筆キャンバス', id: 'Kanvas Penulisan' })}
    >
      <div className="flex-1 w-full mx-auto px-6 sm:px-12 lg:px-14 pt-12 sm:pt-14 pb-24 flex flex-col space-y-14 sm:space-y-16 max-w-4xl">
        {/* Top Category Eyebrow Rule + Sejong Editorial Title Header */}
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

          <header className="border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-border-hairline)] pt-8 pb-8 sm:pt-10 sm:pb-10">
            <h1
              className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.03em] leading-tight ${
                largeTextMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
              }`}
              style={{ textWrap: 'balance' }}
            >
              {section.title}
            </h1>
          </header>
        </div>

        {/* 01. Natural Language Writing Area — Direct Editorial Paper */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[var(--theme-ink-strong)]">
            <div className="flex items-baseline gap-3.5">
              <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em]">
                01
              </span>
              <h2 className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] ${largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'}`}>
                Thinking Canvas
              </h2>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleInlineRefine}
                disabled={isRefining || isChapterLocked}
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
                  {isRefining
                    ? pick({ ko: '정제 중...', en: 'Refining...', ja: '精製中...', id: 'Menyempurnakan...' })
                    : pick({ ko: 'AI 정제', en: 'AI Refine', ja: 'AI精製', id: 'Sempurnakan AI' })}
                </span>
              </button>

              {previousValueBeforeRefine !== null && !isChapterLocked && (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-none text-[16px] font-bold border border-[var(--theme-border-hairline)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)] transition-colors cursor-pointer whitespace-nowrap"
                  title={pick({ ko: '이전 원고로 되돌리기', en: 'Revert to previous draft', ja: '元の下書きに戻す', id: 'Kembalikan ke draf sebelumnya' })}
                >
                  <Undo2 size={15} />
                  <span>{pick({ ko: '되돌리기', en: 'Undo', ja: '元に戻す', id: 'Urungkan' })}</span>
                </button>
              )}
            </div>
          </div>

          {coPilotNotification && (
            <div className="px-5 py-3.5 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2.5">
              <Check size={17} className="stroke-[2.5] shrink-0" />
              <span>{coPilotNotification}</span>
            </div>
          )}

          <div className={`relative flex flex-col transition-colors duration-200 ${
            isChapterLocked
              ? 'bg-[var(--theme-stage)] rounded-none px-6 py-5 border border-[var(--theme-border-hairline)]'
              : 'bg-[var(--theme-canvas)]'
          }`}>
            <TiptapThinkingCanvas
              value={currentValue}
              onChange={(newText) => onInputChange(currentChapter, section.key, newText)}
              placeholder={section.placeholder}
              largeTextMode={largeTextMode}
              readOnly={isChapterLocked}
              attachments={currentAttachments}
              onAttachmentsChange={(nextAttachments) =>
                onAttachmentsChange?.(currentChapter, section.key, nextAttachments)
              }
            />
          </div>
        </div>

        {/* 02. Domain Rules & Constraints Builder */}
        <div className="pt-12 border-t border-[var(--theme-border-hairline)]">
          <DomainRulesSection
            rules={currentBusinessRules}
            onChange={(updatedRules) => {
              onBusinessRulesChange?.(currentChapter, section.key, updatedRules);
            }}
            largeTextMode={largeTextMode}
            isParentLocked={isChapterLocked}
          />
        </div>

        {/* 03. Unified Chapter Interactive Widget Section (Chapters 3-8) */}
        {renderChapterInteractiveWidget() && (
          <div
            aria-disabled={isChapterLocked}
            className={`pt-12 border-t border-[var(--theme-border-hairline)] ${isChapterLocked ? 'pointer-events-none opacity-80 select-none' : ''}`}
          >
            {renderChapterInteractiveWidget()}
          </div>
        )}

        {/* Bottom Editorial Pagination */}
        <div className="pt-10 border-t-2 border-t-[var(--theme-ink-strong)] flex items-center justify-between gap-4 flex-nowrap">
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2.5 rounded-none px-5 py-3 text-[17px] font-bold transition-colors whitespace-nowrap border ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)]'
                : 'text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] cursor-pointer'
            }`}
          >
            <ArrowLeft size={17} />
            <span>{pick({ ko: '이전 단계', en: 'Previous', ja: '前へ', id: 'Sebelumnya' })}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2.5 text-[16px] font-bold tabular-nums tracking-[0.12em] uppercase text-[var(--theme-ink-secondary)]">
            <span>0{chapter.id} / 0{chapters.length}</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className="flex items-center gap-2.5 rounded-none px-6 py-3 text-[17px] font-bold bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>
              {isLastSection
                ? pick({ ko: '배포 허브', en: 'Release Hub', ja: 'デプロイハブ', id: 'Hub Rilis' })
                : pick({ ko: '다음 단계', en: 'Next', ja: '次へ', id: 'Berikutnya' })}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
};
