import { Language } from '../types';

export interface ProposalData {
  executiveSummary: string;
  strategicIntent: string;
  administrativeRoadmap: string;
  sddSummary: string;
  negativeConstraints: string;
  aiDesignPrinciples: string;
  adminMonitoringPlan: string;
}

interface ContextValues {
  projectName: string;
  purpose: string;
  target: string;
  kpi: string;
  features: string;
  techStack: string;
}

function parseContextString(contextStr: string): ContextValues {
  const getField = (field: string) => {
    const regex = new RegExp(`${field}:?\\s*(.*)`, 'i');
    const match = contextStr.match(regex);
    return match ? match[1].trim() : '';
  };

  return {
    projectName: getField('Project Name') || 'Strategic Architecture Project',
    purpose: getField('Purpose') || 'Automated digital service platform delivery',
    target: getField('Target') || 'Enterprise and consumer users',
    kpi: getField('KPI') || 'Zero-downtime, sub-second latency, high user retention',
    features: getField('Features') || 'Modular navigation, responsive layouts, data persistence',
    techStack: getField('Tech Stack') || 'React, TypeScript, Tailwind CSS, Local Storage'
  };
}

/**
 * Deterministic Project Proposal Compiler.
 * Generates an enterprise-ready 7-section strategic proposal pack without external AI calls.
 */
