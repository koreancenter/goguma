# 🎨 GOGUMA DESIGN CONSTITUTION & STYLE GUIDE (DESIGN.md / 03_DESIGN.md)

> **문서 상태**: 영구 불변 디자인 헌법 (Immutable Design System & Guidelines)  
> **버전**: v2.5 (2026 최신화 - 50대 이상 현업 전문가를 위한 고가독성 & 48px Ergonomics 전면 반영)  
> **미학 철학**: Classic Warm Paper, 4-Column Book Layout, Tactile Editorial Typography, Senior-Friendly Accessibility  
> **핵심 원칙**: "장식적인 AI 슬롭(보라색 네온, 과도한 그라디언트, 중첩 카드)을 철저히 배제하고, 아날로그 양장본 도화지의 따스한 질감과 50대 이상도 안경 없이 편안하게 누르고 읽을 수 있는 시원한 타이포그래피·터치 인체공학을 구현한다."

---

## 1. 50대 이상 최적화 컬러 팔레트 (High-Contrast Paper Palette)

화면 전체는 눈의 피로를 유발하는 차가운 블루라이트 화이트를 배제하고, 천연 미색 양장지 도화지 톤과 **WCAG AAA 등급(명도비 7:1~14:1)**을 충족하는 선명한 딥 차콜 먹색(Ink) 및 고구마 시그니처 와인(Plum/Wine) 악센트 체계를 준수합니다.

### 1.1 배경 및 도화지 토큰
| 토큰명 | 색상 코드 (HEX) | Tailwind 표현식 | 시각적 용도 |
| --- | --- | --- | --- |
| **Canvas Ivory** | `#F8F4EB` | `bg-[#F8F4EB]` | 메인 작업 캔버스 및 뷰포트 기본 배경 (따스한 양장본 도화지) |
| **Paper Surface** | `#FFFFFF` | `bg-white` | 활성 카드, 위젯 컨테이너, 모달 표면 |
| **Paper Tint Soft** | `#FAF7F2` | `bg-[#FAF7F2]` | 탑 헤더, 서브 패널, 보조 카드 배경 |
| **Paper Tint Neutral** | `#EFE9DC` | `bg-[#EFE9DC]` | 가이드 칩, 비활성 버튼 칩, 배지 배경 |
| **Paper Border Solid** | `#D5CCBC` | `border-[#D5CCBC]` | 선명한 도화지 외곽선, 인체공학적 카드 경계선 |
| **Paper Border Subtle** | `#E5DFD3` | `border-[#E5DFD3]` | 패널 디바이더, 챕터 컬럼 구분선 |

### 1.2 고대비 먹색 텍스트 토큰 (WCAG AAA 준수)
*기존 10~11px 초소형 폰트 및 흐릿한 저대비 회색(`#938A82`)은 전면 퇴출되었습니다.*

| 토큰명 | 색상 코드 (HEX) | Tailwind 표현식 | 명도비 | 사용 용도 |
| --- | --- | --- | --- | --- |
| **Ink Primary** | `#111827` | `text-[#111827]` | **14:1+** | 주요 헤딩, 타이틀, 강조 본문, 활성 텍스트 |
| **Ink Warm Body** | `#2D2825` | `text-[#2D2825]` | **12:1** | 질문 본문, 캔버스 안내문, 단행본 단락 |
| **Ink Secondary** | `#374151` | `text-[#374151]` | **9:1** | 서브 라벨, 폼 제목, 버튼 라벨 |
| **Ink Muted Charcoal** | `#4B5563` | `text-[#4B5563]` | **7:1** | 각주, 부가 설명문, 날짜 및 상태 메타데이터 |

### 1.3 시그니처 브랜드 & 악센트 토큰
| 토큰명 | 색상 코드 (HEX) | Tailwind 표현식 | 사용 용도 |
| --- | --- | --- | --- |
| **Goguma Plum** | `#6B1D42` | `bg-[#6B1D42]`, `text-[#6B1D42]` | 주요 액션 버튼(Primary), 포커스 밑줄(3px), 활성 챕터 배지 |
| **Plum Hover** | `#842352` | `hover:bg-[#842352]` | 버튼 호버 시 또렷한 시각적 피드백 |
| **Plum Active/Deep** | `#521633` | `active:bg-[#521633]` | 버튼 클릭 순간 눌림 피드백 |
| **Plum Soft Tint** | `#F7EFF3` | `bg-[#F7EFF3]` | 챕터 배지 배경, 선택된 위젯 카드 틴트 하이라이트 |
| **Emerald Status** | `#10B981` | `bg-emerald-600` | 프로토타입 실행 상태, 검수 완료(11/11), 자동 저장 완료 |

