import React, { useState, useMemo } from 'react';
import { 
  Play, FileCode, Network, RefreshCw, ExternalLink, 
  Download, Copy, Check, ChevronLeft, ChevronRight,
  FolderArchive, FileText, Sparkles, Bot
} from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { compileStandalonePrototypeHtml, generatePrototypePrompt } from '../../lib/prototypeCompiler';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { copyProjectJsonToClipboard } from '../../lib/projectFileIO';
import VisualSitemap from './VisualSitemap';

interface SpecPreviewPanelProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  currentChapter: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  largeTextMode?: boolean;
  width?: number;
}

type PreviewTab = 'prototype' | 'docs' | 'sitemap';

export const SpecPreviewPanel: React.FC<SpecPreviewPanelProps> = ({
  plan,
  formInputs,
  currentChapter,
  isCollapsed = false,
  onToggleCollapse,
  largeTextMode = false,
  width,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('prototype');
  const [selectedDocId, setSelectedDocId] = useState<string>('01_proposal');
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

  // 3. Document list for the 11-doc switcher
  const docsList = useMemo(() => {
    const list = getMarkdownDocsList(bundle);
    // Add .cursorrules as an inspection option
    list.push({
      id: 'cursorrules',
      docNumber: 12,
      filename: '.cursorrules',
      relativePath: '.cursorrules',
      title: 'Cursor 에이전트 지침',
      engTitle: 'Cursor Rules',
      description: 'Cursor AI 에이전트 불변 행동 규칙 및 패키지 통제',
      content: bundle.cursorrules,
    });
    return list;
  }, [bundle]);

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
        className="w-[58px] h-full flex flex-col items-center bg-[#FAF7F2] border-l-2 border-[#E5DFD3] shrink-0 select-none py-3 justify-between"
        aria-label="미리보기 패널 펼치기"
      >
        <div className="flex flex-col items-center gap-3.5 w-full px-1.5">
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[42px] min-w-[42px] rounded-xl bg-white border-2 border-[#D5CCBC] hover:bg-[#EFE9DC] text-[#111827] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="미리보기 패널 펼치기 (460px)"
            aria-label="미리보기 패널 펼치기"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="w-8 h-px bg-[#E5DFD3]" />

          {/* Quick tab shortcuts that open panel directly to that tab */}
          <button
            onClick={() => { setActiveTab('prototype'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#6B1D42] hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
            title="프로토타입 보기 (펼치기)"
          >
            <Play size={16} className="fill-current" />
          </button>
          <button
            onClick={() => { setActiveTab('docs'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#6B1D42] hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
            title="11종 사양서 보기 (펼치기)"
          >
            <FileCode size={18} />
          </button>
          <button
            onClick={() => { setActiveTab('sitemap'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl text-[#6B1D42] hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
            title="사이트맵 보기 (펼치기)"
          >
            <Network size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="[writing-mode:vertical-lr] text-xs font-serif font-extrabold text-[#6B1D42] tracking-widest py-4 select-none">
            미리보기 & 11종 사양서
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[40px] rounded-xl hover:bg-white text-[#4B5563] text-xs font-mono font-bold cursor-pointer"
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
      className={`${width ? '' : 'w-[460px] lg:w-[480px] xl:w-[520px] 2xl:w-[560px]'} h-full flex flex-col bg-[#0E1217] border-l border-white/7 shrink-0 select-none shadow-xs`}
      aria-label="실시간 프로토타입 및 11종 사양서 프리뷰"
    >
      {/* Panel Header & Tab Switcher - Ink Black & Champagne Brass (h-14, Micro-Radius) */}
      <div className="h-14 px-3 border-b border-white/7 bg-[#0E1217] flex items-center justify-between shrink-0 gap-2">
        {/* Compact Segmented Tabs (No Text Break) */}
        <div className="flex items-center gap-1 bg-[#13181F] p-0.5 rounded-[2px] border border-white/10 text-xs shrink-0 flex-nowrap">
          <button
            onClick={() => setActiveTab('prototype')}
            className={`px-2.5 py-1.5 rounded-[2px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prototype'
                ? 'bg-[#18202A] text-[#C5A880]'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <Play size={12} className="fill-current" />
            <span>프로토타입</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-2.5 py-1.5 rounded-[2px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'docs'
                ? 'bg-[#18202A] text-[#C5A880]'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <FileCode size={13} />
            <span>사양서</span>
            <span className="font-mono text-[11px] tabular-nums text-[#5C6675]">
              11
            </span>
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-2.5 py-1.5 rounded-[2px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sitemap'
                ? 'bg-[#18202A] text-[#C5A880]'
                : 'text-[#9AA5B5] hover:text-[#F0F3F6]'
            }`}
          >
            <Network size={13} />
            <span>사이트맵</span>
          </button>
        </div>

        {/* Clean, Non-redundant Quick Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setReloadKey(k => k + 1)}
            title="프로토타입 / 사양서 새로고침"
            className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[2px] bg-[#13181F] border border-white/10 hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
          <button
            onClick={handleOpenStandalone}
            title="새 창에서 전체 화면으로 실행"
            className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[2px] bg-[#13181F] border border-white/10 hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors cursor-pointer"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-hidden relative bg-[#0B0C10] flex flex-col">
        {/* TAB 1: Live Interactive Prototype */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            {/* Signature Prototype-as-Spec Studio Banner */}
            <div className="bg-[#13181F] px-3.5 py-2 border-b border-white/7 flex items-center justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full transition-colors ${isSyncing ? 'bg-[#C5A880] animate-ping' : 'bg-[#34D399] animate-pulse'}`} />
                  <span className="text-xs font-semibold text-[#F0F3F6] truncate">
                    실시간 인터랙티브 프로토타입
                  </span>
                  {isSyncing && (
                    <span className="text-[10px] font-mono text-[#C5A880] animate-pulse">
                      · 동기화 중
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#5C6675] truncate">
                  클릭·화면이동·데이터 수정이 브라우저에서 즉시 작동합니다
                </p>
              </div>

              {/* Unique Golden Prototype-as-Spec Copy Button */}
              <button
                onClick={handleCopyAgentPrompt}
                title="Cursor/Claude Code에 붙여넣을 '이 화면 그대로 만들어줘' 골든 프롬프트 복사"
                className={`px-3 py-1.5 rounded-[2px] border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  copiedPrompt 
                    ? 'bg-[#34D399] text-[#0B0C10] border-[#34D399] font-bold' 
                    : 'bg-[#C5A880] text-[#0B0C10] border-[#C5A880] hover:bg-[#D4AF37]'
                }`}
              >
                {copiedPrompt ? (
                  <>
                    <Check size={13} className="stroke-[3]" />
                    <span>프롬프트 복사됨!</span>
                  </>
                ) : (
                  <>
                    <Bot size={13} />
                    <span>"이 화면 그대로 만들어줘" 복사</span>
                  </>
                )}
              </button>
            </div>

            <iframe
              ref={iframeRef}
              key={reloadKey}
              srcDoc={prototypeHtml}
              title="Interactive Prototype Preview"
              sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
              className="w-full flex-1 border-0 bg-[#0B0C10]"
            />
          </div>
        )}

        {/* TAB 2: 11-Doc Markdown Blueprint Viewer */}
        {activeTab === 'docs' && (
          <div className="w-full h-full flex flex-col bg-[#0B0C10]">
            {/* Document Selector Header */}
            <div className="bg-[#0E1217] px-3.5 py-2 border-b border-white/7 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full min-h-[34px] text-xs font-mono bg-[#13181F] border border-white/10 rounded-[2px] px-2.5 py-1.5 text-[#F0F3F6] focus:outline-none focus:border-[#C5A880] truncate cursor-pointer"
                >
                  {docsList.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-[#13181F] text-[#F0F3F6]">
                      {doc.docNumber <= 11 ? `[${String(doc.docNumber).padStart(2, '0')}]` : '[★]'} {doc.filename} - {doc.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prev / Next Doc Stepper */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handlePrevDoc}
                  disabled={activeDocIndex <= 0}
                  title="이전 문서"
                  className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] bg-[#13181F] border border-white/10 hover:bg-[#18202A] disabled:opacity-30 disabled:hover:bg-[#13181F] transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[11px] font-mono text-[#5C6675] px-1">
                  {activeDocIndex + 1}/{docsList.length}
                </span>
                <button
                  onClick={handleNextDoc}
                  disabled={activeDocIndex >= docsList.length - 1}
                  title="다음 문서"
                  className="p-1.5 min-h-[32px] min-w-[32px] flex items-center justify-center rounded-[2px] text-[#9AA5B5] bg-[#13181F] border border-white/10 hover:bg-[#18202A] disabled:opacity-30 disabled:hover:bg-[#13181F] transition-colors cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Document Path & Copy Bar */}
            <div className="bg-[#13181F] px-4 py-2 border-b border-white/7 flex items-center justify-between text-xs text-[#9AA5B5] shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[#C5A880] font-semibold text-xs">{activeDoc.relativePath}</span>
                <span className="text-white/10">|</span>
                <span className="truncate text-[#9AA5B5] text-[11px]">{activeDoc.description}</span>
              </div>
              <button
                onClick={handleCopyCurrentDoc}
                className="shrink-0 flex items-center gap-1 min-h-[30px] px-2.5 py-1 rounded-[2px] bg-[#18202A] border border-white/10 text-xs text-[#C5A880] hover:text-[#D4AF37] font-medium transition-colors cursor-pointer ml-2"
              >
                {copiedDoc ? (
                  <>
                    <Check size={13} className="text-[#34D399]" />
                    <span className="text-[#34D399]">복사됨!</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>문서 복사</span>
                  </>
                )}
              </button>
            </div>

            {/* Markdown Viewer */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed text-[#F0F3F6] bg-[#0B0C10]">
              <pre className="whitespace-pre-wrap leading-relaxed text-[#F0F3F6] bg-[#13181F] p-4 rounded-[3px] border border-white/7 select-text">
                {activeDoc.content}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 3: Visual Sitemap */}
        {activeTab === 'sitemap' && (
          <div className="w-full h-full overflow-y-auto p-4 bg-[#FAF7F2]/40">
            <VisualSitemap />
          </div>
        )}
      </div>
    </aside>
  );
};
