import React, { useState, useMemo } from 'react';
import { 
  Play, FileCode, Network, RefreshCw, ExternalLink, 
  Copy, Check, ChevronLeft, ChevronRight,
  Monitor, Tablet, Smartphone, Search, FileDown, X,
  Code, Terminal, Database, Layers, CheckCheck, Bot, RotateCcw
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
import { getDocImpactStatus } from '../../lib/specImpact';
import { copyProjectJsonToClipboard } from '../../lib/projectFileIO';
import VisualSitemap from './VisualSitemap';
import { Tooltip } from '../guide/Tooltip';

interface SpecPreviewPanelProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  currentChapter: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
    color: '#111827',
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
    caretColor: '#1E3A8A',
  },
  '.cm-gutters': {
    backgroundColor: '#F7F8FA',
    color: '#9CA3AF',
    borderRight: '1px solid #E5E7EB',
    paddingRight: '4px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#EFF6FF',
    color: '#1E3A8A',
    fontWeight: '600',
  },
  '.cm-activeLine': {
    backgroundColor: '#F7F8FA',
  },
  '.cm-selectionBackground, ::selection': {
    backgroundColor: '#DBEAFE !important',
  },
  '.cm-cursor': {
    borderLeftColor: '#1E3A8A',
    borderLeftWidth: '2px',
  },
}, { dark: false });

