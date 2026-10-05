import { SitePlan, FormInputEntity } from '../types';
import { compileStandalonePrototypeHtml } from './prototypeCompiler';

export interface GogumaMarkdownBundle {
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
  formInputs?: Record<string, FormInputEntity>
): GogumaMarkdownBundle {
  // Helper to extract raw input with fallbacks
  const getRaw = (key: string, fallback: string = ''): string => {
    if (formInputs && formInputs[key]?.userRawInput?.trim()) {
      return formInputs[key].userRawInput.trim();
    }
    return fallback;
  };

  const projectName = plan.metadata?.projectName?.trim() || getRaw('1_project_name', '우리동네 동물병원 예약장부');
  const platform = plan.metadata?.platform === 'APP' ? 'APP' : 'WEB';
  const themeColor = plan.design?.themeColor || '#6B1D42';
  const accentColor = plan.design?.accentColor || '#10B981';
  const layout = plan.design?.layout || 'standard';

  // Ch 1 Inputs
  const projectNameRaw = getRaw('1_project_name', `${projectName} - 1인 실무 전문가를 위한 업무 프로세스 자동화 장부`);
  const problemBackground = getRaw('1_problem_background', plan.metadata?.projectOverview?.reference || '수기 장부와 메신저 소통이 겹쳐 중복 예약이 발생하고, 월말마다 엑셀 정산에 3일씩 소요되는 비효율을 겪고 있습니다.');

  // Ch 2 Inputs
  const targetPersona = getRaw('2_target_persona', plan.metadata?.projectOverview?.target || '진료 중간중간 PC나 태블릿으로 빠르게 스케줄을 확인하고 등록하는 1인 실무자');
  const userProblems = getRaw('2_user_problems', '1. 중복 예약 발생 및 누락으로 인한 업무 차질\n2. 미수금/수납 내역 확인이 한눈에 되지 않음\n3. 과거 이력 및 고객 특이사항을 빠르게 검색할 수 없음');

  // Ch 3 Inputs
  const keyFeatures = getRaw('3_key_features', '1. 1초 원클릭 데이터 신규 등록 (이름, 연락처, 일정, 메모)\n2. 상태 칩 원클릭 순환 변경 (접수 ➔ 확정 ➔ 완료 ➔ 취소)\n3. 엑셀 형태 실시간 목록 조회 및 키워드 즉시 필터링');
  const happyPath = getRaw('3_happy_path', '접속 ➔ [추가] 클릭 ➔ 고객명/전화번호 입력 ➔ [저장] ➔ 장부 상단 즉시 1줄 추가 반영 확인 ➔ 상태 변경');

  // Ch 4 Inputs
  const dataColumnsRaw = getRaw('4_data_columns', '고객명, 연락처, 예약일시, 관리항목, 특이사항, 상태');
  const rawCols = dataColumnsRaw.split(/[,;\n]+/).map(c => c.trim()).filter(Boolean);
  const dataColumns = rawCols.length > 0 ? rawCols : ['고객명', '연락처', '일시', '항목', '상태'];
  const businessRules = getRaw('4_business_rules', '1. 주요 식별 항목(이름, 연락처)은 필수 입력\n2. 상태는 [대기 ➔ 확정 ➔ 완료 ➔ 취소] 4가지 순환\n3. 취소 처리 시 사유를 메모란에 기록 권장');

  // Ch 5 Inputs
  const brandMood = getRaw('5_brand_mood', `Classic Warm Paper: 편안한 아이보리 도화지(#F8F4EB)에 깊은 고구마 와인(${themeColor}) 악센트`);
  const uiTone = getRaw('5_ui_tone', '눈이 편안한 명조 헤딩 + 하단 밑줄형 필기 인풋 + 라운드 상태 칩, 0ms 실시간 피드백');

  // Ch 6 Inputs
  const pagesList = (plan.navigation?.pageStructure && plan.navigation.pageStructure.length > 0)
    ? plan.navigation.pageStructure
    : [
        { id: 'p1', name: '장부 대시보드', slug: '/dashboard', script: '실시간 장부 목록 및 당일 일정 카드' },
        { id: 'p2', name: '신규 등록 폼', slug: '/records/new', script: '1초 입력 모달 폼' },
        { id: 'p3', name: '상세 및 이력', slug: '/records/detail', script: '과거 방문 및 상담 이력 타임라인' },
      ];
  const pagesSummary = pagesList.map((p, i) => `${i + 1}. **${p.name}** (\`${p.slug}\`): ${p.script || '주요 기능 화면'}`).join('\n');
  const navHierarchy = getRaw('6_nav_hierarchy', '좌측 메뉴/상단 탭 바 ➔ 중앙 장부 목록 ➔ 우측/모달 상세 및 입력창');

  // Ch 7 Inputs
  const stackRequirements = getRaw('7_stack_requirements', 'React + TypeScript + Tailwind CSS (서드파티 무거운 라이브러리 추가 설치 금지), 로컬 IndexedDB 스토리지');
  const dataSovereignty = getRaw('7_data_sovereignty', '모든 장부 데이터는 외부 서버로 전송하지 않고 브라우저에만 저장(Local-First), 오프라인 100% 작동');

  // Ch 8 Inputs
  const verificationChecklist = getRaw('8_verification_checklist', '1. 입력 폼에 값 입력 후 [저장] 시 즉시 장부 1줄 추가 반영 확인\n2. 브라우저 F5 새로고침 후에도 기록이 안전하게 유지되는지 확인\n3. 인터넷이 차단된 오프라인 상태에서도 100% 정상 작동하는지 확인');

  const now = new Date().toISOString();

  // --------------------------------------------------------------------------
  // 1. docs/01_proposal.md
  // --------------------------------------------------------------------------
  const proposalMd = `# 🍠 ${projectName} - 프로젝트 기획 제안서 (01_proposal.md)

> **프로젝트 명칭**: ${projectName}  
> **타깃 플랫폼**: ${platform}  
> **아키텍처**: Local-First IndexedDB + Single-file Vanilla Prototype  
> **작성 일시**: ${now}  
> **공식 서비스 도메인**: https://goguma.app  

---

## 1. 프로젝트 배경 및 문제 정의 (Problem Definition)
- **명칭 및 한 줄 정의**: ${projectNameRaw}
- **해결하려는 문제 및 배경**:
${problemBackground}

---

## 2. 타깃 사용자 및 페르소나 (Target Persona)
- **주 사용자 환경**:
${targetPersona}

- **사용자가 겪는 핵심 고통 (Pain Points)**:
${userProblems}

---

## 3. 핵심 가치 제안 (Value Proposition)
1. **바이브 코딩 최적화**: 복잡한 설정 없이 AI 에이전트(Cursor, Claude Code)가 즉시 구현할 수 있는 명확한 경계 제공.
2. **도메인 전문가 주권**: 코딩 지식이 없어도 본인의 업무 지식을 100% 반영한 장부 시스템 구축.
3. **영구적 데이터 주권**: 중앙 서버 구독료 없이 사용자의 브라우저 내에서 안전하게 구동.
`;

  // --------------------------------------------------------------------------
  // 2. docs/02_roadmap.md
  // --------------------------------------------------------------------------
  const roadmapMd = `# 🍠 ${projectName} - 단계별 로드맵 및 사용자 여정 (02_roadmap.md)

> **목적**: 바이브 코딩 시 에이전트가 단계를 건너뛰지 않고 순차적으로 완성하도록 유도하는 마일스톤 가이드

---

## 1. 사용자 성공 여정 (Happy Path)
사용자가 시스템에 접속하여 최종 목적을 달성할 때까지의 이상적인 흐름:
\`\`\`text
${happyPath}
\`\`\`

---

## 2. 점진적 개발 마일스톤 (Milestones)

### 📌 Milestone 1: 인터랙티브 프로토타입 및 도화지 UI
- **목표**: \`prototype.html\` 단일 파일에서 클릭과 입력이 동작하는 UI 검증.
- **주요 작업**:
  - Warm Paper 테마(#F8F4EB) 및 ${themeColor} 악센트 적용
  - 하단 밑줄형 인풋 및 상태 칩 컴포넌트 렌더링
  - 더미 데이터 3~5건 즉시 표출

### 📌 Milestone 2: 로컬 데이터 장부 영속성 (Local-First Engine)
- **목표**: IndexedDB를 통한 실시간 CRUD 및 무중단 데이터 보존.
- **주요 작업**:
  - 장부 열(${dataColumns.join(', ')}) 스키마 구축
  - 1초 원클릭 등록 및 상태 토글([대기] ➔ [확정] ➔ [완료])
  - 브라우저 새로고침(F5) 시 데이터 복원 테스트

### 📌 Milestone 3: 검색/필터링 및 내보내기/백업
- **목표**: 실시간 인라인 검색 및 JSON/Excel 내보내기.
- **주요 작업**:
  - 키워드 타이핑 시 16ms(60fps) 이내 즉각 필터링
  - 로컬 백업 파일(.goguma.json) 다운로드 및 복원 기능
`;

  // --------------------------------------------------------------------------
  // 3. docs/03_DESIGN.md
  // --------------------------------------------------------------------------
  const designMd = `# 🍠 ${projectName} - 디자인 헌법 및 시각 규약 (03_DESIGN.md)

> **디자인 원칙**: 50대 이상 현업 전문가를 위한 눈이 편안한 아날로그 도화지 감성(Warm Paper), 48px 터치 인체공학, 제로-필(Zero-Pill) 규율, 높은 타이포그래피 위계.

---

## 1. 컬러 팔레트 (Color Tokens - WCAG AAA 준수)
- **도화지 배경 (Paper Background)**: \`#F8F4EB\` (따뜻한 미색 양장본 캔버스)
- **먹색 본문 (Ink Primary & Body)**: \`#111827\` / \`#2D2825\` (선명한 딥 차콜 먹색, 명도비 12:1~14:1+)
- **보조 먹색 (Ink Secondary)**: \`#374151\` / \`#4B5563\` (흐릿한 회색을 퇴출한 또렷한 설명문)
- **경계선 (Paper Borders)**: \`#D5CCBC\` / \`#E5DFD3\` (선명하고 자연스러운 종이 결 경계)
- **브랜드 주조색 (Brand Primary)**: \`${themeColor}\` (깊은 고구마 와인 / 업종별 시그니처 프리셋)
- **성공/완료 악센트 (Accent Status)**: \`${accentColor}\` (선명한 에메랄드 / 검수 완료)

## 2. 타이포그래피 (Typography System)
- **헤딩 (Headings)**: \`Noto Serif KR\`, 명조 서체로 정갈한 품격 부여 (\`text-3xl ~ text-5xl font-extrabold\`)
- **본문 및 질문 (Body & Questions)**: \`font-sans text-lg ~ text-xl leading-relaxed font-medium\` (최소 14px \`text-sm\` 규격화, 10~11px 퇴출)
- **원고지 인풋**: 투박한 사각 테두리 박스 대신 **선명한 3px 하단 밑줄(\`border-b-[3px]\`)** 적용 (\`text-lg ~ text-2xl leading-loose\`)
- **마크다운 사양서**: \`JetBrains Mono\`, \`font-mono text-sm ~ text-base leading-loose\`

## 3. 48px Ergonomics (터치 인체공학)
- **원클릭 가이드 칩**: \`min-h-[46px] px-5 py-3 text-sm sm:text-base font-bold\`
- **주요 전진/액션 버튼**: \`min-h-[50px ~ 54px] px-6 ~ px-9 text-base ~ text-lg font-extrabold\`
- **헤더 툴바 및 위젯 카드**: 최소 \`42px ~ 44px+\` 터치 영역 확보

## 4. 캔버스 공간감 & [👓 편안한 큰 글씨 모드]
- **캔버스 너비**: 기본 \`max-w-5xl\`, 미리보기 패널 접힘 시 \`max-w-6xl\` 와이드 몰입 모드 지원
- **우측 패널 접기**: 58px 슬림 레일로 축소하여 원고 작성 집중도 극대화
- **원클릭 큰 글씨 모드**: 활성화 시 전역 폰트 120% 스케일업 (입력창 최대 24px, 버튼 54px+)

## 5. 안티-AI 슬롭(Anti-Slop) 원칙
- 사이버펑크 네온 다크 모드 금지 (언제나 따스한 웜 페이퍼 유지)
- 보라-파랑 인위적 그라디언트 금지
- 중첩 카드(Card in Card) 금지 (단일 캔버스 내 정갈한 디바이더와 도화지 여백 활용)
`;

  // --------------------------------------------------------------------------
  // 4. docs/04_SPEC.md
  // --------------------------------------------------------------------------
  const specMd = `# 🍠 ${projectName} - 전체 시스템 기능 사양서 (04_SPEC.md)

> **시스템 아키텍처**: 브라우저 단독 구동 Local-First Single Page Application / PWA

---

## 1. 화면 구성 (Information Architecture)
${pagesSummary}

- **네비게이션 계층 및 이동 동선**:
${navHierarchy}

---

## 2. 필수 핵심 기능 명세
${keyFeatures}

---

## 3. 인터랙션 및 성능 SLA (Performance SLA)
1. **화면 전환 지연**: 50ms 미만 (깜빡임 없는 인메모리 라우팅)
2. **타이핑 반응 지연**: 16ms(60fps) 이내 유지
3. **자동 저장 디바운스**: 타이핑 종료 후 350ms 유휴 시 IndexedDB 원자적 커밋
4. **외부 의존성**: 외부 CDN 장애 시에도 로컬 캐시로 100% 작동

---

## 4. 프로토타입 1:1 시각적 기준 (Prototype-as-Spec Protocol)
- 본 프로젝트의 최상위 루트 디렉터리에는 브라우저에서 실제 구동 검증을 완료한 \`prototype.html\`이 위치합니다.
- AI 코딩 에이전트는 자의적인 상상이나 추측으로 UI를 설계하지 말고, 반드시 \`prototype.html\`에 정의된 화면 컴포넌트 계층, 화면 전환(Navigation Tabs / Bottom Bar), 슬라이드 상세 드로어(Detail Drawer), 그리고 상태 파이프라인(대기 ➔ 진행중 ➔ 완료)을 React 19 + TypeScript + Tailwind CSS 프로덕션 코드로 1:1 역공학 변환해야 합니다.
`;

  // --------------------------------------------------------------------------
  // 5. docs/05_ARCH_CONSTITUTION.md
  // --------------------------------------------------------------------------
  const archConstitutionMd = `# 🍠 ${projectName} - 아키텍처 불변 헌법 (05_ARCH_CONSTITUTION.md)

> **경고**: 바이브 코딩 에이전트는 본 헌법에 명시된 규칙을 임의로 수정하거나 위반할 수 없습니다.

---

## 1. 기술 스택 불변 원칙 (Immutable Stack)
- **프론트엔드 코어**: React 19 + TypeScript + Tailwind CSS (또는 바닐라 HTML/JS 단일 파일)
- **스토리지**: 브라우저 표준 \`IndexedDB\` (idb 래퍼) + 보조 \`LocalStorage\`
- **빌드 도구**: Vite
- **아이콘**: \`lucide-react\`

---

## 2. 에이전트 절대 금지 조항 (Negative Constraints)
1. **불필요한 무거운 npm 패키지 설치 금지**:
   - Redux, MobX, TanStack Query, Axios, Lodash, Moment.js 등의 설치를 엄격히 금지함.
   - 브라우저 표준 Fetch API, 네이티브 Date 객체, 리액트 기본 훅(\`useState\`, \`useCallback\`, \`useMemo\`)만 사용할 것.
2. **디자인 슬롭(AI Slop) 금지**:
   - 알록달록한 보라색 그라데이션, 유치한 둥근 알약형(Pill) 버튼 남발을 금지함.
   - 03_DESIGN.md의 Warm Paper 도화지 톤앤매너를 반드시 준수할 것.
3. **임의의 외부 백엔드 연동 금지**:
   - 사용자의 명시적 지시 없이 외부 REST API나 서드파티 인증 서버로 데이터를 송신하는 코드를 작성하지 말 것.
`;

  // --------------------------------------------------------------------------
  // 6. docs/06_DATA_SCHEMA.md
  // --------------------------------------------------------------------------
  const dataSchemaMd = `# 🍠 ${projectName} - 장부 데이터 스키마 & TS 인터페이스 (06_DATA_SCHEMA.md)

> **목적**: 엑셀 장부와 1:1로 대응되는 명확한 데이터 모델 및 타입스크립트 인터페이스 규약

---

## 1. 관리 열(Column) 정의
관리 대상 항목 목록:
\`\`\`text
${dataColumns.join(', ')}
\`\`\`

---

## 2. TypeScript 인터페이스 정의
\`\`\`typescript
export type RecordStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

export interface LedgerRecord {
  id: string;               // UUIDv4 (고유 식별자)
  createdAt: string;        // 생성 일시 (ISO 8601)
  updatedAt: string;        // 수정 일시 (ISO 8601)
  status: RecordStatus;     // 상태
  
  // 도메인 장부 필드
${dataColumns.map(col => `  ${translateColumnToProp(col)}: string;        // ${col}`).join('\n')}
  
  memo?: string;            // 부가 특이사항 및 메모
}
\`\`\`

---

## 3. 비즈니스 규칙 및 유효성 검증
${businessRules}
`;

  // --------------------------------------------------------------------------
  // 7. docs/07_SECURITY.md
  // --------------------------------------------------------------------------
  const securityMd = `# 🍠 ${projectName} - 로컬 데이터 주권 및 보안 규약 (07_SECURITY.md)

> **원칙**: 사용자의 소중한 장부 정보는 외부 서버로 유출되지 않으며, 사용자 기기에 온전히 머무릅니다.

---

## 1. 데이터 주권 원칙 (Data Sovereignty)
1. **Zero Cloud Telemetry**: 사용자가 작성한 고객 정보, 상담 내역, 매출 기록을 어떠한 원격 텔레메트리 서버로도 전송하지 않습니다.
2. **오프라인 동작 보장**: 인터넷이 완전히 끊긴 환경에서도 모든 읽기, 쓰기, 필터링, 정렬 기능이 정상 동작합니다.
3. **영구 캐시 보존**: \`navigator.storage.persist()\`를 호출하여 브라우저의 임의 캐시 청소로부터 장부 데이터를 보호합니다.

---

## 2. 보안 가드레일 (Security Guardrails)
1. **XSS 방지**: 사용자 입력 텍스트는 React의 기본 이스케이핑 처리를 통과하며, \`dangerouslySetInnerHTML\`의 무분별한 사용을 금지합니다.
2. **데이터 백업 및 암호화**: 백업 파일(.json) 내보내기 시 파일 변조 방지를 위한 메타데이터 검증을 수행합니다.
`;

  // --------------------------------------------------------------------------
  // 8. docs/08_TEST_CHECKLIST.md
  // --------------------------------------------------------------------------
  const testChecklistMd = `# 🍠 ${projectName} - 사용자 인수 검수(UAT) 체크리스트 (08_TEST_CHECKLIST.md)

> **목적**: 코딩 완료 후 사용자가 브라우저에서 직접 테스트하며 검증할 수 있는 시나리오

---

## ✅ 필수 검수 체크리스트
${verificationChecklist}

---

## 🧪 상세 시나리오
1. **신규 데이터 1초 등록**:
   - 입력창에 필수 항목 입력 후 [저장] 클릭
   - 기대 결과: 장부 목록 최상단에 애니메이션과 함께 즉각 1줄 추가
2. **상태 변경 순환**:
   - 장부 목록에서 상태 칩 클릭
   - 기대 결과: [접수] ➔ [확정] ➔ [완료] 색상이 부드럽게 변경됨
3. **새로고침(F5) 영속성**:
   - 데이터 등록 후 F5 새로고침
   - 기대 결과: 직전에 입력했던 데이터가 그대로 유지됨
4. **키워드 실시간 검색**:
   - 검색창에 단어 2글자 입력
   - 기대 결과: 0.1초 만에 해당 단어가 포함된 행만 필터링됨
`;

  // --------------------------------------------------------------------------
  // 9. docs/09_ENV_SETUP.md
  // --------------------------------------------------------------------------
  const envSetupMd = `# 🍠 ${projectName} - 개발 환경 세팅 & 실행 가이드 (09_ENV_SETUP.md)

> **목적**: 바이브 코딩 도구(Cursor, VS Code 등)에서 바로 프로젝트를 열고 개발을 시작하는 방법

---

## 1. 초간단 프로토타입 실행 (Zero-Setup)
- 다운로드받은 ZIP 파일의 압축을 풉니다.
- 폴더 내 \`prototype.html\`을 더블클릭합니다.
- 크롬, 사파리, 엣지 등 모든 브라우저에서 즉시 인터랙티브 장부가 실행됩니다.

---

## 2. React + Vite 풀 프로젝트 개발 환경
\`\`\`bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 구동
npm run dev

# 3. 브라우저에서 확인
# http://localhost:3000 접속
\`\`\`

---

## 3. 권장 에디터 설정
- **Cursor IDE / VS Code 권장 확장**:
  - Tailwind CSS IntelliSense
  - ESLint
  - Prettier
`;

  // --------------------------------------------------------------------------
  // 10. docs/10_agent.md
  // --------------------------------------------------------------------------
  const agentMd = `# 🍠 ${projectName} - 바이브 코딩 에이전트 역할 정의 (10_agent.md)

> **정의**: Cursor, Claude Code, Windsurf 등 AI 코딩 에이전트의 역할과 책임 규정

---

## 1. 에이전트의 핵심 임무
1. **도메인 번역가**: 비전문가의 일상어 요구사항을 정확한 TypeScript 인터페이스와 리액트 컴포넌트로 구현한다.
2. **미니멀리스트 아키텍트**: 불필요한 패키지를 설치하지 않고, \`05_ARCH_CONSTITUTION.md\`의 불변 헌법을 엄격히 지킨다.
3. **디자인 가디언**: \`03_DESIGN.md\`의 웜 페이퍼 감성과 제로-필(Zero-Pill) 규칙을 절대 해치지 않는다.

---

## 2. 작업 수칙
- 작업 전 반드시 \`docs/\` 폴더의 사양서 11종을 먼저 읽고 문맥을 파악할 것.
- 하나의 기능을 구현할 때마다 \`08_TEST_CHECKLIST.md\`를 기준으로 자체 검증을 완료할 것.

---

## 3. 프로토타입 역공학 수칙 (Prototype-as-Spec Rule)
- 에이전트는 코드를 작성하기 전에 최상위의 \`prototype.html\`을 열어 실제 렌더링된 DOM과 이벤트 핸들러를 파싱하십시오.
- \`prototype.html\`에서 동작하는 페이지 라우트, 상세 정보 드로어, 상태 토글, 토스트 알림을 임의로 생략하거나 변형하지 말고, 충실하게 React 19 컴포넌트로 1:1 변환해야 합니다.
`;

  // --------------------------------------------------------------------------
  // 11. docs/11_system-instructions.md
  // --------------------------------------------------------------------------
  const systemInstructionsMd = `# 🍠 [SYSTEM INSTRUCTION] - ${projectName} 바이브 코딩 프롬프트 (11_system-instructions.md)

당신은 '${projectName}' 프로젝트를 구현하는 수석 소프트웨어 엔지니어이자 도메인 아키텍트입니다.
사용자는 소프트웨어 도메인 지식이 풍부하지만 전문 코딩 문법에 익숙하지 않은 현업 전문가입니다.

## 📌 절대 준수 규칙 (CRITICAL)
1. **프로토타입 시각 기준 (Prototype as Visual Ground Truth)**:
   - 본 프로젝트에는 이미 브라우저에서 동작 검증을 마친 \`prototype.html\`이 포함되어 있습니다.
   - 에이전트는 환각이나 자의적 상상으로 화면을 꾸미지 말고, \`prototype.html\`에 정의된 화면 구조, 탭 내비게이션, 상태 배지, 모달 입력 폼의 UX를 그대로 React 컴포넌트로 1:1 충실하게 구현하십시오.
2. **문서 기반 개발 (Spec-Driven)**: 
   - \`docs/01_proposal.md\`부터 \`docs/10_agent.md\`까지의 사양서 11종을 불변의 진리로 삼으십시오.
   - 사양서에 명시되지 않은 기능을 임의로 추가하거나 아키텍처를 뒤흔들지 마십시오.
3. **기술 스택 통제**:
   - React 19 + TypeScript + Tailwind CSS를 사용하며, 외부 서드파티 라이브러리(Redux, Query, Axios 등)를 임의 설치하지 마십시오.
   - 브라우저 로컬 스토리지(\`IndexedDB\`) 기반의 Local-First 아키텍처를 준수하십시오.
4. **디자인 규약 준수**:
   - \`docs/03_DESIGN.md\`에 정의된 Warm Paper 테마(#F8F4EB)와 밑줄형 인풋 스타일을 적용하십시오.
5. **결과물 제공 방식**:
   - 코드를 제공할 때는 파일 경로와 완전한 코드를 작성하십시오.

지금 \`docs/04_SPEC.md\`와 \`docs/06_DATA_SCHEMA.md\`를 검토하고, 첫 번째 화면 구현 계획을 제시하십시오.
`;

  // --------------------------------------------------------------------------
  // 12. .cursorrules & .clinerules
  // --------------------------------------------------------------------------
  const cursorrules = `# Cursor Rules for ${projectName}
# Derived from GOGUMA Architecture Constitution (v2.0)

- Use prototype.html as the primary visual & structural ground truth for screen components and flows.
- Always read docs/ folder before modifying code (specifically 03_DESIGN.md, 04_SPEC.md, 05_ARCH_CONSTITUTION.md, 06_DATA_SCHEMA.md).
- Do NOT install unapproved heavy third-party npm packages (e.g. Redux, Axios, Lodash).
- Strictly adhere to the Warm Paper design system (#F8F4EB, underline inputs, no generic rounded pills).
- Maintain Local-First architecture using IndexedDB; do not send private data to external cloud servers.
- Keep components modular, clean, and strictly typed in TypeScript.
`;

  const clinerules = cursorrules;

  // --------------------------------------------------------------------------
  // 13. prototype.html
  // --------------------------------------------------------------------------
  const prototypeHtml = compileStandalonePrototypeHtml(plan);

  return {
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
    prototypeHtml,
  };
}

