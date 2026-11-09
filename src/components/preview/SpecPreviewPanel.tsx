import React, { useState, useMemo } from 'react';
import { 
  Play, FileCode, Network, RefreshCw, ExternalLink, 
  Download, Copy, Check, ChevronLeft, ChevronRight,
  FolderArchive, FileText, Sparkles, Bot,
  Monitor, Tablet, Smartphone, Search, FileDown, X
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

type PreviewTab = 'prototype' | 'docs' | 'sitemap';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

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
        className="w-[58px] h-full flex flex-col items-center bg-white border-l border-stone-200/90 shrink-0 select-none py-3 justify-between"
        aria-label="미리보기 패널 펼치기"
      >
        <div className="flex flex-col items-center gap-3 w-full px-1.5">
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[38px] min-w-[38px] rounded-[2px] bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            title="미리보기 패널 펼치기"
            aria-label="미리보기 패널 펼치기"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="w-6 h-px bg-stone-200" />

          {/* Quick tab shortcuts that open panel directly to that tab */}
          <button
            onClick={() => { setActiveTab('prototype'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
            title="프로토타입 보기 (펼치기)"
          >
            <Play size={14} className="fill-current text-[#D97706]" />
          </button>
          <button
            onClick={() => { setActiveTab('docs'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
            title="11종 사양서 보기 (펼치기)"
          >
            <FileCode size={16} />
          </button>
          <button
            onClick={() => { setActiveTab('sitemap'); onToggleCollapse?.(); }}
            className="p-2.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-all cursor-pointer"
            title="사이트맵 보기 (펼치기)"
          >
            <Network size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="[writing-mode:vertical-lr] text-[10px] font-mono uppercase tracking-widest text-stone-400 py-4 select-none">
            SPEC & PROTOTYPE
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-2 min-h-[36px] rounded-[2px] hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-xs font-mono font-medium cursor-pointer"
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
      className={`${width ? '' : 'w-[460px] lg:w-[480px] xl:w-[520px] 2xl:w-[560px]'} h-full flex flex-col bg-white border-l border-stone-200/90 shrink-0 select-none shadow-xs text-stone-900 font-sans`}
      aria-label="실시간 프로토타입 및 11종 사양서 프리뷰"
    >
      {/* Studio Header (Single Minimalist 48px Header) */}
      <div className="h-12 px-3.5 border-b border-stone-200/90 bg-white flex items-center justify-between shrink-0 select-none gap-2">
        {/* Left: Quiet, Typographic Tab Navigation (Zero-Pill, Underline indicator) */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium shrink-0 min-w-0">
          <button
            onClick={() => setActiveTab('prototype')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'prototype'
                ? 'text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="whitespace-nowrap">프로토타입</span>
            {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-ping shrink-0" />}
            {activeTab === 'prototype' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D97706]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center whitespace-nowrap shrink-0 ${
              activeTab === 'docs'
                ? 'text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="whitespace-nowrap">사양서</span>
            <span className="font-mono text-[10px] text-amber-900 bg-amber-100/90 border border-amber-300/40 px-1.5 py-0.2 rounded-[2px] ml-1 tabular-nums inline-flex items-center justify-center shrink-0 leading-none">
              11
            </span>
            {activeTab === 'docs' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D97706]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`relative py-3.5 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'sitemap'
                ? 'text-stone-900 font-semibold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span className="whitespace-nowrap">사이트맵</span>
            {activeTab === 'sitemap' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D97706]" />
            )}
          </button>
        </div>

        {/* Right: Consolidated Controls (Device Viewport + Prompt + Clean Ghost Tools) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {activeTab === 'prototype' && (
            <>
              {/* Segmented Device Viewport Toggle */}
              <div className="hidden sm:flex items-center bg-stone-100 rounded-[2px] p-0.5 border border-stone-200/80">
                <Tooltip content="데스크톱 뷰" position="bottom">
                  <button
                    onClick={() => setViewportMode('desktop')}
                    className={`p-1 min-h-[26px] min-w-[26px] flex items-center justify-center rounded-[2px] transition-all cursor-pointer ${
                      viewportMode === 'desktop'
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
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
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
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
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
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
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-50/80 border border-amber-200/90 text-[#D97706] hover:bg-amber-100 hover:border-amber-300'
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
                  className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
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
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
              aria-label="새로고침"
            >
              <RefreshCw size={13} />
            </button>
          </Tooltip>

          {/* Standalone New Tab Tool */}
          <Tooltip content="새 창에서 실행" position="bottom">
            <button
              onClick={handleOpenStandalone}
              className="p-1.5 min-h-[28px] min-w-[28px] flex items-center justify-center rounded-[2px] text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
              aria-label="새 창에서 실행"
            >
              <ExternalLink size={13} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-hidden relative bg-[#FBFBFA] flex flex-col">
        {/* TAB 1: Live Interactive Prototype */}
        {activeTab === 'prototype' && (
          <div className="w-full h-full flex flex-col">
            {/* Viewport Frame Mount */}
            <div className={`flex-1 overflow-auto flex items-center justify-center ${
              viewportMode === 'desktop' ? 'bg-[#FBFBFA] p-0' : 'bg-stone-100/70 p-4 sm:p-6'
            }`}>
              {viewportMode === 'desktop' ? (
                <iframe
                  ref={iframeRef}
                  key={reloadKey}
                  srcDoc={prototypeHtml}
                  title="Interactive Prototype Preview"
                  sandbox="allow-scripts allow-forms allow-modals"
                  className="w-full h-full border-0 bg-[#FBFBFA]"
                />
              ) : viewportMode === 'tablet' ? (
                <div className="w-[768px] max-w-full h-full max-h-[960px] rounded-[10px] border border-stone-300 shadow-xl overflow-hidden bg-white flex flex-col">
                  <div className="h-6 bg-stone-100 border-b border-stone-200 px-3 flex items-center justify-between text-[10px] font-mono text-stone-500 select-none">
                    <span>iPad Pro 11″</span>
                    <span className="w-8 h-1 rounded-full bg-stone-300"></span>
                    <span>768 × 1024</span>
                  </div>
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    srcDoc={prototypeHtml}
                    title="Tablet Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              ) : (
                <div className="w-[390px] max-w-full h-[780px] max-h-full rounded-[36px] border-[6px] border-stone-300 shadow-xl overflow-hidden bg-white flex flex-col">
                  <iframe
                    ref={iframeRef}
                    key={reloadKey}
                    srcDoc={prototypeHtml}
                    title="Mobile Prototype Preview"
                    sandbox="allow-scripts allow-forms allow-modals"
                    className="w-full flex-1 border-0 bg-white"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 11-Doc Markdown Blueprint Viewer */}
        {activeTab === 'docs' && (
          <div className="w-full h-full flex flex-col bg-[#FBFBFA]">
            {/* Document Selector & Search Bar */}
            <div className="bg-white px-3.5 py-2 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Search / Filter Input */}
                <div className="relative min-w-[130px] sm:w-44">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={docFilterQuery}
                    onChange={(e) => setDocFilterQuery(e.target.value)}
                    placeholder="사양서 검색..."
                    className="w-full pl-7 pr-2 py-1 text-xs font-mono bg-stone-50 border border-stone-200 rounded-[2px] text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#D97706]"
                  />
                </div>

                {/* Document Selector */}
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="flex-1 min-h-[32px] text-xs font-mono bg-stone-50 border border-stone-200 rounded-[2px] px-2.5 py-1 text-stone-900 focus:outline-none focus:border-[#D97706] truncate cursor-pointer"
                >
                  {filteredDocs.map((doc) => (
                    <option key={doc.id} value={doc.id} className="bg-white text-stone-900">
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
                  className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-[2px] text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[11px] font-mono text-stone-500 px-1">
                  {activeDocIndex + 1}/{docsList.length}
                </span>
                <button
                  onClick={handleNextDoc}
                  disabled={activeDocIndex >= docsList.length - 1}
                  title="다음 문서"
                  className="p-1.5 min-h-[30px] min-w-[30px] flex items-center justify-center rounded-[2px] text-stone-600 bg-stone-50 border border-stone-200 hover:bg-stone-100 disabled:opacity-30 transition-colors cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Document Path & Actions Bar */}
            <div className="bg-stone-50/80 px-3.5 py-1.5 border-b border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-stone-900 font-semibold text-xs">{activeDoc.relativePath}</span>
                <span className="text-stone-300">|</span>
                <span className="truncate text-stone-600 text-[11px]">{activeDoc.description}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={handleDownloadCurrentDoc}
                  title="이 사양서 파일만 다운로드 (.md)"
                  className="flex items-center gap-1 min-h-[28px] px-2 py-1 rounded-[2px] bg-white border border-stone-200 text-[11px] text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                >
                  <FileDown size={12} className="text-[#D97706]" />
                  <span className="hidden sm:inline">.md 저장</span>
                </button>

                <button
                  onClick={handleCopyCurrentDoc}
                  className="flex items-center gap-1 min-h-[28px] px-2.5 py-1 rounded-[2px] bg-white border border-stone-200 text-[11px] text-stone-800 hover:bg-stone-50 font-medium transition-colors cursor-pointer shadow-2xs"
                >
                  {copiedDoc ? (
                    <>
                      <Check size={12} className="text-[#D97706]" />
                      <span className="text-[#D97706] font-semibold">복사됨!</span>
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FBFBFA]">
              <div className="max-w-3xl mx-auto bg-white border border-stone-200/90 rounded-[2px] p-6 sm:p-8 shadow-2xs">
                <pre className="whitespace-pre-wrap leading-relaxed text-stone-800 font-mono text-xs select-text">
                  {activeDoc.content}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Golden Prompt Modal */}
        {isPromptModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
            <div className="w-full max-w-2xl bg-white rounded-[2px] border border-stone-200 shadow-2xl flex flex-col overflow-hidden text-stone-900">
              <div className="px-5 py-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-[#D97706]" />
                  <h3 className="font-sans font-bold text-sm text-stone-900">
                    에이전트 지시 골든 프롬프트 (Golden Prompt)
                  </h3>
                </div>
                <button
                  onClick={() => setIsPromptModalOpen(false)}
                  className="p-1 rounded-[2px] text-stone-400 hover:text-stone-900 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-stone-800 bg-[#FBFBFA]">
                <pre className="whitespace-pre-wrap select-text">
                  {generatePrototypePrompt(plan)}
                </pre>
              </div>

              <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
                <span className="text-[11px] text-stone-600 font-mono">
                  Cursor 또는 Claude Code 창에 붙여넣으면 프로토타입 기반으로 개발을 시작합니다.
                </span>
                <button
                  onClick={async () => {
                    await handleCopyAgentPrompt();
                    setIsPromptModalOpen(false);
                  }}
                  className="px-4 py-1.5 rounded-[2px] bg-[#D97706] text-white text-xs font-semibold hover:bg-[#B45309] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Copy size={13} />
                  <span>프롬프트 복사하기</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Visual Sitemap & Real-time D3 Tree */}
        {activeTab === 'sitemap' && (
          <div className="w-full h-full flex flex-col overflow-hidden bg-[#FBFBFA]">
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
