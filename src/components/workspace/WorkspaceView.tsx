import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Download, FolderOpen, PanelRight, LogOut, LayoutTemplate, Cpu, Type, User
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';
import { getAISettings, getActiveAILabel, AISettings } from '../../lib/aiConfig';
import { Tooltip } from '../guide/Tooltip';

import { ChapterNavBar } from '../classic/ChapterNavBar';
import { SectionListBar } from '../classic/SectionListBar';
import { IntegratedNavigator } from '../classic/IntegratedNavigator';
import { WritingCanvas } from '../classic/WritingCanvas';
import { SpecPreviewPanel } from '../preview/SpecPreviewPanel';
import { WorkspaceDropZoneOverlay } from '../classic/WorkspaceDropZoneOverlay';

// Lazy-load heavyweight modals that are only opened on user interaction
const LocalBackupModal = lazy(() =>
  import('../classic/LocalBackupModal').then(m => ({ default: m.LocalBackupModal }))
);
const StandardTemplateModal = lazy(() =>
  import('../classic/StandardTemplateModal').then(m => ({ default: m.StandardTemplateModal }))
);
const AISettingsModal = lazy(() =>
  import('../guide/AISettingsModal').then(m => ({ default: m.AISettingsModal }))
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
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'import' | 'storage'>('export');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAISettingsModalOpen, setIsAISettingsModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(getAISettings);

  // Sync AI Settings in real time when changed or saved from modal
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setAiSettings(getAISettings());
    };
    window.addEventListener('ai_settings_changed', handleSettingsUpdate);
    window.addEventListener('storage', handleSettingsUpdate);
    return () => {
      window.removeEventListener('ai_settings_changed', handleSettingsUpdate);
      window.removeEventListener('storage', handleSettingsUpdate);
    };
  }, []);

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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0C10] text-[#F0F3F6] font-sans selection:bg-sky-950 selection:text-[#38BDF8]">
      {/* Studio Top Bar - Top Bar Contract: 3 Zones, Sumi Black & Luxury Sapphire Blue */}
      <header className="h-12 px-4 sm:px-5 bg-[#0E1217] border-b border-white/[0.08] shadow-[0_1px_3px_rgba(0,0,0,0.5)] flex items-center justify-between shrink-0 select-none z-20 gap-3">
        {/* Zone 1: Identity & Document Context */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="font-sans font-bold text-sm sm:text-base tracking-tight text-[#F0F3F6] hover:text-[#38BDF8] transition-colors cursor-pointer whitespace-nowrap uppercase shrink-0 leading-none flex items-center gap-1.5"
          >
            <span className="w-5 h-5 rounded-[2px] bg-[#2563EB] text-white flex items-center justify-center font-black text-xs shadow-xs">G</span>
            <span>GOGUMA</span>
          </button>

          <span className="text-white/20 select-none leading-none shrink-0" aria-hidden="true">/</span>

          {/* Inline Editable Project Name Container */}
          <div className="min-w-0 max-w-[200px] sm:max-w-[280px] md:max-w-[340px] flex items-center">
            <input
              type="text"
              value={project.name}
              onChange={(e) => {
                const newName = e.target.value;
                setProject(prev => ({ ...prev, name: newName }));
                setPlan(prev => ({ ...prev, metadata: { ...prev.metadata, projectName: newName, title: newName } }));
                schedulePersistence();
              }}
              className="w-full bg-[#13181F] hover:bg-[#18202A] focus:bg-[#13181F] rounded-[2px] px-2.5 py-1 text-xs sm:text-sm font-semibold text-[#F0F3F6] truncate border border-white/[0.1] hover:border-white/[0.2] focus:border-[#38BDF8] outline-none transition-all leading-normal"
              title="프로젝트 이름 수정"
              aria-label="프로젝트 이름"
            />
          </div>

          {/* Luxury Azure Living Persistence Indicator with Tooltip */}
          <Tooltip content={saveStatus === 'saving' ? '로컬 저장 중...' : '브라우저에 실시간 안전 보존됨'} position="bottom">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-blue-950/60 border border-blue-500/30 cursor-default">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                saveStatus === 'saving' ? 'bg-[#38BDF8] animate-ping scale-125' : 'bg-[#38BDF8]'
              }`} />
              <span className="text-[10px] font-mono font-medium text-[#38BDF8] hidden md:inline">
                {saveStatus === 'saving' ? '보존 중' : '보존됨'}
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Zone 2: Zen Breathing Space (Zero Noise) */}
        <div className="flex-1" />

        {/* Zone 3: Curated Functional Groups (Single Tier, Icon + Tooltip) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Group A: Studio Utilities */}
          <div className="flex items-center gap-0.5">
            {/* Large Text Mode Toggle */}
            <Tooltip content={largeTextMode ? '보통 글씨로 전환' : '큰 글씨 모드로 전환'} position="bottom">
              <button
                onClick={toggleLargeTextMode}
                className={`h-7 w-7 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
                  largeTextMode
                    ? 'bg-blue-950/80 text-[#38BDF8] border-blue-500/40 font-bold shadow-xs'
                    : 'bg-transparent border-transparent text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                }`}
                aria-label="글씨 크기 모드 토글"
              >
                <Type size={14} />
              </button>
            </Tooltip>

            {/* AI Engine Settings Button */}
            <Tooltip content="인공지능 모델 설정" position="bottom">
              <button
                onClick={() => setIsAISettingsModalOpen(true)}
                className="h-7 w-7 flex items-center justify-center rounded-[2px] border border-transparent hover:border-white/10 text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] transition-colors cursor-pointer relative"
                aria-label="인공지능 모델 설정"
              >
                <Cpu size={14} className="text-[#38BDF8]" />
                <span className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#38BDF8]" />
              </button>
            </Tooltip>

            {/* Preview Panel Toggle */}
            <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '미리보기 패널 접기'} position="bottom">
              <button
                onClick={togglePreviewCollapsed}
                className={`h-7 w-7 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
                  isPreviewCollapsed
                    ? 'bg-blue-950/80 border-blue-500/40 text-[#38BDF8]'
                    : 'bg-transparent border-transparent text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06]'
                }`}
                aria-label="미리보기 패널 토글"
              >
                <PanelRight size={14} />
              </button>
            </Tooltip>
          </div>

          {/* Hairline Divider */}
          <div className="w-px h-3.5 bg-white/10" />

          {/* Group B: Document Assets (Templates & Backups) */}
          <div className="flex items-center rounded-[2px] border border-white/10 bg-[#13181F] p-0.5 gap-0.5">
            <Tooltip content="표준 기획서 템플릿" position="bottom">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="h-6 w-6 flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.08] transition-colors cursor-pointer"
                aria-label="표준 기획서 템플릿"
              >
                <LayoutTemplate size={13} className="text-[#38BDF8]" />
              </button>
            </Tooltip>
            <div className="w-px h-3 bg-white/10" />
            <Tooltip content="프로젝트 보관함 및 백업" position="bottom">
              <button
                onClick={() => { setBackupModalTab('storage'); setIsBackupModalOpen(true); }}
                className="h-6 w-6 flex items-center justify-center rounded-[2px] text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.08] transition-colors cursor-pointer"
                aria-label="프로젝트 보관함 및 백업"
              >
                <FolderOpen size={13} className="text-[#38BDF8]" />
              </button>
            </Tooltip>
          </div>

          {/* Hairline Divider */}
          <div className="w-px h-3.5 bg-white/10" />

          {/* Group C: The Dominant Primary Anchor CTA (Luxury Sapphire Blue) */}
          <Tooltip content="전체 사양서 번들 다운로드" position="bottom">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="h-7 px-2.5 flex items-center gap-1.5 justify-center rounded-[2px] bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-50 text-white transition-all cursor-pointer shadow-xs text-xs font-semibold whitespace-nowrap"
              aria-label="전체 사양서 번들 다운로드"
            >
              <Download size={13} className={isExporting ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline">번들 다운로드</span>
            </button>
          </Tooltip>

          {/* Hairline Divider */}
          <div className="w-px h-3.5 bg-white/10" />

          {/* Single-Tier User Profile & Sign Out (Flat) */}
          <div className="flex items-center gap-1">
            <Tooltip content="내 계정 프로필" position="bottom">
              <button
                onClick={() => navigate('/profile')}
                className="h-7 w-7 rounded-[2px] bg-blue-950/60 border border-blue-500/30 hover:border-[#38BDF8] transition-colors cursor-pointer text-[#38BDF8] text-[11px] font-bold flex items-center justify-center shadow-2xs"
                aria-label="내 계정 프로필"
              >
                {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
              </button>
            </Tooltip>

            <Tooltip content="로그아웃" position="bottom">
              <button
                onClick={onOpenLogoutModal}
                className="h-7 w-7 rounded-[2px] bg-transparent hover:bg-red-500/20 text-[#5C6675] hover:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="로그아웃"
              >
                <LogOut size={13} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* 2-Track Modern Workspace Mount */}
      <div className={`flex-1 flex overflow-hidden ${largeTextMode ? 'goguma-large-mode' : ''}`}>
        {/* Track 1 - Left Navigator: Ubuntu Icon Dock (58px) with Rich Flyout Tooltips / Collapsible to Drawer */}
        <IntegratedNavigator
          currentChapter={project.currentChapter}
          currentSection={project.currentSection}
          onSelectChapter={handleSelectChapter}
          onSelectSection={handleSelectSection}
          formInputs={formInputs}
          isCollapsed={isCol1Collapsed}
          onToggleCollapse={() => {
            setIsCol1Collapsed(prev => {
              const next = !prev;
              localStorage.setItem('goguma_nav_collapsed', String(next));
              return next;
            });
          }}
          completedChapters={completedChapters}
        />

        {/* Track 1 - Center: Unified Editorial Thinking Canvas (Fluid min-w 640px) */}
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
          onTogglePreviewCollapse={togglePreviewCollapsed}
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
            className={`w-2.5 -ml-1.5 z-20 cursor-col-resize flex items-center justify-center transition-all group select-none shrink-0 relative outline-none focus-visible:ring-1 focus-visible:ring-[#38BDF8] ${
              isResizing ? 'bg-blue-950/50' : 'bg-transparent hover:bg-white/[0.06]'
            }`}
            title="드래그하여 너비 조절 (더블클릭 시 기본값 480px, 좌우 방향키로 미세 조절)"
            onDoubleClick={() => handleApplyPresetWidth(480)}
          >
            <div className={`w-0.5 h-8 rounded-full transition-colors ${
              isResizing ? 'bg-[#38BDF8]' : 'bg-white/20 group-hover:bg-[#38BDF8]'
            }`} />

            {/* Real-time Floating Width HUD during Drag */}
            {isResizing && (
              <div className="absolute top-6 right-3 pointer-events-none bg-[#0E1217] border border-blue-500/30 text-[#F0F3F6] px-3 py-1.5 rounded-[2px] shadow-2xl text-xs font-mono flex items-center gap-2 whitespace-nowrap z-50">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-ping" />
                <span className="font-bold text-[#38BDF8]">{previewWidth}px</span>
                <span className="text-[#9AA5B5] text-[11px]">
                  {previewWidth <= 430 ? '스마트폰 뷰 (420px)' : previewWidth >= 600 ? '와이드 뷰 (620px)' : '데스크톱 뷰 (480px)'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Global Transparent Mouse-Capture Overlay during Resizing to prevent iframe mouse trapping */}
        {isResizing && (
          <div className="fixed inset-0 z-40 cursor-col-resize select-none bg-black/40" />
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
          onSelectChapter={handleSelectChapter}
          onSelectSection={handleSelectSection}
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

      {/* Unified Storage & Backup Studio Modal (Single Source of Truth) */}
      {isBackupModalOpen && (
        <Suspense fallback={null}>
          <LocalBackupModal
            isOpen={isBackupModalOpen}
            initialTab={backupModalTab}
            formInputs={formInputs}
            onClose={() => {
              setIsBackupModalOpen(false);
              schedulePersistence();
            }}
          />
        </Suspense>
      )}

      {/* AI Inference Engine Tier Settings Modal */}
      {isAISettingsModalOpen && (
        <Suspense fallback={null}>
          <AISettingsModal
            isOpen={isAISettingsModalOpen}
            onClose={() => {
              setIsAISettingsModalOpen(false);
              setAiSettings(getAISettings());
            }}
          />
        </Suspense>
      )}

      <WorkspaceDropZoneOverlay
        onProjectLoaded={(loadedPlan) => {
          setPlan(loadedPlan);
          schedulePersistence();
        }}
      />
    </div>
  );
}
