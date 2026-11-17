import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, PanelLeft, ChevronDown, Check, Menu, X, ChevronRight
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, DomainBusinessRule, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import { Tooltip } from '../guide/Tooltip';
import type { PreferencesTab } from '../guide/PreferencesModal';

import { IntegratedNavigator } from '../classic/IntegratedNavigator';
import { WritingCanvas } from '../classic/WritingCanvas';
import { SpecPreviewPanel } from '../preview/SpecPreviewPanel';
import { WorkspaceDropZoneOverlay } from '../classic/WorkspaceDropZoneOverlay';

const LocalBackupModal = lazy(() =>
  import('../classic/LocalBackupModal').then(m => ({ default: m.LocalBackupModal }))
);
const StandardTemplateModal = lazy(() =>
  import('../classic/StandardTemplateModal').then(m => ({ default: m.StandardTemplateModal }))
);
const PreferencesModal = lazy(() =>
  import('../guide/PreferencesModal').then(m => ({ default: m.PreferencesModal }))
);
const ExportSpecModal = lazy(() =>
  import('../preview/ExportSpecModal').then(m => ({ default: m.ExportSpecModal }))
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
  isCol1Collapsed: boolean;
  setIsCol1Collapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isCol2Collapsed: boolean;
  setIsCol2Collapsed: React.Dispatch<React.SetStateAction<boolean>>;
  completedChapters: Set<number>;
  updatedChapters?: Set<number>;
  handleToggleChapterLock?: (chapterId: number) => void;
  handleSelectChapter: (chapterId: number) => void;
  handleSelectSection: (sectionKey: string) => void;
  handleInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  handleBusinessRulesChange?: (chapterId: number, sectionKey: string, rules: DomainBusinessRule[]) => void;
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
  isCol1Collapsed,
  setIsCol1Collapsed,
  completedChapters,
  updatedChapters,
  handleToggleChapterLock,
  handleSelectChapter,
  handleSelectSection,
  handleInputChange,
  handleBusinessRulesChange,
  handleNavigateSection,
  schedulePersistence,
  currentUser,
  onOpenLogoutModal,
}: WorkspaceViewProps) {
  const navigate = useNavigate();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'import' | 'storage'>('export');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferencesTab, setPreferencesTab] = useState<PreferencesTab>('engine');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<number | 'settings' | 'help'>(project.currentChapter);
  const [isMobileChapterDrawerOpen, setIsMobileChapterDrawerOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'editor' | 'preview'>('editor');
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHoveredMenuId(project.currentChapter);
  }, [project.currentChapter]);

  const openPreferences = (tab: PreferencesTab = 'engine') => {
    setPreferencesTab(tab);
    setIsPreferencesOpen(true);
    setIsMegaMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
  };

  useEffect(() => {
    if (!isMegaMenuOpen && !isMobileChapterDrawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerWrapperRef.current && !headerWrapperRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMegaMenuOpen, isMobileChapterDrawerOpen]);

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

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const CHAPTER_SHORT_LABELS: Record<number, string> = {
    1: '개요',
    2: '사용자',
    3: '기능',
    4: '데이터',
    5: '디자인',
    6: '화면',
    7: '아키텍처',
    8: '산출물',
  };

  const currentChapterObj = GOGUMA_CHAPTERS.find(c => c.id === project.currentChapter) || GOGUMA_CHAPTERS[0];

  const SETTINGS_MENU_ITEMS: {
    id: string;
    label: string;
    action: () => void;
  }[] = [
    {
      id: 'engine',
      label: '인공지능 엔진 설정',
      action: () => openPreferences('engine'),
    },
    {
      id: 'display',
      label: '화면 및 가독성 설정',
      action: () => openPreferences('display'),
    },
    {
      id: 'templates',
      label: '표준 기획서 템플릿',
      action: () => {
        setIsTemplateModalOpen(true);
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      },
    },
    {
      id: 'storage',
      label: '보관함 및 로컬 백업',
      action: () => {
        setBackupModalTab('storage');
        setIsBackupModalOpen(true);
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      },
    },
    {
      id: 'account',
      label: '내 계정 및 프로필',
      action: () => {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
        navigate('/profile');
      },
    },
    {
      id: 'logout',
      label: '로그아웃',
      action: () => {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
        onOpenLogoutModal();
      },
    },
  ];

  const HELP_MENU_ITEMS: {
    id: string;
    label: string;
    action: () => void;
  }[] = [
    {
      id: 'studio-guide',
      label: '스튜디오 안내',
      action: () => {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
        navigate('/landing');
      },
    },
    {
      id: 'help-guide',
      label: '도움말',
      action: () => {
        setIsMegaMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
        navigate('/support');
      },
    },
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#FFFFFF] text-[#000000] font-sans selection:bg-[#000000] selection:text-[#FFFFFF]">
      {/* Sejong Architectural Two-Tier Header + Full-Width 9-Column Mega Menu */}
      <div
        ref={headerWrapperRef}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
        className="relative shrink-0 z-40 select-none bg-[#FFFFFF]"
      >
        {/* Tier 1: Slim Black Utility Strip (#000000) — High-Contrast Pure White Links */}
        <div className="h-10 bg-[#000000] text-[#FFFFFF] border-b border-white/20 px-4 sm:px-6 flex items-center justify-between gap-3 text-[13px] font-bold">
          {/* Left: Sidebar Toggle + Editable Project Title + Quiet Save Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <Tooltip content={isCol1Collapsed ? '목차 서랍 펼치기' : '목차 서랍 접기'} position="bottom">
              <button
                type="button"
                onClick={handleToggleSidebar}
                className={`h-7 px-2.5 flex items-center gap-1.5 rounded-[2px] text-[13px] font-bold transition-colors cursor-pointer shrink-0 ${
                  !isCol1Collapsed
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#FFFFFF] hover:bg-white/15'
                }`}
                aria-label="목차 서랍 토글"
              >
                <PanelLeft size={14} />
                <span className="hidden sm:inline">목차</span>
              </button>
            </Tooltip>

            <span className="text-white/30 select-none hidden sm:inline" aria-hidden="true">|</span>

            <div className="min-w-0 max-w-[150px] sm:max-w-[260px] lg:max-w-[320px] flex items-center">
              <input
                type="text"
                value={project.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setProject(prev => ({ ...prev, name: newName }));
                  setPlan(prev => ({ ...prev, metadata: { ...prev.metadata, projectName: newName, title: newName } }));
                  schedulePersistence();
                }}
                className="w-full bg-transparent hover:bg-white/10 focus:bg-[#1A1A18] rounded-[2px] px-2 py-0.5 text-[13px] font-bold text-[#FFFFFF] truncate border-b border-transparent focus:border-white/60 outline-none transition-colors leading-normal"
                title="프로젝트 이름 수정"
                aria-label="프로젝트 이름"
              />
            </div>

            <span className="hidden md:inline-block text-[12px] font-semibold text-white/85 whitespace-nowrap shrink-0">
              {saveStatus === 'saving' ? '보존 중...' : '로컬 보존됨'}
            </span>
          </div>

          {/* Tier 1 Right: Minimalist Editorial Empty Strip */}
          <div className="shrink-0" />
        </div>

        {/* Tier 2: Main White Navigation Row (#FFFFFF) — Doubled Font Size & Maximum Ink Contrast */}
        <header className="h-20 px-4 sm:px-6 bg-[#FFFFFF] border-b border-[#E4E2DC] flex items-center justify-between gap-4">
          {/* Left: Bold Editorial Wordmark */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigate('/landing')}
              className="font-display font-extrabold text-[22px] sm:text-[24px] tracking-[-0.04em] text-[#000000] hover:opacity-75 transition-opacity cursor-pointer whitespace-nowrap leading-none"
            >
              고구마
            </button>
          </div>

          {/* Center: High-Contrast Single-Line Horizontal Main Menu (Zero Numbers, Zero English, 2x Scale) */}
          <nav
            className="hidden lg:flex items-center justify-center flex-1 min-w-0 h-full gap-0.5 xl:gap-1.5 2xl:gap-2.5"
            aria-label="기획서 주요 메뉴"
          >
            {GOGUMA_CHAPTERS.map((ch) => {
              const isCurrent = ch.id === project.currentChapter;
              const isHighlighted = isMegaMenuOpen ? hoveredMenuId === ch.id : isCurrent;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onMouseEnter={() => {
                    setHoveredMenuId(ch.id);
                    setIsMegaMenuOpen(true);
                  }}
                  onFocus={() => {
                    setHoveredMenuId(ch.id);
                    setIsMegaMenuOpen(true);
                  }}
                  onClick={() => {
                    if (isMegaMenuOpen && hoveredMenuId === ch.id) {
                      handleSelectChapter(ch.id);
                      setIsMegaMenuOpen(false);
                    } else {
                      setHoveredMenuId(ch.id);
                      setIsMegaMenuOpen(true);
                    }
                  }}
                  className={`relative h-full px-1.5 xl:px-2.5 2xl:px-3 flex items-center gap-1.5 text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isHighlighted ? 'text-[#000000]' : 'text-[#111111] hover:text-[#000000]'
                  }`}
                >
                  <span>{CHAPTER_SHORT_LABELS[ch.id] || ch.title}</span>
                  {(isCurrent || (isMegaMenuOpen && hoveredMenuId === ch.id)) && (
                    <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] bg-[#000000]" />
                  )}
                </button>
              );
            })}

            {/* Unified [환경 설정] Top-Level Main Menu */}
            <button
              type="button"
              onMouseEnter={() => {
                setHoveredMenuId('settings');
                setIsMegaMenuOpen(true);
              }}
              onFocus={() => {
                setHoveredMenuId('settings');
                setIsMegaMenuOpen(true);
              }}
              onClick={() => openPreferences('engine')}
              className={`relative h-full px-1.5 xl:px-2.5 2xl:px-3 flex items-center gap-1.5 text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'settings' ? 'text-[#000000]' : 'text-[#111111] hover:text-[#000000]'
              }`}
            >
              <span>환경 설정</span>
              {((isMegaMenuOpen && hoveredMenuId === 'settings') || isPreferencesOpen) && (
                <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] bg-[#000000]" />
              )}
            </button>

            {/* Unified [도움말] Top-Level Main Menu */}
            <button
              type="button"
              onMouseEnter={() => {
                setHoveredMenuId('help');
                setIsMegaMenuOpen(true);
              }}
              onFocus={() => {
                setHoveredMenuId('help');
                setIsMegaMenuOpen(true);
              }}
              onClick={() => {
                setIsMegaMenuOpen(false);
                navigate('/support');
              }}
              className={`relative h-full px-1.5 xl:px-2.5 2xl:px-3 flex items-center gap-1.5 text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'help' ? 'text-[#000000]' : 'text-[#111111] hover:text-[#000000]'
              }`}
            >
              <span>도움말</span>
              {isMegaMenuOpen && hoveredMenuId === 'help' && (
                <span className="absolute bottom-0 left-1.5 right-1.5 h-[3px] bg-[#000000]" />
              )}
            </button>
          </nav>

          {/* Compact Chapter Selector for Tablet / Mobile (< lg) */}
          <div className="flex lg:hidden items-center flex-1 justify-center min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileChapterDrawerOpen(prev => !prev)}
              className="h-10 px-3.5 rounded-[2px] border border-[#111111] text-[15px] font-bold text-[#000000] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap max-w-[240px]"
            >
              <span className="truncate">{CHAPTER_SHORT_LABELS[currentChapterObj.id] || currentChapterObj.title}</span>
              <ChevronDown size={15} className={`shrink-0 transition-transform ${isMobileChapterDrawerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Right: Mobile Split Toggle + Pure-Korean Export CTA */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Responsive Editor / Preview Toggle (< lg) */}
            <div className="flex lg:hidden items-center bg-[#F6F5F1] p-0.5 rounded-[2px] border border-[#E4E2DC] shrink-0">
              <button
                type="button"
                onClick={() => setMobilePane('editor')}
                className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                  mobilePane === 'editor'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#3F3F3C] hover:text-[#000000]'
                }`}
              >
                에디터
              </button>
              <button
                type="button"
                onClick={() => setMobilePane('preview')}
                className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                  mobilePane === 'preview'
                    ? 'bg-[#FFFFFF] text-[#000000]'
                    : 'text-[#3F3F3C] hover:text-[#000000]'
                }`}
              >
                미리보기
              </button>
            </div>

            {/* Mobile Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileChapterDrawerOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-[2px] border border-[#111111] text-[#000000] cursor-pointer"
              aria-label="전체 메뉴 열기"
            >
              {isMobileChapterDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <Tooltip content="개발 사양서 및 실행 플레이북 내보내기" position="bottom">
              <button
                type="button"
                onClick={handleOpenExportModal}
                className="h-10 px-4 sm:px-5 flex items-center gap-2 justify-center rounded-[2px] bg-[#000000] hover:bg-[#1C1C1A] text-[#FFFFFF] transition-colors cursor-pointer text-[14px] font-bold whitespace-nowrap shrink-0 tracking-tight"
                aria-label="사양서 내보내기"
              >
                <Download size={14} />
                <span className="hidden sm:inline">사양서 내보내기</span>
                <span className="sm:hidden">내보내기</span>
              </button>
            </Tooltip>
          </div>
        </header>

        {/* Full-Width 10-Column Sejong Architectural Mega-Menu (8 Chapters + [환경 설정] + [도움말]) */}
        {isMegaMenuOpen && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-[#FFFFFF] border-t border-[#E4E2DC] border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-50"
            role="region"
            aria-label="전체 메뉴, 환경 설정 및 도움말 메가메뉴"
          >
            <div className="grid grid-cols-10 divide-x divide-[#E4E2DC]">
              {GOGUMA_CHAPTERS.map((ch) => {
                const isActiveCol = hoveredMenuId === ch.id;

                return (
                  <div
                    key={ch.id}
                    onMouseEnter={() => setHoveredMenuId(ch.id)}
                    className="flex flex-col min-h-[260px] bg-[#FFFFFF] text-[#000000]"
                  >
                    {/* Pure Korean Column Heading — Black Hover Highlight Box Only */}
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectChapter(ch.id);
                        setIsMegaMenuOpen(false);
                      }}
                      className={`w-full px-2.5 py-4 text-center border-b cursor-pointer transition-colors duration-150 ${
                        isActiveCol
                          ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                          : 'bg-[#FFFFFF] text-[#000000] border-[#E4E2DC] hover:bg-[#000000] hover:text-[#FFFFFF] hover:border-[#000000]'
                      }`}
                    >
                      <div className="text-[16px] xl:text-[19px] font-extrabold tracking-[-0.03em] leading-snug break-keep">
                        {CHAPTER_SHORT_LABELS[ch.id] || ch.title}
                      </div>
                    </button>

                    {/* Column Sub-Sections (Clean White Surface) */}
                    <div className="flex-1 p-2.5 flex flex-col gap-1.5 bg-[#FFFFFF] text-[#000000]">
                      {ch.sections.map((sec) => {
                        const isSecCurrent = project.currentChapter === ch.id && project.currentSection === sec.key;
                        const secEntry = formInputs[`${ch.id}_${sec.key}`];
                        const isSecFilled = Boolean(secEntry?.userRawInput?.trim());

                        return (
                          <button
                            key={sec.key}
                            type="button"
                            onClick={() => {
                              handleSelectChapter(ch.id);
                              handleSelectSection(sec.key);
                              setIsMegaMenuOpen(false);
                            }}
                            className={`w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-start justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer ${
                              isSecCurrent
                                ? 'bg-[#F6F5F1] text-[#000000] font-bold'
                                : 'text-[#000000] hover:bg-[#F6F5F1]'
                            }`}
                          >
                            <span className="break-keep">{sec.title}</span>
                            {isSecFilled ? (
                              <Check size={13} className="shrink-0 mt-0.5 text-[#1F5132]" />
                            ) : (
                              <ChevronRight size={13} className="shrink-0 mt-0.5 opacity-60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* 9th Column: Dedicated [환경 설정] Mega-Menu Column */}
              <div
                onMouseEnter={() => setHoveredMenuId('settings')}
                className="flex flex-col min-h-[260px] bg-[#FFFFFF] text-[#000000]"
              >
                <button
                  type="button"
                  onClick={() => openPreferences('engine')}
                  className={`w-full px-2.5 py-4 text-center border-b cursor-pointer transition-colors duration-150 ${
                    hoveredMenuId === 'settings'
                      ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                      : 'bg-[#FFFFFF] text-[#000000] border-[#E4E2DC] hover:bg-[#000000] hover:text-[#FFFFFF] hover:border-[#000000]'
                  }`}
                >
                  <div className="text-[16px] xl:text-[19px] font-extrabold tracking-[-0.03em] leading-snug break-keep">
                    환경 설정
                  </div>
                </button>

                <div className="flex-1 p-2.5 flex flex-col justify-between gap-2 bg-[#FFFFFF] text-[#000000]">
                  <div className="space-y-1">
                    {SETTINGS_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[#000000] hover:bg-[#F6F5F1]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 10th Column: Dedicated [도움말] Mega-Menu Column */}
              <div
                onMouseEnter={() => setHoveredMenuId('help')}
                className="flex flex-col min-h-[260px] bg-[#FFFFFF] text-[#000000]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMegaMenuOpen(false);
                    navigate('/support');
                  }}
                  className={`w-full px-2.5 py-4 text-center border-b cursor-pointer transition-colors duration-150 ${
                    hoveredMenuId === 'help'
                      ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                      : 'bg-[#FFFFFF] text-[#000000] border-[#E4E2DC] hover:bg-[#000000] hover:text-[#FFFFFF] hover:border-[#000000]'
                  }`}
                >
                  <div className="text-[16px] xl:text-[19px] font-extrabold tracking-[-0.03em] leading-snug break-keep">
                    도움말
                  </div>
                </button>

                <div className="flex-1 p-2.5 flex flex-col justify-between gap-2 bg-[#FFFFFF] text-[#000000]">
                  <div className="space-y-1">
                    {HELP_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[#000000] hover:bg-[#F6F5F1]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile & Tablet Drawer (< lg) — Zero Numbers, Zero English, Unified Settings & Help */}
        {isMobileChapterDrawerOpen && (
          <div className="lg:hidden absolute left-0 right-0 top-full bg-[#FFFFFF] border-b border-[#000000] shadow-lg z-50 max-h-[75vh] overflow-y-auto">
            <div className="p-4 border-b border-[#E4E2DC] bg-[#F6F5F1] space-y-4">
              <div>
                <div className="text-xs font-extrabold text-[#000000] mb-2">환경 설정</div>
                <div className="grid grid-cols-2 gap-2">
                  {SETTINGS_MENU_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] text-xs font-bold text-[#000000] flex items-center rounded-[2px] cursor-pointer text-left"
                    >
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-extrabold text-[#000000] mb-2">도움말</div>
                <div className="grid grid-cols-2 gap-2">
                  {HELP_MENU_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={item.action}
                      className="px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] text-xs font-bold text-[#000000] flex items-center rounded-[2px] cursor-pointer text-left"
                    >
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#E4E2DC]">
              {GOGUMA_CHAPTERS.map((ch) => {
                const isActive = ch.id === project.currentChapter;
                return (
                  <div key={ch.id} className={isActive ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}>
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectChapter(ch.id);
                        setIsMobileChapterDrawerOpen(false);
                      }}
                      className="w-full px-5 py-3.5 text-left flex items-center justify-between text-base font-extrabold cursor-pointer"
                    >
                      <span>{ch.title}</span>
                      {completedChapters.has(ch.id) && <Check size={15} />}
                    </button>
                    <div className="px-5 pb-3.5 flex flex-wrap gap-2">
                      {ch.sections.map((sec) => (
                        <button
                          key={sec.key}
                          type="button"
                          onClick={() => {
                            handleSelectChapter(ch.id);
                            handleSelectSection(sec.key);
                            setIsMobileChapterDrawerOpen(false);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-[2px] border cursor-pointer ${
                            isActive
                              ? 'border-white/35 text-[#FFFFFF]'
                              : 'border-[#CBC8BF] text-[#000000]'
                          }`}
                        >
                          {sec.title}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Shell: Fluid Remaining Height */}
      <div className={`flex-1 min-h-0 flex overflow-hidden bg-[#FFFFFF] ${largeTextMode ? 'goguma-large-mode' : ''}`}>
        {!isCol1Collapsed && (
          <IntegratedNavigator
            currentChapter={project.currentChapter}
            currentSection={project.currentSection}
            onSelectChapter={handleSelectChapter}
            onSelectSection={handleSelectSection}
            formInputs={formInputs}
            isCollapsed={false}
            onToggleCollapse={handleToggleSidebar}
            completedChapters={completedChapters}
            lockedChapters={project.lockedChapters}
          />
        )}

        <div ref={splitContainerRef} className="flex-1 flex min-w-0 h-full overflow-hidden">
          {/* 50% Left Editor Pane (#FFFFFF) */}
          <div
            style={{ '--split-left': `${splitPercent}%` } as React.CSSProperties}
            className={`${
              mobilePane === 'editor' ? 'flex w-full' : 'hidden lg:flex'
            } lg:shrink-0 lg:w-[var(--split-left)] min-w-0 h-full bg-[#FFFFFF] overflow-hidden flex-col`}
          >
            <WritingCanvas
              currentChapter={project.currentChapter}
              currentSection={project.currentSection}
              formInputs={formInputs}
              onInputChange={handleInputChange}
              onBusinessRulesChange={handleBusinessRulesChange}
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

          {/* Single 1px solid #E4E2DC Vertical Divider (Desktop lg+ only) */}
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
            className="hidden lg:block w-px bg-[#E4E2DC] shrink-0 relative z-20 select-none outline-none focus-visible:bg-[#111111] group"
          >
            <div
              className={`absolute inset-y-0 -left-1 -right-1 cursor-col-resize transition-colors ${
                isResizing ? 'bg-[#111111]/15' : 'group-hover:bg-[#111111]/10'
              }`}
            />
          </div>

          {isResizing && (
            <div className="fixed inset-0 z-40 cursor-col-resize select-none bg-transparent" />
          )}

          {/* 50% Right Exhibition Preview Stage (#F6F5F1) */}
          <div
            style={{ '--split-right': `${100 - splitPercent}%` } as React.CSSProperties}
            className={`${
              mobilePane === 'preview' ? 'flex w-full' : 'hidden lg:flex'
            } lg:shrink-0 lg:w-[var(--split-right)] min-w-0 h-full bg-[#F6F5F1] overflow-hidden flex-col`}
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

      {isTemplateModalOpen && (
        <Suspense fallback={null}>
          <StandardTemplateModal
            isOpen={isTemplateModalOpen}
            onClose={() => setIsTemplateModalOpen(false)}
            onApplyTemplate={handleApplyPrdTemplate}
          />
        </Suspense>
      )}

      {isBackupModalOpen && (
        <Suspense fallback={null}>
          <LocalBackupModal
            isOpen={isBackupModalOpen}
            initialTab={backupModalTab}
            formInputs={formInputs}
            lockedChapters={project.lockedChapters}
            onClose={() => {
              setIsBackupModalOpen(false);
              schedulePersistence();
            }}
          />
        </Suspense>
      )}

      {isExportModalOpen && (
        <Suspense fallback={null}>
          <ExportSpecModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            plan={plan}
            formInputs={formInputs}
            lockedChapters={project.lockedChapters}
            updatedChapters={updatedChapters}
          />
        </Suspense>
      )}

      {isPreferencesOpen && (
        <Suspense fallback={null}>
          <PreferencesModal
            isOpen={isPreferencesOpen}
            initialTab={preferencesTab}
            onClose={() => setIsPreferencesOpen(false)}
            largeTextMode={largeTextMode}
            onToggleLargeTextMode={toggleLargeTextMode}
            onOpenTemplates={() => setIsTemplateModalOpen(true)}
            onOpenBackup={(tab = 'storage') => {
              setBackupModalTab(tab);
              setIsBackupModalOpen(true);
            }}
            currentUserName={currentUser?.displayName}
            currentUserRole={currentUser?.role}
            onNavigateProfile={() => navigate('/profile')}
            onOpenLogout={onOpenLogoutModal}
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
