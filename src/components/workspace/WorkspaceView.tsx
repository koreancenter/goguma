import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, FolderOpen, PanelRight, PanelLeft, LogOut, LayoutTemplate, Cpu, Type, ChevronDown, Check
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';
import { getAISettings, getActiveAILabel, AISettings } from '../../lib/aiConfig';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import { Tooltip } from '../guide/Tooltip';

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
  const [isChapterMenuOpen, setIsChapterMenuOpen] = useState(false);
  const chapterMenuRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

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

  // Close quick chapter switcher on outside click
  useEffect(() => {
    if (!isChapterMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (chapterMenuRef.current && !chapterMenuRef.current.contains(e.target as Node)) {
        setIsChapterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isChapterMenuOpen]);

  // 50:50 Fluid Split Ratio (Defaults strictly to 50% / 50%)
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    const saved = localStorage.getItem('goguma_split_percent');
    if (saved) {
      const parsed = Number(saved);
      if (!Number.isNaN(parsed) && parsed >= 35 && parsed <= 65) return parsed;
    }
    return 50;
  });
  const [isResizing, setIsResizing] = useState(false);

  const handleToggleSidebar = () => {
    setIsCol1Collapsed(prev => {
      const next = !prev;
      localStorage.setItem('goguma_nav_collapsed', String(next));
      return next;
    });
  };

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

  const handleApplyPrdTemplate = (template: any) => {
    const newName = template.plan?.metadata?.projectName || template.name;
    setProject(prev => ({
      ...prev,
      name: newName,
      slug: template.id,
      updatedAt: new Date().toISOString()
    }));

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

  const currentChapterObj = GOGUMA_CHAPTERS.find(c => c.id === project.currentChapter) || GOGUMA_CHAPTERS[0];
  const activeTierLabel =
    aiSettings.provider === 'webllm'
      ? 'WebLLM'
      : aiSettings.provider === 'ollama'
      ? 'Ollama'
      : 'Gemini';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FFFFFF] text-[#111827] font-sans selection:bg-[#EFF6FF] selection:text-[#1E3A8A]">
      {/* Top Utility Header (h-14 / 56px, #FFFFFF, 1px solid #E5E7EB hairline) */}
      <header className="h-14 px-4 sm:px-5 bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between shrink-0 select-none z-30 gap-4">
        {/* Left Zone: Sidebar Toggle + GOGUMA Logo + Editable Project Title */}
        <div className="flex items-center gap-2.5 min-w-0 shrink-0">
          <Tooltip content={isCol1Collapsed ? '목차 서랍 펼치기' : '목차 서랍 접기'} position="bottom">
            <button
              onClick={handleToggleSidebar}
              className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
                !isCol1Collapsed
                  ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9]'
              }`}
              aria-label="사이드바 토글"
            >
              <PanelLeft size={16} />
            </button>
          </Tooltip>

          <button
            onClick={() => navigate('/')}
            className="font-sans font-bold text-sm sm:text-[15px] tracking-tight text-[#111827] hover:text-[#1E3A8A] transition-colors cursor-pointer whitespace-nowrap shrink-0 leading-none flex items-center gap-2"
          >
            <span className="w-6 h-6 rounded-md bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs">G</span>
            <span>GOGUMA</span>
          </button>

          <span className="text-[#D1D5DB] select-none leading-none shrink-0" aria-hidden="true">/</span>

          {/* Inline Editable Project Title */}
          <div className="min-w-0 max-w-[160px] sm:max-w-[240px] lg:max-w-[280px] flex items-center">
            <input
              type="text"
              value={project.name}
              onChange={(e) => {
                const newName = e.target.value;
                setProject(prev => ({ ...prev, name: newName }));
                setPlan(prev => ({ ...prev, metadata: { ...prev.metadata, projectName: newName, title: newName } }));
                schedulePersistence();
              }}
              className="w-full bg-[#F7F8FA] hover:bg-[#F1F5F9] focus:bg-[#FFFFFF] rounded-lg px-2.5 py-1 text-xs sm:text-sm font-semibold text-[#111827] truncate border border-transparent focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/10 outline-none transition-all leading-normal"
              title="프로젝트 이름 수정"
              aria-label="프로젝트 이름"
            />
          </div>

          <Tooltip content={saveStatus === 'saving' ? '로컬 저장 중...' : '브라우저 IndexedDB에 실시간 저장됨'} position="bottom">
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#15803D] cursor-default shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                saveStatus === 'saving' ? 'bg-[#B45309] animate-pulse' : 'bg-[#15803D]'
              }`} />
              <span className="text-[11px] font-medium whitespace-nowrap">
                {saveStatus === 'saving' ? '저장 중' : '저장됨'}
              </span>
            </div>
          </Tooltip>
        </div>

        {/* Center Zone: Compact Active Chapter Indicator / Quick Switcher */}
        <div className="hidden md:flex items-center justify-center flex-1 min-w-0" ref={chapterMenuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsChapterMenuOpen(prev => !prev)}
              className="h-8 px-3 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-xs font-medium text-[#111827] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap max-w-[280px]"
              aria-expanded={isChapterMenuOpen}
              aria-label="챕터 빠른 전환"
            >
              <span className="font-mono text-[11px] font-semibold text-[#1E3A8A] tabular-nums shrink-0">
                0{currentChapterObj.id}
              </span>
              <span className="text-[#D1D5DB] shrink-0" aria-hidden="true">·</span>
              <span className="truncate">{currentChapterObj.title}</span>
              <ChevronDown size={13} className={`text-[#4B5563] shrink-0 transition-transform duration-150 ${isChapterMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isChapterMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl shadow-[0_12px_32px_-4px_rgba(15,23,42,0.1)] p-1.5 z-50">
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-[#4B5563] border-b border-[#E5E7EB] mb-1 flex items-center justify-between">
                  <span>챕터 빠른 이동</span>
                  <span className="font-mono tabular-nums text-[#9CA3AF]">{project.currentChapter} / {GOGUMA_CHAPTERS.length}</span>
                </div>
                <div className="space-y-0.5 max-h-[340px] overflow-y-auto custom-scroll">
                  {GOGUMA_CHAPTERS.map((ch) => {
                    const isActive = ch.id === project.currentChapter;
                    const isDone = completedChapters.has(ch.id);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => {
                          handleSelectChapter(ch.id);
                          setIsChapterMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-lg text-left text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                            : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F7F8FA]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`font-mono text-[11px] tabular-nums shrink-0 ${
                            isActive ? 'text-[#1E3A8A] font-bold' : 'text-[#9CA3AF]'
                          }`}>
                            0{ch.id}
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </div>
                        {isDone && (
                          <Check size={13} className="text-[#15803D] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: Subtle 3-Tier AI Status Badge + Utilities + Editorial Navy Primary CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 3-Tier AI Engine Status Badge */}
          <Tooltip content={`AI 엔진 설정 (${getActiveAILabel(aiSettings)})`} position="bottom">
            <button
              onClick={() => setIsAISettingsModalOpen(true)}
              className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-xs font-medium text-[#111827] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label="인공지능 모델 설정"
            >
              <Cpu size={13} className="text-[#1E3A8A] shrink-0" />
              <span className="font-mono text-[11px] font-medium text-[#111827]">{activeTierLabel}</span>
            </button>
          </Tooltip>

          {/* Subtle Studio Utilities */}
          <div className="hidden sm:flex items-center gap-0.5">
            <Tooltip content={largeTextMode ? '보통 글씨로 전환' : '큰 글씨 모드로 전환'} position="bottom">
              <button
                onClick={toggleLargeTextMode}
                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  largeTextMode
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] font-bold'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9]'
                }`}
                aria-label="글씨 크기 모드 토글"
              >
                <Type size={15} />
              </button>
            </Tooltip>

            <Tooltip content="표준 기획서 템플릿" position="bottom">
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="표준 기획서 템플릿"
              >
                <LayoutTemplate size={15} />
              </button>
            </Tooltip>

            <Tooltip content="프로젝트 보관함 및 백업" position="bottom">
              <button
                onClick={() => { setBackupModalTab('storage'); setIsBackupModalOpen(true); }}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                aria-label="프로젝트 보관함 및 백업"
              >
                <FolderOpen size={15} />
              </button>
            </Tooltip>

            <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '미리보기 패널 접기'} position="bottom">
              <button
                onClick={togglePreviewCollapsed}
                className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isPreviewCollapsed
                    ? 'bg-[#EFF6FF] text-[#1E3A8A]'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F1F5F9]'
                }`}
                aria-label="미리보기 패널 토글"
              >
                <PanelRight size={15} />
              </button>
            </Tooltip>
          </div>

          <div className="w-px h-4 bg-[#E5E7EB] hidden sm:block" />

          {/* Primary CTA: Export 11 Specs in Editorial Navy (#1E3A8A) */}
          <Tooltip content="11종 사양서 번들 ZIP 다운로드" position="bottom">
            <button
              onClick={handleExportZip}
              disabled={isExporting}
              className="h-8 px-3.5 flex items-center gap-1.5 justify-center rounded-lg bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-50 text-white transition-colors cursor-pointer text-xs font-medium whitespace-nowrap shrink-0 shadow-xs"
              aria-label="Export 11 Specs"
            >
              <Download size={13} className={isExporting ? 'animate-bounce' : ''} />
              <span>Export 11 Specs</span>
            </button>
          </Tooltip>

          {/* User Account & Sign Out */}
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip content="내 계정 프로필" position="bottom">
              <button
                onClick={() => navigate('/profile')}
                className="h-8 w-8 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] border border-[#E5E7EB] transition-colors cursor-pointer text-[#1E3A8A] text-xs font-semibold flex items-center justify-center"
                aria-label="내 계정 프로필"
              >
                {currentUser?.displayName ? currentUser.displayName[0] : 'U'}
              </button>
            </Tooltip>

            <Tooltip content="로그아웃" position="bottom">
              <button
                onClick={onOpenLogoutModal}
                className="h-8 w-8 rounded-lg text-[#4B5563] hover:text-[#B91C1C] hover:bg-[#FEF2F2] flex items-center justify-center transition-colors cursor-pointer"
                aria-label="로그아웃"
              >
                <LogOut size={14} />
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Main Workspace Shell: h-[calc(100vh-56px)] (Collapsible Rail + 50:50 Fluid Split) */}
      <div className={`h-[calc(100vh-56px)] flex overflow-hidden bg-[#FFFFFF] ${largeTextMode ? 'goguma-large-mode' : ''}`}>
        {/* Left Collapsible Chapter Rail / Drawer (52px collapsed / 240px expanded) */}
        <IntegratedNavigator
          currentChapter={project.currentChapter}
          currentSection={project.currentSection}
          onSelectChapter={handleSelectChapter}
          onSelectSection={handleSelectSection}
          formInputs={formInputs}
          isCollapsed={isCol1Collapsed}
          onToggleCollapse={handleToggleSidebar}
          completedChapters={completedChapters}
        />

        {/* 50:50 Fluid Split Workspace Area */}
        <div ref={splitContainerRef} className="flex-1 flex min-w-0 h-full overflow-hidden">
          {/* 50% Left Editor Pane (#FFFFFF) */}
          <div
            style={!isPreviewCollapsed ? { width: `${splitPercent}%` } : undefined}
            className={`${isPreviewCollapsed ? 'flex-1' : 'shrink-0'} min-w-0 h-full bg-[#FFFFFF] overflow-hidden flex flex-col`}
          >
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
          </div>

          {/* Single 1px solid #E5E7EB Vertical Divider (with subtle drag-resize affordance) */}
          {!isPreviewCollapsed && (
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-valuenow={Math.round(splitPercent)}
              aria-valuemin={35}
              aria-valuemax={65}
              aria-label="에디터 및 미리보기 분할 비율 조절"
              onKeyDown={handleResizerKeyDown}
              onMouseDown={handleMouseDownResizer}
              onDoubleClick={handleResetSplit}
              title="드래그하여 비율 조절 (더블클릭 시 50:50 초기화)"
              className="w-px bg-[#E5E7EB] shrink-0 relative z-20 select-none outline-none focus-visible:bg-[#1E3A8A] group"
            >
              <div
                className={`absolute inset-y-0 -left-1 -right-1 cursor-col-resize transition-colors ${
                  isResizing ? 'bg-[#1E3A8A]/15' : 'group-hover:bg-[#1E3A8A]/10'
                }`}
              />
            </div>
          )}

          {/* Global Mouse-Capture Overlay during Resizing */}
          {isResizing && (
            <div className="fixed inset-0 z-40 cursor-col-resize select-none bg-transparent" />
          )}

          {/* 50% Right Preview Stage (#F7F8FA) or Collapsed 52px Rail */}
          <div
            style={!isPreviewCollapsed ? { width: `${100 - splitPercent}%` } : undefined}
            className={`${isPreviewCollapsed ? 'shrink-0' : 'shrink-0'} min-w-0 h-full bg-[#F7F8FA] overflow-hidden flex flex-col`}
          >
            <SpecPreviewPanel
              plan={plan}
              formInputs={formInputs}
              currentChapter={project.currentChapter}
              isCollapsed={isPreviewCollapsed}
              onToggleCollapse={togglePreviewCollapsed}
              largeTextMode={largeTextMode}
              onSelectChapter={handleSelectChapter}
              onSelectSection={handleSelectSection}
            />
          </div>
        </div>
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

      {/* Unified Storage & Backup Studio Modal */}
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
