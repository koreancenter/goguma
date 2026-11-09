import React, { useState, useMemo } from 'react';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { 
  Check, Terminal, Download, Copy, ExternalLink,
  FileCode, FolderArchive
} from 'lucide-react';
import { FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { compileStandalonePrototypeHtml, generatePrototypePrompt } from '../../lib/prototypeCompiler';

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
  const [copiedGoldenPrompt, setCopiedGoldenPrompt] = useState(false);
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

  // Golden Prompt for Cursor / Claude Code / Windsurf (Prototype-as-Spec 1:1 reverse engineering)
  const goldenPromptText = useMemo(() => {
    return generatePrototypePrompt(plan);
  }, [plan]);

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

  // Open standalone prototype in new tab
  const handleOpenPrototype = () => {
    const html = compileStandalonePrototypeHtml(plan);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const projectName = plan.metadata?.projectName || '새 프로젝트';

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-12 text-stone-900">
      {/* 1. Header Banner: Inspection Status */}
      <div className="bg-white rounded-[2px] p-6 border border-stone-200/90 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
          <div>
            {/* Unboxed Metadata Header */}
            <div className="flex items-center gap-2 mb-2 text-xs text-stone-500">
              <span className="font-mono text-stone-900 font-semibold">08. ARTIFACTS HUB</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="flex items-center gap-1.5 text-[#D97706] font-mono tabular-nums">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                11종 사양서 및 골든 프롬프트 준비 완료
              </span>
            </div>
            <h1 className={`font-sans font-bold text-stone-900 tracking-tight leading-tight uppercase ${
              largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`} style={{ textWrap: 'balance' }}>
              바이브 코딩 배포 허브
            </h1>
            <p className={`text-stone-600 font-sans mt-1.5 leading-relaxed ${
              largeTextMode ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'
            }`}>
              {projectName}의 11종 마크다운 사양서, 에이전트 규약(.cursorrules/.clinerules), 단일 HTML 프로토타입 및 Cursor/Claude 전용 골든 프롬프트 패키지입니다.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap shadow-xs"
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
          <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/80">
            <div className="text-xs text-stone-500">마크다운 사양서</div>
            <div className="text-lg font-sans font-semibold tabular-nums text-stone-900 mt-1">11개 문서</div>
            <div className="text-[11px] text-stone-400 font-mono mt-0.5">01_proposal ~ 11_sys</div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/80">
            <div className="text-xs text-stone-500">에이전트 규칙</div>
            <div className="text-lg font-mono font-semibold text-amber-700 mt-1">.cursorrules</div>
            <div className="text-[11px] text-stone-400 font-mono mt-0.5">.clinerules & CLAUDE.md</div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/80">
            <div className="text-xs text-stone-500">실행 프로토타입</div>
            <div className="text-lg font-sans font-semibold text-stone-900 mt-1">prototype.html</div>
            <div className="text-[11px] text-stone-400 font-mono mt-0.5">단일 파일 브라우저 즉시 구동</div>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/80">
            <div className="text-xs text-stone-500">아키텍처 규약</div>
            <div className="text-lg font-mono font-semibold text-emerald-700 mt-1">Local-First</div>
            <div className="text-[11px] text-stone-400 font-mono mt-0.5">IndexedDB 영속성</div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Golden Prompt Card: Cursor & Claude Code */}
      <div className="bg-white rounded-[2px] p-5 sm:p-6 border border-stone-200/90 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
              <h2 className="text-sm sm:text-base font-sans font-bold text-stone-900 uppercase tracking-wide">
                골든 프롬프트 (Golden Prompt — Cursor / Claude Code 전용)
              </h2>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              <strong>Prototype-as-Spec 1:1 역공학 지침</strong>: AI 에이전트의 환각을 원천 차단하고 <code className="text-[#D97706] font-mono bg-amber-50 px-1 py-0.5 rounded-[2px] border border-amber-200/70">prototype.html</code>과 사양서 11종을 무손실 프로덕션 코드로 직결합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyGoldenPrompt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={14} />
                  <span>골든 프롬프트 복사됨!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>골든 프롬프트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-[2px]">
            ✓ Prototype-as-Spec
          </span>
          <span className="text-[10px] font-mono text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-[2px]">
            ✓ React 19 + TypeScript + Tailwind
          </span>
          <span className="text-[10px] font-mono text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-[2px]">
            ✓ Zero-Slop Rule
          </span>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-[2px]">
            ✓ 환각 방지 불변 규약
          </span>
        </div>

        {/* Golden Prompt Text Code Block */}
        <pre className={`whitespace-pre-wrap font-mono leading-relaxed text-stone-800 bg-stone-50 p-4 sm:p-5 rounded-[2px] border border-stone-200 select-text max-h-[320px] overflow-y-auto custom-scroll ${
          largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
        }`}>
          {goldenPromptText}
        </pre>
      </div>

      {/* 3. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-3">
        <h2 className="text-base font-sans font-semibold text-stone-900">
          바이브 코딩 3단계 진행 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* STEP 1 */}
          <div className="bg-white p-4.5 rounded-[2px] border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#D97706] tabular-nums font-semibold">01.</span>
              <h3 className="font-sans font-semibold text-stone-900 text-sm">
                ZIP 패키지 다운로드
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                상단의 <strong>[11종 번들 다운로드]</strong>를 클릭해 압축 파일(<code className="text-[#D97706] font-mono bg-amber-50 px-1 py-0.5 rounded-[2px] border border-amber-200/70">goguma-blueprint.zip</code>)을 받습니다. (11종 문서, 에이전트 룰 3종, 프로토타입 포함)
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              className="w-full py-2 px-3 rounded-[2px] bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
            >
              <Download size={14} className="text-[#D97706]" />
              <span>ZIP 다운로드</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-white p-4.5 rounded-[2px] border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#D97706] tabular-nums font-semibold">02.</span>
              <h3 className="font-sans font-semibold text-stone-900 text-sm">
                새 폴더에 압축 해제
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                작업할 로컬 프로젝트 폴더에 압축을 풉니다. 폴더 내 <code className="text-[#D97706] font-mono bg-amber-50 px-1 py-0.5 rounded-[2px] border border-amber-200/70">prototype.html</code>을 브라우저로 열어 전체 화면 동작을 확인하세요.
              </p>
            </div>
            <button
              onClick={handleOpenPrototype}
              className="w-full py-2 px-3 rounded-[2px] bg-stone-50 hover:bg-stone-100 text-stone-800 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
            >
              <ExternalLink size={14} className="text-[#D97706]" />
              <span>프로토타입 열기</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-white p-4.5 rounded-[2px] border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#D97706] tabular-nums font-semibold">03.</span>
              <h3 className="font-sans font-semibold text-stone-900 text-sm">
                에이전트에 명령 전달
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cursor 또는 Claude Code 창에 <strong>[골든 프롬프트]</strong>를 붙여넣고 빌드를 시작합니다.
              </p>
            </div>
            <button
              onClick={handleCopyGoldenPrompt}
              className="w-full py-2 px-3 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={14} />
                  <span>복사 완료</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>골든 프롬프트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Kickoff Prompt Card */}
      <div className="bg-white rounded-[2px] p-5 border border-stone-200/90 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#D97706]" />
            <span className="text-xs sm:text-sm font-sans font-semibold text-stone-900">
              간편 킥오프 프롬프트
            </span>
          </div>
          <button
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-stone-50 hover:bg-stone-100 border border-stone-200 text-xs text-stone-800 font-medium cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={13} className="text-[#D97706]" /> : <Copy size={13} className="text-stone-500" />}
            <span>{copiedFirstPrompt ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono leading-relaxed text-stone-800 bg-stone-50 p-4 rounded-[2px] border border-stone-200 select-text ${
          largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
        }`}>
          {firstPromptText}
        </pre>
      </div>

      {/* 5. Complete 11-Spec Blueprint Viewer */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <FileCode size={15} className="text-[#D97706]" />
            <h2 className="text-base font-sans font-semibold text-stone-900">
              11종 사양서 개별 열람 및 복사
            </h2>
          </div>
          <span className="text-xs text-stone-500 font-mono">문서 탭을 선택하여 내용을 확인하세요.</span>
        </div>

        {/* Document Tabs Strip - Clean Segmented Buttons */}
        <div className="flex flex-wrap gap-1 bg-stone-100/90 p-1.5 rounded-[2px] border border-stone-200/80">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-[2px] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#D97706] text-white font-semibold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/80'
                }`}
              >
                <span className={isActive ? 'text-white/80 font-bold' : 'text-stone-400'}>
                  {doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span className="font-sans">{doc.filename}</span>
              </button>
            );
          })}
        </div>

        {/* Active Document Viewer */}
        <div className="bg-white rounded-[2px] border border-stone-200/90 overflow-hidden shadow-2xs">
          <div className="bg-stone-50/80 px-4 py-2.5 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="font-mono text-stone-900 font-semibold">
                {activeDoc.relativePath}
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-stone-600 truncate">
                {activeDoc.title}
              </span>
            </div>
            <button
              onClick={() => handleCopyDoc(activeDoc)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] bg-white hover:bg-stone-50 border border-stone-200 text-xs text-stone-800 font-medium transition-colors cursor-pointer shrink-0 ml-2 shadow-2xs"
            >
              {copiedDocId === activeDoc.id ? (
                <>
                  <Check size={13} className="text-[#D97706]" />
                  <span className="text-[#D97706] font-semibold">복사됨</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-stone-500" />
                  <span>문서 복사</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-stone-800 bg-[#FBFBFA] custom-scroll">
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
