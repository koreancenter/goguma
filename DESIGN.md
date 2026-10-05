# GOGUMA Design Constitution: Ink Black (Sumi Ink) Studio Edition

> **버전:** 2.0.0  
> **적용 대상:** GOGUMA 웹 애플리케이션 (기획서·PRD 집필 스튜디오 및 우측 실시간 모바일 인터랙티브 프리뷰)  
> **핵심 철학:** 먹물을 머금은 딥 네이비 언더톤의 잉크 블랙 도화지, 만년필 금촉 느낌의 샴페인 브라스 주조색, 과도한 라운드를 배제한 마이크로 라디우스(Micro-Radius) 기반의 정밀한 에디토리얼 테크 스튜디오.

---

## 1. 디자인 철학 및 기본 원칙

1. **먹빛 도화지 (Sumi Ink Canvas)**
   * 눈이 시린 번들거리는 OLED 완전 흑색(`#000000`)이나 흔한 푸른색 다크모드를 배제합니다.
   * 전통 먹색과 딥 네이비의 경계에 있는 잉크 블랙(`#0B0C10`, `#0E1217`)을 기본 지면으로 사용하여, 장시간 텍스트 집필과 기획 구조 검토 시에도 눈의 피로를 최소화합니다.

2. **단일 테마 일관성 (Single Dark-Mode Lock)**
   * 라이트/다크 모드 스위칭으로 인한 CSS 및 컴포넌트 코드 복잡도를 완전히 제거하고, 완성도 높은 단일 잉크 블랙 테마로 고정합니다.

3. **마이크로 라디우스 & 샤프 그리드 (Micro-Radius & Sharp Grid)**
   * 캐주얼해 보이는 대형 곡률(`rounded-xl`, `rounded-2xl`)을 일절 배제합니다.
   * 패널, 버튼, 입력 박스, 조항 카드 등 모든 UI 컨테이너는 직각(`rounded-none`) 또는 라이카 기계 모서리 수준의 마이크로 라디우스(`rounded-[2px]` ~ `rounded-[4px]`)로만 처리합니다. (단, 우측 모바일 폰 목업 기기 프레임만 하드웨어 외형을 살려 둥글게 유지)

4. **면 분할 대신 반투명 헤어라인 경계 (Hairline Separation)**
   * 박스 안에 또 박스를 넣는 답답한 '카드 인 카드' 형태를 지양합니다.
   * 불투명한 회색 면 대신 `rgba(255, 255, 255, 0.06)` 수준의 1px 정밀 라인과 여백(Padding)의 위계로 콘텐츠 영역을 단정하게 구획합니다.

---

## 2. 디자인 토큰 및 컬러 시스템

### 2.1 Base Surfaces & Canvas (지면 및 패널 레이어)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Canvas Base** | `--goguma-bg-base: #0B0C10` | 중앙 원고지 및 메인 집필 스튜디오 도화지 캔버스 |
| **Panel Surface** | `--goguma-bg-panel: #0E1217` | 좌측 챕터 네비게이션, 상단 앱 바, 도구 패널 |
| **Surface Pure / Card** | `--goguma-bg-card: #13181F` | 원고 입력 박스, 활성 카드, 모바일 프리뷰 내부 지면 |
| **Surface Subtle / Hover** | `--goguma-bg-subtle: #18202A` | 버튼 호버, 칩 배경, 선택된 인덱스 배경 |

### 2.2 Brand & Accents (브랜드 및 포인트)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Brand Ink Brass (주조색)** | `--goguma-brand-brass: #D4AF37` / `#C5A880` | GOGUMA 로고 포인트, 메인 CTA 버튼, 원고 강조 라인 (만년필 금촉 느낌) |
| **Brand Wine Accent** | `--goguma-brand-wine: #7A224D` | 고구마 오리지널 아이덴티티 계승용 서브 액센트 |
| **System Emerald** | `--goguma-accent-emerald: #34D399` | 실시간 자동 보존 인디케이터 점, 저장 완료 상태 피드백 |
| **Editorial Slate** | `--goguma-accent-slate: #60A5FA` | 기획서 챕터/조항 넘버링(`CHAPTER 05 § 01`), 경로 칩 |

