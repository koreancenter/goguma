import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronRight, SlidersHorizontal, Cpu, Type, FolderOpen, User, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { auth, LocalUser } from '../../../lib/localAuth';
import type { PreferencesTab } from '../../guide/PreferencesModal';

const PreferencesModal = lazy(() =>
  import('../../guide/PreferencesModal').then(m => ({ default: m.PreferencesModal }))
);

interface NavbarProps {
  projectTitle?: string;
  saveStatus?: 'idle' | 'saving' | 'saved';
}

interface MegaMenuItem {
  labelKo: string;
  labelEn: string;
  to?: string;
  action?: () => void;
  Icon?: React.ElementType;
}

interface MegaMenuColumn {
  id: string;
  labelKo: string;
  labelEn: string;
  to?: string;
  onHeaderClick?: () => void;
  items: MegaMenuItem[];
}

export default function Navbar({ projectTitle, saveStatus }: NavbarProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string>('studio');
  const [user, setUser] = useState<LocalUser | null>(() => auth.currentUser);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [preferencesTab, setPreferencesTab] = useState<PreferencesTab>('engine');
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
    });
  }, []);

  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMegaMenuOpen && !isMobileOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMegaMenuOpen(false);
        setIsMobileOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMegaMenuOpen(false);
        setIsMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMegaMenuOpen, isMobileOpen]);

  const openPreferences = (tab: PreferencesTab = 'engine') => {
    setPreferencesTab(tab);
    setIsPreferencesOpen(true);
    setIsMegaMenuOpen(false);
    setIsMobileOpen(false);
  };

  const MEGA_COLUMNS: MegaMenuColumn[] = [
    {
      id: 'studio',
      labelKo: '스튜디오',
      labelEn: 'Studio',
      to: '/landing',
      items: [
        { labelKo: '에디토리얼 홈', labelEn: 'Editorial Home', to: '/landing' },
        { labelKo: '스튜디오 소개', labelEn: 'About Studio', to: '/about' },
        { labelKo: '디렉터 입장 안내', labelEn: 'Director Gateway', to: '/login' },
        { labelKo: '로컬 작업실 열기', labelEn: 'Local Workspace', to: '/workspace' },
      ],
    },
    {
      id: 'chapters',
      labelKo: '기획서 집필',
      labelEn: 'Specification',
      to: '/workspace',
      items: [
        { labelKo: '서비스 개요 및 배경', labelEn: 'Overview & Background', to: '/workspace' },
        { labelKo: '타깃 사용자 및 환경', labelEn: 'Target & Platform', to: '/workspace' },
        { labelKo: '핵심 기능 및 흐름', labelEn: 'Functional Flow', to: '/workspace' },
        { labelKo: '데이터 모델 및 스키마', labelEn: 'Data Schema', to: '/workspace' },
        { labelKo: '디자인 시스템 및 화면', labelEn: 'Design & IA', to: '/workspace' },
      ],
    },
    {
      id: 'artifacts',
      labelKo: '산출물',
      labelEn: 'Artifacts',
      to: '/workspace',
      items: [
        { labelKo: '표준 개발 사양서 추출', labelEn: 'Engineering Specs', to: '/workspace' },
        { labelKo: '실행 플레이북 컴파일', labelEn: 'Execution Playbook', to: '/workspace' },
        { labelKo: '실시간 프로토타입 뷰', labelEn: 'Live Prototype Stage', to: '/workspace' },
        { labelKo: '로컬 데이터베이스 보관', labelEn: 'Local Persistence', to: '/about' },
      ],
    },
    {
      id: 'opensource',
      labelKo: '커뮤니티',
      labelEn: 'Community',
      to: '/community',
      items: [
        { labelKo: '오픈소스 커뮤니티', labelEn: 'Community Hub', to: '/community' },
        { labelKo: '오픈소스 라이선스', labelEn: 'License Notice', to: '/terms' },
        { labelKo: '개인정보처리방침', labelEn: 'Privacy Policy', to: '/privacy' },
        { labelKo: '도움말 및 안내서', labelEn: 'Help & Guide', to: '/support' },
      ],
    },
    {
      id: 'settings',
      labelKo: '환경 설정',
      labelEn: 'Preferences',
      onHeaderClick: () => openPreferences('engine'),
      items: [
        { labelKo: '인공지능 엔진 설정', labelEn: 'AI Engine Setup', Icon: Cpu, action: () => openPreferences('engine') },
        { labelKo: '화면 및 언어 설정', labelEn: 'Display & Language', Icon: Type, action: () => openPreferences('display') },
        { labelKo: '로컬 데이터 및 백업', labelEn: 'Storage & Backup', Icon: FolderOpen, action: () => openPreferences('storage') },
        { labelKo: '내 계정 및 프로필', labelEn: 'Profile', Icon: User, to: user ? '/profile' : '/login' },
        { labelKo: '문의 및 기술 지원', labelEn: 'Contact Support', Icon: MessageSquare, to: '/contact' },
      ],
    },
  ];

  const isKo = language === 'ko';

  return (
    <div
      ref={headerRef}
      onMouseLeave={() => setIsMegaMenuOpen(false)}
      className="sticky top-0 left-0 right-0 z-50 bg-[#FFFFFF] font-sans select-none"
    >
      {/* Tier 1: Sejong Slim Black Utility Strip (#000000) — Pure Korean, High Contrast White */}
      <div className="h-10 bg-[#000000] text-[#FFFFFF] border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-full flex items-center justify-between text-[13px] font-bold">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[#FFFFFF] truncate">
              {isKo ? '로컬 아키텍처 사양서 스튜디오' : 'Local Specification Studio'}
            </span>
            {projectTitle && (
              <>
                <span className="text-white/30" aria-hidden="true">/</span>
                <span className="text-[#FFFFFF] truncate max-w-[180px] sm:max-w-[260px]">
                  {projectTitle}
                </span>
              </>
            )}
            {saveStatus && (
              <span className="hidden md:inline text-white/85 font-semibold">
                · {saveStatus === 'saving' ? '보존 중' : '자동 보존됨'}
              </span>
            )}
          </div>

          <div className="flex items-stretch h-full shrink-0 divide-x divide-white/20 border-l border-white/20">
            <Link
              to="/support"
              className="hidden sm:flex items-center px-3.5 text-[#FFFFFF] hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              {isKo ? '도움말' : 'Guide'}
            </Link>
            <Link
              to="/community"
              className="hidden sm:flex items-center px-3.5 text-[#FFFFFF] hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              {isKo ? '커뮤니티' : 'Community'}
            </Link>
            <button
              type="button"
              onClick={() => openPreferences('engine')}
              className="flex items-center gap-1.5 px-3.5 text-[#FFFFFF] hover:bg-white/15 transition-colors cursor-pointer whitespace-nowrap"
            >
              <SlidersHorizontal size={13} />
              <span>{isKo ? '환경 설정' : 'Settings'}</span>
            </button>
            <Link
              to="/login"
              className="flex items-center px-3.5 text-[#FFFFFF] hover:bg-white/15 transition-colors whitespace-nowrap"
            >
              {user ? (isKo ? '프로필' : 'Profile') : (isKo ? '로그인' : 'Login')}
            </Link>
            <button
              type="button"
              onClick={() => navigate(user ? '/workspace' : '/login')}
              className="flex items-center px-4 bg-[#FFFFFF] text-[#000000] hover:bg-[#F6F5F1] font-extrabold transition-colors cursor-pointer whitespace-nowrap"
            >
              {user ? (isKo ? '작업실' : 'Workspace') : (isKo ? '시작하기' : 'Start')}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 2: Main White Navigation Row (#FFFFFF) — 2x Scale & Pure #000000 Ink */}
      <header className="bg-[#FFFFFF] border-b border-[#E4E2DC]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Editorial Wordmark */}
          <div className="flex items-center shrink-0">
            <Link
              to="/landing"
              className="font-display text-[24px] sm:text-[26px] font-extrabold tracking-[-0.04em] text-[#000000] hover:opacity-75 transition-opacity whitespace-nowrap leading-none"
            >
              {isKo ? '고구마' : 'GOGUMA'}
            </Link>
          </div>

          {/* Zone 2: Horizontal Top-Level Navigation Categories (2x Font Size, High Contrast) */}
          <nav
            className="hidden md:flex items-center justify-center flex-1 h-full gap-4 lg:gap-8 xl:gap-10"
            aria-label="주요 메뉴"
          >
            {MEGA_COLUMNS.map((col) => {
              const isActiveCol = isMegaMenuOpen && activeColumnId === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onMouseEnter={() => {
                    setActiveColumnId(col.id);
                    setIsMegaMenuOpen(true);
                  }}
                  onFocus={() => {
                    setActiveColumnId(col.id);
                    setIsMegaMenuOpen(true);
                  }}
                  onClick={() => {
                    if (col.onHeaderClick) {
                      col.onHeaderClick();
                    } else if (isMegaMenuOpen && activeColumnId === col.id && col.to) {
                      navigate(col.to);
                      setIsMegaMenuOpen(false);
                    } else {
                      setActiveColumnId(col.id);
                      setIsMegaMenuOpen(true);
                    }
                  }}
                  className={`relative h-full px-2 flex items-center text-[20px] xl:text-[24px] font-extrabold tracking-[-0.03em] whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActiveCol ? 'text-[#000000]' : 'text-[#000000] hover:opacity-75'
                  }`}
                >
                  <span>{isKo ? col.labelKo : col.labelEn}</span>
                  {isActiveCol && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#000000]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Pure Black Architectural CTA */}
          <div className="hidden md:flex items-center shrink-0">
            <button
              type="button"
              onClick={() => navigate(user ? '/workspace' : '/login')}
              className="px-6 py-3 bg-[#000000] hover:bg-[#1C1C1A] text-[#FFFFFF] rounded-[2px] text-[14px] font-bold tracking-tight transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {user ? (isKo ? '작업실로 이동' : 'Open Workspace') : (isKo ? '시작하기' : 'Get Started')}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              className="text-[#000000] hover:bg-[#F6F5F1] p-2 rounded-[2px] border border-[#111111] cursor-pointer"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              aria-label="메뉴 열기"
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Width 5-Column Sejong Architectural Mega-Menu */}
      {isMegaMenuOpen && (
        <div
          className="hidden md:block absolute left-0 right-0 top-full bg-[#FFFFFF] border-t border-[#E4E2DC] border-b border-[#000000] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] z-50"
          role="region"
          aria-label="전체 내비게이션 메가메뉴"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-5 divide-x divide-[#E4E2DC] border-x border-[#E4E2DC]">
            {MEGA_COLUMNS.map((col) => {
              const isColActive = activeColumnId === col.id;
              return (
                <div
                  key={col.id}
                  onMouseEnter={() => setActiveColumnId(col.id)}
                  className={`flex flex-col min-h-[260px] transition-colors duration-150 ${
                    isColActive ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'
                  }`}
                >
                  {/* Column Title */}
                  <button
                    type="button"
                    onClick={() => {
                      if (col.onHeaderClick) {
                        col.onHeaderClick();
                      } else if (col.to) {
                        navigate(col.to);
                        setIsMegaMenuOpen(false);
                      }
                    }}
                    className={`w-full px-5 py-4 text-center border-b text-[19px] xl:text-[21px] font-extrabold tracking-[-0.03em] cursor-pointer transition-colors ${
                      isColActive
                        ? 'border-white/30 text-[#FFFFFF]'
                        : 'border-[#E4E2DC] text-[#000000] hover:bg-[#F6F5F1]'
                    }`}
                  >
                    {isKo ? col.labelKo : col.labelEn}
                  </button>

                  {/* Sub-Navigation List */}
                  <ul className="p-4 space-y-1.5 flex-1">
                    {col.items.map((item) => {
                      const ItemIcon = item.Icon;
                      if (item.action) {
                        return (
                          <li key={item.labelKo}>
                            <button
                              type="button"
                              onClick={item.action}
                              className={`w-full px-3 py-2 text-left text-[15px] font-semibold rounded-[2px] flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                isColActive
                                  ? 'text-[#FFFFFF] hover:bg-white/15'
                                  : 'text-[#000000] hover:bg-[#F6F5F1]'
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0 truncate">
                                {ItemIcon && <ItemIcon size={14} className="shrink-0" />}
                                <span className="truncate">{isKo ? item.labelKo : item.labelEn}</span>
                              </span>
                              <ChevronRight size={14} className="shrink-0 opacity-60" />
                            </button>
                          </li>
                        );
                      }

                      return (
                        <li key={item.labelKo}>
                          <Link
                            to={item.to || '/landing'}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className={`w-full px-3 py-2 text-[15px] font-semibold rounded-[2px] flex items-center justify-between gap-2 transition-colors ${
                              isColActive
                                ? 'text-[#FFFFFF] hover:bg-white/15'
                                : 'text-[#000000] hover:bg-[#F6F5F1]'
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0 truncate">
                              {ItemIcon && <ItemIcon size={14} className="shrink-0" />}
                              <span className="truncate">{isKo ? item.labelKo : item.labelEn}</span>
                            </span>
                            <ChevronRight size={14} className="shrink-0 opacity-60" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobile Responsive Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#FFFFFF] border-b border-[#000000] overflow-hidden"
          >
            <div className="flex flex-col px-6 py-5 divide-y divide-[#E4E2DC]">
              {MEGA_COLUMNS.map((col) => (
                <div key={col.id} className="py-3 first:pt-0">
                  <div className="text-base font-extrabold text-[#000000] mb-2">
                    {isKo ? col.labelKo : col.labelEn}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {col.items.map((item) =>
                      item.action ? (
                        <button
                          key={item.labelKo}
                          type="button"
                          onClick={item.action}
                          className="px-3 py-1.5 text-xs font-bold border border-[#CBC8BF] text-[#000000] hover:border-[#000000] rounded-[2px] cursor-pointer"
                        >
                          {isKo ? item.labelKo : item.labelEn}
                        </button>
                      ) : (
                        <Link
                          key={item.labelKo}
                          to={item.to || '/landing'}
                          onClick={() => setIsMobileOpen(false)}
                          className="px-3 py-1.5 text-xs font-bold border border-[#CBC8BF] text-[#000000] hover:border-[#000000] rounded-[2px]"
                        >
                          {isKo ? item.labelKo : item.labelEn}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    navigate(user ? '/workspace' : '/login');
                  }}
                  className="w-full py-3 bg-[#000000] hover:bg-[#1C1C1A] text-[#FFFFFF] rounded-[2px] text-sm font-bold tracking-tight cursor-pointer"
                >
                  {user ? (isKo ? '작업실로 이동' : 'Open Workspace') : (isKo ? '시작하기' : 'Get Started')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isPreferencesOpen && (
        <Suspense fallback={null}>
          <PreferencesModal
            isOpen={isPreferencesOpen}
            initialTab={preferencesTab}
            onClose={() => setIsPreferencesOpen(false)}
            currentUserName={user?.displayName}
            currentUserRole={user?.role}
            onNavigateProfile={() => navigate(user ? '/profile' : '/login')}
          />
        </Suspense>
      )}
    </div>
  );
}
