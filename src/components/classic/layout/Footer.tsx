import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Github, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function Footer() {
  const location = useLocation();
  const { pick } = useLanguage();
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string | null>(null);
  const siteDropdownRef = useRef<HTMLDivElement>(null);
  const year = new Date().getFullYear();

  const relatedSites = [
    { label: 'Net-to-Dot', url: 'https://nettodot.org' },
    {
      label: pick({ ko: '한국센터글로벌네트워크', en: 'Korean Center Global Network', ja: '韓国センターグローバルネットワーク', id: 'Korean Center Global Network' }),
      url: 'https://koreancenter.net',
    },
    { label: 'Global K-Edu Community', url: 'https://kedu.koreancenter.net' },
    {
      label: pick({ ko: '인도네시아센터', en: 'Indonesia Center', ja: 'インドネシアセンター', id: 'Indonesia Center' }),
      url: 'https://indonesiacenter.net',
    },
    {
      label: pick({ ko: '인도네시아 창업지원센터', en: 'Indonesia Startup Support Center', ja: 'インドネシア創業支援センター', id: 'Pusat Dukungan Startup Indonesia' }),
      url: 'https://visas.indonesiacenter.net',
    },
    {
      label: pick({ ko: '인도네시아 언어 연수', en: 'Indonesia BIPA Language Program', ja: 'インドネシア語学研修 (BIPA)', id: 'Program Bahasa Indonesia (BIPA)' }),
      url: 'https://bipa.indonesiacenter.net',
    },
    {
      label: pick({ ko: '인도네시아 기업 연수', en: 'Indonesia Corporate Retreat', ja: 'インドネシア企業研修', id: 'Program Retret Korporat Indonesia' }),
      url: 'https://retreat.indonesiacenter.net',
    },
  ];

  const footerPolicyLinks = [
    { label: pick({ ko: '개인정보처리방침', en: 'Privacy Policy', ja: 'プライバシーポリシー', id: 'Kebijakan Privasi' }), to: '/privacy' },
    { label: pick({ ko: '이용약관', en: 'Terms of Service', ja: '利用規約', id: 'Ketentuan Layanan' }), to: '/terms' },
    { label: pick({ ko: '오픈소스 라이선스', en: 'Open Source License', ja: 'OSSライセンス', id: 'Lisensi Open Source' }), to: '/license' },
    { label: pick({ ko: '인공지능 정책', en: 'AI Policy', ja: 'AIポリシー', id: 'Kebijakan AI' }), to: '/ai-policy' },
    { label: pick({ ko: '커뮤니티 이용 규약', en: 'Community Guidelines', ja: 'コミュニティ規約', id: 'Pedoman Komunitas' }), to: '/community-terms' },
    { label: pick({ ko: '쿠키 정책', en: 'Cookie Policy', ja: 'Cookieポリシー', id: 'Kebijakan Cookie' }), to: '/cookies' },
  ];

  const selectedSite = relatedSites.find((s) => s.url === selectedSiteUrl) || null;
  const isOnLegalPage = footerPolicyLinks.some((item) => item.to === location.pathname);

  useEffect(() => {
    if (!isSiteMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (siteDropdownRef.current && !siteDropdownRef.current.contains(e.target as Node)) {
        setIsSiteMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSiteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSiteMenuOpen]);

  return (
    <footer className="no-print w-full bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] font-sans border-t border-[var(--theme-border-hairline)]">
      {/* Top Utility Menu Strip */}
      <div className="w-full bg-[var(--theme-bar-bg)] text-[var(--theme-bar-text)] border-b border-[var(--theme-border-hairline)]/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 min-h-14 py-2.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <nav
            className="flex flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-2"
            aria-label={pick({ ko: '푸터 정책 메뉴', en: 'Footer legal links', ja: 'フッター規約メニュー', id: 'Menu kebijakan footer' })}
          >
            {footerPolicyLinks.map((item) => {
              const isHighlighted = isOnLegalPage
                ? location.pathname === item.to
                : item.to === '/privacy';

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-[13px] sm:text-[14px] font-bold tracking-tight rounded-none transition-colors whitespace-nowrap ${
                    isHighlighted
                      ? 'text-[var(--theme-bar-accent)]'
                      : 'text-[var(--theme-bar-text)] hover:text-[var(--theme-bar-accent)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center shrink-0">
            <a
              href="https://github.com/koreancenter/goguma.git"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              title="GitHub: https://github.com/koreancenter/goguma.git"
              className="p-1.5 -mr-1.5 text-[var(--theme-bar-text)] hover:text-[var(--theme-bar-accent)] rounded-none transition-colors inline-flex items-center justify-center"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>

      {/* Middle Band: Emblem & Company Info | Net-to-Dot Movement Member | Related Sites */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-10 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Architectural Mark + Company Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
            <div className="shrink-0 flex items-center" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="2" y="2" width="44" height="44" stroke="var(--theme-ink-strong)" strokeWidth="2.5" />
                <path
                  d="M15 29C15 22.4 21.2 15 29.6 15C32.4 15 34 16.8 34 19.6C34 26.8 27.4 33 19.6 33C16.6 33 15 31.4 15 29Z"
                  fill="var(--theme-ink-strong)"
                />
                <path d="M29 15C30.4 12.6 32.6 11.2 35 11" stroke="var(--theme-seal)" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </div>

            <div className="text-[13px] text-[var(--theme-ink-body)] leading-[1.75] space-y-0.5 font-medium">
              <p className="text-[var(--theme-ink-strong)] font-bold">
                {pick({
                  ko: '한국센터글로벌네트워크 지식관리실 고구마앱팀',
                  en: 'Korean Center Global Network · Knowledge Management · GOGUMA App Team',
                  ja: '韓国センターグローバルネットワーク 知識管理室 GOGUMAアプリチーム',
                  id: 'Korean Center Global Network · Divisi Manajemen Pengetahuan · Tim Aplikasi GOGUMA',
                })}
              </p>
              <p>
                {pick({
                  ko: '대한민국 경기도 부천시 | 인도네시아 발리',
                  en: 'Bucheon, South Korea | Bali, Indonesia',
                  ja: '大韓民国 京畿道富川市 | インドネシア バリ',
                  id: 'Bucheon, Korea Selatan | Bali, Indonesia',
                })}
              </p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                <span>
                  {pick({
                    ko: '사업자등록번호 141-82-83410',
                    en: 'Business Reg. No. 141-82-83410',
                    ja: '事業者登録番号 141-82-83410',
                    id: 'No. Registrasi Bisnis 141-82-83410',
                  })}
                </span>
                <span className="text-[var(--theme-border-strong)]" aria-hidden="true">|</span>
                <span>
                  {pick({
                    ko: '통신판매업신고번호 제2025-부천원미-1090호',
                    en: 'E-Commerce Permit No. 2025-BucheonWonmi-1090',
                    ja: '通信販売業届出 第2025-富川遠美-1090号',
                    id: 'Izin Niaga Elektronik No. 2025-BucheonWonmi-1090',
                  })}
                </span>
              </p>
            </div>
          </div>

          {/* Right: Net-to-Dot Movement Member Logo Lockup + Related Sites Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 shrink-0">
            <a
              href="https://nettodot.org"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)] px-4 py-2.5 rounded-none transition-colors"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0 text-[var(--theme-ink-strong)]"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
                <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="5" cy="6" r="2.2" fill="var(--theme-ink-strong)" />
                <circle cx="19" cy="6" r="2.2" fill="var(--theme-ink-strong)" />
                <circle cx="5" cy="18" r="2.2" fill="var(--theme-ink-strong)" />
                <circle cx="19" cy="18" r="2.2" fill="var(--theme-seal)" />
              </svg>
              <div className="leading-tight">
                <div className="text-[13px] font-extrabold tracking-[-0.02em] text-[var(--theme-ink-strong)] group-hover:text-[var(--theme-seal)] transition-colors">
                  Net-to-Dot
                </div>
                <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[var(--theme-ink-secondary)]">
                  Movement Member
                </div>
              </div>
            </a>

            <div ref={siteDropdownRef} className="relative flex items-stretch h-11 border border-[var(--theme-border-strong)] bg-[var(--theme-elevated)] rounded-none">
              <button
                type="button"
                onClick={() => setIsSiteMenuOpen(prev => !prev)}
                className="min-w-[225px] sm:min-w-[250px] px-4 flex items-center justify-between gap-3 text-[13px] font-bold text-[var(--theme-ink-primary)] hover:bg-[var(--theme-stage)] transition-colors cursor-pointer rounded-none"
                aria-haspopup="listbox"
                aria-expanded={isSiteMenuOpen}
              >
                <span className="truncate">
                  {selectedSite
                    ? selectedSite.label
                    : pick({ ko: '관련 사이트', en: 'Related Sites', ja: '関連サイト', id: 'Situs Terkait' })}
                </span>
                <ChevronDown
                  size={15}
                  className={`shrink-0 text-[var(--theme-ink-secondary)] transition-transform ${isSiteMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {selectedSite ? (
                <a
                  href={selectedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 border-l border-[var(--theme-border-strong)] flex items-center justify-center text-[13px] font-bold text-[var(--theme-ink-primary)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] transition-colors rounded-none whitespace-nowrap"
                >
                  {pick({ ko: '이동', en: 'Go', ja: '移動', id: 'Buka' })}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSiteMenuOpen(true)}
                  className="px-4 border-l border-[var(--theme-border-strong)] flex items-center justify-center text-[13px] font-bold text-[var(--theme-ink-primary)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)] transition-colors cursor-pointer rounded-none whitespace-nowrap"
                >
                  {pick({ ko: '이동', en: 'Go', ja: '移動', id: 'Buka' })}
                </button>
              )}

              {isSiteMenuOpen && (
                <div
                  role="listbox"
                  aria-label={pick({ ko: '관련 사이트 목록', en: 'Related sites list', ja: '関連サイト一覧', id: 'Daftar situs terkait' })}
                  className="absolute left-0 right-0 bottom-full mb-1 bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] shadow-xl z-50 rounded-none divide-y divide-[var(--theme-border-hairline)] max-h-80 overflow-y-auto"
                >
                  {relatedSites.map((site) => (
                    <button
                      key={site.url}
                      type="button"
                      role="option"
                      aria-selected={selectedSiteUrl === site.url}
                      onClick={() => {
                        setSelectedSiteUrl(site.url);
                        setIsSiteMenuOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-[13px] font-bold transition-colors cursor-pointer rounded-none flex items-center justify-between whitespace-nowrap ${
                        selectedSiteUrl === site.url
                          ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                          : 'text-[var(--theme-ink-primary)] hover:bg-[var(--theme-active-bg)] hover:text-[var(--theme-active-text)]'
                      }`}
                    >
                      <span className="truncate">{site.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Hairline Bar */}
        <div className="mt-8 pt-5 border-t border-[var(--theme-border-hairline)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[12px] text-[var(--theme-ink-secondary)] font-medium">
          <div>
            COPYRIGHT(C) {year} KOREAN CENTER GLOBAL NETWORK · GOGUMA APP TEAM. ALL RIGHTS RESERVED.
          </div>
          <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[var(--theme-ink-secondary)]">
            100% LOCAL-FIRST · ZERO TELEMETRY · MIT LICENSE
          </div>
        </div>
      </div>
    </footer>
  );
}
