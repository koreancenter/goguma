import { SitePlan, FormInputEntity } from '../types';
import { compileStandalonePrototypeHtml } from './prototypeCompiler';
import {
  serializeAllBusinessRulesToMarkdown,
  serializeBusinessRulesToTestAssertions,
  serializeSectionBusinessRulesToMarkdown,
  wrapImmutableConstraint,
  isChapterOrSectionLocked,
} from './businessRulesSerializer';
import { GOGUMA_CHAPTERS } from './chapterData';
import { generateExecutionPlaybook } from './executionPlaybook';

export interface GogumaMarkdownBundle {
  executionPlaybookMd: string;   // 00_EXECUTION_PLAYBOOK.md
  proposalMd: string;            // docs/01_proposal.md
  roadmapMd: string;             // docs/02_roadmap.md
  designMd: string;              // docs/03_DESIGN.md
  specMd: string;                // docs/04_SPEC.md
  archConstitutionMd: string;    // docs/05_ARCH_CONSTITUTION.md
  dataSchemaMd: string;          // docs/06_DATA_SCHEMA.md
  securityMd: string;            // docs/07_SECURITY.md
  testChecklistMd: string;       // docs/08_TEST_CHECKLIST.md
  envSetupMd: string;            // docs/09_ENV_SETUP.md
  agentMd: string;               // docs/10_agent.md
  systemInstructionsMd: string;  // docs/11_system-instructions.md
  cursorrules: string;           // .cursorrules
  clinerules: string;            // .clinerules
  claudeMd: string;              // CLAUDE.md
  readmeMd: string;              // README.md
  prototypeHtml: string;         // prototype.html
}

export interface MarkdownDocInfo {
  id: string;
  docNumber: number;
  filename: string;
  relativePath: string;
  title: string;
  engTitle: string;
  description: string;
  content: string;
}

/**
 * Compiles a comprehensive 11-doc markdown blueprint bundle plus agent rules and prototype.
 * Pure function: deterministic, zero AI-drift, token-efficient, directly ingestible by Cursor / Claude Code.
 */