---

## 2. 4종 웜 페이퍼 시그니처 테마 시스템 (Paper Presets)

1인 실무 전문가의 다양한 업종 특성을 포용하기 위해 4가지 전통 출판 테마 프리셋을 제공하며, 조작 즉시 `docs/03_DESIGN.md` 및 `prototype.html`에 실시간 컴파일됩니다:

1. **클래식 한지 / 미색 도화지 (기본)**:
   - 배경: `#F8F4EB` | 악센트: `#6B1D42` (고구마 와인)
   - 타깃: 일반 사무, 동물병원, 1인 예약 장부, 전통 비즈니스
2. **따스한 세이지 (Healing Sage)**:
   - 배경: `#F2F5F0` | 악센트: `#2D5A43` (포레스트 딥 그린)
   - 타깃: 한의원, 심리상담, 요가/필라테스, 친환경 웰니스
3. **클래식 베이지 서재 (Classic Study Beige)**:
   - 배경: `#FAF6EE` | 악센트: `#7C4A2D` (가죽 바인딩 브라운)
   - 타깃: 세무/회계사 장부, 법률 사무소, 부동산 자산 관리
4. **소프트 모던 라벤더 (Soft Modern Lavender)**:
   - 배경: `#F7F4F8` | 악센트: `#5C3A6B` (모던 딥 바이올렛)
   - 타깃: 뷰티/헤어 살롱, 디자인 스튜디오, 부티크 공방

---

## 3. 타이포그래피 시스템 (Typography Hierarchy)

시니어 실무 전문가가 돋보기안경 없이도 편안하게 읽을 수 있도록 **최소 폰트 14px(`text-sm`), 본문 18~20px(`text-lg ~ text-xl`)**을 기본으로 설정합니다:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. 표제 (Display)     : Noto Serif KR, font-serif, text-3xl ~ 5xl font-extrabold │
│ 2. 질문문 (Question)  : font-sans, text-lg ~ 2xl font-medium, leading-relaxed   │
│ 3. 원고지 인풋 (Input) : font-sans, text-lg ~ 2xl leading-loose, 3px Underline    │
│ 4. 가이드 칩 (Chip)   : font-sans, text-sm ~ base font-bold, min-h-[46px]       │
│ 5. 사양서 코드 (Code)  : JetBrains Mono, font-mono, text-xs ~ base, leading-loose │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **표제 및 헤딩 (Display & Headings)**:
  - 서체: `Noto Serif KR`, `Playfair Display`, 명조/세리프 계열
  - 스타일: `font-serif font-extrabold text-[#111827] tracking-tight leading-tight`
- **본문 및 질문문 (Body & Questions)**:
  - 서체: `Pretendard Variable`, `Outfit`, sans-serif 계열
  - 스타일: `font-sans text-lg sm:text-xl text-[#2D2825] leading-relaxed font-medium`
- **사양서 및 데이터 스키마 (Code & Schemas)**:
  - 서체: `JetBrains Mono`, `ui-monospace`
  - 스타일: `font-mono text-xs sm:text-sm text-[#111827] leading-relaxed select-text`
- **금지 규칙**: 10~11px 초소형 각주 폰트 전면 사용 금지 (최소 규격 `text-xs(12px)` 또는 `text-sm(14px)`).

---

## 4. 48px Ergonomics (터치 인체공학 규격)

50대 이상 사용자의 떨림, 시력 감퇴, 부정확한 터치/클릭을 고려하여 **모든 인터랙티브 요소는 최소 44px~52px 이상의 터치 타깃 영역**을 확보합니다:

1. **원클릭 가이드 칩 (Guide Chips)**:
   - 최소 높이: `min-h-[46px]` (큰 글씨 모드 시 `min-h-[52px]`)
   - 패딩: `px-5 py-3`
   - 타이포그래피: `text-sm sm:text-base font-bold text-[#111827]`
   - 테두리: 선명한 2px 솔리드 보더 `border-2 border-[#D5CCBC]`
2. **주요 액션 버튼 (Navigation & Deploy Buttons)**:
   - 최소 높이: `min-h-[50px] ~ min-h-[54px]`
   - 패딩: `px-6 ~ px-9 py-3.5 ~ py-4`
   - 타이포그래피: `text-base sm:text-lg font-extrabold text-white`
   - 그림자: `shadow-md hover:shadow-lg`
3. **헤더 툴바 버튼 (Workspace Header Tools)**:
   - 최소 높이: `min-h-[42px]`
   - [👓 큰 글씨 모드], [🖥️ 미리보기 접기], [프로젝트], [백업함], [11종 ZIP 내보내기] 모두 통일된 42px+ 높이 및 볼드 텍스트 적용.