### 2.3 Borders & Hairlines (경계선)

| 토큰명 | CSS 변수 / RGBA | 용도 및 설명 |
| :--- | :--- | :--- |
| **Hairline Subtle** | `--goguma-border-subtle: rgba(255, 255, 255, 0.07)` | 패널 간 분할선, 챕터 리스트 구분선, 내부 그리드 선 |
| **Hairline Strong** | `--goguma-border-strong: rgba(255, 255, 255, 0.14)` | 입력 폼 외곽선, 버튼 테두리, 카드 분할 바 |
| **Accent Line** | `--goguma-border-accent: #C5A880` | 활성 조항의 좌측 인디케이터 라인 |

### 2.4 Typography & Foreground (텍스트)

| 토큰명 | CSS 변수 / HEX | 용도 및 설명 |
| :--- | :--- | :--- |
| **Text Primary** | `--goguma-text-primary: #F0F3F6` | 메인 헤드라인, 작성 본문, 모바일 프리뷰 핵심 금액 (순백 대신 부드러운 오프화이트) |
| **Text Secondary** | `--goguma-text-secondary: #9AA5B5` | 서브 설명, 라벨, 목차 제목 |
| **Text Muted** | `--goguma-text-muted: #5C6675` | 글자 수 카운터, 비활성 챕터 영문 표기, 플레이스홀더 |
| **Text on Accent** | `--goguma-text-inverse: #0B0C10` | 샴페인 브라스 CTA 버튼 내부 텍스트 |

---

## 3. 타이포그래피 및 레이아웃 위계

1. **타이포그래피 규칙:**
   * **헤드라인:** `Pretendard` Bold / Extra Bold, `tracking-tight`. 먹빛 배경과 대비를 위해 `#F0F3F6` 적용.
   * **코드 및 번호 라벨:** `JetBrains Mono` 또는 시스템 모노스페이스 (`font-mono`, `text-[11px]`, `tracking-wider`).
   * **숫자 표기 (모바일 프리뷰 견적/금액):** `font-variant-numeric: tabular-nums`를 필수 지정하여 자릿수 흔들림 방지.

2. **3단 스튜디오 구조 분할:**
   * **좌측 챕터 사이드바 (Chapters):** 폭 `250px`, 배경 `#0E1217`, 우측 경계 `border-r border-white/7`.
   * **중앙 집필 캔버스 (Canvas):** `flex-1`, 배경 `#0B0C10`, 넉넉한 여백(`p-10`), 스크롤 시에도 집중도를 유지하는 단일 문서 뷰.
   * **우측 실시간 모바일 프리뷰 (Device):** 폭 `420px`, 배경 `#0E1217`, 좌측 경계 `border-l border-white/7`, 중앙에 스마트폰 디바이스 목업 플로팅.

---

## 4. 세부 컴포넌트 스타일링 규격

### 4.1 상단 글로벌 툴바 (Top Bar)
* **컨테이너:** `h-14 bg-[#0E1217] border-b border-white/7 px-4 flex items-center justify-between`
* **로고 영역:**
  * 텍스트: `font-bold text-lg tracking-tight text-[#F0F3F6]`
  * 버전 뱃지: `font-mono text-[10px] text-[#C5A880] bg-[#18202A] px-1.5 py-0.5 rounded-[2px] border border-white/10`
* **글로벌 액션 버튼:**
  * 메인 CTA (`11종 ZIP 내보내기`): `bg-[#C5A880] text-[#0B0C10] hover:bg-[#D4AF37] font-semibold text-xs px-3.5 py-1.5 rounded-[2px] transition-colors`
  * 유틸리티 버튼 (`프로젝트`, `백업함` 등): `bg-[#13181F] border border-white/10 text-[#9AA5B5] hover:text-[#F0F3F6] text-xs px-2.5 py-1.5 rounded-[2px]`
* **상태 인디케이터:** 녹색 점(`#34D399`) + 텍스트 `text-xs text-[#34D399] font-medium`

