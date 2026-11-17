import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileCode, RefreshCw, ExternalLink, 
  Copy, Check, ChevronLeft, ChevronRight, ChevronDown,
  Monitor, Tablet, Smartphone, Search, FileDown, X,
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

const editorialCodeMirrorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#FFFFFF',
    color: '#111111',
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
    caretColor: '#111111',
  },
  '.cm-gutters': {
    backgroundColor: '#F6F5F1',
    color: '#8C8B85',
    borderRight: '1px solid #E4E2DC',
    paddingRight: '4px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#EFEDE7',
    color: '#111111',
    fontWeight: '600',
  },
  '.cm-activeLine': {
    backgroundColor: '#F6F5F1',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: '#E4E2DC !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#111111',
    borderLeftWidth: '2px',
  },
}, { dark: false });

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
  const [activeTab, setActiveTab] = useState<PreviewTab>('prototype');
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => 
    plan.metadata?.platform === 'APP' ? 'mobile' : 'desktop'
  );
  const [devHubSubTab, setDevHubSubTab] = useState<DevHubSubTab>('typescript');
  const [codeOverrides, setCodeOverrides] = useState<Partial<Record<DevHubSubTab, string>>>({});
  const [copiedDevHub, setCopiedDevHub] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [docFilterQuery, setDocFilterQuery] = useState<string>('');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedVibePrompt, setCopiedVibePrompt] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
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

  // Copy Prototype-as-Spec golden prompt for Cursor/Claude
  const handleCopyAgentPrompt = async () => {
    try {
      const prompt = generatePrototypePrompt(plan, formInputs, lockedChapters);
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy agent prompt', e);
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
    const pages = plan.navigation?.pageStructure || [];
    return [
      { method: 'GET', path: '/api/v1/records', summary: '전체 목록 조회 (상태 필터링, 검색, 페이지네이션)', auth: 'Bearer JWT', status: '200 OK' },
      { method: 'POST', path: '/api/v1/records', summary: '신규 엔터티 생성 (Zod 검증 및 트랜잭션 커밋)', auth: 'Bearer JWT', status: '201 Created' },
      { method: 'GET', path: '/api/v1/records/:id', summary: '단일 엔터티 상세 정보 및 관계 조회', auth: 'Bearer JWT', status: '200 OK' },
      { method: 'PATCH', path: '/api/v1/records/:id/status', summary: '상태 파이프라인 원클릭 전이 (대기 ➔ 진행 ➔ 완료)', auth: 'Bearer JWT', status: '200 OK' },
      { method: 'DELETE', path: '/api/v1/records/:id', summary: '소프트 삭제 (Soft Delete) 및 감사 로그 기록', auth: 'Bearer JWT', status: '204 No Content' },
      { method: 'GET', path: '/api/v1/analytics/kpi', summary: '스프린트 KPI 및 배포 통계 실시간 집계', auth: 'Bearer JWT', status: '200 OK' }
    ];
  }, [plan]);

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

  const codeMirrorExtensions = useMemo(() => {
    const base = [editorialCodeMirrorTheme, EditorView.lineWrapping];
    if (devHubSubTab === 'typescript') {
      return [...base, javascript({ typescript: true })];
    }
    if (devHubSubTab === 'html') {
      return [...base, htmlLang()];
    }
    return base;
  }, [devHubSubTab]);

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
      className={`${width ? '' : 'w-full'} h-full flex flex-col bg-[#F6F5F1] p-5 sm:p-7 gap-4 shrink-0 select-none text-[#111111] font-sans overflow-hidden`}
      aria-label="실시간 프로토타입 및 11종 사양서 프리뷰"
    >
      {/* Editorial Underline Tab Switcher (프리뷰 | 사양서 | 상태 ▾) */}
      <div className="flex items-center justify-center shrink-0 z-30 border-b border-[#E4E2DC]" ref={stateMenuRef}>
        <div className="relative inline-flex items-center gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('prototype')}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prototype'
                ? 'text-[#111111] font-semibold'
                : 'text-[#52524E] hover:text-[#111111] font-medium'
            }`}
          >
            <span>프리뷰</span>
            {isSyncing && (
              <span className="text-[10px] text-[#8C8B85] font-normal">· 동기화</span>
            )}
            {activeTab === 'prototype' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'docs'
                ? 'text-[#111111] font-semibold'
                : 'text-[#52524E] hover:text-[#111111] font-medium'
            }`}
          >
            <span>사양서</span>
            {activeTab === 'docs' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsStateMenuOpen(prev => !prev)}
            className={`relative pb-2.5 text-[13px] transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              isStateMenuOpen || activeTab === 'devhub' || activeTab === 'sitemap' || activeStateShortLabel
                ? 'text-[#111111] font-semibold'
                : 'text-[#52524E] hover:text-[#111111] font-medium'
            }`}
            aria-expanded={isStateMenuOpen}
            aria-label="프리뷰 상태 및 도구 선택"
          >
            <span>상태 및 뷰</span>
            {activeStateShortLabel && (
              <span className="text-[11px] font-sans text-[#52524E] font-medium">
                · {activeStateShortLabel}
              </span>
            )}
            <ChevronDown size={13} className={`transition-transform duration-150 ${isStateMenuOpen ? 'rotate-180' : ''}`} />
            {(activeTab === 'devhub' || activeTab === 'sitemap') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#111111]" />
            )}
          </button>

          {/* Clean Dropdown Menu for Preview State Switcher & Extra Views */}
          {isStateMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[#FFFFFF] border border-[#CBC8BF] rounded-[2px] shadow-[0_12px_28px_-8px_rgba(17,17,17,0.12)] p-2 z-50 text-xs">
              <div className="px-2 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.14em] text-[#8C8B85]">
                Preview State Switcher
              </div>
              <div className="space-y-0.5 mt-1">
                {(
                  [
                    { id: 'default', label: 'Default (Populated)' },
                    { id: 'empty', label: 'Empty State (0 Records)' },
                    { id: 'error', label: 'Blocked / Error State' },
                    { id: 'role', label: 'Role: Admin vs. User' },
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
                          ? 'bg-[#EFEDE7] text-[#111111] font-semibold'
                          : 'text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1]'
                      }`}
                    >
                      <span>{mode.label}</span>
                      {isActive && <Check size={12} className="text-[#111111]" />}
                    </button>
                  );
                })}
              </div>

              {previewState === 'role' && (
                <div className="mt-1.5 mx-1 p-1 bg-[#F6F5F1] rounded-[2px] flex items-center gap-1 border border-[#E4E2DC]">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewRole('user');
                      setActiveTab('prototype');
                      setIsStateMenuOpen(false);
                    }}
                    className={`flex-1 py-1 rounded-[2px] text-[11px] font-medium transition-colors cursor-pointer ${
                      previewRole === 'user'
                        ? 'bg-[#111111] text-[#FFFFFF] font-semibold'
                        : 'text-[#52524E] hover:text-[#111111]'
                    }`}
                  >
                    Standard User
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
                        ? 'bg-[#111111] text-[#FFFFFF] font-semibold'
                        : 'text-[#52524E] hover:text-[#111111]'
                    }`}
                  >
                    Admin / Operator
                  </button>
                </div>
              )}

              <div className="my-2 border-t border-[#E4E2DC]" />

              <div className="px-2 py-1 text-[10px] font-sans font-medium uppercase tracking-[0.14em] text-[#8C8B85]">
                Views &amp; Viewport
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
                      ? 'bg-[#EFEDE7] text-[#111111] font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1]'
                  }`}
                >
                  <span className="flex items-center gap-2"><Code size={12} /> 코드 뷰</span>
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
                      ? 'bg-[#EFEDE7] text-[#111111] font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1]'
                  }`}
                >
                  <span className="flex items-center gap-2"><Network size={12} /> 사이트맵</span>
                  {activeTab === 'sitemap' && <Check size={12} />}
                </button>
              </div>

              <div className="mt-2 px-1 flex items-center gap-1 bg-[#F6F5F1] p-1 rounded-[2px] border border-[#E4E2DC]">
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
                        ? 'bg-[#111111] text-[#FFFFFF] font-semibold'
                        : 'text-[#52524E] hover:text-[#111111]'
                    }`}
                  >
                    <Icon size={11} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="my-2 border-t border-[#E4E2DC]" />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setReloadKey(k => k + 1);
                    setIsStateMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>새로고침</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenStandalone();
                    setIsStateMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[#52524E] hover:text-[#111111] hover:bg-[#F6F5F1] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ExternalLink size={11} />
                  <span>새 창</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPromptModalOpen(true);
                    setIsStateMenuOpen(false);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-[2px] text-[11px] text-[#52524E] hover:text-[#111111] hover:bg-[#EFEDE7] flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Bot size={11} />
                  <span>프롬프트</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exhibition Piece Surface (Sharp Architectural Frame on Warm Hanji Mat) */}
      <div className="flex-1 min-h-0 w-full bg-[#FFFFFF] rounded-none border border-[#E4E2DC] shadow-[0_8px_24px_-12px_rgba(17,17,17,0.08)] overflow-hidden relative flex flex-col">
        {/* TAB 1: Live Interactive Prototype */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            <div className={`flex-1 overflow-auto flex items-center justify-center ${
              viewportMode === 'desktop' ? 'bg-white' : 'bg-[#F6F5F1]/65 p-4 sm:p-6'
            }`}>
              {viewportMode === 'desktop' ? (
                <iframe
                  ref={iframeRef}
                  key={reloadKey}
                  onLoad={handleIframeLoad}
                  srcDoc={effectivePrototypeHtml}
                  title="Interactive Prototype Preview"
                  sandbox="allow-scripts allow-forms allow-modals"
                  className="w-full h-full border-0 bg-white"
                />
              ) : viewportMode === 'tablet' ? (
                <div className="w-[768px] max-w-full h-full max-h-[960px] rounded-[2px] border border-[#CBC8BF] shadow-[0_12px_32px_-8px_rgba(17,17,17,0.1)] overflow-hidden bg-white flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    onLoad={handleIframeLoad}
                    srcDoc={effectivePrototypeHtml}
                    title="Tablet Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[24px] border-[5px] border-[#111111] shadow-[0_16px_40px_-8px_rgba(17,17,17,0.16)] overflow-hidden bg-white flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    onLoad={handleIframeLoad}
                    srcDoc={effectivePrototypeHtml}
                    title="Mobile Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 11-Doc Markdown Blueprint Viewer (Document Spec View) */}
        {activeTab === 'docs' && (
          <div className="w-full h-full flex flex-col bg-white">
            <div className="px-5 py-3 bg-[#F6F5F1]/70 border-b border-[#E4E2DC] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative w-36 sm:w-44">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8C8B85]" />
                  <input
                    type="text"
                    value={docFilterQuery}
                    onChange={(e) => setDocFilterQuery(e.target.value)}
                    placeholder="사양서 검색..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-sans bg-white border border-[#CBC8BF] rounded-[2px] text-[#111111] placeholder-[#8C8B85] focus:outline-none focus:border-[#111111]"
                  />
                </div>

                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="flex-1 min-h-[32px] text-xs font-sans bg-white border border-[#CBC8BF] rounded-[2px] px-3 py-1.5 text-[#111111] focus:outline-none focus:border-[#111111] truncate cursor-pointer"
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
                    title="이전 문서"
                    className="p-1.5 rounded-[2px] text-[#52524E] bg-white border border-[#E4E2DC] hover:border-[#111111] hover:text-[#111111] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[11px] font-sans text-[#52524E] px-1 tabular-nums">
                    {activeDocIndex + 1}/{docsList.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDoc}
                    disabled={activeDocIndex >= docsList.length - 1}
                    title="다음 문서"
                    className="p-1.5 rounded-[2px] text-[#52524E] bg-white border border-[#E4E2DC] hover:border-[#111111] hover:text-[#111111] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCurrentDoc}
                  title="이 사양서 파일만 다운로드 (.md)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-white border border-[#E4E2DC] text-xs text-[#52524E] hover:text-[#111111] hover:border-[#111111] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <FileDown size={13} className="text-[#111111]" />
                  <span className="hidden sm:inline">.md 저장</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyVibeCodingPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#EFEDE7] hover:bg-[#111111] hover:text-[#FFFFFF] text-xs text-[#111111] font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedVibePrompt ? (
                    <>
                      <Check size={13} />
                      <span>Prompt Copied</span>
                    </>
                  ) : (
                    <>
                      <Bot size={13} />
                      <span>Copy Vibe-Coding Prompt</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentDoc}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-white border border-[#E4E2DC] hover:border-[#111111] text-xs text-[#111111] font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedDoc ? (
                    <>
                      <Check size={13} className="text-[#1F5132]" />
                      <span className="text-[#1F5132]">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Spec Impact Strip (Sharp Rectangular Index Tabs, Zero Pills) */}
            <div className="px-5 py-2.5 bg-[#FFFFFF] border-b border-[#E4E2DC] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
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
                        ? 'bg-[#111111] text-[#FFFFFF] border-[#111111] font-semibold'
                        : isPlaybook
                        ? 'bg-[#F6F5F1] text-[#111111] border-[#CBC8BF] hover:border-[#111111] font-semibold'
                        : 'bg-[#FFFFFF] text-[#52524E] border-[#E4E2DC] hover:text-[#111111] hover:border-[#CBC8BF]'
                    }`}
                    title={`${doc.relativePath} · ${
                      status === 'locked' ? 'Locked' : status === 'updated' ? 'Updated' : 'Synced'
                    }`}
                  >
                    {isPlaybook && (
                      <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${
                        isActive ? 'text-[#FFFFFF]/80' : 'text-[#8C8B85]'
                      }`}>
                        Playbook ·
                      </span>
                    )}
                    <span>{doc.filename}</span>
                    {!isPlaybook && status !== 'idle' && (
                      <span
                        className={`text-[10px] font-sans font-medium ${
                          isActive
                            ? 'text-[#FFFFFF]/80'
                            : status === 'locked'
                            ? 'text-[#111111]'
                            : 'text-[#1F5132]'
                        }`}
                      >
                        · {status === 'locked' ? 'Locked' : 'Updated'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Document Reader */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-white custom-scroll">
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

        {/* Golden Prompt Modal */}
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-xs select-none">
            <div className="w-full max-w-2xl bg-white rounded-[2px] border border-[#CBC8BF] shadow-[0_24px_48px_-12px_rgba(17,17,17,0.2)] flex flex-col overflow-hidden text-[#111111]">
              <div className="px-5 py-4 bg-[#F6F5F1] border-b border-[#E4E2DC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#111111]" />
                  <h3 className="font-sans font-semibold text-sm text-[#111111]">
                    에이전트 지시 골든 프롬프트 (Golden Prompt)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="p-1.5 rounded-[2px] text-[#52524E] hover:text-[#111111] hover:bg-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#1C1C1A] bg-white custom-scroll">
                <pre className="whitespace-pre-wrap select-text">
                  {activePromptText}
                </pre>
              </div>

              <div className="px-5 py-3.5 border-t border-[#E4E2DC] bg-[#F6F5F1] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#52524E] font-sans">
                  Cursor 또는 Claude Code 창에 붙여넣으면 프로토타입 기반으로 개발을 시작합니다.
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await handleCopyAgentPrompt();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-[2px] bg-[#111111] text-white text-xs font-medium hover:bg-[#2A2A28] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Copy size={13} />
                  <span>프롬프트 복사하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Raw Code View (Light CodeMirror + API Contracts) */}
        {activeTab === 'devhub' && (
          <div className="w-full h-full flex flex-col bg-white text-[#111111]">
            <div className="px-5 py-2.5 bg-[#F6F5F1]/70 border-b border-[#E4E2DC] flex flex-wrap items-center justify-between shrink-0 select-none gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDevHubSubTab('typescript')}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-[2px] transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'typescript'
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-white'
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
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-white'
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
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-white'
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
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-white'
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
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-white'
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
                    className="px-2.5 py-1.5 rounded-[2px] bg-white border border-[#E4E2DC] hover:bg-[#FBF3F2] hover:text-[#8B261D] text-[#52524E] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title="자동 생성 코드로 되돌리기"
                  >
                    <RotateCcw size={12} />
                    <span>초기화</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyDevHubCode(activeCodeValue, devHubSubTab)}
                  className="px-3 py-1.5 rounded-[2px] bg-[#EFEDE7] hover:bg-[#111111] hover:text-[#FFFFFF] text-[#111111] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  {copiedDevHub === devHubSubTab ? (
                    <>
                      <CheckCheck size={13} />
                      <span className="font-semibold">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>코드 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
              {devHubSubTab === 'api' ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
                  <div className="flex items-center justify-between text-[#52524E] text-xs pb-2 border-b border-[#E4E2DC]">
                    <span className="font-sans font-semibold text-[#111111]">API Endpoint Contracts</span>
                    <span className="font-sans">RESTful / JSON Payload</span>
                  </div>
                  <div className="space-y-3">
                    {generatedApiRoutes.map((api, idx) => (
                      <div key={idx} className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] rounded-[2px] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-sans font-bold shrink-0 ${
                              api.method === 'GET' ? 'bg-[#111111] text-[#FFFFFF]' :
                              api.method === 'POST' ? 'bg-[#F3F7F4] text-[#1F5132] border border-[#1F5132]/20' :
                              api.method === 'PATCH' ? 'bg-[#FAF6EE] text-[#8A5314] border border-[#8A5314]/20' :
                              'bg-[#FBF3F2] text-[#8B261D] border border-[#8B261D]/20'
                            }`}>
                              {api.method}
                            </span>
                            <span className="font-sans text-xs font-semibold text-[#111111] truncate">{api.path}</span>
                          </div>
                          <span className="text-[11px] font-sans text-[#8C8B85] shrink-0">{api.status}</span>
                        </div>
                        <p className="text-xs text-[#52524E] leading-relaxed">{api.summary}</p>
                        <div className="flex items-center gap-2 text-[11px] font-sans text-[#8C8B85] pt-1">
                          <span>인증: {api.auth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="px-5 py-2 bg-white border-b border-[#E4E2DC] flex items-center justify-between text-[11px] font-sans text-[#8C8B85] shrink-0">
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
                      theme="light"
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
          <div className="w-full h-full flex flex-col overflow-hidden bg-white">
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
