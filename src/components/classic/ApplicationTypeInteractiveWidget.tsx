import React, { useMemo } from 'react';
import {
  Globe,
  Smartphone,
  Monitor,
  Layers,
  WifiOff,
  Download,
  Check,
  Bell,
  Tablet,
  Compass,
} from 'lucide-react';
import {
  SitePlan,
  ApplicationFormType,
  PwaSupportMode,
  TargetDeviceType,
  AppPlatformProfile,
} from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface ApplicationTypeInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  largeTextMode?: boolean;
}

interface FormOptionMeta {
  id: ApplicationFormType;
  badge: string;
  platformMap: 'WEB' | 'APP';
  distribution: AppPlatformProfile['distributionChannel'];
  title: string;
  description: string;
  guidance: string;
  defaultDevices: TargetDeviceType[];
  suggestedPwa?: PwaSupportMode;
  icon: React.ReactNode;
}

interface PwaOptionMeta {
  id: PwaSupportMode;
  badge: string;
  title: string;
  description: string;
  techNote: string;
}

export const ApplicationTypeInteractiveWidget: React.FC<ApplicationTypeInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
  largeTextMode = false,
}) => {
  const { pick } = useLanguage();

  const currentProfile: AppPlatformProfile = useMemo(() => {
    const existing = plan.metadata?.appProfile;
    const isApp = plan.metadata?.platform === 'APP';
    return {
      formType: existing?.formType || (isApp ? 'mobile_hybrid' : 'web_responsive'),
      pwaSupport: existing?.pwaSupport || 'none',
      targetDevices:
        existing?.targetDevices && existing.targetDevices.length > 0
          ? existing.targetDevices
          : isApp
          ? ['mobile', 'tablet']
          : ['desktop', 'mobile'],
      distributionChannel: existing?.distributionChannel || (isApp ? 'app_store' : 'web_url'),
    };
  }, [plan.metadata]);

  const formOptions: FormOptionMeta[] = useMemo(
    () => [
      {
        id: 'web_responsive',
        badge: 'WEB · SaaS',
        platformMap: 'WEB',
        distribution: 'web_url',
        title: pick({
          ko: '반응형 웹 애플리케이션 (Web)',
          en: 'Responsive Web App (Web / SaaS)',
          ja: 'レスポンシブWebアプリ (Web)',
          id: 'Aplikasi Web Responsif (Web)',
        }),
        description: pick({
          ko: '별도 설치 없이 URL 접속만으로 PC·모바일 브라우저에서 바로 사용하는 표준 웹 서비스입니다.',
          en: 'Standard browser service accessed directly via URL on desktop and mobile with zero install.',
          ja: 'インストール不要でURLからPC・モバイルのブラウザですぐに利用できる標準Webサービスです。',
          id: 'Layanan browser standar yang diakses langsung via URL di desktop & seluler tanpa instalasi.',
        }),
        guidance: pick({
          ko: 'SEO 검색 노출 · 즉시 업데이트 · React / Next.js 권장',
          en: 'SEO discoverability · Instant deploys · React / Next.js',
          ja: 'SEO対応 · 即時デプロイ · React / Next.js 推奨',
          id: 'SEO optimal · Deploy instan · React / Next.js',
        }),
        defaultDevices: ['desktop', 'mobile'],
        icon: <Globe size={18} className="shrink-0" />,
      },
      {
        id: 'web_pwa',
        badge: 'WEB + PWA',
        platformMap: 'WEB',
        distribution: 'web_url',
        title: pick({
          ko: 'PWA 설치형 웹 앱 (Progressive Web App)',
          en: 'Installable PWA (Progressive Web App)',
          ja: 'PWA インストール型Webアプリ',
          id: 'PWA Dapat Diinstal (Progressive Web App)',
        }),
        description: pick({
          ko: '웹 링크로 접근하면서도 홈 화면 아이콘 설치, 독립 앱 창, 오프라인 캐시를 지원하는 앱형 웹입니다.',
          en: 'Web-delivered app that supports Home Screen install, standalone window, and offline caching.',
          ja: 'Webからアクセスしつつホーム画面への追加、独立ウィンドウ起動、オフライン対応が可能です。',
          id: 'Aplikasi berbasis web yang mendukung instalasi ke layar utama, mode mandiri, dan cache offline.',
        }),
        guidance: pick({
          ko: '스토어 심사 없이 앱 경험 · Web Manifest + Service Worker',
          en: 'App-like UX without store review · Manifest + Service Worker',
          ja: 'ストア審査なしでアプリ体験 · Manifest + Service Worker',
          id: 'Pengalaman seperti aplikasi tanpa review toko · Manifest + SW',
        }),
        defaultDevices: ['desktop', 'mobile', 'tablet'],
        suggestedPwa: 'installable',
        icon: <Download size={18} className="shrink-0" />,
      },
      {
        id: 'mobile_hybrid',
        badge: 'HYBRID APP',
        platformMap: 'APP',
        distribution: 'app_store',
        title: pick({
          ko: '크로스 플랫폼 모바일 앱 (iOS + Android)',
          en: 'Cross-Platform Mobile App (iOS + Android)',
          ja: 'クロスプラットフォームモバイルアプリ',
          id: 'Aplikasi Seluler Lintas Platform',
        }),
        description: pick({
          ko: '하나의 코드베이스로 App Store와 Google Play에 동시 출시하는 모바일 전용 앱입니다.',
          en: 'Single-codebase mobile app targeting both Apple App Store and Google Play Store.',
          ja: '単一コードベースでApp StoreとGoogle Playへ同時リリースするモバイルアプリです。',
          id: 'Satu basis kode untuk rilis bersamaan di Apple App Store dan Google Play Store.',
        }),
        guidance: pick({
          ko: '앱스토어 배포 · React Native / Flutter / Capacitor 권장',
          en: 'Store distribution · React Native / Flutter / Capacitor',
          ja: 'アプリストア配布 · React Native / Flutter / Capacitor 推奨',
          id: 'Distribusi toko aplikasi · React Native / Flutter / Capacitor',
        }),
        defaultDevices: ['mobile', 'tablet', 'push_notifications'],
        icon: <Smartphone size={18} className="shrink-0" />,
      },
      {
        id: 'mobile_native',
        badge: 'NATIVE APP',
        platformMap: 'APP',
        distribution: 'app_store',
        title: pick({
          ko: '네이티브 모바일 앱 (Native iOS / Android)',
          en: 'Native Mobile App (Swift / Kotlin)',
          ja: 'ネイティブモバイルアプリ (iOS / Android)',
          id: 'Aplikasi Seluler Native (Swift / Kotlin)',
        }),
        description: pick({
          ko: '카메라·GPS·생체인증·백그라운드 연산 등 OS 고유 기능과 최고 성능을 극대화한 전용 앱입니다.',
          en: 'Dedicated OS-native build maximizing hardware sensors, biometrics, and peak frame rates.',
          ja: 'カメラ・GPS・生体認証などOS固有機能と最高性能を追求する専用アプリです。',
          id: 'Aplikasi native OS penuh untuk sensor perangkat, biometrik, dan performa maksimal.',
        }),
        guidance: pick({
          ko: '최고 퍼포먼스 · Swift(iOS) / Kotlin(Android)',
          en: 'Peak hardware performance · Swift / Kotlin',
          ja: '最高パフォーマンス · Swift (iOS) / Kotlin (Android)',
          id: 'Performa perangkat keras tertinggi · Swift / Kotlin',
        }),
        defaultDevices: ['mobile', 'push_notifications'],
        icon: <Smartphone size={18} className="shrink-0" />,
      },
      {
        id: 'desktop_app',
        badge: 'DESKTOP',
        platformMap: 'WEB',
        distribution: 'desktop_binary',
        title: pick({
          ko: '데스크톱 애플리케이션 (macOS / Windows)',
          en: 'Desktop Application (macOS / Windows)',
          ja: 'デスクトップアプリ (macOS / Windows)',
          id: 'Aplikasi Desktop (macOS / Windows)',
        }),
        description: pick({
          ko: '로컬 파일 시스템 접근, 단축키, 시스템 트레이 등 PC 작업 흐름에 최적화된 설치형 프로그램입니다.',
          en: 'Installable workstation software with local file access, hotkeys, and tray integration.',
          ja: 'ローカルファイル操作・ショートカット・常駐トレイに最適なPC向けインストール型ソフトです。',
          id: 'Perangkat lunak PC dengan akses file lokal, pintasan keyboard, dan baki sistem.',
        }),
        guidance: pick({
          ko: '설치 패키지(.dmg/.exe) · Electron / Tauri 권장',
          en: 'Native installer (.dmg/.exe) · Electron / Tauri',
          ja: 'インストーラ配布 (.dmg/.exe) · Electron / Tauri 推奨',
          id: 'Installer (.dmg/.exe) · Electron / Tauri',
        }),
        defaultDevices: ['desktop'],
        icon: <Monitor size={18} className="shrink-0" />,
      },
      {
        id: 'multi_platform',
        badge: 'WEB + APP',
        platformMap: 'APP',
        distribution: 'both',
        title: pick({
          ko: '웹 + 모바일 앱 통합 플랫폼 (Multi-Platform)',
          en: 'Unified Web + Mobile Platform (Multi-Platform)',
          ja: 'Web ＋ モバイルアプリ統合プラットフォーム',
          id: 'Platform Terpadu Web + Aplikasi Seluler',
        }),
        description: pick({
          ko: 'PC 관리용 웹과 사용자용 모바일 앱을 함께 구축해 실시간 API·계정 상태를 동기화합니다.',
          en: 'Pairs a full web portal/console with companion iOS & Android mobile apps sharing one API.',
          ja: 'PC向けWeb管理画面とモバイルアプリを併用し、同一API・アカウントで連携します。',
          id: 'Menggabungkan portal web lengkap dan aplikasi seluler dengan satu API terpadu.',
        }),
        guidance: pick({
          ko: '웹 대시보드 + 스토어 앱 동시 운영 · 공통 API 계층',
          en: 'Web portal + mobile store apps · Shared API contract',
          ja: 'Webダッシュボード＋ストアアプリ併用 · 共通API設計',
          id: 'Portal web + aplikasi toko · Kontrak API bersama',
        }),
        defaultDevices: ['desktop', 'mobile', 'tablet', 'push_notifications'],
        icon: <Layers size={18} className="shrink-0" />,
      },
    ],
    [pick]
  );

  const pwaOptions: PwaOptionMeta[] = useMemo(
    () => [
      {
        id: 'none',
        badge: 'STANDARD',
        title: pick({
          ko: 'PWA 미적용 (일반 웹 / 앱 전용)',
          en: 'No PWA (Standard Web / Store App)',
          ja: 'PWA 非対応 (通常Web / ストア専業)',
          id: 'Tanpa PWA (Web Standar / Toko Aplikasi)',
        }),
        description: pick({
          ko: 'Service Worker나 홈 화면 설치 기능 없이 일반 브라우저 접속 또는 스토어 바이너리로 제공합니다.',
          en: 'Runs in standard browser tabs or native store binaries without manifest/Service Worker.',
          ja: 'Service Workerやホーム画面インストールを使わず通常のブラウザまたはストアアプリとして提供します。',
          id: 'Berjalan di tab browser biasa atau aplikasi toko tanpa manifest/Service Worker.',
        }),
        techNote: pick({
          ko: '캐시 충돌 걱정 없음 · 가장 단순한 배포 구조',
          en: 'Zero cache invalidation complexity · Simplest deployment',
          ja: 'キャッシュ不整合リスクなし · 最もシンプルな構成',
          id: 'Tanpa kerumitan cache · Struktur rilis paling sederhana',
        }),
      },
      {
        id: 'installable',
        badge: 'INSTALLABLE PWA',
        title: pick({
          ko: '기본 설치형 PWA (홈 화면 앱 설치)',
          en: 'Installable PWA (Home Screen & Standalone)',
          ja: '基本インストール型PWA (ホーム追加)',
          id: 'PWA Dapat Diinstal (Layar Utama)',
        }),
        description: pick({
          ko: 'Web App Manifest와 앱 아이콘을 제공해 모바일·PC에서 주소창 없는 독립 앱 창으로 실행합니다.',
          en: 'Adds Web App Manifest + icons so users install it on Home Screen in standalone mode.',
          ja: 'Manifestとアイコンを備え、アドレスバー無しの独立ウィンドウでアプリのように起動します。',
          id: 'Menyediakan Web App Manifest & ikon agar terinstal di layar utama tanpa bilah alamat.',
        }),
        techNote: pick({
          ko: 'manifest.json + 최소 Service Worker · 빠른 도입',
          en: 'manifest.json + minimal Service Worker · Fast setup',
          ja: 'manifest.json + 軽量Service Worker · 手軽に導入',
          id: 'manifest.json + Service Worker minimal · Cepat diterapkan',
        }),
      },
      {
        id: 'offline_first',
        badge: 'OFFLINE-FIRST PWA',
        title: pick({
          ko: '완전 오프라인 PWA (로컬 캐시 · 푸시)',
          en: 'Full Offline-First PWA (SW Cache & Sync)',
          ja: '完全オフラインPWA (ローカルキャッシュ)',
          id: 'PWA Offline Penuh (Cache SW & Sinkronisasi)',
        }),
        description: pick({
          ko: '오프라인 상태에서도 정적 리소스와 IndexedDB 데이터를 읽고 쓰며, 재연결 시 자동 동기화합니다.',
          en: 'Works offline via Workbox/Service Worker caching + IndexedDB, syncing upon reconnect.',
          ja: 'オフライン環境でもAssetやIndexedDBを読み書きでき、再接続時に同期します。',
          id: 'Tetap berfungsi offline melalui cache Service Worker & IndexedDB dengan sinkronisasi otomatis.',
        }),
        techNote: pick({
          ko: 'Workbox Precache + IndexedDB + Web Push 준비',
          en: 'Workbox Precache + IndexedDB + Web Push ready',
          ja: 'Workboxプリキャッシュ + IndexedDB + Webプッシュ対応',
          id: 'Siap Workbox Precache + IndexedDB + Web Push',
        }),
      },
    ],
    [pick]
  );

  const deviceOptions: { id: TargetDeviceType; label: string; icon: React.ReactNode }[] = useMemo(
    () => [
      {
        id: 'desktop',
        label: pick({ ko: '데스크톱 / PC', en: 'Desktop / PC', ja: 'デスクトップ / PC', id: 'Desktop / PC' }),
        icon: <Monitor size={15} className="shrink-0" />,
      },
      {
        id: 'mobile',
        label: pick({ ko: '스마트폰 (모바일)', en: 'Mobile Phone', ja: 'スマートフォン', id: 'Ponsel' }),
        icon: <Smartphone size={15} className="shrink-0" />,
      },
      {
        id: 'tablet',
        label: pick({ ko: '태블릿 (iPad)', en: 'Tablet (iPad)', ja: 'タブレット', id: 'Tablet' }),
        icon: <Tablet size={15} className="shrink-0" />,
      },
      {
        id: 'push_notifications',
        label: pick({ ko: '푸시 알림 지원', en: 'Push Notifications', ja: 'プッシュ通知対応', id: 'Notifikasi Push' }),
        icon: <Bell size={15} className="shrink-0" />,
      },
    ],
    [pick]
  );

  const syncProfileToWorkspace = (nextProfile: AppPlatformProfile, platformOverride?: 'WEB' | 'APP') => {
    const selectedForm = formOptions.find(f => f.id === nextProfile.formType) || formOptions[0];
    const selectedPwa = pwaOptions.find(p => p.id === nextProfile.pwaSupport) || pwaOptions[0];
    const nextPlatform = platformOverride || selectedForm.platformMap;

    const deviceLabels = deviceOptions
      .filter(d => nextProfile.targetDevices.includes(d.id))
      .map(d => d.label);

    setPlan({
      ...plan,
      metadata: {
        ...plan.metadata,
        platform: nextPlatform,
        appProfile: nextProfile,
      },
    });

    const summaryLines = [
      `- **애플리케이션 형태**: ${selectedForm.title} (${selectedForm.badge})`,
      `- **핵심 플랫폼 축**: ${nextPlatform} (${selectedForm.guidance})`,
      `- **PWA 지원 여부**: ${selectedPwa.title} — ${selectedPwa.techNote}`,
      `- **지원 타깃 기기**: ${deviceLabels.length > 0 ? deviceLabels.join(', ') : 'Desktop / Mobile'}`,
    ];
    onInputChange(1, 'app_platform', summaryLines.join('\n'));
  };

  const handleSelectForm = (opt: FormOptionMeta) => {
    const nextPwa: PwaSupportMode =
      opt.suggestedPwa && currentProfile.pwaSupport === 'none'
        ? opt.suggestedPwa
        : opt.id === 'mobile_native'
        ? 'none'
        : currentProfile.pwaSupport;

    syncProfileToWorkspace(
      {
        formType: opt.id,
        pwaSupport: nextPwa,
        targetDevices: opt.defaultDevices,
        distributionChannel: opt.distribution,
      },
      opt.platformMap
    );
  };

  const handleSelectPwa = (pwaId: PwaSupportMode) => {
    const nextFormType: ApplicationFormType =
      pwaId !== 'none' && currentProfile.formType === 'web_responsive'
        ? 'web_pwa'
        : currentProfile.formType;
    syncProfileToWorkspace({
      ...currentProfile,
      formType: nextFormType,
      pwaSupport: pwaId,
    });
  };

  const handleToggleDevice = (deviceId: TargetDeviceType) => {
    const exists = currentProfile.targetDevices.includes(deviceId);
    const nextDevices = exists
      ? currentProfile.targetDevices.filter(d => d !== deviceId)
      : [...currentProfile.targetDevices, deviceId];
    syncProfileToWorkspace({
      ...currentProfile,
      targetDevices: nextDevices.length > 0 ? nextDevices : [deviceId],
    });
  };

  const activeForm = formOptions.find(f => f.id === currentProfile.formType) || formOptions[0];
  const activePwa = pwaOptions.find(p => p.id === currentProfile.pwaSupport) || pwaOptions[0];

  return (
    <section
      aria-label={pick({
        ko: '애플리케이션 형태 및 플랫폼 선택',
        en: 'Application Form and Platform Selector',
        ja: 'アプリケーション形態とプラットフォーム選択',
        id: 'Pemilih Bentuk Aplikasi dan Platform',
      })}
      className="space-y-10"
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-[var(--theme-ink-strong)]">
        <div className="flex items-baseline gap-3.5">
          <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em] shrink-0">
            03
          </span>
          <h2
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] leading-snug ${
              largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'
            }`}
          >
            {pick({
              ko: '애플리케이션 형태 및 플랫폼 규격',
              en: 'Application Form & Platform Specification',
              ja: 'アプリケーション形態・プラットフォーム仕様',
              id: 'Bentuk Aplikasi & Spesifikasi Platform',
            })}
          </h2>
        </div>
        <p className={`text-[var(--theme-ink-secondary)] pl-9 ${largeTextMode ? 'text-[17px]' : 'text-[15px]'}`}>
          {pick({
            ko: '구축할 서비스가 웹인지 앱인지, PWA(홈 화면 설치·오프라인) 지원 여부와 대상 기기를 선택하세요. 선택한 형태에 맞춰 아키텍처와 산출물 명세가 자동으로 구성됩니다.',
            en: 'Select whether your service is a Web App, Mobile App, Desktop App, or Multi-Platform, along with PWA install/offline capabilities. Architecture docs adapt automatically.',
            ja: '構築するサービスがWebかアプリか、PWA（ホーム追加・オフライン）対応の有無と対象デバイスを選択してください。選択に応じて仕様書が自動調整されます。',
            id: 'Pilih apakah layanan berupa Web, Aplikasi Seluler, Desktop, atau Multi-Platform beserta dukungan PWA dan perangkat target.',
          })}
        </p>
      </div>

      {/* Step A: Primary Application Form */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
              largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
            }`}
          >
            <Compass size={18} className="shrink-0" />
            <span className="font-mono text-[var(--theme-ink-secondary)]">A.</span>
            <span>
              {pick({
                ko: '개발 형태 선택 (웹 / 앱 / 통합)',
                en: 'Primary Application Form (Web / App / Hybrid)',
                ja: '開発形態の選択 (Web / アプリ / 統合)',
                id: 'Pilih Bentuk Aplikasi Utama',
              })}
            </span>
          </h3>
          <span className="text-[13px] font-mono font-bold tabular-nums px-3 py-1 border border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] text-[var(--theme-ink-strong)] whitespace-nowrap">
            {activeForm.badge}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {formOptions.map((opt) => {
            const isSelected = currentProfile.formType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectForm(opt)}
                aria-pressed={isSelected}
                className={`group w-full text-left p-5 sm:p-6 rounded-none transition-colors cursor-pointer flex flex-col gap-3.5 ${
                  isSelected
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[var(--theme-ink-strong)] shrink-0">
                        {opt.icon}
                      </span>
                      <span className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                        {opt.title}
                      </span>
                      <span className="text-[var(--theme-ink-muted)]">·</span>
                      <span className="text-[13px] font-mono font-bold uppercase tracking-[0.06em] text-[var(--theme-ink-secondary)] whitespace-nowrap">
                        {opt.badge}
                      </span>
                    </div>

                    <p className="text-[15px] text-[var(--theme-ink-secondary)] leading-[1.65] pl-7">
                      {opt.description}
                    </p>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
                    )}
                  </div>
                </div>

                <div className="pt-3 pl-7 border-t border-[var(--theme-border-hairline)] text-[13px] font-bold text-[var(--theme-ink-secondary)] leading-snug">
                  {opt.guidance}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step B: PWA Support Level */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
              largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
            }`}
          >
            <WifiOff size={18} className="shrink-0" />
            <span className="font-mono text-[var(--theme-ink-secondary)]">B.</span>
            <span>
              {pick({
                ko: 'PWA (Progressive Web App) 지원 여부',
                en: 'PWA Support & Offline Capability',
                ja: 'PWA (Progressive Web App) 対応方針',
                id: 'Dukungan PWA & Kemampuan Offline',
              })}
            </span>
          </h3>
          {currentProfile.formType === 'mobile_native' && (
            <span className="text-[13px] font-bold text-[var(--theme-ink-muted)]">
              {pick({
                ko: '참고: 네이티브 앱 선택 시 웹 보조 페이지가 필요한 경우에만 PWA를 켜세요.',
                en: 'Note: For native apps, enable PWA only if you also provide a web companion.',
                ja: '注: ネイティブアプリの場合、補助Web画面が必要な時のみPWAを有効にしてください。',
                id: 'Catatan: Untuk aplikasi native, aktifkan PWA hanya jika ada pendamping web.',
              })}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {pwaOptions.map((pwa) => {
            const isSelected = currentProfile.pwaSupport === pwa.id;
            return (
              <button
                key={pwa.id}
                type="button"
                onClick={() => handleSelectPwa(pwa.id)}
                aria-pressed={isSelected}
                className={`w-full text-left p-5 sm:p-6 rounded-none transition-colors cursor-pointer flex flex-col gap-3 ${
                  isSelected
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                        {pwa.title}
                      </span>
                      <span className="text-[var(--theme-ink-muted)]">·</span>
                      <span className="text-[13px] font-mono font-bold uppercase tracking-[0.06em] text-[var(--theme-ink-secondary)] whitespace-nowrap">
                        {pwa.badge}
                      </span>
                    </div>

                    <p className="text-[15px] text-[var(--theme-ink-secondary)] leading-[1.65]">
                      {pwa.description}
                    </p>
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--theme-border-hairline)] text-[13px] font-bold text-[var(--theme-ink-secondary)]">
                  {pwa.techNote}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step C: Target Devices & Capabilities */}
      <div className="space-y-3.5">
        <h3
          className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
            largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
          }`}
        >
          <span className="font-mono text-[var(--theme-ink-secondary)]">C.</span>
          <span>
            {pick({
              ko: '지원 타깃 기기 및 추가 기능 (복수 선택)',
              en: 'Target Devices & Capabilities (Multi-Select)',
              ja: '対応デバイス・追加機能 (複数選択可)',
              id: 'Perangkat Target & Kemampuan (Pilih Banyak)',
            })}
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-2.5">
          {deviceOptions.map((dev) => {
            const isSelected = currentProfile.targetDevices.includes(dev.id);
            return (
              <button
                key={dev.id}
                type="button"
                onClick={() => handleToggleDevice(dev.id)}
                aria-pressed={isSelected}
                className={`w-full px-5 py-3.5 rounded-none text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] font-extrabold'
                    : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[var(--theme-ink-secondary)] hover:border-[var(--theme-ink-strong)] hover:text-[var(--theme-ink-strong)] font-bold'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0 text-[15px]">
                  {dev.icon}
                  <span>{dev.label}</span>
                </span>
                {isSelected ? (
                  <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center shrink-0">
                    <Check size={14} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Specification Summary Banner */}
      <div className="p-6 border-2 border-[var(--theme-ink-strong)] bg-[var(--theme-stage)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-extrabold uppercase tracking-[0.12em] text-[var(--theme-ink-secondary)]">
            {pick({
              ko: '현재 확정된 애플리케이션 규격 요약',
              en: 'Active Application Blueprint Summary',
              ja: '確定済みアプリケーション仕様サマリー',
              id: 'Ringkasan Cetak Biru Aplikasi Aktif',
            })}
          </span>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="px-3 py-1 border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] text-[12px] font-extrabold tracking-[0.08em] text-[var(--theme-ink-strong)] whitespace-nowrap">
              PLATFORM: {plan.metadata?.platform || activeForm.platformMap}
            </span>
            <span className="px-3 py-1 border border-[var(--theme-ink-strong)] bg-[var(--theme-active-bg)] text-[12px] font-extrabold tracking-[0.08em] text-[var(--theme-active-text)] whitespace-nowrap">
              PWA: {currentProfile.pwaSupport.toUpperCase()}
            </span>
          </div>
        </div>

        <h2 className="text-[22px] sm:text-[26px] font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] leading-snug">
          {activeForm.title} · {activePwa.title}
        </h2>

        <div className="text-[15px] font-bold text-[var(--theme-ink-secondary)] leading-relaxed">
          {pick({ ko: '타깃 기기:', en: 'Targets:', ja: '対象端末:', id: 'Target:' })}{' '}
          {deviceOptions
            .filter(d => currentProfile.targetDevices.includes(d.id))
            .map(d => d.label)
            .join(', ')}
        </div>
      </div>
    </section>
  );
};