export function compileMarkdownBundle(
  plan: SitePlan,
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): GogumaMarkdownBundle {
  const isChapLocked = (chapterId: number): boolean => {
    if (lockedChapters?.includes(chapterId)) return true;
    const ch = GOGUMA_CHAPTERS.find(c => c.id === chapterId);
    if (!ch || !formInputs) return false;
    return ch.sections.some(s => Boolean(formInputs[`${chapterId}_${s.key}`]?.isLocked));
  };

  // Helper to extract raw input with fallbacks and wrap locked sections
  const getRaw = (key: string, fallback: string = ''): string => {
    const val = formInputs?.[key]?.userRawInput?.trim();
    const text = val || fallback;
    const [chStr, ...rest] = key.split('_');
    const chId = Number(chStr);
    const secKey = rest.join('_');
    if (text && !Number.isNaN(chId) && isChapterOrSectionLocked(chId, secKey, formInputs, lockedChapters)) {
      return wrapImmutableConstraint(text);
    }
    return text;
  };

  const projectName = plan.metadata?.projectName?.trim() || formInputs?.['1_project_name']?.userRawInput?.trim() || '모던 웹 서비스 기획서';
  const platform = plan.metadata?.platform === 'APP' ? 'APP' : 'WEB';
  const themeColor = plan.design?.themeColor || '#050505';
  const accentColor = plan.design?.accentColor || '#FFFFFF';

  // Ch 1 Inputs
  const projectNameRaw = getRaw('1_project_name', `${projectName} - 프로덕션 웹 애플리케이션 아키텍처 기획서`);
  const problemBackground = getRaw('1_problem_background', plan.metadata?.projectOverview?.purpose || '고성능 반응형 웹 서비스 구축을 위한 요구사항을 명확히 정의하고, 엔지니어링 팀의 생산성을 극대화합니다.');

  // Ch 2 Inputs
  const targetPersona = getRaw('2_target_persona', plan.metadata?.projectOverview?.target || '데스크톱 및 모바일 웹 환경에서 웹 서비스를 이용하는 실무 사용자와 관리자');
  const userProblems = getRaw('2_user_problems', '1. 복잡한 인터페이스로 인한 조작 비효율\n2. 느린 반응 속도 및 데이터 로딩 병목\n3. 체계적인 권한 제어 및 실시간 상태 동기화 부재');

  // Ch 3 Inputs
  const keyFeatures = getRaw('3_key_features', '1. SSO 및 토큰 기반 사용자 인증 / 권한 제어\n2. 실시간 대시보드 지표 모니터링 및 상태 시각화\n3. 대용량 데이터 그리드, 다중 조건 필터링 및 검색');
  const happyPath = getRaw('3_happy_path', '접속 ➔ 인증 로그인 ➔ 메인 대시보드 진입 ➔ 데이터 작업 수행 ➔ 실시간 상태 반영 및 결과 확인');

  // Ch 4 Inputs
  const dataColumnsRawPlain = formInputs?.['4_data_columns']?.userRawInput?.trim() || 'id, title, status, ownerId, metadata, createdAt';
  const rawCols = dataColumnsRawPlain.split(/[,;\n]+/).map(c => c.trim()).filter(Boolean);
  const dataColumns = rawCols.length > 0 ? rawCols : ['id', 'title', 'status', 'ownerId', 'createdAt'];
  const ch4StructuredRules = serializeSectionBusinessRulesToMarkdown(4, 'business_rules', formInputs, lockedChapters);
  const businessRulesProse = getRaw('4_business_rules', '');
  const businessRules = [
    businessRulesProse || (!ch4StructuredRules
      ? '1. 필수 식별 항목(ID, Title)은 공백 없이 필수 입력\n2. 상태 전이는 사전 정의된 파이프라인 순서에 따라 변경\n3. 권한에 따른 데이터 읽기/쓰기 접근 제어(RBAC) 적용'
      : ''),
    ch4StructuredRules ? `### Domain Rules & Constraints\n${ch4StructuredRules}` : '',
  ].filter(Boolean).join('\n\n');

  const allDomainRulesMd = serializeAllBusinessRulesToMarkdown(formInputs, lockedChapters);
  const domainRuleAssertionsMd = serializeBusinessRulesToTestAssertions(formInputs, lockedChapters);

  // Ch 5 Inputs
  const brandMood = getRaw('5_brand_mood', 'Luxury Monochrome: 칠흑의 딥 오닉스(#050505) + 고대비 순백(#FFFFFF) 미니멀리즘');
  const uiTone = getRaw('5_ui_tone', '시스템 산세리프 및 모노스페이스 타이포그래피, 8px 그리드 시스템, 0ms 인터랙션 피드백');

  // Ch 6 Inputs
  const pagesList = (plan.navigation?.pageStructure && plan.navigation.pageStructure.length > 0)
    ? plan.navigation.pageStructure
    : [
        { id: 'p1', name: '워크스페이스 대시보드', slug: '/dashboard', script: '실시간 핵심 KPI 및 최근 시스템 현황' },
        { id: 'p2', name: '프로젝트 및 데이터 관리', slug: '/projects', script: '데이터 그리드 및 필터링 검색' },
        { id: 'p3', name: '설정 및 권한 제어', slug: '/settings', script: '계정 설정, 팀 권한 및 API 통합' },
      ];
  const pagesSummaryRaw = pagesList.map((p, i) => `${i + 1}. **${p.name}** (\`${p.slug}\`): ${p.script || '주요 기능 화면'}`).join('\n');
  const pagesSummary = isChapLocked(6) ? wrapImmutableConstraint(pagesSummaryRaw) : pagesSummaryRaw;
  const navHierarchy = getRaw('6_nav_hierarchy', '글로벌 상단 바 ➔ 좌측 사이드바 내비게이션 ➔ 메인 컨텐츠 영역 ➔ 모달/드로어 상세 뷰');

  // Ch 7 Inputs
  const stackRequirements = getRaw('7_stack_requirements', 'React 19 + TypeScript + Tailwind CSS, Vite 번들러, RESTful API / GraphQL, Cloud Run 배포');
  const dataSovereignty = getRaw('7_data_sovereignty', '전송 구간 TLS 암호화, 안전한 세션 토큰 보관, 불필요한 서드파티 텔레메트리 스크립트 차단');

  // Ch 8 Inputs
  const verificationChecklist = getRaw('8_verification_checklist', '1. 주요 기능 조작 및 실시간 데이터 갱신 정상 작동 확인\n2. 반응형 뷰포트(Desktop / Tablet / Mobile Web) 호환성 검증\n3. 브라우저 콘솔 에러 제로 및 Lighthouse 코어 웹 바이탈 최적화');

  const now = new Date().toISOString();

  // --------------------------------------------------------------------------
  // 1. docs/01_proposal.md
  // --------------------------------------------------------------------------
  const proposalMd = `# ${projectName} - 웹 서비스 기획서 (01_proposal.md)

> **프로젝트 명칭**: ${projectName}  
> **타깃 플랫폼**: ${platform} Web Application  
> **아키텍처**: Modern Full-Stack Web Architecture  
> **작성 일시**: ${now}  

---

## 1. 프로젝트 배경 및 목적 (Scope & Background)
- **명칭 및 서비스 정의**: ${projectNameRaw}
- **개발 배경 및 해결 과제**:
${problemBackground}

---

## 2. 타깃 사용자 및 런타임 환경 (Target Audience & Runtime)
- **주 사용자 환경**:
${targetPersona}

- **해결하고자 하는 사용자 결핍 (Key Pain Points)**:
${userProblems}

---

## 3. 핵심 가치 제안 (Value Proposition)
1. **정밀한 기술 규약**: 엔지니어링 팀과 AI 에이전트가 즉각 구현할 수 있는 명확한 화면 정의 및 데이터 스키마 제공.
2. **고성능 웹 아키텍처**: 불필요한 번들 오버헤드를 배제하고 즉각적인 반응성을 보장하는 모던 웹 구조.
3. **확장성 및 유지보수성**: 모듈형 컴포넌트 설계와 일관된 디자인 시스템 토큰 준수.
`;

  // --------------------------------------------------------------------------
  // 2. docs/02_roadmap.md
  // --------------------------------------------------------------------------
  const roadmapMd = `# ${projectName} - 개발 로드맵 및 유저 플로우 (02_roadmap.md)

> **목적**: 단계별 마일스톤과 사용자 핵심 여정(Happy Path)을 체계적으로 관리하는 실행 가이드

---

## 1. 사용자 성공 여정 (End-to-End User Flow)
사용자가 시스템에 접속하여 최종 목적을 달성할 때까지의 표준 인터랙션 플로우:
\`\`\`text
${happyPath}
\`\`\`

---

## 2. 점진적 개발 마일스톤 (Milestones)

### 📌 Milestone 1: 프로토타입 및 코어 UI 레이아웃
- **목표**: \`prototype.html\` 및 코어 레이아웃 기반의 시각적 컴포넌트 렌더링.
- **주요 작업**:
  - 모노크롬 딥 오닉스(#050505) 및 고대비 타이포그래피 토큰 적용
  - 글로벌 네비게이션 및 반응형 그리드 뷰포트 구성
  - 핵심 화면 와이어프레임 1:1 렌더링

### 📌 Milestone 2: 상태 관리 및 비즈니스 로직 연동
- **목표**: 프론트엔드 상태 파이프라인 및 데이터 CRUD 연동.
- **주요 작업**:
  - 데이터 모델(${dataColumns.join(', ')}) 상태 인터페이스 구축
  - 신규 데이터 생성 모달 및 상태 전이 인터랙션 구현
  - 비동기 데이터 패칭 및 에러 핸들링

### 📌 Milestone 3: 검색 최적화, 보안 및 배포
- **목표**: 실시간 인라인 필터링, 보안 헤더 적용 및 프로덕션 빌드.
- **주요 작업**:
  - 디바운스 검색 및 다중 조건 정렬 필터 최적화
  - RBAC 권한 분리 및 클라이언트 세션 무결성 검증
  - Lighthouse 웹 바이탈 성능 측정 및 최종 배포
`;

  // --------------------------------------------------------------------------
  // 3. docs/03_DESIGN.md
  // --------------------------------------------------------------------------
  const designMd = `# ${projectName} - 디자인 시스템 및 UI 가이드라인 (03_DESIGN.md)

> **디자인 원칙**: 하이엔드 럭셔리 미니멀리즘(Luxury Black & White), 고대비 타이포그래피, 8px 그리드 시스템, 불필요한 장식 배제.

---

## 1. 컬러 팔레트 (Color Tokens - High Contrast & Monochrome)
- **캔버스 배경 (Canvas Background)**: \`#050505\` (딥 오닉스)
- **서브 패널 배경 (Surface Secondary)**: \`#0A0A0A\` / \`#0D0D0D\`
- **카드 및 인풋 배경 (Input & Card Background)**: \`#111111\` / \`#141414\`
- **경계선 토큰 (Borders & Dividers)**: \`rgba(255, 255, 255, 0.1)\` / \`rgba(255, 255, 255, 0.15)\`
- **주 텍스트 (Primary Text)**: \`#FFFFFF\` (순백 고대비)
- **보조 텍스트 (Muted Text)**: \`#A1A1AA\` (뉴트럴 그레이)
- **포커스 링 (Focus Ring)**: \`rgba(255, 255, 255, 0.3)\`

## 2. 타이포그래피 (Typography System)
- **헤딩 (Headings)**: \`font-sans font-bold tracking-tight\` (명확하고 정돈된 스위스 스타일 위계)
- **본문 (Body Text)**: \`font-sans text-sm sm:text-base leading-relaxed text-neutral-300\`
- **코드 및 기술 데이터 (Technical Data)**: \`JetBrains Mono / monospace\`, \`text-xs sm:text-sm\`
- **입력창 규격**: 불필요한 장식 테두리 대신 절제된 단색 보더와 즉각적인 포커스 피드백

## 3. 터치 및 인터랙션 규격 (Interaction Metrics)
- **주요 액션 버튼**: \`h-10 px-5 text-sm font-semibold rounded-[2px]\`
- **모달 및 드로어**: \`backdrop-blur-md bg-[#0D0D0D]/95 border border-white/10\`
- **전환 애니메이션**: 과도한 바운스 효과 배제, 150ms 쾌속 페이드/슬라이드

## 4. 브랜드 무드 및 UI 톤앤매너 (Chapter 05 Spec)
- **브랜드 분위기**:
${brandMood}
- **UI 톤앤매너**:
${uiTone}

## 5. 안티-슬롭(Anti-Slop) 원칙
- 알록달록한 다색상 네온 그라데이션 금지
- 둥근 알약형(Pill) 버튼 남발 금지 (샤프한 직각/미세 라운드 2px 고수)
- 본질과 무관한 만화풍 일러스트 및 유치한 아이콘 장식 금지
`;

  // --------------------------------------------------------------------------
  // 4. docs/04_SPEC.md
  // --------------------------------------------------------------------------
  const specMd = `# ${projectName} - 시스템 기능 사양서 (04_SPEC.md)

> **시스템 아키텍처**: 모던 웹 애플리케이션 / 반응형 SPA & SSR 호환 아키텍처

---

## 1. 정보구조 및 화면 목록 (Information Architecture)
${pagesSummary}

- **내비게이션 계층 및 라우트 구조**:
${navHierarchy}

---

## 2. 필수 핵심 기능 명세 (Functional Requirements)
${keyFeatures}

---

## 3. 성능 및 반응성 SLA (Performance SLA)
1. **페이지 전환 지연**: 50ms 미만 (부드러운 클라이언트 라우팅)
2. **입력 반응 지연**: 16ms (60fps 유지)
3. **초기 로딩 속도**: First Contentful Paint (FCP) 0.8초 이내
4. **반응형 뷰포트**: 320px 모바일 뷰부터 2560px 4K 울트라와이드 디스플레이까지 완벽 대응

---

## 4. 프로토타입 시각 기준 (Prototype-as-Spec Protocol)
- 프로젝트 루트 디렉터리의 \`prototype.html\`은 화면 구조와 인터랙션의 시각적 기준점입니다.
- 개발팀과 AI 에이전트는 \`prototype.html\`에 정의된 화면 컴포넌트 계층, 화면 전환 구조를 React + TypeScript 코드로 1:1 충실히 변환하여 구현합니다.${allDomainRulesMd ? `

---

## 5. 도메인 비즈니스 규칙 및 제약 사항 (Domain Rules & Constraints)
${allDomainRulesMd}` : ''}
`;

  // --------------------------------------------------------------------------
  // 5. docs/05_ARCH_CONSTITUTION.md
  // --------------------------------------------------------------------------
  const archConstitutionMd = `# ${projectName} - 시스템 아키텍처 헌법 (05_ARCH_CONSTITUTION.md)

> **원칙**: 견고하고 확장 가능한 프로덕션 웹 코드베이스를 위한 불변의 기술 원칙

---

## 1. 기술 스택 규약 (Immutable Tech Stack)
- **프론트엔드**: React 19 + TypeScript + Tailwind CSS
- **빌드 도구**: Vite
- **아이콘 시스템**: Lucide React
- **상태 관리**: 리액트 내장 훅 및 모듈형 컨텍스트 기반 구조

---

## 2. 엄격한 엔지니어링 제약 조건 (Engineering Constraints)
1. **불필요한 무거운 의존성 추가 금지**:
   - 무거운 글로벌 상태 라이브러리 남발 금지 (React 기본 상태 훅 우선).
   - 네이티브 Fetch API를 사용하며 불필요한 HTTP 래퍼 설치 지양.
2. **엄격한 타입 안전성**:
   - \`any\` 타입 사용 금지, 모든 엔터티와 API 응답에 대해 엄격한 인터페이스 정의.
3. **디자인 무결성**:
   - \`03_DESIGN.md\`의 럭셔리 모노크롬 테마와 고대비 규약을 준수할 것.
`;

  // --------------------------------------------------------------------------
  // 6. docs/06_DATA_SCHEMA.md
  // --------------------------------------------------------------------------
  const dataSchemaMd = `# ${projectName} - 데이터 모델 및 API 스키마 (06_DATA_SCHEMA.md)

> **목적**: 웹 서비스 엔터티 모델 및 TypeScript 인터페이스 규약

---

## 1. 데이터 엔터티 필드 정의
\`\`\`text
${dataColumns.join(', ')}
\`\`\`

---

## 2. TypeScript 인터페이스 정의
\`\`\`typescript
export type EntityStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'SUSPENDED';

export interface MainResourceEntity {
  id: string;               // 고유 식별자 (UUIDv4)
  createdAt: string;        // 생성 일시 (ISO 8601)
  updatedAt: string;        // 수정 일시 (ISO 8601)
  status: EntityStatus;     // 상태
  
  // 도메인 리소스 필드
${dataColumns.map(col => `  ${translateColumnToProp(col)}: string;        // ${col}`).join('\n')}
  
  metadata?: Record<string, unknown>; // 확장 메타데이터
}
\`\`\`

---

## 3. 비즈니스 로직 및 유효성 검증 규칙
${businessRules}${allDomainRulesMd && !ch4StructuredRules ? `

