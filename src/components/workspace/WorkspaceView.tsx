import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, FolderOpen, HardDriveDownload, PanelRight, LogOut, LayoutTemplate 
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';

import { ChapterNavBar } from '../classic/ChapterNavBar';
import { SectionListBar } from '../classic/SectionListBar';
import { WritingCanvas } from '../classic/WritingCanvas';
import { SpecPreviewPanel } from '../preview/SpecPreviewPanel';

// Lazy-load heavyweight modals that are only opened on user interaction
const ProjectImportExportModal = lazy(() =>
  import('../classic/ProjectImportExportModal').then(m => ({ default: m.ProjectImportExportModal }))
);
const LocalBackupModal = lazy(() =>
  import('../classic/LocalBackupModal').then(m => ({ default: m.LocalBackupModal }))
);
const WorkspaceDropZoneOverlay = lazy(() =>
  import('../classic/WorkspaceDropZoneOverlay').then(m => ({ default: m.WorkspaceDropZoneOverlay }))
);
const StandardTemplateModal = lazy(() =>
  import('../classic/StandardTemplateModal').then(m => ({ default: m.StandardTemplateModal }))
);

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
  isPreviewCollapsed: boolean;
  togglePreviewCollapsed: () => void;
  isCol1Collapsed: boolean;
  setIsCol1Collapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCol2Collapsed: boolean;
  setIsCol2Collapsed: React.Dispatch<React.SetStateAction<boolean>>;
  completedChapters: Set<number>;
  handleSelectChapter: (chapterId: number) => void;
  handleSelectSection: (sectionKey: string) => void;
  handleInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  handleNavigateSection: (direction: 'prev' | 'next') => void;
  schedulePersistence: () => void;
  currentUser: LocalUser | null;
  onOpenLogoutModal: () => void;
}

