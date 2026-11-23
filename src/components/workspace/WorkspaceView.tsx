import React, { useState, useRef } from 'react';

import { ProjectEntity, FormInputEntity, DomainBusinessRule, SectionAttachment, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';

import { WritingCanvas } from '../classic/WritingCanvas';
import { SpecPreviewPanel } from '../preview/SpecPreviewPanel';
import { WorkspaceDropZoneOverlay } from '../classic/WorkspaceDropZoneOverlay';
import Navbar from '../classic/layout/Navbar';
import Footer from '../classic/layout/Footer';
import { useLanguage } from '../../contexts/LanguageContext';

export interface WorkspaceViewProps {
  project: ProjectEntity;
  setProject: React.Dispatch<React.SetStateAction<ProjectEntity>>;
  plan: SitePlan;
  setPlan: React.Dispatch<React.SetStateAction<SitePlan>>;
  formInputs: Record<string, FormInputEntity>;
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSavedTime: string | null;
  largeTextMode: boolean;
  toggleLargeTextMode: () => void;
  completedChapters: Set<number>;
  updatedChapters?: Set<number>;
  handleToggleChapterLock?: (chapterId: number) => void;
  handleSelectChapter: (chapterId: number) => void;
  handleSelectSection: (sectionKey: string) => void;
  handleInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  handleBusinessRulesChange?: (chapterId: number, sectionKey: string, rules: DomainBusinessRule[]) => void;
  handleAttachmentsChange?: (chapterId: number, sectionKey: string, attachments: SectionAttachment[]) => void;
  handleNavigateSection: (direction: 'prev' | 'next') => void;
  schedulePersistence: () => void;
  currentUser: LocalUser | null;
}

export default function WorkspaceView({
  project,
  plan,
  setPlan,
  formInputs,
  saveStatus,
  lastSavedTime,
  largeTextMode,
  updatedChapters,
  handleToggleChapterLock,
  handleSelectChapter,
  handleSelectSection,
  handleInputChange,
  handleBusinessRulesChange,
  handleAttachmentsChange,
  handleNavigateSection,
  schedulePersistence,
}: WorkspaceViewProps) {
  const { pick } = useLanguage();
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const [splitPercent, setSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem('goguma_split_percent');
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed) && parsed >= 35 && parsed <= 65) return parsed;
    }
    return 50;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleResetSplit = () => {
    setSplitPercent(50);
    localStorage.setItem('goguma_split_percent', '50');
  };

  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    const container = splitContainerRef.current;
    if (!container) return;

    setIsResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0) return;
      let nextPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      if (Math.abs(nextPercent - 50) < 1.2) nextPercent = 50;
      const clamped = Math.max(35, Math.min(65, nextPercent));
      setSplitPercent(clamped);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setSplitPercent((current) => {
        localStorage.setItem('goguma_split_percent', String(Math.round(current * 10) / 10));
        return current;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPercent(prev => {
        const next = Math.max(35, prev - 2);
        localStorage.setItem('goguma_split_percent', String(next));
        return next;
      });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPercent(prev => {
        const next = Math.min(65, prev + 2);
        localStorage.setItem('goguma_split_percent', String(next));
        return next;
      });
    } else if (e.key === 'Home') {
      handleResetSplit();
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[var(--theme-canvas)] text-[var(--theme-ink-strong)] font-sans selection:bg-[var(--theme-ink-strong)] selection:text-[var(--theme-canvas)]">
      <Navbar mobilePane={mobilePane} onChangeMobilePane={setMobilePane} />

      {/* Main Workspace Shell: Full Remaining Viewport Height with Independent Pane Scrolling */}
      <div className={`h-[calc(100vh-136px)] min-h-[580px] shrink-0 flex overflow-hidden bg-[var(--theme-canvas)] ${largeTextMode ? 'goguma-large-mode' : ''}`}>
        <div ref={splitContainerRef} className="flex-1 flex min-w-0 h-full overflow-hidden">
          {/* 50% Left Editor Pane */}
          <div
            style={{ '--split-left': `${splitPercent}%` } as React.CSSProperties}
            className={`${
              mobilePane === 'editor' ? 'flex w-full' : 'hidden lg:flex'
            } lg:shrink-0 lg:w-[var(--split-left)] min-w-0 h-full bg-[var(--theme-canvas)] overflow-hidden flex-col`}
          >
            <WritingCanvas
              currentChapter={project.currentChapter}
              currentSection={project.currentSection}
              formInputs={formInputs}
              onInputChange={handleInputChange}
              onBusinessRulesChange={handleBusinessRulesChange}
              onAttachmentsChange={handleAttachmentsChange}
              onNavigateSection={handleNavigateSection}
              plan={plan}
              setPlan={setPlan}
              saveStatus={saveStatus}
              lastSavedTime={lastSavedTime}
              largeTextMode={largeTextMode}
              lockedChapters={project.lockedChapters}
              updatedChapters={updatedChapters}
              onToggleChapterLock={handleToggleChapterLock}
            />
          </div>

          {/* Single 1px Vertical Divider (Desktop lg+ only) */}
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-valuenow={Math.round(splitPercent)}
            aria-valuemin={35}
            aria-valuemax={65}
            aria-label={pick({
              ko: '에디터 및 미리보기 분할 비율 조절',
              en: 'Adjust editor and preview split ratio',
              ja: 'エディタとプレビューの分割比率を調整',
              id: 'Atur rasio pemisahan editor dan pratinjau',
            })}
            onKeyDown={handleResizerKeyDown}
            onMouseDown={handleMouseDownResizer}
            onDoubleClick={handleResetSplit}
            title={pick({
              ko: '드래그하여 비율 조절 (더블클릭 시 50:50 초기화)',
              en: 'Drag to resize (double-click to reset 50:50)',
              ja: 'ドラッグして比率調整（ダブルクリックで50:50に戻す）',
              id: 'Seret untuk mengubah ukuran (klik ganda untuk reset 50:50)',
            })}
            className="hidden lg:block w-px bg-[var(--theme-border-hairline)] shrink-0 relative z-20 select-none outline-none focus-visible:bg-[var(--theme-ink-primary)] group"
          >
            <div
              className={`absolute inset-y-0 -left-1 -right-1 cursor-col-resize transition-colors ${
                isResizing ? 'bg-[var(--theme-ink-primary)]/15' : 'group-hover:bg-[var(--theme-ink-primary)]/10'
              }`}
            />
          </div>

          {isResizing && (
            <div className="fixed inset-0 z-40 cursor-col-resize select-none bg-transparent" />
          )}

          {/* 50% Right Exhibition Preview Stage */}
          <div
            style={{ '--split-right': `${100 - splitPercent}%` } as React.CSSProperties}
            className={`${
              mobilePane === 'preview' ? 'flex w-full' : 'hidden lg:flex'
            } lg:shrink-0 lg:w-[var(--split-right)] min-w-0 h-full bg-[var(--theme-stage)] overflow-hidden flex-col`}
          >
            <SpecPreviewPanel
              plan={plan}
              formInputs={formInputs}
              currentChapter={project.currentChapter}
              largeTextMode={largeTextMode}
              onSelectChapter={handleSelectChapter}
              onSelectSection={handleSelectSection}
              lockedChapters={project.lockedChapters}
              updatedChapters={updatedChapters}
            />
          </div>
        </div>
      </div>

      {/* Common Global Editorial Footer */}
      <Footer />

      <WorkspaceDropZoneOverlay
        onProjectLoaded={(loadedPlan) => {
          setPlan(loadedPlan);
          schedulePersistence();
        }}
      />
    </div>
  );
}
