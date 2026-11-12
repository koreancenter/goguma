# GOGUMA Design Constitution: Sumi Black & Luxury Sapphire Blue Edition

> **버전:** 3.0.0  
> **적용 대상:** GOGUMA 웹 애플리케이션 (기획서·PRD 집필 스튜디오 및 우측 실시간 모바일 인터랙티브 프리뷰)  
> **핵심 철학:** 깊은 먹빛을 머금은 수미 블랙(Sumi Black, #0B0C10 / #0E1217) 도화지, 부드럽고 따스한 웜 화이트(Warm White, #F0F3F6 / #F5F3ED) 본문, 그리고 오렌지/초록을 배제하고 최고급 테크 플랫폼의 정밀함을 상징하는 럭셔리 블루(Luxury Sapphire & Azure, #2563EB / #38BDF8 / #60A5FA) 주조색 체계.

---

## 1. 디자인 철학 및 기본 원칙

1. **먹빛 도화지 (Sumi Black Canvas)**
   * 눈이 시린 번들거리는 OLED 완전 흑색(`#000000`)이나 가벼운 회색을 배제합니다.
   * 전통 먹빛과 딥 네이비의 깊이를 품은 잉크 블랙(`#0B0C10`, `#0E1217`, `#13181F`)을 지면으로 사용하여, 장시간 텍스트 집필과 기획 구조 검토 시에도 눈의 피로를 최소화합니다.

2. **웜 화이트 가독성 타이포그래피 (Warm White Text)**
   * 순백의 차가운 백색 대신 한지와 고급 피그먼트 인쇄의 따스한 웜 화이트(`#F0F3F6`, `#F5F3ED`, `#9AA5B5`)를 적용하여 시인성과 가독성을 극대화합니다.
   * 영문·숫자는 `Plus Jakarta Sans`, 한글 본문은 `Pretendard Variable`, 코드와 지표는 `JetBrains Mono (tabular-nums)`를 결합합니다.

3. **럭셔리 블루 단일 악센트 체계 (Luxury Blue & Azure Hierarchy)**
   * 이전의 오렌지, 앰버, 초록 등 잡다한 다색상 장식을 전면 배제합니다.
   * 정밀 엔지니어링과 신뢰감을 상징하는 럭셔리 블루 체계로 일원화합니다:
     - **Sapphire Blue (`#2563EB` / `#1D4ED8`)**: 메인 CTA 버튼, 주요 앵커 액션.
     - **Electric Azure (`#38BDF8`)**: 활성 탭 인디케이터 라인, 보존 완료 상태 점, 챕터 강조 뱃지.
     - **Ice Slate (`#60A5FA`)**: 코드 라벨, 서브 헤더 넘버링(`CHAPTER 05 § 01`), 하이라이트 텍스트.
     - **Midnight Azure Glass (`#101726` / `rgba(56, 189, 248, 0.08)`)**: 뱃지 배경 및 선택된 카드 틴트.

4. **마이크로 라디우스 & 샤프 그리드 (Micro-Radius & Sharp Grid)**
   * 캐주얼해 보이는 대형 곡률(`rounded-xl`, `rounded-2xl`)을 일절 배제합니다.
   * 패널, 버튼, 입력 박스, 조항 카드 등 모든 UI 컨테이너는 직각(`rounded-none`) 또는 마이크로 라디우스(`rounded-[2px]` ~ `rounded-[4px]`)로만 처리합니다.

5. **면 분할 대신 반투명 헤어라인 경계 (Hairline Separation)**
   * 답답한 '카드 인 카드' 형태를 지양하고, `rgba(255, 255, 255, 0.07)` ~ `rgba(56, 189, 248, 0.15)` 수준의 1px 정밀 헤어라인과 여백(Padding)으로 콘텐츠 영역을 단정하게 구획합니다.

---

## 2. 디자인 토큰 및 컬러 시스템

### 2.1 Base Surfaces & Canvas (지면 및 패널 레이어)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Canvas Base** | `--goguma-bg-base: #0B0C10` | 중앙 원고지 및 메인 집필 스튜디오 도화지 캔버스 |
| **Panel Surface** | `--goguma-bg-panel: #0E1217` | 좌측 챕터 내비게이션, 상단 앱 바, 도구 패널 |
| **Surface Pure / Card** | `--goguma-bg-card: #13181F` | 원고 입력 박스, 활성 카드, 모바일/데스크톱 프리뷰 지면 |
| **Surface Subtle / Hover** | `--goguma-bg-subtle: #18202A` | 버튼 호버, 칩 배경, 선택된 인덱스 배경 |

### 2.2 Brand & Luxury Blue Accents (브랜드 및 럭셔리 블루)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Luxury Sapphire (주조색)** | `--goguma-brand-sapphire: #2563EB` | 메인 CTA 액션 버튼(`번들 다운로드`), 로고 뱃지, 핵심 저장 |
| **Electric Azure (포인트)** | `--goguma-brand-azure: #38BDF8` | 실시간 자동 보존 인디케이터 점, 활성 탭 밑줄, 초점 하이라이트 |
| **Editorial Ice Slate** | `--goguma-accent-slate: #60A5FA` | 기획서 챕터/조항 넘버링(`CHAPTER 05 § 01`), 경로 칩 |
| **Azure Surface Tint** | `--goguma-tint-azure: rgba(56, 189, 248, 0.08)` | 활성 필터 칩 배경, 안내 배너 표면 |

### 2.3 Borders & Hairlines (경계선)

| 토큰명 | CSS 변수 / RGBA | 용도 및 설명 |
| :--- | :--- | :--- |
| **Hairline Subtle** | `--goguma-border-subtle: rgba(255, 255, 255, 0.07)` | 패널 간 분할선, 챕터 리스트 구분선, 내부 그리드 선 |
| **Hairline Strong** | `--goguma-border-strong: rgba(255, 255, 255, 0.14)` | 입력 폼 외곽선, 버튼 테두리, 카드 분할 바 |
| **Accent Line** | `--goguma-border-accent: #38BDF8` | 활성 조항의 좌측/하단 인디케이터 라인 |

### 2.4 Typography & Foreground (텍스트)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Text Primary (Warm White)** | `--goguma-text-primary: #F0F3F6` | 메인 헤드라인, 작성 본문, 프리뷰 핵심 텍스트 |
| **Text Secondary (Muted)** | `--goguma-text-secondary: #9AA5B5` | 서브 설명, 라벨, 목차 제목 |
| **Text Subtle** | `--goguma-text-muted: #5C6675` | 글자 수 카운터, 비활성 챕터 영문 표기, 플레이스홀더 |
| **Text on Sapphire** | `--goguma-text-inverse: #FFFFFF` | 사파이어 블루 CTA 버튼 내부 텍스트 |

---

## 3. 타이포그래피 및 레이아웃 위계

1. **타이포그래피 규칙:**
   * **헤드라인:** `Plus Jakarta Sans`, `Pretendard Variable`, Bold / Extra Bold, `tracking-tight`. 먹빛 배경과 대비를 위해 `#F0F3F6` 적용.
   * **코드 및 번호 라벨:** `JetBrains Mono` 또는 시스템 모노스페이스 (`font-mono`, `text-[11px]`, `tracking-wider`, `text-[#38BDF8]`).
   * **숫자 표기 (모바일 프리뷰 견적/금액):** `font-variant-numeric: tabular-nums`를 필수 지정하여 자릿수 흔들림 방지.

2. **3단 스튜디오 구조 분할:**
   * **좌측 챕터 사이드바 (Chapters):** 폭 `58px ~ 250px`, 배경 `#0E1217`, 우측 경계 `border-r border-white/7`.
   * **중앙 집필 캔버스 (Canvas):** `flex-1`, 배경 `#0B0C10`, 넉넉한 여백, 스크롤 시에도 집중도를 유지하는 단일 문서 뷰.
   * **우측 실시간 프리뷰 & 개발자 허브 (Preview & Dev Hub):** 폭 `480px ~ 620px`, 배경 `#0E1217`, 좌측 경계 `border-l border-white/7`.

---

## 4. 세부 컴포넌트 스타일링 규격

### 4.1 상단 글로벌 툴바 (Top Bar)
* **컨테이너:** `h-12 bg-[#0E1217] border-b border-white/7 px-4 flex items-center justify-between`
* **로고 영역:**
  * 텍스트: `font-bold text-sm tracking-tight text-[#F0F3F6]`
  * 로고 뱃지: `bg-[#2563EB] text-white font-black text-xs rounded-[2px]`
* **글로벌 액션 버튼:**
  * 메인 CTA (`번들 다운로드`): `bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-2.5 py-1.5 rounded-[2px] transition-all`
  * 유틸리티 버튼 (`템플릿`, `백업함` 등): `bg-[#13181F] border border-white/10 text-[#9AA5B5] hover:text-[#F0F3F6] text-xs rounded-[2px]`
* **보존 상태 인디케이터:** 
  * 컨테이너: `bg-blue-950/60 border border-blue-500/30 text-[#38BDF8]`
  * 점: `#38BDF8` (`animate-pulse`)

### 4.2 좌측 챕터 인덱스 & 조항 트리 (Chapter Tree)
* **챕터 아이템 (비활성):**
  * `text-[#9AA5B5] hover:bg-[#13181F] hover:text-[#F0F3F6] border-l-2 border-transparent px-3 py-2 text-xs rounded-none transition-all`
* **챕터 아이템 (활성):**
  * `bg-[#13181F] text-[#F0F3F6] font-semibold border-l-2 border-[#38BDF8] px-3 py-2 text-xs rounded-none`
* **하위 조항 기록 뱃지:**
  * `bg-[#101726] border border-blue-500/20 text-[#38BDF8] text-[10px] font-mono px-1.5 py-0.5 rounded-[2px]`

### 4.3 중앙 원고지 집필 캔버스 (Writing Surface)
* **브레드크럼 & 서브타이틀:**
  * `CHAPTER 05 § 01`: `font-mono text-xs tracking-wider text-[#60A5FA]`
  * 메인 타이틀: `text-2xl font-bold text-[#F0F3F6] mt-2 mb-4`
* **원고 입력 컨테이너:**
  * 배경: `bg-[#13181F]`
  * 보더: `border border-white/10 focus-within:border-[#38BDF8] transition-colors rounded-[2px]`
  * 텍스트 영역: `bg-transparent text-[#F0F3F6] placeholder-[#5C6675] text-sm leading-relaxed p-5 outline-none`
  * 하단 상태 라인: `border-t border-white/5 px-5 py-2.5 text-xs text-[#5C6675] flex justify-between`
* **추천 표현 / 스니펫 카드:**
  * `bg-[#18202A]/60 border border-white/5 hover:border-white/15 p-3.5 rounded-[2px] flex items-center justify-between`
  * "원고에 삽입" 링크: `text-xs font-semibold text-[#38BDF8] hover:underline`

### 4.4 우측 실시간 프리뷰 & 개발자 허브 (Preview & Dev Hub)
* **상단 탭 바:** 활성 탭 밑줄 `h-[2px] bg-[#38BDF8]`, 뱃지 `bg-[#101726] text-[#38BDF8] border-blue-500/30`
* **데스크톱 브라우저 크롬:** 주소창 `bg-[#0B0C10] border-white/10 text-neutral-300`, 자물쇠 아이콘 `text-[#38BDF8]`
* **개발자 허브:** 
  * 서브탭 활성: `bg-[#2563EB] text-white font-bold`
  * 코드 블록: `bg-[#13181F] border border-white/10 text-[#F0F3F6]`
  * 복사 액션: `border-blue-500/30 text-[#38BDF8] hover:bg-blue-950/40`