export default function WorkspaceView({
  project,
  setProject,
  plan,
  setPlan,
  formInputs,
  saveStatus,
  lastSavedTime,
  largeTextMode,
  toggleLargeTextMode,
  isPreviewCollapsed,
  togglePreviewCollapsed,
  isCol1Collapsed,
  setIsCol1Collapsed,
  isCol2Collapsed,
  setIsCol2Collapsed,
  completedChapters,
  handleSelectChapter,
  handleSelectSection,
  handleInputChange,
  handleNavigateSection,
  schedulePersistence,
  currentUser,
  onOpenLogoutModal,
}: WorkspaceViewProps) {
  const navigate = useNavigate();
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Ergonomic Split Pane Resizer for real-time preview (Phase 3 High-Fidelity Implementation)
  const [previewWidth, setPreviewWidth] = useState<number>(() => {
    const saved = localStorage.getItem('goguma_preview_width');
    return saved ? Math.max(380, Math.min(800, Number(saved))) : 480;
  });
  const [isResizing, setIsResizing] = useState(false);

  // Quick width presets
  const handleApplyPresetWidth = (width: number) => {
    setPreviewWidth(width);
    localStorage.setItem('goguma_preview_width', String(width));
  };

  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startX = e.clientX;
    const startWidth = previewWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Dragging left increases preview width
      const deltaX = startX - moveEvent.clientX;
      let nextWidth = startWidth + deltaX;

      // Magnetic snap around mobile standard (420px) and default (480px)
      if (Math.abs(nextWidth - 420) < 8) nextWidth = 420;
      else if (Math.abs(nextWidth - 480) < 8) nextWidth = 480;
      else if (Math.abs(nextWidth - 620) < 8) nextWidth = 620;

      const clamped = Math.max(380, Math.min(800, nextWidth));
      setPreviewWidth(clamped);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setPreviewWidth((current) => {
        localStorage.setItem('goguma_preview_width', String(current));
        return current;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Keyboard navigation for separator (WCAG Accessibility)
  const handleResizerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPreviewWidth(prev => {
        const next = Math.min(800, prev + 20);
        localStorage.setItem('goguma_preview_width', String(next));
        return next;
      });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPreviewWidth(prev => {
        const next = Math.max(380, prev - 20);
        localStorage.setItem('goguma_preview_width', String(next));
        return next;
      });
    } else if (e.key === 'Home') {
      handleApplyPresetWidth(480);
    }
  };

  const handleApplyPrdTemplate = (template: any) => {
    // 1. Update Project Entity
    const newName = template.plan?.metadata?.projectName || template.name;
    setProject(prev => ({
      ...prev,
      name: newName,
      slug: template.id,
      updatedAt: new Date().toISOString()
    }));

    // 2. Update SitePlan
    setPlan(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...template.plan.metadata,
        projectName: newName,
        title: newName
      },
      design: {
        ...prev.design,
        ...template.plan.design
      },
      navigation: {
        ...prev.navigation,
        ...template.plan.navigation
      }
    }));

    // 3. Update form inputs
    if (template.formInputs) {
      Object.entries(template.formInputs).forEach(([key, val]) => {
        handleInputChange(1, key, val as string);
      });
    }

    schedulePersistence();
  };

  const handleExportZip = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { downloadBlueprintZip } = await import('../../lib/bundleZipDownloader');
      await downloadBlueprintZip(plan, formInputs);
    } catch (err) {
      console.error('Failed to export ZIP bundle:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0C10] text-[#F0F3F6] font-sans">
      {/* Studio Top Bar - Top Bar Contract: 3 Zones, Zero-Pill, Single Element Brand */}
      <header className="h-14 px-5 bg-[#0E1217] border-b border-white/7 flex items-center justify-between shrink-0 select-none z-10">
        {/* Zone 1: Brand Wordmark (Single Text Element) & Project Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="font-bold text-base tracking-tight text-[#F0F3F6] hover:text-[#C5A880] transition-colors cursor-pointer whitespace-nowrap"
          >
            GOGUMA
          </button>

          <span className="text-white/20 select-none">/</span>

          {/* Inline Editable Project Name */}
          <input
            type="text"
            value={project.name}
            onChange={(e) => {
              const newName = e.target.value;
              setProject(prev => ({ ...prev, name: newName }));
              setPlan(prev => ({ ...prev, metadata: { ...prev.metadata, projectName: newName, title: newName } }));
              schedulePersistence();
            }}
            className="bg-transparent border-0 border-b border-white/10 hover:border-white/25 focus:border-[#C5A880] focus:ring-0 px-1 py-0.5 text-xs sm:text-sm font-medium text-[#F0F3F6] max-w-[200px] sm:max-w-[280px] truncate outline-none transition-colors"
            title="프로젝트 이름 수정"
            aria-label="프로젝트 이름"
          />

          {/* Standard PRD Template Link */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors cursor-pointer whitespace-nowrap"
            title="실무 표준 개발계획서(PRD) 템플릿 열기"
          >
            <LayoutTemplate size={13} />
            <span>표준 기획서</span>
          </button>

          {/* Unboxed Metadata: Save Status (Zero-Pill with typographic separator) */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#5C6675]">
            <span aria-hidden="true">·</span>
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="font-mono text-[11px] text-[#9AA5B5]">
              {saveStatus === 'saving' ? '보존 중' : '자동 보존됨'}
            </span>
          </div>
        </div>

        {/* Zone 3: Functional Navigation & Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Secondary Utilities Group */}
          <div className="flex items-center gap-1.5">
            {/* Large Text Mode Toggle (Clean Icon + Label, No Emoji) */}
            <button
              onClick={toggleLargeTextMode}
              className={`px-2.5 py-1.5 min-h-[34px] rounded-[3px] border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                largeTextMode
                  ? 'bg-[#C5A880] text-[#0B0C10] border-[#C5A880] font-semibold'
                  : 'bg-transparent border-white/10 text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5'
              }`}
              title="큰 글씨 모드 토글"
              aria-label="큰 글씨 모드"
            >
              <span>{largeTextMode ? '보통 글씨' : '큰 글씨'}</span>
            </button>

            {/* Preview Panel Toggle */}
            <button
              onClick={togglePreviewCollapsed}
              className={`p-1.5 min-h-[34px] min-w-[34px] flex items-center justify-center rounded-[3px] border text-xs font-medium transition-colors cursor-pointer ${
                isPreviewCollapsed
                  ? 'bg-[#18202A] border-[#C5A880] text-[#C5A880]'
                  : 'bg-transparent border-white/10 text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5'
              }`}
              title={isPreviewCollapsed ? '미리보기 패널 열기' : '미리보기 패널 접기'}
              aria-label="미리보기 패널 토글"
            >
              <PanelRight size={15} />
            </button>

            {/* Project & Backup Storage Controls */}
            <div className="flex items-center rounded-[3px] border border-white/10 bg-[#13181F] p-0.5">
              <button
                onClick={() => setIsImportExportOpen(true)}
                className="px-2.5 py-1 text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                title="프로젝트 열기 / 내보내기"
              >
                <FolderOpen size={13} />
                <span className="hidden md:inline">프로젝트</span>
              </button>
              <div className="w-px h-3 bg-white/10" />
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="px-2.5 py-1 text-xs font-medium text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap"
                title="로컬 백업 보관함"
              >
                <HardDriveDownload size={13} />
                <span className="hidden md:inline">백업함</span>
              </button>
            </div>
          </div>

          {/* Visual Divider between Utilities and Primary Export CTA */}
          <div className="w-px h-4 bg-white/15 mx-1 hidden sm:block" />

          {/* Primary Action: 11종 ZIP 내보내기 (Curated Accent & Focused Depth) */}
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-1.5 min-h-[34px] rounded-[3px] bg-[#C5A880] hover:bg-[#D4AF37] active:bg-[#B8986E] disabled:opacity-50 text-[#0B0C10] text-xs font-semibold shadow-[0_1px_6px_rgba(197,168,128,0.2)] hover:shadow-[0_2px_10px_rgba(197,168,128,0.35)] transition-all cursor-pointer whitespace-nowrap"
            title="11종 사양서 및 프로토타입 ZIP 다운로드"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            <span>{isExporting ? '압축 생성 중...' : '11종 번들 내보내기'}</span>
          </button>

          {/* User Profile & Sign Out */}
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <button
              onClick={() => navigate('/profile')}
              className="w-7 h-7 rounded-[3px] bg-[#18202A] text-[#C5A880] text-xs font-bold flex items-center justify-center border border-white/10 hover:border-[#C5A880] transition-colors cursor-pointer"
              title={`${currentUser?.displayName || '사용자'} 프로필`}
              aria-label="프로필"
            >
              {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
            </button>

            <button
              onClick={onOpenLogoutModal}
              className="p-1.5 rounded-[3px] text-[#5C6675] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
              title="로그아웃"
              aria-label="로그아웃"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 4-Column Wide Workspace Mount */}
      <div className={`flex-1 flex overflow-hidden ${largeTextMode ? 'goguma-large-mode' : ''}`}>
        {/* Column 1: Chapter Navigation Bar (200px -> 52px collapsible) */}
        <ChapterNavBar
          currentChapter={project.currentChapter}
          onSelectChapter={handleSelectChapter}
          isCollapsed={isCol1Collapsed}
          onToggleCollapse={() => setIsCol1Collapsed(prev => !prev)}
          completedChapters={completedChapters}
        />

        {/* Column 2: Section Selection List (240px -> 52px collapsible) */}
        <SectionListBar
          currentChapter={project.currentChapter}
          currentSection={project.currentSection}
          onSelectSection={handleSelectSection}
          formInputs={formInputs}
          isCollapsed={isCol2Collapsed}
          onToggleCollapse={() => setIsCol2Collapsed(prev => !prev)}
        />

        {/* Column 3: Classic Warm Paper Writing Canvas (Fluid min-w 640px) */}
        <WritingCanvas
          currentChapter={project.currentChapter}
          currentSection={project.currentSection}
          formInputs={formInputs}
          onInputChange={handleInputChange}
          onNavigateSection={handleNavigateSection}
          plan={plan}
          setPlan={setPlan}
          saveStatus={saveStatus}
          lastSavedTime={lastSavedTime}
          largeTextMode={largeTextMode}
          isPreviewCollapsed={isPreviewCollapsed}
        />

        {/* Column Split Resizer Handle (Ergonomic drag for desktop viewports) */}
        {!isPreviewCollapsed && (
          <div
            role="separator"
            tabIndex={0}
            aria-orientation="vertical"
            aria-valuenow={previewWidth}
            aria-valuemin={380}
            aria-valuemax={800}
            aria-label="미리보기 패널 너비 조절"
            onKeyDown={handleResizerKeyDown}
            onMouseDown={handleMouseDownResizer}
            className={`w-2.5 -ml-1.5 z-20 cursor-col-resize flex items-center justify-center transition-all group select-none shrink-0 relative outline-none focus-visible:ring-1 focus-visible:ring-[#C5A880] ${
              isResizing ? 'bg-[#C5A880]/60' : 'bg-transparent hover:bg-[#C5A880]/25'
            }`}
            title="드래그하여 너비 조절 (더블클릭 시 기본값 480px, 좌우 방향키로 미세 조절)"
            onDoubleClick={() => handleApplyPresetWidth(480)}
          >
            <div className={`w-0.5 h-8 rounded-full transition-colors ${
              isResizing ? 'bg-[#0B0C10]' : 'bg-white/20 group-hover:bg-[#C5A880]'
            }`} />

            {/* Real-time Floating Width HUD during Drag */}
            {isResizing && (
              <div className="absolute top-6 right-3 pointer-events-none bg-[#0E1217] border border-[#C5A880]/60 text-[#F0F3F6] px-3 py-1.5 rounded-[3px] shadow-2xl text-xs font-mono flex items-center gap-2 whitespace-nowrap z-50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880] animate-ping" />
                <span className="font-bold text-[#C5A880]">{previewWidth}px</span>
                <span className="text-[#9AA5B5] text-[11px]">
                  {previewWidth <= 430 ? '스마트폰 뷰 (420px)' : previewWidth >= 600 ? '와이드 뷰 (620px)' : '데스크톱 뷰 (480px)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Global Transparent Mouse-Capture Overlay during Resizing to prevent iframe mouse trapping */}
        {isResizing && (
          <div className="fixed inset-0 z-40 cursor-col-resize select-none bg-black/5" />
        )}

        {/* Column 4: Real-time Spec & Prototype Preview Panel (Dynamically Resizable) */}
        <SpecPreviewPanel
          plan={plan}
          formInputs={formInputs}
          currentChapter={project.currentChapter}
          isCollapsed={isPreviewCollapsed}
          onToggleCollapse={togglePreviewCollapsed}
          largeTextMode={largeTextMode}
          width={previewWidth}
        />
      </div>

      {isTemplateModalOpen && (
        <Suspense fallback={null}>
          <StandardTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onApplyTemplate={handleApplyPrdTemplate}
          />
        </Suspense>
      )}

      {/* Defer-mounted Modals: Only loaded when explicitly open */}
      {isImportExportOpen && (
        <Suspense fallback={null}>
          <ProjectImportExportModal
            isOpen={isImportExportOpen}
            formInputs={formInputs}
            onClose={() => setIsImportExportOpen(false)}
            onProjectLoaded={() => {
              schedulePersistence();
            }}
          />
        </Suspense>
      )}

      {isBackupModalOpen && (
        <Suspense fallback={null}>
          <LocalBackupModal
            isOpen={isBackupModalOpen}
            onClose={() => setIsBackupModalOpen(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <WorkspaceDropZoneOverlay
          onProjectLoaded={(loadedPlan) => {
            setPlan(loadedPlan);
            schedulePersistence();
          }}
        />
      </Suspense>
    </div>
  );
}
