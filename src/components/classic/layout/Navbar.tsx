import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown, Check, Menu, X, ChevronRight, User, LayoutGrid
} from 'lucide-react';
import { Language } from '../../../types';
import { getChapters } from '../../../lib/chapterData';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useStudioHeader } from '../../../contexts/StudioHeaderContext';

interface NavbarProps {
  mobilePane?: 'editor' | 'preview';
  onChangeMobilePane?: (pane: 'editor' | 'preview') => void;
}

const CHAPTER_SHORT_LABELS_MAP: Record<Language, Record<number, string>> = {
  ko: {
    1: '개요',
    2: '사용자',
    3: '기능',
    4: '데이터',
    5: '디자인',
    6: '화면',
    7: '아키텍처',
    8: '산출물',
  },
  en: {
    1: 'Overview',
    2: 'Users',
    3: 'Features',
    4: 'Data',
    5: 'Design',
    6: 'Screens',
    7: 'Arch',
    8: 'Release',
  },
  ja: {
    1: '概要',
    2: '対象',
    3: '機能',
    4: 'データ',
    5: 'デザイン',
    6: '画面',
    7: '構成',
    8: '成果物',
  },
  id: {
    1: 'Ikhtisar',
    2: 'Target',
    3: 'Fitur',
    4: 'Data',
    5: 'Desain',
    6: 'Layar',
    7: 'Sistem',
    8: 'Rilis',
  },
};