### 전 챕터 도메인 제약 사항 (Cross-Chapter Constraints)
${allDomainRulesMd}` : ''}
`;

  // --------------------------------------------------------------------------
  // 7. docs/07_SECURITY.md
  // --------------------------------------------------------------------------
  const securityMd = `# ${projectName} - 웹 보안 및 규정 준수 (07_SECURITY.md)

> **원칙**: 엔터프라이즈 데이터 보호 및 전송/저장 보안 규약 준수

---

## 1. 보안 핵심 원칙
1. **Zero Trust & 통신 암호화**: 모든 네트워크 통신은 TLS 1.3 이상 암호화 채널을 사용합니다.
2. **세션 및 토큰 보안**: 인증 토큰은 보안 스토리지에 보관하며 XSS 및 CSRF 취약점을 방지합니다.
3. **입력값 위생화**: 모든 사용자 입력에 대해 엄격한 살균(Sanitization) 및 스키마 검증을 적용합니다.

---

## 2. 보안 가드레일 (Security Guardrails)
1. **XSS 방지**: \`dangerouslySetInnerHTML\`의 무분별한 사용을 엄격히 금지합니다.
2. **의존성 무결성**: 정기적인 취약점 스캔을 통해 안전한 패키지만 유지합니다.

## 3. 데이터 주권 및 기술 스택 요구사항 (Chapter 07 Spec)
- **아키텍처 & 기술 스택**:
${stackRequirements}
- **데이터 주권 & 보안**:
${dataSovereignty}
`;

  // --------------------------------------------------------------------------
  // 8. docs/08_TEST_CHECKLIST.md
  // --------------------------------------------------------------------------
  const testChecklistMd = `# ${projectName} - 개발 검수 및 인수 테스트 기준 (08_TEST_CHECKLIST.md)

> **목적**: 개발 완료 후 시스템의 정상 동작을 검증하기 위한 QA 인수 기준

---

## ✅ 필수 검수 체크리스트
${verificationChecklist}

---

## 🧪 기능별 세부 검증 시나리오
1. **인증 및 세션 검증**:
   - 로그인 / 로그아웃 플로우 및 보호된 라우트 접근 제어 검증.
2. **데이터 CRUD 검증**:
   - 신규 데이터 생성, 조회, 수정, 삭제 시 0ms 즉각 UI 반영 검증.
3. **검색 및 필터링 속도**:
   - 키워드 입력 시 16ms 이내 빠른 인라인 필터링 검증.
4. **반응형 뷰포트 레이아웃**:
   - 모바일, 태블릿, 데스크톱 화면에서 레이아웃 깨짐 현상 제로 확인.${domainRuleAssertionsMd ? `

