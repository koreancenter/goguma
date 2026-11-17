import React, { useState, useMemo } from 'react';
import { Download, Copy, Check, Sparkles, FileCode } from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { generatePlaybookVibePrompt } from '../../lib/executionPlaybook';
import { getDocImpactStatus } from '../../lib/specImpact';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { EditorialPageLayout } from '../classic/layout/EditorialPageLayout';

interface ExportSpecPageProps {
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
}

export default function ExportSpecPage({
  plan,
  formInputs,
  lockedChapters = [],
  updatedChapters,
}: ExportSpecPageProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  const bundle = useMemo(
    () => compileMarkdownBundle(plan, formInputs, lockedChapters),
    [plan, formInputs, lockedChapters]
  );

  const docsList = useMemo(() => getMarkdownDocsList(bundle), [bundle]);

  const docImpactMap = useMemo(() => {
    const map: Record<string, 'updated' | 'locked' | 'idle'> = {};
    for (const d of docsList) {
      map[d.id] = getDocImpactStatus(d.id, formInputs, lockedChapters, updatedChapters);
    }
    return map;
  }, [docsList, formInputs, lockedChapters, updatedChapters]);

  const activeDoc: MarkdownDocInfo = useMemo(
    () => docsList.find(d => d.id === selectedDocId) || docsList[0],
    [docsList, selectedDocId]
  );

  const vibeCodingPrompt = useMemo(
    () => generatePlaybookVibePrompt({ plan, formInputs, lockedChapters }),
    [plan, formInputs, lockedChapters]
  );

  const projectName = plan.metadata?.projectName?.trim() || 'GOGUMA Project';
  const activeStatus = docImpactMap[activeDoc.id] || 'idle';

  const handleCopyVibePrompt = async () => {
    try {
      await navigator.clipboard.writeText(vibeCodingPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (e) {
      console.error('Failed to copy vibe-coding prompt:', e);
    }
  };

  const handleCopyCurrentDoc = async () => {
    try {
      await navigator.clipboard.writeText(activeDoc.content);
      setCopiedDoc(true);
      setTimeout(() => setCopiedDoc(false), 2000);
    } catch (e) {
      console.error('Failed to copy specification file:', e);
    }
  };

  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      await downloadBlueprintZip(plan, formInputs, lockedChapters);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 2500);
    } catch (e) {
      console.error('Failed to export ZIP archive:', e);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const headerActions = (
    <>
      <button
        type="button"
        onClick={handleCopyVibePrompt}
        className="px-6 py-3.5 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
      >
        {copiedPrompt ? <Check size={17} /> : <Sparkles size={17} />}
        <span>{copiedPrompt ? '바이브 코딩 프롬프트 복사됨' : '바이브 코딩 프롬프트 복사'}</span>
      </button>

      <button
        type="button"
        onClick={handleDownloadZip}
        disabled={isDownloadingZip}
        className="px-6 py-3.5 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] disabled:opacity-50 text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
      >
        {zipDownloaded ? <Check size={17} /> : <Download size={17} />}
        <span>{zipDownloaded ? 'ZIP 다운로드 완료' : isDownloadingZip ? 'ZIP 패키징 중...' : '11종 사양서 ZIP 다운로드'}</span>
      </button>
    </>
  );

  return (
    <EditorialPageLayout
      category="ARTIFACTS · EXPORT & PLAYBOOK"
      title={`${projectName} — 사양서 내보내기`}
      subtitle="루트 실행 플레이북(00_EXECUTION_PLAYBOOK.md), 11종 개발 사양서 및 단일 HTML 프로토타입을 열람하고 내보냅니다."
      headerActions={headerActions}
      maxWidthClass="max-w-6xl"
    >
      {/* Document Selector Grid */}
      <div className="border border-[#000000] divide-y divide-[#E4E2DC]">
        <div className="bg-[#F6F5F1] p-4 sm:p-5 flex flex-wrap gap-2 border-b border-[#000000]">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDoc.id;
            const status = docImpactMap[doc.id] || 'idle';
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-4 py-2.5 text-[16px] font-bold rounded-none transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#000000] text-[#FFE600]'
                    : 'bg-[#FFFFFF] text-[#111111] border border-[#E4E2DC] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626]'
                }`}
              >
                <span className="tabular-nums opacity-75">
                  {doc.docNumber === 0 ? '00' : doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span>{doc.filename}</span>
                {status !== 'idle' && (
                  <span className="text-[14px] px-2 py-0.5 border border-current uppercase">
                    {status === 'locked' ? '확정' : '갱신'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* File Subheader */}
        <div className="px-6 py-5 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[17px] min-w-0">
            <FileCode size={18} className="shrink-0 text-[#000000]" />
            <span className="font-mono font-bold text-[#000000]">{activeDoc.relativePath}</span>
            <span className="text-[#CBC8BF]">|</span>
            <span className="text-[#52524E] truncate">{activeDoc.description}</span>
            {activeStatus !== 'idle' && (
              <span className="px-2.5 py-0.5 bg-[#000000] text-[#FFE600] text-[14px] font-bold">
                {activeStatus === 'locked' ? '확정됨' : '최신 반영'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopyCurrentDoc}
            className="px-5 py-2.5 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] text-[16px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copiedDoc ? <Check size={16} /> : <Copy size={16} />}
            <span>{copiedDoc ? '복사 완료' : `${activeDoc.filename} 복사`}</span>
          </button>
        </div>

        {/* Playbook Orientation Callout */}
        {activeDoc.id === '00_EXECUTION_PLAYBOOK' && (
          <div className="px-6 py-4 bg-[#F6F5F1] flex flex-wrap items-center justify-between gap-2 text-[17px] text-[#2B2B29]">
            <span>
              <strong className="text-[#000000]">4단계 실행 가이드:</strong> Phase 1 (확정 제약) → Phase 2 (핵심 워크플로우) → Phase 3 (예외 상태) → Phase 4 (도메인 검수)
            </span>
          </div>
        )}

        {/* Document Content */}
        <div className="p-8 sm:p-10 bg-[#FFFFFF] max-h-[65vh] overflow-y-auto custom-scroll">
          <pre className="whitespace-pre-wrap font-mono text-[17px] sm:text-[18px] leading-[1.85] text-[#111111] select-text">
            {activeDoc.content}
          </pre>
        </div>
      </div>
    </EditorialPageLayout>
  );
}