### 4.2 좌측 챕터 인덱스 & 조항 트리 (Chapter Tree)
* **챕터 아이템 (비활성):**
  * `text-[#9AA5B5] hover:bg-[#13181F] hover:text-[#F0F3F6] border-l-2 border-transparent px-3 py-2 text-xs rounded-none transition-all`
* **챕터 아이템 (활성):**
  * `bg-[#13181F] text-[#F0F3F6] font-semibold border-l-2 border-[#C5A880] px-3 py-2 text-xs rounded-none`
* **하위 조항 기록 뱃지:**
  * `bg-[#18202A] border border-white/10 text-[#C5A880] text-[10px] font-mono px-1.5 py-0.5 rounded-[2px]`

### 4.3 중앙 원고지 집필 캔버스 (Writing Surface)
* **브레드크럼 & 서브타이틀:**
  * `CHAPTER 05 § 01`: `font-mono text-xs tracking-wider text-[#60A5FA]`
  * 메인 타이틀: `text-2xl font-bold text-[#F0F3F6] mt-2 mb-4`
* **원고 입력 컨테이너:**
  * 배경: `bg-[#13181F]`
  * 보더: `border border-white/10 focus-within:border-[#C5A880] transition-colors rounded-[3px]`
  * 텍스트 영역: `bg-transparent text-[#F0F3F6] placeholder-[#5C6675] text-sm leading-relaxed p-5 outline-none`
  * 하단 상태 라인: `border-t border-white/5 px-5 py-2.5 text-xs text-[#5C6675] flex justify-between`
* **추천 표현 / 스니펫 카드:**
  * `bg-[#18202A]/60 border border-white/5 hover:border-white/15 p-3.5 rounded-[3px] flex items-center justify-between`
  * "원고에 삽입" 링크: `text-xs font-semibold text-[#C5A880] hover:underline`

### 4.4 우측 실시간 모바일 프리뷰 (Interactive Device)
* **스마트폰 외곽 프레임:** `bg-[#050608] border-2 border-white/10 rounded-[38px] p-3 shadow-2xl`
* **모바일 화면 베이스:** `bg-[#0B0C10] rounded-[28px] overflow-hidden`
* **모바일 상단 탭 (견적 시뮬레이터 / 상담 신청서):**
  * 활성 탭: `text-[#F0F3F6] border-b-2 border-[#C5A880] font-semibold text-xs py-2`
  * 비활성 탭: `text-[#5C6675] text-xs py-2`
* **옵션 체크박스 리스트:**
  * 둥근 거대 박스를 제거하고 직각/마이크로 라운드 박스로 구성
  * 컨테이너: `bg-[#13181F] border border-white/7 rounded-[3px] p-3.5 mb-2 hover:border-white/15`
  * 체크박스: 활성 시 `bg-[#C5A880] border-[#C5A880] text-[#0B0C10] rounded-[2px]`
  * 금액 표기: `font-mono font-bold text-sm text-[#F0F3F6]`

---

## 5. Tailwind CSS 설정 스니펫 (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          base: '#0B0C10',        // 중앙 캔버스 먹빛 도화지
          panel: '#0E1217',       // 사이드바, 상단 바 패널
          card: '#13181F',        // 입력창, 모바일 내부 카드
          subtle: '#18202A',      // 호버 상태, 칩 배경
        },
        brass: {
          DEFAULT: '#C5A880',     // 샴페인 브라스 (주조 액센트)
          hover: '#D4AF37',
          light: '#E2CEB4',
        },
        text: {
          primary: '#F0F3F6',     // 메인 텍스트
          secondary: '#9AA5B5',   // 보조 텍스트
          muted: '#5C6675',       // 카운터, 플레이스홀더
        },
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        DEFAULT: '3px',
        md: '4px',
        device: '38px',           // 모바일 폰 프레임 외형 전용
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderColor: {
        'white-subtle': 'rgba(255, 255, 255, 0.07)',
        'white-strong': 'rgba(255, 255, 255, 0.14)',
      },
    },
  },
  plugins: [],
};
```