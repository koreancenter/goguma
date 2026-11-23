import { Language } from '../types';
import { DomainBusinessRule } from '../types/schema';

export interface SectionDef {
  key: string;
  title: string;
  question: string;
  placeholder: string;
  businessRules?: DomainBusinessRule[];
}

export interface ChapterDef {
  id: number;
  title: string;
  engTitle: string;
  description: string;
  sections: SectionDef[];
  businessRules?: DomainBusinessRule[];
}

interface LocalizedChapterText {
  title: string;
  description: string;
  sections: Array<{
    key: string;
    title: string;
    question: string;
    placeholder: string;
  }>;
}

const CHAPTERS_BY_LANG: Record<Language, LocalizedChapterText[]> = {
  ko: [
    {
      title: '서비스 개요 및 기획 배경',
      description: '웹 애플리케이션의 핵심 정의와 개발 목적 및 기대 효과를 규정합니다.',
      sections: [
        {
          key: 'project_name',
          title: '서비스 명칭 및 웹 서비스 정의',
          question: '구축하고자 하는 웹 애플리케이션의 공식 명칭과 핵심 목적을 입력하세요.',
          placeholder: '웹 애플리케이션 명칭 및 주요 기능 요약',
        },
        {
          key: 'problem_background',
          title: '개발 배경 및 기술 목표',
          question: '웹 서비스 개발 배경, 주요 해결 과제 및 기대 효과를 입력하세요.',
          placeholder: '웹 서비스 개발 배경 및 기술적 해결 과제',
        },
      ],
    },
    {
      title: '타깃 사용자 및 환경 명세',
      description: '사용자 그룹과 지원 기기 환경 및 핵심 요구사항을 구체화합니다.',
      sections: [
        {
          key: 'target_persona',
          title: '주요 사용자군 및 런타임 환경',
          question: '서비스의 주 사용자 계층과 지원 기기 환경을 정의하세요.',
          placeholder: '사용자 그룹 및 기기 환경 명세',
        },
        {
          key: 'user_problems',
          title: '사용자 요구사항 및 불편 사항',
          question: '사용자가 직면한 주요 요구사항 및 시스템이 충족해야 할 인터랙션 목표를 입력하세요.',
          placeholder: '핵심 사용자 요구사항 및 기술적 대응 방안',
        },
      ],
    },
    {
      title: '핵심 기능 명세 및 사용자 흐름',
      description: '웹 애플리케이션의 핵심 기능 명세와 이용 흐름을 설계합니다.',
      sections: [
        {
          key: 'key_features',
          title: '필수 핵심 기능 명세',
          question: '웹 애플리케이션에 반드시 포함되어야 하는 핵심 기능 요구사항을 입력하세요.',
          placeholder: '인증, 대시보드, 데이터 관리, 실시간 알림 등 필수 기능 명세',
        },
        {
          key: 'happy_path',
          title: '사용자 핵심 흐름',
          question: '사용자가 진입하여 주요 작업을 완결하는 전체 흐름을 정의하세요.',
          placeholder: '랜딩 ➔ 인증 ➔ 대시보드 ➔ 데이터 조작 ➔ 결과 저장 및 통계 반영',
        },
      ],
    },
    {
      title: '데이터 모델 및 인터페이스 스키마',
      description: '데이터베이스 엔터티 구조와 비즈니스 로직 및 유효성 검증 규칙을 정의합니다.',
      sections: [
        {
          key: 'data_columns',
          title: '데이터베이스 엔터티 및 필드 명세',
          question: '데이터베이스 모델에 포함될 주요 엔터티와 항목 목록을 정의하세요.',
          placeholder: 'ID, Title, UserID, Status, Metadata, CreatedAt 등 항목 목록',
        },
        {
          key: 'business_rules',
          title: '비즈니스 로직 및 유효성 검증 규칙',
          question: '데이터 무결성을 위한 유효성 검증 규칙과 상태 전이 로직을 정의하세요.',
          placeholder: '필수 입력값 검증, 상태 전이 규칙, 인덱싱 및 권한 정책',
        },
      ],
    },
    {
      title: '디자인 시스템 및 시각 토큰',
      description: '모노크롬 테마 토큰, 서체, 레이아웃 그리드 등 시각적 규격을 규정합니다.',
      sections: [
        {
          key: 'brand_mood',
          title: '비주얼 테마 및 컬러 토큰',
          question: '웹 서비스의 비주얼 테마와 모노크롬 컬러 토큰을 정의하세요.',
          placeholder: 'Warm Obsidian & Titanium: Deep Obsidian (#090A0D) + Warm Titanium (#E4DFD7)',
        },
        {
          key: 'ui_tone',
          title: '타이포그래피 및 레이아웃 규격',
          question: '서체 체계, 그리드 시스템, 인터랙션 피드백 규격을 정의하세요.',
          placeholder: '시스템 산세리프 및 모노스페이스, 8px 그리드, 마이크로 애니메이션',
        },
      ],
    },
    {
      title: '정보구조 및 화면 정의서',
      description: '웹 서비스를 구성하는 전체 사이트맵, 화면 목록 및 내비게이션 동선을 설계합니다.',
      sections: [
        {
          key: 'pages_structure',
          title: '사이트맵 및 화면 목록',
          question: '웹 애플리케이션을 구성하는 전체 화면 목록과 라우트 경로를 정의하세요.',
          placeholder: '대시보드 (/), 데이터 목록 (/items), 상세 뷰 (/items/:id), 설정 (/settings)',
        },
        {
          key: 'nav_hierarchy',
          title: '내비게이션 및 메뉴 계층 구조',
          question: '헤더 네비게이션, 사이드바, 서브메뉴의 이동 계층 구조를 정의하세요.',
          placeholder: '글로벌 헤더 네비게이션, 좌측 사이드바, 인라인 모달 레이아웃',
        },
      ],
    },
    {
      title: '시스템 아키텍처 및 보안 규약',
      description: '프론트엔드/백엔드 기술 스택, 보안 규약 및 성능 최적화 정책을 확정합니다.',
      sections: [
        {
          key: 'stack_requirements',
          title: '기술 스택 및 프레임워크 규약',
          question: '프론트엔드, 백엔드 프레임워크 및 데이터베이스 기술 스택을 확정하세요.',
          placeholder: 'React (TypeScript), Tailwind CSS, Node.js / RESTful API, Cloud Run',
        },
        {
          key: 'data_sovereignty',
          title: '보안 정책 및 성능 최적화 규약',
          question: '데이터 암호화, 세션 보안 및 성능 최적화 정책을 정의하세요.',
          placeholder: 'TLS 전송 암호화, 안전한 토큰 보관, 코드 스플리팅, 0ms 렌더링 최적화',
        },
      ],
    },
    {
      title: '제품 및 엔지니어링 로드맵',
      description: '빅테크 표준(M0–M4 마일스톤, P0/P1/P2 스코프, 카나리 출시 게이트 및 리스크 대응) 기준으로 앱/웹 개발 로드맵을 수립합니다.',
      sections: [
        {
          key: 'milestone_phases',
          title: '마일스톤 & 단계별 실행 타임라인 (M0–M4)',
          question: 'RFC 설계 동결(M0)부터 알파·베타·카나리 GA 출시(M3) 및 고도화(M4)까지 빅테크 표준 마일스톤과 워크스트림 일정을 정의하세요.',
          placeholder: `[M0: Discovery & RFC Lock] PRD·기술 RFC 승인, API/DB 스키마 계약 동결, 디자인 토큰 확정 [1월 - 2월] {PM/Architect}
[M1: Core MVP / Alpha] 인증(SSO/RBAC), 핵심 P0 플로우, CI/CD 및 텔레메트리 구축 (사내 도그푸딩) [3월 - 5월] {FE/BE Lead}
[M2: Feature Complete / Closed Beta] 엣지 케이스, E2E·부하 테스트, 보안·접근성 감사(WCAG AA), Crash-Free ≥ 99.5% 검증 [6월 - 7월] {QA/Security}
[M3: GA Launch & Canary Rollout] 피처 플래그 기반 점진 배포(1% → 10% → 50% → 100%), 온콜 런북 및 SLO 경보 가동 [8월 - 9월] {SRE/Release}
[M4: Post-Launch & P1/P2 Growth] 북극성 KPI 퍼널 실험(A/B), Core Web Vitals 튜닝, 차기 P1/P2 기능 확장 [10월 - 12월] {Growth/Eng}`,
        },
        {
          key: 'rollout_readiness',
          title: '스코프 우선순위(P0–P2) & 출시 게이트(LRR)',
          question: 'P0 출시 필수 범위, 팀 간 의존성, Go/No-Go 출시 승인 게이트, 핵심 지표(KPI) 및 롤백 기준을 정의하세요.',
          placeholder: `## Scope Tiering (Now / Next / Later)
- P0 (Must-Ship Blocker): 핵심 인증/권한, 메인 CRUD 워크플로우, 무중단 로컬/DB 동기화, 기본 에러 복구
- P1 (Fast-Follow): 고급 필터·내보내기, 실시간 알림 최적화, 다국어 확장
- P2 (Backlog): AI 자동 추천, 외부 엔터프라이즈 웹훅 마켓플레이스

## Launch Readiness Review (Go / No-Go Exit Criteria)
- 성능 SLA: P95 API 응답 < 200ms, 웹 LCP < 1.8s, 앱 Crash-Free Rate ≥ 99.8%
- 품질·보안: P0/Sev-1 결함 0건, OWASP 보안 점검 및 RBAC 권한 우회 테스트 통과
- 카나리 롤백 트리거: 5xx 오류율 > 0.5% 또는 P99 지연 > 1,000ms 시 60초 내 Feature Flag Kill-Switch 작동`,
        },
      ],
    },
    {
      title: '개발 산출물 및 배포 명세',
      description: '11종 마크다운 기술 사양서 번들과 프로토타입 산출물을 검수하고 배포합니다.',
      sections: [
        {
          key: 'export_summary',
          title: '최종 개발 명세서 번들 및 프로토타입',
          question: '완성된 11종 기술 사양서와 인터랙티브 프로토타입 산출물을 검토합니다.',
          placeholder: '마크다운 사양서 패키지 및 단일 파일 프로토타입 내보내기',
        },
        {
          key: 'verification_checklist',
          title: '개발 검수 및 인수 테스트 기준',
          question: '개발 완료 후 검증할 핵심 기능 및 성능 인수 체크리스트를 확인하세요.',
          placeholder: '주요 API 통신 정상 동작, 모바일/데스크톱 반응형 렌더링, 콘솔 에러 제로',
        },
      ],
    },
  ],
  en: [
    {
      title: 'Overview & Planning Background',
      description: 'Define the core service identity, development objectives, and expected outcomes.',
      sections: [
        {
          key: 'project_name',
          title: 'Service Name & Web Definition',
          question: 'Enter the official name and core purpose of the application you want to build.',
          placeholder: 'Application name and summary of primary capabilities',
        },
        {
          key: 'problem_background',
          title: 'Background & Technical Goals',
          question: 'Describe the development background, core challenges to solve, and expected impact.',
          placeholder: 'Service background and technical problems to resolve',
        },
      ],
    },
    {
      title: 'Target Users & Environment Spec',
      description: 'Specify user segments, supported runtime environments, and core requirements.',
      sections: [
        {
          key: 'target_persona',
          title: 'Primary Users & Runtime Environment',
          question: 'Define the primary target audience and supported devices or runtime platforms.',
          placeholder: 'User segments and target device/browser specifications',
        },
        {
          key: 'user_problems',
          title: 'User Needs & Pain Points',
          question: 'Outline key user requirements and the interaction goals the system must satisfy.',
          placeholder: 'Core user needs and technical/UX solutions',
        },
      ],
    },
    {
      title: 'Functional Specs & User Flow',
      description: 'Design the core functional specifications and end-to-end user journey.',
      sections: [
        {
          key: 'key_features',
          title: 'Core Feature Specifications',
          question: 'Specify the essential functional requirements that must be included in the app.',
          placeholder: 'Authentication, dashboard, data management, notifications, and core capabilities',
        },
        {
          key: 'happy_path',
          title: 'Primary User Flow (Happy Path)',
          question: 'Define the end-to-end journey from entry to completing primary tasks.',
          placeholder: 'Landing -> Auth -> Dashboard -> Data Operation -> Save & Analytics',
        },
      ],
    },
    {
      title: 'Data Model & Interface Schema',
      description: 'Define database entities, business logic rules, and data validation policies.',
      sections: [
        {
          key: 'data_columns',
          title: 'Database Entities & Field Specs',
          question: 'Define the primary entities and fields included in the data model.',
          placeholder: 'ID, Title, UserID, Status, Metadata, CreatedAt, and relation keys',
        },
        {
          key: 'business_rules',
          title: 'Business Logic & Validation Rules',
          question: 'Define validation rules and state transition logic to guarantee data integrity.',
          placeholder: 'Required field checks, state transitions, indexing, and access policies',
        },
      ],
    },
    {
      title: 'Design System & Visual Tokens',
      description: 'Establish visual tokens, typography scales, and layout grid specifications.',
      sections: [
        {
          key: 'brand_mood',
          title: 'Visual Theme & Color Tokens',
          question: 'Define the visual mood and brand/monochrome color tokens for your service.',
          placeholder: 'Warm Obsidian & Titanium: Deep Obsidian (#090A0D) + Warm Titanium (#E4DFD7)',
        },
        {
          key: 'ui_tone',
          title: 'Typography & Layout Standards',
          question: 'Specify font hierarchy, grid system, and micro-interaction feedback rules.',
          placeholder: 'Sans-serif & Monospace hierarchy, 8px grid, crisp state transitions',
        },
      ],
    },
    {
      title: 'Information Architecture & Screens',
      description: 'Design the complete sitemap, screen inventory, and navigation hierarchy.',
      sections: [
        {
          key: 'pages_structure',
          title: 'Sitemap & Screen Inventory',
          question: 'Define the complete list of screens and route paths in the application.',
          placeholder: 'Dashboard (/), Items (/items), Detail (/items/:id), Settings (/settings)',
        },
        {
          key: 'nav_hierarchy',
          title: 'Navigation & Menu Hierarchy',
          question: 'Define header navigation, sidebar menus, and sub-view routing paths.',
          placeholder: 'Global header navigation, collapsible sidebar, inline detail drawers',
        },
      ],
    },
    {
      title: 'System Architecture & Security',
      description: 'Finalize frontend/backend stacks, security protocols, and performance targets.',
      sections: [
        {
          key: 'stack_requirements',
          title: 'Tech Stack & Framework Standards',
          question: 'Confirm frontend, backend frameworks, and persistence/database technologies.',
          placeholder: 'React (TypeScript), Tailwind CSS, Node.js / REST API, IndexedDB',
        },
        {
          key: 'data_sovereignty',
          title: 'Security & Performance Policies',
          question: 'Define encryption, session security, and rendering optimization policies.',
          placeholder: 'TLS transport encryption, secure token storage, code splitting, 60fps UI',
        },
      ],
    },
    {
      title: 'Product & Engineering Roadmap',
      description: 'Define Big-Tech standard App/Web delivery milestones (M0–M4), P0/P1/P2 scope tiers, launch readiness gates, and rollback controls.',
      sections: [
        {
          key: 'milestone_phases',
          title: 'Milestones & Phased Delivery Timeline (M0–M4)',
          question: 'Outline Big-Tech lifecycle milestones from RFC/Design Lock (M0) through Alpha, Beta, Canary GA Launch (M3), and Growth Optimization (M4).',
          placeholder: `[M0: Discovery & RFC Lock] PRD & Tech RFC sign-off, API/DB schema contract freeze, design token lock [Jan - Feb] {PM/Architect}
[M1: Core MVP / Alpha] Auth (SSO/RBAC), P0 workflows, CI/CD & observability baseline (Internal Dogfood) [Mar - May] {FE/BE Lead}
[M2: Feature Complete / Closed Beta] Edge cases, E2E & load testing, security/WCAG audit, Crash-Free >= 99.5% [Jun - Jul] {QA/Security}
[M3: GA Launch & Canary Rollout] Feature-flagged phased rollout (1% -> 10% -> 50% -> 100%), on-call runbook & SLO alerts [Aug - Sep] {SRE/Release}
[M4: Post-Launch & P1/P2 Growth] North Star KPI experiments (A/B), Core Web Vitals tuning, P1/P2 expansion [Oct - Dec] {Growth/Eng}`,
        },
        {
          key: 'rollout_readiness',
          title: 'Scope Tiers (P0–P2) & Launch Readiness Gates (LRR)',
          question: 'Specify P0 release blockers, cross-team dependencies, Go/No-Go exit criteria, KPIs, and automated rollback triggers.',
          placeholder: `## Scope Tiering (Now / Next / Later)
- P0 (Must-Ship Blocker): Core Auth/RBAC, primary CRUD workflow, local/DB persistence, baseline recovery
- P1 (Fast-Follow): Advanced filtering & exports, real-time notification tuning, multi-locale expansion
- P2 (Backlog): AI workflow automation, enterprise webhook marketplace

## Launch Readiness Review (Go / No-Go Exit Criteria)
- Performance SLA: P95 API latency < 200ms, Web LCP < 1.8s, Mobile Crash-Free >= 99.8%
- Quality & Security: 0 Sev-0/Sev-1 bugs, OWASP security review & RBAC penetration checks passed
- Canary Rollback Trigger: Auto-revert feature flag within 60s if 5xx error rate > 0.5% or P99 > 1,000ms`,
        },
      ],
    },
    {
      title: 'Artifacts & Release Specification',
      description: 'Review and export the 11-document markdown specification bundle and prototype.',
      sections: [
        {
          key: 'export_summary',
          title: 'Final Spec Bundle & Prototype',
          question: 'Review the completed 11-file specification bundle and interactive prototype.',
          placeholder: 'Markdown specification package & standalone prototype export',
        },
        {
          key: 'verification_checklist',
          title: 'QA & Acceptance Test Criteria',
          question: 'Verify the functional and performance acceptance checklist prior to release.',
          placeholder: 'Core flows verified, responsive layout across viewports, zero console errors',
        },
      ],
    },
  ],
  ja: [
    {
      title: 'サービス概要・企画背景',
      description: 'アプリケーションの中核定義、開発目的、および期待される成果を定義します。',
      sections: [
        {
          key: 'project_name',
          title: 'サービス名および概要定義',
          question: '構築するアプリケーションの正式名称と中核目的を入力してください。',
          placeholder: 'アプリケーション名称および主要機能の要約',
        },
        {
          key: 'problem_background',
          title: '開発背景と技術目標',
          question: '開発の背景、解決すべき課題、および期待効果を入力してください。',
          placeholder: '開発の背景と解決する技術的課題',
        },
      ],
    },
    {
      title: 'ターゲットユーザー・環境仕様',
      description: 'ユーザー層、対応デバイス環境、および中核要件を具体化します。',
      sections: [
        {
          key: 'target_persona',
          title: '主要ユーザー層と実行環境',
          question: 'サービスの主要ターゲット層と対応デバイス環境を定義してください。',
          placeholder: 'ユーザー層と対応デバイス・ブラウザ仕様',
        },
        {
          key: 'user_problems',
          title: 'ユーザー課題と要求事項',
          question: 'ユーザーが直面している課題と、システムが満たすべき体験目標を入力してください。',
          placeholder: '中核となるユーザー課題と解決アプローチ',
        },
      ],
    },
    {
      title: '中核機能仕様・ユーザーフロー',
      description: 'アプリケーションの主要機能要件と利用フローを設計します。',
      sections: [
        {
          key: 'key_features',
          title: '必須中核機能仕様',
          question: 'アプリケーションに必ず含めるべき主要機能要件を入力してください。',
          placeholder: '認証、ダッシュボード、データ管理、通知などの主要機能',
        },
        {
          key: 'happy_path',
          title: '主要ユーザーフロー',
          question: 'ユーザーがアクセスしてから主要タスクを完了するまでの一連の流れを定義してください。',
          placeholder: 'ランディング ➔ 認証 ➔ ダッシュボード ➔ 操作 ➔ 保存・反映',
        },
      ],
    },
    {
      title: 'データモデル・スキーマ仕様',
      description: 'データベースエンティティ構造、ビジネスロジック、バリデーション規則を定義します。',
      sections: [
        {
          key: 'data_columns',
          title: 'エンティティおよびフィールド仕様',
          question: 'データモデルに含まれる主要エンティティと項目一覧を定義してください。',
          placeholder: 'ID, Title, UserID, Status, Metadata, CreatedAt など',
        },
        {
          key: 'business_rules',
          title: 'ビジネスロジックと検証ルール',
          question: 'データ整合性を保つための検証ルールと状態遷移ロジックを定義してください。',
          placeholder: '必須項目チェック、状態遷移ルール、権限・インデックス設計',
        },
      ],
    },
    {
      title: 'デザインシステム・視覚トークン',
      description: 'カラートークン、タイポグラフィ、レイアウトグリッドなどの視覚仕様を規定します。',
      sections: [
        {
          key: 'brand_mood',
          title: 'ビジュアルテーマ・カラートークン',
          question: 'サービスのビジュアルテーマとカラートークンを定義してください。',
          placeholder: 'Deep Obsidian (#090A0D) + Warm Titanium (#E4DFD7)',
        },
        {
          key: 'ui_tone',
          title: 'タイポグラフィとレイアウト規約',
          question: '書体体系、グリッドシステム、インタラクションフィードバック規定を定義してください。',
          placeholder: 'サンセリフ＆等幅フォント、8pxグリッド、マイクロインタラクション',
        },
      ],
    },
    {
      title: '情報設計・画面定義',
      description: 'サイトマップ全体、画面一覧、およびナビゲーション動線を設計します。',
      sections: [
        {
          key: 'pages_structure',
          title: 'サイトマップおよび画面一覧',
          question: 'アプリケーションを構成する全画面とルートパスを定義してください。',
          placeholder: 'ダッシュボード (/), 一覧 (/items), 詳細 (/items/:id), 設定 (/settings)',
        },
        {
          key: 'nav_hierarchy',
          title: 'ナビゲーション・メニュー階層構造',
          question: 'ヘッダー、サイドバー、サブメニューの遷移階層構造を定義してください。',
          placeholder: 'グローバルヘッダー、左サイドバー、インライン詳細ドロワー',
        },
      ],
    },
    {
      title: 'システム構成・セキュリティ規約',
      description: '技術スタック、セキュリティ規約、およびパフォーマンス方針を確定します。',
      sections: [
        {
          key: 'stack_requirements',
          title: '技術スタックとフレームワーク規約',
          question: 'フロントエンド、バックエンド、データベースの技術スタックを確定してください。',
          placeholder: 'React (TypeScript), Tailwind CSS, Node.js / REST API, IndexedDB',
        },
        {
          key: 'data_sovereignty',
          title: 'セキュリティおよび性能最適化規約',
          question: 'データ暗号化、セッション保護、最適化方針を定義してください。',
          placeholder: 'TLS暗号化、安全なトークン管理、コード分割、60fps描画',
        },
      ],
    },
    {
      title: '製品・開発ロードマップ',
      description: 'ビッグテック標準（M0–M4マイルストーン、P0/P1/P2優先度、カナリア公開ゲート＆リスク管理）に基づくアプリ/Web開発ロードマップを策定します。',
      sections: [
        {
          key: 'milestone_phases',
          title: 'マイルストーン＆段階的スケジュール (M0–M4)',
          question: 'RFC設計凍結（M0）からAlpha、Beta、カナリアGA公開（M3）、最適化（M4）までの標準マイルストーンを定義してください。',
          placeholder: `[M0: Discovery & RFC Lock] PRD・技術RFC承認、API/DBスキーマ凍結、トークン確定 [1月 - 2月] {PM/Architect}
[M1: Core MVP / Alpha] 認証(SSO/RBAC)、P0主要フロー、CI/CD・計測基盤構築 (社内ドッグフーディング) [3月 - 5月] {FE/BE Lead}
[M2: Feature Complete / Closed Beta] 境界ケース、E2E・負荷テスト、セキュリティ・WCAG監査 [6月 - 7月] {QA/Security}
[M3: GA Launch & Canary Rollout] Feature Flag段階公開 (1% → 10% → 50% → 100%)、オンコール手順・SLO監視 [8月 - 9月] {SRE/Release}
[M4: Post-Launch & P1/P2 Growth] North Star KPI実験(A/B)、Web Vitals最適化、P1/P2拡張 [10月 - 12月] {Growth/Eng}`,
        },
        {
          key: 'rollout_readiness',
          title: '優先度スコープ(P0–P2)＆リリースゲート(LRR)',
          question: 'P0必須要件、チーム間依存関係、Go/No-Goリリース承認ゲート、KPI、自動ロールバック基準を定義してください。',
          placeholder: `## Scope Tiering (Now / Next / Later)
- P0 (Must-Ship Blocker): 認証/RBAC、主要CRUDフロー、ローカル/DB永続化、基本エラー回復
- P1 (Fast-Follow): 高度な検索・出力、リアルタイム通知最適化、多言語拡張
- P2 (Backlog): AIワークフロー自動化、外部Webhookマーケットプレイス

## Launch Readiness Review (Go / No-Go Exit Criteria)
- 性能SLA: P95 API応答 < 200ms、Web LCP < 1.8s、Crash-Free率 ≥ 99.8%
- 品質・セキュリティ: Sev-0/Sev-1不具合0件、OWASP診断・RBAC権限テスト合格
- カナリアロールバック基準: 5xx率 > 0.5% または P99 > 1,000ms 時に60秒以内自動切り戻し`,
        },
      ],
    },
    {
      title: '成果物・リリース仕様',
      description: '11種のMarkdown技術仕様書バンドルとプロトタイプを検証・出力します。',
      sections: [
        {
          key: 'export_summary',
          title: '最終仕様書バンドルとプロトタイプ',
          question: '完成した11種の技術仕様書とインタラクティブプロトタイプを確認します。',
          placeholder: 'Markdown仕様書一式およびスタンドアロンプロトタイプ出力',
        },
        {
          key: 'verification_checklist',
          title: 'QA・受け入れテスト基準',
          question: 'リリース前に確認すべき機能および性能の受け入れ基準を確認してください。',
          placeholder: '主要フロー動作確認、レスポンシブ表示、コンソールエラーゼロ',
        },
      ],
    },
  ],
  id: [
    {
      title: 'Ikhtisar & Latar Belakang',
      description: 'Tetapkan definisi inti layanan, tujuan pengembangan, dan hasil yang diharapkan.',
      sections: [
        {
          key: 'project_name',
          title: 'Nama Layanan & Definisi Aplikasi',
          question: 'Masukkan nama resmi dan tujuan utama aplikasi yang ingin Anda bangun.',
          placeholder: 'Nama aplikasi dan ringkasan kemampuan utama',
        },
        {
          key: 'problem_background',
          title: 'Latar Belakang & Target Teknis',
          question: 'Jelaskan latar belakang pengembangan, tantangan utama, dan dampak yang diharapkan.',
          placeholder: 'Latar belakang layanan dan masalah teknis yang diselesaikan',
        },
      ],
    },
    {
      title: 'Target Pengguna & Lingkungan',
      description: 'Tentukan segmen pengguna, lingkungan perangkat yang didukung, dan kebutuhan inti.',
      sections: [
        {
          key: 'target_persona',
          title: 'Pengguna Utama & Runtime',
          question: 'Tentukan segmen pengguna utama serta perangkat atau platform runtime yang didukung.',
          placeholder: 'Segmen pengguna dan spesifikasi perangkat/browser target',
        },
        {
          key: 'user_problems',
          title: 'Kebutuhan & Kendala Pengguna',
          question: 'Catat kebutuhan utama pengguna serta target interaksi yang harus dipenuhi sistem.',
          placeholder: 'Kebutuhan inti pengguna dan solusi teknis/UX',
        },
      ],
    },
    {
      title: 'Spesifikasi Fitur & Alur Pengguna',
      description: 'Rancang spesifikasi fitur inti dan alur perjalanan pengguna end-to-end.',
      sections: [
        {
          key: 'key_features',
          title: 'Spesifikasi Fitur Utama',
          question: 'Tentukan persyaratan fitur penting yang wajib tersedia dalam aplikasi.',
          placeholder: 'Autentikasi, dasbor, pengelolaan data, notifikasi, dan fitur inti',
        },
        {
          key: 'happy_path',
          title: 'Alur Utama Pengguna (Happy Path)',
          question: 'Definisikan perjalanan lengkap pengguna dari masuk hingga menyelesaikan tugas utama.',
          placeholder: 'Landing -> Auth -> Dasbor -> Operasi Data -> Simpan & Statistik',
        },
      ],
    },
    {
      title: 'Model Data & Skema Antarmuka',
      description: 'Definisikan entitas basis data, aturan logika bisnis, dan validasi data.',
      sections: [
        {
          key: 'data_columns',
          title: 'Entitas & Kolom Basis Data',
          question: 'Definisikan entitas utama dan daftar kolom dalam model data.',
          placeholder: 'ID, Title, UserID, Status, Metadata, CreatedAt, dan relasi kunci',
        },
        {
          key: 'business_rules',
          title: 'Logika Bisnis & Aturan Validasi',
          question: 'Tetapkan aturan validasi dan logika transisi status untuk menjaga integritas data.',
          placeholder: 'Validasi input wajib, aturan transisi status, indeks, dan kebijakan akses',
        },
      ],
    },
    {
      title: 'Sistem Desain & Token Visual',
      description: 'Tetapkan token warna, tipografi, dan standar tata letak grid.',
      sections: [
        {
          key: 'brand_mood',
          title: 'Tema Visual & Token Warna',
          question: 'Definisikan tema visual dan token warna merek atau monokrom layanan Anda.',
          placeholder: 'Deep Obsidian (#090A0D) + Warm Titanium (#E4DFD7)',
        },
        {
          key: 'ui_tone',
          title: 'Standar Tipografi & Tata Letak',
          question: 'Tentukan hierarki font, sistem grid, dan aturan umpan balik mikro-interaksi.',
          placeholder: 'Sans-serif & Monospace, grid 8px, transisi status halus',
        },
      ],
    },
    {
      title: 'Arsitektur Informasi & Layar',
      description: 'Rancang peta situs lengkap, daftar layar, dan hierarki navigasi.',
      sections: [
        {
          key: 'pages_structure',
          title: 'Peta Situs & Daftar Layar',
          question: 'Tentukan daftar lengkap layar dan jalur rute aplikasi.',
          placeholder: 'Dasbor (/), Item (/items), Detail (/items/:id), Pengaturan (/settings)',
        },
        {
          key: 'nav_hierarchy',
          title: 'Hierarki Navigasi & Menu',
          question: 'Tentukan struktur navigasi header, sidebar, dan submenu.',
          placeholder: 'Header global, sidebar kiri, panel detail sebaris',
        },
      ],
    },
    {
      title: 'Arsitektur Sistem & Keamanan',
      description: 'Finalisasi stack teknologi, kebijakan keamanan, dan optimasi performa.',
      sections: [
        {
          key: 'stack_requirements',
          title: 'Standar Stack Teknologi & Framework',
          question: 'Konfirmasikan teknologi frontend, backend, dan penyimpanan data.',
          placeholder: 'React (TypeScript), Tailwind CSS, Node.js / REST API, IndexedDB',
        },
        {
          key: 'data_sovereignty',
          title: 'Kebijakan Keamanan & Performa',
          question: 'Tentukan enkripsi data, keamanan sesi, dan kebijakan optimasi rendering.',
          placeholder: 'Enkripsi TLS, penyimpanan token aman, code splitting, rendering 60fps',
        },
      ],
    },
    {
      title: 'Peta Jalan Produk & Rekayasa',
      description: 'Tetapkan peta jalan pengembangan Aplikasi/Web standar Big-Tech (tonggak M0–M4, prioritas P0/P1/P2, gerbang rilis kenari & mitigasi risiko).',
      sections: [
        {
          key: 'milestone_phases',
          title: 'Tonggak & Linimasa Eksekusi Bertahap (M0–M4)',
          question: 'Definisikan tonggak standar Big-Tech mulai dari RFC Lock (M0), Alpha, Closed Beta, Peluncuran GA Kenari (M3), hingga Optimasi (M4).',
          placeholder: `[M0: Discovery & RFC Lock] Persetujuan PRD & Tech RFC, pembekuan kontrak API/DB, penguncian token desain [1 - 2] {PM/Architect}
[M1: Core MVP / Alpha] Autentikasi (SSO/RBAC), alur P0 inti, CI/CD & telemetri dasar (Dogfood Internal) [3 - 5] {FE/BE Lead}
[M2: Feature Complete / Closed Beta] Kasus tepi, uji E2E & beban, audit keamanan/WCAG, Crash-Free >= 99.5% [6 - 7] {QA/Security}
[M3: GA Launch & Canary Rollout] Rilis bertahap Feature Flag (1% -> 10% -> 50% -> 100%), runbook on-call & alarm SLO [8 - 9] {SRE/Release}
[M4: Post-Launch & P1/P2 Growth] Eksperimen KPI utama (A/B), tuning Core Web Vitals, perluasan P1/P2 [10 - 12] {Growth/Eng}`,
        },
        {
          key: 'rollout_readiness',
          title: 'Prioritas Lingkup (P0–P2) & Gerbang Kesiapan Rilis (LRR)',
          question: 'Tentukan lingkup wajib P0, ketergantungan lintas tim, kriteria Go/No-Go, KPI target, dan pemicu rollback otomatis.',
          placeholder: `## Scope Tiering (Now / Next / Later)
- P0 (Must-Ship Blocker): Autentikasi/RBAC inti, alur CRUD utama, persistensi lokal/DB, pemulihan galat dasar
- P1 (Fast-Follow): Filter lanjutan & ekspor, optimasi notifikasi real-time, perluasan multi-bahasa
- P2 (Backlog): Otomasi AI, marketplace webhook eksternal

## Launch Readiness Review (Go / No-Go Exit Criteria)
- SLA Performa: Latensi P95 API < 200ms, Web LCP < 1.8s, Crash-Free >= 99.8%
- Kualitas & Keamanan: 0 bug Sev-0/Sev-1, lulus audit OWASP & uji izin RBAC
- Pemicu Rollback Kenari: Nonaktifkan Feature Flag dalam 60 detik jika rasio error 5xx > 0.5% atau P99 > 1.000ms`,
        },
      ],
    },
    {
      title: 'Artefak & Spesifikasi Rilis',
      description: 'Tinjau dan ekspor bundel 11 spesifikasi teknis Markdown serta prototipe.',
      sections: [
        {
          key: 'export_summary',
          title: 'Bundel Spesifikasi Akhir & Prototipe',
          question: 'Tinjau bundel 11 spesifikasi teknis dan prototipe interaktif yang telah selesai.',
          placeholder: 'Paket spesifikasi Markdown & ekspor prototipe file tunggal',
        },
        {
          key: 'verification_checklist',
          title: 'Kriteria QA & Uji Penerimaan',
          question: 'Verifikasi daftar periksa fungsional dan performa sebelum rilis.',
          placeholder: 'Alur utama berjalan normal, tampilan responsif, nol galat konsol',
        },
      ],
    },
  ],
};

const ENG_TITLES = [
  'Overview & Background',
  'Target & Platform Spec',
  'Functional Specs & Flow',
  'Data Model & Schema',
  'Design System & Tokens',
  'Information Architecture',
  'Architecture & Security',
  'Product & Eng Roadmap',
  'Artifacts & Release',
];

export function getChapters(language: Language): ChapterDef[] {
  const list = CHAPTERS_BY_LANG[language] || CHAPTERS_BY_LANG.en;
  return list.map((ch, idx) => ({
    id: idx + 1,
    title: ch.title,
    engTitle: ENG_TITLES[idx] || ch.title,
    description: ch.description,
    sections: ch.sections.map((sec) => ({
      key: sec.key,
      title: sec.title,
      question: sec.question,
      placeholder: sec.placeholder,
    })),
  }));
}

export const GOGUMA_CHAPTERS: ChapterDef[] = getChapters('ko');
