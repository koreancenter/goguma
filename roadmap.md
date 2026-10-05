# 🍠 GOGUMA 리팩토링 로드맵 (Refactoring Roadmap)

> **목적**: 도메인 지식은 있으나 코딩을 모르는 비전문가가 바이브 코딩(Cursor, Claude Code, Windsurf 등)을 성공적으로 수행할 수 있도록 기획을 안내하고, 최종적으로 11종의 마크다운 사양서(`docs/01~11.md`) 및 실행 가능한 프로토타입(`prototype.html`), 에이전트 행동 규칙(`.cursorrules`, `.clinerules`) 패키지를 완벽히 생성·배포합니다.

---

## 📌 작업 체크리스트

### [x] 0. 초기 결함 분석 및 의존성 설치
- [x] 미사용 데드코드(12개 구형 컴포넌트/파일) 정리 및 안정성 검증
- [x] URL 슬러그(Slug) 생성 엔진 일원화 (`src/lib/utils.ts` ↔ `src/lib/slugify.ts`)
- [x] `jszip` 및 `@types/jszip` 패키지 설치 완료

---

### [x] 1. 11종 마크다운 & 에이전트 규칙 번들 컴파일러 구현
- [x] `src/lib/markdownBundleCompiler.ts` 모듈 생성
- [x] 8개 챕터 기획 데이터(`formInputs`, `SitePlan`)를 기반으로 11종 마크다운 개별 생성 로직 구현:
  - `docs/01_proposal.md` (사업/기획 제안서)
  - `docs/02_roadmap.md` (마일스톤 로드맵 & Happy Path)
  - `docs/03_DESIGN.md` (디자인 헌법 & 웜 페이퍼 색상/타이포)
  - `docs/04_SPEC.md` (전체 화면 IA & 상세 기능 명세)
  - `docs/05_ARCH_CONSTITUTION.md` (기술 스택 & npm 라이브러리 추가 금지 불변 규칙)
  - `docs/06_DATA_SCHEMA.md` (장부 데이터 스키마 & TypeScript 인터페이스)
  - `docs/07_SECURITY.md` (로컬 데이터 주권 & 오프라인 보안 규약)
  - `docs/08_TEST_CHECKLIST.md` (사용자 인수 검수 UAT 체크리스트)
  - `docs/09_ENV_SETUP.md` (개발 환경 세팅 & 문제 해결 가이드)
  - `docs/10_agent.md` (바이브 코딩 에이전트 역할 정의)
  - `docs/11_system-instructions.md` (에이전트 시스템 프롬프트)
- [x] 에이전트 불변 행동 규칙 파일 생성 로직 추가:
  - `.cursorrules` (Cursor AI 불변 행동 지침)
  - `.clinerules` (Cline/Roo-Code 행동 지침)
- [x] 단일 파일 즉시 실행 프로토타입(`prototype.html`) 번들 연결

---

### [x] 2. 클라이언트 ZIP 패키징 & 원클릭 다운로더 구현
- [x] `src/lib/bundleZipDownloader.ts` 모듈 생성 (`jszip` 연동)
- [x] 폴더 계층 구조화:
  ```text
  goguma-blueprint-[project-slug].zip
  ├── prototype.html                ★ 브라우저 더블클릭 즉시 실행 프로토타입
  ├── .cursorrules                  (Cursor 에이전트 규칙)
  ├── .clinerules                   (Cline 에이전트 규칙)
  └── docs/
      ├── 01_proposal.md
      ├── 02_roadmap.md
      ├── 03_DESIGN.md
      ├── 04_SPEC.md
      ├── 05_ARCH_CONSTITUTION.md
      ├── 06_DATA_SCHEMA.md
      ├── 07_SECURITY.md
      ├── 08_TEST_CHECKLIST.md
      ├── 09_ENV_SETUP.md
      ├── 10_agent.md
      └── 11_system-instructions.md
  ```
- [x] 순수 브라우저 인메모리 ZIP 생성 및 다운로드 함수 (`downloadBlueprintZip`) 구현

---

