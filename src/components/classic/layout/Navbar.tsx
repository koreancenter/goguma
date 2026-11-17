import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, Check, Menu, X, ChevronRight, User, LayoutGrid
} from 'lucide-react';
import { Language } from '../../../types';
import { GOGUMA_CHAPTERS } from '../../../lib/chapterData';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStudioHeader } from '../../../contexts/StudioHeaderContext';

interface NavbarProps {
  mobilePane?: 'editor' | 'preview';
  onChangeMobilePane?: (pane: 'editor' | 'preview') => void;
}

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

export default function Navbar({ mobilePane, onChangeMobilePane }: NavbarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const {
    projectName,
    currentChapter,
    currentSection,
    formInputs,
    completedChapters,
    currentUser,
    onUpdateProjectName,
    onSelectChapter,
    onSelectSection,
  } = useStudioHeader();

  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [openPageSubmenu, setOpenPageSubmenu] = useState<'settings' | 'help' | null>(null);
  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<number | 'settings' | 'help'>(currentChapter);
  const [isMobileChapterDrawerOpen, setIsMobileChapterDrawerOpen] = useState(false);
  const headerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHoveredMenuId(currentChapter);
  }, [currentChapter]);

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setOpenPageSubmenu(null);
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
  }, [location.pathname, location.search]);

  const navigateFromMenu = (path: string) => {
    setIsMegaMenuOpen(false);
    setOpenPageSubmenu(null);
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
    navigate(path);
  };

  const handleOpenMegaMenu = (menuId: number | 'settings' | 'help') => {
    if (isAppsMenuOpen || isLangMenuOpen) return;
    setHoveredMenuId(menuId);
    setIsMegaMenuOpen(true);
  };

  const handleOpenPageSubmenu = (menuId: 'settings' | 'help') => {
    if (isAppsMenuOpen || isLangMenuOpen) return;
    setOpenPageSubmenu(menuId);
  };

  const handleChapterClick = (chapterId: number) => {
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsMegaMenuOpen(false);
    setOpenPageSubmenu(null);
    setIsMobileChapterDrawerOpen(false);
    onSelectChapter(chapterId);
    if (location.pathname !== '/workspace') {
      navigate('/workspace');
    }
  };

  const handleSectionClick = (chapterId: number, sectionKey: string) => {
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsMegaMenuOpen(false);
    setOpenPageSubmenu(null);
    setIsMobileChapterDrawerOpen(false);
    onSelectChapter(chapterId);
    onSelectSection(sectionKey);
    if (location.pathname !== '/workspace') {
      navigate('/workspace');
    }
  };

  useEffect(() => {
    if (!isMegaMenuOpen && !openPageSubmenu && !isMobileChapterDrawerOpen && !isAppsMenuOpen && !isLangMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (headerWrapperRef.current && !headerWrapperRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setOpenPageSubmenu(null);
        setIsAppsMenuOpen(false);
        setIsLangMenuOpen(false);
        setIsMobileChapterDrawerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setOpenPageSubmenu(null);
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
  }, [isMegaMenuOpen, openPageSubmenu, isMobileChapterDrawerOpen, isAppsMenuOpen, isLangMenuOpen]);

  const isWorkspaceRoute = location.pathname === '/workspace';
  const isBlogRoute = location.pathname === '/blog';
  const isSettingsRoute =
    location.pathname === '/settings' ||
    location.pathname === '/templates' ||
    location.pathname === '/backup';
  const isHelpRoute =
    location.pathname === '/support' ||
    location.pathname === '/dev-notes' ||
    location.pathname === '/privacy' ||
    location.pathname === '/terms' ||
    location.pathname === '/license' ||
    location.pathname === '/ai-policy' ||
    location.pathname === '/community-terms' ||
    location.pathname === '/cookies';

  const currentPageLabel = isBlogRoute
    ? '블로그'
    : isSettingsRoute
    ? '환경 설정'
    : isHelpRoute
    ? '도움말'
    : '메뉴';

  const currentChapterObj = GOGUMA_CHAPTERS.find(c => c.id === currentChapter) || GOGUMA_CHAPTERS[0];

  const SETTINGS_MENU_ITEMS: {
    id: string;
    label: string;
    action: () => void;
  }[] = [
    {
      id: 'engine',
      label: '인공지능 엔진 설정',
      action: () => navigateFromMenu('/settings?tab=engine'),
    },
    {
      id: 'display',
      label: '화면 및 가독성 설정',
      action: () => navigateFromMenu('/settings?tab=display'),
    },
    {
      id: 'templates',
      label: '표준 기획서 템플릿',
      action: () => navigateFromMenu('/templates'),
    },
    {
      id: 'storage',
      label: '보관함 및 로컬 백업',
      action: () => navigateFromMenu('/backup?tab=storage'),
    },
    {
      id: 'account',
      label: '내 계정 및 프로필',
      action: () => navigateFromMenu(currentUser ? '/profile' : '/login'),
    },
    {
      id: 'logout',
      label: currentUser ? '로그아웃' : '로그인',
      action: () => navigateFromMenu(currentUser ? '/logout' : '/login'),
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
      action: () => navigateFromMenu('/landing'),
    },
    {
      id: 'help-guide',
      label: '도움말',
      action: () => navigateFromMenu('/support'),
    },
    {
      id: 'privacy',
      label: '개인정보 취급방침',
      action: () => navigateFromMenu('/privacy'),
    },
    {
      id: 'terms',
      label: '이용약관',
      action: () => navigateFromMenu('/terms'),
    },
    {
      id: 'license',
      label: '오픈소스 라이선스',
      action: () => navigateFromMenu('/license'),
    },
    {
      id: 'ai-policy',
      label: '인공지능 정책',
      action: () => navigateFromMenu('/ai-policy'),
    },
    {
      id: 'community-terms',
      label: '커뮤니티 이용 규약',
      action: () => navigateFromMenu('/community-terms'),
    },
    {
      id: 'cookies',
      label: '쿠키 정책',
      action: () => navigateFromMenu('/cookies'),
    },
    {
      id: 'dev-notes',
      label: '개발자 노트',
      action: () => navigateFromMenu('/dev-notes'),
    },
  ];

  return (
    <div
      ref={headerWrapperRef}
      onMouseLeave={() => {
        setIsMegaMenuOpen(false);
        setOpenPageSubmenu(null);
      }}
      className="sticky top-0 shrink-0 z-40 select-none bg-[#FFFFFF]"
    >
      {/* Tier 1: Editorial Black Utility Strip (#000000) — Unified Across All Pages */}
      <div className="relative z-[60] h-14 bg-[#000000] text-[#FFFFFF] border-b border-white/20 pl-4 sm:pl-6 pr-0 flex items-center justify-between gap-3">
        {/* Left: '고구마' Brand Mark (Yellow Hover Only) + Editable Project Title */}
        <div className="flex items-center gap-3 sm:gap-4 h-full min-w-0">
          <button
            type="button"
            onClick={() => navigateFromMenu('/landing')}
            className="h-full px-3 sm:px-4 -ml-3 sm:-ml-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] bg-[#000000] rounded-none hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap shrink-0"
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

          {isWorkspaceRoute && (
            <>
              <span className="text-white/25 select-none shrink-0" aria-hidden="true">|</span>

              <div className="min-w-0 max-w-[140px] sm:max-w-[240px] lg:max-w-[320px] flex items-center">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => onUpdateProjectName(e.target.value)}
                  className="w-full bg-transparent hover:bg-white/10 focus:bg-[#1A1A18] rounded-none px-2 py-1 text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] truncate border-b border-transparent focus:border-white/60 outline-none transition-colors leading-normal"
                  title="프로젝트 이름 수정"
                  aria-label="프로젝트 이름"
                />
              </div>
            </>
          )}
        </div>

        {/* Tier 1 Right: Rectangular Editorial Utility Strip */}
        <div className="flex items-stretch h-full shrink-0 border-l border-white/20 divide-x divide-white/20">
          {/* 1. [고구마 앱스] */}
          <div className="relative flex items-stretch">
            <button
              type="button"
              onClick={() => {
                setIsAppsMenuOpen(prev => !prev);
                setIsLangMenuOpen(false);
                setIsMegaMenuOpen(false);
                setOpenPageSubmenu(null);
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
                  onClick={() => navigateFromMenu('/workspace')}
                  className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                >
                  고구마 사양서 스튜디오
                </button>
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/templates')}
                  className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                >
                  표준 기획서 템플릿
                </button>
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/backup?tab=storage')}
                  className="w-full px-4 py-3 text-left text-[13px] font-bold text-[#FFFFFF] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer"
                >
                  로컬 데이터 보관함
                </button>
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/landing')}
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
                setOpenPageSubmenu(null);
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
            onClick={() => navigateFromMenu('/create-account')}
            className="hidden sm:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] bg-[#000000] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap"
          >
            로컬 계정 만들기
          </button>

          {/* 4. 로그인 / 로그아웃 */}
          <button
            type="button"
            onClick={() => navigateFromMenu(currentUser ? '/logout' : '/login')}
            className="h-full px-3 sm:px-4 flex items-center text-[13px] sm:text-[14px] font-bold text-[#FFFFFF] bg-[#000000] rounded-none hover:bg-[#DC2626] hover:text-[#FFE600] transition-colors cursor-pointer whitespace-nowrap"
          >
            {currentUser ? '로그아웃' : '로그인'}
          </button>

          {/* 5. 내 계정 아이콘 (Yellow Hover Only) */}
          <button
            type="button"
            onClick={() => navigateFromMenu(currentUser ? '/profile' : '/login')}
            className="h-full px-3.5 sm:px-4 flex items-center justify-center text-[#FFFFFF] bg-[#000000] rounded-none hover:text-[#FFE600] transition-colors cursor-pointer shrink-0"
            aria-label="내 계정"
            title={currentUser?.displayName ? `${currentUser.displayName} (내 계정)` : '내 계정'}
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Tier 2: Workspace 10-Column Menu OR Page-Only Right-Aligned 4-Item Menu (#FFFFFF) */}
      <header className="relative z-30 bg-[#FFFFFF] border-b border-[#E4E2DC]">
        {isWorkspaceRoute ? (
          /* Desktop Unified 10-Column Menu Bar (lg+) — Workspace Only */
          <nav
            className="hidden lg:grid grid-cols-10 divide-x divide-[#E4E2DC] h-20 w-full"
            aria-label="기획서 주요 메뉴"
          >
            {GOGUMA_CHAPTERS.map((ch) => {
              const isCurrent = ch.id === currentChapter;
              const isHovered = isMegaMenuOpen && hoveredMenuId === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onMouseEnter={() => handleOpenMegaMenu(ch.id)}
                  onFocus={() => handleOpenMegaMenu(ch.id)}
                  onClick={() => handleChapterClick(ch.id)}
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
              onClick={() => navigateFromMenu('/settings?tab=engine')}
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'settings'
                  ? 'bg-[#000000] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
              }`}
            >
              <span>환경 설정</span>
              {isSettingsRoute && !(isMegaMenuOpen && hoveredMenuId === 'settings') && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
              )}
            </button>

            {/* 10th Unified Column: [도움말] */}
            <button
              type="button"
              onMouseEnter={() => handleOpenMegaMenu('help')}
              onFocus={() => handleOpenMegaMenu('help')}
              onClick={() => navigateFromMenu('/support')}
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'help'
                  ? 'bg-[#000000] text-[#FFFFFF]'
                  : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
              }`}
            >
              <span>도움말</span>
              {isHelpRoute && !(isMegaMenuOpen && hoveredMenuId === 'help') && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
              )}
            </button>
          </nav>
        ) : (
          /* Desktop Page-Only Right-Aligned 4-Item Menu Bar (lg+) */
          <nav
            className="hidden lg:flex items-stretch justify-end h-20 w-full"
            aria-label="페이지 주요 메뉴"
          >
            <div className="flex items-stretch h-full divide-x divide-[#E4E2DC] border-l border-[#E4E2DC]">
              {/* 1. [블로그] */}
              <button
                type="button"
                onMouseEnter={() => setOpenPageSubmenu(null)}
                onClick={() => navigateFromMenu('/blog')}
                className="relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors duration-150 cursor-pointer"
              >
                <span>블로그</span>
                {isBlogRoute && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                )}
              </button>

              {/* 2. [환경 설정] */}
              <div
                className="relative flex items-stretch h-full"
                onMouseEnter={() => handleOpenPageSubmenu('settings')}
                onMouseLeave={() => setOpenPageSubmenu(prev => (prev === 'settings' ? null : prev))}
              >
                <button
                  type="button"
                  onFocus={() => handleOpenPageSubmenu('settings')}
                  onClick={() => navigateFromMenu('/settings?tab=engine')}
                  className={`relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    openPageSubmenu === 'settings'
                      ? 'bg-[#000000] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span>환경 설정</span>
                  {isSettingsRoute && openPageSubmenu !== 'settings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                  )}
                </button>

                {openPageSubmenu === 'settings' && (
                  <div className="absolute right-0 top-full min-w-[230px] bg-[#FFFFFF] border-x border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40 p-2.5 flex flex-col gap-1">
                    {SETTINGS_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-3 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-2 rounded-[2px] transition-colors cursor-pointer text-[#000000] hover:bg-[#F6F5F1]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. [도움말] */}
              <div
                className="relative flex items-stretch h-full"
                onMouseEnter={() => handleOpenPageSubmenu('help')}
                onMouseLeave={() => setOpenPageSubmenu(prev => (prev === 'help' ? null : prev))}
              >
                <button
                  type="button"
                  onFocus={() => handleOpenPageSubmenu('help')}
                  onClick={() => navigateFromMenu('/support')}
                  className={`relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    openPageSubmenu === 'help'
                      ? 'bg-[#000000] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF]'
                  }`}
                >
                  <span>도움말</span>
                  {isHelpRoute && openPageSubmenu !== 'help' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                  )}
                </button>

                {openPageSubmenu === 'help' && (
                  <div className="absolute right-0 top-full min-w-[240px] bg-[#FFFFFF] border-x border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40 p-2.5 flex flex-col gap-1">
                    {HELP_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-3 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-2 rounded-[2px] transition-colors cursor-pointer text-[#000000] hover:bg-[#F6F5F1]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. [작업실 입장] */}
              <button
                type="button"
                onMouseEnter={() => setOpenPageSubmenu(null)}
                onClick={() => navigateFromMenu('/workspace')}
                className="relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap bg-[#FFFFFF] text-[#111111] hover:bg-[#000000] hover:text-[#FFFFFF] transition-colors duration-150 cursor-pointer"
              >
                <span>작업실 입장</span>
              </button>
            </div>
          </nav>
        )}

        {/* Tablet / Mobile Compact Header (< lg) */}
        <div className="flex lg:hidden h-20 px-4 sm:px-6 items-center justify-between gap-4">
          <div className="flex items-center flex-1 justify-center min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileChapterDrawerOpen(prev => !prev)}
              className="h-10 px-3.5 rounded-[2px] border border-[#111111] text-[15px] font-bold text-[#000000] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap max-w-[240px]"
            >
              <span className="truncate">
                {isWorkspaceRoute
                  ? CHAPTER_SHORT_LABELS[currentChapterObj.id] || currentChapterObj.title
                  : currentPageLabel}
              </span>
              <ChevronDown size={15} className={`shrink-0 transition-transform ${isMobileChapterDrawerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isWorkspaceRoute ? (
              mobilePane && onChangeMobilePane && (
                <div className="flex items-center bg-[#F6F5F1] p-0.5 rounded-[2px] border border-[#E4E2DC] shrink-0">
                  <button
                    type="button"
                    onClick={() => onChangeMobilePane('editor')}
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
                    onClick={() => onChangeMobilePane('preview')}
                    className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                      mobilePane === 'preview'
                        ? 'bg-[#FFFFFF] text-[#000000]'
                        : 'text-[#3F3F3C] hover:text-[#000000]'
                    }`}
                  >
                    미리보기
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => navigateFromMenu('/workspace')}
                className="px-3 py-2 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                작업실 입장
              </button>
            )}

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

      {/* Full-Width 10-Column Sub-Menu Panel (Workspace Only) */}
      {isWorkspaceRoute && isMegaMenuOpen && (
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
                  const isSecCurrent = isWorkspaceRoute && currentChapter === ch.id && currentSection === sec.key;
                  const secEntry = formInputs[`${ch.id}_${sec.key}`];
                  const isSecFilled = Boolean(secEntry?.userRawInput?.trim());

                  return (
                    <button
                      key={sec.key}
                      type="button"
                      onClick={() => handleSectionClick(ch.id, sec.key)}
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
                    onClick={() => navigateFromMenu('/export')}
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

      {/* Mobile & Tablet Drawer (< lg) */}
      {isMobileChapterDrawerOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-[#FFFFFF] border-b border-[#000000] shadow-lg z-50 max-h-[75vh] overflow-y-auto">
          <div className="p-4 border-b border-[#E4E2DC] bg-[#F6F5F1] space-y-4">
            {!isWorkspaceRoute && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/blog')}
                  className="px-3 py-2.5 bg-[#FFFFFF] border border-[#000000] text-xs font-extrabold text-[#000000] flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  블로그
                </button>
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/workspace')}
                  className="px-3 py-2.5 bg-[#000000] border border-[#000000] text-xs font-extrabold text-[#FFFFFF] flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  작업실 입장
                </button>
              </div>
            )}
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

          {isWorkspaceRoute && (
            <div className="divide-y divide-[#E4E2DC]">
            {GOGUMA_CHAPTERS.map((ch) => {
              const isActive = isWorkspaceRoute && ch.id === currentChapter;
              return (
                <div key={ch.id} className={isActive ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'}>
                  <button
                    type="button"
                    onClick={() => handleChapterClick(ch.id)}
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
                        onClick={() => handleSectionClick(ch.id, sec.key)}
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
                        onClick={() => navigateFromMenu('/export')}
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
          )}
        </div>
      )}
    </div>
  );
}