export function compileLocalProjectProposal(
  projectContext: string,
  lang: Language = 'ko',
  platform: 'WEB' | 'APP' = 'WEB'
): ProposalData {
  const ctx = parseContextString(projectContext);
  const isKo = lang === 'ko';
  const isApp = platform === 'APP';

  if (isKo) {
    return {
      executiveSummary: `본 제안서는 "${ctx.projectName}"의 성공적인 ${isApp ? '모바일 애플리케이션' : '웹 서비스'} 구축을 위한 엔터프라이즈 아키텍처 및 추진 전략 명세서입니다.

■ 핵심 기획 목표: ${ctx.purpose}
■ 주요 타겟 그룹: ${ctx.target}
■ 핵심 성과 지표(KPI): ${ctx.kpi}

사용자 중심의 직관적인 정보 구조(IA)와 고성능 클라이언트 사이드 반응성을 바탕으로, 서비스 런칭 시점부터 안정적이고 확장 가능한 운영 환경을 보장합니다.`,

      strategicIntent: `1. 플랫폼 최적화 전략 (${isApp ? 'Mobile App Native-First' : 'Responsive Web-First'}):
- ${isApp ? '모바일 환경에 특화된 44px 이상의 터치 타겟과 엄격한 제스처 내비게이션을 적용합니다.' : '다양한 해상도(모바일, 태블릿, 데스크톱)에 유연하게 대응하는 반응형 그리드 및 적응형 레이아웃을 채택합니다.'}

2. 사용자 경험(UX) 및 정보 구조(IA):
- 서비스 핵심 기능(${ctx.features})에 대한 사용자 도달 거리를 2클릭 이내로 단축하는 단순하고 명확한 경로 설계를 구현합니다.

3. 무결성 및 독립성 보장:
- 외부 벤더 종속성을 최소화하고 데이터 소유권을 100% 보장하는 로컬 우선 및 표준 API 아키텍처를 지향합니다.`,

      administrativeRoadmap: `[1단계: 요구사항 확정 및 설계 승인 (M-1)]
- 이해관계자 및 운영 책임자 요구사항 정의서(SRS) 최종 서명
- 서비스 규정, 개인정보처리방침 및 거버넌스 정책 수립

[2단계: 시스템 통합 및 보안 검증 (M-0.5)]
- 정보보호 및 역할 기반 접근 제어(RBAC) 감사
- 모바일 마켓 심사 기준 점검 (${isApp ? 'App Store & Google Play 가이드라인 준수' : '도메인 SSL/TLS 1.3 및 웹 호스팅 환경 검증'})

[3단계: 운영 배포 및 모니터링 전환 (런칭)]
- 프로덕션 환경 릴리스 및 무중단 롤아웃 수행
- 실시간 헬스체크 및 관리자 모드 가동`,

      sddSummary: `■ 프론트엔드/클라이언트 스펙:
- 기술 스택: ${ctx.techStack}
- 상태 관리: React Context 기반의 예측 가능한 단방향 데이터 바인딩
- 디자인 시스템: 엄격한 타이포그래피 스케일과 WCAG AA 명암비를 준수하는 토큰 시스템

■ 보안 및 데이터 관리:
- 사용자 인증: 무상태(Stateless) 토큰 기반 인증 및 최소 권한 원칙
- 데이터 스토리지: 클라이언트 로컬 캐시와 표준 클라우드 DB 연동을 통한 무손실 영속화`,

      negativeConstraints: `1. 성능 및 호환성 제약:
- ${isApp ? '모바일에서 마우스 호버 전용 기능이나 터치 불가능한 미세 버튼을 절대 배치하지 않습니다.' : '모바일 뷰포트에서 수평 스크롤이 발생하는 고정 너비 레이아웃을 배제합니다.'}

2. 보안 및 코드 제약:
- 클라이언트 번들에 비밀 키나 비인가 토큰을 직접 하드코딩하지 않습니다.
- 사용자 동의 없는 불필요한 개인 식별 정보(PII) 수집을 원천 차단합니다.`,

      aiDesignPrinciples: `1. 결정론적 신뢰성 (Deterministic First):
- 시스템의 기본 기능은 네트워크나 외부 AI 상태에 상관없이 100% 항상 작동해야 합니다.

2. 데이터 주권 및 개인정보 보호:
- 사용자의 기획안 및 비즈니스 데이터는 모델 학습에 사용되지 않으며, 사용자 로컬에 우선 보관됩니다.

3. 접근성 표준 준수:
- 모든 인터랙티브 요소는 텍스트 라벨과 고대비 색상을 유지합니다.`,

      adminMonitoringPlan: `1. 시스템 텔레메트리 및 가동률 점검:
- API 엔드포인트 응답 속도 및 비정상 트래픽 실시간 감지
- 에러 로그 및 예외 상황 자동 집계

2. 데이터 무결성 및 백업 관리:
- 프로젝트 스펙 데이터의 주기적 정합성 검증
- 원클릭 JSON 아카이빙 및 로컬 복원 기능 상시 제공

3. 관리자 감사(Audit) 로그:
- 시스템 권한 변경, 주요 설정 수정 내역에 대한 타임스탬프 로깅 유지`
    };
  }

  // English fallback
  return {
    executiveSummary: `This document outlines the enterprise architecture and strategic roadmap for "${ctx.projectName}", delivering a modern ${isApp ? 'mobile application' : 'web architecture'}.

■ Strategic Purpose: ${ctx.purpose}
■ Target Audience: ${ctx.target}
■ Key Performance Indicators: ${ctx.kpi}

Engineered with intuitive information architecture and high-performance client rendering, ensuring robust scalability from day one.`,

    strategicIntent: `1. Platform Specialization (${isApp ? 'Mobile Native-First' : 'Responsive Web-First'}):
- ${isApp ? 'Strict 44px touch targets and natural gesture hierarchies.' : 'Fluid responsive breakpoints across desktop, tablet, and mobile screens.'}

2. User Navigation Efficiency:
- Core feature reachability within 2 interaction steps (${ctx.features}).

3. Vendor Independence & Portability:
- Local-first data architecture with zero proprietary lock-in.`,

    administrativeRoadmap: `[Phase 1: Requirements Sign-off & Policy Alignment]
- Stakeholder sign-off and governance policy approval.

[Phase 2: Security Audit & Quality Assurance]
- Access control verification and ${isApp ? 'App Store guideline compliance.' : 'SSL/TLS production readiness.'}

[Phase 3: Production Release & Telemetry Activation]
- Zero-downtime deployment and automated status monitoring.`,

    sddSummary: `■ Technology Stack: ${ctx.techStack}
■ State Management: Predictable unidirectional reactive store
■ Compliance: WCAG AA color contrast and strict semantic markup
■ Persistence: Local-first offline capability with reliable cloud synchronization`,

    negativeConstraints: `1. Anti-patterns: ${isApp ? 'No hover-dependent controls or sub-44px targets.' : 'No fixed-width horizontal scroll overflows on mobile.'}
2. Security: No client-side secret exposure, no unauthorized telemetry.`,

    aiDesignPrinciples: `1. Deterministic Core: The application functions independently without external API downtime.
2. Data Privacy: 100% user data ownership with zero unauthorized model training.
3. Accessibility: Strict accessible hierarchy and high-contrast styling.`,

    adminMonitoringPlan: `1. Telemetry: Continuous monitoring of API health and latency.
2. Data Integrity: Regular validation of schema and one-click JSON backup redundancy.
3. Audit Log: Comprehensive timestamp logging for administrative operations.`
  };
}