---

## 🔒 도메인 규칙 인수 검증 (Domain Rules Verification)
${domainRuleAssertionsMd}` : ''}
`;

  // --------------------------------------------------------------------------
  // 9. docs/09_ENV_SETUP.md
  // --------------------------------------------------------------------------
  const envSetupMd = `# ${projectName} - 개발 환경 세팅 & 배포 가이드 (09_ENV_SETUP.md)

> **목적**: 프로젝트 클론 후 로컬 개발 서버 구동 및 배포 파이프라인 가이드

---

## 1. 빠른 프로토타입 실행
- 폴더 내 \`prototype.html\`을 브라우저에서 직접 열어 인터랙션을 확인합니다.

---

## 2. 로컬 개발 환경 구동
\`\`\`bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 구동 (포트 3000)
npm run dev

# 3. 프로덕션 빌드 검증
npm run build
\`\`\`
`;

  // --------------------------------------------------------------------------
  // 10. docs/10_agent.md
  // --------------------------------------------------------------------------
  const agentMd = `# ${projectName} - AI 개발 에이전트 지침 (10_agent.md)

> **정의**: Cursor, Claude Code 등 AI 코딩 에이전트의 역할과 개발 수칙 규정

---

## 1. 에이전트의 핵심 임무
1. **사양서 기반 구현**: \`docs/\` 폴더의 사양서 11종을 기준으로 정확한 컴포넌트와 비즈니스 로직을 구현한다.
2. **아키텍처 불변성 준수**: \`05_ARCH_CONSTITUTION.md\`의 기술 스택 원칙을 엄격히 준수한다.
3. **디자인 시스템 가디언**: \`03_DESIGN.md\`의 럭셔리 모노크롬 톤앤매너와 고대비 규약을 절대 해치지 않는다.

---

## 2. 작업 수칙
- 코드를 수정하기 전 반드시 \`docs/04_SPEC.md\`와 \`docs/06_DATA_SCHEMA.md\`를 검토할 것.
- 컴포넌트 작성 시 엄격한 TypeScript 타입을 부여하고 콘솔 에러가 없도록 관리할 것.${allDomainRulesMd ? `

