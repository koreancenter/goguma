import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileCode, RefreshCw, ExternalLink, 
  Copy, Check, ChevronLeft, ChevronRight, ChevronDown,
  Monitor, Tablet, Smartphone, Search, FileDown,
  Code, Database, Layers, CheckCheck, Bot, RotateCcw, Network
} from 'lucide-react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html as htmlLang } from '@codemirror/lang-html';
import { SitePlan, FormInputEntity } from '../../types';
import {
  compileStandalonePrototypeHtml,
  generatePrototypePrompt,
  PreviewStateMode,
  PreviewRoleMode,
} from '../../lib/prototypeCompiler';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { generatePlaybookVibePrompt } from '../../lib/executionPlaybook';
import { getDocImpactStatus } from '../../lib/specImpact';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import VisualSitemap from './VisualSitemap';

interface SpecPreviewPanelProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  currentChapter: number;
  largeTextMode?: boolean;
  width?: number;
  onSelectChapter?: (chapterId: number) => void;
  onSelectSection?: (sectionKey: string) => void;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
}

type PreviewTab = 'prototype' | 'docs' | 'devhub' | 'sitemap';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type DevHubSubTab = 'typescript' | 'html' | 'sql' | 'api' | 'prompt';

export const SpecPreviewPanel: React.FC<SpecPreviewPanelProps> = ({
  plan,
  formInputs,
  currentChapter,
  largeTextMode = false,
  width,
  onSelectChapter,
  onSelectSection,
  lockedChapters = [],
  updatedChapters,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { language, pick } = useLanguage();
  const [activeTab, setActiveTab] = useState<PreviewTab>('prototype');
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => 
    plan.metadata?.platform === 'APP' ? 'mobile' : 'desktop'
  );
  const [devHubSubTab, setDevHubSubTab] = useState<DevHubSubTab>('typescript');
  const [codeOverrides, setCodeOverrides] = useState<Partial<Record<DevHubSubTab, string>>>({});
  const [copiedDevHub, setCopiedDevHub] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [docFilterQuery, setDocFilterQuery] = useState<string>('');
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedVibePrompt, setCopiedVibePrompt] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewStateMode>('default');
  const [previewRole, setPreviewRole] = useState<PreviewRoleMode>('user');
  const [isStateMenuOpen, setIsStateMenuOpen] = useState(false);
  const stateMenuRef = useRef<HTMLDivElement>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const previewStateRef = React.useRef<PreviewStateMode>(previewState);
  previewStateRef.current = previewState;
  const previewRoleRef = React.useRef<PreviewRoleMode>(previewRole);
  previewRoleRef.current = previewRole;

  useEffect(() => {
    if (!isStateMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (stateMenuRef.current && !stateMenuRef.current.contains(e.target as Node)) {
        setIsStateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isStateMenuOpen]);

  // Trigger pulse glow animation inside the prototype when plan updates
  React.useEffect(() => {
    setIsSyncing(true);
    const timer = setTimeout(() => {
      setIsSyncing(false);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'GOGUMA_TRIGGER_PULSE' }, '*');
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [plan]);

  // Instantly synchronize Preview State Switcher to the live iframe without mutating IndexedDB
  React.useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'GOGUMA_SET_PREVIEW_STATE', previewState, previewRole },
        '*'
      );
    }
  }, [previewState, previewRole]);

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'GOGUMA_SET_PREVIEW_STATE',
          previewState: previewStateRef.current,
          previewRole: previewRoleRef.current,
        },
        '*'
      );
    }
  };

  // 1. Compile standalone prototype HTML (uses refs for initial boot state; postMessage handles instant switching)
  const prototypeHtml = useMemo(() => {
    return compileStandalonePrototypeHtml(plan, {
      formInputs,
      previewState: previewStateRef.current,
      previewRole: previewRoleRef.current,
    });
  }, [plan, formInputs, reloadKey]);

  // 2. Compile full 11-markdown bundle in real time
  const bundle = useMemo(() => {
    return compileMarkdownBundle(plan, formInputs, lockedChapters);
  }, [plan, formInputs, lockedChapters]);

  // 3. Document list for the 11-doc switcher (SSOT)
  const docsList = useMemo(() => {
    return getMarkdownDocsList(bundle);
  }, [bundle]);

  const filteredDocs = useMemo(() => {
    if (!docFilterQuery.trim()) return docsList;
    const q = docFilterQuery.toLowerCase();
    return docsList.filter(d => 
      d.filename.toLowerCase().includes(q) || 
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q)
    );
  }, [docsList, docFilterQuery]);

  const activeDoc: MarkdownDocInfo = useMemo(() => {
    return docsList.find(d => d.id === selectedDocId) || docsList[0];
  }, [docsList, selectedDocId]);

  const activeDocIndex = useMemo(() => {
    return docsList.findIndex(d => d.id === selectedDocId);
  }, [docsList, selectedDocId]);

  // Handle previous/next doc navigation
  const handlePrevDoc = () => {
    if (activeDocIndex > 0) {
      setSelectedDocId(docsList[activeDocIndex - 1].id);
    }
  };

  const handleNextDoc = () => {
    if (activeDocIndex < docsList.length - 1) {
      setSelectedDocId(docsList[activeDocIndex + 1].id);
    }
  };

  // 4. Dynamic Dev Hub Code Synthesizers for Web/App Architecture
  const generatedTypeScript = useMemo(() => {
    const pages = plan.navigation?.pageStructure || [];
    const projectName = plan.metadata?.projectName || 'App';
    const rawDataColumns = formInputs?.['4_data_columns']?.userRawInput || '고객명, 연락처, 상태, 금액, 메모';
    const fields = rawDataColumns.split(/[,;\n/·•\t]+/).map(f => f.trim().replace(/^[-*0-9.]+\s*/, '')).filter(Boolean);

    return `/**
 * @file ${projectName} - Core Domain Types & Zod Runtime Schema
 * @architecture Local-First React 19 + TypeScript + Cloud-Native API
 */
import { z } from 'zod';

export type EntityStatus = 'BACKLOG' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export const MainRecordSchema = z.object({
  id: z.string().uuid(),
${fields.map(f => {
  const lower = f.toLowerCase();
  let zType = 'z.string()';
  if (lower.includes('금액') || lower.includes('price') || lower.includes('수량') || lower.includes('count')) zType = 'z.number().nonnegative()';
  else if (lower.includes('이메일') || lower.includes('email')) zType = 'z.string().email()';
  else if (lower.includes('일시') || lower.includes('날짜') || lower.includes('date') || lower.includes('time')) zType = 'z.string().datetime()';
  else if (lower.includes('메모') || lower.includes('설명')) zType = 'z.string().max(1000).optional()';
  return `  ${lower.replace(/[^a-zA-Z0-9_]/g, '_') || 'prop'}: ${zType}, // ${f}`;
}).join('\n')}
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'DONE', 'ARCHIVED']).default('BACKLOG'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type MainRecord = z.infer<typeof MainRecordSchema>;

export interface AppNavigationRoute {
  name: string;
  path: string;
  purpose: string;
}

export const APP_ROUTES: AppNavigationRoute[] = [
${pages.map(p => `  { name: '${p.name}', path: '${p.route || '/'}', purpose: '${p.purpose || ''}' },`).join('\n')}
];`;
  }, [plan, formInputs]);

  const generatedSqlDdl = useMemo(() => {
    const rawDataColumns = formInputs?.['4_data_columns']?.userRawInput || '고객명, 연락처, 상태, 금액, 메모';
    const fields = rawDataColumns.split(/[,;\n/·•\t]+/).map(f => f.trim().replace(/^[-*0-9.]+\s*/, '')).filter(Boolean);

    return `-- ============================================================================
-- GOGUMA Production SQL DDL Migration (PostgreSQL / Cloudflare D1 / Supabase)
-- Platform: ${plan.metadata?.platform || 'WEB'} • Local-First Architecture
-- ============================================================================

CREATE TABLE IF NOT EXISTS main_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
${fields.map(f => {
  const lower = f.toLowerCase();
  let sqlType = 'VARCHAR(255) NOT NULL';
  if (lower.includes('금액') || lower.includes('price') || lower.includes('수량') || lower.includes('count')) sqlType = 'INTEGER NOT NULL DEFAULT 0';
  else if (lower.includes('일시') || lower.includes('날짜') || lower.includes('date') || lower.includes('time')) sqlType = 'TIMESTAMPTZ NOT NULL DEFAULT NOW()';
  else if (lower.includes('메모') || lower.includes('설명') || lower.includes('desc')) sqlType = 'TEXT';
  return `  ${lower.replace(/[^a-zA-Z0-9_]/g, '_') || 'prop'} ${sqlType}, -- ${f}`;
}).join('\n')}
  status VARCHAR(32) NOT NULL DEFAULT 'BACKLOG' CHECK (status IN ('BACKLOG', 'IN_PROGRESS', 'DONE', 'ARCHIVED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Query Indexes
CREATE INDEX IF NOT EXISTS idx_main_records_status ON main_records(status);
CREATE INDEX IF NOT EXISTS idx_main_records_created_at ON main_records(created_at DESC);

-- Row-Level Security Policy
ALTER TABLE main_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated user full access" ON main_records
  FOR ALL USING (auth.role() = 'authenticated');`;
  }, [plan, formInputs]);

  const generatedApiRoutes = useMemo(() => {
    return [
      {
        method: 'GET',
        path: '/api/v1/records',
        summary: pick({
          ko: '전체 목록 조회 (상태 필터링, 검색, 페이지네이션)',
          en: 'List all records (status filtering, search, pagination)',
          ja: '全レコード一覧取得（ステータス絞り込み・検索・ページネーション）',
          id: 'Ambil daftar lengkap (filter status, pencarian, paginasi)',
        }),
        auth: 'Bearer JWT',
        status: '200 OK',
      },
      {
        method: 'POST',
        path: '/api/v1/records',
        summary: pick({
          ko: '신규 엔터티 생성 (Zod 검증 및 트랜잭션 커밋)',
          en: 'Create new entity (Zod validation & transaction commit)',
          ja: '新規エンティティ作成（Zod 検証およびトランザクション確定）',
          id: 'Buat entitas baru (validasi Zod & commit transaksi)',
        }),
        auth: 'Bearer JWT',
        status: '201 Created',
      },
      {
        method: 'GET',
        path: '/api/v1/records/:id',
        summary: pick({
          ko: '단일 엔터티 상세 정보 및 관계 조회',
          en: 'Fetch single entity details and relations',
          ja: '単一エンティティ詳細およびリレーション取得',
          id: 'Ambil detail entitas tunggal dan relasinya',
        }),
        auth: 'Bearer JWT',
        status: '200 OK',
      },
      {
        method: 'PATCH',
        path: '/api/v1/records/:id/status',
        summary: pick({
          ko: '상태 파이프라인 원클릭 전이 (대기 ➔ 진행 ➔ 완료)',
          en: 'One-click status pipeline transition (Backlog ➔ Active ➔ Done)',
          ja: 'ステータスパイプライン遷移（待機 ➔ 進行 ➔ 完了）',
          id: 'Transisi status satu klik (Menunggu ➔ Berjalan ➔ Selesai)',
        }),
        auth: 'Bearer JWT',
        status: '200 OK',
      },
      {
        method: 'DELETE',
        path: '/api/v1/records/:id',
        summary: pick({
          ko: '소프트 삭제 (Soft Delete) 및 감사 로그 기록',
          en: 'Soft delete record & write audit log',
          ja: '論理削除（Soft Delete）および監査ログ記録',
          id: 'Hapus lunak (Soft Delete) & catat log audit',
        }),
        auth: 'Bearer JWT',
        status: '204 No Content',
      },
      {
        method: 'GET',
        path: '/api/v1/analytics/kpi',
        summary: pick({
          ko: '스프린트 KPI 및 배포 통계 실시간 집계',
          en: 'Real-time sprint KPI & deployment telemetry aggregation',
          ja: 'スプリント KPI・デプロイ統計のリアルタイム集計',
          id: 'Agregasi KPI sprint & statistik rilis real-time',
        }),
        auth: 'Bearer JWT',
        status: '200 OK',
      },
    ];
  }, [plan, language]);

  const handleCopyDevHubCode = async (content: string, key: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedDevHub(key);
      setTimeout(() => setCopiedDevHub(null), 2000);
    } catch (e) {
      console.error('Failed to copy Dev Hub code', e);
    }
  };

  // Copy current active markdown doc
  const handleCopyCurrentDoc = async () => {
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } catch (e) {
      console.error('Failed to copy document', e);
    }
  };

  // One-click Copy Vibe-Coding Prompt distilled from 00_EXECUTION_PLAYBOOK.md
  const handleCopyVibeCodingPrompt = async () => {
    try {
      const prompt = generatePlaybookVibePrompt({ plan, formInputs, lockedChapters });
      await navigator.clipboard.writeText(prompt);
      setCopiedVibePrompt(true);
      setTimeout(() => setCopiedVibePrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy vibe-coding prompt', e);
    }
  };

  // Download active single markdown file
  const handleDownloadCurrentDoc = () => {
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDoc.filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const activePromptText = useMemo(
    () => generatePrototypePrompt(plan, formInputs, lockedChapters),
    [plan, formInputs, lockedChapters]
  );

  const docImpactMap = useMemo(() => {
    const map: Record<string, 'updated' | 'locked' | 'idle'> = {};
    for (const d of docsList) {
      map[d.id] = getDocImpactStatus(d.id, formInputs, lockedChapters, updatedChapters);
    }
    return map;
  }, [docsList, formInputs, lockedChapters, updatedChapters]);

  const activeCodeValue = useMemo(() => {
    const overridden = codeOverrides[devHubSubTab];
    if (overridden !== undefined) return overridden;
    switch (devHubSubTab) {
      case 'typescript':
        return generatedTypeScript;
      case 'html':
        return prototypeHtml;
      case 'sql':
        return generatedSqlDdl;
      case 'prompt':
        return activePromptText;
      default:
        return JSON.stringify(generatedApiRoutes, null, 2);
    }
  }, [codeOverrides, devHubSubTab, generatedTypeScript, prototypeHtml, generatedSqlDdl, activePromptText, generatedApiRoutes]);

  const editorialCodeMirrorTheme = useMemo(
    () =>
      EditorView.theme(
        {
          '&': {
            backgroundColor: theme.tokens.canvas,
            color: theme.tokens.inkPrimary,
            fontSize: '12.5px',
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            height: '100%',
          },
          '.cm-scroller': {
            fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
            lineHeight: '1.7',
          },
          '.cm-content': {
            padding: '16px 0',
            caretColor: theme.tokens.inkPrimary,
          },
          '.cm-gutters': {
            backgroundColor: theme.tokens.stage,
            color: theme.tokens.inkMuted,
            borderRight: `1px solid ${theme.tokens.borderHairline}`,
            paddingRight: '4px',
          },
          '.cm-activeLineGutter': {
            backgroundColor: theme.tokens.subtle,
            color: theme.tokens.inkPrimary,
            fontWeight: '600',
          },
          '.cm-activeLine': {
            backgroundColor: theme.tokens.stage,
          },
          '.cm-selectionBackground, ::selection': {
            backgroundColor: `${theme.tokens.borderHairline} !important`,
          },
          '.cm-cursor': {
            borderLeftColor: theme.tokens.inkPrimary,
            borderLeftWidth: '2px',
          },
        },
        { dark: theme.isDark }
      ),
    [theme]
  );

  const codeMirrorExtensions = useMemo(() => {
    const base = [editorialCodeMirrorTheme, EditorView.lineWrapping];
    if (devHubSubTab === 'typescript') {
      return [...base, javascript({ typescript: true })];
    }
    if (devHubSubTab === 'html') {
      return [...base, htmlLang()];
    }
    return base;
  }, [devHubSubTab, editorialCodeMirrorTheme]);

  const effectivePrototypeHtml = codeOverrides.html !== undefined ? codeOverrides.html : prototypeHtml;

  // Open standalone prototype in new tab
  const handleOpenStandalone = () => {
    const htmlToOpen = codeOverrides.html !== undefined
      ? codeOverrides.html
      : compileStandalonePrototypeHtml(plan, {
          formInputs,
          previewState,
          previewRole,
        });
    const blob = new Blob([htmlToOpen], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const activeStateShortLabel =
    previewState === 'empty'
      ? 'Empty'
      : previewState === 'error'
      ? 'Error'
      : previewState === 'role'
      ? previewRole === 'admin'
        ? 'Admin'
        : 'User'
      : null;

  return (
    <aside 
      style={width ? { width: `${width}px` } : undefined}
      className={`${width ? '' : 'w-full'} h-full flex flex-col bg-[var(--theme-stage)] p-5 sm:p-7 gap-4 shrink-0 select-none text-[var(--theme-ink-primary)] font-sans overflow-hidden`}
      aria-label={pick({ ko: '실시간 프로토타입 및 11종 사양서 프리뷰', en: 'Live Prototype & 11-Spec Preview', ja: 'リアルタイムプロトタイプ＆11種仕様書プレビュー', id: 'Pratinjau Prototipe & 11 Spesifikasi Langsung' })}
    >
      {/* Editorial Underline Tab Switcher */}
      <div className="flex items-center justify-center shrink-0 z-30 border-b border-[var(--theme-border-hairline)]" ref={stateMenuRef}>
        <div className="relative inline-flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('prototype')}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prototype'
                ? 'text-[var(--theme-ink-strong)] font-semibold'
                : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-medium'
            }`}
          >
            <span>{pick({ ko: '프리뷰', en: 'Preview', ja: 'プレビュー', id: 'Pratinjau' })}</span>
            {isSyncing && (
              <span className="text-[10px] text-[var(--theme-ink-muted)] font-normal">
                · {pick({ ko: '동기화', en: 'Syncing', ja: '同期中', id: 'Sinkron' })}
              </span>
            )}
            {activeTab === 'prototype' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--theme-ink-strong)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'docs'
                ? 'text-[var(--theme-ink-strong)] font-semibold'
                : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-medium'
            }`}
          >
            <span>{pick({ ko: '사양서', en: 'Specs', ja: '仕様書', id: 'Spesifikasi' })}</span>
            {activeTab === 'docs' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--theme-ink-strong)]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsStateMenuOpen(prev => !prev)}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              isStateMenuOpen || activeTab === 'devhub' || activeTab === 'sitemap' || activeStateShortLabel
                ? 'text-[var(--theme-ink-strong)] font-semibold'
                : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] font-medium'
            }`}
            aria-expanded={isStateMenuOpen}
            aria-label={pick({ ko: '프리뷰 상태 및 도구 선택', en: 'Select preview state and views', ja: 'プレビュー状態・ビュー選択', id: 'Pilih status & tampilan pratinjau' })}
          >
            <span>{pick({ ko: '상태 및 뷰', en: 'States & Views', ja: '状態・ビュー', id: 'Status & Tampilan' })}</span>
            {activeStateShortLabel && (
              <span className="text-[11px] font-sans text-[var(--theme-ink-secondary)] font-medium">
                · {activeStateShortLabel}
              </span>
            )}
            <ChevronDown size={13} className={`transition-transform duration-150 ${isStateMenuOpen ? 'rotate-180' : ''}`} />
            {(activeTab === 'devhub' || activeTab === 'sitemap') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--theme-ink-strong)]" />
            )}
          </button>

          {/* Clean Dropdown Menu for Preview State Switcher & Extra Views */}
          {isStateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] rounded-[2px] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.22)] p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.14em] text-[var(--theme-ink-muted)]">
                {pick({ ko: '프리뷰 상태 전환', en: 'Preview State Switcher', ja: 'プレビュー状態切替', id: 'Pengalih Status Pratinjau' })}
              </div>
              <div className="space-y-0.5 mt-1">
                {(
                  [
                    { id: 'default', label: pick({ ko: '기본 상태 (데이터 포함)', en: 'Default (Populated)', ja: 'デフォルト (データあり)', id: 'Default (Terisi)' }) },
                    { id: 'empty', label: pick({ ko: '빈 상태 (0건)', en: 'Empty State (0 Records)', ja: '空の状態 (0件)', id: 'Status Kosong (0 Data)' }) },
                    { id: 'error', label: pick({ ko: '차단 / 오류 상태', en: 'Blocked / Error State', ja: 'ブロック / エラー状態', id: 'Status Diblokir / Error' }) },
                    { id: 'role', label: pick({ ko: '역할: 관리자 vs 일반 사용자', en: 'Role: Admin vs. User', ja: '権限: 管理者 vs ユーザー', id: 'Peran: Admin vs Pengguna' }) },
                  ] as const
                ).map((mode) => {
                  const isActive = previewState === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setPreviewState(mode.id);
                        setActiveTab('prototype');
                        if (mode.id !== 'role') {
                          setIsStateMenuOpen(false);
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 rounded-[2px] text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] font-semibold'
                          : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                      }`}
                    >
                      <span>{mode.label}</span>
                      {isActive && <Check size={12} className="text-[var(--theme-ink-strong)]" />}
                    </button>
                  );
                })}
              </div>

              {previewState === 'role' && (
                <div className="mt-1.5 mx-1 p-1 bg-[var(--theme-stage)] rounded-[2px] flex items-center gap-1 border border-[var(--theme-border-hairline)]">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewRole('user');
                      setActiveTab('prototype');
                      setIsStateMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-[2px] text-[11px] font-medium transition-colors cursor-pointer ${
                      previewRole === 'user'
                        ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] font-semibold'
                        : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    {pick({ ko: '일반 사용자', en: 'Standard User', ja: '一般ユーザー', id: 'Pengguna Biasa' })}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewRole('admin');
                      setActiveTab('prototype');
                      setIsStateMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-[2px] text-[11px] font-medium transition-colors cursor-pointer ${
                      previewRole === 'admin'
                        ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] font-semibold'
                        : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    {pick({ ko: '관리자 / 운영자', en: 'Admin / Operator', ja: '管理者 / 運営', id: 'Admin / Operator' })}
                  </button>
                </div>
              )}

              <div className="my-2 border-t border-[var(--theme-border-hairline)]" />

              <div className="px-2 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.14em] text-[var(--theme-ink-muted)]">
                {pick({ ko: '뷰 및 화면 크기', en: 'Views & Viewport', ja: 'ビュー＆画面サイズ', id: 'Tampilan & Viewport' })}
              </div>
              <div className="space-y-0.5 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('devhub');
                    setIsStateMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-[2px] text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'devhub'
                      ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                  }`}
                >
                  <span className="flex items-center gap-2"><Code size={12} /> {pick({ ko: '코드 뷰', en: 'Code View', ja: 'コードビュー', id: 'Tampilan Kode' })}</span>
                  {activeTab === 'devhub' && <Check size={12} />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('sitemap');
                    setIsStateMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-[2px] text-left flex items-center justify-between transition-colors cursor-pointer ${
                    activeTab === 'sitemap'
                      ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                  }`}
                >
                  <span className="flex items-center gap-2"><Network size={12} /> {pick({ ko: '사이트맵', en: 'Sitemap', ja: 'サイトマップ', id: 'Peta Situs' })}</span>
                  {activeTab === 'sitemap' && <Check size={12} />}
                </button>
              </div>

              <div className="mt-2 px-1 flex items-center gap-1 bg-[var(--theme-stage)] p-1 rounded-[2px] border border-[var(--theme-border-hairline)]">
                {(
                  [
                    { id: 'desktop', label: 'Desktop', Icon: Monitor },
                    { id: 'tablet', label: 'Tablet', Icon: Tablet },
                    { id: 'mobile', label: 'Mobile', Icon: Smartphone },
                  ] as const
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setViewportMode(id);
                      setActiveTab('prototype');
                      setIsStateMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-[2px] text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      viewportMode === id
                        ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] font-semibold'
                        : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    <Icon size={11} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-[var(--theme-border-hairline)]" />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setReloadKey(k => k + 1);
                    setIsStateMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>{pick({ ko: '새로고침', en: 'Reload', ja: '再読込', id: 'Muat Ulang' })}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenStandalone();
                    setIsStateMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={11} />
                  <span>{pick({ ko: '새 창', en: 'New Tab', ja: '別タブ', id: 'Tab Baru' })}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsStateMenuOpen(false);
                    navigate('/export');
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-subtle)] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Bot size={11} />
                  <span>{pick({ ko: '프롬프트', en: 'Prompt', ja: 'プロンプト', id: 'Prompt' })}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exhibition Piece Surface (Sharp Architectural Frame on Warm Hanji / Nocturnal Ink Mat) */}
      <div className="flex-1 min-h-0 w-full bg-[var(--theme-elevated)] rounded-none border border-[var(--theme-border-hairline)] shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] overflow-hidden relative flex flex-col">
        {/* TAB 1: Live Interactive Prototype (Fixed Crisp White Paper Canvas for Target App Preview) */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            <div className={`flex-1 overflow-auto flex items-center justify-center ${
              viewportMode === 'desktop' ? 'bg-[#FFFFFF]' : 'bg-[var(--theme-stage)] p-4 sm:p-6'
            }`}>
              {viewportMode === 'desktop' ? (
                <iframe
                  ref={iframeRef}
                  key={reloadKey}
                  onLoad={handleIframeLoad}
                  srcDoc={effectivePrototypeHtml}
                  title="Interactive Prototype Preview"
                  sandbox="allow-scripts allow-forms allow-modals"
                  className="w-full h-full border-0 bg-[#FFFFFF]"
                />
              ) : viewportMode === 'tablet' ? (
                <div className="w-[768px] max-w-full h-full max-h-[960px] rounded-[2px] border border-[var(--theme-border-strong)] shadow-[0_12px_32px_-8px_rgba(0,0,0,0.18)] overflow-hidden bg-[#FFFFFF] flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    onLoad={handleIframeLoad}
                    srcDoc={effectivePrototypeHtml}
                    title="Tablet Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-[#FFFFFF]"
                  />
                </div>
              ) : (
                <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[24px] border-[5px] border-[var(--theme-ink-primary)] shadow-[0_16px_40px_-8px_rgba(0,0,0,0.22)] overflow-hidden bg-[#FFFFFF] flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    onLoad={handleIframeLoad}
                    srcDoc={effectivePrototypeHtml}
                    title="Mobile Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-[#FFFFFF]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 11-Doc Markdown Blueprint Viewer (Fixed Crisp White Paper Sheet for Spec Reader) */}
        {activeTab === 'docs' && (
          <div className="w-full h-full flex flex-col bg-[var(--theme-canvas)]">
            <div className="px-5 py-3 bg-[var(--theme-stage)] border-b border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between gap-2.5 shrink-0 no-print">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative w-36 sm:w-44">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--theme-ink-muted)]" />
                  <input
                    type="text"
                    value={docFilterQuery}
                    onChange={(e) => setDocFilterQuery(e.target.value)}
                    placeholder={pick({ ko: '사양서 검색...', en: 'Search specs...', ja: '仕様書検索...', id: 'Cari spesifikasi...' })}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-sans bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] rounded-[2px] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)] focus:outline-none focus:border-[var(--theme-ink-strong)]"
                  />
                </div>

                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="flex-1 min-h-[32px] text-xs font-sans bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] rounded-[2px] px-3 py-1.5 text-[var(--theme-ink-primary)] focus:outline-none focus:border-[var(--theme-ink-strong)] truncate cursor-pointer"
                >
                  {filteredDocs.map((doc) => {
                    const status = docImpactMap[doc.id] || 'idle';
                    const statusSuffix = status === 'locked' ? ' [Locked]' : status === 'updated' ? ' [Updated]' : '';
                    const numLabel = doc.docNumber === 0 ? '[00]' : doc.docNumber <= 11 ? `[${String(doc.docNumber).padStart(2, '0')}]` : '[★]';
                    return (
                      <option key={doc.id} value={doc.id}>
                        {numLabel} {doc.filename} - {doc.title}{statusSuffix}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="flex items-center gap-1 mr-1">
                  <button
                    type="button"
                    onClick={handlePrevDoc}
                    disabled={activeDocIndex <= 0}
                    title={pick({ ko: '이전 문서', en: 'Previous document', ja: '前の文書', id: 'Dokumen sebelumnya' })}
                    className="p-1.5 rounded-[2px] text-[var(--theme-ink-secondary)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] hover:text-[var(--theme-ink-strong)] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[11px] font-sans text-[var(--theme-ink-secondary)] px-1 tabular-nums">
                    {activeDocIndex + 1}/{docsList.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDoc}
                    disabled={activeDocIndex >= docsList.length - 1}
                    title={pick({ ko: '다음 문서', en: 'Next document', ja: '次の文書', id: 'Dokumen berikutnya' })}
                    className="p-1.5 rounded-[2px] text-[var(--theme-ink-secondary)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] hover:text-[var(--theme-ink-strong)] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCurrentDoc}
                  title={pick({ ko: '이 사양서 파일만 다운로드 (.md)', en: 'Download this spec file (.md)', ja: 'この仕様書のみダウンロード (.md)', id: 'Unduh file spesifikasi ini (.md)' })}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] text-xs text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileDown size={13} className="text-[var(--theme-ink-strong)]" />
                  <span className="hidden sm:inline">{pick({ ko: '.md 저장', en: 'Save .md', ja: '.md 保存', id: 'Simpan .md' })}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyVibeCodingPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[var(--theme-subtle)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] text-xs text-[var(--theme-ink-primary)] font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedVibePrompt ? (
                    <>
                      <Check size={13} />
                      <span>{pick({ ko: '프롬프트 복사됨', en: 'Prompt Copied', ja: 'プロンプトコピー済', id: 'Prompt Disalin' })}</span>
                    </>
                  ) : (
                    <>
                      <Bot size={13} />
                      <span>{pick({ ko: '바이브코딩 프롬프트 복사', en: 'Copy Vibe-Coding Prompt', ja: 'Vibe-Coding プロンプトコピー', id: 'Salin Prompt Vibe-Coding' })}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentDoc}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] text-xs text-[var(--theme-ink-primary)] font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedDoc ? (
                    <>
                      <Check size={13} className="text-[var(--theme-success)]" />
                      <span className="text-[var(--theme-success)]">{pick({ ko: '복사됨', en: 'Copied', ja: 'コピー済', id: 'Disalin' })}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{pick({ ko: '복사', en: 'Copy', ja: 'コピー', id: 'Salin' })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spec Impact Strip (Sharp Rectangular Index Tabs, Zero Pills) */}
            <div className="px-5 py-2.5 bg-[var(--theme-canvas)] border-b border-[var(--theme-border-hairline)] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 no-print">
              {filteredDocs.map((doc) => {
                const isActive = doc.id === selectedDocId;
                const isPlaybook = doc.id === '00_EXECUTION_PLAYBOOK';
                const status = docImpactMap[doc.id] || 'idle';
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-[11px] font-sans transition-colors cursor-pointer whitespace-nowrap shrink-0 border ${
                      isActive
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-active-bg)] font-semibold'
                        : isPlaybook
                        ? 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-strong)] hover:border-[var(--theme-ink-strong)] font-semibold'
                        : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] border-[var(--theme-border-hairline)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-border-strong)]'
                    }`}
                    title={`${doc.relativePath} · ${
                      status === 'locked' ? 'Locked' : status === 'updated' ? 'Updated' : 'Synced'
                    }`}
                  >
                    {isPlaybook && (
                      <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${
                        isActive ? 'opacity-85' : 'text-[var(--theme-ink-muted)]'
                      }`}>
                        Playbook ·
                      </span>
                    )}
                    <span>{doc.filename}</span>
                    {!isPlaybook && status !== 'idle' && (
                      <span
                        className={`text-[10px] font-sans font-medium ${
                          isActive
                            ? 'opacity-85'
                            : status === 'locked'
                            ? 'text-[var(--theme-ink-primary)]'
                            : 'text-[var(--theme-success)]'
                        }`}
                      >
                        · {status === 'locked' ? 'Locked' : 'Updated'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Document Reader: Fixed Crisp White Paper (#FFFFFF / #111111) */}
            <div
              data-paper-fixed="true"
              className="paper-sheet flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-[#FFFFFF] text-[#111111] custom-scroll"
            >
              <div className="max-w-3xl mx-auto space-y-5">
                <div className="flex items-center justify-between gap-2 text-xs pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-sans text-[#111111] font-semibold shrink-0">{activeDoc.relativePath}</span>
                    <span className="text-[#CBC8BF] shrink-0">·</span>
                    <span className="text-[#52524E] truncate">{activeDoc.description}</span>
                  </div>
                  {docImpactMap[activeDoc.id] && docImpactMap[activeDoc.id] !== 'idle' && (
                    <span
                      className={`text-[11px] font-medium whitespace-nowrap shrink-0 ${
                        docImpactMap[activeDoc.id] === 'locked'
                          ? 'text-[#111111]'
                          : 'text-[#1F5132]'
                      }`}
                    >
                      {docImpactMap[activeDoc.id] === 'locked' ? 'Locked' : 'Updated'}
                    </span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap leading-[1.8] text-[#1C1C1A] font-mono text-xs sm:text-[13px] select-text">
                  {activeDoc.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Raw Code View (Theme-Aware CodeMirror + API Contracts) */}
        {activeTab === 'devhub' && (
          <div className="w-full h-full flex flex-col bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)]">
            <div className="px-5 py-2.5 bg-[var(--theme-stage)] border-b border-[var(--theme-border-hairline)] flex flex-wrap items-center justify-between shrink-0 select-none gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDevHubSubTab('typescript')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'typescript'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)]'
                  }`}
                >
                  <Code size={12} />
                  <span>TS & Zod</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('html')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'html'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)]'
                  }`}
                >
                  <FileCode size={12} />
                  <span>HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('sql')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'sql'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)]'
                  }`}
                >
                  <Database size={12} />
                  <span>SQL DDL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('api')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'api'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)]'
                  }`}
                >
                  <Layers size={12} />
                  <span>REST API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('prompt')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'prompt'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                      : 'text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:bg-[var(--theme-canvas)]'
                  }`}
                >
                  <Bot size={12} />
                  <span>AI Prompt</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {devHubSubTab !== 'api' && codeOverrides[devHubSubTab] !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      setCodeOverrides(prev => {
                        const next = { ...prev };
                        delete next[devHubSubTab];
                        return next;
                      });
                    }}
                    className="px-2.5 py-1.5 rounded-[2px] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-danger-bg)] hover:text-[var(--theme-danger)] text-[var(--theme-ink-secondary)] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title={pick({ ko: '자동 생성 코드로 되돌리기', en: 'Reset to auto-generated code', ja: '自動生成コードに戻す', id: 'Kembalikan ke kode otomatis' })}
                  >
                    <RotateCcw size={12} />
                    <span>{pick({ ko: '초기화', en: 'Reset', ja: 'リセット', id: 'Reset' })}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyDevHubCode(activeCodeValue, devHubSubTab)}
                  className="px-3 py-1.5 rounded-[2px] bg-[var(--theme-subtle)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] text-[var(--theme-ink-primary)] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedDevHub === devHubSubTab ? (
                    <>
                      <CheckCheck size={13} />
                      <span className="font-semibold">{pick({ ko: '복사됨', en: 'Copied', ja: 'コピー済', id: 'Disalin' })}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>{pick({ ko: '코드 복사', en: 'Copy Code', ja: 'コードコピー', id: 'Salin Kode' })}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-[var(--theme-canvas)]">
              {devHubSubTab === 'api' ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
                  <div className="flex items-center justify-between text-[var(--theme-ink-secondary)] text-xs pb-2 border-b border-[var(--theme-border-hairline)]">
                    <span className="font-sans font-semibold text-[var(--theme-ink-primary)]">API Endpoint Contracts</span>
                    <span className="font-sans">RESTful / JSON Payload</span>
                  </div>
                  <div className="space-y-3">
                    {generatedApiRoutes.map((api, idx) => (
                      <div key={idx} className="p-4 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-[2px] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-sans font-bold shrink-0 ${
                              api.method === 'GET' ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]' :
                              api.method === 'POST' ? 'bg-[var(--theme-success-bg)] text-[var(--theme-success)] border border-[var(--theme-success)]/25' :
                              api.method === 'PATCH' ? 'bg-[var(--theme-warning-bg)] text-[var(--theme-warning)] border border-[var(--theme-warning)]/25' :
                              'bg-[var(--theme-danger-bg)] text-[var(--theme-danger)] border border-[var(--theme-danger)]/25'
                            }`}>
                              {api.method}
                            </span>
                            <span className="font-sans text-xs font-semibold text-[var(--theme-ink-primary)] truncate">{api.path}</span>
                          </div>
                          <span className="text-[11px] font-sans text-[var(--theme-ink-muted)] shrink-0">{api.status}</span>
                        </div>
                        <p className="text-xs text-[var(--theme-ink-secondary)] leading-relaxed">{api.summary}</p>
                        <div className="flex items-center gap-2 text-[11px] font-sans text-[var(--theme-ink-muted)] pt-1">
                          <span>{pick({ ko: '인증', en: 'Auth', ja: '認証', id: 'Autentikasi' })}: {api.auth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="px-5 py-2 bg-[var(--theme-canvas)] border-b border-[var(--theme-border-hairline)] flex items-center justify-between text-[11px] font-sans text-[var(--theme-ink-muted)] shrink-0">
                    <span>
                      {devHubSubTab === 'typescript'
                        ? 'src/types/schema.ts'
                        : devHubSubTab === 'html'
                        ? 'prototype.html'
                        : devHubSubTab === 'sql'
                        ? 'migrations/0001_initial_schema.sql'
                        : '.cursorrules / CLAUDE.md Execution Prompt'}
                    </span>
                    <span>
                      {devHubSubTab === 'typescript'
                        ? 'TypeScript 5.8 · Zod 3.x'
                        : devHubSubTab === 'html'
                        ? 'Standalone Prototype HTML · Live Editable'
                        : devHubSubTab === 'sql'
                        ? 'PostgreSQL / Cloudflare D1 / Supabase'
                        : 'Prototype-as-Spec Reverse Engineering'}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <CodeMirror
                      value={activeCodeValue}
                      height="100%"
                      theme={theme.isDark ? 'dark' : 'light'}
                      extensions={codeMirrorExtensions}
                      editable={true}
                      onChange={(val) => {
                        setCodeOverrides(prev => ({ ...prev, [devHubSubTab]: val }));
                      }}
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightActiveLine: true,
                        foldGutter: true,
                      }}
                      className="h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Visual Sitemap & Real-time D3 Tree */}
        {activeTab === 'sitemap' && (
          <div className="w-full h-full flex flex-col overflow-hidden bg-[var(--theme-canvas)]">
            <VisualSitemap 
              plan={plan}
              formInputs={formInputs}
              onSelectChapter={onSelectChapter}
              onSelectSection={onSelectSection}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
