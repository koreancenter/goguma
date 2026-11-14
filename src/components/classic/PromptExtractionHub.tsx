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
    try {
      await downloadBlueprintZip(plan, formInputs, lockedChapters);
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

  // Open standalone prototype in new tab
  const handleOpenPrototype = () => {
    const html = compileStandalonePrototypeHtml(plan, { formInputs });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const projectName = plan.metadata?.projectName || '새 프로젝트';

  return (
    <div className="flex-1 flex flex-col space-y-10 pb-12 text-[#111827]">
      {/* 1. Editorial Header & Metrics */}
      <div className="space-y-6 pb-8 border-b border-[#E5E7EB]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-xs text-[#6B7280]">
              <span className="font-mono text-[#1E3A8A] font-semibold">08. ARTIFACTS HUB</span>
              <span aria-hidden="true" className="text-[#D1D5DB]">·</span>
              <span className="font-mono text-[#4B5563]">
                11종 사양서 및 골든 프롬프트 준비 완료
              </span>
            </div>
            <h1 className={`font-sans font-bold text-[#111827] tracking-tight leading-tight ${
              largeTextMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
            }`} style={{ textWrap: 'balance' }}>
              바이브 코딩 배포 허브
            </h1>
            <p className={`text-[#4B5563] font-sans mt-2 leading-relaxed ${
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
              className="flex items-center gap-2 px-5 py-2.5 min-h-[42px] rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#F7F8FA] p-4 rounded-xl">
            <div className="text-xs text-[#6B7280]">마크다운 사양서</div>
            <div className="text-lg font-sans font-semibold tabular-nums text-[#111827] mt-1">11개 문서</div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">01_proposal ~ 11_sys</div>
          </div>

          <div className="bg-[#F7F8FA] p-4 rounded-xl">
            <div className="text-xs text-[#6B7280]">에이전트 규칙</div>
            <div className="text-lg font-mono font-semibold text-[#1E3A8A] mt-1">.cursorrules</div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">.clinerules & CLAUDE.md</div>
          </div>

          <div className="bg-[#F7F8FA] p-4 rounded-xl">
            <div className="text-xs text-[#6B7280]">실행 프로토타입</div>
            <div className="text-lg font-sans font-semibold text-[#111827] mt-1">prototype.html</div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">단일 파일 브라우저 즉시 구동</div>
          </div>

          <div className="bg-[#F7F8FA] p-4 rounded-xl">
            <div className="text-xs text-[#6B7280]">아키텍처 규약</div>
            <div className="text-lg font-mono font-semibold text-[#1E3A8A] mt-1">Local-First</div>
            <div className="text-[11px] text-[#6B7280] font-mono mt-0.5">IndexedDB 영속성</div>
          </div>
        </div>
      </div>

      {/* 2. Dedicated Golden Prompt Callout: Cursor & Claude Code */}
      <div className="bg-[#F7F8FA] rounded-xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E7EB]">
          <div className="space-y-1.5">
            <h2 className="text-[18px] font-sans font-semibold text-[#111827] tracking-tight">
              골든 프롬프트 (Golden Prompt — Cursor / Claude Code 전용)
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              <strong className="text-[#111827]">Prototype-as-Spec 1:1 역공학 지침</strong>: AI 에이전트의 환각을 원천 차단하고 <code className="text-[#1E3A8A] font-mono bg-[#EFF6FF] px-1.5 py-0.5 rounded-md">prototype.html</code>과 사양서 11종을 무손실 프로덕션 코드로 직결합니다.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyGoldenPrompt}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedGoldenPrompt ? (
                <>
                  <Check size={14} />
                  <span>골든 프롬프트 복사됨</span>
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
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] font-mono text-[#1E3A8A] bg-[#EFF6FF] px-2.5 py-1 rounded-md font-medium">
            ✓ Prototype-as-Spec
          </span>
          <span className="text-[11px] font-mono text-[#4B5563] bg-[#FFFFFF] px-2.5 py-1 rounded-md">
            ✓ React 19 + TypeScript + Tailwind
          </span>
          <span className="text-[11px] font-mono text-[#4B5563] bg-[#FFFFFF] px-2.5 py-1 rounded-md">
            ✓ Zero-Slop Rule
          </span>
          <span className="text-[11px] font-mono text-[#1E3A8A] bg-[#EFF6FF] px-2.5 py-1 rounded-md font-medium">
            ✓ 환각 방지 불변 규약
          </span>
        </div>

        {/* Golden Prompt Text Code Block */}
        <pre className={`whitespace-pre-wrap font-mono text-[#111827] bg-[#FFFFFF] p-4 sm:p-5 rounded-lg border border-[#E5E7EB] select-text max-h-[320px] overflow-y-auto custom-scroll ${
          largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
        }`}>
          {goldenPromptText}
        </pre>
      </div>

      {/* 3. Step-by-Step 3-Minute Vibe Coding Onboarding Guide */}
      <div className="space-y-4">
        <h2 className="text-[18px] font-sans font-semibold text-[#111827] tracking-tight">
          바이브 코딩 3단계 진행 가이드
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* STEP 1 */}
          <div className="bg-[#F7F8FA] p-5 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#1E3A8A] tabular-nums font-semibold">01.</span>
              <h3 className="font-sans font-semibold text-[#111827] text-sm">
                ZIP 패키지 다운로드
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                상단의 <strong className="text-[#111827]">[11종 번들 다운로드]</strong>를 클릭해 압축 파일(<code className="text-[#1E3A8A] font-mono bg-[#EFF6FF] px-1 py-0.5 rounded">goguma-blueprint.zip</code>)을 받습니다. (11종 문서, 에이전트 룰 3종, 프로토타입 포함)
              </p>
            </div>
            <button
              onClick={handleDownloadZip}
              className="w-full py-2.5 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#1E3A8A] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E5E7EB]"
            >
              <Download size={14} className="text-[#1E3A8A]" />
              <span>ZIP 다운로드</span>
            </button>
          </div>

          {/* STEP 2 */}
          <div className="bg-[#F7F8FA] p-5 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#1E3A8A] tabular-nums font-semibold">02.</span>
              <h3 className="font-sans font-semibold text-[#111827] text-sm">
                새 폴더에 압축 해제
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                작업할 로컬 프로젝트 폴더에 압축을 풉니다. 폴더 내 <code className="text-[#1E3A8A] font-mono bg-[#EFF6FF] px-1 py-0.5 rounded">prototype.html</code>을 브라우저로 열어 전체 화면 동작을 확인하세요.
              </p>
            </div>
            <button
              onClick={handleOpenPrototype}
              className="w-full py-2.5 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#1E3A8A] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#E5E7EB]"
            >
              <ExternalLink size={14} className="text-[#1E3A8A]" />
              <span>프로토타입 열기</span>
            </button>
          </div>

          {/* STEP 3 */}
          <div className="bg-[#F7F8FA] p-5 rounded-xl flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="font-mono text-xs text-[#1E3A8A] tabular-nums font-semibold">03.</span>
              <h3 className="font-sans font-semibold text-[#111827] text-sm">
                에이전트에 명령 전달
              </h3>
              <p className="text-xs text-[#4B5563] leading-relaxed">
                Cursor 또는 Claude Code 창에 <strong className="text-[#111827]">[골든 프롬프트]</strong>를 붙여넣고 빌드를 시작합니다.
              </p>
            </div>
            <button
              onClick={handleCopyGoldenPrompt}
              className="w-full py-2.5 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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

      {/* 4. Quick Kickoff Prompt Callout */}
      <div className="bg-[#F7F8FA] rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={15} className="text-[#1E3A8A]" />
            <span className="text-sm font-sans font-semibold text-[#111827]">
              간편 킥오프 프롬프트
            </span>
          </div>
          <button
            onClick={handleCopyFirstPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-xs text-[#111827] hover:text-[#1E3A8A] font-medium cursor-pointer transition-colors"
          >
            {copiedFirstPrompt ? <Check size={13} className="text-[#1E3A8A]" /> : <Copy size={13} className="text-[#6B7280]" />}
            <span>{copiedFirstPrompt ? '복사됨' : '복사'}</span>
          </button>
        </div>
        <pre className={`whitespace-pre-wrap font-mono text-[#111827] bg-[#FFFFFF] p-4 rounded-lg border border-[#E5E7EB] select-text ${
          largeTextMode ? 'text-sm sm:text-base leading-loose' : 'text-xs sm:text-sm leading-relaxed'
        }`}>
          {firstPromptText}
        </pre>
      </div>

      {/* 5. Complete 11-Spec Blueprint Viewer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-[#1E3A8A]" />
            <h2 className="text-[18px] font-sans font-semibold text-[#111827] tracking-tight">
              11종 사양서 개별 열람 및 복사
            </h2>
          </div>
          <span className="text-xs text-[#6B7280] font-mono">문서 탭을 선택하여 내용을 확인하세요.</span>
        </div>

        {/* Document Tabs Strip - Clean Segmented Buttons with Featured Playbook & Spec Impact Indicator */}
        <div className="flex flex-wrap gap-1.5 bg-[#F7F8FA] p-2 rounded-xl">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDocId;
            const isPlaybook = doc.id === '00_EXECUTION_PLAYBOOK';
            const status = docImpactMap[doc.id] || 'idle';
            return (
              <button
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white font-semibold'
                    : isPlaybook
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] font-semibold'
                    : 'text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#FFFFFF]'
                }`}
              >
                <span className={isActive ? 'text-white/80 font-bold' : isPlaybook ? 'text-[#1E3A8A] font-bold' : 'text-[#6B7280]'}>
                  {doc.docNumber === 0 ? '00' : doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span className="font-sans">{doc.filename}</span>
                {isPlaybook && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-sans font-semibold leading-none ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#1E3A8A] text-white'
                    }`}
                  >
                    Playbook
                  </span>
                )}
                {!isPlaybook && status !== 'idle' && (
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-sans font-medium leading-none ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : status === 'locked'
                        ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                        : 'bg-[#F0FDF4] text-[#15803D]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? status === 'locked'
                            ? 'bg-[#93C5FD]'
                            : 'bg-[#86EFAC]'
                          : status === 'locked'
                          ? 'bg-[#1E3A8A]'
                          : 'bg-[#15803D]'
                      }`}
                    />
                    <span>{status === 'locked' ? 'Locked' : 'Updated'}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Document Viewer */}
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="bg-[#F7F8FA] px-4 py-3 border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 truncate text-xs">
              <span className="font-mono text-[#1E3A8A] font-semibold">
                {activeDoc.relativePath}
              </span>
              <span className="text-[#D1D5DB]">·</span>
              <span className="text-[#4B5563] truncate">
                {activeDoc.title}
              </span>
              {docImpactMap[activeDoc.id] && docImpactMap[activeDoc.id] !== 'idle' && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
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
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyVibePrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-xs text-white font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedVibePrompt ? (
                  <>
                    <Check size={13} />
                    <span>Copied Vibe-Coding Prompt</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy Vibe-Coding Prompt</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleCopyDoc(activeDoc)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-xs text-[#111827] hover:text-[#1E3A8A] font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap"
              >
                {copiedDocId === activeDoc.id ? (
                  <>
                    <Check size={13} className="text-[#1E3A8A]" />
                    <span className="text-[#1E3A8A] font-semibold">복사됨</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} className="text-[#6B7280]" />
                    <span>문서 복사</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto font-mono text-xs leading-relaxed text-[#111827] bg-[#FFFFFF] custom-scroll">
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