export default function Navbar({ mobilePane, onChangeMobilePane }: NavbarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, pick } = useLanguage();
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

  const chapters = getChapters(language);
  const shortLabels = CHAPTER_SHORT_LABELS_MAP[language] || CHAPTER_SHORT_LABELS_MAP.en;

  const GOGUMA_APPS_LINKS: { label: string; url: string }[] = [
    { label: 'K-Design.md', url: 'https://kdesign.koreancenter.net' },
    { label: pick({ ko: '디지털 명함', en: 'Digital Card', ja: 'デジタル名刺', id: 'Kartu Digital' }), url: 'https://eerum.goguma.app' },
    { label: 'AI Podium', url: 'https://aipodium.net' },
    { label: pick({ ko: 'AI 슬라이드', en: 'AI Slides', ja: 'AI スライド', id: 'AI Slide' }), url: 'https://vibeslide.goguma.app' },
    { label: pick({ ko: 'AI 자산관리', en: 'AI Asset Vault', ja: 'AI 資産管理', id: 'AI Manajemen Aset' }), url: 'https://vibevault.goguma.app' },
    { label: pick({ ko: 'AI 일정관리', en: 'AI Calendar', ja: 'AI 日程管理', id: 'AI Jadwal' }), url: 'https://vibecalendar.goguma.app' },
  ];

  const currentPageLabel = isBlogRoute
    ? pick({ ko: '블로그', en: 'Blog', ja: 'ブログ', id: 'Blog' })
    : isSettingsRoute
    ? pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Pengaturan' })
    : isHelpRoute
    ? pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })
    : pick({ ko: '메뉴', en: 'Menu', ja: 'メニュー', id: 'Menu' });

  const currentChapterObj = chapters.find(c => c.id === currentChapter) || chapters[0];

  const SETTINGS_MENU_ITEMS: {
    id: string;
    label: string;
    action: () => void;
  }[] = [
    {
      id: 'engine',
      label: pick({ ko: '인공지능 엔진 설정', en: 'AI Engine Settings', ja: 'AIエンジン設定', id: 'Pengaturan Mesin AI' }),
      action: () => navigateFromMenu('/settings?tab=engine'),
    },
    {
      id: 'display',
      label: pick({ ko: '화면 · 테마 · 가독성', en: 'Display · Theme · Language', ja: '画面・テーマ・言語', id: 'Tampilan · Tema · Bahasa' }),
      action: () => navigateFromMenu('/settings?tab=display'),
    },
    {
      id: 'templates',
      label: pick({ ko: '표준 기획서 템플릿', en: 'Standard Templates', ja: '標準テンプレート', id: 'Templat Standar' }),
      action: () => navigateFromMenu('/templates'),
    },
    {
      id: 'storage',
      label: pick({ ko: '보관함 및 로컬 백업', en: 'Library & Local Backup', ja: '保管庫・ローカルBackup', id: 'Pustaka & Cadangan Lokal' }),
      action: () => navigateFromMenu('/backup?tab=storage'),
    },
    {
      id: 'account',
      label: pick({ ko: '내 계정 및 프로필', en: 'Account & Profile', ja: 'アカウント・プロフィール', id: 'Akun & Profil' }),
      action: () => navigateFromMenu(currentUser ? '/profile' : '/login'),
    },
    {
      id: 'logout',
      label: currentUser
        ? pick({ ko: '로그아웃', en: 'Sign Out', ja: 'ログアウト', id: 'Keluar' })
        : pick({ ko: '로그인', en: 'Sign In', ja: 'ログイン', id: 'Masuk' }),
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
      label: pick({ ko: '스튜디오 안내', en: 'Studio Guide', ja: 'スタジオ案内', id: 'Panduan Studio' }),
      action: () => navigateFromMenu('/landing'),
    },
    {
      id: 'help-guide',
      label: pick({ ko: '도움말', en: 'Help & Support', ja: 'ヘルプ・サポート', id: 'Bantuan' }),
      action: () => navigateFromMenu('/support'),
    },
    {
      id: 'privacy',
      label: pick({ ko: '개인정보 취급방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', id: 'Kebijakan Privasi' }),
      action: () => navigateFromMenu('/privacy'),
    },
    {
      id: 'terms',
      label: pick({ ko: '이용약관', en: 'Terms of Service', ja: '利用規約', id: 'Ketentuan Layanan' }),
      action: () => navigateFromMenu('/terms'),
    },
    {
      id: 'license',
      label: pick({ ko: '오픈소스 라이선스', en: 'Open Source License', ja: 'OSSライセンス', id: 'Lisensi Open Source' }),
      action: () => navigateFromMenu('/license'),
    },
    {
      id: 'ai-policy',
      label: pick({ ko: '인공지능 정책', en: 'AI Policy', ja: 'AIポリシー', id: 'Kebijakan AI' }),
      action: () => navigateFromMenu('/ai-policy'),
    },
    {
      id: 'community-terms',
      label: pick({ ko: '커뮤니티 이용 규약', en: 'Community Guidelines', ja: 'コミュニティ規約', id: 'Pedoman Komunitas' }),
      action: () => navigateFromMenu('/community-terms'),
    },
    {
      id: 'cookies',
      label: pick({ ko: '쿠키 정책', en: 'Cookie Policy', ja: 'Cookieポリシー', id: 'Kebijakan Cookie' }),
      action: () => navigateFromMenu('/cookies'),
    },
    {
      id: 'dev-notes',
      label: pick({ ko: '개발자 노트', en: 'Developer Notes', ja: '開発ノート', id: 'Catatan Pengembang' }),
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
      className="no-print sticky top-0 shrink-0 z-40 select-none bg-[var(--theme-canvas)]"
    >
      {/* Tier 1: Editorial Utility Strip */}
      <div className="relative z-[60] h-14 bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] border-b border-[var(--theme-border-hairline)]/40 pl-4 sm:pl-6 pr-0 flex items-center justify-between gap-3">
        {/* Left: Brand Mark + Editable Project Title */}
        <div className="flex items-center gap-3 sm:gap-4 h-full min-w-0">
          <button
            type="button"
            onClick={() => navigateFromMenu('/landing')}
            className="h-full px-3 sm:px-4 -ml-3 sm:-ml-4 flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:text-[var(--theme-bar-accent)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title={pick({ ko: '고구마 스튜디오 홈으로 이동', en: 'Go to GOGUMA Studio Home', ja: 'GOGUMAスタジオホームへ', id: 'Ke Beranda GOGUMA Studio' })}
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
              <path d="M14.5 7.5C15.2 6.3 16.3 5.6 17.5 5.5" stroke="var(--theme-bar-accent)" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
            <span className="leading-none">
              {pick({ ko: '고구마', en: 'GOGUMA', ja: 'GOGUMA', id: 'GOGUMA' })}
            </span>
          </button>

          {isWorkspaceRoute && (
            <>
              <span className="opacity-25 select-none shrink-0" aria-hidden="true">|</span>

              <div className="min-w-0 max-w-[140px] sm:max-w-[240px] lg:max-w-[320px] flex items-center">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => onUpdateProjectName(e.target.value)}
                  className="w-full bg-transparent hover:bg-white/10 focus:bg-white/15 rounded-none px-2 py-1 text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] truncate border-b border-transparent focus:border-[var(--theme-bar-accent)] outline-none transition-colors leading-normal"
                  title={pick({ ko: '프로젝트 이름 수정', en: 'Edit project name', ja: 'プロジェクト名を編集', id: 'Edit nama proyek' })}
                  aria-label={pick({ ko: '프로젝트 이름', en: 'Project name', ja: 'プロジェクト名', id: 'Nama proyek' })}
                />
              </div>
            </>
          )}
        </div>

        {/* Tier 1 Right: Rectangular Editorial Utility Strip */}
        <div className="flex items-stretch h-full shrink-0 border-l border-white/20 divide-x divide-white/20">
          {/* 1. [GOGUMA Apps] */}
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
                  ? 'bg-[var(--theme-hover-bg)] text-[var(--theme-hover-text)]'
                  : 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`}
            >
              <LayoutGrid size={15} className="shrink-0" />
              <span>{pick({ ko: '고구마 앱스', en: 'GOGUMA Apps', ja: 'GOGUMA Apps', id: 'Aplikasi GOGUMA' })}</span>
            </button>

            {isAppsMenuOpen && (
              <div className="absolute right-0 top-full w-56 bg-[var(--theme-bar-bg)] border border-white/25 z-[70] rounded-none divide-y divide-white/15 shadow-xl">
                {GOGUMA_APPS_LINKS.map((app) => (
                  <a
                    key={app.url}
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsAppsMenuOpen(false)}
                    className="block w-full px-4 py-3 text-left text-[13px] font-bold text-[var(--theme-bar-text)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {app.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* 2. Language selector */}
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
                  ? 'bg-[var(--theme-hover-bg)] text-[var(--theme-hover-text)]'
                  : 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`}
              aria-label={pick({ ko: '언어 선택', en: 'Select language', ja: '言語選択', id: 'Pilih bahasa' })}
            >
              <span className="tracking-tight">
                {language === 'ko' ? '한' : language === 'en' ? 'EN' : language === 'ja' ? '日' : 'ID'}
              </span>
              <ChevronDown size={13} className="shrink-0" />
            </button>

            {isLangMenuOpen && (
              <div className="absolute right-0 top-full w-40 bg-[var(--theme-bar-bg)] border border-white/25 z-[70] rounded-none divide-y divide-white/15 shadow-xl">
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
                        ? 'bg-white/10 text-[var(--theme-bar-accent)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
                        : 'text-[var(--theme-bar-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {language === opt.code && <Check size={13} className="shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Create Local Account */}
          {(!currentUser || currentUser.isAnonymous) && (
            <button
              type="button"
              onClick={() => navigateFromMenu('/create-account')}
              className="hidden sm:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentUser?.isAnonymous
                ? pick({ ko: '정식 프로필 등록', en: 'Register Profile', ja: '本登録', id: 'Daftar Profil' })
                : pick({ ko: '로컬 계정 만들기', en: 'Create Account', ja: 'ローカル作成', id: 'Buat Akun Lokal' })}
            </button>
          )}

          {/* 4. Sign In / Sign Out */}
          <button
            type="button"
            onClick={() => navigateFromMenu(currentUser ? '/logout' : '/login')}
            className="h-full px-3 sm:px-4 flex items-center text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
          >
            {currentUser
              ? pick({ ko: '로그아웃', en: 'Sign Out', ja: 'ログアウト', id: 'Keluar' })
              : pick({ ko: '로그인', en: 'Sign In', ja: 'ログイン', id: 'Masuk' })}
          </button>

          {/* 5. Account Icon */}
          <button
            type="button"
            onClick={() => navigateFromMenu(currentUser ? '/profile' : '/login')}
            className="h-full px-3.5 sm:px-4 flex items-center justify-center text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:text-[var(--theme-bar-accent)] transition-colors cursor-pointer shrink-0"
            aria-label={pick({ ko: '내 계정', en: 'My Account', ja: 'マイアカウント', id: 'Akun Saya' })}
            title={
              currentUser?.displayName
                ? `${currentUser.displayName} (${pick({ ko: '내 계정', en: 'My Account', ja: 'マイアカウント', id: 'Akun Saya' })})`
                : pick({ ko: '내 계정', en: 'My Account', ja: 'マイアカウント', id: 'Akun Saya' })
            }
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Tier 2: Workspace 10-Column Menu OR Page-Only Right-Aligned 4-Item Menu */}
      <header className="relative z-30 bg-[var(--theme-canvas)] border-b border-[var(--theme-border-hairline)]">
        {isWorkspaceRoute ? (
          <nav
            className="hidden lg:grid grid-cols-10 divide-x divide-[var(--theme-border-hairline)] h-20 w-full"
            aria-label={pick({ ko: '기획서 주요 메뉴', en: 'Specification Navigation', ja: '仕様書メインメニュー', id: 'Navigasi Spesifikasi' })}
          >
            {chapters.map((ch) => {
              const isCurrent = ch.id === currentChapter;
              const isHovered = isMegaMenuOpen && hoveredMenuId === ch.id;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onMouseEnter={() => handleOpenMegaMenu(ch.id)}
                  onFocus={() => handleOpenMegaMenu(ch.id)}
                  onClick={() => handleChapterClick(ch.id)}
                  className={`relative h-full w-full px-1.5 flex items-center justify-center text-center ${
                    language === 'ko' || language === 'ja'
                      ? 'text-[17px] xl:text-[20px] 2xl:text-[23px]'
                      : 'text-[14px] xl:text-[16px] 2xl:text-[18px]'
                  } font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                    isHovered
                      ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]'
                  }`}
                >
                  <span>{shortLabels[ch.id] || ch.title}</span>
                  {isCurrent && !isHovered && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                  )}
                </button>
              );
            })}

            {/* 9th Unified Column: [Settings] */}
            <button
              type="button"
              onMouseEnter={() => handleOpenMegaMenu('settings')}
              onFocus={() => handleOpenMegaMenu('settings')}
              onClick={() => navigateFromMenu('/settings?tab=engine')}
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center ${
                language === 'ko' || language === 'ja'
                  ? 'text-[17px] xl:text-[20px] 2xl:text-[23px]'
                  : 'text-[14px] xl:text-[16px] 2xl:text-[18px]'
              } font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'settings'
                  ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                  : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]'
              }`}
            >
              <span>{pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Setelan' })}</span>
              {isSettingsRoute && !(isMegaMenuOpen && hoveredMenuId === 'settings') && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
              )}
            </button>

            {/* 10th Unified Column: [Help] */}
            <button
              type="button"
              onMouseEnter={() => handleOpenMegaMenu('help')}
              onFocus={() => handleOpenMegaMenu('help')}
              onClick={() => navigateFromMenu('/support')}
              className={`relative h-full w-full px-1.5 flex items-center justify-center text-center ${
                language === 'ko' || language === 'ja'
                  ? 'text-[17px] xl:text-[20px] 2xl:text-[23px]'
                  : 'text-[14px] xl:text-[16px] 2xl:text-[18px]'
              } font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isMegaMenuOpen && hoveredMenuId === 'help'
                  ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                  : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]'
              }`}
            >
              <span>{pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })}</span>
              {isHelpRoute && !(isMegaMenuOpen && hoveredMenuId === 'help') && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
              )}
            </button>
          </nav>
        ) : (
          <nav
            className="hidden lg:flex items-stretch justify-end h-20 w-full"
            aria-label={pick({ ko: '페이지 주요 메뉴', en: 'Page Navigation', ja: 'ページメニュー', id: 'Navigasi Halaman' })}
          >
            <div className="flex items-stretch h-full divide-x divide-[var(--theme-border-hairline)] border-l border-[var(--theme-border-hairline)]">
              {/* 1. [Blog] */}
              <button
                type="button"
                onMouseEnter={() => setOpenPageSubmenu(null)}
                onClick={() => navigateFromMenu('/blog')}
                className="relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] transition-colors duration-150 cursor-pointer"
              >
                <span>{pick({ ko: '블로그', en: 'Blog', ja: 'ブログ', id: 'Blog' })}</span>
                {isBlogRoute && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                )}
              </button>

              {/* 2. [Settings] */}
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
                      ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]'
                  }`}
                >
                  <span>{pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Pengaturan' })}</span>
                  {isSettingsRoute && openPageSubmenu !== 'settings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                  )}
                </button>

                {openPageSubmenu === 'settings' && (
                  <div className="absolute right-0 top-full min-w-[230px] bg-[var(--theme-elevated)] border-x border-b border-[var(--theme-ink-strong)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40 p-2.5 flex flex-col gap-1">
                    {SETTINGS_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-3 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-2 rounded-[2px] transition-colors cursor-pointer text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. [Help] */}
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
                      ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]'
                  }`}
                >
                  <span>{pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })}</span>
                  {isHelpRoute && openPageSubmenu !== 'help' && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                  )}
                </button>

                {openPageSubmenu === 'help' && (
                  <div className="absolute right-0 top-full min-w-[240px] bg-[var(--theme-elevated)] border-x border-b border-[var(--theme-ink-strong)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40 p-2.5 flex flex-col gap-1">
                    {HELP_MENU_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={item.action}
                        className="w-full px-3 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-2 rounded-[2px] transition-colors cursor-pointer text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]"
                      >
                        <span className="break-keep">{item.label}</span>
                        <ChevronRight size={13} className="shrink-0 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. [Enter Workspace] */}
              <button
                type="button"
                onMouseEnter={() => setOpenPageSubmenu(null)}
                onClick={() => navigateFromMenu('/workspace')}
                className="relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] transition-colors duration-150 cursor-pointer"
              >
                <span>{pick({ ko: '작업실 입장', en: 'Workspace', ja: 'スタジオへ', id: 'Ruang Kerja' })}</span>
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
              className="h-10 px-3.5 rounded-[2px] border border-[var(--theme-ink-primary)] text-[15px] font-bold text-[var(--theme-ink-strong)] flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap max-w-[240px]"
            >
              <span className="truncate">
                {isWorkspaceRoute
                  ? shortLabels[currentChapterObj.id] || currentChapterObj.title
                  : currentPageLabel}
              </span>
              <ChevronDown size={15} className={`shrink-0 transition-transform ${isMobileChapterDrawerOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isWorkspaceRoute ? (
              mobilePane && onChangeMobilePane && (
                <div className="flex items-center bg-[var(--theme-stage)] p-0.5 rounded-[2px] border border-[var(--theme-border-hairline)] shrink-0">
                  <button
                    type="button"
                    onClick={() => onChangeMobilePane('editor')}
                    className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                      mobilePane === 'editor'
                        ? 'bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]'
                        : 'text-[var(--theme-ink-body)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    {pick({ ko: '에디터', en: 'Editor', ja: 'エディタ', id: 'Editor' })}
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeMobilePane('preview')}
                    className={`px-2.5 py-1.5 rounded-[2px] text-xs font-bold transition-colors cursor-pointer ${
                      mobilePane === 'preview'
                        ? 'bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]'
                        : 'text-[var(--theme-ink-body)] hover:text-[var(--theme-ink-strong)]'
                    }`}
                  >
                    {pick({ ko: '미리보기', en: 'Preview', ja: 'プレビュー', id: 'Pratinjau' })}
                  </button>
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => navigateFromMenu('/workspace')}
                className="px-3 py-2 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                {pick({ ko: '작업실 입장', en: 'Workspace', ja: 'スタジオへ', id: 'Ruang Kerja' })}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileChapterDrawerOpen(prev => !prev)}
              className="p-2 rounded-[2px] border border-[var(--theme-ink-primary)] text-[var(--theme-ink-strong)] cursor-pointer"
              aria-label={pick({ ko: '전체 메뉴 열기', en: 'Toggle menu', ja: 'メニューを開く', id: 'Buka menu' })}
            >
              {isMobileChapterDrawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Width 10-Column Sub-Menu Panel (Workspace Only) */}
      {isWorkspaceRoute && isMegaMenuOpen && (
        <div
          className="hidden lg:block absolute left-0 right-0 top-full bg-[var(--theme-elevated)] border-b border-[var(--theme-ink-strong)] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-40"
          role="region"
          aria-label={pick({ ko: '전체 하위 메뉴, 환경 설정 및 도움말', en: 'Sub-menu, Settings & Help', ja: 'サブメニュー・設定・ヘルプ', id: 'Sub-menu, Pengaturan & Bantuan' })}
        >
          <div className="grid grid-cols-10 divide-x divide-[var(--theme-border-hairline)]">
            {chapters.map((ch) => (
              <div
                key={ch.id}
                onMouseEnter={() => setHoveredMenuId(ch.id)}
                className="flex flex-col min-h-[200px] p-2.5 gap-1.5 bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]"
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
                          ? 'bg-[var(--theme-stage)] text-[var(--theme-ink-strong)] font-bold'
                          : 'text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                      }`}
                    >
                      <span className="break-keep">{sec.title}</span>
                      {isSecFilled ? (
                        <Check size={13} className="shrink-0 mt-0.5 text-[var(--theme-success)]" />
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
                    className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]"
                  >
                    <span className="break-keep">{pick({ ko: '사양서 내보내기', en: 'Export Spec', ja: '仕様書エクスポート', id: 'Ekspor Spesifikasi' })}</span>
                    <ChevronRight size={13} className="shrink-0 opacity-60" />
                  </button>
                )}
              </div>
            ))}

            {/* 9th Column Sub-Items: [Settings] */}
            <div
              onMouseEnter={() => setHoveredMenuId('settings')}
              className="flex flex-col min-h-[200px] p-2.5 gap-1 bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]"
            >
              {SETTINGS_MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]"
                >
                  <span className="break-keep">{item.label}</span>
                  <ChevronRight size={13} className="shrink-0 opacity-60" />
                </button>
              ))}
            </div>

            {/* 10th Column Sub-Items: [Help] */}
            <div
              onMouseEnter={() => setHoveredMenuId('help')}
              className="flex flex-col min-h-[200px] p-2.5 gap-1 bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]"
            >
              {HELP_MENU_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="w-full px-2 py-2 text-left text-[13px] xl:text-[14px] font-semibold leading-snug flex items-center justify-between gap-1.5 rounded-[2px] transition-colors cursor-pointer text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]"
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
        <div className="lg:hidden absolute left-0 right-0 top-full bg-[var(--theme-elevated)] border-b border-[var(--theme-ink-strong)] shadow-lg z-50 max-h-[75vh] overflow-y-auto">
          <div className="p-4 border-b border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] space-y-4">
            {!isWorkspaceRoute && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/blog')}
                  className="px-3 py-2.5 bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] text-xs font-extrabold text-[var(--theme-ink-strong)] flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  {pick({ ko: '블로그', en: 'Blog', ja: 'ブログ', id: 'Blog' })}
                </button>
                <button
                  type="button"
                  onClick={() => navigateFromMenu('/workspace')}
                  className="px-3 py-2.5 bg-[var(--theme-btn-bg)] border border-[var(--theme-ink-strong)] text-xs font-extrabold text-[var(--theme-btn-text)] flex items-center justify-center rounded-[2px] cursor-pointer"
                >
                  {pick({ ko: '작업실 입장', en: 'Workspace', ja: 'スタジオへ', id: 'Ruang Kerja' })}
                </button>
              </div>
            )}
            <div>
              <div className="text-xs font-extrabold text-[var(--theme-ink-strong)] mb-2">{pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Pengaturan' })}</div>
              <div className="grid grid-cols-2 gap-2">
                {SETTINGS_MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="px-3 py-2.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] text-xs font-bold text-[var(--theme-ink-strong)] flex items-center rounded-[2px] cursor-pointer text-left"
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-extrabold text-[var(--theme-ink-strong)] mb-2">{pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })}</div>
              <div className="grid grid-cols-2 gap-2">
                {HELP_MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="px-3 py-2.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] text-xs font-bold text-[var(--theme-ink-strong)] flex items-center rounded-[2px] cursor-pointer text-left"
                  >
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isWorkspaceRoute && (
            <div className="divide-y divide-[var(--theme-border-hairline)]">
            {chapters.map((ch) => {
              const isActive = isWorkspaceRoute && ch.id === currentChapter;
              return (
                <div key={ch.id} className={isActive ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]' : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)]'}>
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
                            ? 'border-current/40 text-current'
                            : 'border-[var(--theme-border-strong)] text-[var(--theme-ink-strong)]'
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
                            ? 'border-current text-current'
                            : 'border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)]'
                        }`}
                      >
                        {pick({ ko: '사양서 내보내기', en: 'Export Spec', ja: '仕様書出力', id: 'Ekspor Spesifikasi' })}
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
