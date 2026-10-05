import { SitePlan } from '../types';

/**
 * Defensive HTML entity escape to prevent XSS in standalone prototypes.
 */
function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates a golden, unambiguous "Prototype-as-Spec" prompt for Cursor, Claude Code, Windsurf, etc.
 * Instructs the AI agent to reverse-engineer prototype.html 1:1 into production React 19 code without hallucinations.
 */
export function generatePrototypePrompt(plan: SitePlan): string {
  const projectName = plan.metadata?.projectName || '애플리케이션';
  const platform = plan.metadata?.platform === 'APP' ? '모바일 웹/앱 (Mobile-First)' : '웹 대시보드 (Web-First)';
  const themeColor = plan.design?.themeColor || '#6B1D42';
  const purpose = plan.metadata?.projectOverview?.purpose || '업무 자동화 및 프로세스 최적화';
  const pages = plan.navigation?.pageStructure || [
    { name: '대시보드', route: '/dashboard', purpose: '실시간 현황 모니터링' },
    { name: '목록 관리', route: '/list', purpose: '데이터 검색 및 상태 관리' },
  ];

  return `당신은 [${projectName}]의 수석 프론트엔드 소프트웨어 엔지니어입니다.

루트 디렉터리에 이미 브라우저에서 동작 검증을 마친 [prototype.html] 파일이 있습니다.
자신의 자의적인 상상이나 환각으로 화면을 꾸미지 말고, [prototype.html]의 컴포넌트 구조, 화면 전환(Navigation Flow), 상세 정보 드로어(Detail Drawer), 상태 변경 파이프라인, 모달 입력 폼, 그리고 로컬 데이터 스키마를 React 19 + TypeScript + Tailwind CSS 프로덕션 코드로 1:1 완벽하게 변환해 주십시오.

### 📌 프로덕션 구현 요구사항 (Prototype-as-Spec):
1. **타깃 플랫폼 & 디자인 규약**:
   - 대상 플랫폼: ${platform}
   - 브랜드 색상: ${themeColor} 및 Warm Paper (#F8F4EB, #FAF7F2, #E5DFD3, 먹색 #111827)
   - 모바일 뷰포트 지원 (상단 뒤로가기 및 하단 탭 내비게이션 바 포함)

2. **반드시 1:1 분할 구현할 화면 컴포넌트 (${pages.length}종)**:
${pages.map((p, i) => `   - Screen ${i + 1} [${p.name}] (${p.route || '/'}): ${p.purpose || ''}`).join('\n')}

3. **필수 인터랙션 & 상태 파이프라인**:
   - 카드/테이블 행 클릭 시 오른쪽에서 슬라이드되는 [상세 정보 드로어 (Detail Drawer)]
   - 대기 ➔ 진행중 ➔ 완료 원클릭 상태 전환 파이프라인 및 상단 토스트(Toast) 알림
   - 상단 [+ 신규 등록] 모달 및 실시간 검색/필터링
   - 대시보드 KPI 카드 클릭 시 해당 화면으로 자동 이동 및 필터 적용 (Contextual Jumps)
   - IndexedDB 또는 LocalStorage 기반의 영속성 커스텀 훅 (예: useRecordStore)

4. **패키지 설치 통제 (Zero-Slop Rule)**:
   - 무거운 외부 라이브러리(Redux, Axios, Lodash 등)를 설치하지 말고, 순수 React 19 + Tailwind CSS + Lucide Icons만으로 정갈하게 작성하십시오.

지금 prototype.html과 docs/ 폴더를 정독하고, src/ 구조 설계와 첫 번째 핵심 컴포넌트 코드를 작성해 주십시오.`;
}

/**
 * Advanced Dynamic Screen Synthesis & Rich Virtual Navigation Prototype Compiler.
 * Produces a fully self-contained HTML5 + Vanilla JS + Tailwind Play CDN web app.
 * 
 * Major Features in Version 2.2:
 * 1. Deep In-App Routing & Navigation History (Back button, contextual jumps between screens)
 * 2. Interactive Item Detail Drawer / Sheet (View, edit status, update memo in real time)
 * 3. Mobile Native Bottom Navigation Bar (Thumb-friendly tab bar for mobile view)
 * 4. Animated Toast Notification System (Immediate visual feedback on actions)
 * 5. Slot-to-Booking auto fill (Clicking a timeline slot opens modal pre-filled with time)
 * 6. Shared LocalStorage persistence with sample reset
 */
