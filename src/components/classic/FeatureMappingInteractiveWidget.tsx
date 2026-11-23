import React, { useState, useMemo } from 'react';
import { 
  Plus, Trash2, 
  Layers, RefreshCw, ArrowRightCircle
} from 'lucide-react';
import { SitePlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface FeatureMappingInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
}

interface FeatureItem {
  id: string;
  title: string;
  priority: 'P0 필수' | 'P1 중요' | 'P2 부가';
  targetScreen: string;
  description: string;
}

interface HappyPathStep {
  step: number;
  action: string;
  result: string;
}

export const FeatureMappingInteractiveWidget: React.FC<FeatureMappingInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
}) => {
  const { pick } = useLanguage();

  const statusTemplates = useMemo(
    () => [
      {
        name: pick({
          ko: '3단계 배포 파이프라인',
          en: '3-Stage Deploy Pipeline',
          ja: '3段階デプロイパイプライン',
          id: 'Pipeline Deploy 3-Tahap',
        }),
        steps: ['Development', 'Staging', 'Production'],
      },
      {
        name: pick({
          ko: '4단계 태스크 라이프사이클',
          en: '4-Stage Task Lifecycle',
          ja: '4段階タスクライフサイクル',
          id: 'Siklus Tugas 4-Tahap',
        }),
        steps: ['Backlog', 'In Progress', 'In Review', 'Resolved'],
      },
      {
        name: pick({
          ko: '3단계 데이터 퍼블리싱',
          en: '3-Stage Data Publishing',
          ja: '3段階データ公開',
          id: 'Publikasi Data 3-Tahap',
        }),
        steps: ['Draft', 'In Review', 'Published'],
      },
    ],
    [pick]
  );

  const [features, setFeatures] = useState<FeatureItem[]>(() => [
    {
      id: 'f1',
      title: pick({
        ko: '사용자 인증 및 세션 관리 (JWT & SSO)',
        en: 'User Auth & Session Management (JWT & SSO)',
        ja: 'ユーザー認証とセッション管理 (JWT & SSO)',
        id: 'Autentikasi Pengguna & Manajemen Sesi (JWT & SSO)',
      }),
      priority: 'P0 필수',
      targetScreen: pick({
        ko: '인증 게이트웨이 (/auth/login)',
        en: 'Auth Gateway (/auth/login)',
        ja: '認証ゲートウェイ (/auth/login)',
        id: 'Gerbang Autentikasi (/auth/login)',
      }),
      description: pick({
        ko: '토큰 기반 세션 관리 및 역할 기반 권한 제어(RBAC)',
        en: 'Token-based session handling and Role-Based Access Control (RBAC)',
        ja: 'トークンベースのセッション管理およびロールベース権限制御 (RBAC)',
        id: 'Manajemen sesi berbasis token dan kontrol akses berbasis peran (RBAC)',
      }),
    },
    {
      id: 'f2',
      title: pick({
        ko: '실시간 메트릭 대시보드 (KPI Overview)',
        en: 'Real-Time Metrics Dashboard (KPI Overview)',
        ja: 'リアルタイムメトリクスダッシュボード (KPI Overview)',
        id: 'Dasbor Metrik Real-Time (KPI Overview)',
      }),
      priority: 'P0 필수',
      targetScreen: pick({
        ko: '워크스페이스 대시보드 (/dashboard)',
        en: 'Workspace Dashboard (/dashboard)',
        ja: 'ワークスペースダッシュボード (/dashboard)',
        id: 'Dasbor Workspace (/dashboard)',
      }),
      description: pick({
        ko: '핵심 성능 지표, 최근 활동 로그 및 실시간 데이터 갱신',
        en: 'Core performance metrics, recent activity log, and live data updates',
        ja: '主要パフォーマンス指標、最近のアクティビティログ、リアルタイムデータ更新',
        id: 'Indikator kinerja utama, log aktivitas terbaru, dan pembaruan data langsung',
      }),
    },
    {
      id: 'f3',
      title: pick({
        ko: '고성능 데이터 테이블 & 스마트 검색',
        en: 'High-Performance Data Table & Smart Search',
        ja: '高性能データテーブル & スマート検索',
        id: 'Tabel Data Kinerja Tinggi & Pencarian Cerdas',
      }),
      priority: 'P1 중요',
      targetScreen: pick({
        ko: '프로젝트 및 리소스 관리 (/projects)',
        en: 'Projects & Resource Management (/projects)',
        ja: 'プロジェクト・リソース管理 (/projects)',
        id: 'Manajemen Proyek & Sumber Daya (/projects)',
      }),
      description: pick({
        ko: '대용량 데이터 가상화 스크롤, 다중 조건 필터링 및 즉시 검색',
        en: 'Virtualized large datasets, multi-condition filtering, and instant search',
        ja: '大容量データの仮想スクロール、複数条件フィルタリング、即時検索',
        id: 'Gulir virtualisasi data besar, pemfilteran multi-kondisi, dan pencarian instan',
      }),
    },
  ]);

  const [happyPathSteps, setHappyPathSteps] = useState<HappyPathStep[]>(() => [
    {
      step: 1,
      action: pick({
        ko: '웹 서비스 접속 및 SSO 간편 인증',
        en: 'Open web app & sign in with SSO',
        ja: 'WebサービスへアクセスしSSO簡易認証',
        id: 'Buka aplikasi web & masuk cepat dengan SSO',
      }),
      result: pick({
        ko: '세션 토큰 발급 및 워크스페이스 대시보드로 이동',
        en: 'Session token issued and redirected to workspace dashboard',
        ja: 'セッショントークンを発行しワークスペースダッシュボードへ遷移',
        id: 'Token sesi diterbitkan dan diarahkan ke dasbor workspace',
      }),
    },
    {
      step: 2,
      action: pick({
        ko: '워크스페이스 대시보드에서 핵심 KPI 지표 확인',
        en: 'Review core KPI metrics on workspace dashboard',
        ja: 'ワークスペースダッシュボードで主要KPI指標を確認',
        id: 'Periksa indikator KPI inti di dasbor workspace',
      }),
      result: pick({
        ko: '실시간 차트 및 상태 위젯 0ms 렌더링',
        en: 'Instant rendering of live charts and status widgets',
        ja: 'リアルタイムチャートおよび状態ウィジェットを即時描画',
        id: 'Grafik langsung dan widget status dirender seketika',
      }),
    },
    {
      step: 3,
      action: pick({
        ko: '신규 리소스 생성 및 속성 정의 후 저장',
        en: 'Create new resource, define attributes, and save',
        ja: '新規リソースを作成・属性定義して保存',
        id: 'Buat sumber daya baru, atur atribut, dan simpan',
      }),
      result: pick({
        ko: 'REST/GraphQL API 연동 및 데이터베이스 즉각 반영',
        en: 'Synced with REST/GraphQL API and persisted to database immediately',
        ja: 'REST/GraphQL API連携およびデータベースへ即時反映',
        id: 'Tersinkron ke REST/GraphQL API dan langsung tersimpan di basis data',
      }),
    },
    {
      step: 4,
      action: pick({
        ko: '데이터 파이프라인 상태 전이 및 배포 완료',
        en: 'Transition pipeline state and complete deployment',
        ja: 'データパイプラインの状態遷移とデプロイ完了',
        id: 'Transisikan status pipeline data dan selesaikan deploy',
      }),
      result: pick({
        ko: '결과 감사 로그 기록 및 시스템 지표 동기화',
        en: 'Audit log recorded and system metrics synchronized',
        ja: '結果監査ログを記録しシステム指標を同期',
        id: 'Log audit hasil tercatat dan metrik sistem tersinkronisasi',
      }),
    },
  ]);

  const [selectedStatusTpl, setSelectedStatusTpl] = useState(0);
  const [customStatuses, setCustomStatuses] = useState<string[]>(statusTemplates[0].steps);
  const [activeSimulationStatus, setActiveSimulationStatus] = useState<number>(0);

  // Available screens for dropdown
  const availableScreens = plan.navigation?.pageStructure?.map(p => `${p.name} (${p.slug})`) || [
    pick({ ko: '워크스페이스 대시보드 (/dashboard)', en: 'Workspace Dashboard (/dashboard)', ja: 'ワークスペースダッシュボード (/dashboard)', id: 'Dasbor Workspace (/dashboard)' }),
    pick({ ko: '프로젝트 관리 (/projects)', en: 'Project Management (/projects)', ja: 'プロジェクト管理 (/projects)', id: 'Manajemen Proyek (/projects)' }),
    pick({ ko: '설정 및 권한 (/settings)', en: 'Settings & Permissions (/settings)', ja: '設定と権限 (/settings)', id: 'Pengaturan & Izin (/settings)' }),
  ];

  const syncToBundle = (
    updatedFeatures: FeatureItem[], 
    updatedSteps: HappyPathStep[], 
    statuses: string[]
  ) => {
    // 1. Sync Chapter 3 natural language inputs
    const featuresSummary = updatedFeatures
      .map((f, i) => `${i + 1}. [${f.priority}] ${f.title} (${f.targetScreen})\n   - ${f.description}`)
      .join('\n\n');
    onInputChange(3, 'core_features', featuresSummary);

    // 3_user_journey (Happy Path):
    const journeySummary = updatedSteps
      .map(s => `Step ${s.step}: ${s.action} ➔ ${s.result}`)
      .join('\n');
    const lifecycleLabel = pick({
      ko: '[상태 순환 수명주기]',
      en: '[State Lifecycle]',
      ja: '[状態循環ライフサイクル]',
      id: '[Siklus Hidup Status]',
    });
    const lifecycleText = `\n\n${lifecycleLabel}\n${statuses.join(' ➔ ')}`;
    onInputChange(3, 'user_journey', `${journeySummary}${lifecycleText}`);

    // 2. Also keep plan.features synced if applicable
    if (plan.features) {
      setPlan({
        ...plan,
        features: {
          ...plan.features,
          list: updatedFeatures.map(f => ({
            id: f.id,
            name: f.title,
            priority: (f.priority || '').startsWith('P0') ? 'P0' : (f.priority || '').startsWith('P1') ? 'P1' : 'P2',
            description: `${f.description} (${f.targetScreen})`,
            mappedScreens: [f.targetScreen],
          }))
        }
      });
    }
  };

  const handleAddFeature = () => {
    const newFeature: FeatureItem = {
      id: `f_${Date.now()}`,
      title: pick({
        ko: `신규 기능 ${features.length + 1}`,
        en: `New Feature ${features.length + 1}`,
        ja: `新規機能 ${features.length + 1}`,
        id: `Fitur Baru ${features.length + 1}`,
      }),
      priority: 'P1 중요',
      targetScreen: availableScreens[0] || pick({ ko: '메인 대시보드 (/dashboard)', en: 'Main Dashboard (/dashboard)', ja: 'メインダッシュボード (/dashboard)', id: 'Dasbor Utama (/dashboard)' }),
      description: pick({
        ko: '사용자가 편리하게 작업할 수 있도록 지원하는 핵심 기능',
        en: 'Core feature enabling smooth user workflows',
        ja: 'ユーザーがスムーズに作業できるよう支援する中核機能',
        id: 'Fitur inti yang mendukung alur kerja pengguna secara lancar',
      }),
    };
    const updated = [...features, newFeature];
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleUpdateFeature = (id: string, field: keyof FeatureItem, val: string) => {
    const updated = features.map(f => f.id === id ? { ...f, [field]: val } : f);
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleDeleteFeature = (id: string) => {
    if (features.length <= 1) {
      return;
    }
    const updated = features.filter(f => f.id !== id);
    setFeatures(updated);
    syncToBundle(updated, happyPathSteps, customStatuses);
  };

  const handleUpdateHappyPath = (stepNum: number, field: 'action' | 'result', val: string) => {
    const updated = happyPathSteps.map(s => s.step === stepNum ? { ...s, [field]: val } : s);
    setHappyPathSteps(updated);
    syncToBundle(features, updated, customStatuses);
  };

  const handleSelectStatusTemplate = (idx: number) => {
    setSelectedStatusTpl(idx);
    const newCycle = statusTemplates[idx].steps;
    setCustomStatuses(newCycle);
    syncToBundle(features, happyPathSteps, newCycle);
  };

  return (
    <div className="space-y-12 text-[var(--theme-ink-primary)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[var(--theme-ink-strong)]">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[16px] sm:text-[18px] font-extrabold tabular-nums text-[var(--theme-ink-secondary)] tracking-[0.08em]">
              03
            </span>
            <h3 className="font-extrabold text-[var(--theme-ink-strong)] text-[22px] sm:text-[26px] tracking-[-0.02em]">
              {pick({
                ko: '핵심 기능 ↔ 화면 매핑 및 성공 여정',
                en: 'Core Features ↔ Screen Mapping & Happy Path',
                ja: '主要機能 ↔ 画面マッピング & ハッピーパス',
                id: 'Pemetaan Fitur Inti ↔ Layar & Alur Sukses',
              })}
            </h3>
            <span className="text-[15px] font-bold font-mono text-[var(--theme-ink-secondary)]">
              02_roadmap.md
            </span>
          </div>
          <p className="text-[17px] sm:text-[19px] text-[var(--theme-ink-secondary)] leading-[1.7] pl-8">
            {pick({
              ko: '소프트웨어가 제공할 필수 기능을 정의하고, 대상 화면과 사용자의 가장 이상적인 이용 동선을 매핑합니다.',
              en: 'Define essential software capabilities and map each feature to target screens and optimal user journeys.',
              ja: 'ソフトウェアが提供する必須機能を定義し、対象画面と最適なユーザー利用動線をマッピングします。',
              id: 'Tentukan fitur penting perangkat lunak dan petakan ke layar target serta alur pengguna terbaik.',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddFeature}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[16px] font-bold transition-colors cursor-pointer self-start shrink-0 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>{pick({ ko: '기능 추가', en: 'Add Feature', ja: '機能を追加', id: 'Tambah Fitur' })}</span>
        </button>
      </div>

      {/* 1. Feature to Screen Mapping */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[18px] sm:text-[20px] font-extrabold text-[var(--theme-ink-strong)]">
            <Layers size={18} className="text-[var(--theme-ink-strong)]" />
            <span>
              {pick({
                ko: '필수 핵심 기능 ↔ 대상 화면 매핑',
                en: 'Core Feature ↔ Screen Mapping',
                ja: '必須機能 ↔ 対象画面マッピング',
                id: 'Pemetaan Fitur Utama ↔ Layar Target',
              })}
            </span>
          </div>
          <span className="text-[15px] text-[var(--theme-ink-muted)] font-medium">
            {pick({
              ko: '각 기능이 어느 화면에서 동작하는지 지정',
              en: 'Assign the screen where each feature operates',
              ja: '各機能が動作する画面を指定',
              id: 'Tentukan layar tempat setiap fitur berjalan',
            })}
          </span>
        </div>

        <div className="space-y-5">
          {features.map((f, idx) => (
            <div
              key={f.id}
              className="p-6 sm:p-7 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] space-y-4 transition-colors"
            >
              {/* Top Row: Index, Feature Title, Priority Selector, Delete Button */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <span className="font-bold tabular-nums text-[16px] text-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-3 py-2.5 rounded-none shrink-0">
                  #0{idx + 1}
                </span>

                <input
                  type="text"
                  value={f.title}
                  onChange={(e) => handleUpdateFeature(f.id, 'title', e.target.value)}
                  className="flex-1 min-w-[200px] bg-[var(--theme-canvas)] rounded-none px-4 py-3 text-[17px] sm:text-[18px] font-bold text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] transition-colors"
                  placeholder={pick({
                    ko: '기능 명칭 (예: 원클릭 리소스 생성 및 필터링)',
                    en: 'Feature title (e.g., One-click resource creation & filtering)',
                    ja: '機能名 (例: ワンクリックリソース作成とフィルタリング)',
                    id: 'Nama fitur (mis. Pembuatan sumber daya & filter sekali klik)',
                  })}
                />

                <select
                  value={f.priority}
                  onChange={(e) => handleUpdateFeature(f.id, 'priority', e.target.value as any)}
                  className="bg-[var(--theme-canvas)] rounded-none px-3.5 py-3 text-[16px] font-bold text-[var(--theme-ink-strong)] outline-none border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] cursor-pointer transition-colors shrink-0"
                >
                  <option value="P0 필수">{pick({ ko: 'P0 필수', en: 'P0 Must', ja: 'P0 必須', id: 'P0 Wajib' })}</option>
                  <option value="P1 중요">{pick({ ko: 'P1 중요', en: 'P1 High', ja: 'P1 重要', id: 'P1 Penting' })}</option>
                  <option value="P2 부가">{pick({ ko: 'P2 부가', en: 'P2 Nice', ja: 'P2 任意', id: 'P2 Tambahan' })}</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteFeature(f.id)}
                  className="inline-flex items-center justify-center h-11 w-11 text-[var(--theme-ink-secondary)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:text-[var(--theme-hover-text)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)] rounded-none transition-colors cursor-pointer shrink-0"
                  title={pick({ ko: '기능 삭제', en: 'Delete feature', ja: '機能を削除', id: 'Hapus fitur' })}
                  aria-label={pick({ ko: '기능 삭제', en: 'Delete feature', ja: '機能を削除', id: 'Hapus fitur' })}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Bottom Row: Detailed Description & Target Screen Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={f.description}
                    onChange={(e) => handleUpdateFeature(f.id, 'description', e.target.value)}
                    className="w-full bg-[var(--theme-canvas)] rounded-none px-4 py-3 text-[16px] sm:text-[17px] text-[var(--theme-ink-body)] focus:text-[var(--theme-ink-strong)] placeholder-[var(--theme-ink-muted)] outline-none border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] transition-colors"
                    placeholder={pick({
                      ko: '기능에 대한 상세 동작 설명 (예: 3초 안에 빠르게 입력)',
                      en: 'Detailed behavior description (e.g., Quick entry within 3 seconds)',
                      ja: '機能の詳細動作説明 (例: 3秒以内に素早く入力)',
                      id: 'Deskripsi perilaku fitur (mis. Input cepat dalam 3 detik)',
                    })}
                  />
                </div>
                <div className="sm:col-span-1">
                  <select
                    value={f.targetScreen}
                    onChange={(e) => handleUpdateFeature(f.id, 'targetScreen', e.target.value)}
                    className="w-full bg-[var(--theme-canvas)] rounded-none px-3.5 py-3 text-[16px] text-[var(--theme-ink-body)] focus:text-[var(--theme-ink-strong)] outline-none border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] truncate cursor-pointer transition-colors"
                  >
                    {availableScreens.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. State Machine / Lifecycle Cycler */}
      <div className="space-y-5 pt-8 border-t border-[var(--theme-border-hairline)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[18px] sm:text-[20px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2.5">
            <RefreshCw size={18} className="text-[var(--theme-ink-strong)]" />
            <span>
              {pick({
                ko: '리소스 상태 전이 수명주기 (State Machine)',
                en: 'Resource Lifecycle State Machine',
                ja: 'リソース状態遷移ライフサイクル (State Machine)',
                id: 'Siklus Hidup Transisi Status (State Machine)',
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectStatusTemplate(idx)}
                className={`px-4 py-2 rounded-none text-[15px] font-bold transition-colors cursor-pointer border ${
                  selectedStatusTpl === idx
                    ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)]'
                }`}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-7 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[16px] text-[var(--theme-ink-secondary)]">
            <span>
              {pick({
                ko: '순환 상태 파이프라인 (클릭하여 전이 시뮬레이션)',
                en: 'Cyclic status pipeline (click a node to simulate transition)',
                ja: '循環状態パイプライン (クリックして遷移シミュレーション)',
                id: 'Pipeline status siklik (klik untuk simulasi transisi)',
              })}
            </span>
            <span className="font-bold text-[var(--theme-ink-strong)]">
              {pick({
                ko: `현재 활성: ${customStatuses[activeSimulationStatus] || customStatuses[0]}`,
                en: `Active: ${customStatuses[activeSimulationStatus] || customStatuses[0]}`,
                ja: `現在の状態: ${customStatuses[activeSimulationStatus] || customStatuses[0]}`,
                id: `Aktif: ${customStatuses[activeSimulationStatus] || customStatuses[0]}`,
              })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {customStatuses.map((st, i) => {
              const isSelected = activeSimulationStatus === i;

              return (
                <div key={i} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSimulationStatus(i);
                    }}
                    className={`px-4 py-2.5 rounded-none text-[16px] font-bold transition-colors cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                        : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] border-[var(--theme-border-hairline)] hover:text-[var(--theme-ink-strong)] hover:border-[var(--theme-ink-strong)]'
                    }`}
                    title={pick({
                      ko: '클릭하여 상태 전이 확인',
                      en: 'Click to inspect state transition',
                      ja: 'クリックして状態遷移を確認',
                      id: 'Klik untuk melihat transisi status',
                    })}
                  >
                    <span>{st}</span>
                  </button>
                  {i < customStatuses.length - 1 && (
                    <span className="text-[16px] text-[var(--theme-ink-muted)] font-bold select-none">➔</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Happy Path Step Builder */}
      <div className="space-y-5 pt-8 border-t border-[var(--theme-border-hairline)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[18px] sm:text-[20px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2.5">
            <ArrowRightCircle size={18} className="text-[var(--theme-ink-strong)]" />
            <span>
              {pick({
                ko: '사용자 성공 여정 (Happy Path 4단계)',
                en: 'User Happy Path (4 Steps)',
                ja: 'ユーザー成功体験 (Happy Path 4ステップ)',
                id: 'Alur Sukses Pengguna (Happy Path 4 Langkah)',
              })}
            </span>
          </div>
          <span className="text-[15px] text-[var(--theme-ink-muted)] font-medium">
            {pick({
              ko: '목적 달성까지의 최단 무장애 경로',
              en: 'Shortest friction-free route to goal completion',
              ja: '目的達成までの最短ストレスフリー経路',
              id: 'Jalur terpendek bebas hambatan menuju tujuan',
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {happyPathSteps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] space-y-3"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] text-[var(--theme-ink-strong)] font-extrabold tabular-nums shrink-0">
                  0{s.step}.
                </span>
                <input
                  type="text"
                  value={s.action}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'action', e.target.value)}
                  className="flex-1 text-[17px] font-bold text-[var(--theme-ink-strong)] bg-transparent focus:bg-[var(--theme-canvas)] rounded-none border border-transparent focus:border-[var(--theme-ink-strong)] px-3 py-2 outline-none transition-colors"
                  placeholder={pick({
                    ko: `Step ${s.step} 사용자 행동`,
                    en: `Step ${s.step} User Action`,
                    ja: `Step ${s.step} ユーザー操作`,
                    id: `Langkah ${s.step} Aksi Pengguna`,
                  })}
                />
              </div>

              <div className="pl-7">
                <input
                  type="text"
                  value={s.result}
                  onChange={(e) => handleUpdateHappyPath(s.step, 'result', e.target.value)}
                  className="w-full text-[16px] text-[var(--theme-ink-secondary)] focus:text-[var(--theme-ink-strong)] bg-transparent focus:bg-[var(--theme-canvas)] rounded-none border border-transparent focus:border-[var(--theme-ink-strong)] px-3 py-2 outline-none transition-colors"
                  placeholder={pick({
                    ko: '시스템의 즉각 반응 결과',
                    en: 'Immediate system outcome',
                    ja: 'システムの即時応答結果',
                    id: 'Hasil respons instan sistem',
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