---

## 3. 도메인 불변 규칙 (Domain Rules & Constraints)
${allDomainRulesMd}` : ''}
`;

  // --------------------------------------------------------------------------
  // 11. docs/11_system-instructions.md
  // --------------------------------------------------------------------------
  const systemInstructionsMd = `# [SYSTEM INSTRUCTION] - ${projectName} 개발 프롬프트 (11_system-instructions.md)

당신은 '${projectName}' 웹 서비스를 구현하는 수석 소프트웨어 엔지니어입니다.

## 📌 절대 준수 규칙 (CRITICAL)
1. **문서 기반 개발 (Spec-Driven)**: 
   - \`docs/01_proposal.md\`부터 \`docs/10_agent.md\`까지의 사양서 11종을 기준으로 개발을 진행하십시오.
2. **기술 스택 통제**:
   - React 19 + TypeScript + Tailwind CSS를 사용하며, 승인되지 않은 외부 라이브러리를 임의 설치하지 마십시오.
3. **디자인 규약 준수**:
   - \`docs/03_DESIGN.md\`에 정의된 모노크롬 딥 오닉스(#050505) 테마와 고대비 UI를 적용하십시오.
4. **타입 안전성**:
   - 엄격한 TypeScript 인터페이스를 유지하고 \`any\` 타입을 배제하십시오.${allDomainRulesMd ? `

