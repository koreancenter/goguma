import React, { useState, useMemo } from 'react';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { 
  Check, Terminal, Shield, Zap, Palette, Box, Layers, 
  FolderArchive, Download, Copy, Play, ExternalLink,
  FileCode, FileText, CheckCircle2, ChevronRight,
  BookOpen, Sparkles, AlertCircle, ArrowRight
} from 'lucide-react';
import { FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { copyProjectJsonToClipboard } from '../../lib/projectFileIO';

export interface PromptExtractionHubProps {
  formInputs?: Record<string, FormInputEntity>;
  onBack?: () => void;
  onSave?: () => void;
  largeTextMode?: boolean;
}

export default function PromptExtractionHub({ 
  formInputs,
  onBack,
  onSave,
  largeTextMode = false,
}: PromptExtractionHubProps) {
  const { plan } = useSitePlan();

  const [activeDocId, setActiveDocId] = useState<string>('01_proposal');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [copiedFirstPrompt, setCopiedFirstPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  // 1. Compile 11-Markdown bundle
  const bundle = useMemo(() => {
    return compileMarkdownBundle(plan, formInputs);
  }, [plan, formInputs]);

  // 2. Docs list with metadata
  const docsList = useMemo(() => {
    const list = getMarkdownDocsList(bundle);
    list.push({
      id: 'cursorrules',
      docNumber: 12,
      filename: '.cursorrules',
      relativePath: '.cursorrules',
      title: 'Cursor 에이전트 지침',
      engTitle: 'Cursor Rules',
      description: 'Cursor AI 에이전트 불변 행동 규칙 및 라이브러리 통제',
      content: bundle.cursorrules,
    });
    return list;
  }, [bundle]);

  const activeDoc: MarkdownDocInfo = useMemo(() => {
    return docsList.find(d => d.id === activeDocId) || docsList[0];
  }, [docsList, activeDocId]);

  // First instruction prompt for AI agents (Cursor / Claude Code)
  const firstPromptText = useMemo(() => {
    const projName = plan.metadata?.projectName?.trim() || '우리동네 동물병원 예약장부';
    return `안녕하세요! '${projName}' 프로젝트의 바이브 코딩을 시작합니다.
먼저 프로젝트 폴더의 docs/ 폴더에 준비된 사양서 11종 중:
1. docs/04_SPEC.md (전체 화면 IA 및 기능 명세)
2. docs/06_DATA_SCHEMA.md (장부 데이터 스키마 & TypeScript 인터페이스)
3. docs/05_ARCH_CONSTITUTION.md (아키텍처 불변 헌법 및 npm 패키지 설치 금지 규칙)
를 면밀히 검토해 주세요.

그리고 prototype.html을 참고하여 1단계 화면(장부 대시보드 및 신규 등록 모달)을 먼저 만들어 주세요!`;
  }, [plan]);

  // Handle ZIP download
  const handleDownloadZip = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadBlueprintZip(plan, formInputs);
      setDownloadDone(true);
      setTimeout(() => setDownloadDone(false), 3000);
    } catch (e: any) {
      alert('ZIP 다운로드 중 오류가 발생했습니다: ' + e.message);
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
      console.error('Failed to copy prompt', e);
    }
  };

  // Open standalone prototype
  const handleOpenPrototype = () => {
    const blob = new Blob([bundle.prototypeHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const projectName = plan.metadata?.projectName?.trim() || '새 프로젝트';

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12 text-[#F0F3F6]">
      {/* 1. Header Banner: Inspection Status */}
      <div className="bg-[#13181F] rounded-[3px] p-6 border border-white/7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/7 pb-5">
          <div>
            {/* Unboxed Metadata Header */}
            <div className="flex items-center gap-2 mb-2 text-xs text-[#5C6675]">
              <span className="font-mono text-[#C5A880]">08. 산출물 허브</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                11종 사양서 준비 완료
              </span>
            </div>
            <h1 className={`font-bold text-[#F0F3F6] tracking-tight leading-tight ${
              largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`} style={{ textWrap: 'balance' }}>
              바이브 코딩 배포 허브
            </h1>
            <p className={`text-[#9AA5B5] font-sans mt-1.5 leading-relaxed ${
              largeTextMode ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
            }`}>
              {projectName}의 11종 마크다운 사양서 번들과 단일 파일 프로토타입 패키지가 완성되었습니다.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-[3px] bg-[#C5A880] hover:bg-[#D4AF37] active:bg-[#C5A880] text-[#0B0C10] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {downloadDone ? (
                <>
                  <Check size={16} />
                  <span>다운로드 완료</span>
                </>
              ) : (
                <>
                  <FolderArchive size={16} />
                  <span>{isDownloading ? '압축 생성 중...' : '11종 번들 (.zip) 다운로드'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Spec Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
            <div className="text-xs text-[#9AA5B5]">마크다운 사양서</div>
            <div className="text-lg font-mono font-semibold tabular-nums text-[#F0F3F6] mt-1">11개 문서</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">01_proposal ~ 11_sys</div>
          </div>

          <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
            <div className="text-xs text-[#9AA5B5]">에이전트 규칙</div>
            <div className="text-lg font-mono font-semibold text-[#F0F3F6] mt-1">.cursorrules</div>
            <div className="text-[11px] text-[#C5A880] font-mono mt-0.5">에이전트 규약 강제</div>
          </div>

          <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
            <div className="text-xs text-[#9AA5B5]">실행 프로토타입</div>
            <div className="text-lg font-mono font-semibold text-[#F0F3F6] mt-1">단일 HTML</div>
            <div className="text-[11px] text-emerald-400 font-mono mt-0.5">브라우저 즉시 구동</div>
          </div>

          <div className="bg-[#18202A] p-3.5 rounded-[3px] border border-white/5">
            <div className="text-xs text-[#9AA5B5]">아키텍처 규약</div>
            <div className="text-lg font-mono font-semibold text-[#F0F3F6] mt-1">Local-First</div>
            <div className="text-[11px] text-[#9AA5B5] font-mono mt-0.5">IndexedDB + Vanilla</div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-[#F0F3F6]">
          바이브 코딩 3단계 진행 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* STEP 1 */}
          <div className="bg-[#13181F] p-4.5 rounded-[3px] border border-white/7 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums">01.</span>
              <h3 className="font-semibold text-[#F0F3F6] text-sm">
                ZIP 패키지 다운로드
              </h3>
              <p className="text-xs text-[#9AA5B5] leading-relaxed">
                상단의 <strong>[11종 번들 다운로드]</strong>를 클릭해 압축 파일(<code className="text-[#C5A880] font-mono">goguma-blueprint.zip</code>)을 받습니다.
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              className="w-full py-2 px-3 rounded-[3px] bg-[#18202A] hover:bg-white/10 text-[#F0F3F6] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <Download size={14} />
              <span>ZIP 다운로드</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#13181F] p-4.5 rounded-[3px] border border-white/7 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums">02.</span>
              <h3 className="font-semibold text-[#F0F3F6] text-sm">
                새 폴더에 압축 해제
              </h3>
              <p className="text-xs text-[#9AA5B5] leading-relaxed">
                작업할 폴더에 압축을 풉니다. 폴더 내 <code className="text-[#C5A880] font-mono">prototype.html</code>을 열어 동작 화면을 미리 확인하세요.
              </p>
            </div>
            <button
              onClick={handleOpenPrototype}
              className="w-full py-2 px-3 rounded-[3px] bg-[#18202A] hover:bg-white/10 text-[#F0F3F6] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              <ExternalLink size={14} />
              <span>프로토타입 열기</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#13181F] p-4.5 rounded-[3px] border border-white/7 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums">03.</span>
              <h3 className="font-semibold text-[#F0F3F6] text-sm">
                에이전트에 첫 명령 전달
              </h3>
              <p className="text-xs text-[#9AA5B5] leading-relaxed">
                Cursor / Claude Code 대화창에 아래 <strong>[첫 지시 프롬프트]</strong>를 붙여넣고 전송합니다.
              </p>
            </div>
            <button
              onClick={handleCopyFirstPrompt}
              className="w-full py-2 px-3 rounded-[3px] bg-[#C5A880] hover:bg-[#D4AF37] text-[#0B0C10] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedFirstPrompt ? (
                <>
                  <Check size={14} />
                  <span>복사 완료</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>첫 지시 프롬프트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. First Prompt Preview Card */}
      <div className="bg-[#13181F] rounded-[3px] p-5 border border-white/7 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#C5A880]" />
            <span className="text-xs sm:text-sm font-semibold text-[#F0F3F6]">
              첫 지시 프롬프트
            </span>
          </div>
          <button
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#18202A] hover:bg-white/10 border border-white/10 text-xs text-[#F0F3F6] font-medium cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedFirstPrompt ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono leading-relaxed text-[#F0F3F6] bg-[#0E1217] p-4 rounded-[3px] border border-white/5 select-text ${
          largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
        }`}>
          {firstPromptText}
        </pre>
      </div>

      {/* 4. Complete 11-Spec Blueprint Viewer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <FileCode size={15} className="text-[#C5A880]" />
            <h2 className="text-base font-semibold text-[#F0F3F6]">
              11종 사양서 개별 열람 및 복사
            </h2>
          </div>
          <span className="text-xs text-[#5C6675]">문서 탭을 선택하여 내용을 확인하세요.</span>
        </div>

        {/* Document Tabs Strip - Clean Segmented Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-[#13181F] p-1.5 rounded-[3px] border border-white/7">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-[3px] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#18202A] text-[#C5A880] border border-white/10 font-semibold'
                    : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5'
                }`}
              >
                <span className="text-[#5C6675]">{doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}</span>
                <span className="font-sans">{doc.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Active Document Viewer */}
        <div className="bg-[#13181F] rounded-[3px] border border-white/7 overflow-hidden">
          <div className="bg-[#18202A] px-4 py-2.5 border-b border-white/7 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="font-mono text-[#C5A880]">
                {activeDoc.relativePath}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-[#9AA5B5] truncate">
                {activeDoc.title}
              </span>
            </div>
            <button
              onClick={() => handleCopyDoc(activeDoc)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-[#13181F] hover:bg-white/10 border border-white/10 text-xs text-[#F0F3F6] font-medium transition-colors cursor-pointer shrink-0 ml-2"
            >
              {copiedDocId === activeDoc.id ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">복사됨</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>문서 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#F0F3F6] bg-[#0E1217] selection:bg-[#C5A880]/30 selection:text-[#F0F3F6]">
            <pre className={`whitespace-pre-wrap select-text ${
              largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
            }`}>
              {activeDoc.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
