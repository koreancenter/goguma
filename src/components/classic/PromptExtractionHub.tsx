import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Check, Terminal, Download, Copy, ExternalLink,
  FileCode, FolderArchive, Printer
} from 'lucide-react';
import { FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { generatePlaybookVibePrompt } from '../../lib/executionPlaybook';
import { getDocImpactStatus } from '../../lib/specImpact';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { compileStandalonePrototypeHtml, generatePrototypePrompt } from '../../lib/prototypeCompiler';

export interface PromptExtractionHubProps {
  formInputs?: Record<string, FormInputEntity>;
  onBack?: () => void;
  onSave?: () => void;
  largeTextMode?: boolean;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
}

export default function PromptExtractionHub({ 
  formInputs,
  largeTextMode = false,
  lockedChapters = [],
  updatedChapters,
}: PromptExtractionHubProps) {
  const navigate = useNavigate();
  const { plan } = useSitePlan();
  const { pick } = useLanguage();

  const [activeDocId, setActiveDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [copiedVibePrompt, setCopiedVibePrompt] = useState(false);
  const [copiedFirstPrompt, setCopiedFirstPrompt] = useState(false);
  const [copiedGoldenPrompt, setCopiedGoldenPrompt] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // 1. Compile 11-Markdown bundle
  const bundle = useMemo(() => {
    return compileMarkdownBundle(plan, formInputs, lockedChapters);
  }, [plan, formInputs, lockedChapters]);

  // 2. Docs list with metadata (SSOT)
  const docsList = useMemo(() => {
    return getMarkdownDocsList(bundle);
  }, [bundle]);

  const docImpactMap = useMemo(() => {
    const map: Record<string, 'updated' | 'locked' | 'idle'> = {};
    for (const d of docsList) {
      map[d.id] = getDocImpactStatus(d.id, formInputs, lockedChapters, updatedChapters);
    }
    return map;
  }, [docsList, formInputs, lockedChapters, updatedChapters]);

  const activeDoc: MarkdownDocInfo = useMemo(() => {
    return docsList.find(d => d.id === activeDocId) || docsList[0];
  }, [docsList, activeDocId]);

  // Golden Prompt for Cursor / Claude Code / Windsurf (Prototype-as-Spec 1:1 reverse engineering)
  const goldenPromptText = useMemo(() => {
    return generatePrototypePrompt(plan, formInputs, lockedChapters);
  }, [plan, formInputs, lockedChapters]);

  // Quick kickoff instruction prompt
  const firstPromptText = useMemo(() => {
    const projName = plan.metadata?.projectName?.trim() || '웹 애플리케이션 프로젝트';
    return `안녕하세요! '${projName}' 웹 애플리케이션의 구현을 시작합니다.
프로젝트의 docs/ 디렉터리에 준비된 사양서 11종 중:
1. docs/04_SPEC.md (전체 화면 정보구조 및 기능 명세)
2. docs/06_DATA_SCHEMA.md (데이터베이스 모델 및 API 스키마)
3. docs/05_ARCH_CONSTITUTION.md (시스템 아키텍처 및 기술 스택 불변 규약)
를 면밀히 검토해 주세요.

그리고 prototype.html을 참고하여 메인 화면(대시보드 및 핵심 인터랙션 컴포넌트)을 구현해 주세요!`;
  }, [plan]);

  // Handle ZIP download
  const handleDownloadZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadBlueprintZip(plan, formInputs, lockedChapters);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch (e: any) {
      setDownloadError(
        pick({
          ko: 'ZIP 다운로드 중 오류가 발생했습니다: ',
          en: 'An error occurred during ZIP download: ',
          ja: 'ZIPダウンロード中にエラーが発生しました: ',
          id: 'Terjadi kesalahan saat mengunduh ZIP: ',
        }) + (e?.message || pick({ ko: '알 수 없는 오류', en: 'Unknown error', ja: '不明なエラー', id: 'Kesalahan tidak diketahui' }))
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy specific document
  const handleCopyDoc = async (doc: MarkdownDocInfo) => {
    try {
      await navigator.clipboard.writeText(doc.content);
      setCopiedDocId(doc.id);
      setTimeout(() => setCopiedDocId(null), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Copy first prompt
  const handleCopyFirstPrompt = async () => {
    try {
      await navigator.clipboard.writeText(firstPromptText);
      setCopiedFirstPrompt(true);
      setTimeout(() => setCopiedFirstPrompt(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Copy golden prompt
  const handleCopyGoldenPrompt = async () => {
    try {
      await navigator.clipboard.writeText(goldenPromptText);
      setCopiedGoldenPrompt(true);
      setTimeout(() => setCopiedGoldenPrompt(false), 2000);
    } catch (e) {
      console.error('Failed to copy golden prompt', e);
    }
  };

  // One-click Copy Vibe-Coding Prompt distilled from 00_EXECUTION_PLAYBOOK.md
  const handleCopyVibePrompt = async () => {
    try {
      const prompt = generatePlaybookVibePrompt({ plan, formInputs, lockedChapters });
      await navigator.clipboard.writeText(prompt);
      setCopiedVibePrompt(true);
      setTimeout(() => setCopiedVibePrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy vibe-coding prompt', e);
    }
  };

  // Open standalone prototype in new tab safely without window.open
  const handleOpenPrototype = () => {
    const html = compileStandalonePrototypeHtml(plan, { formInputs });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const projectName =
    plan.metadata?.projectName ||
    pick({ ko: '새 프로젝트', en: 'New Project', ja: '新規プロジェクト', id: 'Proyek Baru' });

  return (
    <div className="flex-1 flex flex-col space-y-14 pb-16 text-[var(--theme-ink-primary)]">
      {/* 1. Sejong Editorial Header & Metrics */}
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.16em] text-[var(--theme-ink-secondary)]">
            CHAPTER 09 · ARTIFACTS &amp; VIBE-CODING HUB
          </span>
        </div>

        <header className="border-t-2 border-t-[var(--theme-ink-strong)] border-b border-b-[var(--theme-border-hairline)] pt-8 pb-8 sm:pt-10 sm:pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1
              className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.03em] leading-tight ${
                largeTextMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
              }`}
              style={{ textWrap: 'balance' }}
            >
              {pick({
                ko: '바이브 코딩 배포 허브',
                en: 'Vibe-Coding Deployment Hub',
                ja: 'バイブコーディング配布ハブ',
                id: 'Hub Distribusi Vibe-Coding',
              })}
            </h1>
            <p
              className={`text-[var(--theme-ink-secondary)] leading-[1.65] max-w-3xl ${
                largeTextMode ? 'text-[20px] sm:text-[23px]' : 'text-[18px] sm:text-[20px]'
              }`}
            >
              {pick({
                ko: `${projectName}의 11종 마크다운 사양서, 에이전트 규약(.cursorrules/.clinerules), 단일 HTML 프로토타입 및 Cursor/Claude 전용 골든 프롬프트 패키지입니다.`,
                en: `Complete package for ${projectName}: 11 Markdown specs, agent rules (.cursorrules/.clinerules), standalone HTML prototype, and Cursor/Claude Golden Prompt.`,
                ja: `${projectName} の11種Markdown仕様書、エージェント規約 (.cursorrules/.clinerules)、単一HTMLプロトタイプ、Cursor/Claude用ゴールデンプロンプトのパッケージです。`,
                id: `Paket lengkap untuk ${projectName}: 11 spesifikasi Markdown, aturan agen (.cursorrules/.clinerules), prototipe HTML mandiri, dan Golden Prompt Cursor/Claude.`,
              })}
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/export')}
              className="flex items-center gap-2 px-4 py-3.5 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] font-bold text-[16px] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Printer size={16} />
              <span>{pick({ ko: '사양서 인쇄·내보내기', en: 'Print / Export Spec', ja: '仕様書印刷・出力', id: 'Cetak / Ekspor' })}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] font-bold text-[17px] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {downloadDone ? (
                <>
                  <Check size={17} />
                  <span>{pick({ ko: '다운로드 완료', en: 'Downloaded', ja: 'ダウンロード完了', id: 'Selesai Diunduh' })}</span>
                </>
              ) : (
                <>
                  <FolderArchive size={17} />
                  <span>
                    {isDownloading
                      ? pick({ ko: '압축 생성 중...', en: 'Creating ZIP...', ja: 'ZIP圧縮中...', id: 'Membuat ZIP...' })
                      : pick({ ko: '11종 번들 (.zip) 다운로드', en: 'Download 11-Spec Bundle (.zip)', ja: '11種バンドル (.zip) ダウンロード', id: 'Unduh Bundel 11-Spec (.zip)' })}
                  </span>
                </>
              )}
            </button>
          </div>
        </header>

        {downloadError && (
          <div className="px-5 py-3.5 rounded-none bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] text-[var(--theme-danger)] text-[16px] font-bold">
            {downloadError}
          </div>
        )}

        {/* Quick Spec Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-[var(--theme-border-hairline)] divide-x divide-y sm:divide-y-0 divide-[var(--theme-border-hairline)] bg-[var(--theme-stage)]">
          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[var(--theme-ink-secondary)] font-medium">
              {pick({ ko: '마크다운 사양서', en: 'Markdown Specs', ja: 'Markdown 仕様書', id: 'Spesifikasi Markdown' })}
            </div>
            <div className="text-[20px] font-extrabold tabular-nums text-[var(--theme-ink-strong)]">
              {pick({ ko: '11개 문서', en: '11 Documents', ja: '11文書', id: '11 Dokumen' })}
            </div>
            <div className="text-[14px] text-[var(--theme-ink-muted)] font-mono">01_proposal ~ 11_sys</div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[var(--theme-ink-secondary)] font-medium">
              {pick({ ko: '에이전트 규칙', en: 'Agent Rules', ja: 'エージェント規則', id: 'Aturan Agen' })}
            </div>
            <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">.cursorrules</div>
            <div className="text-[14px] text-[var(--theme-ink-muted)] font-mono">.clinerules &amp; CLAUDE.md</div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[var(--theme-ink-secondary)] font-medium">
              {pick({ ko: '실행 프로토타입', en: 'Live Prototype', ja: '実行プロトタイプ', id: 'Prototipe Aktif' })}
            </div>
            <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">prototype.html</div>
            <div className="text-[14px] text-[var(--theme-ink-muted)]">
              {pick({ ko: '브라우저 즉시 구동', en: 'Instant browser preview', ja: 'ブラウザ即時実行', id: 'Langsung jalan di browser' })}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[var(--theme-ink-secondary)] font-medium">
              {pick({ ko: '아키텍처 규약', en: 'Architecture', ja: 'アーキテクチャ規約', id: 'Arsitektur' })}
            </div>
            <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">Local-First</div>
            <div className="text-[14px] text-[var(--theme-ink-muted)]">
              {pick({ ko: 'IndexedDB 영속성', en: 'IndexedDB Persistence', ja: 'IndexedDB 永続化', id: 'Persistensi IndexedDB' })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Golden Prompt Callout */}
      <div className="bg-[var(--theme-stage)] border border-t-2 border-t-[var(--theme-ink-strong)] border-[var(--theme-border-hairline)] rounded-none p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[var(--theme-border-hairline)]">
          <div className="space-y-2">
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em]">
              {pick({
                ko: '골든 프롬프트 (Cursor / Claude Code)',
                en: 'Golden Prompt (Cursor / Claude Code)',
                ja: 'ゴールデンプロンプト (Cursor / Claude Code)',
                id: 'Golden Prompt (Cursor / Claude Code)',
              })}
            </h2>
            <p className="text-[17px] sm:text-[18px] text-[var(--theme-ink-secondary)] leading-[1.7]">
              {pick({
                ko: (
                  <>
                    <strong className="text-[var(--theme-ink-strong)]">Prototype-as-Spec 1:1 역공학 지침</strong>: AI 에이전트의 환각을 원천 차단하고 <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-2 py-0.5 rounded-none">prototype.html</code>과 사양서 11종을 프로덕션 코드로 직결합니다.
                  </>
                ),
                en: (
                  <>
                    <strong className="text-[var(--theme-ink-strong)]">Prototype-as-Spec 1:1 Grounding</strong>: Eliminates AI hallucination and binds <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-2 py-0.5 rounded-none">prototype.html</code> with all 11 specs directly into production code.
                  </>
                ),
                ja: (
                  <>
                    <strong className="text-[var(--theme-ink-strong)]">Prototype-as-Spec 1:1 リバース設計指針</strong>: AIのハルシネーションを防ぎ、<code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-2 py-0.5 rounded-none">prototype.html</code> と11種の仕様書をプロダクションコードへ直結します。
                  </>
                ),
                id: (
                  <>
                    <strong className="text-[var(--theme-ink-strong)]">Panduan Rekayasa Balik 1:1 Prototype-as-Spec</strong>: Mencegah halusinasi AI dan menghubungkan <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-2 py-0.5 rounded-none">prototype.html</code> beserta 11 spesifikasi langsung ke kode produksi.
                  </>
                ),
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyGoldenPrompt}
              className="flex items-center gap-2 px-5 py-3 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] font-bold text-[16px] transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={16} />
                  <span>{pick({ ko: '골든 프롬프트 복사됨', en: 'Golden Prompt Copied', ja: 'コピー完了', id: 'Golden Prompt Disalin' })}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>{pick({ ko: '골든 프롬프트 복사', en: 'Copy Golden Prompt', ja: 'ゴールデンプロンプトをコピー', id: 'Salin Golden Prompt' })}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unboxed Feature Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] font-bold text-[var(--theme-ink-secondary)]">
          <span>✓ Prototype-as-Spec</span>
          <span>·</span>
          <span>✓ React 19 + TypeScript + Tailwind</span>
          <span>·</span>
          <span>✓ Zero-Slop Rule</span>
          <span>·</span>
          <span>{pick({ ko: '✓ 환각 방지 불변 규약', en: '✓ Anti-Hallucination Guardrails', ja: '✓ ハルシネーション防止規約', id: '✓ Aturan Anti-Halusinasi' })}</span>
        </div>

        {/* Golden Prompt Text Code Block */}
        <pre className={`whitespace-pre-wrap font-mono text-[var(--theme-ink-primary)] bg-[var(--theme-canvas)] p-5 sm:p-6 rounded-none border border-[var(--theme-border-hairline)] select-text max-h-[360px] overflow-y-auto custom-scroll ${
          largeTextMode ? 'text-[17px] sm:text-[19px] leading-[1.8]' : 'text-[16px] sm:text-[17px] leading-[1.75]'
        }`}>
          {goldenPromptText}
        </pre>
      </div>

      {/* 3. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-6">
        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] pb-3 border-b border-[var(--theme-ink-strong)]">
          {pick({
            ko: '바이브 코딩 3단계 진행 가이드',
            en: '3-Step Vibe-Coding Workflow',
            ja: 'バイブコーディング 3ステップガイド',
            id: 'Panduan 3 Langkah Vibe-Coding',
          })}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* STEP 1 */}
          <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[var(--theme-ink-secondary)] tabular-nums font-extrabold block">01</span>
              <h3 className="font-extrabold text-[var(--theme-ink-strong)] text-[19px]">
                {pick({ ko: 'ZIP 패키지 다운로드', en: 'Download ZIP Package', ja: 'ZIP パッケージをダウンロード', id: 'Unduh Paket ZIP' })}
              </h3>
              <p className="text-[16px] text-[var(--theme-ink-secondary)] leading-[1.7]">
                {pick({
                  ko: '상단의 [11종 번들 다운로드]를 클릭해 사양서·에이전트 룰·프로토타입이 담긴 ZIP 파일을 받습니다.',
                  en: 'Click [Download 11-Spec Bundle] above to get the ZIP containing specs, agent rules, and prototype.',
                  ja: '上部の [11種バンドルダウンロード] をクリックし、仕様書・ルール・プロトタイプ入りZIPを取得します。',
                  id: 'Klik tombol [Unduh Bundel 11-Spec] di atas untuk mendapatkan file ZIP berisi spesifikasi dan prototipe.',
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadZip}
              className="w-full py-3 px-4 rounded-none bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-ink-strong)] hover:text-[var(--theme-active-text)] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[var(--theme-ink-strong)]"
            >
              <Download size={16} />
              <span>{pick({ ko: 'ZIP 다운로드', en: 'Download ZIP', ja: 'ZIP ダウンロード', id: 'Unduh ZIP' })}</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[var(--theme-ink-secondary)] tabular-nums font-extrabold block">02</span>
              <h3 className="font-extrabold text-[var(--theme-ink-strong)] text-[19px]">
                {pick({ ko: '새 폴더에 압축 해제', en: 'Extract & Preview Prototype', ja: '新規フォルダに展開・確認', id: 'Ekstrak & Pratinjau Prototipe' })}
              </h3>
              <p className="text-[16px] text-[var(--theme-ink-secondary)] leading-[1.7]">
                {pick({
                  ko: (
                    <>
                      로컬 프로젝트 폴더에 압축을 풀고 폴더 내 <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-1.5 py-0.5 rounded-none">prototype.html</code>로 전체 화면 동작을 확인하세요.
                    </>
                  ),
                  en: (
                    <>
                      Extract into a project folder and open <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-1.5 py-0.5 rounded-none">prototype.html</code> to inspect the interactive UI.
                    </>
                  ),
                  ja: (
                    <>
                      ローカルフォルダに展開し、<code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-1.5 py-0.5 rounded-none">prototype.html</code> で全体画面の動作を確認してください。
                    </>
                  ),
                  id: (
                    <>
                      Ekstrak ke folder proyek lokal lalu buka <code className="text-[var(--theme-ink-strong)] font-mono bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-1.5 py-0.5 rounded-none">prototype.html</code> untuk memeriksa interaksi layar.
                    </>
                  ),
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenPrototype}
              className="w-full py-3 px-4 rounded-none bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-ink-strong)] hover:text-[var(--theme-active-text)] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[var(--theme-ink-strong)]"
            >
              <ExternalLink size={16} />
              <span>{pick({ ko: '프로토타입 열기', en: 'Open Prototype', ja: 'プロトタイプを開く', id: 'Buka Prototipe' })}</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[var(--theme-ink-secondary)] tabular-nums font-extrabold block">03</span>
              <h3 className="font-extrabold text-[var(--theme-ink-strong)] text-[19px]">
                {pick({ ko: '에이전트에 명령 전달', en: 'Prompt Your AI Agent', ja: 'AI エージェントに指示', id: 'Berikan Perintah ke Agen' })}
              </h3>
              <p className="text-[16px] text-[var(--theme-ink-secondary)] leading-[1.7]">
                {pick({
                  ko: (
                    <>
                      Cursor 또는 Claude Code 창에 <strong className="text-[var(--theme-ink-strong)]">[골든 프롬프트]</strong>를 붙여넣고 빌드를 시작합니다.
                    </>
                  ),
                  en: (
                    <>
                      Paste the <strong className="text-[var(--theme-ink-strong)]">[Golden Prompt]</strong> into Cursor or Claude Code and start building.
                    </>
                  ),
                  ja: (
                    <>
                      Cursor または Claude Code に <strong className="text-[var(--theme-ink-strong)]">[ゴールデンプロンプト]</strong> を貼り付けてビルドを開始します。
                    </>
                  ),
                  id: (
                    <>
                      Tempel <strong className="text-[var(--theme-ink-strong)]">[Golden Prompt]</strong> ke Cursor atau Claude Code untuk memulai build.
                    </>
                  ),
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyGoldenPrompt}
              className="w-full py-3 px-4 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={16} />
                  <span>{pick({ ko: '복사 완료', en: 'Copied', ja: 'コピー完了', id: 'Tersalin' })}</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>{pick({ ko: '골든 프롬프트 복사', en: 'Copy Golden Prompt', ja: 'ゴールデンプロンプトをコピー', id: 'Salin Golden Prompt' })}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Kickoff Prompt Callout */}
      <div className="bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} className="text-[var(--theme-ink-strong)]" />
            <span className="text-[19px] font-extrabold text-[var(--theme-ink-strong)]">
              {pick({ ko: '간편 킥오프 프롬프트', en: 'Quick Kickoff Prompt', ja: 'クイックキックオフプロンプト', id: 'Prompt Awal Cepat' })}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] border border-[var(--theme-ink-strong)] text-[15px] text-[var(--theme-ink-strong)] hover:text-[var(--theme-active-text)] font-bold cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={15} /> : <Copy size={15} />}
            <span>
              {copiedFirstPrompt
                ? pick({ ko: '복사됨', en: 'Copied', ja: 'コピー済み', id: 'Tersalin' })
                : pick({ ko: '복사', en: 'Copy', ja: 'コピー', id: 'Salin' })}
            </span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono text-[var(--theme-ink-primary)] bg-[var(--theme-canvas)] p-5 rounded-none border border-[var(--theme-border-hairline)] select-text ${
          largeTextMode ? 'text-[17px] sm:text-[19px] leading-[1.8]' : 'text-[16px] sm:text-[17px] leading-[1.75]'
        }`}>
          {firstPromptText}
        </pre>
      </div>

      {/* 5. Complete 11-Spec Blueprint Viewer */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[var(--theme-ink-strong)]">
          <div className="flex items-center gap-2.5">
            <FileCode size={20} className="text-[var(--theme-ink-strong)]" />
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em]">
              {pick({
                ko: '11종 사양서 개별 열람 및 복사',
                en: '11-Spec Blueprint Inspector',
                ja: '11種仕様書の個別閲覧・コピー',
                id: 'Pemeriksa & Salin 11 Dokumen Spesifikasi',
              })}
            </h2>
          </div>
          <span className="text-[15px] text-[var(--theme-ink-muted)]">
            {pick({
              ko: '문서 탭을 선택하여 내용을 확인하세요.',
              en: 'Select a document tab to inspect its contents.',
              ja: 'ドキュメントタブを選択して内容を確認してください。',
              id: 'Pilih tab dokumen untuk melihat isinya.',
            })}
          </span>
        </div>

        {/* Document Tabs Strip */}
        <div className="flex flex-wrap gap-2 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] p-3 rounded-none">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            const isPlaybook = doc.id === '00_EXECUTION_PLAYBOOK';
            const status = docImpactMap[doc.id] || 'idle';
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3.5 py-2 rounded-none text-[15px] font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                    : isPlaybook
                    ? 'bg-[var(--theme-canvas)] text-[var(--theme-ink-strong)] border-[var(--theme-ink-strong)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)]'
                    : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] border-[var(--theme-border-hairline)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <span className="font-mono">
                  {doc.docNumber === 0 ? '00' : doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span>{doc.filename}</span>
                {!isPlaybook && status !== 'idle' && (
                  <span className="text-[13px] opacity-80">
                    ({status === 'locked' ? 'Locked' : 'Updated'})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Document Viewer */}
        <div className="bg-[var(--theme-canvas)] rounded-none border border-t-2 border-t-[var(--theme-ink-strong)] border-[var(--theme-border-hairline)] overflow-hidden">
          <div className="bg-[var(--theme-stage)] px-5 py-4 border-b border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate text-[16px]">
              <span className="font-mono text-[var(--theme-ink-strong)] font-bold">
                {activeDoc.relativePath}
              </span>
              <span className="text-[var(--theme-border-strong)]">·</span>
              <span className="text-[var(--theme-ink-secondary)] truncate font-medium">
                {activeDoc.title}
              </span>
              {docImpactMap[activeDoc.id] && docImpactMap[activeDoc.id] !== 'idle' && (
                <span
                  className={`text-[14px] font-bold whitespace-nowrap shrink-0 ${
                    docImpactMap[activeDoc.id] === 'locked' ? 'text-[var(--theme-danger)]' : 'text-[var(--theme-ink-strong)]'
                  }`}
                >
                  · {docImpactMap[activeDoc.id] === 'locked' ? 'Locked' : 'Updated'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyVibePrompt}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[15px] text-[var(--theme-btn-text)] font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedVibePrompt ? (
                  <>
                    <Check size={15} />
                    <span>{pick({ ko: '바이브 프롬프트 복사됨', en: 'Copied Vibe-Coding Prompt', ja: 'バイブプロンプトコピー済み', id: 'Prompt Vibe-Coding Disalin' })}</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>{pick({ ko: '바이브 프롬프트 복사', en: 'Copy Vibe-Coding Prompt', ja: 'バイブプロンプトをコピー', id: 'Salin Prompt Vibe-Coding' })}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleCopyDoc(activeDoc)}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] border border-[var(--theme-ink-strong)] text-[15px] text-[var(--theme-ink-strong)] hover:text-[var(--theme-active-text)] font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedDocId === activeDoc.id ? (
                  <>
                    <Check size={15} />
                    <span>{pick({ ko: '복사됨', en: 'Copied', ja: 'コピー済み', id: 'Tersalin' })}</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>{pick({ ko: '문서 복사', en: 'Copy Spec', ja: '仕様書をコピー', id: 'Salin Dokumen' })}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[520px] overflow-y-auto font-mono text-[var(--theme-ink-primary)] bg-[var(--theme-canvas)] custom-scroll">
            <pre className={`whitespace-pre-wrap select-text ${
              largeTextMode ? 'text-[17px] sm:text-[19px] leading-[1.85]' : 'text-[16px] sm:text-[17px] leading-[1.8]'
            }`}>
              {activeDoc.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
