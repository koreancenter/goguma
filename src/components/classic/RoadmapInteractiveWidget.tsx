import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CalendarRange, ShieldCheck, Layers } from 'lucide-react';
import { SitePlan } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import RoadmapChart from '../preview/RoadmapChart';

interface RoadmapInteractiveWidgetProps {
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  largeTextMode?: boolean;
}

interface MilestoneRow {
  id: string;
  phaseCode: string;
  category: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  startMonth: number;
  endMonth: number;
  owner: string;
  deliverables: string;
  exitGate: string;
}

interface ReadinessGate {
  id: string;
  label: string;
  target: string;
  checked: boolean;
}

export const RoadmapInteractiveWidget: React.FC<RoadmapInteractiveWidgetProps> = ({
  plan,
  setPlan,
  onInputChange,
  largeTextMode = false,
}) => {
  const { pick } = useLanguage();

  const presets = useMemo(
    () => [
      {
        id: 'web-saas',
        label: pick({
          ko: 'Web SaaS 표준 (M0–M4)',
          en: 'Web SaaS Standard (M0–M4)',
          ja: 'Web SaaS 標準 (M0–M4)',
          id: 'Standar SaaS Web (M0–M4)',
        }),
        milestones: [
          {
            id: 'ms_0',
            phaseCode: 'M0',
            category: pick({ ko: '설계·RFC', en: 'RFC & Lock', ja: '設計・RFC', id: 'RFC & Lock' }),
            title: pick({
              ko: 'PRD·Tech RFC 승인 & API/DB 스키마 동결',
              en: 'PRD & Tech RFC Sign-off · API/Schema Freeze',
              ja: 'PRD・Tech RFC承認 ＆ API/DBスキーマ凍結',
              id: 'Persetujuan PRD & RFC · Bekukan API/Skema',
            }),
            priority: 'P0' as const,
            startMonth: 1,
            endMonth: 2,
            owner: 'PM / Architect',
            deliverables: pick({
              ko: '시스템 RFC, OpenAPI 3.1 스펙, Figma 디자인 토큰 동결',
              en: 'System RFC, OpenAPI 3.1 contract, Figma token freeze',
              ja: 'システムRFC、OpenAPI 3.1契約、Figmaトークン確定',
              id: 'RFC Sistem, kontrak OpenAPI 3.1, penguncian token Figma',
            }),
            exitGate: pick({
              ko: '아키텍처·보안 리뷰 100% 승인',
              en: '100% Arch & Security RFC Sign-off',
              ja: 'アーキテクチャ・セキュリティレビュー承認完了',
              id: '100% Persetujuan RFC Arsitektur & Keamanan',
            }),
          },
          {
            id: 'ms_1',
            phaseCode: 'M1',
            category: pick({ ko: '코어 Alpha', en: 'Core Alpha', ja: 'コア Alpha', id: 'Inti Alpha' }),
            title: pick({
              ko: '인증·RBAC 및 P0 핵심 워크플로우 (사내 도그푸딩)',
              en: 'Auth/RBAC & Core P0 Flows (Internal Dogfood)',
              ja: '認証/RBAC・P0主要フロー (社内ドッグフーディング)',
              id: 'Auth/RBAC & Alur Inti P0 (Dogfood Internal)',
            }),
            priority: 'P0' as const,
            startMonth: 3,
            endMonth: 5,
            owner: 'FE / BE Lead',
            deliverables: pick({
              ko: 'SSO 인증, 메인 CRUD 파이프라인, CI/CD 및 OpenTelemetry 수집',
              en: 'SSO auth, core CRUD pipeline, CI/CD & OpenTelemetry baseline',
              ja: 'SSO認証、主要CRUDパイプライン、CI/CD・計装基盤',
              id: 'SSO, pipeline CRUD inti, CI/CD & dasar telemetri',
            }),
            exitGate: pick({
              ko: 'E2E 해피패스 통과 · 빌드 에러 0건',
              en: 'Happy-Path E2E Passing · 0 Build Errors',
              ja: 'ハッピーパスE2E合格・ビルドエラー0件',
              id: 'E2E Happy-Path Lulus · 0 Error Build',
            }),
          },
          {
            id: 'ms_2',
            phaseCode: 'M2',
            category: pick({ ko: 'Closed Beta', en: 'Closed Beta', ja: 'Closed Beta', id: 'Beta Tertutup' }),
            title: pick({
              ko: 'Feature Complete · 부하/보안 감사 & 접근성',
              en: 'Feature Complete · Load/Security Audit & WCAG AA',
              ja: 'Feature Complete・負荷/セキュリティ監査＆WCAG AA',
              id: 'Fitur Lengkap · Audit Beban/Keamanan & WCAG AA',
            }),
            priority: 'P0' as const,
            startMonth: 6,
            endMonth: 7,
            owner: 'QA / SecOps',
            deliverables: pick({
              ko: '에러/빈 상태 처리, k6 부하 테스트, OWASP 점검 및 WCAG AA 준수',
              en: 'Edge-case states, k6 load testing, OWASP & WCAG AA audit',
              ja: '例外状態処理、負荷テスト、OWASP診断・WCAG AA対応',
              id: 'Kasus tepi, uji beban k6, audit OWASP & WCAG AA',
            }),
            exitGate: pick({
              ko: 'Sev-0/1 결함 0건 · Web LCP < 1.8s',
              en: '0 Sev-0/1 Bugs · Web LCP < 1.8s',
              ja: 'Sev-0/1不具合0件・Web LCP < 1.8s',
              id: '0 Bug Sev-0/1 · Web LCP < 1.8s',
            }),
          },
          {
            id: 'ms_3',
            phaseCode: 'M3',
            category: pick({ ko: '카나리 GA', en: 'Canary GA', ja: 'カナリア GA', id: 'Kenari GA' }),
            title: pick({
              ko: 'Feature Flag 점진 롤아웃 (1%→10%→50%→100%)',
              en: 'Feature-Flagged Canary Rollout (1%→10%→50%→100%)',
              ja: 'Feature Flag段階公開 (1%→10%→50%→100%)',
              id: 'Peluncuran Kenari Feature Flag (1%→10%→50%→100%)',
            }),
            priority: 'P0' as const,
            startMonth: 8,
            endMonth: 9,
            owner: 'SRE / Release',
            deliverables: pick({
              ko: '카나리 배포 게이트, Kill-Switch 자동 롤백, 온콜 SLO 대시보드',
              en: 'Canary rollout gates, Kill-Switch auto-rollback, on-call SLO alerts',
              ja: 'カナリアゲート、Kill-Switch自動切り戻し、オンコールSLO監視',
              id: 'Gerbang rilis kenari, Kill-Switch rollback otomatis, alarm SLO',
            }),
            exitGate: pick({
              ko: '가용성 ≥ 99.9% · 5xx 오류율 < 0.1%',
              en: 'Availability >= 99.9% · 5xx Rate < 0.1%',
              ja: '稼働率 ≥ 99.9%・5xxエラー率 < 0.1%',
              id: 'Ketersediaan >= 99.9% · Rasio 5xx < 0.1%',
            }),
          },
          {
            id: 'ms_4',
            phaseCode: 'M4',
            category: pick({ ko: '성장·고도화', en: 'Scale & P1/P2', ja: '拡張・最適化', id: 'Skala & P1/P2' }),
            title: pick({
              ko: 'A/B 퍼널 실험 · P1/P2 기능 확장 & 성능 튜닝',
              en: 'A/B Funnel Experiments · P1/P2 Expansion',
              ja: 'A/B実験・P1/P2機能拡張＆パフォーマンス最適化',
              id: 'Eksperimen A/B · Perluasan Fitur P1/P2',
            }),
            priority: 'P1' as const,
            startMonth: 10,
            endMonth: 12,
            owner: 'Growth / Eng',
            deliverables: pick({
              ko: '전환율 A/B 테스트, 고급 분석/내보내기(P1), 엔터프라이즈 API(P2)',
              en: 'Conversion A/B tests, P1 advanced analytics/export, P2 webhooks',
              ja: '転換率A/Bテスト、P1高度分析/出力、P2外部Webhook拡張',
              id: 'Uji A/B konversi, analitik/ekspor P1, webhook P2',
            }),
            exitGate: pick({
              ko: '북극성 KPI 목표 +20% 달성',
              en: 'North Star KPI +20% Target Met',
              ja: 'North Star KPI 目標 +20% 達成',
              id: 'Target North Star KPI +20% Tercapai',
            }),
          },
        ],
      },
      {
        id: 'mobile-app',
        label: pick({
          ko: '모바일 앱 스토어 출시 (iOS/Android)',
          en: 'Mobile App Store Release (iOS/Android)',
          ja: 'モバイルアプリ公開 (iOS/Android)',
          id: 'Rilis Aplikasi Seluler (iOS/Android)',
        }),
        milestones: [
          {
            id: 'mb_0',
            phaseCode: 'M0',
            category: pick({ ko: '아키텍처·SDK', en: 'Arch & SDK', ja: '構成・SDK', id: 'Ars & SDK' }),
            title: pick({
              ko: '딥링크·오프라인 캐시 RFC 및 디자인 시스템 토큰 확정',
              en: 'Deep-Link, Offline Cache RFC & Mobile Design Tokens',
              ja: 'ディープリンク・オフラインRFC＆モバイルトークン確定',
              id: 'RFC Deep-Link, Cache Luring & Token Desain Seluler',
            }),
            priority: 'P0' as const,
            startMonth: 1,
            endMonth: 2,
            owner: 'Mobile Architect',
            deliverables: pick({
              ko: 'Universal Link 명세, 푸시 알림 토픽 구조, 네이티브 브릿지 규약',
              en: 'Universal Links spec, APNs/FCM payload schema, local persistence',
              ja: 'Universal Link仕様、APNs/FCMスキーマ、ローカルDB設計',
              id: 'Spesifikasi Universal Link, skema APNs/FCM, cache lokal',
            }),
            exitGate: pick({
              ko: '모바일 Tech RFC 승인 완료',
              en: 'Mobile Tech RFC Approved',
              ja: 'モバイルTech RFC承認完了',
              id: 'RFC Teknis Seluler Disetujui',
            }),
          },
          {
            id: 'mb_1',
            phaseCode: 'M1',
            category: pick({ ko: 'TestFlight Alpha', en: 'Internal Alpha', ja: '社内 Alpha', id: 'Alpha Internal' }),
            title: pick({
              ko: '코어 네비게이션·생체인증 & 사내 TestFlight/Internal 트랙',
              en: 'Core Navigation, Biometrics & TestFlight/Play Internal',
              ja: 'コア画面遷移・生体認証 ＆ TestFlight社内配布',
              id: 'Navigasi Inti, Biometrik & TestFlight Internal',
            }),
            priority: 'P0' as const,
            startMonth: 3,
            endMonth: 5,
            owner: 'iOS / Android Lead',
            deliverables: pick({
              ko: '생체인증 온보딩, 주요 P0 탭 플로우, Crashlytics/Sentry 연동',
              en: 'Biometric onboarding, P0 tab flows, Crashlytics/Sentry telemetry',
              ja: '生体認証オンボディング、P0主要タブ、クラッシュ計測連携',
              id: 'Onboarding biometrik, alur P0, telemetri Crashlytics/Sentry',
            }),
            exitGate: pick({
              ko: 'Cold Start < 1.5s · 60fps 스크롤 유지',
              en: 'Cold Start < 1.5s · Sustained 60fps',
              ja: 'コールドスタート < 1.5s・60fps維持',
              id: 'Cold Start < 1.5s · Stabil 60fps',
            }),
          },
          {
            id: 'mb_2',
            phaseCode: 'M2',
            category: pick({ ko: '스토어 심사·Beta', en: 'Beta & Store QA', ja: '審査・Beta', id: 'Beta & QA Toko' }),
            title: pick({
              ko: '외부 Closed Beta(1,000명) & App Store/Play 심사 통과',
              en: 'Closed Beta (1k Users) & App Store / Play Review Pass',
              ja: 'クローズドBeta(1,000名) ＆ ストア審査通過',
              id: 'Beta Tertutup (1rb Pengguna) & Lolos Tinjauan Toko',
            }),
            priority: 'P0' as const,
            startMonth: 6,
            endMonth: 8,
            owner: 'Mobile QA / Privacy',
            deliverables: pick({
              ko: '프라이버시 매니페스트, 계정 삭제 플로우, 저속 네트워크/오프라인 복구 QA',
              en: 'Privacy nutrition labels, account deletion compliance, offline QA',
              ja: 'プライバシーラベル対応、アカウント削除義務対応、オフラインQA',
              id: 'Label privasi toko, alur hapus akun, QA koneksi lambat',
            }),
            exitGate: pick({
              ko: 'Crash-Free Users ≥ 99.8% · ANR < 0.1%',
              en: 'Crash-Free >= 99.8% · ANR < 0.1%',
              ja: 'Crash-Free率 ≥ 99.8%・ANR < 0.1%',
              id: 'Crash-Free >= 99.8% · ANR < 0.1%',
            }),
          },
          {
            id: 'mb_3',
            phaseCode: 'M3',
            category: pick({ ko: '단계적 출시', en: 'Staged Rollout', ja: '段階公開', id: 'Rilis Bertahap' }),
            title: pick({
              ko: '스토어 단계 배포 (1%→5%→20%→100%) & Remote Config',
              en: 'Phased Store Rollout (1%→5%→20%→100%) & Remote Config',
              ja: 'ストア段階リリース (1%→5%→20%→100%)',
              id: 'Rilis Bertahap Toko (1%→5%→20%→100%) & Remote Config',
            }),
            priority: 'P0' as const,
            startMonth: 9,
            endMonth: 10,
            owner: 'Release Manager',
            deliverables: pick({
              ko: '강제 업데이트(Force Update) 게이트, 실시간 크래시 알람, 핫픽스 파이프라인',
              en: 'Force-update kill switch, crash spike halt rule, hotfix pipeline',
              ja: '強制アップデート機構、異常停止トリガー、ホットフィックス手順',
              id: 'Gerbang update paksa, aturan henti otomatis, pipeline hotfix',
            }),
            exitGate: pick({
              ko: '스토어 평점 ≥ 4.6 · 리텐션 D7 목표 충족',
              en: 'Store Rating >= 4.6 · D7 Retention Met',
              ja: 'ストア評価 ≥ 4.6・D7リテンション達成',
              id: 'Rating Toko >= 4.6 · Retensi D7 Tercapai',
            }),
          },
          {
            id: 'mb_4',
            phaseCode: 'M4',
            category: pick({ ko: 'v1.1 확장', en: 'v1.1 Growth', ja: 'v1.1 拡張', id: 'Ekspansi v1.1' }),
            title: pick({
              ko: '위젯·오프라인 동기화 고도화 및 ASO 퍼널 최적화',
              en: 'Home Widgets, Sync Tuning & ASO Funnel Optimization',
              ja: 'ウィジェット・同期最適化 ＆ ASO改善',
              id: 'Widget Layar, Optimasi Sinkronisasi & ASO',
            }),
            priority: 'P1' as const,
            startMonth: 11,
            endMonth: 12,
            owner: 'Mobile Growth',
            deliverables: pick({
              ko: 'iOS/Android 홈 위젯, 배터리 소모 프로파일링, ASO 키워드 실험',
              en: 'OS home widgets, battery profiling, ASO store experiments',
              ja: 'OSウィジェット、バッテリー最適化、ASOストア実験',
              id: 'Widget beranda OS, profil baterai, eksperimen ASO',
            }),
            exitGate: pick({
              ko: '모바일 전환율 +15% 향상',
              en: 'Mobile Conversion +15% Uplift',
              ja: 'モバイル転換率 +15% 向上',
              id: 'Peningkatan Konversi Seluler +15%',
            }),
          },
        ],
      },
      {
        id: 'enterprise-zero-downtime',
        label: pick({
          ko: '엔터프라이즈 무중단 플랫폼',
          en: 'Enterprise Zero-Downtime',
          ja: 'エンタープライズ無停止基盤',
          id: 'Enterprise Zero-Downtime',
        }),
        milestones: [
          {
            id: 'ent_0',
            phaseCode: 'M0',
            category: pick({ ko: '보안·컴플라이언스', en: 'Sec & RFC', ja: 'セキュリティ・RFC', id: 'Keamanan & RFC' }),
            title: pick({
              ko: '데이터 거버넌스 RFC, SOC2/ISMS 통제 매핑 & 위협 모델링',
              en: 'Governance RFC, SOC2 Control Mapping & Threat Modeling',
              ja: 'ガバナンスRFC、SOC2統制設計＆脅威モデリング',
              id: 'RFC Tata Kelola, Pemetaan Kontrol SOC2 & Threat Model',
            }),
            priority: 'P0' as const,
            startMonth: 1,
            endMonth: 2,
            owner: 'CISO / Architect',
            deliverables: pick({
              ko: '데이터 보존·암호화 규격, SAML 2.0/OIDC 연동 계약, 위협 모델 문서',
              en: 'Encryption/retention spec, SAML/OIDC contract, threat model',
              ja: '暗号化・保持規約、SAML/OIDC契約、脅威モデル文書',
              id: 'Spesifikasi enkripsi/retensi, kontrak SAML/OIDC, model ancaman',
            }),
            exitGate: pick({
              ko: '정보보안위원회 & 법무 승인 완료',
              en: 'InfoSec & Legal Sign-off Complete',
              ja: '情報セキュリティ委員会・法務承認完了',
              id: 'Persetujuan InfoSec & Legal Selesai',
            }),
          },
          {
            id: 'ent_1',
            phaseCode: 'M1',
            category: pick({ ko: 'IAM·감사 코어', en: 'IAM & Audit Core', ja: 'IAM・監査コア', id: 'Inti IAM & Audit' }),
            title: pick({
              ko: '멀티테넌트 RBAC, 불변 감사 로그 & 암호화 저장소 구축',
              en: 'Multi-Tenant RBAC, Immutable Audit Log & Encrypted Store',
              ja: 'マルチテナントRBAC、不変監査ログ・暗号化ストア構築',
              id: 'RBAC Multi-Tenant, Log Audit Imutabel & Penyimpanan Terenkripsi',
            }),
            priority: 'P0' as const,
            startMonth: 3,
            endMonth: 6,
            owner: 'Platform Eng',
            deliverables: pick({
              ko: '테넌트 격리 계층, 관리자 2FA 강제, WORM 감사 로그 파이프라인',
              en: 'Tenant isolation layer, mandatory 2FA, immutable audit trail',
              ja: 'テナント分離層、2FA強制、不変監査ログパイプライン',
              id: 'Lapisan isolasi tenant, wajib 2FA, jalur log audit imutabel',
            }),
            exitGate: pick({
              ko: '권한 격리 통합 테스트 100% 통과',
              en: '100% Tenant Isolation Integration Pass',
              ja: '権限分離統合テスト100%合格',
              id: '100% Lulus Uji Integrasi Isolasi Tenant',
            }),
          },
          {
            id: 'ent_2',
            phaseCode: 'M2',
            category: pick({ ko: 'DR·성능 검증', en: 'DR & Load Audit', ja: 'DR・性能検証', id: 'Uji DR & Beban' }),
            title: pick({
              ko: '블루/그린 무중단 전환, 재해복구(DR) 모의훈련 & 모의해킹',
              en: 'Blue/Green Cutover, DR Failover Drill & Pentest',
              ja: 'Blue/Green切替、災害復旧(DR)訓練＆脆弱性診断',
              id: 'Cutover Blue/Green, Simulasi DR & Pengujian Penetrasi',
            }),
            priority: 'P0' as const,
            startMonth: 7,
            endMonth: 9,
            owner: 'SRE / External Sec',
            deliverables: pick({
              ko: 'RTO < 15분 / RPO < 1분 검증, 외부 침투 테스트 결과 조치',
              en: 'RTO < 15m / RPO < 1m verified, external pentest remediation',
              ja: 'RTO < 15分 / RPO < 1分検証、外部ペネトレーションテスト対策',
              id: 'Verifikasi RTO < 15m / RPO < 1m, remediasi pentest eksternal',
            }),
            exitGate: pick({
              ko: 'High/Critical 취약점 0건 · DR SLA 통과',
              en: '0 High/Critical Findings · DR SLA Met',
              ja: 'High/Critical脆弱性0件・DR SLA達成',
              id: '0 Temuan Kritis/Tinggi · SLA DR Terpenuhi',
            }),
          },
          {
            id: 'ent_3',
            phaseCode: 'M3',
            category: pick({ ko: '고객사 파일럿→GA', en: 'Pilot to GA', ja: '顧客パイロット→GA', id: 'Pilot ke GA' }),
            title: pick({
              ko: '주요 파트너사 파일럿 이관 & 전사 GA 정식 오픈',
              en: 'Design-Partner Pilot Cutover & Enterprise GA Launch',
              ja: 'デザインパートナー移行 ＆ エンタープライズGA公開',
              id: 'Migrasi Pilot Mitra & Peluncuran GA Enterprise',
            }),
            priority: 'P0' as const,
            startMonth: 10,
            endMonth: 12,
            owner: 'Solutions / SRE',
            deliverables: pick({
              ko: '무중단 데이터 마이그레이션, SLA 99.95% 보장, 24/7 온콜 핸드오버',
              en: 'Zero-downtime migration, 99.95% SLA contract, 24/7 on-call handover',
              ja: '無停止データ移行、SLA 99.95%保証、24/7オンコール引継',
              id: 'Migrasi zero-downtime, garansi SLA 99.95%, serah terima on-call',
            }),
            exitGate: pick({
              ko: 'SLA 99.95% 달성 · 감사 무결점',
              en: '99.95% SLA Verified · Clean Audit',
              ja: 'SLA 99.95%達成・監査無欠点',
              id: 'SLA 99.95% Terverifikasi · Audit Bersih',
            }),
          },
        ],
      },
    ],
    [pick]
  );

  const [selectedPresetId, setSelectedPresetId] = useState<string>('web-saas');
  const [milestones, setMilestones] = useState<MilestoneRow[]>(() => presets[0].milestones);
  const [gates, setGates] = useState<ReadinessGate[]>(() => [
    {
      id: 'g_rfc',
      label: pick({ ko: '아키텍처 RFC & 스키마 동결 승인', en: 'Architecture RFC & Schema Freeze', ja: '設計RFC＆スキーマ凍結承認', id: 'Persetujuan RFC & Bekukan Skema' }),
      target: 'M0 Exit Gate',
      checked: true,
    },
    {
      id: 'g_perf',
      label: pick({ ko: 'Core Web Vitals / Crash-Free SLA 통과', en: 'Core Web Vitals / Crash-Free SLA', ja: 'Core Web Vitals / Crash-Free SLA', id: 'Core Web Vitals / SLA Crash-Free' }),
      target: 'LCP < 1.8s · P95 < 200ms',
      checked: true,
    },
    {
      id: 'g_sec',
      label: pick({ ko: 'OWASP 보안·RBAC 권한 격리·WCAG AA 검증', en: 'OWASP Security, RBAC & WCAG AA Audit', ja: 'OWASP診断・RBAC権限・WCAG監査', id: 'Audit OWASP, Isolasi RBAC & WCAG AA' }),
      target: '0 Sev-0/1 Bugs',
      checked: true,
    },
    {
      id: 'g_canary',
      label: pick({ ko: 'Feature Flag 카나리 & 60초 자동 롤백 런북', en: 'Canary Feature Flag & 60s Kill-Switch', ja: 'カナリア公開＆60秒自動ロールバック', id: 'Canary Feature Flag & Kill-Switch 60dtk' }),
      target: '5xx > 0.5% Auto-Revert',
      checked: true,
    },
  ]);

  const buildScheduleString = (rows: MilestoneRow[]): string =>
    rows
      .map((r) => {
        const cleanTitle = `${r.phaseCode} · ${r.title}`.replace(/[\[\]{}]/g, '').trim();
        const cleanCategory = r.category.replace(/:/g, ' ').trim();
        const cleanOwner = r.owner.replace(/[\[\]{}]/g, '').trim();
        return `${cleanCategory}: ${cleanTitle} [${r.startMonth} - ${r.endMonth}] {${cleanOwner}}`;
      })
      .join('\n');

  const syncRoadmapToBundle = (nextMilestones: MilestoneRow[], nextGates: ReadinessGate[]) => {
    const scheduleStr = buildScheduleString(nextMilestones);

    const phasesMarkdown = nextMilestones
      .map(
        (m) =>
          `[${m.phaseCode}: ${m.title}] (${m.priority} · ${m.category}) [${m.startMonth} - ${m.endMonth}] {${m.owner}}\n  - Deliverables: ${m.deliverables}\n  - Exit Gate: ${m.exitGate}`
      )
      .join('\n\n');

    const p0Items = nextMilestones.filter((m) => m.priority === 'P0').map((m) => `${m.phaseCode} ${m.title}`);
    const p1Items = nextMilestones.filter((m) => m.priority === 'P1').map((m) => `${m.phaseCode} ${m.title}`);
    const p2Items = nextMilestones.filter((m) => m.priority === 'P2').map((m) => `${m.phaseCode} ${m.title}`);

    const readinessMarkdown = [
      '## Scope Tiering (Now / Next / Later)',
      `- P0 (Must-Ship Blocker): ${p0Items.join(', ') || 'Core Auth, P0 Flows, Rollback Guard'}`,
      `- P1 (Fast-Follow): ${p1Items.join(', ') || 'Analytics, Funnel Optimization, Localization'}`,
      `- P2 (Backlog): ${p2Items.join(', ') || 'Ecosystem Webhooks, AI Automation'}`,
      '',
      '## Launch Readiness Review (Go / No-Go Exit Criteria)',
      ...nextGates.map((g) => `- [${g.checked ? 'x' : ' '}] **${g.label}** — Target: \`${g.target}\``),
    ].join('\n');

    onInputChange(8, 'milestone_phases', phasesMarkdown);
    onInputChange(8, 'rollout_readiness', readinessMarkdown);

    setPlan({
      ...plan,
      metadata: {
        ...plan.metadata,
        projectOverview: {
          ...plan.metadata.projectOverview,
          schedule: scheduleStr,
        },
      },
    });
  };

  const handleSelectPreset = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPresetId(presetId);
    setMilestones(found.milestones);
    syncRoadmapToBundle(found.milestones, gates);
  };

  const handleAddMilestone = () => {
    const nextIdx = milestones.length;
    const newRow: MilestoneRow = {
      id: `ms_${Date.now()}`,
      phaseCode: `M${nextIdx}`,
      category: pick({ ko: '확장 단계', en: 'Expansion', ja: '拡張段階', id: 'Ekspansi' }),
      title: pick({
        ko: `신규 마일스톤 ${nextIdx + 1}`,
        en: `New Milestone ${nextIdx + 1}`,
        ja: `新規マイルストーン ${nextIdx + 1}`,
        id: `Tonggak Baru ${nextIdx + 1}`,
      }),
      priority: 'P1',
      startMonth: Math.min(12, Math.max(1, nextIdx * 2 + 1)),
      endMonth: Math.min(12, Math.max(2, nextIdx * 2 + 2)),
      owner: 'Eng Lead',
      deliverables: pick({
        ko: '핵심 산출물 및 테스트 커버리지 확보',
        en: 'Core deliverables and automated test coverage',
        ja: '主要成果物およびテストカバレッジ確保',
        id: 'Hasil utama dan cakupan pengujian otomatis',
      }),
      exitGate: pick({
        ko: '성능 SLA 및 QA 체크리스트 100% 통과',
        en: 'Performance SLA & QA Checklist 100% Passed',
        ja: '性能SLA・QAチェックリスト100%合格',
        id: 'SLA Performa & Daftar Periksa QA 100% Lulus',
      }),
    };
    const updated = [...milestones, newRow];
    setMilestones(updated);
    syncRoadmapToBundle(updated, gates);
  };

  const handleUpdateMilestone = <K extends keyof MilestoneRow>(id: string, field: K, value: MilestoneRow[K]) => {
    const updated = milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m));
    setMilestones(updated);
    syncRoadmapToBundle(updated, gates);
  };

  const handleDeleteMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    const updated = milestones.filter((m) => m.id !== id);
    setMilestones(updated);
    syncRoadmapToBundle(updated, gates);
  };

  const handleToggleGate = (id: string) => {
    const updated = gates.map((g) => (g.id === id ? { ...g, checked: !g.checked } : g));
    setGates(updated);
    syncRoadmapToBundle(milestones, updated);
  };

  const currentSchedulePreview = useMemo(() => buildScheduleString(milestones), [milestones]);

  return (
    <div className="space-y-12 text-[var(--theme-ink-primary)] font-sans">
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
                ko: '빅테크 표준 앱/웹 로드맵 빌더 (M0–M4 · LRR)',
                en: 'Big-Tech App/Web Roadmap Builder (M0–M4 · LRR)',
                ja: 'ビッグテック標準アプリ/Webロードマップ (M0–M4 · LRR)',
                id: 'Penyusun Peta Jalan Standar Big-Tech (M0–M4 · LRR)',
              })}
            </h2>
            <span className="text-[15px] font-bold font-mono text-[var(--theme-ink-secondary)]">
              02_roadmap.md
            </span>
          </div>
          <p className={`text-[var(--theme-ink-secondary)] pl-9 ${largeTextMode ? 'text-[17px]' : 'text-[15px]'}`}>
            {pick({
              ko: '표준 아키타입을 선택하거나 마일스톤(M0–M4), 우선순위(P0–P2), 출시 게이트를 편집하면 02_roadmap.md와 간트 차트가 즉시 동기화됩니다.',
              en: 'Select a Big-Tech archetype or customize M0–M4 milestones, P0–P2 tiers, and Launch Readiness Gates to sync 02_roadmap.md and Gantt charts live.',
              ja: '標準アーキタイプを選択またはM0–M4マイルストーン・優先度・公開ゲートを編集すると、02_roadmap.mdとガントチャートへ即時同期されます。',
              id: 'Pilih arketipe standar atau edit tonggak M0–M4, prioritas P0–P2, dan gerbang rilis untuk sinkronisasi otomatis ke 02_roadmap.md dan bagan Gantt.',
            })}
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddMilestone}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[16px] font-bold transition-colors cursor-pointer self-start shrink-0 whitespace-nowrap"
        >
          <Plus size={16} />
          <span>{pick({ ko: '마일스톤 추가', en: 'Add Milestone', ja: 'マイルストーン追加', id: 'Tambah Tonggak' })}</span>
        </button>
      </div>

      {/* A. Big-Tech Archetype Presets */}
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
                ko: '표준 로드맵 아키타입 적용',
                en: 'Apply Standard Roadmap Archetype',
                ja: '標準ロードマップテンプレート適用',
                id: 'Terapkan Arketipe Peta Jalan Standar',
              })}
            </span>
          </h3>
          <span className="text-[14px] text-[var(--theme-ink-muted)] font-medium">
            {pick({
              ko: '클릭 시 양식 전체 자동 반영',
              en: 'Click to populate full spec format',
              ja: 'クリックで標準フォーマットを一括適用',
              id: 'Klik untuk menerapkan format lengkap',
            })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {presets.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`w-full px-5 py-4 rounded-none text-left text-[16px] font-bold transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[var(--theme-canvas)] border-2 border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[var(--theme-ink-primary)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <span>{preset.label}</span>
                <span
                  className={`px-2.5 py-0.5 text-[11px] font-mono font-bold border shrink-0 ${
                    isSelected
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)]'
                  }`}
                >
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* B. Milestone Rows Editor */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3
            className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
              largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
            }`}
          >
            <CalendarRange size={18} className="shrink-0" />
            <span className="font-mono text-[var(--theme-ink-secondary)]">B.</span>
            <span>
              {pick({
                ko: '단계별 엔지니어링 마일스톤 (M0–M4)',
                en: 'Phased Engineering Milestones (M0–M4)',
                ja: '段階別エンジニアリングマイルストーン (M0–M4)',
                id: 'Tonggak Rekayasa Bertahap (M0–M4)',
              })}
            </span>
          </h3>
          <span className="text-[14px] text-[var(--theme-ink-muted)] tabular-nums font-bold">
            {milestones.length} {pick({ ko: '단계 활성', en: 'Phases Active', ja: 'フェーズ設定済', id: 'Fase Aktif' })}
          </span>
        </div>

        <div className="space-y-4">
          {milestones.map((m) => (
            <div
              key={m.id}
              className="p-5 sm:p-6 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] space-y-4"
            >
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <input
                  type="text"
                  value={m.phaseCode}
                  onChange={(e) => handleUpdateMilestone(m.id, 'phaseCode', e.target.value)}
                  className="w-16 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-2.5 py-2.5 text-center font-mono text-[15px] font-extrabold text-[var(--theme-ink-strong)] outline-none shrink-0"
                  aria-label="Phase code"
                />

                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => handleUpdateMilestone(m.id, 'title', e.target.value)}
                  className="flex-1 min-w-[200px] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3.5 py-2.5 text-[16px] font-bold text-[var(--theme-ink-strong)] outline-none"
                  placeholder={pick({ ko: '마일스톤 제목', en: 'Milestone title', ja: 'マイルストーン名', id: 'Judul tonggak' })}
                />

                <select
                  value={m.priority}
                  onChange={(e) => handleUpdateMilestone(m.id, 'priority', e.target.value as 'P0' | 'P1' | 'P2')}
                  className="bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3 py-2.5 text-[15px] font-bold text-[var(--theme-ink-strong)] outline-none cursor-pointer shrink-0"
                >
                  <option value="P0">P0 Blocker</option>
                  <option value="P1">P1 High</option>
                  <option value="P2">P2 Next</option>
                </select>

                <button
                  type="button"
                  onClick={() => handleDeleteMilestone(m.id)}
                  className="inline-flex items-center justify-center h-10 w-10 text-[var(--theme-ink-secondary)] bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] hover:text-[var(--theme-hover-text)] hover:bg-[var(--theme-hover-bg)] hover:border-[var(--theme-hover-bg)] rounded-none transition-colors cursor-pointer shrink-0"
                  title={pick({ ko: '마일스톤 삭제', en: 'Delete milestone', ja: 'マイルストーン削除', id: 'Hapus tonggak' })}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  type="text"
                  value={m.category}
                  onChange={(e) => handleUpdateMilestone(m.id, 'category', e.target.value)}
                  className="bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3 py-2 text-[14px] text-[var(--theme-ink-primary)] outline-none"
                  placeholder={pick({ ko: '워크스트림', en: 'Workstream', ja: '領域', id: 'Alur Kerja' })}
                />
                <input
                  type="text"
                  value={m.owner}
                  onChange={(e) => handleUpdateMilestone(m.id, 'owner', e.target.value)}
                  className="bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3 py-2 text-[14px] text-[var(--theme-ink-primary)] outline-none"
                  placeholder={pick({ ko: '담당 오너', en: 'DRI / Owner', ja: '担当オーナー', id: 'Penanggung Jawab' })}
                />
                <div className="flex items-center gap-2 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-3 py-2 text-[14px]">
                  <span className="text-[var(--theme-ink-muted)] text-xs font-bold shrink-0">
                    {pick({ ko: '시작월', en: 'Start', ja: '開始月', id: 'Mulai' })}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={m.startMonth}
                    onChange={(e) =>
                      handleUpdateMilestone(m.id, 'startMonth', Math.max(1, Math.min(12, Number(e.target.value) || 1)))
                    }
                    className="w-full bg-transparent font-mono font-bold text-[var(--theme-ink-strong)] outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] px-3 py-2 text-[14px]">
                  <span className="text-[var(--theme-ink-muted)] text-xs font-bold shrink-0">
                    {pick({ ko: '종료월', en: 'End', ja: '終了月', id: 'Selesai' })}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={m.endMonth}
                    onChange={(e) =>
                      handleUpdateMilestone(m.id, 'endMonth', Math.max(m.startMonth, Math.min(12, Number(e.target.value) || 12)))
                    }
                    className="w-full bg-transparent font-mono font-bold text-[var(--theme-ink-strong)] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={m.deliverables}
                  onChange={(e) => handleUpdateMilestone(m.id, 'deliverables', e.target.value)}
                  className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3.5 py-2.5 text-[14px] text-[var(--theme-ink-body)] outline-none"
                  placeholder={pick({ ko: '핵심 산출물 (Deliverables)', en: 'Key Deliverables', ja: '主要成果物', id: 'Hasil Utama' })}
                />
                <input
                  type="text"
                  value={m.exitGate}
                  onChange={(e) => handleUpdateMilestone(m.id, 'exitGate', e.target.value)}
                  className="w-full bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] rounded-none px-3.5 py-2.5 text-[14px] font-semibold text-[var(--theme-ink-strong)] outline-none"
                  placeholder={pick({ ko: '출시 게이트 (Go/No-Go Exit Gate)', en: 'Exit Gate Criteria', ja: 'リリースゲート基準', id: 'Kriteria Gerbang Keluar' })}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* C. Launch Readiness Review (LRR) Go / No-Go Gates */}
      <div className="space-y-4 pt-8 border-t border-[var(--theme-border-hairline)]">
        <h3
          className={`font-extrabold text-[var(--theme-ink-strong)] tracking-[-0.015em] leading-snug flex items-center gap-2.5 ${
            largeTextMode ? 'text-[20px] sm:text-[22px]' : 'text-[18px] sm:text-[20px]'
          }`}
        >
          <ShieldCheck size={18} className="shrink-0" />
          <span className="font-mono text-[var(--theme-ink-secondary)]">C.</span>
          <span>
            {pick({
              ko: '출시 준비 점검 게이트 (Launch Readiness Review)',
              en: 'Launch Readiness Review (Go / No-Go Gates)',
              ja: 'リリース準備承認ゲート (Launch Readiness Review)',
              id: 'Tinjauan Kesiapan Rilis (Gerbang Go / No-Go)',
            })}
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-3">
          {gates.map((gate) => (
            <button
              key={gate.id}
              type="button"
              onClick={() => handleToggleGate(gate.id)}
              className={`p-4 rounded-none border text-left transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                gate.checked
                  ? 'bg-[var(--theme-canvas)] border-[var(--theme-ink-strong)]'
                  : 'bg-[var(--theme-stage)] border-[var(--theme-border-hairline)] opacity-75'
              }`}
            >
              <div className="space-y-1 min-w-0">
                <div className="text-[15px] font-bold text-[var(--theme-ink-strong)]">{gate.label}</div>
                <div className="text-[13px] font-mono text-[var(--theme-ink-secondary)]">{gate.target}</div>
              </div>
              <span
                className={`px-2 py-0.5 text-[11px] font-mono font-bold border shrink-0 ${
                  gate.checked
                    ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                    : 'bg-[var(--theme-stage)] text-[var(--theme-ink-muted)] border-[var(--theme-border-hairline)]'
                }`}
              >
                {gate.checked ? 'GO' : 'PENDING'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Live Embedded Gantt Timeline Visualization */}
      <div className="pt-4">
        <RoadmapChart schedule={plan.metadata?.projectOverview?.schedule || currentSchedulePreview} />
      </div>
    </div>
  );
};
