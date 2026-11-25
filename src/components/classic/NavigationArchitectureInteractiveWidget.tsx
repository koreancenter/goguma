import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, Edit3, Check, 
  Layers, ArrowRight, MoveRight
} from 'lucide-react';
import { SitePlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface PageItem {
  id: string;
  name: string;
  slug: string;
  type: 'page' | 'modal' | 'drawer';
  script: string;
}

interface NavigationArchitectureInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  largeTextMode?: boolean;
}

export const NavigationArchitectureInteractiveWidget: React.FC<NavigationArchitectureInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
  largeTextMode = false,
}) => {
  const { pick } = useLanguage();

  const defaultPages: PageItem[] = useMemo(
    () => [
      {
        id: 'p1',
        name: pick({ ko: '메인 관리 대시보드', en: 'Main Admin Dashboard', ja: 'メイン管理ダッシュボード', id: 'Dasbor Admin Utama' }),
        slug: '/',
        type: 'page',
        script: pick({
          ko: '실시간 리소스 현황 조회, 키워드 검색, 주요 상태 지표 요약',
          en: 'Live resource status, keyword search, and key state KPI summary',
          ja: 'リアルタイムリソース状況照会、キーワード検索、主要指標サマリー',
          id: 'Status sumber daya langsung, pencarian kata kunci, dan ringkasan KPI',
        }),
      },
      {
        id: 'p2',
        name: pick({ ko: '신규 리소스 등록 모달', en: 'New Resource Modal', ja: '新規リソース登録モーダル', id: 'Modal Tambah Sumber Daya' }),
        slug: '/new',
        type: 'modal',
        script: pick({
          ko: '빠른 신규 레코드 생성 폼 (제목, 분류, 담당자, 상태)',
          en: 'Quick record creation form (title, category, assignee, status)',
          ja: 'クイック新規レコード作成フォーム (件名、分類、担当者、状態)',
          id: 'Formulir pembuatan entri cepat (judul, kategori, penanggung jawab, status)',
        }),
      },
      {
        id: 'p3',
        name: pick({ ko: '상세 정보 및 편집 드로어', en: 'Detail & Edit Drawer', ja: '詳細情報・編集ドロワー', id: 'Laci Detail & Edit' }),
        slug: '/detail',
        type: 'drawer',
        script: pick({
          ko: '상세 속성 및 변경 이력 타임라인, 상태 전이 제어',
          en: 'Detailed attributes, change history timeline, and state transition control',
          ja: '詳細属性、変更履歴タイムライン、状態遷移制御',
          id: 'Atribut detail, lini masa riwayat perubahan, dan kontrol transisi status',
        }),
      },
    ],
    [pick]
  );

  const suggestedPages = useMemo(
    () => [
      {
        name: pick({ ko: '데이터 분석 대시보드', en: 'Analytics Dashboard', ja: 'データ分析ダッシュボード', id: 'Dasbor Analitik' }),
        slug: '/analytics',
        type: 'page' as const,
        script: pick({
          ko: '핵심 지표, 실시간 통계 및 시각화 리포트',
          en: 'Core KPIs, real-time statistics, and visual reports',
          ja: '主要指標、リアルタイム統計、可視化レポート',
          id: 'KPI utama, statistik real-time, dan laporan visual',
        }),
      },
      {
        name: pick({ ko: '리소스 관리 테이블', en: 'Resource Table', ja: 'リソース管理テーブル', id: 'Tabel Sumber Daya' }),
        slug: '/resources',
        type: 'page' as const,
        script: pick({
          ko: '전체 데이터 그리드, 다중 필터 및 일괄 처리',
          en: 'Full data grid, multi-filters, and batch actions',
          ja: '全データグリッド、複数フィルター、一括処理',
          id: 'Grid data lengkap, multi-filter, dan aksi massal',
        }),
      },
      {
        name: pick({ ko: '시스템 환경 설정', en: 'System Settings', ja: 'システム環境設定', id: 'Pengaturan Sistem' }),
        slug: '/settings',
        type: 'modal' as const,
        script: pick({
          ko: '권한, API 연동 및 환경 구성 모달',
          en: 'Permissions, API integrations, and workspace config modal',
          ja: '権限、API連携、環境構成モーダル',
          id: 'Modal izin, integrasi API, dan konfigurasi sistem',
        }),
      },
    ],
    [pick]
  );

  const rawPageStructure = plan.navigation?.pageStructure;
  const initialPages: PageItem[] = (rawPageStructure && rawPageStructure.length > 0)
    ? rawPageStructure.map((p, idx) => {
        const slugStr = p.slug || '';
        const nameStr = p.name || pick({ ko: `화면 ${idx + 1}`, en: `Screen ${idx + 1}`, ja: `画面 ${idx + 1}`, id: `Layar ${idx + 1}` });
        return {
          id: p.id || `p_${idx}_${Date.now()}`,
          name: nameStr,
          slug: slugStr.startsWith('/') ? slugStr : `/${slugStr}`,
          type: slugStr.includes('modal') || nameStr.includes('모달') || nameStr.toLowerCase().includes('modal')
            ? 'modal' 
            : slugStr.includes('detail') || nameStr.includes('상세') || nameStr.toLowerCase().includes('drawer')
              ? 'drawer' 
              : 'page',
          script: p.script || pick({ ko: '주요 기능 화면', en: 'Core functional screen', ja: '主要機能画面', id: 'Layar fungsi utama' })
        };
      })
    : defaultPages;

  const [pages, setPages] = useState<PageItem[]>(initialPages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editType, setEditType] = useState<'page' | 'modal' | 'drawer'>('page');
  const [editScript, setEditScript] = useState('');

  const [navPattern, setNavPattern] = useState<'modal_flow' | 'sidebar_flow' | 'tab_flow'>('modal_flow');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const syncChanges = (updatedPages: PageItem[], pattern: 'modal_flow' | 'sidebar_flow' | 'tab_flow') => {
    setPages(updatedPages);

    const patternText = pattern === 'modal_flow' 
      ? pick({ ko: '모달 기반 팝업 워크플로우', en: 'Modal-based popup workflow', ja: 'モーダルベースのポップアップワークフロー', id: 'Alur kerja popup berbasis modal' })
      : pattern === 'sidebar_flow' 
        ? pick({ ko: '사이드바 + 상세 드로어 복합 레이아웃', en: 'Sidebar + detail drawer composite layout', ja: 'サイドバー + 詳細ドロワー複合レイアウト', id: 'Tata letak gabungan sidebar + laci detail' })
        : pick({ ko: '상단 탭 바 이동 내비게이션', en: 'Top tab bar navigation', ja: '上部タブバー移動ナビゲーション', id: 'Navigasi bilah tab atas' });

    const pageListSummary = updatedPages.map((p, idx) => 
      `${idx + 1}. [${p.type.toUpperCase()}] ${p.name} (${p.slug})\n   - ${p.script}`
    ).join('\n\n');

    onInputChange(4, 'screen_list', pageListSummary);
    onInputChange(
      4,
      'interaction_flow',
      pick({
        ko: `내비게이션 패턴: ${patternText}\n총 ${updatedPages.length}개 화면 간 유기적 전환 플로우`,
        en: `Navigation Pattern: ${patternText}\nSeamless transition flow across ${updatedPages.length} screens`,
        ja: `ナビゲーションパターン: ${patternText}\n計 ${updatedPages.length}画面間のシームレスな遷移フロー`,
        id: `Pola Navigasi: ${patternText}\nAlur transisi terpadu antar ${updatedPages.length} layar`,
      })
    );

    setPlan({
      ...plan,
      navigation: {
        ...plan.navigation,
        pageStructure: updatedPages.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          depth: p.type === 'page' ? 1 : 2,
          script: p.script,
          route: p.slug,
          purpose: p.script,
        })),
        menus: updatedPages.filter(p => p.type === 'page').map(p => p.name)
      }
    });
  };

  const handleStartEdit = (p: PageItem) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSlug(p.slug);
    setEditType(p.type);
    setEditScript(p.script);
  };

  const handleSaveEdit = (id: string) => {
    const updated = pages.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name: editName.trim() || p.name,
          slug: editSlug.trim().startsWith('/') ? editSlug.trim() : `/${editSlug.trim()}`,
          type: editType,
          script: editScript.trim() || p.script,
        };
      }
      return p;
    });

    setEditingId(null);
    syncChanges(updated, navPattern);
  };

  const handleDeletePage = (id: string) => {
    if (pages.length <= 1) {
      setNoticeMessage(
        pick({
          ko: '최소 1개 이상의 메인 화면이 필요합니다.',
          en: 'At least 1 main screen is required.',
          ja: '少なくとも1つ以上のメイン画面が必要です。',
          id: 'Minimal harus ada 1 layar utama.',
        })
      );
      setTimeout(() => setNoticeMessage(null), 2500);
      return;
    }
    const updated = pages.filter(p => p.id !== id);
    syncChanges(updated, navPattern);
  };

  const handleAddPage = (suggested?: { name: string; slug: string; type: 'page' | 'modal' | 'drawer'; script: string }) => {
    const newPage: PageItem = suggested ? {
      id: `p_${Date.now()}`,
      name: suggested.name,
      slug: suggested.slug,
      type: suggested.type,
      script: suggested.script
    } : {
      id: `p_${Date.now()}`,
      name: pick({ ko: `새 화면 ${pages.length + 1}`, en: `New Screen ${pages.length + 1}`, ja: `新規画面 ${pages.length + 1}`, id: `Layar Baru ${pages.length + 1}` }),
      slug: `/screen-${pages.length + 1}`,
      type: 'page',
      script: pick({ ko: '신규 기능 화면', en: 'New functional screen', ja: '新規機能画面', id: 'Layar fitur baru' }),
    };

    const updated = [...pages, newPage];
    syncChanges(updated, navPattern);
  };

  const handlePatternChange = (pattern: 'modal_flow' | 'sidebar_flow' | 'tab_flow') => {
    setNavPattern(pattern);
    syncChanges(pages, pattern);
  };

  const getTypeLabel = (type: 'page' | 'modal' | 'drawer') => {
    switch (type) {
      case 'page':
        return <span className="text-[14px] font-mono font-bold text-[var(--theme-ink-secondary)]">PAGE</span>;
      case 'modal':
        return <span className="text-[14px] font-mono font-bold text-[var(--theme-ink-strong)]">MODAL</span>;
      case 'drawer':
        return <span className="text-[14px] font-mono font-bold text-[var(--theme-ink-strong)]">DRAWER</span>;
    }
  };

  return (
    <div className="space-y-10 text-[var(--theme-ink-primary)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--theme-ink-strong)]">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em] shrink-0">
              03
            </span>
            <h2
              className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.02em] leading-snug ${
                largeTextMode ? 'text-[26px] sm:text-[30px]' : 'text-[22px] sm:text-[26px]'
              }`}
            >
              {pick({
                ko: '화면 구조 및 내비게이션 아키텍처',
                en: 'Screen Structure & Navigation Architecture',
                ja: '画面構成およびナビゲーション設計',
                id: 'Struktur Layar & Arsitektur Navigasi',
              })}
            </h2>
            <span className="text-[15px] font-bold text-[var(--theme-ink-secondary)] tabular-nums">
              {pick({
                ko: `${pages.length}개 화면 연동`,
                en: `${pages.length} screens linked`,
                ja: `${pages.length}画面連携`,
                id: `${pages.length} layar terhubung`,
              })}
            </span>
          </div>
          <p className={`text-[var(--theme-ink-secondary)] pl-9 ${largeTextMode ? 'text-[17px]' : 'text-[15px]'}`}>
            {pick({
              ko: '서비스에 필요한 핵심 화면을 정의하고 이용 동선(Happy Path Flow)을 연결합니다.',
              en: 'Define the core screens for your service and connect them into a cohesive user flow.',
              ja: 'サービスに必要な主要画面を定義し、利用動線 (Happy Path Flow) を接続します。',
              id: 'Tentukan layar inti layanan dan hubungkan alur interaksi pengguna.',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleAddPage()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[16px] font-bold transition-colors cursor-pointer self-start shrink-0 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>{pick({ ko: '화면 추가', en: 'Add Screen', ja: '画面を追加', id: 'Tambah Layar' })}</span>
        </button>
      </div>

      {noticeMessage && (
        <div className="px-5 py-3.5 rounded-none bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] text-[var(--theme-danger)] text-[16px] font-bold">
          {noticeMessage}
        </div>
      )}

      {/* A. Interactive Page Cards List */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
              largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
            }`}
          >
            <Layers size={18} className="shrink-0" />
            <span className="font-mono text-[var(--theme-ink-secondary)]">A.</span>
            <span>
              {pick({
                ko: '화면 및 모달 목록 (Information Architecture)',
                en: 'Screens & Modals (Information Architecture)',
                ja: '画面およびモーダル一覧 (Information Architecture)',
                id: 'Daftar Layar & Modal (Arsitektur Informasi)',
              })}
            </span>
          </h3>
          <span className="text-[15px] text-[var(--theme-ink-muted)]">
            {pick({
              ko: '편집 아이콘을 눌러 세부 수정 가능',
              en: 'Click edit icon to customize details',
              ja: '編集アイコンをクリックして詳細を変更',
              id: 'Klik ikon edit untuk mengubah detail',
            })}
          </span>
        </div>

        <div className="space-y-4">
          {pages.map((p, idx) => {
            const isEditing = editingId === p.id;
            return (
              <div
                key={p.id}
                className={`p-6 rounded-none border transition-colors ${
                  isEditing 
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]' 
                    : 'bg-[var(--theme-stage)] border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[var(--theme-ink-strong)] block">
                          {pick({ ko: '화면 명칭', en: 'Screen Name', ja: '画面名', id: 'Nama Layar' })}
                        </span>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-4 py-3 text-[17px] text-[var(--theme-ink-strong)] outline-none transition-colors"
                          placeholder={pick({ ko: '예: 메인 관리 대시보드', en: 'e.g., Main Admin Dashboard', ja: '例: メイン管理ダッシュボード', id: 'Mis. Dasbor Admin Utama' })}
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[var(--theme-ink-strong)] block">
                          {pick({ ko: '경로 (URL Slug)', en: 'Route (URL Slug)', ja: 'パス (URL Slug)', id: 'Rute (URL Slug)' })}
                        </span>
                        <input
                          type="text"
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-4 py-3 text-[17px] font-mono text-[var(--theme-ink-strong)] outline-none transition-colors"
                          placeholder="/records"
                        />
                      </div>
                      <div className="sm:col-span-1 space-y-2">
                        <span className="text-[15px] font-bold text-[var(--theme-ink-strong)] block">
                          {pick({ ko: '화면 유형', en: 'Screen Type', ja: '画面タイプ', id: 'Tipe Layar' })}
                        </span>
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as any)}
                          className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-4 py-3 text-[17px] text-[var(--theme-ink-strong)] outline-none transition-colors cursor-pointer"
                        >
                          <option value="page">{pick({ ko: '단일 페이지 (Page)', en: 'Full Page (Page)', ja: '単一ページ (Page)', id: 'Halaman Penuh (Page)' })}</option>
                          <option value="modal">{pick({ ko: '팝업 모달 (Modal)', en: 'Popup Modal (Modal)', ja: 'ポップアップモーダル (Modal)', id: 'Modal Popup (Modal)' })}</option>
                          <option value="drawer">{pick({ ko: '사이드 서랍 (Drawer)', en: 'Side Drawer (Drawer)', ja: 'サイドドロワー (Drawer)', id: 'Laci Samping (Drawer)' })}</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[15px] font-bold text-[var(--theme-ink-strong)] block">
                        {pick({ ko: '핵심 기능 및 역할 요약', en: 'Core Function & Role Summary', ja: '主要機能と役割の要約', id: 'Ringkasan Fungsi & Peran Utama' })}
                      </span>
                      <input
                        type="text"
                        value={editScript}
                        onChange={(e) => setEditScript(e.target.value)}
                        className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-4 py-3 text-[17px] text-[var(--theme-ink-strong)] outline-none transition-colors"
                        placeholder={pick({
                          ko: '이 화면에서 수행할 작업이나 기능 요약',
                          en: 'Tasks or actions performed on this screen',
                          ja: 'この画面で実行するタスクや機能の要約',
                          id: 'Tugas atau fungsi yang dilakukan pada layar ini',
                        })}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-5 py-2.5 rounded-none border border-[var(--theme-border-hairline)] text-[16px] font-bold text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)] cursor-pointer bg-[var(--theme-canvas)]"
                      >
                        {pick({ ko: '취소', en: 'Cancel', ja: 'キャンセル', id: 'Batal' })}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(p.id)}
                        className="px-5 py-2.5 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[16px] font-bold hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] cursor-pointer transition-colors"
                      >
                        {pick({ ko: '수정 저장', en: 'Save Changes', ja: '変更を保存', id: 'Simpan Perubahan' })}
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-bold tabular-nums text-[16px] text-[var(--theme-ink-secondary)]">
                          0{idx + 1}.
                        </span>
                        <span className="font-extrabold text-[18px] sm:text-[19px] text-[var(--theme-ink-strong)]">{p.name}</span>
                        <span className="font-mono text-[15px] text-[var(--theme-ink-secondary)] font-bold">
                          {p.slug}
                        </span>
                        <span className="text-[var(--theme-border-strong)]">·</span>
                        {getTypeLabel(p.type)}
                      </div>
                      <p className="text-[16px] sm:text-[17px] text-[var(--theme-ink-secondary)] leading-[1.65]">
                        {p.script}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-none border border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)] transition-colors cursor-pointer"
                        title={pick({ ko: '화면 정보 수정', en: 'Edit screen', ja: '画面情報を編集', id: 'Edit layar' })}
                        aria-label={pick({ ko: '화면 정보 수정', en: 'Edit screen', ja: '画面情報を編集', id: 'Edit layar' })}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(p.id)}
                        className="inline-flex items-center justify-center h-10 w-10 rounded-none border border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-hover-text)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)] transition-colors cursor-pointer"
                        title={pick({ ko: '화면 삭제', en: 'Delete screen', ja: '画面を削除', id: 'Hapus layar' })}
                        aria-label={pick({ ko: '화면 삭제', en: 'Delete screen', ja: '画面を削除', id: 'Hapus layar' })}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Add Suggested Pages */}
        <div className="pt-3 flex flex-wrap items-center gap-2.5">
          <span className="text-[16px] font-bold text-[var(--theme-ink-strong)]">
            {pick({ ko: '추천 화면:', en: 'Suggested:', ja: '推奨画面:', id: 'Saran Layar:' })}
          </span>
          {suggestedPages.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleAddPage(s)}
              className="px-4 py-2 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-active-bg)] text-[15px] text-[var(--theme-ink-primary)] hover:text-[var(--theme-active-text)] hover:border-[var(--theme-ink-strong)] transition-colors cursor-pointer flex items-center gap-2 font-bold"
            >
              <span>+</span>
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* B. Navigation Flow & Pattern Selection */}
      <div className="space-y-4 pt-6 border-t border-[var(--theme-border-hairline)]">
        <h3
          className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
            largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
          }`}
        >
          <MoveRight size={18} className="shrink-0" />
          <span className="font-mono text-[var(--theme-ink-secondary)]">B.</span>
          <span>
            {pick({
              ko: '화면 간 이동 및 인터랙션 방식',
              en: 'Screen Navigation & Interaction Pattern',
              ja: '画面間遷移・インタラクション方式',
              id: 'Pola Navigasi & Interaksi Antar Layar',
            })}
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          <button
            type="button"
            onClick={() => handlePatternChange('modal_flow')}
            aria-pressed={navPattern === 'modal_flow'}
            className={`w-full p-5 sm:p-6 rounded-none text-left transition-colors cursor-pointer flex items-start justify-between gap-4 ${
              navPattern === 'modal_flow'
                ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
            }`}
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                {pick({ ko: '모달 기반 팝업 워크플로우', en: 'Modal Popup Workflow', ja: 'モーダルポップアップ型', id: 'Alur Modal Popup' })}
              </div>
              <p className="text-[15px] text-[var(--theme-ink-secondary)] leading-[1.65]">
                {pick({
                  ko: '화면 전환 없이 현재 뷰 위에서 모달로 빠르게 등록 및 확인',
                  en: 'Create and inspect via modal overlays without losing context',
                  ja: '画面遷移なしで現在のビュー上から素早く登録・確認',
                  id: 'Buat dan tinjau cepat lewat modal tanpa berpindah halaman',
                })}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              {navPattern === 'modal_flow' ? (
                <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('sidebar_flow')}
            aria-pressed={navPattern === 'sidebar_flow'}
            className={`w-full p-5 sm:p-6 rounded-none text-left transition-colors cursor-pointer flex items-start justify-between gap-4 ${
              navPattern === 'sidebar_flow'
                ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
            }`}
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                {pick({ ko: '사이드바 + 상세 드로어', en: 'Sidebar + Detail Drawer', ja: 'サイドバー + 詳細ドロワー', id: 'Sidebar + Laci Detail' })}
              </div>
              <p className="text-[15px] text-[var(--theme-ink-secondary)] leading-[1.65]">
                {pick({
                  ko: '사이드바 메뉴 ➔ 중앙 데이터 그리드 ➔ 우측 슬라이드 서랍 형태',
                  en: 'Sidebar menu ➔ central data grid ➔ right slide-over drawer',
                  ja: 'サイドバー ➔ 中央データグリッド ➔ 右スライドドロワー構成',
                  id: 'Menu sidebar ➔ grid data tengah ➔ laci geser kanan',
                })}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              {navPattern === 'sidebar_flow' ? (
                <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
              )}
            </div>
          </button>

          <button
            type="button"
            onClick={() => handlePatternChange('tab_flow')}
            aria-pressed={navPattern === 'tab_flow'}
            className={`w-full p-5 sm:p-6 rounded-none text-left transition-colors cursor-pointer flex items-start justify-between gap-4 ${
              navPattern === 'tab_flow'
                ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)]'
                : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:border-[var(--theme-ink-strong)]'
            }`}
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="text-[17px] sm:text-[18px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                {pick({ ko: '상단 탭 바 이동', en: 'Top Tab Navigation', ja: '上部タブバー移動', id: 'Navigasi Tab Atas' })}
              </div>
              <p className="text-[15px] text-[var(--theme-ink-secondary)] leading-[1.65]">
                {pick({
                  ko: '상단 탭으로 전체/오늘/완료 상태를 빠르게 넘겨보는 직관적 뷰',
                  en: 'Switch rapidly between All / Today / Completed views via top tabs',
                  ja: '上部タブで全件・本日・完了を素早く切り替える直感的ビュー',
                  id: 'Beralih cepat antar tab Semua / Hari Ini / Selesai di bagian atas',
                })}
              </p>
            </div>
            <div className="shrink-0 pt-0.5">
              {navPattern === 'tab_flow' ? (
                <span className="w-6 h-6 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center">
                  <Check size={14} strokeWidth={3} />
                </span>
              ) : (
                <span className="w-6 h-6 rounded-none border border-[var(--theme-border-strong)] bg-[var(--theme-canvas)] block" />
              )}
            </div>
          </button>
        </div>
      </div>

      {/* C. Visual Connection Flow Diagram */}
      <div className="p-6 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
              largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
            }`}
          >
            <span className="font-mono text-[var(--theme-ink-secondary)]">C.</span>
            <span>
              {pick({
                ko: '실시간 화면 동선 시각화',
                en: 'Live Screen Flow Visualization',
                ja: 'リアルタイム画面動線ビジュアライザー',
                id: 'Visualisasi Alur Layar Langsung',
              })}
            </span>
          </h3>
          <span className="font-mono text-[15px] text-[var(--theme-ink-secondary)]">
            {pick({
              ko: '04_SPEC.md 자동 동기화',
              en: 'Auto-synced to 04_SPEC.md',
              ja: '04_SPEC.md 自動同期',
              id: 'Tersinkron ke 04_SPEC.md',
            })}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {pages.map((p, idx) => (
            <React.Fragment key={p.id}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-none bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] text-[15px]">
                <span className="tabular-nums text-[var(--theme-ink-secondary)] font-bold">0{idx + 1}.</span>
                <span className="text-[var(--theme-ink-strong)] font-bold">{p.name}</span>
                <span className="font-mono text-[14px] text-[var(--theme-ink-secondary)] font-bold">
                  {p.slug}
                </span>
              </div>
              {idx < pages.length - 1 && (
                <ArrowRight size={15} className="text-[var(--theme-ink-muted)] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