### [x] 3. 우측 미리보기 패널(SpecPreviewPanel) 11종 사양서 실시간 열람 개편
- [x] [프로토타입] | [11종 사양서] | [사이트맵] 탭 구조 개편 및 배지(11) 표기
- [x] 11종 사양서 + .cursorrules 셀렉터 드롭다운 및 `<` `>` 이전/다음 탐색 버튼 구현
- [x] 개별 문서별 원클릭 클립보드 복사 (`handleCopyCurrentDoc`) 기능 탑재
- [x] 입력 시 0ms 실시간 사양서 번들 재컴파일 반영
- [x] 우측 패널 하단 및 툴바에 [📦 11종 ZIP 다운로드] 원클릭 버튼 배치
- [x] 단축키 `Cmd/Ctrl + E` 연동 (11종 사양서 번들 ZIP 즉시 다운로드)

---

### [x] 4. Chapter 8 '바이브 코딩 허브' 화면 고도화
- [x] 11종 사양서 생성 완성도 검수 카드 UI (11/11 통과 배지 및 핵심 메트릭 4종 그리드)
- [x] "비개발자를 위한 바이브 코딩 3분 시작법" 3단계 가이드 카드 (ZIP 받기 ➔ 압축 풀기 ➔ 첫 프롬프트 입력)
- [x] Cursor / Claude Code에 즉시 붙여넣을 수 있는 "첫 지시 프롬프트" 원클릭 복사
- [x] Chapter 8 메인 캔버스 내 [📦 11종 사양서 번들 (.zip) 다운로드] 대표 버튼 탑재
- [x] 11종 사양서 전체를 탭으로 넘겨가며 읽고 개별 복사할 수 있는 인라인 뷰어 탑재
- [x] Paper 모드에서도 Chapter 8 진입 시 배포 허브 바로가기 안내 배너 연동

---

### [x] 5. 상단 헤더 및 내보내기 모달 연동
- [x] 상단 워크스페이스 헤더의 [11종 ZIP 내보내기] 버튼 연동 (클릭 즉시 `goguma-blueprint.zip` 다운로드)
- [x] `ProjectImportExportModal.tsx` 내보내기 탭에 [📦 11종 사양서 번들 (.zip)] 1순위 대표 액션 카드 전면 노출
- [x] 원본 백업 데이터(.goguma.json) 다운로드 및 복사 기능과의 명확한 위계 분리
- [x] `App.tsx` 모달 컴포넌트에 `formInputs` 온전한 전달로 11종 실시간 최신성 100% 보장

---

## 🎉 리팩토링 및 11종 사양서 번들 패키징 구현 완료
- **초기 결함 분석 및 의존성 설치**: 완료 (데드코드 정리, slug 엔진 일원화, JSZip 설치)
- **11종 마크다운 번들러 & 규칙 파일**: 완료 (`docs/01~11.md`, `.cursorrules`, `.clinerules`, `prototype.html`)
- **브라우저 인메모리 ZIP 패키징**: 완료 (`goguma-blueprint-[slug].zip`)
- **우측 실시간 미리보기 패널**: 완료 (11종 문서 스위처, 개별 복사, 실시간 0ms 반영)
- **Chapter 8 바이브 코딩 허브**: 완료 (11/11 검수 배지, 3분 시작법, 첫 지시 프롬프트 복사)
- **글로벌 헤더 및 모달 연동**: 완료 (헤더 버튼, 모달 1순위 카드, `Cmd+E` 단축키)

---

# 🚀 Phase 2: 단일 통합 캔버스(Unified Canvas) & 3대 핵심 아키텍처 고도화

### [x] 1. 캔버스 상단 모드 스위처 제거 및 일체형 레이아웃 구성
- [x] `WritingCanvas.tsx`에서 `[도화지 필기] | [상세폼]` 분절형 탭 제거
- [x] 상단 일상어 질문 + 밑줄형 필기 + 가이드 칩과 하단 인터랙티브 위젯이 공존하는 단일 스크롤 캔버스 구조 전환
- [x] 챕터별 맞춤형 인터랙티브 위젯 렌더러 인터페이스 (`renderChapterInteractiveWidget`) 정립
- [x] Chapter 8 진입 시 산출물 검수 & 바이브 코딩 허브 전면 배치 완비

