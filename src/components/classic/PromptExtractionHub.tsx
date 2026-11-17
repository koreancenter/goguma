import React, { useState, useMemo } from 'react';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { 
  Check, Terminal, Download, Copy, ExternalLink,
  FileCode, FolderArchive
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
  const { plan } = useSitePlan();

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
      setDownloadError('ZIP 다운로드 중 오류가 발생했습니다: ' + (e?.message || '알 수 없는 오류'));
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

  const projectName = plan.metadata?.projectName || '새 프로젝트';

  return (
    <div className="flex-1 flex flex-col space-y-14 pb-16 text-[#111111]">
      {/* 1. Sejong Editorial Header & Metrics */}
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[15px] sm:text-[16px] font-bold uppercase tracking-[0.16em] text-[#52524E]">
            CHAPTER 08 · ARTIFACTS &amp; VIBE-CODING HUB
          </span>
        </div>

        <header className="border-t-2 border-t-[#000000] border-b border-b-[#E4E2DC] pt-8 pb-8 sm:pt-10 sm:pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1
              className={`font-extrabold text-[#000000] tracking-[-0.03em] leading-tight ${
                largeTextMode ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-4xl'
              }`}
              style={{ textWrap: 'balance' }}
            >
              바이브 코딩 배포 허브
            </h1>
            <p
              className={`text-[#52524E] leading-[1.65] max-w-3xl ${
                largeTextMode ? 'text-[20px] sm:text-[23px]' : 'text-[18px] sm:text-[20px]'
              }`}
            >
              {projectName}의 11종 마크다운 사양서, 에이전트 규약(.cursorrules/.clinerules), 단일 HTML 프로토타입 및 Cursor/Claude 전용 골든 프롬프트 패키지입니다.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] font-bold text-[17px] transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {downloadDone ? (
                <>
                  <Check size={17} />
                  <span>다운로드 완료</span>
                </>
              ) : (
                <>
                  <FolderArchive size={17} />
                  <span>{isDownloading ? '압축 생성 중...' : '11종 번들 (.zip) 다운로드'}</span>
                </>
              )}
            </button>
          </div>
        </header>

        {downloadError && (
          <div className="px-5 py-3.5 rounded-none bg-[#F6F5F1] border border-[#000000] text-[#DC2626] text-[16px] font-bold">
            {downloadError}
          </div>
        )}

        {/* Quick Spec Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#E4E2DC] divide-x divide-y sm:divide-y-0 divide-[#E4E2DC] bg-[#F6F5F1]">
          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[#52524E] font-medium">마크다운 사양서</div>
            <div className="text-[20px] font-extrabold tabular-nums text-[#000000]">11개 문서</div>
            <div className="text-[14px] text-[#787772] font-mono">01_proposal ~ 11_sys</div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[#52524E] font-medium">에이전트 규칙</div>
            <div className="text-[20px] font-extrabold text-[#000000]">.cursorrules</div>
            <div className="text-[14px] text-[#787772] font-mono">.clinerules &amp; CLAUDE.md</div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[#52524E] font-medium">실행 프로토타입</div>
            <div className="text-[20px] font-extrabold text-[#000000]">prototype.html</div>
            <div className="text-[14px] text-[#787772]">브라우저 즉시 구동</div>
          </div>

          <div className="p-5 sm:p-6 space-y-1.5">
            <div className="text-[15px] text-[#52524E] font-medium">아키텍처 규약</div>
            <div className="text-[20px] font-extrabold text-[#000000]">Local-First</div>
            <div className="text-[14px] text-[#787772]">IndexedDB 영속성</div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Golden Prompt Callout */}
      <div className="bg-[#F6F5F1] border border-t-2 border-t-[#000000] border-[#E4E2DC] rounded-none p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#E4E2DC]">
          <div className="space-y-2">
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#000000] tracking-[-0.02em]">
              골든 프롬프트 (Cursor / Claude Code)
            </h2>
            <p className="text-[17px] sm:text-[18px] text-[#52524E] leading-[1.7]">
              <strong className="text-[#000000]">Prototype-as-Spec 1:1 역공학 지침</strong>: AI 에이전트의 환각을 원천 차단하고 <code className="text-[#000000] font-mono bg-[#FFFFFF] border border-[#E4E2DC] px-2 py-0.5 rounded-none">prototype.html</code>과 사양서 11종을 프로덕션 코드로 직결합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyGoldenPrompt}
              className="flex items-center gap-2 px-5 py-3 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] font-bold text-[16px] transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={16} />
                  <span>골든 프롬프트 복사됨</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>골든 프롬프트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Unboxed Feature Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] font-bold text-[#52524E]">
          <span>✓ Prototype-as-Spec</span>
          <span>·</span>
          <span>✓ React 19 + TypeScript + Tailwind</span>
          <span>·</span>
          <span>✓ Zero-Slop Rule</span>
          <span>·</span>
          <span>✓ 환각 방지 불변 규약</span>
        </div>

        {/* Golden Prompt Text Code Block */}
        <pre className={`whitespace-pre-wrap font-mono text-[#111111] bg-[#FFFFFF] p-5 sm:p-6 rounded-none border border-[#E4E2DC] select-text max-h-[360px] overflow-y-auto custom-scroll ${
          largeTextMode ? 'text-[17px] sm:text-[19px] leading-[1.8]' : 'text-[16px] sm:text-[17px] leading-[1.75]'
        }`}>
          {goldenPromptText}
        </pre>
      </div>

      {/* 3. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-6">
        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#000000] tracking-[-0.02em] pb-3 border-b border-[#000000]">
          바이브 코딩 3단계 진행 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* STEP 1 */}
          <div className="bg-[#F6F5F1] border border-[#E4E2DC] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[#52524E] tabular-nums font-extrabold block">01</span>
              <h3 className="font-extrabold text-[#000000] text-[19px]">
                ZIP 패키지 다운로드
              </h3>
              <p className="text-[16px] text-[#52524E] leading-[1.7]">
                상단의 <strong className="text-[#000000]">[11종 번들 다운로드]</strong>를 클릭해 사양서·에이전트 룰·프로토타입이 담긴 ZIP 파일을 받습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadZip}
              className="w-full py-3 px-4 rounded-none bg-[#FFFFFF] hover:bg-[#000000] text-[#000000] hover:text-[#FFE600] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#000000]"
            >
              <Download size={16} />
              <span>ZIP 다운로드</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#F6F5F1] border border-[#E4E2DC] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[#52524E] tabular-nums font-extrabold block">02</span>
              <h3 className="font-extrabold text-[#000000] text-[19px]">
                새 폴더에 압축 해제
              </h3>
              <p className="text-[16px] text-[#52524E] leading-[1.7]">
                로컬 프로젝트 폴더에 압축을 풀고 폴더 내 <code className="text-[#000000] font-mono bg-[#FFFFFF] border border-[#E4E2DC] px-1.5 py-0.5 rounded-none">prototype.html</code>로 전체 화면 동작을 확인하세요.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenPrototype}
              className="w-full py-3 px-4 rounded-none bg-[#FFFFFF] hover:bg-[#000000] text-[#000000] hover:text-[#FFE600] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#000000]"
            >
              <ExternalLink size={16} />
              <span>프로토타입 열기</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#F6F5F1] border border-[#E4E2DC] p-6 rounded-none flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <span className="text-[15px] text-[#52524E] tabular-nums font-extrabold block">03</span>
              <h3 className="font-extrabold text-[#000000] text-[19px]">
                에이전트에 명령 전달
              </h3>
              <p className="text-[16px] text-[#52524E] leading-[1.7]">
                Cursor 또는 Claude Code 창에 <strong className="text-[#000000]">[골든 프롬프트]</strong>를 붙여넣고 빌드를 시작합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyGoldenPrompt}
              className="w-full py-3 px-4 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] font-bold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={16} />
                  <span>복사 완료</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>골든 프롬프트 복사</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Quick Kickoff Prompt Callout */}
      <div className="bg-[#F6F5F1] border border-[#E4E2DC] rounded-none p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Terminal size={18} className="text-[#000000]" />
            <span className="text-[19px] font-extrabold text-[#000000]">
              간편 킥오프 프롬프트
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#FFFFFF] hover:bg-[#000000] border border-[#000000] text-[15px] text-[#000000] hover:text-[#FFE600] font-bold cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedFirstPrompt ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono text-[#111111] bg-[#FFFFFF] p-5 rounded-none border border-[#E4E2DC] select-text ${
          largeTextMode ? 'text-[17px] sm:text-[19px] leading-[1.8]' : 'text-[16px] sm:text-[17px] leading-[1.75]'
        }`}>
          {firstPromptText}
        </pre>
      </div>

      {/* 5. Complete 11-Spec Blueprint Viewer */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[#000000]">
          <div className="flex items-center gap-2.5">
            <FileCode size={20} className="text-[#000000]" />
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[#000000] tracking-[-0.02em]">
              11종 사양서 개별 열람 및 복사
            </h2>
          </div>
          <span className="text-[15px] text-[#787772]">문서 탭을 선택하여 내용을 확인하세요.</span>
        </div>

        {/* Document Tabs Strip */}
        <div className="flex flex-wrap gap-2 bg-[#F6F5F1] border border-[#E4E2DC] p-3 rounded-none">
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
                    ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                    : isPlaybook
                    ? 'bg-[#FFFFFF] text-[#000000] border-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626]'
                    : 'bg-[#FFFFFF] text-[#52524E] border-[#E4E2DC] hover:text-[#000000] hover:border-[#000000]'
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
        <div className="bg-[#FFFFFF] rounded-none border border-t-2 border-t-[#000000] border-[#E4E2DC] overflow-hidden">
          <div className="bg-[#F6F5F1] px-5 py-4 border-b border-[#E4E2DC] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate text-[16px]">
              <span className="font-mono text-[#000000] font-bold">
                {activeDoc.relativePath}
              </span>
              <span className="text-[#CBC8BF]">·</span>
              <span className="text-[#52524E] truncate font-medium">
                {activeDoc.title}
              </span>
              {docImpactMap[activeDoc.id] && docImpactMap[activeDoc.id] !== 'idle' && (
                <span
                  className={`text-[14px] font-bold whitespace-nowrap shrink-0 ${
                    docImpactMap[activeDoc.id] === 'locked' ? 'text-[#DC2626]' : 'text-[#000000]'
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
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[15px] text-[#FFFFFF] font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedVibePrompt ? (
                  <>
                    <Check size={15} />
                    <span>Copied Vibe-Coding Prompt</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Vibe-Coding Prompt</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleCopyDoc(activeDoc)}
                className="flex items-center gap-2 px-4 py-2 rounded-none bg-[#FFFFFF] hover:bg-[#000000] border border-[#000000] text-[15px] text-[#000000] hover:text-[#FFE600] font-bold transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedDocId === activeDoc.id ? (
                  <>
                    <Check size={15} />
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>문서 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[520px] overflow-y-auto font-mono text-[#111111] bg-[#FFFFFF] custom-scroll">
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