## 🔒 Domain Rules & Constraints (Mandatory Invariants)
${allDomainRulesMd}` : ''}

지금 \`docs/04_SPEC.md\`와 \`docs/06_DATA_SCHEMA.md\`를 검토하고, 핵심 컴포넌트 구현을 시작하십시오.
`;

  // --------------------------------------------------------------------------
  // 12. .cursorrules, .clinerules, CLAUDE.md & README.md
  // --------------------------------------------------------------------------
  const cursorrules = `# Cursor Rules for ${projectName}
# Web Development Architecture & Specifications (Archival Paper & Sumuk Ink)

- Ground Truth: Use prototype.html as the primary visual, navigational, and structural reference.
- Specification First: Always read the docs/ folder before modifying code (specifically 03_DESIGN.md, 04_SPEC.md, 05_ARCH_CONSTITUTION.md, 06_DATA_SCHEMA.md).
- Strict Design System: Follow the Archival Paper & Sumuk Ink palette (Canvas #FAF8F5, Surface #F3EFEA, Card #FCFBF9, Hairline #E5E0D8, Ink #191816, Accent #23392D).
- Zero Dependency Slop: Do NOT install heavy unapproved third-party libraries (Redux, Axios, etc.). Use native fetch, React 19 hooks, and Lucide icons.
- Strict Type Safety: Maintain clean, modular, and strictly typed TypeScript with zero any types.${allDomainRulesMd ? `

## Domain Rules & Constraints
${allDomainRulesMd}` : ''}
`;

  const clinerules = cursorrules;

  const claudeMd = `# CLAUDE.md - ${projectName} Engineering Instructions

## Core Principles
1. **Spec-Driven Development**: All architectural contracts and UI specs reside in \`docs/\`.
   - \`docs/04_SPEC.md\` (Screen IA and interaction definitions)
   - \`docs/05_ARCH_CONSTITUTION.md\` (Engineering stack and constraints)
   - \`docs/06_DATA_SCHEMA.md\` (Data models and validation rules)
2. **Visual SSOT**: \`prototype.html\` is the interactive reference. Reverse engineer its components 1:1.
3. **Design System**: Archival Paper & Sumuk Ink (Warm paper #FAF8F5, hairline borders #E5E0D8, sumuk ink #191816, deep green #23392D).
4. **Clean Code**: TypeScript strict mode, functional components, zero console errors.${allDomainRulesMd ? `