### [x] 2. Chapter 5 [디자인 시스템 & 비주얼 테마] 통합 위젯 탑재
- [x] 4종 시그니처 테마 프리셋 카드 탑재 (Classic Warm Paper, Editorial Slate, Sage Minimal, Warm Wood Modern)
- [x] 헤딩 서체(양장본 명조 vs 모던 고딕), 인풋 스타일(하단 밑줄형 vs 라운드 박스), 화면 레이아웃 선택기
- [x] 실시간 테마 스와치 및 대시보드 컴포넌트 라이브 프리뷰 연동
- [x] 클릭 시 `plan.design` 구조체 및 자연어 필기란(`brand_mood`, `ui_tone`) 100% 양방향 동기화
- [x] `docs/03_DESIGN.md` 및 `prototype.html`의 CSS 변수/색상 0ms 즉시 반영 완비

### [x] 3. Chapter 6 [내비게이션 아키텍처 & IA] 통합 위젯 탑재
- [x] 화면(페이지/모달/서랍) 태그 카드 빌더 탑재 (명칭, 슬러그, 역할 요약 추가·수정·삭제)
- [x] 화면 유형(Page vs Modal vs Drawer) 칩 선택기 및 추천 화면 원클릭 추가 지원
- [x] 3대 내비게이션 인터랙션 패턴 선택기 (모달 팝업 입력, 사이드바 서랍, 상단 탭)
- [x] 실시간 화면 이동 동선(Navigation Flow Diagram) 시각화 뱃지 연동
- [x] `plan.navigation.pageStructure`, 우측 [사이트맵] 패널 및 `docs/04_SPEC.md` 0ms 자동 동기화

### [x] 4. Chapter 3 [기능 매핑 & Happy Path] 통합 위젯 탑재
- [x] 3대 필수 핵심 기능 ↔ 대상 화면(Page/Modal) 매핑 인터랙티브 테이블 탑재
- [x] 장부 상태 순환 수명주기(State Machine: 대기 ➔ 확정 ➔ 완료 ➔ 취소) 3종 템플릿 선택기
- [x] 사용자 성공 여정(Happy Path 4단계) 인라인 스텝 빌더
- [x] 기능 또는 여정 편집 시 `formInputs`('3_key_features', '3_happy_path') 및 `docs/02_roadmap.md`, `docs/04_SPEC.md` 0ms 자동 동기화 완비

### [x] 5. 11종 사양서 번들러 및 실시간 프로토타입 동기화 검증
- [x] 통합 캔버스에서 테마·화면·기능 변경 시 11종 마크다운 사양서 번들과 `prototype.html` 0ms 실시간 반영 최종 검증
- [x] 상단 헤더 [11종 ZIP 내보내기] 및 Chapter 8 바이브 코딩 허브와의 100% 무결성 동작 확인
- [x] TypeScript 정적 검사 및 Vite 프로덕션 빌드 통과 (`Build succeeded`)

---

## 🏆 고구마 v2.0 통합 단일 캔버스 & 3대 핵심 아키텍처 완성
- **단일 캔버스 통합**: [도화지 필기]와 [상세폼] 분절 제거, 상단 일상어 원고 + 하단 인터랙티브 패널 일체화
- **디자인 시스템 & 테마**: 4종 웜 페이퍼 시그니처 프리셋, 서체/인풋 스타일, 실시간 컬러 스와치
- **내비게이션 아키텍처 (IA)**: 화면/모달 카드 빌더, 화면 유형 칩, 내비게이션 플로우 다이어그램
- **기능 매핑 & Happy Path**: 3대 기능 ↔ 화면 매핑 테이블, 장부 상태 머신, 사용자 성공 여정 스텝 빌더
- **완벽한 바이브 코딩 연동**: 조작 즉시 `docs/01~11.md`, `.cursorrules`, `prototype.html` 반영 및 원클릭 ZIP 다운로드

