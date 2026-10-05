# 🍠 GOGUMA SYSTEM SPECIFICATION (SPEC.md)

> **문서 버전**: v1.1.0
> **아키텍처 철학**: Local-First, Zero-Server, Tiered-AI Gateway, Classic Book Workspace, Instant Prototype Generation
> **시스템 목적**: 도메인 전문가의 일상어 입력을 기반으로 토큰 최적화된 에이전트 전용 사양서 묶음(청사진)과 즉시 실행 가능한 인터랙티브 프로토타입 코드를 동시 산출하는 브라우저 기반 스캐폴더

---

## 1. 시스템 개요 및 사용자 여정 (User Journey)

1. **무설치·무인증 진입 (Zero-Barrier Arrival)**
* 회원가입, 로그인, 클라우드 API 키 설정 없이 브라우저 접속 즉시 웜 아이보리 도화지 캔버스로 진입한다.


2. **도메인 언어 중심 기록 (Chapter 01 ~ 08)**
* 와이드 4단 가로 확장 뷰에서 각 서브 메뉴당 1~2개의 핵심 질문에만 집중하여 일상어로 답변을 작성한다.
* 막히는 영역은 각주 형태의 '고구마 가이드'를 확인하거나, 모범 설계 사례 칩을 클릭해 밑줄형 인풋에 즉시 삽입한다.

3. **지능형 가이드 보조 (WebLLM / Local AI)**
* 가이드 정교화 요청 시 브라우저 내장 초경량 모델(약 300MB)이 2~3초 내 캐싱되어 외부 통신 없이 로컬 GPU로 문장 다듬기 및 키워드 추출을 수행한다.

4. **결정론적 2중 산출 파이프라인 (Dual Compilation Engine)**
* 입력된 데이터는 클라이언트 내부 규칙 엔진을 통해 표준 사양서 패키지(11종)와 즉시 구동 가능한 단일 파일 프로토타입 코드(`prototype.html`)로 실시간 동시 컴파일된다.

5. **실시간 프리뷰 및 원클릭 배포 패키징 (Preview & Export)**
* 우측 미리보기 창에서 인터랙티브 동작 화면과 마크다운 명세를 탭으로 즉시 교차 검증한다.
* ZIP 압축 번들 다운로드로 AI 코딩 에이전트(Cursor, Claude Code, Cline 등)의 프로젝트 루트에 즉각 주입한다.

---

## 2. 인터랙티브 프로토타입 생성 엔진 사양 (Prototype Generator Spec)

### 2.1. 독립 실행형 단일 파일 프로토타입 (`prototype.html`)

* **기술 스택**: 순수 HTML5 + Tailwind CSS (Play CDN) + Vanilla JavaScript (UMD React/Babel 의존성 배제).
* **동작 환경**:
* 별도의 빌드 단계(`npm install`, 번들러) 없이 어떤 브라우저에서든 파일을 더블클릭하는 것만으로 완벽 구동.
* 고구마 앱 우측 미리보기 창 내부에서는 격리된 `iframe sandbox="allow-scripts allow-forms"` 환경을 통해 0ms 지연으로 실시간 렌더링.

* **프로토타입 구현 수준**:
* **UI 컴포넌트 렌더링**: 기획된 네비게이션, 대시보드 그리드, 입력 폼, 모달, 리스트 뷰 자동 렌더링.
* **클라이언트 로컬 인터랙션**: `localStorage` 기반의 임시 메모리 저장소 연동으로 데이터 추가, 항목 삭제, 탭 전환, 필터링 등 실제 동작(CRUD 목업) 지원.
* **현실적인 도메인 목데이터 삽입**: `DATA_SCHEMA.md`에 정의된 엔티티 구조를 준수하는 가상 데이터 3~5건 기본 내장.

### 2.2. 생성 아키텍처 및 무결성 보장

* **결정론적 템플릿 컴파일러 우선**:
* 초소형 LLM의 문법 오류나 코드 파손을 방지하기 위해, 화면 구조와 스크립트는 `deterministicArchitect.ts` 내의 검증된 단일 파일 컴포넌트 템플릿을 조합해 100% 문법 에러 없이 합성한다.

* **AI의 역할 격리**:
* 로컬 AI 모델(WebLLM / Ollama)은 프로토타입 전체 코드를 짜는 것이 아니라, 폼에 들어갈 맞춤형 목데이터 생성과 도메인별 한글 플레이스홀더 문구 정제에만 한정 개입한다.

---

## 3. 3계층 점진적 AI 게이트웨이 사양 (Tiered AI Architecture)

```
[ Tier 1: Zero-Setup In-Browser ] ➔ WebLLM (WebGPU)
  - 용도: 첫 방문자 체험, 가이드 문맥 1줄 교정, 도메인 키워드 및 목데이터 추출
  - 모델: Qwen2.5-0.5B-Instruct-q4f16_1 또는 SmolLM2-360M (~300MB)
  - 저장: CacheStorage 영구 오프라인 캐싱 (최초 1회만 다운로드)

[ Tier 2: Power Local Daemon ] ➔ Ollama (Local Daemon)
  - 엔드포인트: http://127.0.0.1:11434
  - 용도: 복합 스키마 역추론, 심층 벤치마크 분석, 로컬 오프라인 사양서 풀 컴파일
  - 권장 모델: qwen2.5-coder:7b, gemma2:9b, llama3.2:3b 자동 헬스체크 및 감지

[ Tier 3: Cloud Scale BYOK ] ➔ Gemini API (Optional)
  - 엔드포인트: Google Generative Language API
  - 용도: 대규모 웹 컨텍스트 분석 및 고성능 추론 (사용자가 API Key를 입력하고 활성화한 경우에만 제한 호출)

```