## Domain Rules & Constraints
${allDomainRulesMd}` : ''}
`;

  const readmeMd = `# ${projectName} - 개발 기획서 및 11종 기술 사양서 패키지

본 패키지는 웹/앱 개발 기획 스튜디오(GOGUMA)에서 생성된 완성형 기술 사양서 및 독립 실행형 프로토타입 번들입니다.

## 📦 패키지 구성
- \`00_EXECUTION_PLAYBOOK.md\`: 단계별 바이브 코딩 실행 플레이북 및 도메인 전문가 QA 체크리스트
- \`prototype.html\`: 별도 서버나 설치 없이 브라우저에서 즉시 열리는 단일 파일 인터랙티브 프로토타입
- \`.cursorrules\`: Cursor AI 에이전트를 위한 아키텍처 및 구현 지침
- \`CLAUDE.md\`: Claude Code CLI 에이전트를 위한 프로젝트 가이드라인
- \`docs/\`: 11종 표준 기술 사양서 마크다운 문서
  - \`01_proposal.md\`: 서비스 개요 및 가치 제안
  - \`02_roadmap.md\`: 개발 마일스톤 및 유저 플로우
  - \`03_DESIGN.md\`: 디자인 시스템 및 UI 토큰
  - \`04_SPEC.md\`: 전체 화면 정의 및 상세 기능 명세 (IA)
  - \`05_ARCH_CONSTITUTION.md\`: 아키텍처 불변 헌법 및 기술 스택
  - \`06_DATA_SCHEMA.md\`: 데이터 모델 및 TypeScript 엔터티 스키마
  - \`07_SECURITY.md\`: 보안 정책 및 로컬 퍼스트 규정
  - \`08_TEST_CHECKLIST.md\`: 기능 및 반응형 검수 체크리스트
  - \`09_ENV_SETUP.md\`: 개발 환경 셋업 가이드
  - \`10_agent.md\`: AI 코딩 에이전트 작업 지침
  - \`11_system-instructions.md\`: 시스템 프롬프트

## 🚀 빠른 시작 (Quick Start)
1. \`00_EXECUTION_PLAYBOOK.md\`를 열어 Phase 1 ~ Phase 4 실행 가이드를 확인합니다.
2. \`prototype.html\`을 더블 클릭하여 브라우저에서 인터랙티브 동작 화면을 확인합니다.
3. Cursor 또는 Claude Code에서 본 폴더를 열고 \`00_EXECUTION_PLAYBOOK.md\`의 Phase 1 프롬프트를 입력해 개발을 시작합니다.
`;

  // --------------------------------------------------------------------------
  // 13. prototype.html & 00_EXECUTION_PLAYBOOK.md
  // --------------------------------------------------------------------------
  const prototypeHtml = compileStandalonePrototypeHtml(plan, { formInputs });
  const executionPlaybookMd = generateExecutionPlaybook({
    plan,
    formInputs,
    lockedChapters,
    projectName,
  });

  return {
    executionPlaybookMd,
    proposalMd,
    roadmapMd,
    designMd,
    specMd,
    archConstitutionMd,
    dataSchemaMd,
    securityMd,
    testChecklistMd,
    envSetupMd,
    agentMd,
    systemInstructionsMd,
    cursorrules,
    clinerules,
    claudeMd,
    readmeMd,
    prototypeHtml,
  };
}

/**
 * Returns the Execution Playbook plus all 11 docs with metadata for UI tabs, viewers, and exports.
 */
