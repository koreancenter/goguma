import React, { useState, useMemo } from 'react';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { 
  Check, Terminal, Download, Copy, ExternalLink,
  FileCode, FolderArchive
} from 'lucide-react';
import { FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { compileStandalonePrototypeHtml } from '../../lib/prototypeCompiler';

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  // 1. Compile 11-Markdown bundle
  const bundle = useMemo(() => {
    return compileMarkdownBundle(plan, formInputs);
  }, [plan, formInputs]);

  // 2. Docs list with metadata (SSOT)
  const docsList = useMemo(() => {
    return getMarkdownDocsList(bundle);
  }, [bundle]);

  const activeDoc: MarkdownDocInfo = useMemo(() => {
    return docsList.find(d => d.id === activeDocId) || docsList[0];
  }, [docsList, activeDocId]);

  // First instruction prompt for AI agents (Cursor / Claude Code)
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
      console.error('Failed to copy', e);
    }
  };

  // Open standalone prototype in new tab
  const handleOpenPrototype = () => {
    const html = compileStandalonePrototypeHtml(plan);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const projectName = plan.metadata?.projectName || '새 프로젝트';

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12 text-[#F5F3ED]">
      {/* 1. Header Banner: Inspection Status */}
      <div className="bg-[#121216] rounded-[2px] p-6 border border-[#23232A] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23232A] pb-5">
          <div>
            {/* Unboxed Metadata Header */}
            <div className="flex items-center gap-2 mb-2 text-xs text-[#8E8B82]">
              <span className="font-mono text-[#F5F3ED] font-semibold">08. ARTIFACTS HUB</span>
              <span aria-hidden="true" className="text-[#23232A]">·</span>
              <span className="flex items-center gap-1.5 text-[#C5A880] font-mono tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                11종 사양서 준비 완료
              </span>
            </div>
            <h1 className={`font-sans font-bold text-[#F5F3ED] tracking-tight leading-tight uppercase ${
              largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`} style={{ textWrap: 'balance' }}>
              바이브 코딩 배포 허브
            </h1>
            <p className={`text-[#8E8B82] font-sans mt-1.5 leading-relaxed ${
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
              className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-[2px] bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs"
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
          <div className="bg-[#141418] p-3.5 rounded-[2px] border border-[#23232A]">
            <div className="text-xs text-[#8E8B82]">마크다운 사양서</div>
            <div className="text-lg font-sans font-semibold tabular-nums text-[#F5F3ED] mt-1">11개 문서</div>
            <div className="text-[11px] text-[#8E8B82] font-mono mt-0.5">01_proposal ~ 11_sys</div>
          </div>

          <div className="bg-[#141418] p-3.5 rounded-[2px] border border-[#23232A]">
            <div className="text-xs text-[#8E8B82]">에이전트 규칙</div>
            <div className="text-lg font-mono font-semibold text-[#C5A880] mt-1">.cursorrules</div>
            <div className="text-[11px] text-[#8E8B82] font-mono mt-0.5">에이전트 규약 강제</div>
          </div>

          <div className="bg-[#141418] p-3.5 rounded-[2px] border border-[#23232A]">
            <div className="text-xs text-[#8E8B82]">실행 프로토타입</div>
            <div className="text-lg font-sans font-semibold text-[#F5F3ED] mt-1">단일 HTML</div>
            <div className="text-[11px] text-[#8E8B82] font-mono mt-0.5">브라우저 즉시 구동</div>
          </div>

          <div className="bg-[#141418] p-3.5 rounded-[2px] border border-[#23232A]">
            <div className="text-xs text-[#8E8B82]">아키텍처 규약</div>
            <div className="text-lg font-mono font-semibold text-[#D4B992] mt-1">Local-First</div>
            <div className="text-[11px] text-[#8E8B82] font-mono mt-0.5">IndexedDB + Vanilla</div>
          </div>
        </div>
      </div>

      {/* 2. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-sans font-semibold text-[#F5F3ED]">
          바이브 코딩 3단계 진행 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* STEP 1 */}
          <div className="bg-[#121216] p-4.5 rounded-[2px] border border-[#23232A] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums font-semibold">01.</span>
              <h3 className="font-sans font-semibold text-[#F5F3ED] text-sm">
                ZIP 패키지 다운로드
              </h3>
              <p className="text-xs text-[#8E8B82] leading-relaxed">
                상단의 <strong>[11종 번들 다운로드]</strong>를 클릭해 압축 파일(<code className="text-[#C5A880] font-mono bg-[#16161D] px-1 py-0.5 rounded-[2px] border border-[#23232A]">goguma-blueprint.zip</code>)을 받습니다.
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              className="w-full py-2 px-3 rounded-[2px] bg-[#16161D] hover:bg-[#202028] text-[#F5F3ED] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#23232A]"
            >
              <Download size={14} className="text-[#C5A880]" />
              <span>ZIP 다운로드</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#121216] p-4.5 rounded-[2px] border border-[#23232A] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums font-semibold">02.</span>
              <h3 className="font-sans font-semibold text-[#F5F3ED] text-sm">
                새 폴더에 압축 해제
              </h3>
              <p className="text-xs text-[#8E8B82] leading-relaxed">
                작업할 폴더에 압축을 풉니다. 폴더 내 <code className="text-[#C5A880] font-mono bg-[#16161D] px-1 py-0.5 rounded-[2px] border border-[#23232A]">prototype.html</code>을 열어 동작 화면을 미리 확인하세요.
              </p>
            </div>
            <button
              onClick={handleOpenPrototype}
              className="w-full py-2 px-3 rounded-[2px] bg-[#16161D] hover:bg-[#202028] text-[#F5F3ED] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#23232A]"
            >
              <ExternalLink size={14} className="text-[#C5A880]" />
              <span>프로토타입 열기</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#121216] p-4.5 rounded-[2px] border border-[#23232A] flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#C5A880] tabular-nums font-semibold">03.</span>
              <h3 className="font-sans font-semibold text-[#F5F3ED] text-sm">
                에이전트에 첫 명령 전달
              </h3>
              <p className="text-xs text-[#8E8B82] leading-relaxed">
                Cursor / Claude Code 대화창에 아래 <strong>[첫 지시 프롬프트]</strong>를 붙여넣고 전송합니다.
              </p>
            </div>
            <button
              onClick={handleCopyFirstPrompt}
              className="w-full py-2 px-3 rounded-[2px] bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
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
      <div className="bg-[#121216] rounded-[2px] p-5 border border-[#23232A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#C5A880]" />
            <span className="text-xs sm:text-sm font-sans font-semibold text-[#F5F3ED]">
              첫 지시 프롬프트
            </span>
          </div>
          <button
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#141418] hover:bg-[#1A1A22] border border-[#23232A] text-xs text-[#F5F3ED] font-medium cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={13} className="text-[#C5A880]" /> : <Copy size={13} className="text-[#8E8B82]" />}
            <span>{copiedFirstPrompt ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono leading-relaxed text-[#F5F3ED] bg-[#141418] p-4 rounded-[2px] border border-[#23232A] select-text ${
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
            <h2 className="text-base font-sans font-semibold text-[#F5F3ED]">
              11종 사양서 개별 열람 및 복사
            </h2>
          </div>
          <span className="text-xs text-[#8E8B82] font-mono">문서 탭을 선택하여 내용을 확인하세요.</span>
        </div>

        {/* Document Tabs Strip - Clean Segmented Buttons */}
        <div className="flex flex-wrap gap-1 bg-[#0E0E12] p-1.5 rounded-[2px] border border-[#23232A]">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-[2px] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-xs'
                    : 'text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#16161D]'
                }`}
              >
                <span className={isActive ? 'text-[#0A0A0C]/80 font-bold' : 'text-[#8E8B82]'}>
                  {doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span className="font-sans">{doc.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Active Document Viewer */}
        <div className="bg-[#121216] rounded-[2px] border border-[#23232A] overflow-hidden">
          <div className="bg-[#0E0E12] px-4 py-2.5 border-b border-[#23232A] flex items-center justify-between">
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="font-mono text-[#F5F3ED] font-semibold">
                {activeDoc.relativePath}
              </span>
              <span className="text-[#23232A]">·</span>
              <span className="text-[#8E8B82] truncate">
                {activeDoc.title}
              </span>
            </div>
            <button
              onClick={() => handleCopyDoc(activeDoc)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-[#141418] hover:bg-[#1A1A22] border border-[#23232A] text-xs text-[#F5F3ED] font-medium transition-colors cursor-pointer shrink-0 ml-2"
            >
              {copiedDocId === activeDoc.id ? (
                <>
                  <Check size={13} className="text-[#C5A880]" />
                  <span className="text-[#C5A880]">복사됨</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-[#8E8B82]" />
                  <span>문서 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#F5F3ED] bg-[#121216]">
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
