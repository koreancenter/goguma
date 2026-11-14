import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Download, Copy, Check, Sparkles, FileCode, BookOpen, ShieldCheck
} from 'lucide-react';
import { SitePlan, FormInputEntity } from '../../types';
import { compileMarkdownBundle, getMarkdownDocsList, MarkdownDocInfo } from '../../lib/markdownBundleCompiler';
import { generatePlaybookVibePrompt } from '../../lib/executionPlaybook';
import { getDocImpactStatus } from '../../lib/specImpact';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';

export interface ExportSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SitePlan;
  formInputs?: Record<string, FormInputEntity>;
  lockedChapters?: number[];
  updatedChapters?: Set<number>;
}

export const ExportSpecModal: React.FC<ExportSpecModalProps> = ({
  isOpen,
  onClose,
  plan,
  formInputs,
  lockedChapters = [],
  updatedChapters,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('00_EXECUTION_PLAYBOOK');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedDoc, setCopiedDoc] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  // Reset default highlighted first tab to 00_EXECUTION_PLAYBOOK.md whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDocId('00_EXECUTION_PLAYBOOK');
      setCopiedPrompt(false);
      setCopiedDoc(false);
      setZipDownloaded(false);
    }
  }, [isOpen]);

  // Close cleanly on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const projectName = plan.metadata?.projectName?.trim() || 'GOGUMA Project';

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

  const activeStatus = docImpactMap[activeDoc.id] || 'idle';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#111827]/35 backdrop-blur-xs select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Export 11 Specifications and Execution Playbook"
    >
      <div className="w-full max-w-5xl max-h-[90vh] h-[720px] bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] shadow-[0_24px_48px_-12px_rgba(15,23,42,0.18)] flex flex-col overflow-hidden text-[#111827] font-sans">
        {/* Top Modal Header (Gallery White #FFFFFF & Deep Navy #1E3A8A) */}
        <div className="px-5 sm:px-6 py-4 bg-[#FFFFFF] border-b border-[#E5E7EB] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0">
              <BookOpen size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#111827] tracking-tight truncate">
                  {projectName} — Export &amp; Playbook
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E3A8A] text-[11px] font-mono font-semibold whitespace-nowrap">
                  00_EXECUTION_PLAYBOOK + 11 Specs
                </span>
              </div>
              <p className="text-xs text-[#4B5563] truncate">
                루트에 <code className="font-mono text-[#1E3A8A]">00_EXECUTION_PLAYBOOK.md</code>와 <code className="font-mono text-[#1E3A8A]">docs/</code> 11종 사양서, <code className="font-mono text-[#1E3A8A]">prototype.html</code>을 함께 패키징합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyVibePrompt}
              className="h-9 px-3.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            >
              {copiedPrompt ? (
                <>
                  <Check size={14} />
                  <span>Copied Vibe-Coding Prompt</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Copy Vibe-Coding Prompt</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="h-9 px-3.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-[#111827] hover:text-[#1E3A8A] disabled:opacity-50 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {zipDownloaded ? (
                <>
                  <Check size={14} className="text-[#15803D]" />
                  <span className="text-[#15803D]">ZIP Downloaded</span>
                </>
              ) : (
                <>
                  <Download size={14} className="text-[#1E3A8A]" />
                  <span>{isDownloadingZip ? 'Building ZIP...' : 'Download ZIP'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-9 w-9 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-[#F7F8FA] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Export Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Highlighted First Tab Strip: 00_EXECUTION_PLAYBOOK.md + 11 Specs */}
        <div className="px-5 sm:px-6 py-3 bg-[#F7F8FA] border-b border-[#E5E7EB] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {docsList.map((doc) => {
            const isActive = doc.id === activeDoc.id;
            const isPlaybook = doc.id === '00_EXECUTION_PLAYBOOK';
            const status = docImpactMap[doc.id] || 'idle';

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDocId(doc.id)}
                className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#1E3A8A] text-white font-semibold shadow-2xs'
                    : isPlaybook
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] hover:bg-[#DBEAFE] font-semibold'
                    : 'bg-[#FFFFFF] text-[#4B5563] hover:text-[#1E3A8A] hover:bg-[#EFF6FF] font-medium'
                }`}
              >
                <span className={`font-mono text-[11px] ${isActive ? 'text-white/85' : 'text-[#1E3A8A]'}`}>
                  {doc.docNumber === 0 ? '00' : doc.docNumber <= 11 ? String(doc.docNumber).padStart(2, '0') : '★'}
                </span>
                <span className={isPlaybook ? 'font-mono font-semibold' : 'font-sans'}>{doc.filename}</span>

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

        {/* Document Reader Area */}
        <div className="flex-1 min-h-0 flex flex-col bg-[#FFFFFF]">
          {/* Active File Subheader */}
          <div className="px-5 sm:px-6 py-3 border-b border-[#E5E7EB]/80 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0 text-xs">
              <FileCode size={14} className="text-[#1E3A8A] shrink-0" />
              <span className="font-mono font-semibold text-[#1E3A8A] shrink-0">{activeDoc.relativePath}</span>
              <span className="text-[#D1D5DB] shrink-0">·</span>
              <span className="text-[#4B5563] truncate">{activeDoc.description}</span>

              {activeStatus !== 'idle' && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 ${
                    activeStatus === 'locked'
                      ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                      : 'bg-[#F0FDF4] text-[#15803D]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      activeStatus === 'locked' ? 'bg-[#1E3A8A]' : 'bg-[#15803D]'
                    }`}
                  />
                  <span>{activeStatus === 'locked' ? 'Locked' : 'Updated'}</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyCurrentDoc}
              className="px-3 py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#1E3A8A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {copiedDoc ? (
                <>
                  <Check size={13} className="text-[#15803D]" />
                  <span className="text-[#15803D]">Copied File</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy {activeDoc.filename}</span>
                </>
              )}
            </button>
          </div>

          {/* Highlighted Playbook Orientation Callout when 00_EXECUTION_PLAYBOOK is active */}
          {activeDoc.id === '00_EXECUTION_PLAYBOOK' && (
            <div className="mx-5 sm:mx-6 mt-4 px-4 py-3 rounded-xl bg-[#F7F8FA] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                <ShieldCheck size={15} className="text-[#1E3A8A] shrink-0" />
                <span>
                  <strong className="text-[#111827]">4-Phase Execution Guide:</strong> Phase 1 (Locked Constraints) ➔ Phase 2 (Workflows) ➔ Phase 3 (Edge-Case States) ➔ Phase 4 (Domain QA).
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyVibePrompt}
                className="px-3 py-1 rounded-lg bg-[#EFF6FF] hover:bg-[#1E3A8A] text-[#1E3A8A] hover:text-white text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                {copiedPrompt ? 'Copied Prompt ✓' : 'Copy Vibe-Coding Prompt'}
              </button>
            </div>
          )}

          {/* Scrollable Markdown Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 custom-scroll">
            <pre className="max-w-4xl mx-auto whitespace-pre-wrap font-mono text-xs sm:text-[13px] leading-[1.75] text-[#111827] select-text">
              {activeDoc.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSpecModal;
