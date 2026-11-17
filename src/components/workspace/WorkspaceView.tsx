import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Check, Menu, X, ChevronRight
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, DomainBusinessRule, SitePlan } from '../../types';
import { LocalUser } from '../../lib/localAuth';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import type { PreferencesTab } from '../guide/PreferencesModal';

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
        {/* Tier 1: Slim Black Utility Strip (#000000) — App Brand Mark + Project Title + Save Status */}
        <div className="h-10 bg-[#000000] text-[#FFFFFF] border-b border-white/20 px-4 sm:px-6 flex items-center justify-between gap-3 text-[13px] font-bold">
          {/* Left: Custom Brand Icon & App Title ("고구마") + Editable Project Title + Quiet Save Indicator */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/landing')}
              className="flex items-center gap-2 text-[#FFFFFF] hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap shrink-0"
              title="고구마 스튜디오 홈으로 이동"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M7.5 14.5C7.5 11.2 10.6 7.5 14.8 7.5C16.2 7.5 17 8.4 17 9.8C17 13.4 13.7 16.5 9.8 16.5C8.3 16.5 7.5 15.7 7.5 14.5Z"
                  fill="currentColor"
                />
                <path d="M14.5 7.5C15.2 6.3 16.3 5.6 17.5 5.5" stroke="#C5A880" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span className="font-display font-extrabold text-[15px] tracking-[-0.03em] leading-none">
                고구마
              </span>
            </button>

            <span className="text-white/25 select-none shrink-0" aria-hidden="true">|</span>

            <div className="min-w-0 max-w-[180px] sm:max-w-[280px] lg:max-w-[360px] flex items-center">
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

        {/* Tier 2: Unified 10-Column Main Editorial Menu Bar (#FFFFFF) */}
        <header className="bg-[#FFFFFF] border-b border-[#E4E2DC]">
          {/* Desktop Unified 10-Column Menu Bar (lg+) — Preserves Primary 1st-Level Font Size */}
          <nav
            className="hidden lg:grid grid-cols-10 divide-x divide-[#E4E2DC] h-20 w-full"
            aria-label="기획서 주요 메뉴"
          >
            {GOGUMA_CHAPTERS.map((ch) => {
              const isCurrent = ch.id === project.currentChapter;
              const isHovered = isMegaMenuOpen && hoveredMenuId === ch.id;

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
                    handleSelectChapter(ch.id);
                    setIsMegaMenuOpen(false);
                  }}
                  className={`relative h-full w-full px-1.5 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-[#000000] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span>{CHAPTER_SHORT_LABELS[ch.id] || ch.title}</span>
                  {isCurrent && !isHovered && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                  )}
                </button>
              );
            })}

            {/* 9th Unified Column: [환경 설정] */}
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
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'settings'
                  ? 'bg-[#000000] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
              }`}
            >
              <span>환경 설정</span>
              {isPreferencesOpen && !(isMegaMenuOpen && hoveredMenuId === 'settings') && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
              )}
            </button>

            {/* 10th Unified Column: [도움말] */}
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
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'help'
                  ? 'bg-[#000000] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
              }`}
            >
              <span>도움말</span>
            </button>
          </nav>

          {/* Tablet / Mobile Compact Header (< lg) */}
          <div className="flex lg:hidden h-20 px-4 sm:px-6 items-center justify-between gap-4">
            <div className="flex items-center flex-1 justify-center min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileChapterDrawerOpen(prev => !prev)}
                className="h-10 px-3.5 rounded-[2px] border border-[#111111] text-[15px] font-bold text-[#000000] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap max-w-[240px]"
              >
                <span className="truncate">{CHAPTER_SHORT_LABELS[currentChapterObj.id] || currentChapterObj.title}</span>
                <ChevronDown size={15} className={`shrink-0 transition-transform ${isMobileChapterDrawerOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Responsive Editor / Preview Toggle (< lg) */}
              <div className="flex items-center bg-[#F6F5F1] p-0.5 rounded-[2px] border border-[#E4E2DC] shrink-0">
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
                className="p-2 rounded-[2px] border border-[#111111] text-[#000000] cursor-pointer"
                aria-label="전체 메뉴 열기"
              >
                {isMobileChapterDrawerOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Full-Width 10-Column Sub-Menu Panel (No Duplicate Header Row) */}
        {isMegaMenuOpen && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-[#FFFFFF] border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-50"
            role="region"
            aria-label="전체 하위 메뉴, 환경 설정 및 도움말"
          >
            <div className="grid grid-cols-10 divide-x divide-[#E4E2DC]">
              {GOGUMA_CHAPTERS.map((ch) => (
                <div
                  key={ch.id}
                  onMouseEnter={() => setHoveredMenuId(ch.id)}
                  className="flex flex-col min-h-[200px] p-2.5 gap-1.5 bg-[#FFFFFF] text-[#000000]"
                >
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
                  {ch.id === 8 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMegaMenuOpen(false);
                        handleOpenExportModal();
                      }}
                      className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[#000000] hover:bg-[#F6F5F1]"
                    >
                      <span className="break-keep">사양서 내보내기</span>
                      <ChevronRight size={13} className="shrink-0 opacity-60" />
                    </button>
                  )}
                </div>
              ))}

              {/* 9th Column Sub-Items: [환경 설정] */}
              <div
                onMouseEnter={() => setHoveredMenuId('settings')}
                className="flex flex-col min-h-[200px] p-2.5 gap-1 bg-[#FFFFFF] text-[#000000]"
              >
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

              {/* 10th Column Sub-Items: [도움말] */}
              <div
                onMouseEnter={() => setHoveredMenuId('help')}
                className="flex flex-col min-h-[200px] p-2.5 gap-1 bg-[#FFFFFF] text-[#000000]"
              >
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
                      {ch.id === 8 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileChapterDrawerOpen(false);
                            handleOpenExportModal();
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-[2px] border cursor-pointer ${
                            isActive
                              ? 'border-white text-[#FFFFFF]'
                              : 'border-[#000000] text-[#000000]'
                          }`}
                        >
                          사양서 내보내기
                        </button>
                      )}
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