export function getMarkdownDocsList(bundle: GogumaMarkdownBundle): MarkdownDocInfo[] {
  return [
    {
      id: '00_EXECUTION_PLAYBOOK',
      docNumber: 0,
      filename: '00_EXECUTION_PLAYBOOK.md',
      relativePath: '00_EXECUTION_PLAYBOOK.md',
      title: '실행 플레이북',
      engTitle: 'Execution Playbook',
      description: '단계별 바이브 코딩 실행 프롬프트 및 도메인 검증 체크리스트',
      content: bundle.executionPlaybookMd,
    },
    {
      id: '01_proposal',
      docNumber: 1,
      filename: '01_proposal.md',
      relativePath: 'docs/01_proposal.md',
      title: '서비스 기획서',
      engTitle: 'Overview & Proposal',
      description: '웹 서비스 정의, 목적 및 해결 과제 명세',
      content: bundle.proposalMd,
    },
    {
      id: '02_roadmap',
      docNumber: 2,
      filename: '02_roadmap.md',
      relativePath: 'docs/02_roadmap.md',
      title: '개발 로드맵',
      engTitle: 'Roadmap & Flow',
      description: '엔드투엔드 사용자 여정 및 점진적 마일스톤',
      content: bundle.roadmapMd,
    },
    {
      id: '03_DESIGN',
      docNumber: 3,
      filename: '03_DESIGN.md',
      relativePath: 'docs/03_DESIGN.md',
      title: '디자인 시스템 규약',
      engTitle: 'Design System & Tokens',
      description: '모노크롬 테마 토큰, 타이포그래피, 레이아웃 규격',
      content: bundle.designMd,
    },
    {
      id: '04_SPEC',
      docNumber: 4,
      filename: '04_SPEC.md',
      relativePath: 'docs/04_SPEC.md',
      title: '전체 기능 사양서',
      engTitle: 'System Specifications',
      description: '화면 구조(IA), 페이지 목록 및 상세 기능 명세',
      content: bundle.specMd,
    },
    {
      id: '05_ARCH_CONSTITUTION',
      docNumber: 5,
      filename: '05_ARCH_CONSTITUTION.md',
      relativePath: 'docs/05_ARCH_CONSTITUTION.md',
      title: '아키텍처 불변 헌법',
      engTitle: 'Architecture Constitution',
      description: '기술 스택 불변 규칙 및 엔지니어링 제약 조건',
      content: bundle.archConstitutionMd,
    },
    {
      id: '06_DATA_SCHEMA',
      docNumber: 6,
      filename: '06_DATA_SCHEMA.md',
      relativePath: 'docs/06_DATA_SCHEMA.md',
      title: '데이터 모델 및 API 스키마',
      engTitle: 'Data Model & Schema',
      description: '데이터베이스 엔터티 명세 및 TypeScript 인터페이스',
      content: bundle.dataSchemaMd,
    },
    {
      id: '07_SECURITY',
      docNumber: 7,
      filename: '07_SECURITY.md',
      relativePath: 'docs/07_SECURITY.md',
      title: '웹 보안 및 규정 준수',
      engTitle: 'Security & Compliance',
      description: '데이터 보안, TLS 통신 및 무결성 정책',
      content: bundle.securityMd,
    },
    {
      id: '08_TEST_CHECKLIST',
      docNumber: 8,
      filename: '08_TEST_CHECKLIST.md',
      relativePath: 'docs/08_TEST_CHECKLIST.md',
      title: '개발 검수 체크리스트',
      engTitle: 'QA Acceptance Checklist',
      description: '기능 및 반응형 렌더링 인수 테스트 기준',
      content: bundle.testChecklistMd,
    },
    {
      id: '09_ENV_SETUP',
      docNumber: 9,
      filename: '09_ENV_SETUP.md',
      relativePath: 'docs/09_ENV_SETUP.md',
      title: '개발 환경 설정 가이드',
      engTitle: 'Environment Setup',
      description: '로컬 개발 서버 구동 및 배포 가이드',
      content: bundle.envSetupMd,
    },
    {
      id: '10_agent',
      docNumber: 10,
      filename: '10_agent.md',
      relativePath: 'docs/10_agent.md',
      title: 'AI 개발 에이전트 지침',
      engTitle: 'Agent Guidelines',
      description: 'AI 코딩 에이전트 작업 수칙 및 책임 규정',
      content: bundle.agentMd,
    },
    {
      id: '11_system-instructions',
      docNumber: 11,
      filename: '11_system-instructions.md',
      relativePath: 'docs/11_system-instructions.md',
      title: '시스템 프롬프트',
      engTitle: 'System Instructions',
      description: 'Cursor 및 Claude Code 시작 시스템 프롬프트',
      content: bundle.systemInstructionsMd,
    },
    {
      id: 'cursorrules',
      docNumber: 12,
      filename: '.cursorrules',
      relativePath: '.cursorrules',
      title: 'Cursor 에이전트 지침',
      engTitle: 'Cursor Rules',
      description: 'Cursor AI 에이전트 불변 행동 규칙 및 라이브러리 통제',
      content: bundle.cursorrules,
    },
  ];
}

function translateColumnToProp(columnName: string): string {
  const c = columnName.trim().toLowerCase();
  if (c.includes('id') || c.includes('아이디') || c.includes('식별')) return 'id';
  if (c.includes('제목') || c.includes('명칭') || c.includes('title')) return 'title';
  if (c.includes('이름') || c.includes('성명') || c.includes('name')) return 'name';
  if (c.includes('이메일') || c.includes('email')) return 'email';
  if (c.includes('연락처') || c.includes('전화') || c.includes('phone')) return 'phone';
  if (c.includes('상태') || c.includes('status')) return 'status';
  if (c.includes('권한') || c.includes('role')) return 'role';
  if (c.includes('카테고리') || c.includes('분류')) return 'category';
  if (c.includes('금액') || c.includes('가격') || c.includes('price')) return 'price';
  if (c.includes('설명') || c.includes('description')) return 'description';
  if (c.includes('메타') || c.includes('metadata')) return 'metadata';
  if (c.includes('일시') || c.includes('생성일') || c.includes('date')) return 'createdAt';
  return 'fieldValue';
}
