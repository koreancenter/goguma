# 📊 GOGUMA DATA SCHEMA SPECIFICATION (06_DATA_SCHEMA.md)

> **목적**: 고구마(Goguma) 앱 내부의 로컬 영속성 스토리지(IndexedDB) 스키마 정의 및 사용자가 기획하는 앱의 데이터 모델 추출 표준 규약
> **설계 원칙**:
> 1. **엑셀 장부 매핑 (Spreadsheet Mental Model)**: 모든 테이블은 비개발자가 직관적으로 이해할 수 있는 단일 엑셀 시트 형태로 환원 가능해야 한다.
> 2. **타입 안전성 (Strict TypeScript)**: `any` 타입을 배제하고 모든 필드에 명확한 타입(`string`, `number`, `boolean`, `ISOString`)을 부여한다.
> 
> 

---

## Part 1: 고구마 앱 내부 데이터 모델 (Internal Local Storage Schema)

고구마 앱이 브라우저 IndexedDB에 프로젝트를 저장하고 복원할 때 사용하는 핵심 엔티티 구조입니다.

### 1. `ProjectEntity` (프로젝트 기본 정보)

* 엑셀로 치면: **"프로젝트 관리 대장"**

```typescript
export interface ProjectEntity {
  id: string;                  // UUIDv4 (예: "goguma-proj-7f8a...")
  name: string;                // 프로젝트명 (예: "우리동네 동물병원 예약장부")
  slug: string;                // URL/파일명 친화적 식별자 (예: "vet-booking-app")
  createdAt: string;           // 생성일시 (ISO 8601)
  updatedAt: string;           // 최종 수정일시 (ISO 8601)
  currentChapter: number;      // 현재 작성 중인 챕터 (1 ~ 8)
  currentSection: string;      // 현재 작성 중인 서브 섹션 키
}

```

### 2. `FormInputEntity` (자연어 기획 원문)

* 엑셀로 치면: **"사용자가 단계별로 적어 내려간 원고지 기록"**

```typescript
export interface FormInputEntity {
  id: string;                  // 복합키: `${projectId}_${chapterId}_${sectionKey}`
  projectId: string;           // 연관 프로젝트 ID
  chapterId: number;           // 챕터 번호 (1: 제안, 2: 대상, 3: 기능, 4: 데이터...)
  sectionKey: string;          // 섹션 식별자 (예: "target_user", "happy_path", "data_columns")
  userRawInput: string;        // 사용자가 타이핑한 일상어 텍스트
  refinedGuideText?: string;   // WebLLM / Ollama 가이드를 통해 1줄 정돈된 텍스트
  lastSavedAt: string;         // 자동 저장 시각
}

```

### 3. `CompiledArtifactEntity` (컴파일된 최종 산출물 캐시)

* 엑셀로 치면: **"최종 인쇄된 마크다운 문서 및 프로토타입 보관함"**

```typescript
export interface CompiledArtifactEntity {
  projectId: string;           // 연관 프로젝트 ID
  proposalMd: string;          // 01_proposal.md 내용
  roadmapMd: string;           // 02_roadmap.md 내용
  designMd: string;            // 03_DESIGN.md 내용
  specMd: string;              // 04_SPEC.md 내용
  archConstitutionMd: string;  // 05_ARCH_CONSTITUTION.md 내용
  dataSchemaMd: string;        // 06_DATA_SCHEMA.md 내용
  securityMd: string;          // 07_SECURITY.md 내용
  testChecklistMd: string;     // 08_TEST_CHECKLIST.md 내용
  envSetupMd: string;          // 09_ENV_SETUP.md 내용
  systemInstructionsMd: string;// 11_system-instructions.md 내용
  prototypeHtml: string;       // 단일 파일로 실행 가능한 prototype.html 소스
  compiledAt: string;          // 최종 컴파일 일시
}

```

---

## Part 2: 타깃 앱을 위한 도메인 데이터 추출 규약 (Domain Target Schema Engine)

도메인 전문가가 챕터 4(데이터 정의)에서 *"고객 이름, 폰 번호, 희망 시간, 반려견 종류, 상담 내용"*처럼 엑셀 열 이름만 적었을 때, 고구마 컴파일러가 이를 자동 변환하는 표준 데이터 인터페이스 규칙입니다.

### 1. 비개발자 입력 ➔ 스키마 자동 변환 규칙

| 도메인 일상어 표기 예시 | 추론 타입 | 필수 여부 (Required) | Cloudflare D1 (SQLite) 매핑 | UI 렌더링 컴포넌트 |
| --- | --- | --- | --- | --- |
| **이름, 제목, 상호** | `string` | 기본 필수 (`NOT NULL`) | `TEXT NOT NULL` | 1줄 밑줄형 인풋 (`type="text"`) |
| **전화번호, 이메일** | `string` | 기본 필수 | `TEXT` | 전용 포맷 인풋 (`tel`, `email`) |
| **일시, 예약일, 등록일** | `string (ISO)` | 자동 생성 | `TEXT DEFAULT CURRENT_TIMESTAMP` | 날짜/시간 선택기 |
| **금액, 수량, 나이** | `number` | 선택 (`NULL` 허용) | `INTEGER` 또는 `REAL` | 숫자 전용 밑줄형 인풋 |
| **승인 여부, 완료 상태** | `boolean` 또는 `enum` | 기본값 존재 | `INTEGER DEFAULT 0` (0/1) | 상태 칩 토글 또는 체크박스 |
| **상세 내용, 요청사항** | `string` | 선택 | `TEXT` | 여러 줄 텍스트에어리어 |

### 2. 타깃 앱 표준 스키마 템플릿 (생성 예시)

도메인 입력 데이터를 기반으로 `prototype.html` 내부의 `localStorage` 및 향후 Cloudflare D1에 그대로 주입될 공통 인터페이스입니다.

```typescript
// [도메인 핵심 레코드 인터페이스]
export interface TargetAppItem {
  id: string;                  // 항목 고유 ID (crypto.randomUUID())
  createdAt: string;           // 등록 시점 타임스탬프
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED'; // 상태 기본값
  
  // 사용자가 정의한 도메인 필드들이 여기에 1:1 자동 주입됨
  title: string;               // 예: 고객명 / 환자명
  contact: string;             // 예: 연락처
  scheduledAt: string;         // 예: 희망 일시
  memo?: string;               // 예: 특이사항 (선택)
}

// [로컬 CRUD 스토리지 어댑터 규약]
export interface LocalStoreAdapter {
  getItems: () => TargetAppItem[];
  addItem: (item: Omit<TargetAppItem, 'id' | 'createdAt'>) => TargetAppItem;
  updateStatus: (id: string, status: TargetAppItem['status']) => void;
  deleteItem: (id: string) => void;
}

```

---
