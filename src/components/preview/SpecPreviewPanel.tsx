import React, { useState, useMemo } from 'react';
import { 
  Play, FileCode, Network, RefreshCw, ExternalLink, 
  Download, Copy, Check, ChevronLeft, ChevronRight,
  FolderArchive, FileText, Sparkles, Bot,
  Monitor, Tablet, Smartphone, Search, FileDown, X,
  Code, Terminal, Database, Layers, CheckCheck
} from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { compileStandalonePrototypeHtml, generatePrototypePrompt } from '../../lib/prototypeCompiler';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
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
}

type PreviewTab = 'prototype' | 'docs' | 'devhub' | 'sitemap';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type DevHubSubTab = 'typescript' | 'sql' | 'api' | 'prompt';

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
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('prototype');
  const [viewportMode, setViewportMode] = useState<ViewportMode>(() => 
    plan.metadata?.platform === 'APP' ? 'mobile' : 'desktop'
  );
  const [devHubSubTab, setDevHubSubTab] = useState<DevHubSubTab>('typescript');
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
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

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

  // Copy Prototype-as-Spec golden prompt for Cursor/Claude
  const handleCopyAgentPrompt = async () => {
    try {
      const prompt = generatePrototypePrompt(plan);
      await navigator.clipboard.writeText(prompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy agent prompt', e);
    }
  };

  // 1. Compile standalone prototype HTML
  const prototypeHtml = useMemo(() => {
    return compileStandalonePrototypeHtml(plan);
  }, [plan, reloadKey]);

  // 2. Compile full 11-markdown bundle in real time
  const bundle = useMemo(() => {
    return compileMarkdownBundle(plan, formInputs);
  }, [plan, formInputs]);

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
      await downloadBlueprintZip(plan, formInputs);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (e: any) {
      console.error('ZIP 다운로드 실패:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Open standalone prototype in new tab
  const handleOpenStandalone = () => {
    const blob = new Blob([prototypeHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // If collapsed, show a sleek ergonomic 58px rail
  if (isCollapsed) {
    return (
      <aside 
        className="w-[58px] h-full flex flex-col items-center bg-[#0E1217] border-l border-white/[0.08] shrink-0 select-none py-3 justify-between"
        aria-label="미리보기 패널 펼치기"
      >
        <div className="flex flex-col items-center gap-3 w-full px-1.5">
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[38px] min-w-[38px] rounded-[2px] bg-[#13181F] border border-white/[0.08] hover:bg-white/[0.06] text-[#9AA5B5] hover:text-[#F0F3F6] flex items-center justify-center transition-colors cursor-pointer"
            title="미리보기 패널 펼치기"
            aria-label="미리보기 패널 펼치기"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="w-6 h-px bg-white/10" />

          {/* Quick tab shortcuts that open panel directly to that tab */}
          <button
            onClick={() => { setActiveTab('prototype'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-all cursor-pointer"
            title="프로토타입 보기 (펼치기)"
          >
            <Play size={14} className="fill-current text-[#38BDF8]" />
          </button>
          <button
            onClick={() => { setActiveTab('docs'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-all cursor-pointer"
            title="11종 사양서 보기 (펼치기)"
          >
            <FileCode size={16} />
          </button>
          <button
            onClick={() => { setActiveTab('devhub'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-all cursor-pointer"
            title="개발자 허브 (코드 & DDL)"
          >
            <Terminal size={15} />
          </button>
          <button
            onClick={() => { setActiveTab('sitemap'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-all cursor-pointer"
            title="사이트맵 보기 (펼치기)"
          >
            <Network size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="[writing-mode:vertical-lr] text-[10px] font-mono uppercase tracking-widest text-[#5C6675] py-4 select-none">
            SPEC & PROTOTYPE
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[36px] rounded-[2px] hover:bg-white/[0.06] text-[#9AA5B5] hover:text-[#F0F3F6] text-xs font-mono font-medium cursor-pointer"
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
      className={`${width ? '' : 'w-[460px] lg:w-[480px] xl:w-[520px] 2xl:w-[560px]'} h-full flex flex-col bg-[#0E1217] border-l border-white/[0.08] shrink-0 select-none shadow-xl text-[#F0F3F6] font-sans`}
      aria-label="실시간 프로토타입 및 11종 사양서 프리뷰"
    >
      {/* Studio Header (Single Minimalist 48px Header) */}
      <div className="h-12 px-3.5 border-b border-white/[0.08] bg-[#0E1217] flex items-center justify-between shrink-0 select-none gap-2">
        {/* Left: Quiet, Typographic Tab Navigation (Zero-Pill, Underline indicator) */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium shrink-0 min-w-0">
          <button
            onClick={() => setActiveTab('prototype')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'prototype'
                ? 'text-[#F0F3F6] font-semibold'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <span className="whitespace-nowrap">프로토타입</span>
            {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping shrink-0" />}
            {activeTab === 'prototype' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center whitespace-nowrap shrink-0 ${
              activeTab === 'docs'
                ? 'text-[#F0F3F6] font-semibold'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <span className="whitespace-nowrap">사양서</span>
            <span className="font-mono text-[10px] text-[#38BDF8] bg-blue-950/60 border border-blue-500/30 px-1.5 py-0.2 rounded-[2px] ml-1 tabular-nums inline-flex items-center justify-center shrink-0 leading-none">
              11
            </span>
            {activeTab === 'docs' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('devhub')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'devhub'
                ? 'text-[#F0F3F6] font-semibold'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <span className="whitespace-nowrap">개발자 허브</span>
            <span className="font-mono text-[9px] text-[#38BDF8] bg-blue-950/60 border border-blue-500/30 px-1 py-0.2 rounded-[2px] ml-0.5 tabular-nums uppercase">
              DEV
            </span>
            {activeTab === 'devhub' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'sitemap'
                ? 'text-[#F0F3F6] font-semibold'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <span className="whitespace-nowrap">사이트맵</span>
            {activeTab === 'sitemap' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#38BDF8]" />
            )}
          </button>
        </div>

        {/* Right: Consolidated Controls (Device Viewport + Prompt + Clean Ghost Tools) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {activeTab === 'prototype' && (
            <>
              {/* Segmented Device Viewport Toggle */}
              <div className="hidden sm:flex items-center bg-[#13181F] rounded-[2px] p-0.5 border border-white/10">
                <Tooltip content="데스크톱 뷰" position="bottom">
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`p-1 min-h-[26px] min-w-[26px] flex items-center justify-center rounded-[2px] transition-all cursor-pointer ${
                      viewportMode === 'desktop'
                        ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/30 shadow-2xs font-semibold'
                        : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
                    }`}
                    aria-label="데스크톱 뷰"
                  >
                    <Monitor size={13} />
                  </button>
                </Tooltip>

                <Tooltip content="태블릿 뷰" position="bottom">
                  <button
                    onClick={() => setViewportMode('tablet')}
                    className={`p-1 min-h-[26px] min-w-[26px] flex items-center justify-center rounded-[2px] transition-all cursor-pointer ${
                      viewportMode === 'tablet'
                        ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/30 shadow-2xs font-semibold'
                        : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
                    }`}
                    aria-label="태블릿 뷰"
                  >
                    <Tablet size={13} />
                  </button>
                </Tooltip>

                <Tooltip content="스마트폰 뷰" position="bottom">
                  <button
                    onClick={() => setViewportMode('mobile')}
                    className={`p-1 min-h-[26px] min-w-[26px] flex items-center justify-center rounded-[2px] transition-all cursor-pointer ${
                      viewportMode === 'mobile'
                        ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/30 shadow-2xs font-semibold'
                        : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
                    }`}
                    aria-label="스마트폰 뷰"
                  >
                    <Smartphone size={13} />
                  </button>
                </Tooltip>
              </div>

              {/* Contextual Tool: 프롬프트 복사 (Icon + Tooltip) */}
              <Tooltip content={copiedPrompt ? '복사 완료' : '개발용 프롬프트 복사'} position="bottom">
                <button
                  onClick={handleCopyAgentPrompt}
                  className={`p-1.5 min-h-[28px] min-w-[28px] rounded-[2px] text-xs font-medium transition-all flex items-center justify-center cursor-pointer whitespace-nowrap shrink-0 ${
                    copiedPrompt
                      ? 'bg-blue-950/90 text-[#38BDF8] border border-blue-400'
                      : 'bg-blue-950/60 border border-blue-500/40 text-[#38BDF8] hover:bg-blue-900/60'
                  }`}
                  aria-label="개발용 프롬프트 복사"
                >
                  {copiedPrompt ? (
                    <Check size={13} className="stroke-[2.5]" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </Tooltip>

              {/* Prompt Modal View Ghost Button */}
              <Tooltip content="프롬프트 전문 확인" position="bottom">
                <button
                  onClick={() => setIsPromptModalOpen(true)}
                  className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
                  aria-label="프롬프트 전문 확인"
                >
                  <Bot size={13} />
                </button>
              </Tooltip>
            </>
          )}

          {/* Refresh Tool */}
          <Tooltip content="새로고침" position="bottom">
            <button
              onClick={() => setReloadKey(k => k + 1)}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              aria-label="새로고침"
            >
              <RefreshCw size={13} />
            </button>
          </Tooltip>

          {/* Standalone New Tab Tool */}
          <Tooltip content="새 창에서 실행" position="bottom">
            <button
              onClick={handleOpenStandalone}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              aria-label="새 창에서 실행"
            >
              <ExternalLink size={13} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-hidden relative bg-[#0B0C10] flex flex-col">
        {/* TAB 1: Live Interactive Prototype */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            {/* Viewport Frame Mount */}
            <div className={`flex-1 overflow-auto flex items-center justify-center ${
              viewportMode === 'desktop' ? 'bg-[#0B0C10] p-0' : 'bg-[#090A0E] p-4 sm:p-6'
            }`}>
              {viewportMode === 'desktop' ? (
                <div className="w-full h-full flex flex-col bg-[#0B0C10]">
                  {/* Web Developer Simulated Browser Bar */}
                  <div className="h-8 px-3 bg-[#0E1217] border-b border-white/[0.08] flex items-center justify-between text-xs text-neutral-400 select-none shrink-0 gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    </div>

                    <div className="flex-1 max-w-xs md:max-w-sm mx-auto h-5 bg-[#0B0C10] border border-white/[0.08] rounded-[2px] px-2 flex items-center gap-1.5 text-[11px] font-mono text-neutral-300 truncate">
                      <span className="text-[#38BDF8] text-[10px]">🔒</span>
                      <span className="text-neutral-500">https://</span>
                      <span className="text-neutral-200">local.goguma.dev</span>
                      <span className="text-[#38BDF8]">{plan.navigation?.pageStructure?.[0]?.route || '/dashboard'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono text-neutral-400">
                      <span className="hidden sm:inline">1440 × 900</span>
                      <span className="px-1.5 py-0.2 rounded-[2px] bg-blue-950/60 text-[#38BDF8] border border-blue-500/30">WEB</span>
                    </div>
                  </div>

                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    srcDoc={prototypeHtml}
                    title="Interactive Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-[#0B0C10]"
                  />
                </div>
              ) : viewportMode === 'tablet' ? (
                <div className="w-[768px] max-w-full h-full max-h-[960px] rounded-[10px] border border-white/[0.12] shadow-2xl overflow-hidden bg-[#0B0C10] flex flex-col">
                  <div className="h-6 bg-[#0E1217] border-b border-white/[0.08] px-3 flex items-center justify-between text-[10px] font-mono text-[#9AA5B5] select-none">
                    <span>iPad Pro 11″</span>
                    <span className="w-8 h-1 rounded-full bg-white/20"></span>
                    <span>768 × 1024</span>
                  </div>
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    srcDoc={prototypeHtml}
                    title="Tablet Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-[#0B0C10]"
                  />
                </div>
              ) : (
                <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[36px] border-[6px] border-[#18202A] shadow-2xl overflow-hidden bg-[#0B0C10] flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    srcDoc={prototypeHtml}
                    title="Mobile Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-[#0B0C10]"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 11-Doc Markdown Blueprint Viewer */}
        {activeTab === 'docs' && (
          <div className="w-full h-full flex flex-col bg-[#0B0C10]">
            {/* Document Selector & Search Bar */}
            <div className="bg-[#0E1217] px-3.5 py-2 border-b border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search / Filter Input */}
                <div className="relative min-w-[130px] sm:w-44">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5C6675]" />
                  <input
                    type="text"
                    value={docFilterQuery}
                    onChange={(e) => setDocFilterQuery(e.target.value)}
                    placeholder="사양서 검색..."
                    className="w-full pl-7 pr-2 py-1 text-xs font-mono bg-[#13181F] border border-white/10 rounded-[2px] text-[#F0F3F6] placeholder-[#5C6675] focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                {/* Document Selector */}
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="flex-1 min-h-[32px] text-xs font-mono bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1 text-[#F0F3F6] focus:outline-none focus:border-[#38BDF8] truncate cursor-pointer"
                >
                  {filteredDocs.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-[#0E1217] text-[#F0F3F6]">
                      {doc.docNumber <= 11 ? `[${String(doc.docNumber).padStart(2, '0')}]` : '[★]'} {doc.filename} - {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Doc Stepper */}
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <button
                  onClick={handlePrevDoc}
                  disabled={activeDocIndex <= 0}
                  title="이전 문서"
                  className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] bg-[#13181F] border border-white/10 hover:bg-[#18202A] hover:text-[#F0F3F6] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[11px] font-mono text-[#9AA5B5] px-1">
                  {activeDocIndex + 1}/{docsList.length}
                </span>
                <button
                  onClick={handleNextDoc}
                  disabled={activeDocIndex >= docsList.length - 1}
                  title="다음 문서"
                  className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] bg-[#13181F] border border-white/10 hover:bg-[#18202A] hover:text-[#F0F3F6] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Document Path & Actions Bar */}
            <div className="bg-[#0E1217]/80 px-3.5 py-1.5 border-b border-white/[0.08] flex items-center justify-between text-xs text-[#9AA5B5] shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[#38BDF8] font-semibold text-xs">{activeDoc.relativePath}</span>
                <span className="text-white/20">|</span>
                <span className="truncate text-[#9AA5B5] text-[11px]">{activeDoc.description}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={handleDownloadCurrentDoc}
                  title="이 사양서 파일만 다운로드 (.md)"
                  className="flex items-center gap-1 min-h-[28px] px-2 py-1 rounded-[2px] bg-[#13181F] border border-white/10 text-[11px] text-[#F0F3F6] hover:bg-[#18202A] transition-colors cursor-pointer shadow-2xs"
                >
                  <FileDown size={12} className="text-[#38BDF8]" />
                  <span className="hidden sm:inline">.md 저장</span>
                </button>

                <button
                  onClick={handleCopyCurrentDoc}
                  className="flex items-center gap-1 min-h-[28px] px-2.5 py-1 rounded-[2px] bg-[#13181F] border border-white/10 text-[11px] text-[#F0F3F6] hover:bg-[#18202A] font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedDoc ? (
                    <>
                      <Check size={12} className="text-[#38BDF8]" />
                      <span className="text-[#38BDF8] font-semibold">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Markdown Viewer in Editorial Booklet Style */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0B0C10]">
              <div className="max-w-3xl mx-auto bg-[#13181F] border border-white/[0.08] rounded-[2px] p-6 sm:p-8 shadow-xl">
                <pre className="whitespace-pre-wrap leading-relaxed text-[#F0F3F6] font-mono text-xs select-text">
                  {activeDoc.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Golden Prompt Modal */}
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
            <div className="w-full max-w-2xl bg-[#0E1217] rounded-[2px] border border-white/10 shadow-2xl flex flex-col overflow-hidden text-[#F0F3F6]">
              <div className="px-5 py-3.5 bg-[#13181F] border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#38BDF8]" />
                  <h3 className="font-sans font-bold text-sm text-[#F0F3F6]">
                    에이전트 지시 골든 프롬프트 (Golden Prompt)
                  </h3>
                </div>
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="p-1 rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#F0F3F6] bg-[#0B0C10]">
                <pre className="whitespace-pre-wrap select-text">
                  {generatePrototypePrompt(plan)}
                </pre>
              </div>

              <div className="px-5 py-3 border-t border-white/[0.08] bg-[#13181F] flex items-center justify-between">
                <span className="text-[11px] text-[#9AA5B5] font-mono">
                  Cursor 또는 Claude Code 창에 붙여넣으면 프로토타입 기반으로 개발을 시작합니다.
                </span>
                <button
                  onClick={async () => {
                    await handleCopyAgentPrompt();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-[2px] bg-[#2563EB] text-white text-xs font-semibold hover:bg-[#1D4ED8] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Copy size={13} />
                  <span>프롬프트 복사하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Dev Hub (Architecture & Engineering Code Manifestation) */}
        {activeTab === 'devhub' && (
          <div className="w-full h-full flex flex-col bg-[#0A0A0C] text-[#F0F3F6]">
            {/* Dev Hub Sub-Navigation Bar */}
            <div className="h-10 px-3 bg-[#0E1217] border-b border-white/[0.08] flex items-center justify-between shrink-0 select-none overflow-x-auto gap-2">
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setDevHubSubTab('typescript')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'typescript'
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                  }`}
                >
                  <Code size={12} />
                  <span>TS & Zod</span>
                </button>

                <button
                  onClick={() => setDevHubSubTab('sql')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'sql'
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                  }`}
                >
                  <Database size={12} />
                  <span>SQL DDL</span>
                </button>

                <button
                  onClick={() => setDevHubSubTab('api')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'api'
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                  }`}
                >
                  <Layers size={12} />
                  <span>REST API</span>
                </button>

                <button
                  onClick={() => setDevHubSubTab('prompt')}
                  className={`px-2.5 py-1 text-[11px] font-mono rounded-[2px] transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    devHubSubTab === 'prompt'
                      ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                      : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                  }`}
                >
                  <Bot size={12} />
                  <span>AI Prompt</span>
                </button>
              </div>

              {/* Quick Copy Action */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    const code = devHubSubTab === 'typescript' 
                      ? generatedTypeScript 
                      : devHubSubTab === 'sql' 
                      ? generatedSqlDdl 
                      : devHubSubTab === 'prompt' 
                      ? generatePrototypePrompt(plan)
                      : JSON.stringify(generatedApiRoutes, null, 2);
                    handleCopyDevHubCode(code, devHubSubTab);
                  }}
                  className="px-2.5 py-1 rounded-[2px] bg-blue-950/60 hover:bg-blue-900/60 text-[#38BDF8] border border-blue-500/30 text-xs font-mono transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  {copiedDevHub === devHubSubTab ? (
                    <>
                      <CheckCheck size={12} className="text-[#38BDF8]" />
                      <span className="text-[#38BDF8] font-semibold">복사됨!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>코드 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scroll font-mono text-xs">
              {devHubSubTab === 'typescript' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#9AA5B5] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>src/types/schema.ts</span>
                    <span>TypeScript 5.8 • Zod 3.x</span>
                  </div>
                  <pre className="p-3 bg-[#0B0C10] rounded-[4px] border border-white/[0.08] text-[#F0F3F6] overflow-x-auto leading-relaxed select-text whitespace-pre">
                    {generatedTypeScript}
                  </pre>
                </div>
              )}

              {devHubSubTab === 'sql' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#9AA5B5] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>migrations/0001_initial_schema.sql</span>
                    <span>PostgreSQL / Cloudflare D1 / Supabase</span>
                  </div>
                  <pre className="p-3 bg-[#0B0C10] rounded-[4px] border border-white/[0.08] text-[#F0F3F6] overflow-x-auto leading-relaxed select-text whitespace-pre">
                    {generatedSqlDdl}
                  </pre>
                </div>
              )}

              {devHubSubTab === 'api' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#9AA5B5] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>API Endpoint Contracts</span>
                    <span>RESTful / JSON Payload</span>
                  </div>
                  <div className="space-y-2">
                    {generatedApiRoutes.map((api, idx) => (
                      <div key={idx} className="p-3 bg-[#13181F] rounded-[4px] border border-white/[0.08] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold ${
                              api.method === 'GET' ? 'bg-blue-500/20 text-[#38BDF8] border border-blue-500/30' :
                              api.method === 'POST' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                              api.method === 'PATCH' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {api.method}
                            </span>
                            <span className="font-mono text-xs font-semibold text-[#F0F3F6]">{api.path}</span>
                          </div>
                          <span className="text-[10px] text-[#5C6675]">{api.status}</span>
                        </div>
                        <p className="text-[11px] text-[#9AA5B5] leading-normal">{api.summary}</p>
                        <div className="flex items-center gap-2 text-[10px] text-[#5C6675] pt-1 border-t border-white/[0.04]">
                          <span>인증: {api.auth}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {devHubSubTab === 'prompt' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[#9AA5B5] text-[11px] pb-1 border-b border-white/[0.06]">
                    <span>.cursorrules / CLAUDE.md Execution Prompt</span>
                    <span>Prototype-as-Spec Reverse Engineering</span>
                  </div>
                  <pre className="p-3 bg-[#0B0C10] rounded-[4px] border border-white/[0.08] text-[#F0F3F6] overflow-x-auto leading-relaxed select-text whitespace-pre-wrap">
                    {generatePrototypePrompt(plan)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Visual Sitemap & Real-time D3 Tree */}
        {activeTab === 'sitemap' && (
          <div className="w-full h-full flex flex-col overflow-hidden bg-[#0B0C10]">
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
