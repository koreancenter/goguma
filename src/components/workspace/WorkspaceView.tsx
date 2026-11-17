import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown, Check, Menu, X, ChevronRight, User, LayoutGrid
} from 'lucide-react';

import { ProjectEntity, FormInputEntity, DomainBusinessRule, SitePlan, Language } from '../../types';
import { auth, LocalUser } from '../../lib/localAuth';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { language, setLanguage } = useLanguage();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupModalTab, setBackupModalTab] = useState<'export' | 'import' | 'storage'>('export');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferencesTab, setPreferencesTab] = useState<PreferencesTab>('engine');
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountEmail, setNewAccountEmail] = useState('');
  const [newAccountTeam, setNewAccountTeam] = useState('');
  const [newAccountPin, setNewAccountPin] = useState('');
  const [createAccountError, setCreateAccountError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
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
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
  };

  const handleOpenMegaMenu = (menuId: number | 'settings' | 'help') => {
    if (isAppsMenuOpen || isLangMenuOpen) return;
    setHoveredMenuId(menuId);
    setIsMegaMenuOpen(true);
  };

  useEffect(() => {
    if (!isMegaMenuOpen && !isMobileChapterDrawerOpen && !isAppsMenuOpen && !isLangMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerWrapperRef.current && !headerWrapperRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsAppsMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsAppsMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMegaMenuOpen, isMobileChapterDrawerOpen, isAppsMenuOpen, isLangMenuOpen]);

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
        {/* Tier 1: Editorial Black Utility Strip (#000000) — Unified Editorial Scale + Sharp Rectangular Actions */}
        <div className="relative z-[60] h-14 bg-[#000000] text-[#FFFFFF] border-b border-white/20 pl-4 sm:pl-6 pr-0 flex items-center justify-between gap-3">
          {/* Left: '고구마' Brand Mark + Editable Project Title */}
          <div className="flex items-center gap-3 sm:gap-4 h-full min-w-0">
            <button
              type="button"
              onClick={() => navigate('/landing')}
              className="h-full px-3 sm:px-4 -ml-3 sm:-ml-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              title="고구마 스튜디오 홈으로 이동"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.75" />
                <path
                  d="M7.5 14.5C7.5 11.2 10.6 7.5 14.8 7.5C16.2 7.5 17 8.4 17 9.8C17 13.4 13.7 16.5 9.8 16.5C8.3 16.5 7.5 15.7 7.5 14.5Z"
                  fill="currentColor"
                />
                <path d="M14.5 7.5C15.2 6.3 16.3 5.6 17.5 5.5" stroke="#FFE600" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
              <span className="leading-none">
                고구마
              </span>
            </button>

            <span className="text-white/25 select-none shrink-0" aria-hidden="true">|</span>

            <div className="min-w-0 max-w-[140px] sm:max-w-[240px] lg:max-w-[320px] flex items-center">
              <input
                type="text"
                value={project.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setProject(prev => ({ ...prev, name: newName }));
                  setPlan(prev => ({ ...prev, metadata: { ...prev.metadata, projectName: newName, title: newName } }));
                  schedulePersistence();
                }}
                className="w-full bg-transparent hover:bg-white/10 focus:bg-[#1A1A18] rounded-none px-2 py-1 text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] truncate border-b border-transparent focus:border-white/60 outline-none transition-colors leading-normal"
                title="프로젝트 이름 수정"
                aria-label="프로젝트 이름"
              />
            </div>
          </div>

          {/* Tier 1 Right: Rectangular Editorial Utility Strip (Red Bg / Yellow Text Hover) */}
          <div className="flex items-stretch h-full shrink-0 border-l border-white/20 divide-x divide-white/20">
            {/* 1. [고구마 앱스] */}
            <div className="relative flex items-stretch">
              <button
                type="button"
                onClick={() => {
                  setIsAppsMenuOpen(prev => !prev);
                  setIsLangMenuOpen(false);
                  setIsMegaMenuOpen(false);
                }}
                className={`h-full px-3 sm:px-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap ${
                  isAppsMenuOpen
                    ? 'bg-[#DC2626] text-[#FFE600]'
                    : 'bg-[#000000] text-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600]'
                }`}
              >
                <LayoutGrid size={15} className="shrink-0" />
                <span>고구마 앱스</span>
              </button>

              {isAppsMenuOpen && (
                <div className="absolute right-0 top-full w-56 bg-[#000000] border border-white/25 z-[70] rounded-none divide-y divide-white/15 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAppsMenuOpen(false);
                      navigate('/workspace');
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                  >
                    고구마 사양서 스튜디오
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAppsMenuOpen(false);
                      setIsTemplateModalOpen(true);
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                  >
                    표준 기획서 템플릿
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAppsMenuOpen(false);
                      setBackupModalTab('storage');
                      setIsBackupModalOpen(true);
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                  >
                    로컬 데이터 보관함
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAppsMenuOpen(false);
                      navigate('/landing');
                    }}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                  >
                    스튜디오 안내 홈
                  </button>
                </div>
              )}
            </div>

            {/* 2. 언어 선택 버튼 (한/영/일/인니) */}
            <div className="relative flex items-stretch">
              <button
                type="button"
                onClick={() => {
                  setIsLangMenuOpen(prev => !prev);
                  setIsAppsMenuOpen(false);
                  setIsMegaMenuOpen(false);
                }}
                className={`h-full px-3 sm:px-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap ${
                  isLangMenuOpen
                    ? 'bg-[#DC2626] text-[#FFE600]'
                    : 'bg-[#000000] text-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600]'
                }`}
                aria-label="언어 선택"
              >
                <span className="tracking-tight">
                  {language === 'ko' ? '한' : language === 'en' ? '영' : language === 'ja' ? '일' : '인니'}
                </span>
                <ChevronDown size={13} className="shrink-0" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 top-full w-40 bg-[#000000] border border-white/25 z-[70] rounded-none divide-y divide-white/15 shadow-xl">
                  {(
                    [
                      { code: 'ko', label: '한국어' },
                      { code: 'en', label: 'English' },
                      { code: 'ja', label: '日本語' },
                      { code: 'id', label: 'Indonesia' },
                    ] as { code: Language; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => {
                        setLanguage(opt.code);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-[13px] font-bold rounded-none flex items-center justify-between transition-colors cursor-pointer ${
                        language === opt.code
                          ? 'bg-[#1A1A18] text-[#FFE600] hover:bg-[#DC2626] hover:text-[#FFE600]'
                          : 'text-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600]'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {language === opt.code && <Check size={13} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. 로컬 계정 만들기 */}
            <button
              type="button"
              onClick={() => {
                setIsAppsMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsMegaMenuOpen(false);
                setCreateAccountError('');
                setIsCreateAccountModalOpen(true);
              }}
              className="hidden sm:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] bg-[#000000] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap"
            >
              로컬 계정 만들기
            </button>

            {/* 4. 로그인 / 로그아웃 */}
            <button
              type="button"
              onClick={() => {
                setIsAppsMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsMegaMenuOpen(false);
                if (currentUser) {
                  onOpenLogoutModal();
                } else {
                  navigate('/login');
                }
              }}
              className="h-full px-3 sm:px-4 flex items-center text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] bg-[#000000] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentUser ? '로그아웃' : '로그인'}
            </button>

            {/* 5. 내 계정 아이콘 */}
            <button
              type="button"
              onClick={() => {
                setIsAppsMenuOpen(false);
                setIsLangMenuOpen(false);
                setIsMegaMenuOpen(false);
                navigate('/profile');
              }}
              className="h-full px-3.5 sm:px-4 flex items-center justify-center text-[#FFFFFF] bg-[#000000] rounded-none hover:text-[#FFE600] transition-colors cursor-pointer shrink-0"
              aria-label="내 계정"
              title={currentUser?.displayName ? `${currentUser.displayName} (내 계정)` : '내 계정'}
            >
              <User size={18} />
            </button>
          </div>
        </div>

        {/* Tier 2: Unified 10-Column Main Editorial Menu Bar (#FFFFFF) */}
        <header className="relative z-30 bg-[#FFFFFF] border-b border-[#E4E2DC]">
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
                  onMouseEnter={() => handleOpenMegaMenu(ch.id)}
                  onFocus={() => handleOpenMegaMenu(ch.id)}
                  onClick={() => {
                    setIsAppsMenuOpen(false);
                    setIsLangMenuOpen(false);
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
              onMouseEnter={() => handleOpenMegaMenu('settings')}
              onFocus={() => handleOpenMegaMenu('settings')}
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
              onMouseEnter={() => handleOpenMegaMenu('help')}
              onFocus={() => handleOpenMegaMenu('help')}
              onClick={() => {
                setIsAppsMenuOpen(false);
                setIsLangMenuOpen(false);
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
            className="hidden lg:block absolute left-0 right-0 top-full bg-[#FFFFFF] border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40"
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

      {isCreateAccountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#FFFFFF] border border-[#000000] rounded-none shadow-2xl">
            <div className="px-6 py-4 bg-[#000000] text-[#FFFFFF] flex items-center justify-between">
              <h2 className="text-base font-extrabold tracking-tight">로컬 계정 만들기</h2>
              <button
                type="button"
                onClick={() => setIsCreateAccountModalOpen(false)}
                className="p-1.5 rounded-none text-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                aria-label="닫기"
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newAccountName.trim()) {
                  setCreateAccountError('계정 이름(작업자명)을 입력해 주세요.');
                  return;
                }
                setIsCreatingAccount(true);
                setCreateAccountError('');
                try {
                  await auth.signInLocal({
                    displayName: newAccountName.trim(),
                    email: newAccountEmail.trim() || undefined,
                    companyName: newAccountTeam.trim() || undefined,
                    pin: newAccountPin.trim() || undefined,
                    rememberMe: true,
                    role: 'ADMIN',
                  });
                  setNewAccountName('');
                  setNewAccountEmail('');
                  setNewAccountTeam('');
                  setNewAccountPin('');
                  setIsCreateAccountModalOpen(false);
                } catch (err: any) {
                  setCreateAccountError(err?.message || '로컬 계정 생성에 실패했습니다.');
                } finally {
                  setIsCreatingAccount(false);
                }
              }}
              className="p-6 space-y-4"
            >
              <p className="text-xs text-[#52524E] leading-relaxed">
                브라우저 로컬 저장소에만 보관되는 독립 계정을 생성하고 즉시 전환합니다.
              </p>

              {createAccountError && (
                <div className="p-3 bg-[#FEF2F2] border border-[#DC2626] text-xs font-bold text-[#DC2626] rounded-none">
                  {createAccountError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#000000]">이름 / 닉네임 *</label>
                <input
                  type="text"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  placeholder="예: 홍길동 디렉터"
                  className="w-full px-3 py-2 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-sm outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#000000]">이메일 (선택)</label>
                <input
                  type="email"
                  value={newAccountEmail}
                  onChange={(e) => setNewAccountEmail(e.target.value)}
                  placeholder="director@studio.local"
                  className="w-full px-3 py-2 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#000000]">소속 / 팀명 (선택)</label>
                  <input
                    type="text"
                    value={newAccountTeam}
                    onChange={(e) => setNewAccountTeam(e.target.value)}
                    placeholder="Goguma Studio"
                    className="w-full px-3 py-2 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#000000]">보안 PIN (선택)</label>
                  <input
                    type="password"
                    value={newAccountPin}
                    onChange={(e) => setNewAccountPin(e.target.value)}
                    placeholder="4자리 숫자"
                    maxLength={8}
                    className="w-full px-3 py-2 border border-[#CBC8BF] focus:border-[#000000] rounded-none text-sm outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateAccountModalOpen(false)}
                  className="px-4 py-2 border border-[#CBC8BF] text-xs font-bold text-[#000000] rounded-none hover:bg-[#F6F5F1] cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAccount}
                  className="px-5 py-2 bg-[#000000] text-[#FFFFFF] text-xs font-bold rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCreatingAccount ? '생성 중...' : '로컬 계정 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