/**
 * Returns a list of all 11 docs with metadata for UI tabs, viewers, and exports.
 */
export function getMarkdownDocsList(bundle: GogumaMarkdownBundle): MarkdownDocInfo[] {
  return [
    {
      id: '01_proposal',
      docNumber: 1,
      filename: '01_proposal.md',
      relativePath: 'docs/01_proposal.md',
      title: '사업/기획 제안서',
      engTitle: 'Proposal',
      description: '어떤 서비스를 왜 만드는지 일상어 배경 및 사용자 정의',
      content: bundle.proposalMd,
    },
    {
      id: '02_roadmap',
      docNumber: 2,
      filename: '02_roadmap.md',
      relativePath: 'docs/02_roadmap.md',
      title: '단계별 로드맵',
      engTitle: 'Roadmap & Happy Path',
      description: '사용자 성공 여정 및 점진적 마일스톤',
      content: bundle.roadmapMd,
    },
    {
      id: '03_DESIGN',
      docNumber: 3,
      filename: '03_DESIGN.md',
      relativePath: 'docs/03_DESIGN.md',
      title: '디자인 헌법',
      engTitle: 'Design System',
      description: '도화지 질감, 웜 페이퍼 색상, 타이포그래피 규약',
      content: bundle.designMd,
    },
    {
      id: '04_SPEC',
      docNumber: 4,
      filename: '04_SPEC.md',
      relativePath: 'docs/04_SPEC.md',
      title: '전체 기능 사양서',
      engTitle: 'System Spec',
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
      description: '기술 스택 불변 규칙 및 에이전트 엄격 금지 조항',
      content: bundle.archConstitutionMd,
    },
    {
      id: '06_DATA_SCHEMA',
      docNumber: 6,
      filename: '06_DATA_SCHEMA.md',
      relativePath: 'docs/06_DATA_SCHEMA.md',
      title: '장부 데이터 스키마',
      engTitle: 'Data Schema & TS',
      description: '엑셀 장부 열 명세 및 TypeScript 인터페이스',
      content: bundle.dataSchemaMd,
    },
    {
      id: '07_SECURITY',
      docNumber: 7,
      filename: '07_SECURITY.md',
      relativePath: 'docs/07_SECURITY.md',
      title: '데이터 주권 및 보안',
      engTitle: 'Security & Sovereignty',
      description: '로컬 데이터 주권, 오프라인 원칙 및 무유출 정책',
      content: bundle.securityMd,
    },
    {
      id: '08_TEST_CHECKLIST',
      docNumber: 8,
      filename: '08_TEST_CHECKLIST.md',
      relativePath: 'docs/08_TEST_CHECKLIST.md',
      title: '인수 검수 체크리스트',
      engTitle: 'UAT Test Checklist',
      description: '브라우저에서 직접 클릭하며 검증하는 완료 정의',
      content: bundle.testChecklistMd,
    },
    {
      id: '09_ENV_SETUP',
      docNumber: 9,
      filename: '09_ENV_SETUP.md',
      relativePath: 'docs/09_ENV_SETUP.md',
      title: '환경 설정 가이드',
      engTitle: 'Environment Setup',
      description: '프로토타입 실행법 및 Vite 로컬 구동 가이드',
      content: bundle.envSetupMd,
    },
    {
      id: '10_agent',
      docNumber: 10,
      filename: '10_agent.md',
      relativePath: 'docs/10_agent.md',
      title: '에이전트 역할 정의',
      engTitle: 'Agent Persona',
      description: '바이브 코딩 에이전트의 책임과 작업 수칙',
      content: bundle.agentMd,
    },
    {
      id: '11_system-instructions',
      docNumber: 11,
      filename: '11_system-instructions.md',
      relativePath: 'docs/11_system-instructions.md',
      title: '시스템 프롬프트',
      engTitle: 'System Instructions',
      description: 'Cursor/Claude Code에 바로 넣는 초기 시작 프롬프트',
      content: bundle.systemInstructionsMd,
    },
  ];
}

function translateColumnToProp(columnName: string): string {
  const c = columnName.trim().toLowerCase();
  if (c.includes('고객') || c.includes('이름') || c.includes('성명')) return 'customerName';
  if (c.includes('연락처') || c.includes('전화') || c.includes('핸드폰')) return 'phone';
  if (c.includes('일시') || c.includes('일정') || c.includes('시간') || c.includes('예약')) return 'scheduledAt';
  if (c.includes('품종') || c.includes('종') || c.includes('반려')) return 'breedOrCategory';
  if (c.includes('과목') || c.includes('수업') || c.includes('강좌')) return 'subject';
  if (c.includes('금액') || c.includes('비용') || c.includes('수강료') || c.includes('매출')) return 'amount';
  if (c.includes('특이') || c.includes('메모') || c.includes('비고')) return 'notes';
  if (c.includes('주소') || c.includes('위치')) return 'address';
  if (c.includes('상태')) return 'status';
  return 'itemProperty';
}