4. **인터랙티브 위젯 카드 및 버튼 (Interactive Widgets)**:
   - 화면 추가/저장/수정 버튼: `min-h-[44px ~ 48px]`, 폰트 `font-bold`
   - 추천 화면 칩: `min-h-[44px] px-4 py-2.5`
   - 수정/삭제 액션 아이콘 버튼: 최소 `min-h-[42px] min-w-[42px]`

---

## 5. 밑줄형 아날로그 필기 캔버스 (3px Underline Form)

박스형 인풋의 삭막함을 걷어내고, 친근한 원고지 위에 만년필로 기록하듯 정갈한 밑줄을 제공합니다:

- **밑줄 두께**: 기존 1~2px의 흐릿함을 개선하여 **선명한 3px 두께(`border-b-[3px] border-[#C7BFB1]`)** 적용
- **포커스 반응**: 타이핑 시작 시 고구마 와인 컬러(`focus:border-[#6B1D42]`)로 즉각 반응
- **행간 및 크기**: `text-lg sm:text-xl font-sans leading-loose`, 글자 수 카운터 실시간 연동
- **제로 필(Zero Pill)**: 캡슐형 둥근 인풋 필드를 지양하고 정갈한 도화지 밑줄로 집중도 극대화

---

## 6. 캔버스 공간감 확대 & [👓 편안한 큰 글씨 모드]

장시간 집필에도 답답함이 없도록 캔버스의 폭을 대폭 넓히고 원터치 가독성 모드를 탑재했습니다:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [상단 툴바] 🔖 로컬 보존 | 👓 큰 글씨 모드 ON | 🖥️ 미리보기 접기 | 11종 ZIP 내보내기     │
├─────────────┬─────────────┬────────────────────────────────────────────┬───────────────┤
│ 1열: 챕터   │ 2열: 섹션   │ 3열: 중앙 캔버스 (기본 max-w-5xl)          │ 4열: 실시간   │
│ 내비게이션  │ 목록        │                                            │ 미리보기      │
│ (200/52px)  │ (240/52px)  │ [미리보기 접힘 시: max-w-6xl 와이드 몰입 모드]│ (440/58px)    │
└─────────────┴─────────────┴────────────────────────────────────────────┴───────────────┘
```

1. **캔버스 너비 확장**:
   - 기본 너비: `max-w-5xl` (여유로운 조판)
   - 미리보기 접힘 시: `max-w-6xl` (와이드 몰입 모드)
2. **미리보기 패널 58px 슬림 접힘 레일**:
   - 접었을 때: 58px 슬림 레일에 [프로토타입], [사양서], [사이트맵] 아이콘 및 세로 타이틀 표출
   - 펼쳤을 때: 440px~520px 고해상도 실시간 뷰어 표출
3. **[👓 편안한 큰 글씨 모드] 스위치**:
   - 상단 워크스페이스 헤더에 영구 탑재 (`goguma_large_text_mode`)
   - 활성화 시 **전체 폰트 120% 스케일업**:
     - 제목: `text-4xl ~ text-5xl font-extrabold`
     - 입력창: `text-xl ~ text-2xl` (최대 24px) & `min-h-[220px]` 시원한 행간
     - 가이드 칩: `min-h-[52px] text-base ~ text-lg px-6 py-3.5`
     - 버튼: `min-h-[54px] text-lg ~ text-xl`
     - 마크다운 사양서 뷰어: `text-base ~ text-lg leading-loose`

---

## 7. 안티-AI 슬롭(Anti-Slop) 불변 원칙

1. **사이버펑크 다크 모드 절대 금지**: 억지스러운 딥 블랙(`bg-black`)과 형광 시안(`text-cyan-400`) 사용을 금지하며, 눈이 편안한 웜 페이퍼 톤을 엄격히 고수한다.
2. **보라-파랑 그라디언트 텍스트 금지**: AI 생성물 특유의 `bg-gradient-to-r from-purple-500 to-blue-500 text-transparent bg-clip-text` 클리셰 사용을 배제한다.
3. **중첩 카드(Card-in-Card) 지옥 금지**: 카드 안에 카드를 3~4겹 중첩하는 시각적 피로를 철저히 배제하고, 단일 캔버스 내 정갈한 디바이더와 도화지 여백으로 위계를 나눈다.
4. **WCAG AAA 웹 접근성**: 본문 및 주요 UI의 명도비는 7:1 이상을 엄격히 준수한다.
