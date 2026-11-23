import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Sparkles, FileCode, Printer } from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { generatePlaybookVibePrompt } from '../../lib/executionPlaybook';
import { getDocImpactStatus } from '../../lib/specImpact';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { useLanguage } from '../../contexts/LanguageContext';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

interface ExportSpecPageProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
}

export default function ExportSpecPage({
  plan,
  formInputs,
  lockedChapters = [],
  updatedChapters,
}: ExportSpecPageProps) {
  const { pick } = useLanguage();
  const [selectedDocId, setSelectedDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  const bundle = useMemo(
    () => compileMarkdownBundle(plan, formInputs, lockedChapters),
    [plan, formInputs, lockedChapters]
  );

  const docsList = useMemo(() => getMarkdownDocsList(bundle), [bundle]);

  const docImpactMap = useMemo(() => {
    const map: Record<string, 'updated' | 'locked' | 'idle'> = {};
    for (const d of docsList) {
      map[d.id] = getDocImpactStatus(d.id, formInputs, lockedChapters, updatedChapters);
    }
    return map;
  }, [docsList, formInputs, lockedChapters, updatedChapters]);

  const activeDoc: MarkdownDocInfo = useMemo(
    () => docsList.find(d => d.id === selectedDocId) || docsList[0],
    [docsList, selectedDocId]
  );

  const vibeCodingPrompt = useMemo(
    () => generatePlaybookVibePrompt({ plan, formInputs, lockedChapters }),
    [plan, formInputs, lockedChapters]
  );

  const projectName = plan.metadata?.projectName?.trim() || 'GOGUMA Project';
  const activeStatus = docImpactMap[activeDoc.id] || 'idle';

  const handleCopyVibePrompt = async () => {
    try {
      await navigator.clipboard.writeText(vibeCodingPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy vibe-coding prompt:', e);
    }
  };

  const handleCopyCurrentDoc = async () => {
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } catch (e) {
      console.error('Failed to copy specification file:', e);
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      await downloadBlueprintZip(plan, formInputs, lockedChapters);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 2500);
    } catch (e) {
      console.error('Failed to export ZIP archive:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handlePrintSpec = () => {
    window.print();
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleCopyVibePrompt}
        className="px-6 py-3.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
      >
        {copiedPrompt ? <Check size={17} /> : <Sparkles size={17} />}
        <span>
          {copiedPrompt
            ? pick({ ko: '바이브 코딩 프롬프트 복사됨', en: 'Vibe Prompt Copied', ja: 'バイブプロンプトコピー済み', id: 'Prompt Vibe Disalin' })
            : pick({ ko: '바이브 코딩 프롬프트 복사', en: 'Copy Vibe Coding Prompt', ja: 'バイブコーディングプロンプトコピー', id: 'Salin Prompt Vibe Coding' })}
        </span>
      </button>

      <button
        type="button"
        onClick={handleDownloadZip}
        disabled={isDownloadingZip}
        className="px-6 py-3.5 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] disabled:opacity-50 text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
      >
        {zipDownloaded ? <Check size={17} /> : <Download size={17} />}
        <span>
          {zipDownloaded
            ? pick({ ko: 'ZIP 다운로드 완료', en: 'ZIP Downloaded', ja: 'ZIPダウンロード完了', id: 'ZIP Terunduh' })
            : isDownloadingZip
            ? pick({ ko: 'ZIP 패키징 중...', en: 'Packaging ZIP...', ja: 'ZIP生成中...', id: 'Mengemas ZIP...' })
            : pick({ ko: '11종 사양서 ZIP 다운로드', en: 'Download 11-Spec ZIP', ja: '11種仕様書ZIPダウンロード', id: 'Unduh ZIP 11 Spesifikasi' })}
        </span>
      </button>

      <button
        type="button"
        onClick={handlePrintSpec}
        className="px-5 py-3.5 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
        title={pick({
          ko: '백지(흰 종이) 규격으로 인쇄',
          en: 'Print on crisp white-paper sheet',
          ja: '白紙フォーマットで印刷',
          id: 'Cetak pada format kertas putih bersih',
        })}
      >
        <Printer size={17} />
        <span>{pick({ ko: '인쇄', en: 'Print', ja: '印刷', id: 'Cetak' })}</span>
      </button>
    </>
  );

  return (
    <EditorialPageLayout
      category="ARTIFACTS · EXPORT & PLAYBOOK"
      title={`${projectName} — ${pick({
        ko: '사양서 내보내기',
        en: 'Export Specifications',
        ja: '仕様書エクスポート',
        id: 'Ekspor Spesifikasi',
      })}`}
      subtitle={pick({
        ko: '루트 실행 플레이북(00_EXECUTION_PLAYBOOK.md), 11종 개발 사양서 및 단일 HTML 프로토타입을 열람하고 백지 인쇄·내보내기 합니다.',
        en: 'Inspect, print on fixed white paper, and export the root execution playbook, 11 engineering specs, and standalone HTML prototype.',
        ja: 'ルート実行プレイブック(00_EXECUTION_PLAYBOOK.md)、11種開発仕様書、および単一HTMLプロトタイプを閲覧し白紙印刷・エクスポートします。',
        id: 'Tinjau, cetak di kertas putih, dan ekspor playbook eksekusi root, 11 dokumen spesifikasi, serta prototipe HTML mandiri.',
      })}
      headerActions={headerActions}
      maxWidthClass="max-w-6xl"
    >
      {/* Document Selector Grid */}
      <div className="border border-[var(--theme-ink-strong)] divide-y divide-[var(--theme-border-hairline)]">
        <div className="no-print bg-[var(--theme-stage)] p-4 sm:p-5 flex flex-wrap gap-2 border-b border-[var(--theme-ink-strong)]">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDoc.id;
            const status = docImpactMap[doc.id] || 'idle';
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-4 py-2.5 text-[16px] font-bold rounded-none transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                    : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-primary)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)]'
                }`}
              >
                <span className="tabular-nums opacity-75">
                  {doc.docNumber === 0 ? '00' : doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span>{doc.filename}</span>
                {status !== 'idle' && (
                  <span className="text-[14px] px-2 py-0.5 border border-current uppercase">
                    {status === 'locked'
                      ? pick({ ko: '확정', en: 'Locked', ja: '確定', id: 'Terkunci' })
                      : pick({ ko: '갱신', en: 'Updated', ja: '更新', id: 'Diperbarui' })}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* File Subheader */}
        <div className="px-6 py-5 bg-[var(--theme-elevated)] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[17px] min-w-0">
            <FileCode size={18} className="shrink-0 text-[var(--theme-ink-strong)]" />
            <span className="font-mono font-bold text-[var(--theme-ink-strong)]">{activeDoc.relativePath}</span>
            <span className="text-[var(--theme-border-strong)]">|</span>
            <span className="text-[var(--theme-ink-secondary)] truncate">{activeDoc.description}</span>
            {activeStatus !== 'idle' && (
              <span className="px-2.5 py-0.5 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[14px] font-bold">
                {activeStatus === 'locked'
                  ? pick({ ko: '확정됨', en: 'Locked', ja: '確定済み', id: 'Terkunci' })
                  : pick({ ko: '최신 반영', en: 'Up to Date', ja: '最新反映', id: 'Terbaru' })}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyCurrentDoc}
            className="no-print px-5 py-2.5 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[16px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copiedDoc ? <Check size={16} /> : <Copy size={16} />}
            <span>
              {copiedDoc
                ? pick({ ko: '복사 완료', en: 'Copied', ja: 'コピー完了', id: 'Tersalin' })
                : pick({
                    ko: `${activeDoc.filename} 복사`,
                    en: `Copy ${activeDoc.filename}`,
                    ja: `${activeDoc.filename} をコピー`,
                    id: `Salin ${activeDoc.filename}`,
                  })}
            </span>
          </button>
        </div>

        {/* Playbook Orientation Callout */}
        {activeDoc.id === '00_EXECUTION_PLAYBOOK' && (
          <div className="no-print px-6 py-4 bg-[var(--theme-stage)] flex flex-wrap items-center justify-between gap-2 text-[17px] text-[var(--theme-ink-body)]">
            <span>
              <strong className="text-[var(--theme-ink-strong)]">
                {pick({
                  ko: '4단계 실행 가이드:',
                  en: '4-Phase Execution Guide:',
                  ja: '4段階実行ガイド：',
                  id: 'Panduan Eksekusi 4 Tahap:',
                })}
              </strong>{' '}
              {pick({
                ko: 'Phase 1 (확정 제약) → Phase 2 (핵심 워크플로우) → Phase 3 (예외 상태) → Phase 4 (도메인 검수)',
                en: 'Phase 1 (Locked Constraints) → Phase 2 (Core Workflows) → Phase 3 (Edge Cases) → Phase 4 (Domain QA)',
                ja: 'Phase 1（確定制約）→ Phase 2（主要ワークフロー）→ Phase 3（例外状態）→ Phase 4（ドメイン検証）',
                id: 'Fase 1 (Batasan Terkunci) → Fase 2 (Alur Inti) → Fase 3 (Kasus Tepi) → Fase 4 (QA Domain)',
              })}
            </span>
          </div>
        )}

        {/* Fixed Crisp White Paper Sheet for Document Reading, Export & Print */}
        <div
          data-paper-fixed="true"
          className="paper-sheet p-8 sm:p-10 bg-[#FFFFFF] text-[#111111] max-h-[65vh] overflow-y-auto custom-scroll"
        >
          <pre className="whitespace-pre-wrap font-mono text-[17px] sm:text-[18px] leading-[1.85] text-[#111111] select-text">
            {activeDoc.content}
          </pre>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