---

# 👓 Phase 3: 50대 이상 현업 전문가를 위한 시원한 고가독성 UI/UX 개편

### [x] 1. 캔버스 폰트 크기 및 명도 대비 전면 업그레이드
- [x] 10~11px 초소형 폰트 전면 퇴출 (최소 13~14px `text-sm` 이상으로 격상)
- [x] 본문, 챕터 질문 및 입력창 폰트를 시원하게 확대 (`text-lg ~ text-xl`, `leading-relaxed` / `leading-loose`)
- [x] 흐릿한 저대비 회색(`text-[#938A82]`, `#5E5752`)을 또렷한 딥 차콜 먹색(`text-[#2D2825]`, `#374151`, `#111827`)으로 고대비 보정 (WCAG AAA 준수)
- [x] 입력창 밑줄 두께 강화 (2px ➔ 3px `border-b-[3px]` 또렷한 웜 테두리, 포커스 시 선명한 와인 `#6B1D42`)
- [x] 인터랙티브 위젯 3종(테마 프리셋, 내비게이션 IA, 기능 매핑) 전면 폰트/명도 대비 동기화 완료

### [x] 2. 버튼·가이드 칩·인터랙티브 위젯 터치 타깃 확대 (48px Ergonomics)
- [x] 가이드 칩(`+ 칩`) 폰트(14px `text-sm`) 및 패딩(`px-5 py-3`, `min-h-[46px]`) 시원하게 확대
- [x] 하단 이전/다음 액션 버튼 최소 높이 50px~52px 확보 및 폰트 16px(`text-base`) 적용
- [x] 좌측 챕터 내비게이션(`ChapterNavBar`, `min-h-[50px]`) 및 섹션 바(`SectionListBar`, `min-h-[52px]`) 터치 타깃 확대
- [x] 우측 11종 프리뷰 패널(`SpecPreviewPanel`) 탭/문서 스위처/액션 버튼 터치 타깃 40~44px+ 및 폰트 가독성 증대
- [x] 상단 워크스페이스 헤더 버튼(프로젝트, 백업함, ZIP 내보내기, 프로필) 터치 높이 42px+ 확대
- [x] 바이브 코딩 배포 허브(`PromptExtractionHub`) 50px 고배율 다운로드 버튼 및 46px 가이드 버튼 일체화
- [x] 인터랙티브 위젯(테마 프리셋, 화면 카드, 기능 매핑) 카드 내부 여백 및 폰트 가독성 증대

### [x] 3. 캔버스 공간감 확대 및 [👓 편안한 큰 글씨 모드] 지원
- [x] 중앙 작성 캔버스 너비 확장 (`max-w-4xl` ➔ 기본 `max-w-5xl` / 미리보기 접힘 시 와이드 `max-w-6xl` 확장)
- [x] 상단 헤더에 [👓 편안한 큰 글씨 모드] 원클릭 토글 탑재 (전체 폰트 120% 스케일업, 로컬 스토리지 영구 보존)
- [x] 우측 11종 프리뷰 패널 접기/펼치기 원터치 토글 탑재 (58px 인체공학적 접힘 레일 및 와이드 캔버스 전환)
- [x] 큰 글씨 모드 활성화 시 캔버스 헤딩, 질문, 입력창(24px), 가이드 칩(52px+), 마크다운 뷰어 폰트 일체 스케일업 완료

---

## 🎉 Phase 3 50대 이상 현업 전문가를 위한 시원한 고가독성 UI/UX 개편 완수
- **눈이 편안한 고대비 타이포그래피**: 10~11px 퇴출, 14~24px 시원한 글씨, WCAG AAA 먹색 텍스트
- **손이 편안한 48px+ 터치 타깃**: 모든 버튼, 가이드 칩, 내비게이션 탭, 위젯 카드 인체공학적 조작성 확보
- **마음이 편안한 공간감**: 원클릭 [👓 큰 글씨 모드] 및 [🖥️ 미리보기 접기]를 통한 광활한 6XL 와이드 캔버스 지원