export const SpecPreviewPanel: React.FC<SpecPreviewPanelProps> = ({
  plan,
  formInputs,
  currentChapter,
  isCollapsed = false,
  onToggleCollapse,
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
  const [selectedDocId, setSelectedDocId] = useState<string>('01_proposal');
  const [docFilterQuery, setDocFilterQuery] = useState<string>('');
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewStateMode>('default');
  const [previewRole, setPreviewRole] = useState<PreviewRoleMode>('user');
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const previewStateRef = React.useRef<PreviewStateMode>(previewState);
  previewStateRef.current = previewState;
  const previewRoleRef = React.useRef<PreviewRoleMode>(previewRole);
  previewRoleRef.current = previewRole;

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

  // Copy project backup JSON
  const handleCopyJson = async () => {
    const success = await copyProjectJsonToClipboard(plan);
    if (success) {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  // Download complete 11-markdown blueprint ZIP
  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      const { downloadBlueprintZip } = await import('../../lib/bundleZipDownloader');
      await downloadBlueprintZip(plan, formInputs, lockedChapters);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e: any) {
      console.error('ZIP 다운로드 실패:', e);
    } finally {
      setIsDownloadingZip(false);
    }
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

  // If collapsed, show a sleek ergonomic 52px rail
  if (isCollapsed) {
    return (
      <aside 
        className="w-[52px] h-full flex flex-col items-center bg-[#F7F8FA] border-l border-[#E5E7EB] shrink-0 select-none py-3 justify-between"
        aria-label="미리보기 패널 펼치기"
      >
        <div className="flex flex-col items-center gap-2.5 w-full px-1.5">
          <button
            onClick={onToggleCollapse}
            className="w-9 h-9 rounded-lg bg-[#FFFFFF] border border-[#E5E7EB] hover:bg-[#EFF6FF] text-[#4B5563] hover:text-[#1E3A8A] flex items-center justify-center transition-colors cursor-pointer"
            title="미리보기 패널 펼치기"
            aria-label="미리보기 패널 펼치기"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="w-6 h-px bg-[#E5E7EB]" />

          {/* Quick tab shortcuts that open panel directly to that tab */}
          <button
            onClick={() => { setActiveTab('prototype'); onToggleCollapse?.(); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#FFFFFF] transition-all cursor-pointer"
            title="프로토타입 보기 (펼치기)"
          >
            <Play size={14} className="fill-current text-[#1E3A8A]" />
          </button>
          <button
            onClick={() => { setActiveTab('docs'); onToggleCollapse?.(); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#FFFFFF] transition-all cursor-pointer"
            title="11종 사양서 보기 (펼치기)"
          >
            <FileCode size={15} />
          </button>
          <button
            onClick={() => { setActiveTab('devhub'); onToggleCollapse?.(); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#FFFFFF] transition-all cursor-pointer"
            title="개발자 허브 (코드 & DDL)"
          >
            <Terminal size={15} />
          </button>
          <button
            onClick={() => { setActiveTab('sitemap'); onToggleCollapse?.(); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#FFFFFF] transition-all cursor-pointer"
            title="사이트맵 보기 (펼치기)"
          >
            <Network size={15} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="[writing-mode:vertical-lr] text-[10px] font-mono uppercase tracking-widest text-[#9CA3AF] py-4 select-none">
            SPEC & PROTOTYPE
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-[#FFFFFF] text-[#4B5563] hover:text-[#1E3A8A] text-xs font-medium cursor-pointer"
            title="패널 펼치기"
          >
            열기
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside 
      style={width ? { width: `${width}px` } : undefined}
      className={`${width ? '' : 'w-full'} h-full flex flex-col bg-[#F7F8FA] p-4 sm:p-8 gap-5 shrink-0 select-none text-[#111827] font-sans overflow-hidden`}
      aria-label="실시간 프로토타입 및 11종 사양서 프리뷰"
    >
      {/* Single Floating Minimal Control Pill */}
      <div className="flex justify-center shrink-0 z-20">
        <div className="inline-flex items-center flex-wrap justify-center gap-1 bg-[#FFFFFF]/95 backdrop-blur-md rounded-full px-2 py-1.5 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.07)] border border-[#E5E7EB]/80 max-w-full">
          {/* Primary Stage Mode Switcher */}
          <button
            type="button"
            onClick={() => setActiveTab('prototype')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prototype'
                ? 'bg-[#1E3A8A] text-white font-semibold shadow-2xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] font-medium'
            }`}
          >
            <span>라이브 프리뷰</span>
            {isSyncing && (
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  activeTab === 'prototype' ? 'bg-white animate-ping' : 'bg-[#1E3A8A] animate-ping'
                }`}
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-[#1E3A8A] text-white font-semibold shadow-2xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] font-medium'
            }`}
          >
            <span>사양서 보기</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full tabular-nums leading-none ${
                activeTab === 'docs'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#EFF6FF] text-[#1E3A8A]'
              }`}
            >
              11
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('devhub')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'devhub'
                ? 'bg-[#1E3A8A] text-white font-semibold shadow-2xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] font-medium'
            }`}
          >
            <Code size={12} />
            <span>코드 뷰</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sitemap')}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sitemap'
                ? 'bg-[#1E3A8A] text-white font-semibold shadow-2xs'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] font-medium'
            }`}
          >
            <Network size={12} />
            <span>사이트맵</span>
          </button>

          <span className="w-px h-4 bg-[#E5E7EB] mx-1 hidden sm:block" aria-hidden="true" />

          {/* Contextual Stage Actions */}
          <div className="flex items-center gap-1">
            {activeTab === 'prototype' && (
              <>
                <div className="hidden sm:flex items-center bg-[#F7F8FA] rounded-full p-0.5">
                  <Tooltip content="데스크톱 뷰" position="bottom">
                    <button
                      type="button"
                      onClick={() => setViewportMode('desktop')}
                      className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        viewportMode === 'desktop'
                          ? 'bg-[#FFFFFF] text-[#1E3A8A] shadow-2xs'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                      aria-label="데스크톱 뷰"
                    >
                      <Monitor size={13} />
                    </button>
                  </Tooltip>
                  <Tooltip content="태블릿 뷰" position="bottom">
                    <button
                      type="button"
                      onClick={() => setViewportMode('tablet')}
                      className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        viewportMode === 'tablet'
                          ? 'bg-[#FFFFFF] text-[#1E3A8A] shadow-2xs'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                      aria-label="태블릿 뷰"
                    >
                      <Tablet size={13} />
                    </button>
                  </Tooltip>
                  <Tooltip content="스마트폰 뷰" position="bottom">
                    <button
                      type="button"
                      onClick={() => setViewportMode('mobile')}
                      className={`p-1.5 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        viewportMode === 'mobile'
                          ? 'bg-[#FFFFFF] text-[#1E3A8A] shadow-2xs'
                          : 'text-[#6B7280] hover:text-[#111827]'
                      }`}
                      aria-label="스마트폰 뷰"
                    >
                      <Smartphone size={13} />
                    </button>
                  </Tooltip>
                </div>

                <Tooltip content={copiedPrompt ? '복사 완료' : '개발용 프롬프트 복사'} position="bottom">
                  <button
                    type="button"
                    onClick={handleCopyAgentPrompt}
                    className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                      copiedPrompt
                        ? 'bg-[#F0FDF4] text-[#15803D]'
                        : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#EFF6FF]'
                    }`}
                    aria-label="개발용 프롬프트 복사"
                  >
                    {copiedPrompt ? <Check size={13} className="stroke-[2.5]" /> : <Copy size={13} />}
                  </button>
                </Tooltip>

                <Tooltip content="프롬프트 전문 확인" position="bottom">
                  <button
                    type="button"
                    onClick={() => setIsPromptModalOpen(true)}
                    className="p-1.5 rounded-full flex items-center justify-center text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    aria-label="프롬프트 전문 확인"
                  >
                    <Bot size={13} />
                  </button>
                </Tooltip>
              </>
            )}

            <Tooltip content="새로고침" position="bottom">
              <button
                type="button"
                onClick={() => setReloadKey(k => k + 1)}
                className="p-1.5 rounded-full flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                aria-label="새로고침"
              >
                <RefreshCw size={13} />
              </button>
            </Tooltip>

            <Tooltip content="새 창에서 실행" position="bottom">
              <button
                type="button"
                onClick={handleOpenStandalone}
                className="p-1.5 rounded-full flex items-center justify-center text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
                aria-label="새 창에서 실행"
              >
                <ExternalLink size={13} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Exhibition Piece Surface (bg-white rounded-2xl shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)]) */}
      <div className="flex-1 min-h-0 w-full bg-white rounded-2xl shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)] overflow-hidden relative flex flex-col">
        {/* TAB 1: Live Interactive Prototype */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            {/* Preview State Switcher — Clean, Borderless Segmented Pill Bar */}
            <div className="px-4 sm:px-6 pt-3.5 pb-3 bg-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div
                role="tablist"
                aria-label="Preview State Switcher"
                className="inline-flex items-center flex-wrap gap-1 bg-[#F7F8FA] p-1 rounded-full"
              >
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
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setPreviewState(mode.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-[#1E3A8A] text-white font-semibold'
                          : 'text-[#4B5563] hover:text-[#111827] font-medium'
                      }`}
                    >
                      {mode.label}
                    </button>
                  );
                })}
              </div>

              {previewState === 'role' && (
                <div
                  role="group"
                  aria-label="Role Preview Sub-toggle"
                  className="inline-flex items-center gap-1 bg-[#F7F8FA] p-1 rounded-full"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewRole('user')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                      previewRole === 'user'
                        ? 'bg-[#FFFFFF] text-[#1E3A8A] font-semibold shadow-2xs'
                        : 'text-[#4B5563] hover:text-[#111827] font-medium'
                    }`}
                  >
                    Standard User
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewRole('admin')}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                      previewRole === 'admin'
                        ? 'bg-[#FFFFFF] text-[#1E3A8A] font-semibold shadow-2xs'
                        : 'text-[#4B5563] hover:text-[#111827] font-medium'
                    }`}
                  >
                    Admin / Operator
                  </button>
                </div>
              )}
            </div>

            <div className={`flex-1 overflow-auto flex items-center justify-center ${
              viewportMode === 'desktop' ? 'bg-white' : 'bg-[#F7F8FA]/55 p-4 sm:p-6'
            }`}>
              {viewportMode === 'desktop' ? (
                <div className="w-full h-full flex flex-col bg-white">
                  {/* Minimal Light Browser Chrome */}
                  <div className="h-9 px-4 bg-[#F7F8FA]/70 border-y border-[#E5E7EB]/70 flex items-center justify-between text-xs text-[#6B7280] select-none shrink-0 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5E7EB]" />
                    </div>

                    <div className="flex-1 max-w-xs md:max-w-sm mx-auto h-6 bg-white border border-[#E5E7EB]/80 rounded-md px-2.5 flex items-center gap-1.5 text-[11px] font-mono text-[#4B5563] truncate">
                      <span className="text-[#9CA3AF]">https://</span>
                      <span className="text-[#111827] font-medium">local.goguma.dev</span>
                      <span className="text-[#1E3A8A]">{plan.navigation?.pageStructure?.[0]?.route || '/dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-[#6B7280]">
                      <span className="hidden sm:inline">1440 × 900</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#1E3A8A] font-semibold">WEB</span>
                    </div>
                  </div>

                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    onLoad={handleIframeLoad}
                    srcDoc={effectivePrototypeHtml}
                    title="Interactive Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              ) : viewportMode === 'tablet' ? (
                <div className="w-[768px] max-w-full h-full max-h-[960px] rounded-2xl border border-[#E5E7EB] shadow-[0_12px_32px_-4px_rgba(15,23,42,0.08)] overflow-hidden bg-white flex flex-col">
                  <div className="h-7 bg-[#F7F8FA] border-b border-[#E5E7EB] px-4 flex items-center justify-between text-[10px] font-mono text-[#6B7280] select-none">
                    <span>iPad Pro 11″</span>
                    <span className="w-8 h-1 rounded-full bg-[#D1D5DB]" />
                    <span>768 × 1024</span>
                  </div>
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
                <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[36px] border-[6px] border-[#E5E7EB] shadow-[0_16px_40px_-8px_rgba(15,23,42,0.12)] overflow-hidden bg-white flex flex-col">
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
            {/* Single Clean Spec Bar */}
            <div className="px-5 py-3 bg-[#F7F8FA]/70 border-b border-[#E5E7EB]/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <div className="relative w-36 sm:w-44">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="text"
                    value={docFilterQuery}
                    onChange={(e) => setDocFilterQuery(e.target.value)}
                    placeholder="사양서 검색..."
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#1E3A8A] focus:ring-2 focus:ring-[#1E3A8A]/10"
                  />
                </div>

                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="flex-1 min-h-[32px] text-xs font-mono bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-[#111827] focus:outline-none focus:border-[#1E3A8A] truncate cursor-pointer"
                >
                  {filteredDocs.map((doc) => {
                    const status = docImpactMap[doc.id] || 'idle';
                    const statusSuffix = status === 'locked' ? ' [Locked]' : status === 'updated' ? ' [Updated]' : '';
                    return (
                      <option key={doc.id} value={doc.id}>
                        {doc.docNumber <= 11 ? `[${String(doc.docNumber).padStart(2, '0')}]` : '[★]'} {doc.filename} - {doc.title}{statusSuffix}
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
                    className="p-1.5 rounded-lg text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#EFF6FF] hover:text-[#1E3A8A] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[11px] font-mono text-[#6B7280] px-1 tabular-nums">
                    {activeDocIndex + 1}/{docsList.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextDoc}
                    disabled={activeDocIndex >= docsList.length - 1}
                    title="다음 문서"
                    className="p-1.5 rounded-lg text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#EFF6FF] hover:text-[#1E3A8A] disabled:opacity-35 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadCurrentDoc}
                  title="이 사양서 파일만 다운로드 (.md)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] text-xs text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                >
                  <FileDown size={13} className="text-[#1E3A8A]" />
                  <span className="hidden sm:inline">.md 저장</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCurrentDoc}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-xs text-white font-medium transition-colors cursor-pointer"
                >
                  {copiedDoc ? (
                    <>
                      <Check size={13} />
                      <span>복사됨</span>
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

            {/* Spec Impact Strip across all 11+ generated specifications */}
            <div className="px-5 py-2.5 bg-[#FFFFFF] border-b border-[#E5E7EB]/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {filteredDocs.map((doc) => {
                const isActive = doc.id === selectedDocId;
                const status = docImpactMap[doc.id] || 'idle';
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#1E3A8A] text-white font-semibold'
                        : 'bg-[#F7F8FA] text-[#4B5563] hover:text-[#111827] hover:bg-[#EFF6FF]'
                    }`}
                    title={`${doc.relativePath} · ${
                      status === 'locked' ? 'Locked' : status === 'updated' ? 'Updated' : 'Synced'
                    }`}
                  >
                    {status === 'updated' && (
                      <span className={`inline-flex items-center gap-1 ${isActive ? 'text-white' : 'text-[#15803D]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#86EFAC]' : 'bg-[#15803D]'}`} />
                      </span>
                    )}
                    {status === 'locked' && (
                      <span className={`inline-flex items-center gap-1 ${isActive ? 'text-white' : 'text-[#1E3A8A]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#93C5FD]' : 'bg-[#1E3A8A]'}`} />
                      </span>
                    )}
                    <span>{doc.filename}</span>
                    {status !== 'idle' && (
                      <span
                        className={`text-[10px] font-sans font-medium ${
                          isActive
                            ? 'text-white/85'
                            : status === 'locked'
                            ? 'text-[#1E3A8A]'
                            : 'text-[#15803D]'
                        }`}
                      >
                        {status === 'locked' ? 'Locked' : 'Updated'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Editorial Document Reader */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 bg-white custom-scroll">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between gap-2 text-xs pb-3 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[#1E3A8A] font-semibold shrink-0">{activeDoc.relativePath}</span>
                    <span className="text-[#D1D5DB] shrink-0">·</span>
                    <span className="text-[#4B5563] truncate">{activeDoc.description}</span>
                  </div>
                  {docImpactMap[activeDoc.id] && docImpactMap[activeDoc.id] !== 'idle' && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
                        docImpactMap[activeDoc.id] === 'locked'
                          ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                          : 'bg-[#F0FDF4] text-[#15803D]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          docImpactMap[activeDoc.id] === 'locked' ? 'bg-[#1E3A8A]' : 'bg-[#15803D]'
                        }`}
                      />
                      <span>{docImpactMap[activeDoc.id] === 'locked' ? 'Locked' : 'Updated'}</span>
                    </span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap leading-[1.75] text-[#111827] font-mono text-xs sm:text-[13px] select-text">
                  {activeDoc.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Golden Prompt Modal */}
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111827]/35 backdrop-blur-xs select-none">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-[#111827]">
              <div className="px-5 py-4 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#1E3A8A]" />
                  <h3 className="font-sans font-semibold text-sm text-[#111827]">
                    에이전트 지시 골든 프롬프트 (Golden Prompt)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPromptModalOpen(false)}
                  className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#111827] bg-white custom-scroll">
                <pre className="whitespace-pre-wrap select-text">
                  {activePromptText}
                </pre>
              </div>

              <div className="px-5 py-3.5 border-t border-[#E5E7EB] bg-[#F7F8FA] flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#4B5563] font-mono">
                  Cursor 또는 Claude Code 창에 붙여넣으면 프로토타입 기반으로 개발을 시작합니다.
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await handleCopyAgentPrompt();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#1E3A8A] text-white text-xs font-semibold hover:bg-[#172554] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
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
          <div className="w-full h-full flex flex-col bg-white text-[#111827]">
            {/* Single Clean Code View Toolbar */}
            <div className="px-5 py-2.5 bg-[#F7F8FA]/70 border-b border-[#E5E7EB]/80 flex flex-wrap items-center justify-between shrink-0 select-none gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDevHubSubTab('typescript')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'typescript'
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-white'
                  }`}
                >
                  <Code size={12} />
                  <span>TS & Zod</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('html')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'html'
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-white'
                  }`}
                >
                  <FileCode size={12} />
                  <span>HTML</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('sql')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'sql'
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-white'
                  }`}
                >
                  <Database size={12} />
                  <span>SQL DDL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('api')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'api'
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-white'
                  }`}
                >
                  <Layers size={12} />
                  <span>REST API</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDevHubSubTab('prompt')}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'prompt'
                      ? 'bg-[#1E3A8A] text-white font-semibold'
                      : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-white'
                  }`}
                >
                  <Bot size={12} />
                  <span>AI Prompt</span>
                </button>
              </div>

              {/* Quick Copy & Reset Override */}
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
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E7EB] hover:bg-[#FEF2F2] hover:text-[#B91C1C] text-[#4B5563] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    title="자동 생성 코드로 되돌리기"
                  >
                    <RotateCcw size={12} />
                    <span>초기화</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyDevHubCode(activeCodeValue, devHubSubTab)}
                  className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E3A8A] text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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

            {/* CodeMirror Light Editor / API Contracts */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
              {devHubSubTab === 'api' ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
                  <div className="flex items-center justify-between text-[#4B5563] text-xs pb-2 border-b border-[#E5E7EB]">
                    <span className="font-mono font-semibold text-[#111827]">API Endpoint Contracts</span>
                    <span className="font-mono">RESTful / JSON Payload</span>
                  </div>
                  <div className="space-y-3">
                    {generatedApiRoutes.map((api, idx) => (
                      <div key={idx} className="p-4 bg-[#F7F8FA] rounded-xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                              api.method === 'GET' ? 'bg-[#EFF6FF] text-[#1E3A8A]' :
                              api.method === 'POST' ? 'bg-[#ECFDF5] text-[#047857]' :
                              api.method === 'PATCH' ? 'bg-[#FFFBEB] text-[#B45309]' :
                              'bg-[#FEF2F2] text-[#B91C1C]'
                            }`}>
                              {api.method}
                            </span>
                            <span className="font-mono text-xs font-semibold text-[#111827] truncate">{api.path}</span>
                          </div>
                          <span className="text-[11px] font-mono text-[#6B7280] shrink-0">{api.status}</span>
                        </div>
                        <p className="text-xs text-[#4B5563] leading-relaxed">{api.summary}</p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#6B7280] pt-1">
                          <span>인증: {api.auth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 flex flex-col">
                  <div className="px-5 py-2 bg-white border-b border-[#E5E7EB]/60 flex items-center justify-between text-[11px] font-mono text-[#6B7280] shrink-0">
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
                        ? 'TypeScript 5.8 · Zod 3.x (Light Theme)'
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