export function compileStandalonePrototypeHtml(plan: SitePlan): string {
  const projectName = escapeHtml(plan.metadata?.projectName || '고구마 애플리케이션');
  const platform = plan.metadata?.platform === 'APP' ? 'APP' : 'WEB';
  const pages = plan.navigation?.pageStructure && plan.navigation.pageStructure.length > 0
    ? plan.navigation.pageStructure
    : [
        { name: '대시보드', route: '/dashboard', purpose: '실시간 업무 현황 및 주요 지표 모니터링' },
        { name: '업무 목록', route: '/list', purpose: '전체 데이터 검색, 필터링 및 상세 내역 확인' },
        { name: '진행 칸반', route: '/kanban', purpose: '단계별 업무 요청 및 승인 파이프라인' },
        { name: '통계 리포트', route: '/analytics', purpose: '월별 처리 현황 및 목표 달성률' },
      ];
  const themeColor = plan.design?.themeColor || '#6B1D42';
  const purpose = escapeHtml(plan.metadata?.projectOverview?.purpose || '사용자 친화적 업무 프로세스 자동화 및 생산성 향상');
  const target = escapeHtml(plan.metadata?.projectOverview?.target || '현장 실무자 및 의사결정권자');
  const kpi = escapeHtml(plan.metadata?.projectOverview?.kpi || '업무 처리 시간 50% 단축');

  // JSON safe serialized pages with detected screen types and icons
  const safePagesJson = JSON.stringify(pages.map(p => {
    const raw = (p.name + ' ' + (p.route || '') + ' ' + (p.purpose || '')).toLowerCase();
    let type = 'TABLE';
    let icon = '📋';
    if (raw.includes('대시보드') || raw.includes('dashboard') || raw.includes('홈') || raw.includes('home') || raw.includes('메인')) {
      type = 'DASHBOARD';
      icon = '📊';
    } else if (raw.includes('칸반') || raw.includes('kanban') || raw.includes('보드') || raw.includes('board') || raw.includes('승인') || raw.includes('파이프')) {
      type = 'KANBAN';
      icon = '📑';
    } else if (raw.includes('예약') || raw.includes('스케줄') || raw.includes('일정') || raw.includes('타임라인') || raw.includes('booking') || raw.includes('schedule')) {
      type = 'TIMELINE';
      icon = '📅';
    } else if (raw.includes('견적') || raw.includes('계산') || raw.includes('calculator') || raw.includes('단가') || raw.includes('시뮬레이')) {
      type = 'CALCULATOR';
      icon = '💡';
    } else if (raw.includes('통계') || raw.includes('리포트') || raw.includes('분석') || raw.includes('analytics') || raw.includes('차트')) {
      type = 'ANALYTICS';
      icon = '📈';
    } else if (raw.includes('접수') || raw.includes('신규') || raw.includes('신청') || raw.includes('작성') || raw.includes('form') || raw.includes('new')) {
      type = 'FORM';
      icon = '✍️';
    }
    return {
      name: p.name,
      route: p.route || '/',
      purpose: p.purpose || '',
      type,
      icon
    };
  }));

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - 실시간 인터랙티브 프로토타입</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '${themeColor}',
            paper: '#F8F4EB',
            ink: '#231F20'
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", Roboto, sans-serif; }
    .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #D5CCBC; border-radius: 9999px; }
    .modal-backdrop { background: rgba(0, 0, 0, 0.45); backdrop-filter: blur(2px); }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes pulseSync {
      0% { box-shadow: 0 0 0 0 rgba(197, 168, 128, 0.85); }
      45% { box-shadow: 0 0 0 7px rgba(197, 168, 128, 0.4); }
      100% { box-shadow: 0 0 0 0 rgba(197, 168, 128, 0); }
    }
    .goguma-pulse-glow {
      animation: pulseSync 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      border-color: #C5A880 !important;
    }
  </style>
</head>
<body class="bg-[#0B0C10] text-[#F0F3F6] min-h-screen p-2 sm:p-4 flex flex-col items-center justify-start relative">

  <!-- Toast Notification Container -->
  <div id="toastContainer" class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Top Prototype Control Bar (Ink Black Slim Inspector) -->
  <div class="w-full max-w-5xl mb-2 flex items-center justify-between bg-[#0E1217] px-3.5 py-1.5 rounded-[2px] border border-white/7 shadow-2xs">
    <div class="flex items-center gap-2">
      <span class="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse"></span>
      <span class="text-xs font-mono font-semibold text-[#C5A880]">GOGUMA LIVE PROTOTYPE</span>
      <span class="hidden sm:inline text-[11px] text-[#5C6675]">• 인터랙티브 로컬 런타임</span>
    </div>
    
    <div class="flex items-center gap-1.5">
      <!-- Device View Toggle -->
      <button 
        id="toggleDeviceBtn" 
        onclick="toggleDeviceView()" 
        class="text-xs font-medium px-2.5 py-1 rounded-[2px] border border-white/10 bg-[#13181F] hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors flex items-center gap-1 cursor-pointer"
        title="스마트폰 화면과 데스크톱 화면 전환"
      >
        <span id="deviceIcon">📱</span>
        <span id="deviceLabel">${platform === 'APP' ? '데스크톱 뷰' : '스마트폰 뷰'}</span>
      </button>

      <!-- Reset Data -->
      <button 
        onclick="resetSampleData()" 
        class="text-xs font-medium px-2 py-1 rounded-[2px] border border-white/10 bg-[#13181F] hover:bg-red-950/40 text-[#5C6675] hover:text-red-400 transition-colors cursor-pointer"
        title="샘플 데이터 초기화"
      >
        초기화
      </button>
    </div>
  </div>

  <!-- Main Prototype Shell Container -->
  <div 
    id="prototypeContainer" 
    class="w-full ${platform === 'APP' ? 'max-w-[420px] rounded-[38px] border-2 border-white/10 shadow-2xl overflow-hidden' : 'max-w-5xl rounded-[3px] border border-white/10 shadow-xl'} bg-[#0B0C10] flex flex-col transition-all duration-300 min-h-[680px] relative"
  >
    
    <!-- Mobile Status Bar (Visible only in phone frame) -->
    <div id="mobileStatusBar" class="${platform === 'APP' ? 'flex' : 'hidden'} items-center justify-between px-6 pt-3 pb-1 bg-[#0E1217] text-xs font-mono font-semibold text-[#9AA5B5] select-none">
      <span>09:41</span>
      <div class="w-16 h-4 bg-[#050608] border border-white/10 rounded-full mx-auto -mt-1"></div>
      <div class="flex items-center gap-1">
        <span>5G</span>
        <span>100%</span>
      </div>
    </div>

    <!-- App / Web Header with Navigation Controls -->
    <header class="px-4 py-3 bg-[#0E1217] border-b border-white/7 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center gap-2.5">
        <!-- Back Navigation Button -->
        <button 
          id="navBackBtn" 
          onclick="navigateBack()" 
          class="hidden p-1 rounded-[2px] border border-white/10 bg-[#13181F] hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] text-xs transition-all cursor-pointer"
          title="이전 화면으로 돌아가기"
        >
          ← 뒤로
        </button>

        <div class="w-7 h-7 rounded-[2px] flex items-center justify-center text-[#0B0C10] font-bold text-sm bg-[#C5A880] shrink-0">
          ${projectName.charAt(0)}
        </div>
        <div class="min-w-0">
          <h1 class="text-sm sm:text-base font-bold tracking-tight text-[#F0F3F6] leading-tight truncate">${projectName}</h1>
          <p class="text-[10px] text-[#5C6675] truncate max-w-[180px] sm:max-w-xs">${purpose}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <button 
          onclick="openAddModal()" 
          class="px-3 py-1 rounded-[2px] text-xs font-semibold text-[#0B0C10] bg-[#C5A880] hover:bg-[#D4AF37] transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>+</span>
          <span>신규 등록</span>
        </button>
      </div>
    </header>

    <!-- Desktop / Top Navigation Tab Bar -->
    <nav id="topNavTabs" class="bg-[#0E1217] px-4 border-b border-white/7 flex items-center gap-1.5 overflow-x-auto custom-scroll py-2">
      ${pages.map((p, idx) => `
        <button 
          onclick="switchPage(${idx})" 
          id="navTab-${idx}" 
          class="px-3 py-1.5 rounded-[2px] text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            idx === 0 
              ? 'bg-[#18202A] text-[#C5A880] font-semibold border-b-2 border-[#C5A880]' 
              : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-[#13181F]'
          }"
        >
          <span>${escapeHtml(p.name)}</span>
        </button>
      `).join('')}
    </nav>

    <!-- Dynamic Content Area (Target of Screen Synthesis) -->
    <main class="flex-1 p-3 sm:p-4 overflow-y-auto custom-scroll space-y-3 pb-16 sm:pb-4 bg-[#0B0C10]">
      
      <!-- Screen Context Header Card -->
      <div id="screenHeaderCard" class="bg-[#13181F] p-3 rounded-[3px] border border-white/7 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span id="screenRouteBadge" class="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-[2px] bg-[#18202A] text-[#60A5FA] border border-white/5">ROUTE: ${escapeHtml(pages[0].route || '/')}</span>
            <span id="screenTypeBadge" class="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-[2px] bg-[#C5A880]/15 text-[#C5A880]">화면</span>
          </div>
          <h2 id="screenTitle" class="text-xs sm:text-sm font-bold text-[#F0F3F6] mt-1">${escapeHtml(pages[0].name)}</h2>
          <p id="screenDesc" class="text-[11px] text-[#9AA5B5] mt-0.5">${escapeHtml(pages[0].purpose || '')}</p>
        </div>
        <div class="text-right hidden sm:block">
          <span class="text-[10px] text-[#5C6675]">목표 KPI</span>
          <p class="text-xs font-mono font-semibold text-[#C5A880]">${kpi}</p>
        </div>
      </div>

      <!-- Synthesized Dynamic Screen View Slot -->
      <div id="dynamicScreenView" class="space-y-3">
        <!-- Rendered dynamically by switchPage() in JavaScript -->
      </div>

    </main>

    <!-- Mobile Native Bottom Navigation Bar (Active in phone frame) -->
    <div id="mobileBottomNav" class="${platform === 'APP' ? 'flex' : 'hidden'} items-center justify-around bg-[#0B0C10]/95 backdrop-blur-md border-t border-white/7 py-2 px-1 absolute bottom-0 left-0 right-0 z-20">
      ${pages.slice(0, 4).map((p, idx) => `
        <button 
          onclick="switchPage(${idx})" 
          id="bottomTab-${idx}" 
          class="flex flex-col items-center justify-center flex-1 py-1 rounded-[2px] text-[10px] transition-all cursor-pointer ${
            idx === 0 ? 'text-[#C5A880] font-semibold' : 'text-[#5C6675]'
          }"
        >
          <span class="text-sm leading-none mb-0.5">${p.name.includes('대시') ? '📊' : p.name.includes('칸반') ? '📑' : p.name.includes('예약') ? '📅' : p.name.includes('견적') ? '💡' : p.name.includes('통계') ? '📈' : '📋'}</span>
          <span class="truncate max-w-[60px]">${escapeHtml(p.name)}</span>
        </button>
      `).join('')}
    </div>

    <!-- Bottom Footer (Desktop) -->
    <footer class="hidden sm:flex p-2.5 bg-[#0E1217] border-t border-white/7 text-center text-[10px] text-[#5C6675] items-center justify-between">
      <span>${projectName} • Goguma Live Navigation Engine</span>
      <span>타깃: ${target}</span>
    </footer>
  </div>

  <!-- Item Detail Drawer / Sheet (Slide-in) -->
  <div id="detailDrawerBackdrop" onclick="closeDetailDrawer()" class="fixed inset-0 modal-backdrop hidden z-40 transition-opacity"></div>
  <div id="detailDrawer" class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0E1217] border-l border-white/10 shadow-2xl z-50 p-5 flex flex-col justify-between hidden animate-slide-in-right overflow-y-auto custom-scroll text-[#F0F3F6]">
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-white/7 pb-3">
        <div class="flex items-center gap-2">
          <span id="drawerStatusBadge" class="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-semibold bg-[#18202A] text-[#C5A880] border border-white/10">대기</span>
          <span class="text-xs font-mono text-[#9AA5B5]">상세 정보</span>
        </div>
        <button onclick="closeDetailDrawer()" class="text-[#9AA5B5] hover:text-[#F0F3F6] text-lg font-bold cursor-pointer">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-medium text-[#9AA5B5] mb-1">제목 / 품목</label>
          <input id="drawerTitle" type="text" class="w-full p-2.5 rounded-[2px] border border-white/10 bg-[#13181F] text-[#F0F3F6] text-xs focus:outline-none focus:border-[#C5A880]">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">진행 상태 변경</label>
            <select id="drawerStatusSelect" onchange="updateDrawerStatus()" class="w-full p-2 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] font-bold text-xs focus:outline-none">
              <option value="대기">대기</option>
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">일시 / 금액</label>
            <input id="drawerAmount" type="text" class="w-full p-2 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none font-mono">
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">연락처 / 기안자</label>
          <input id="drawerContact" type="text" class="w-full p-2 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none">
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">상세 특이사항 메모</label>
          <textarea id="drawerMemo" rows="4" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none leading-relaxed"></textarea>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t border-[#E5DFD3] flex items-center justify-between">
      <button onclick="deleteDrawerItem()" class="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer">
        삭제하기
      </button>
      <div class="flex items-center gap-2">
        <button onclick="closeDetailDrawer()" class="px-4 py-2 rounded-xl text-xs font-bold text-[#78716C] hover:bg-[#FAF7F2] cursor-pointer">닫기</button>
        <button onclick="saveDrawerChanges()" class="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer" style="background-color: ${themeColor}">
          저장하기
        </button>
      </div>
    </div>
  </div>

  <!-- Add Item Modal Dialog -->
  <div id="addModal" class="fixed inset-0 modal-backdrop hidden z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl border border-[#D5CCBC] shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95">
      <div class="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
        <h3 class="text-base font-bold text-[#1C1917]">신규 항목 등록</h3>
        <button onclick="closeAddModal()" class="text-[#78716C] hover:text-[#1C1917] text-lg font-bold cursor-pointer">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-bold text-[#44403C] mb-1">항목 이름 / 제목 <span class="text-red-500">*</span></label>
          <input id="modalTitle" type="text" placeholder="예: 초코 정기검진 / 마케팅 품의서 / 원두 발주" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-bold text-[#44403C] mb-1">연락처 / 기안자</label>
            <input id="modalContact" type="text" placeholder="010-0000-0000" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
          </div>
          <div>
            <label class="block font-bold text-[#44403C] mb-1">상태</label>
            <select id="modalStatus" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none">
              <option value="대기">대기</option>
              <option value="진행중" selected>진행중</option>
              <option value="완료">완료</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">금액 / 수량 / 일시 (선택)</label>
          <input id="modalAmount" type="text" placeholder="예: 오늘 14:00 또는 50,000원" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
        </div>

        <div>
          <label class="block font-bold text-[#44403C] mb-1">메모 / 특이사항</label>
          <textarea id="modalMemo" rows="3" placeholder="상세 요청사항이나 주의할 점을 적어주세요." class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DFD3]">
        <button onclick="closeAddModal()" class="px-4 py-2 rounded-xl text-xs font-bold text-[#57534E] hover:bg-[#FAF7F2] cursor-pointer">취소</button>
        <button onclick="submitNewItem()" class="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-90 cursor-pointer" style="background-color: ${themeColor}">등록하기</button>
      </div>
    </div>
  </div>

  <script>
    const STORAGE_KEY = 'goguma_live_data_' + '${encodeURIComponent(projectName)}';
    const PAGES = ${safePagesJson};
    let activePageIndex = 0;
    let navHistory = [];
    let currentFilter = 'ALL';
    let isPhoneView = ${platform === 'APP' ? 'true' : 'false'};
    let currentDrawerItemId = null;

    // Initial domain mock records
    const DEFAULT_DATA = [
      { id: 'item-1', title: '초코 (골든리트리버) 정기 예방접종', contact: '010-8765-4321', status: '진행중', amount: '오늘 14:00', memo: '알러지 피부염 주의, 발톱 정리 요청', createdAt: new Date().toISOString() },
      { id: 'item-2', title: '나비 (코숏) 중성화 상담 및 검진', contact: '010-1234-5678', status: '대기', amount: '오늘 15:30', memo: '금식 8시간 유지 확인 완료', createdAt: new Date().toISOString() },
      { id: 'item-3', title: '몽이 (말티즈) 귀 염증 드레싱', contact: '010-9988-7766', status: '완료', amount: '오전 11:00', memo: '항생제 3일분 처방 완료', createdAt: new Date().toISOString() },
      { id: 'item-4', title: '보리 (포메라니안) 심장사상충 검사', contact: '010-3322-1100', status: '대기', amount: '오늘 17:00', memo: '첫 방문, 문진표 작성 필요', createdAt: new Date().toISOString() }
    ];

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto ' + 
        (type === 'success' ? 'bg-[#1C1917] text-white' : type === 'delete' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white');
      toast.innerHTML = (type === 'success' ? '✅ ' : type === 'delete' ? '🗑️ ' : 'ℹ️ ') + message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    function getStore() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
          return DEFAULT_DATA;
        }
        return JSON.parse(raw);
      } catch (e) {
        return DEFAULT_DATA;
      }
    }

    function saveStore(data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      renderActiveScreen();
    }

    function resetSampleData() {
      if (confirm('샘플 데이터를 초기 상태로 리셋하시겠습니까?')) {
        saveStore(DEFAULT_DATA);
        showToast('샘플 데이터가 초기화되었습니다.', 'info');
      }
    }

    function toggleDeviceView() {
      isPhoneView = !isPhoneView;
      const container = document.getElementById('prototypeContainer');
      const statusBar = document.getElementById('mobileStatusBar');
      const bottomNav = document.getElementById('mobileBottomNav');
      const label = document.getElementById('deviceLabel');
      const icon = document.getElementById('deviceIcon');

      if (isPhoneView) {
        container.className = 'w-full max-w-[420px] rounded-[36px] border-[6px] border-[#292524] shadow-2xl overflow-hidden bg-[#FAF7F2] flex flex-col transition-all duration-300 min-h-[680px] relative';
        statusBar.classList.remove('hidden');
        statusBar.classList.add('flex');
        bottomNav.classList.remove('hidden');
        bottomNav.classList.add('flex');
        label.innerText = '데스크톱 뷰로 전환';
        icon.innerText = '🖥️';
      } else {
        container.className = 'w-full max-w-5xl rounded-2xl border-2 border-[#D5CCBC] shadow-lg bg-[#FAF7F2] flex flex-col transition-all duration-300 min-h-[680px] relative';
        statusBar.classList.remove('flex');
        statusBar.classList.add('hidden');
        bottomNav.classList.remove('flex');
        bottomNav.classList.add('hidden');
        label.innerText = '스마트폰 뷰로 전환';
        icon.innerText = '📱';
      }
    }

    // =========================================================================
    // IN-APP ROUTING & NAVIGATION
    // =========================================================================

    function switchPage(idx, addToHistory = true) {
      if (addToHistory && activePageIndex !== idx) {
        navHistory.push(activePageIndex);
      }
      activePageIndex = idx;

      // Update back button state
      const backBtn = document.getElementById('navBackBtn');
      if (backBtn) {
        if (navHistory.length > 0) {
          backBtn.classList.remove('hidden');
        } else {
          backBtn.classList.add('hidden');
        }
      }

      // Update Top Tabs
      PAGES.forEach((_, i) => {
        const tab = document.getElementById('navTab-' + i);
        if (tab) {
          if (i === idx) {
            tab.className = 'px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap bg-white shadow-2xs transition-all cursor-pointer flex items-center gap-1.5';
            tab.style.color = '${themeColor}';
            tab.style.border = '1px solid ${themeColor}30';
          } else {
            tab.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap text-[#57534E] hover:text-[#1C1917] hover:bg-white/60 transition-all cursor-pointer flex items-center gap-1.5';
            tab.style.color = '';
            tab.style.border = '';
          }
        }

        // Update Bottom Nav Tabs
        const bTab = document.getElementById('bottomTab-' + i);
        if (bTab) {
          if (i === idx) {
            bTab.className = 'flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-bold text-[#6B1D42]';
          } else {
            bTab.className = 'flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-bold text-[#78716C]';
          }
        }
      });

      const p = PAGES[idx];
      document.getElementById('screenRouteBadge').innerText = 'ROUTE: ' + (p.route || '/');
      document.getElementById('screenTitle').innerText = p.name;
      document.getElementById('screenDesc').innerText = p.purpose || '';

      const typeLabels = {
        'DASHBOARD': '대시보드 뷰',
        'KANBAN': '칸반 파이프라인 뷰',
        'TABLE': '데이터 테이블 뷰',
        'TIMELINE': '타임라인 스케줄러 뷰',
        'CALCULATOR': '견적 계산기 뷰',
        'ANALYTICS': '통계 분석 뷰',
        'FORM': '접수 입력 폼 뷰'
      };
      document.getElementById('screenTypeBadge').innerText = typeLabels[p.type] || '화면';

      renderActiveScreen();
    }

    function navigateBack() {
      if (navHistory.length > 0) {
        const prevIndex = navHistory.pop();
        switchPage(prevIndex, false);
      }
    }

    // Contextual Jump to Table with Pre-filter
    function navigateToFilter(targetType, filter) {
      currentFilter = filter;
      const targetIdx = PAGES.findIndex(p => p.type === targetType);
      if (targetIdx !== -1) {
        switchPage(targetIdx);
      } else {
        const tableIdx = PAGES.findIndex(p => p.type === 'TABLE');
        if (tableIdx !== -1) switchPage(tableIdx);
      }
    }

    // =========================================================================
    // ITEM DETAIL DRAWER ACTIONS
    // =========================================================================

    function openItemDetail(id) {
      const data = getStore();
      const item = data.find(d => d.id === id);
      if (!item) return;

      currentDrawerItemId = id;
      document.getElementById('drawerTitle').value = item.title || '';
      document.getElementById('drawerStatusSelect').value = item.status || '대기';
      document.getElementById('drawerAmount').value = item.amount || '';
      document.getElementById('drawerContact').value = item.contact || '';
      document.getElementById('drawerMemo').value = item.memo || '';

      const badge = document.getElementById('drawerStatusBadge');
      if (badge) {
        badge.innerText = item.status;
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold ' + 
          (item.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
           item.status === '진행중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800');
      }

      document.getElementById('detailDrawerBackdrop').classList.remove('hidden');
      document.getElementById('detailDrawer').classList.remove('hidden');
    }

    function closeDetailDrawer() {
      document.getElementById('detailDrawerBackdrop').classList.add('hidden');
      document.getElementById('detailDrawer').classList.add('hidden');
      currentDrawerItemId = null;
    }

    function updateDrawerStatus() {
      const newStatus = document.getElementById('drawerStatusSelect').value;
      const badge = document.getElementById('drawerStatusBadge');
      if (badge) {
        badge.innerText = newStatus;
        badge.className = 'px-2 py-0.5 rounded text-[10px] font-bold ' + 
          (newStatus === '완료' ? 'bg-emerald-100 text-emerald-800' :
           newStatus === '진행중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800');
      }
    }

    function saveDrawerChanges() {
      if (!currentDrawerItemId) return;
      const data = getStore();
      const item = data.find(d => d.id === currentDrawerItemId);
      if (!item) return;

      item.title = document.getElementById('drawerTitle').value.trim() || item.title;
      item.status = document.getElementById('drawerStatusSelect').value;
      item.amount = document.getElementById('drawerAmount').value.trim();
      item.contact = document.getElementById('drawerContact').value.trim();
      item.memo = document.getElementById('drawerMemo').value.trim();

      saveStore(data);
      closeDetailDrawer();
      showToast('[' + item.title + '] 항목이 성공적으로 업데이트되었습니다.');
    }

    function deleteDrawerItem() {
      if (!currentDrawerItemId) return;
      if (confirm('이 항목을 영구 삭제하시겠습니까?')) {
        const data = getStore().filter(d => d.id !== currentDrawerItemId);
        saveStore(data);
        closeDetailDrawer();
        showToast('항목이 삭제되었습니다.', 'delete');
      }
    }

    // =========================================================================
    // STATE MODIFICATION ACTIONS
    // =========================================================================

    function toggleItemStatus(id, e) {
      if (e) e.stopPropagation();
      const data = getStore();
      const item = data.find(d => d.id === id);
      if (!item) return;

      const oldStatus = item.status;
      if (item.status === '대기') item.status = '진행중';
      else if (item.status === '진행중') item.status = '완료';
      else item.status = '대기';

      saveStore(data);
      showToast('[' + item.title + '] 상태: ' + oldStatus + ' ➔ ' + item.status);
    }

    function deleteItem(id, e) {
      if (e) e.stopPropagation();
      if (confirm('이 항목을 삭제하시겠습니까?')) {
        const data = getStore().filter(d => d.id !== id);
        saveStore(data);
        showToast('항목이 삭제되었습니다.', 'delete');
      }
    }

    // =========================================================================
    // DYNAMIC SCREEN SYNTHESIS RENDERERS
    // =========================================================================

    function renderActiveScreen() {
      const container = document.getElementById('dynamicScreenView');
      if (!container) return;
      const currentPage = PAGES[activePageIndex] || PAGES[0];
      const data = getStore();

      switch (currentPage.type) {
        case 'DASHBOARD':
          renderDashboardView(container, data);
          break;
        case 'KANBAN':
          renderKanbanView(container, data);
          break;
        case 'TIMELINE':
          renderTimelineView(container, data);
          break;
        case 'CALCULATOR':
          renderCalculatorView(container, data);
          break;
        case 'ANALYTICS':
          renderAnalyticsView(container, data);
          break;
        case 'FORM':
          renderFormView(container, data);
          break;
        case 'TABLE':
        default:
          renderTableView(container, data);
          break;
      }
    }

    // 1. DASHBOARD VIEW SYNTHESIS (With Contextual Routing Jumps)
    function renderDashboardView(container, data) {
      const total = data.length;
      const pending = data.filter(d => d.status === '대기').length;
      const progress = data.filter(d => d.status === '진행중').length;
      const done = data.filter(d => d.status === '완료').length;
      const doneRate = total > 0 ? Math.round((done / total) * 100) : 0;

      container.innerHTML = \`
        <!-- Interactive KPI Cards (Click to Navigate) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div onclick="navigateToFilter('TABLE', 'ALL')" class="bg-white p-3.5 rounded-xl border border-[#E5DFD3] hover:border-brand/50 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-[#78716C]">전체 관리 건수</span>
              <span class="text-[10px] text-[#A8A29E]">목록 ➔</span>
            </div>
            <div class="text-2xl font-extrabold text-[#1C1917] mt-1">\${total} <span class="text-xs font-normal text-[#A8A29E]">건</span></div>
          </div>

          <div onclick="navigateToFilter('TABLE', '대기')" class="bg-white p-3.5 rounded-xl border border-[#E5DFD3] hover:border-amber-400 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-amber-700">대기 / 미처리</span>
              <span class="text-[10px] text-amber-600">필터 ➔</span>
            </div>
            <div class="text-2xl font-extrabold text-amber-600 mt-1">\${pending} <span class="text-xs font-normal text-[#A8A29E]">건</span></div>
          </div>

          <div onclick="navigateToFilter('KANBAN', '진행중')" class="bg-white p-3.5 rounded-xl border border-[#E5DFD3] hover:border-blue-400 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-blue-700">진행중</span>
              <span class="text-[10px] text-blue-600">칸반 ➔</span>
            </div>
            <div class="text-2xl font-extrabold text-blue-600 mt-1">\${progress} <span class="text-xs font-normal text-[#A8A29E]">건</span></div>
          </div>

          <div onclick="navigateToFilter('ANALYTICS', '완료')" class="bg-white p-3.5 rounded-xl border border-[#E5DFD3] hover:border-emerald-400 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-semibold text-emerald-700">처리 완료율</span>
              <span class="text-[10px] text-emerald-600">통계 ➔</span>
            </div>
            <div class="text-2xl font-extrabold text-emerald-600 mt-1">\${doneRate}%</div>
          </div>
        </div>

        <!-- Progress Distribution Bar -->
        <div class="bg-white p-4 rounded-xl border border-[#E5DFD3] space-y-2">
          <div class="flex items-center justify-between text-xs font-bold text-[#44403C]">
            <span>진행 상태 파이프라인 분포</span>
            <span class="text-[11px] text-[#78716C]">완료 \${done}건 / 전체 \${total}건</span>
          </div>
          <div class="w-full h-3 bg-[#FAF7F2] rounded-full overflow-hidden flex border border-[#E5DFD3]">
            <div style="width: \${total > 0 ? (pending/total)*100 : 0}%; background-color: #F59E0B;" title="대기: \${pending}건"></div>
            <div style="width: \${total > 0 ? (progress/total)*100 : 0}%; background-color: #3B82F6;" title="진행중: \${progress}건"></div>
            <div style="width: \${total > 0 ? (done/total)*100 : 0}%; background-color: #10B981;" title="완료: \${done}건"></div>
          </div>
          <div class="flex items-center gap-4 text-[11px] text-[#78716C] pt-1">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> 대기 (\${pending})</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 진행중 (\${progress})</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> 완료 (\${done})</span>
          </div>
        </div>

        <!-- Recent Priority Feed with Item Drawer Integration -->
        <div class="bg-white p-4 rounded-xl border border-[#E5DFD3] space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xs sm:text-sm font-bold text-[#1C1917]">긴급 / 최근 요청 피드</h3>
              <p class="text-[11px] text-[#78716C]">카드를 클릭하면 상세 내역 수정 드로어가 열립니다.</p>
            </div>
            <button onclick="openAddModal()" class="text-xs font-bold text-[#6B1D42] hover:underline cursor-pointer">+ 신규 추가</button>
          </div>
          <div class="space-y-2">
            \${data.slice(0, 4).map(item => \`
              <div onclick="openItemDetail('\${item.id}')" class="p-3 bg-[#FAF7F2] hover:bg-white rounded-xl border border-[#E5DFD3] hover:border-[#6B1D42] transition-all flex items-center justify-between cursor-pointer shadow-2xs">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold \${
                      item.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === '진행중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                    }">\${item.status}</span>
                    <span class="text-xs font-bold text-[#1C1917]">\${escapeHtml(item.title)}</span>
                    \${item.amount ? \`<span class="text-[11px] font-mono text-[#78716C]">(\${escapeHtml(item.amount)})</span>\` : ''}
                  </div>
                  <p class="text-[11px] text-[#78716C] mt-0.5 line-clamp-1">\${escapeHtml(item.memo)}</p>
                </div>
                <button onclick="toggleItemStatus('\${item.id}', event)" class="text-xs px-2.5 py-1 rounded-lg border border-[#D5CCBC] bg-white text-[#44403C] hover:bg-[#EFE9DC] font-bold cursor-pointer shrink-0">
                  상태전환
                </button>
              </div>
            \`).join('')}
          </div>
        </div>
      \`;
    }

    // 2. KANBAN VIEW SYNTHESIS (Card Click opens Drawer)
    function renderKanbanView(container, data) {
      const columns = [
        { id: '대기', title: '접수 / 대기', color: 'border-amber-400 bg-amber-50/50', badge: 'bg-amber-100 text-amber-800' },
        { id: '진행중', title: '진행 / 처리중', color: 'border-blue-400 bg-blue-50/50', badge: 'bg-blue-100 text-blue-800' },
        { id: '완료', title: '승인 / 완료', color: 'border-emerald-400 bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-800' }
      ];

      container.innerHTML = \`
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          \${columns.map(col => {
            const colItems = data.filter(d => d.status === col.id);
            return \`
              <div class="bg-white rounded-2xl border-2 \${col.color} p-3 flex flex-col min-h-[420px] shadow-2xs">
                <div class="flex items-center justify-between pb-2 mb-2 border-b border-[#E5DFD3]">
                  <span class="text-xs font-bold text-[#1C1917]">\${col.title}</span>
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full \${col.badge}">\${colItems.length}</span>
                </div>
                <div class="flex-1 space-y-2.5 overflow-y-auto custom-scroll pr-1">
                  \${colItems.length === 0 ? \`
                    <div class="py-8 text-center text-xs text-[#A8A29E] border border-dashed border-[#E5DFD3] rounded-xl">카드가 없습니다</div>
                  \` : colItems.map(item => \`
                    <div onclick="openItemDetail('\${item.id}')" class="p-3 bg-white rounded-xl border border-[#D5CCBC] shadow-xs hover:border-[#6B1D42] transition-all space-y-2 cursor-pointer">
                      <div class="flex items-start justify-between gap-1">
                        <h4 class="text-xs font-bold text-[#1C1917] leading-snug">\${escapeHtml(item.title)}</h4>
                        <button onclick="deleteItem('\${item.id}', event)" class="text-[#A8A29E] hover:text-red-500 text-xs">✕</button>
                      </div>
                      <p class="text-[11px] text-[#57534E] leading-relaxed line-clamp-2">\${escapeHtml(item.memo)}</p>
                      <div class="flex items-center justify-between pt-1 border-t border-[#F1ECE1] text-[10px] text-[#78716C]">
                        <span>\${escapeHtml(item.amount || item.contact || '상세보기')}</span>
                        <button onclick="toggleItemStatus('\${item.id}', event)" class="px-2 py-0.5 rounded bg-[#FAF7F2] hover:bg-[#EFE9DC] text-[#44403C] font-bold border border-[#D5CCBC] cursor-pointer">
                          다음 ➔
                        </button>
                      </div>
                    </div>
                  \`).join('')}
                </div>
                <button onclick="openAddModal()" class="w-full mt-2 py-1.5 rounded-xl border border-dashed border-[#D5CCBC] hover:border-[#6B1D42] text-xs font-bold text-[#78716C] hover:text-[#6B1D42] transition-colors cursor-pointer">
                  + 카드 추가
                </button>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    // 3. TABLE / LIST VIEW SYNTHESIS (Row click opens Drawer)
    function renderTableView(container, data) {
      let list = data;
      if (currentFilter !== 'ALL') {
        list = list.filter(d => d.status === currentFilter);
      }
      const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
      if (q) {
        list = list.filter(d => 
          (d.title || '').toLowerCase().includes(q) ||
          (d.contact || '').toLowerCase().includes(q) ||
          (d.memo || '').toLowerCase().includes(q)
        );
      }

      container.innerHTML = \`
        <!-- Search & Status Filter Bar -->
        <div class="flex flex-col sm:flex-row gap-2 items-center justify-between bg-white p-2.5 rounded-xl border border-[#E5DFD3]">
          <div class="relative w-full sm:w-64">
            <input 
              id="searchInput" 
              type="text" 
              value="\${q}"
              placeholder="이름, 연락처, 메모 검색..." 
              oninput="renderActiveScreen()"
              class="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF7F2] rounded-lg border border-[#E5DFD3] focus:outline-none focus:border-brand"
            />
            <span class="absolute left-2.5 top-1.5 text-xs text-[#A8A29E]">🔍</span>
          </div>

          <div class="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            <button onclick="setFilter('ALL')" class="px-2.5 py-1 text-xs font-bold rounded-lg \${currentFilter === 'ALL' ? 'bg-[#292524] text-white' : 'text-[#57534E] hover:bg-[#FAF7F2]'}">전체 (\${data.length})</button>
            <button onclick="setFilter('대기')" class="px-2.5 py-1 text-xs font-bold rounded-lg \${currentFilter === '대기' ? 'bg-[#292524] text-white' : 'text-[#57534E] hover:bg-[#FAF7F2]'}">대기</button>
            <button onclick="setFilter('진행중')" class="px-2.5 py-1 text-xs font-bold rounded-lg \${currentFilter === '진행중' ? 'bg-[#292524] text-white' : 'text-[#57534E] hover:bg-[#FAF7F2]'}">진행중</button>
            <button onclick="setFilter('완료')" class="px-2.5 py-1 text-xs font-bold rounded-lg \${currentFilter === '완료' ? 'bg-[#292524] text-white' : 'text-[#57534E] hover:bg-[#FAF7F2]'}">완료</button>
          </div>
        </div>

        <!-- Table Grid -->
        <div class="bg-white rounded-xl border border-[#E5DFD3] overflow-hidden shadow-2xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-[#FAF7F2] border-b border-[#E5DFD3] text-[#57534E] font-bold">
                  <th class="p-3">항목명 / 제목</th>
                  <th class="p-3">상태</th>
                  <th class="p-3">연락처 / 기안자</th>
                  <th class="p-3">일시 / 수량</th>
                  <th class="p-3">특이사항 메모</th>
                  <th class="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E5DFD3]">
                \${list.length === 0 ? \`
                  <tr>
                    <td colspan="6" class="p-8 text-center text-xs text-[#A8A29E]">조건에 일치하는 데이터가 없습니다.</td>
                  </tr>
                \` : list.map(item => \`
                  <tr onclick="openItemDetail('\${item.id}')" class="hover:bg-[#FAF7F2]/80 transition-colors cursor-pointer">
                    <td class="p-3 font-bold text-[#1C1917]">\${escapeHtml(item.title)}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold \${
                        item.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === '진행중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }">\${item.status}</span>
                    </td>
                    <td class="p-3 text-[#57534E]">\${escapeHtml(item.contact || '-')}</td>
                    <td class="p-3 font-mono text-[#78716C]">\${escapeHtml(item.amount || '-')}</td>
                    <td class="p-3 text-[#57534E] max-w-xs truncate">\${escapeHtml(item.memo)}</td>
                    <td class="p-3 text-right space-x-1 whitespace-nowrap" onclick="event.stopPropagation()">
                      <button onclick="toggleItemStatus('\${item.id}', event)" class="px-2 py-1 rounded bg-[#FAF7F2] hover:bg-[#EFE9DC] text-[#44403C] font-bold border border-[#D5CCBC] cursor-pointer">상태전환</button>
                      <button onclick="deleteItem('\${item.id}', event)" class="px-2 py-1 rounded text-red-500 hover:bg-red-50 font-bold cursor-pointer">삭제</button>
                    </td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      \`;
    }

    // 4. TIMELINE / RESERVATION VIEW SYNTHESIS (Click slot to book)
    function renderTimelineView(container, data) {
      const timeslots = ['09:00', '10:30', '11:45', '13:00', '14:30', '16:00', '17:30'];

      container.innerHTML = \`
        <div class="bg-white p-4 rounded-xl border border-[#E5DFD3] space-y-4">
          <div class="flex items-center justify-between border-b border-[#E5DFD3] pb-3">
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-[#1C1917]">📅 당일 시간대별 예약 타임라인</span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-[#6B1D42]/10 text-[#6B1D42] font-mono font-bold">2026-09-25 (금)</span>
            </div>
            <button onclick="openAddModal()" class="px-3 py-1.5 rounded-xl bg-[#6B1D42] text-white text-xs font-bold cursor-pointer">
              + 예약 슬롯 추가
            </button>
          </div>

          <div class="space-y-3">
            \${timeslots.map((slot, idx) => {
              const matchedItem = data[idx % data.length];
              return \`
                <div onclick="openItemDetail('\${matchedItem.id}')" class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:border-brand transition-all \${idx % 2 === 0 ? 'bg-[#FAF7F2] border-[#E5DFD3]' : 'bg-white border-[#D5CCBC]'}">
                  <div class="w-16 font-mono text-xs font-bold text-[#6B1D42] pt-1 shrink-0">\${slot}</div>
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center gap-2">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold \${
                        matchedItem.status === '완료' ? 'bg-emerald-100 text-emerald-800' :
                        matchedItem.status === '진행중' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }">\${matchedItem.status}</span>
                      <h4 class="text-xs font-bold text-[#1C1917]">\${escapeHtml(matchedItem.title)}</h4>
                      <span class="text-[11px] text-[#78716C]">(\${escapeHtml(matchedItem.contact || '보호자 예약')})</span>
                    </div>
                    <p class="text-xs text-[#57534E]">\${escapeHtml(matchedItem.memo)}</p>
                  </div>
                  <button onclick="toggleItemStatus('\${matchedItem.id}', event)" class="text-xs px-2.5 py-1 rounded-lg border border-[#D5CCBC] bg-white hover:bg-[#EFE9DC] text-[#44403C] font-bold cursor-pointer shrink-0">
                    상태변경
                  </button>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    // 5. CALCULATOR / QUOTE ESTIMATE VIEW SYNTHESIS
    function renderCalculatorView(container, data) {
      container.innerHTML = \`
        <div class="bg-white p-5 rounded-2xl border-2 border-[#E5DFD3] space-y-5">
          <div class="border-b border-[#E5DFD3] pb-3">
            <h3 class="text-base font-bold text-[#1C1917]">💡 실시간 견적 옵션 시뮬레이터</h3>
            <p class="text-xs text-[#78716C] mt-0.5">선택한 서비스 항목에 따라 실시간 총액이 자동 합산 계산됩니다.</p>
          </div>

          <div class="space-y-3 text-xs">
            <label class="flex items-center justify-between p-3 rounded-xl border border-[#E5DFD3] bg-[#FAF7F2] cursor-pointer hover:border-brand">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt1" checked onchange="recalculateQuote()" class="w-4 h-4 accent-[#6B1D42]">
                <div>
                  <div class="font-bold text-[#1C1917]">기본 패키지 / 핵심 도메인 구축</div>
                  <div class="text-[11px] text-[#78716C]">기본 UI 컴포넌트 및 로컬 스토리지 연동</div>
                </div>
              </div>
              <span class="font-mono font-bold text-[#6B1D42]">1,200,000원</span>
            </label>

            <label class="flex items-center justify-between p-3 rounded-xl border border-[#E5DFD3] bg-[#FAF7F2] cursor-pointer hover:border-brand">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt2" checked onchange="recalculateQuote()" class="w-4 h-4 accent-[#6B1D42]">
                <div>
                  <div class="font-bold text-[#1C1917]">실시간 알림 및 상태 변경 파이프라인</div>
                  <div class="text-[11px] text-[#78716C]">대기 ➔ 진행중 ➔ 완료 원클릭 상태 전환</div>
                </div>
              </div>
              <span class="font-mono font-bold text-[#6B1D42]">500,000원</span>
            </label>

            <label class="flex items-center justify-between p-3 rounded-xl border border-[#E5DFD3] bg-[#FAF7F2] cursor-pointer hover:border-brand">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt3" onchange="recalculateQuote()" class="w-4 h-4 accent-[#6B1D42]">
                <div>
                  <div class="font-bold text-[#1C1917]">데이터 엑셀/CSV 내보내기 & 통계 차트</div>
                  <div class="text-[11px] text-[#78716C]">월별 집계 보고서 및 백업 아카이빙</div>
                </div>
              </div>
              <span class="font-mono font-bold text-[#6B1D42]">350,000원</span>
            </label>
          </div>

          <!-- Total Calculation Bar -->
          <div class="p-4 rounded-xl bg-[#F7EFF3] border-2 border-[#6B1D42]/30 flex items-center justify-between">
            <div>
              <span class="text-xs text-[#6B1D42] font-bold">예상 총 견적액 (VAT 포함)</span>
              <div id="quoteTotalDisplay" class="text-2xl font-extrabold text-[#6B1D42] font-mono mt-0.5">1,700,000원</div>
            </div>
            <button onclick="submitQuoteOrder()" class="px-5 py-2.5 rounded-xl bg-[#6B1D42] text-white text-xs font-bold hover:opacity-95 cursor-pointer shadow-md">
              이 견적으로 상담 접수하기 ➔
            </button>
          </div>
        </div>
      \`;
    }

    // 6. ANALYTICS VIEW SYNTHESIS
    function renderAnalyticsView(container, data) {
      const total = data.length;

      container.innerHTML = \`
        <div class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-white p-4 rounded-xl border border-[#E5DFD3]">
              <span class="text-xs text-[#78716C]">월간 총 처리 건수</span>
              <div class="text-2xl font-extrabold text-[#1C1917] mt-1">\${total * 12} 건</div>
              <span class="text-[11px] text-emerald-600 font-bold">↑ 전월 대비 18% 증가</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-[#E5DFD3]">
              <span class="text-xs text-[#78716C]">평균 리드타임</span>
              <div class="text-2xl font-extrabold text-blue-600 mt-1">4.2 시간</div>
              <span class="text-[11px] text-blue-600 font-bold">↓ 3일에서 대폭 단축</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-[#E5DFD3]">
              <span class="text-xs text-[#78716C]">목표 달성 지수</span>
              <div class="text-2xl font-extrabold text-emerald-600 mt-1">94.8%</div>
              <span class="text-[11px] text-emerald-600 font-bold">★ 최우수 달성</span>
            </div>
          </div>

          <!-- Bar Chart Simulation -->
          <div class="bg-white p-4 rounded-xl border border-[#E5DFD3] space-y-3">
            <h4 class="text-xs font-bold text-[#1C1917]">주간별 완료 성과 지표</h4>
            <div class="space-y-2 text-xs">
              <div>
                <div class="flex justify-between text-[11px] text-[#57534E] mb-1"><span>1주차</span><span>12건</span></div>
                <div class="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD3]"><div class="h-full bg-[#6B1D42]" style="width: 45%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-[#57534E] mb-1"><span>2주차</span><span>24건</span></div>
                <div class="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD3]"><div class="h-full bg-[#6B1D42]" style="width: 75%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-[#57534E] mb-1"><span>3주차</span><span>31건</span></div>
                <div class="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD3]"><div class="h-full bg-[#6B1D42]" style="width: 90%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] text-[#57534E] mb-1"><span>4주차 (진행중)</span><span>18건</span></div>
                <div class="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD3]"><div class="h-full bg-emerald-500" style="width: 60%"></div></div>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // 7. FORM VIEW SYNTHESIS
    function renderFormView(container) {
      container.innerHTML = \`
        <div class="bg-white p-5 rounded-2xl border border-[#E5DFD3] space-y-4 max-w-xl mx-auto">
          <div class="border-b border-[#E5DFD3] pb-3">
            <h3 class="text-base font-bold text-[#1C1917]">📝 신규 접수 등록 신청서</h3>
            <p class="text-xs text-[#78716C] mt-0.5">상세 항목을 작성하고 등록하면 즉시 대시보드와 목록에 반영됩니다.</p>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-[#44403C] mb-1">제목 / 품목 / 신청인 <span class="text-red-500">*</span></label>
              <input id="inlineFormTitle" type="text" placeholder="예: 신규 정기 예약 접수" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-[#44403C] mb-1">연락처 / 기안자</label>
                <input id="inlineFormContact" type="text" placeholder="010-0000-0000" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
              </div>
              <div>
                <label class="block font-bold text-[#44403C] mb-1">희망일시 / 금액</label>
                <input id="inlineFormAmount" type="text" placeholder="오후 15:00" class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand">
              </div>
            </div>
            <div>
              <label class="block font-bold text-[#44403C] mb-1">상세 요청 메모</label>
              <textarea id="inlineFormMemo" rows="4" placeholder="주의사항이나 특이사항을 적어주세요." class="w-full p-2.5 rounded-lg border border-[#D5CCBC] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-1 focus:ring-brand"></textarea>
            </div>
            <button onclick="submitInlineForm()" class="w-full py-2.5 rounded-xl bg-[#6B1D42] text-white text-xs font-bold hover:opacity-95 cursor-pointer shadow-md">
              신규 등록 완료하기 ➔
            </button>
          </div>
        </div>
      \`;
    }

    function setFilter(filter) {
      currentFilter = filter;
      renderActiveScreen();
    }

    function recalculateQuote() {
      let sum = 0;
      if (document.getElementById('calcOpt1')?.checked) sum += 1200000;
      if (document.getElementById('calcOpt2')?.checked) sum += 500000;
      if (document.getElementById('calcOpt3')?.checked) sum += 350000;
      const disp = document.getElementById('quoteTotalDisplay');
      if (disp) disp.innerText = sum.toLocaleString() + '원';
    }

    function submitQuoteOrder() {
      const sumText = document.getElementById('quoteTotalDisplay')?.innerText || '1,700,000원';
      const newItem = {
        id: 'item-' + Date.now(),
        title: '견적 상담 신청 접수 (' + sumText + ')',
        contact: '온라인 견적 고객',
        status: '대기',
        amount: sumText,
        memo: '시뮬레이터 옵션 선택을 통한 실시간 견적 접수 건',
        createdAt: new Date().toISOString()
      };
      const data = getStore();
      data.unshift(newItem);
      saveStore(data);
      showToast('견적 상담이 접수되었습니다! 대시보드로 이동합니다.');
      switchPage(0);
    }

    function submitInlineForm() {
      const title = document.getElementById('inlineFormTitle')?.value.trim();
      const contact = document.getElementById('inlineFormContact')?.value.trim();
      const amount = document.getElementById('inlineFormAmount')?.value.trim();
      const memo = document.getElementById('inlineFormMemo')?.value.trim();

      if (!title) {
        alert('제목을 입력해주세요.');
        return;
      }

      const newItem = {
        id: 'item-' + Date.now(),
        title,
        contact,
        status: '대기',
        amount,
        memo: memo || '상세 메모 없음',
        createdAt: new Date().toISOString()
      };

      const data = getStore();
      data.unshift(newItem);
      saveStore(data);
      showToast('신규 접수 등록이 완료되었습니다.');
      switchPage(0);
    }

    function openAddModal() {
      document.getElementById('addModal').classList.remove('hidden');
      document.getElementById('modalTitle').focus();
    }

    function closeAddModal() {
      document.getElementById('addModal').classList.add('hidden');
    }

    function submitNewItem() {
      const title = document.getElementById('modalTitle').value.trim();
      const contact = document.getElementById('modalContact').value.trim();
      const status = document.getElementById('modalStatus').value;
      const amount = document.getElementById('modalAmount').value.trim();
      const memo = document.getElementById('modalMemo').value.trim();

      if (!title) {
        alert('항목 이름을 입력해주세요.');
        return;
      }

      const newItem = {
        id: 'item-' + Date.now(),
        title,
        contact,
        status,
        amount,
        memo: memo || '상세 메모 없음',
        createdAt: new Date().toISOString()
      };

      const data = getStore();
      data.unshift(newItem);
      saveStore(data);

      document.getElementById('modalTitle').value = '';
      document.getElementById('modalContact').value = '';
      document.getElementById('modalAmount').value = '';
      document.getElementById('modalMemo').value = '';
      closeAddModal();
      showToast('[' + title + '] 등록이 완료되었습니다.');
    }

    function copyAgentPrompt() {
      const promptText = \`당신은 [${projectName}]의 수석 프론트엔드 소프트웨어 엔지니어입니다.

루트 디렉터리에 이미 브라우저에서 동작 검증을 마친 [prototype.html] 파일이 있습니다.
자신의 자의적인 상상이나 환각으로 화면을 꾸미지 말고, [prototype.html]의 컴포넌트 구조, 화면 전환(Navigation Flow), 상세 정보 드로어(Detail Drawer), 상태 변경 파이프라인, 모달 입력 폼, 그리고 로컬 데이터 스키마를 React 19 + TypeScript + Tailwind CSS 프로덕션 코드로 1:1 완벽하게 변환해 주십시오.

### 📌 프로덕션 구현 요구사항 (Prototype-as-Spec):
1. 대상 플랫폼: ${platform}
2. 브랜드 색상: ${themeColor} 및 Warm Paper (#F8F4EB, #FAF7F2, #E5DFD3, 먹색 #111827)
3. 1:1 분할 구현할 화면: \${PAGES.map((p, i) => \`Screen \${i + 1} [\${p.name}] (\${p.route}): \${p.purpose}\`).join(' / ')}
4. 필수 인터랙션: 카드/행 클릭 시 상세 정보 드로어(Detail Drawer) 열기, 상태(대기➔진행중➔완료) 토글 및 상단 토스트(Toast), 신규 등록 모달, 로컬 저장소 영속성
5. 패키지 설치 통제: 무거운 라이브러리(Redux, Axios) 없이 순수 React 19 + Tailwind CSS로 구현

지금 prototype.html과 docs/를 정독하고 첫 번째 컴포넌트를 코딩해 주십시오.\`;

      navigator.clipboard.writeText(promptText).then(() => {
        showToast('🤖 에이전트 주입용 골든 프롬프트가 복사되었습니다! Cursor나 Claude에 붙여넣으세요.');
      }).catch(() => {
        alert('프롬프트 복사에 실패했습니다. 브라우저 권한을 확인해주세요.');
      });
    }

    // Keyboard navigation (ESC closes drawers/modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailDrawer();
        closeAddModal();
      }
    });

    // Real-time synchronization pulse listener from GOGUMA Studio
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'GOGUMA_TRIGGER_PULSE') {
        const target = (e.data.targetId ? document.getElementById(e.data.targetId) : null) || document.getElementById('prototypeContainer');
        if (target) {
          target.classList.remove('goguma-pulse-glow');
          void target.offsetWidth;
          target.classList.add('goguma-pulse-glow');
          setTimeout(() => target.classList.remove('goguma-pulse-glow'), 1300);
        }
      }
    });

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
      renderActiveScreen();
    });
  </script>
</body>
</html>`;
}
