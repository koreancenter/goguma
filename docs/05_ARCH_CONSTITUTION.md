# 🏛️ GOGUMA ARCHITECTURE CONSTITUTION (05_ARCH_CONSTITUTION.md)

> **상태**: 영구 불변 규약 (Immutable Rules)
> 
> 
> **적용 대상**: AI 코딩 에이전트(Cursor, Claude Code, Cline 등) 및 모든 기여 개발자
> 
> 
> **핵심 원칙**: "에이전트는 지정된 기술 스택과 디렉터리 구조를 임의로 변경할 수 없으며, 불필요한 서드파티 라이브러리 추가를 엄격히 금지한다."
> 
> 

---

## 제1조: 공인 기술 스택 (Authorized Tech Stack)

본 프로젝트는 초경량, 고속 렌더링, 제로 종속성을 지향하며, 아래 명시된 기술 이외의 도구 도입을 일절 금지한다.

| 계층 (Layer) | 공인 기술 (Approved) | 절대 금지 (Strictly Forbidden) |
| --- | --- | --- |
| **코어 프레임워크 (본체)** | React (Vite 기반, TypeScript)

 | Next.js, Nuxt, Angular, Gatsby

 |
| **산출물 프로토타입** | **단일 파일 Vanilla JS + HTML5 + Tailwind Play CDN** (무빌드 실행)

 | React UMD, Babel 인브라우저 번들러, 별도 npm 빌드 환경 요구

 |
| **스타일링** | Tailwind CSS (순수 유틸리티 클래스)

 | CSS-in-JS (styled-components, Emotion), Sass, 무거운 UI 킷 (MUI, AntD, Chakra)

 |
| **로컬 스토리지** | 브라우저 표준 `IndexedDB` (idb/Dexie 래퍼)

 | 로컬 파일 임의 I/O, 무거운 브라우저 SQLite WASM

 |
| **AI 연동 계층** | 1. WebLLM (WebGPU, ~300MB 경량 모델)<br>

<br>2. Ollama (`localhost:11434`, 도메인 `goguma.app` 연동)<br>

<br>3. Gemini API (BYOK)

 | LangChain, LlamaIndex 등 무거운 프레임워크 래퍼 남용

 |
| **배포 인프라** | Cloudflare Pages + D1 / KV (서버리스)

 | AWS EC2/ECS, 컨테이너 오케스트레이션, 상시 가동 Node.js VM

 |
| **압축/파일 I/O** | `JSZip`, 표준 `Blob` API

 | 네이티브 바이너리 바이패스, 외부 파일 변환 유료 SaaS API

 |

---

## 제2조: 패키지 설치 불변 규칙 (Package Installation Ban)

1. **임의 `npm install` 절대 금지**:
AI 에이전트는 코드 작성 중 새로운 라이브러리가 필요하더라도 사용자의 명시적 허가 없이 `package.json`을 수정하거나 새 패키지를 설치할 수 없다.


2. **Vanilla JS 구현 우선주의**:
간단한 애니메이션, 모달 열림/닫힘, 드롭다운, 포커스 트래핑, 날짜 포맷팅 등은 서드파티 라이브러리를 설치하지 않고 **순수 JavaScript/TypeScript 헬퍼 함수로 직접 작성**한다.


3. **아이콘 번들 최적화**:
수천 개 아이콘이 통째로 번들링되는 것을 방지하기 위해, 지정된 경량 아이콘 세트(`lucide-react` 중 선별된 단색 라인 아이콘) 외의 추가 그래픽 패키지 설치를 금지한다.



---

## 제3조: 표준 디렉터리 아키텍처 (Directory Topology)

모든 소스 코드는 아래의 디렉터리 구조 규칙을 엄격히 준수해야 하며, 루트에 임의의 폴더를 생성할 수 없다.