* **무중단 폴백 (Graceful Degradation)**:
* WebGPU 미지원 브라우저이거나 Ollama 데몬이 꺼져 있는 경우, 에러 중단 없이 클라이언트 정적 템플릿 컴파일러(`proposalCompiler.ts`)로 즉시 대체된다.


---

## 4. 데이터 스토리지 및 로컬 영속성 사양 (Storage Spec)

* **스토리지 엔진**: 브라우저 표준 `IndexedDB` (idb 트랜잭션 래퍼 적용).
* **핵심 엔티티 구조**:
1. `ProjectRecord`: `id` (UUID), `name`, `createdAt`, `updatedAt`, `activeChapter`, `activeSection`
2. `FormStore`: 챕터/섹션별 작성 원문 텍스트 맵
3. `CompiledArtifacts`:
* 사양서 마크다운 11종 문자열
* `prototypeHtml`: 단일 파일 프로토타입 HTML 문자열
* `schemaTypes`: TypeScript 인터페이스 정의 코드


4. `AppSettings`: 테마 설정, WebLLM 캐시 상태, Ollama 엔드포인트 포트, API 키(Web Crypto 암호화 보관)


* **저장소 보존 및 라이프사이클**:
* **디바운스 쓰기**: 타이핑 종료 후 `400ms` 유휴 시 백그라운드 비동기 원자적(Atomic) 커밋.
* **책갈피 인장 피드백**: 저장 성공 시 우측 상단에 얇은 활자형 인장(`[ 🔖 16:40 저장됨 ]`) 1초 점등 후 페이드아웃.
* **지속성 권한 요청**: `navigator.storage.persist()`를 자동 호출하여 브라우저의 임의 캐시 청소 방지.

---

## 5. 산출물 패키징 및 내보내기 사양 (Export Spec)

사용자가 '내보내기'를 트리거할 때, 클라이언트 단에서 `JSZip`을 통해 아래 구조의 ZIP 아카이브를 즉시 생성 및 브라우저 다운로드 처리한다:

```text
goguma-blueprint-[project-slug].zip
├── prototype.html                ★ 더블클릭 시 즉시 브라우저에서 실행되는 인터랙티브 프로토타입
├── .cursorrules                  (Cursor 에이전트용 불변 행동 지침)
├── .clinerules                   (Cline/Roo-Code 에이전트 지침)
└── docs/
    ├── 01_proposal.md            (사업/기획 제안서)
    ├── 02_roadmap.md             (단계별 마일스톤 로드맵)
    ├── 03_DESIGN.md              (디자인 헌법 및 타이포그래피 규약)
    ├── 04_SPEC.md                (시스템 전체 구현 사양서)
    ├── 05_ARCH_CONSTITUTION.md   (기술 스택 및 패키지 설치 불변 규칙)
    ├── 06_DATA_SCHEMA.md         (데이터 모델 및 TS 인터페이스)
    ├── 07_SECURITY.md            (보안 규약 및 데이터 주권 정책)
    ├── 08_TEST_CHECKLIST.md      (완료 정의 및 검증 체크리스트)
    ├── 09_ENV_SETUP.md           (환경 설정 및 문제 해결 가이드)
    ├── 10_agent.md               (에이전트 역할 정의)
    └── 11_system-instructions.md (에이전트 시스템 프롬프트)

```

---

## 6. UI/UX 및 인터랙션 반응성 SLA (Performance SLA)

* **와이드 4단 가로 확장 레이아웃**:
* `[대분류 챕터]` (200px) ➔ `[소분류 섹션]` (240px) ➔ `[중앙 도화지 캔버스]` (유동 폭, 최소 640px) ➔ `[미리보기 패널]` (420px ~ 520px).
* 편집 캔버스 집중 시 `Esc` 키 또는 화면 축소에 반응하여 1·2열이 52px 미니멀 아이콘 바로 접히는 반응형 폴딩 지원.


* **속도 및 레이턴시 기준**:
* 챕터/섹션 간 화면 전환 지연시간: **50ms 미만**.
* 인풋 타이핑 반응 지연: **16ms(60fps) 이내 유지**.
* 실시간 프로토타입 재컴파일: 타이핑 디바운스 **300ms 이후 100ms 이내 iframe 리로드 없는 부분 갱신**.


* **키보드 단축키 맵**:
* `Tab` / `Shift+Tab`: 입력 필드 및 가이드 칩 간 순차 이동.
* `Cmd/Ctrl + Enter`: 현재 섹션 저장 후 다음 단계로 매끄럽게 전진.
* `Cmd/Ctrl + E`: 사양서 및 `prototype.html` 번들 즉시 다운로드.
* `Cmd/Ctrl + P`: 우측 미리보기 창의 [사양서] ↔ [프로토타입] 탭 토글.



---