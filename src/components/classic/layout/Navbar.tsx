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
    8: '로드맵',
    9: '산출물',
  },
  en: {
    1: 'Overview',
    2: 'Users',
    3: 'Features',
    4: 'Data',
    5: 'Design',
    6: 'Screens',
    7: 'Arch',
    8: 'Roadmap',
    9: 'Release',
  },
  ja: {
    1: '概要',
    2: '対象',
    3: '機能',
    4: 'データ',
    5: 'デザイン',
    6: '画面',
    7: '構成',
    8: 'ロードマップ',
    9: '成果物',
  },
  id: {
    1: 'Ikhtisar',
    2: 'Target',
    3: 'Fitur',
    4: 'Data',
    5: 'Desain',
    6: 'Layar',
    7: 'Sistem',
    8: 'Peta Jalan',
    9: 'Rilis',
  },
};

export default function Navbar({ mobilePane, onChangeMobilePane }: NavbarProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, pick } = useLanguage();
  const {
    projectName,
    currentChapter,
    completedChapters,
    currentUser,
    onUpdateProjectName,
    onSelectChapter,
  } = useStudioHeader();

  const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false);
  const [isMobileChapterDrawerOpen, setIsMobileChapterDrawerOpen] = useState(false);
  const headerWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsHelpMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
  }, [location.pathname, location.search]);

  const closeAllMenus = () => {
    setIsAppsMenuOpen(false);
    setIsLangMenuOpen(false);
    setIsHelpMenuOpen(false);
    setIsMobileChapterDrawerOpen(false);
  };

  const navigateFromMenu = (path: string) => {
    closeAllMenus();
    navigate(path);
  };

  const handleChapterClick = (chapterId: number) => {
    closeAllMenus();
    onSelectChapter(chapterId);
    if (location.pathname !== '/workspace') {
      navigate('/workspace');
    }
  };

  useEffect(() => {
    if (
      !isMobileChapterDrawerOpen &&
      !isAppsMenuOpen &&
      !isLangMenuOpen &&
      !isHelpMenuOpen
    ) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (headerWrapperRef.current && !headerWrapperRef.current.contains(e.target as Node)) {
        closeAllMenus();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllMenus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileChapterDrawerOpen, isAppsMenuOpen, isLangMenuOpen, isHelpMenuOpen]);

  const isWorkspaceRoute = location.pathname === '/workspace';
  const isBlogRoute = location.pathname === '/blog';
  const isSettingsRoute =
    location.pathname === '/settings' ||
    location.pathname === '/templates' ||
    location.pathname === '/backup' ||
    location.pathname === '/profile';
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

  const searchTab = new URLSearchParams(location.search).get('tab');
  const activeSettingsTabId =
    location.pathname === '/templates'
      ? 'templates'
      : location.pathname === '/backup' || (location.pathname === '/settings' && searchTab === 'storage')
      ? 'storage'
      : location.pathname === '/profile' || (location.pathname === '/settings' && searchTab === 'account')
      ? 'account'
      : location.pathname === '/settings' && searchTab === 'display'
      ? 'display'
      : location.pathname === '/settings'
      ? 'engine'
      : null;

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
  ];

  const activeSettingsItem = SETTINGS_MENU_ITEMS.find(item => item.id === activeSettingsTabId) || null;

  const currentPageLabel = isBlogRoute
    ? pick({ ko: '블로그', en: 'Blog', ja: 'ブログ', id: 'Blog' })
    : isSettingsRoute
    ? activeSettingsItem?.label || pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Pengaturan' })
    : isHelpRoute
    ? pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })
    : pick({ ko: '메뉴', en: 'Menu', ja: 'メニュー', id: 'Menu' });

  const currentChapterObj = chapters.find(c => c.id === currentChapter) || chapters[0];

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
          {isSettingsRoute && (
            <button
              type="button"
              onClick={() => navigateFromMenu('/workspace')}
              className="hidden lg:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {pick({ ko: '작업실 입장', en: 'Workspace', ja: 'スタジオへ', id: 'Ruang Kerja' })}
            </button>
          )}

          {/* 1. [GOGUMA Apps] */}
          <div className="relative flex items-stretch">
            <button
              type="button"
              onClick={() => {
                setIsAppsMenuOpen(prev => !prev);
                setIsLangMenuOpen(false);
                setIsHelpMenuOpen(false);
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
                setIsHelpMenuOpen(false);
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

          {/* 3. [Settings] Direct Main Entry */}
          <button
            type="button"
            onClick={() => navigateFromMenu('/settings?tab=engine')}
            className={`hidden sm:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap ${
              isSettingsRoute
                ? 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-accent)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
                : 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
            }`}
          >
            <span>{pick({ ko: '환경 설정', en: 'Settings', ja: '設定', id: 'Setelan' })}</span>
          </button>

          {/* 4. [Help] */}
          <div className="relative hidden sm:flex items-stretch">
            <button
              type="button"
              onClick={() => {
                setIsHelpMenuOpen(prev => !prev);
                setIsAppsMenuOpen(false);
                setIsLangMenuOpen(false);
              }}
              className={`h-full px-3 sm:px-4 flex items-center gap-1 text-[13px] sm:text-[14px] font-bold rounded-none transition-colors cursor-pointer whitespace-nowrap ${
                isHelpMenuOpen
                  ? 'bg-[var(--theme-hover-bg)] text-[var(--theme-hover-text)]'
                  : isHelpRoute
                  ? 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-accent)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
                  : 'bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`}
            >
              <span>{pick({ ko: '도움말', en: 'Help', ja: 'ヘルプ', id: 'Bantuan' })}</span>
              <ChevronDown size={13} className="shrink-0" />
            </button>

            {isHelpMenuOpen && (
              <div className="absolute right-0 top-full w-60 bg-[var(--theme-bar-bg)] border border-white/25 z-[70] rounded-none divide-y divide-white/15 shadow-xl">
                {HELP_MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="w-full px-4 py-3 text-left text-[13px] font-bold text-[var(--theme-bar-text)] rounded-none flex items-center justify-between gap-2 hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={13} className="shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Create Local Account */}
          {(!currentUser || currentUser.isAnonymous) && (
            <button
              type="button"
              onClick={() => navigateFromMenu('/create-account')}
              className="hidden md:flex h-full px-3 sm:px-4 items-center text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentUser?.isAnonymous
                ? pick({ ko: '정식 프로필 등록', en: 'Register Profile', ja: '本登録', id: 'Daftar Profil' })
                : pick({ ko: '로컬 계정 만들기', en: 'Create Account', ja: 'ローカル作成', id: 'Buat Akun Lokal' })}
            </button>
          )}

          {/* 6. Sign In / Sign Out */}
          <button
            type="button"
            onClick={() => navigateFromMenu(currentUser ? '/logout' : '/login')}
            className="h-full px-3 sm:px-4 flex items-center text-[13px] sm:text-[14px] font-bold text-[var(--theme-bar-text)] bg-[var(--theme-bar-bg)] rounded-none hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer whitespace-nowrap"
          >
            {currentUser
              ? pick({ ko: '로그아웃', en: 'Sign Out', ja: 'ログアウト', id: 'Keluar' })
              : pick({ ko: '로그인', en: 'Sign In', ja: 'ログイン', id: 'Masuk' })}
          </button>

          {/* 7. Account Icon */}
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

      {/* Tier 2: Workspace 9-Chapter Menu OR Settings 5-Item Main Menu OR Page-Only Right-Aligned Menu */}
      <header className="relative z-30 bg-[var(--theme-canvas)] border-b border-[var(--theme-border-hairline)]">
        {isWorkspaceRoute ? (
          <nav
            className="hidden lg:grid grid-cols-9 divide-x divide-[var(--theme-border-hairline)] h-20 w-full"
            aria-label={pick({ ko: '기획서 주요 메뉴', en: 'Specification Navigation', ja: '仕様書メインメニュー', id: 'Navigasi Spesifikasi' })}
          >
            {chapters.map((ch) => {
              const isCurrent = ch.id === currentChapter;

              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleChapterClick(ch.id)}
                  className={`relative h-full w-full px-1 flex items-center justify-center text-center ${
                    language === 'ko'
                      ? 'text-[15px] xl:text-[18px] 2xl:text-[21px]'
                      : language === 'ja'
                      ? 'text-[13px] xl:text-[16px] 2xl:text-[19px]'
                      : 'text-[13px] xl:text-[15px] 2xl:text-[17px]'
                  } font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]`}
                >
                  <span>{shortLabels[ch.id] || ch.title}</span>
                  {isCurrent && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                  )}
                </button>
              );
            })}
          </nav>
        ) : isSettingsRoute ? (
          <nav
            className="hidden lg:grid grid-cols-5 divide-x divide-[var(--theme-border-hairline)] h-20 w-full"
            aria-label={pick({ ko: '환경 설정 주요 메뉴', en: 'Settings Main Menu', ja: '設定メインメニュー', id: 'Menu Utama Pengaturan' })}
          >
            {SETTINGS_MENU_ITEMS.map((item) => {
              const isCurrent = item.id === activeSettingsTabId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className={`relative h-full w-full px-3 flex items-center justify-center text-center ${
                    language === 'ko'
                      ? 'text-[15px] xl:text-[18px] 2xl:text-[21px]'
                      : language === 'ja'
                      ? 'text-[13px] xl:text-[16px] 2xl:text-[19px]'
                      : 'text-[13px] xl:text-[15px] 2xl:text-[17px]'
                  } font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap transition-colors duration-150 cursor-pointer bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)]`}
                >
                  <span className="truncate">{item.label}</span>
                  {isCurrent && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                  )}
                </button>
              );
            })}
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
                onClick={() => navigateFromMenu('/blog')}
                className="relative h-full px-7 xl:px-9 flex items-center justify-center text-center text-[17px] xl:text-[20px] 2xl:text-[23px] font-extrabold tracking-[-0.03em] leading-none whitespace-nowrap bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] transition-colors duration-150 cursor-pointer"
              >
                <span>{pick({ ko: '블로그', en: 'Blog', ja: 'ブログ', id: 'Blog' })}</span>
                {isBlogRoute && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--theme-ink-strong)]" />
                )}
              </button>

              {/* 2. [Enter Workspace] */}
              <button
                type="button"
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

      {/* Mobile & Tablet Drawer (< lg) */}
      {isMobileChapterDrawerOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full bg-[var(--theme-elevated)] border-b border-[var(--theme-ink-strong)] shadow-lg z-50 max-h-[75vh] overflow-y-auto">
          {isSettingsRoute && (
            <div className="divide-y divide-[var(--theme-border-hairline)] border-b border-[var(--theme-border-hairline)]">
              {SETTINGS_MENU_ITEMS.map((item, idx) => {
                const isActive = item.id === activeSettingsTabId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className={`w-full px-5 py-3.5 text-left flex items-center justify-between text-base font-extrabold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                        : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                    }`}
                  >
                    <span>
                      0{idx + 1}. {item.label}
                    </span>
                    {isActive && <Check size={15} />}
                  </button>
                );
              })}
            </div>
          )}

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
            {!isSettingsRoute && (
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
            )}
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
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleChapterClick(ch.id)}
                    className={`w-full px-5 py-3.5 text-left flex items-center justify-between text-base font-extrabold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                        : 'bg-[var(--theme-elevated)] text-[var(--theme-ink-strong)] hover:bg-[var(--theme-stage)]'
                    }`}
                  >
                    <span>
                      0{ch.id}. {ch.title}
                    </span>
                    {completedChapters.has(ch.id) && <Check size={15} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