```text
src/
├── assets/             # 정적 폰트(Noto Serif KR), 미세 종이 텍스처 SVG
├── components/         # 순수 UI 뷰 컴포넌트
│   ├── classic/        # 4단 클래식 북 레이아웃, 챕터 내비게이션, 밑줄형 폼
│   ├── preview/        # 단일 파일 프로토타입 iframe 샌드박스, 사양서 뷰어
│   └── guide/          # 고구마 가이드(각주 스타일 패널, 원클릭 칩)
├── contexts/           # 전역 상태 (ProjectContext, EditorContext)
├── hooks/              # 커스텀 훅 (useAutoSave, useWebLlm, useOllama)
├── lib/                # 순수 비즈니스 로직 & 컴파일러 (외부 무의존)
│   ├── deterministicArchitect.ts  # 규칙 기반 사양서 초안 합성기
│   ├── prototypeCompiler.ts       # 단일 파일 prototype.html 코드 합성 엔진
│   ├── schemaExtractor.ts         # 도메인 일상어 -> D1/TS 스키마 변환기
│   ├── localDb.ts                 # IndexedDB 트랜잭션 래퍼
│   └── projectFileIO.ts           # .goguma 및 11종 ZIP 번들러
├── services/           # AI 통신 서비스 (webLlmService, ollamaService, geminiService)
├── types/              # TypeScript 인터페이스 (DATA_SCHEMA 연동)
└── App.tsx             # 4단 가로 확장 메인 마운트

```

---

## 제4조: 데이터 흐름 및 로컬 우선 헌법 (Local-First Data Pipeline)

1. **단방향 불변 데이터 흐름 (Unidirectional Data Flow)**:
```
[사용자 입력] ➔ [메모리 상태 (React Context)] ➔ [400ms 디바운스]
     │
     ├─➔ [IndexedDB 로컬 커밋] (영속성 확보)
     │
     └─➔ [결정론적 컴파일러 트리거] ➔ [iframe 프로토타입 & 마크다운 실시간 갱신]

```


2. **비동기 격리 (Worker Isolation)**:
사용자가 텍스트를 타이핑하는 동안 메인 스레드가 멈추지 않도록, 11종 사양서 컴파일 및 대량의 HTML 합성은 메인 UI 렌더링 사이클과 분리하거나 디바운스를 거쳐 유휴 시간(`requestIdleCallback`)에 처리한다.


3. **Zero-Server 원칙**:
사용자가 명시적으로 내보내기(Export) 버튼을 누르기 전까지, 데이터는 브라우저 밖으로 단 1바이트도 유출되지 않는다.



---

## 제5조: 프로토타입 생성 격리 규정 (Prototype Isolation Rules)

1. **단일 파일 무빌드 원칙**:
컴파일러(`prototypeCompiler.ts`)가 생성하는 산출물 `prototype.html`은 웹서버나 `npm` 없이 로컬 디스크에서 더블클릭만으로 동작하는 순수 HTML5 + Tailwind Play CDN + Vanilla JS 구조를 유지해야 한다.


2. **고구마 본체와의 격리 (Sandbox Rule)**:
`App.tsx`의 우측 미리보기 창에서 프로토타입을 띄울 때는 반드시 `sandbox="allow-scripts allow-forms"`가 선언된 `iframe`을 사용하며, 메인 앱의 로컬 스토리지에 접근하는 `allow-same-origin` 속성을 부여할 수 없다.



---

## 제6조: 에이전트 코딩 행동 수칙 (Rules of Engagement)

AI 코딩 에이전트는 본 프로젝트의 코드를 리팩토링하거나 신규 기능을 구현할 때 다음 수칙을 반드시 준수해야 한다:

1. **기존 파일 임의 삭제 금지**: 리팩토링 시 기존 파일(`src/lib/*` 등)을 임의로 지우거나 이름을 변경하지 말고 내부 함수 단위로 개선한다.


2. **i18n Key 누출 방지**: 화면에 `benchmark_url_desc` 같은 번역 키가 날것으로 노출되는 코드를 작성하지 않으며, 항상 읽기 쉬운 한국어 텍스트 기본값(Fallback)을 함께 정의한다.


3. **타입 안전성 준수**: 모든 데이터 구조에는 `any` 타입 사용을 금지하며, `src/types/`에 명시된 인터페이스를 엄격히 사용한다.


4. **CSS 인라인 스타일링 금지**: 스타일링은 반드시 `DESIGN.md`에 정의된 Tailwind 클래스만을 사용하며, 동적 계산이 불가피한 좌표/너비값 외에 `style={{ ... }}` 속성을 남발하지 않는다.



---