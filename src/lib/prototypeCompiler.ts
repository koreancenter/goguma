import { SitePlan, FormInputEntity } from '../types';
import {
  serializeAllBusinessRulesToMarkdown,
  getSectionBusinessRules,
  hasMeaningfulRuleContent,
  isChapterOrSectionLocked,
  wrapImmutableConstraint,
} from './businessRulesSerializer';
import { GOGUMA_CHAPTERS } from './chapterData';

export type PreviewStateMode = 'default' | 'empty' | 'error' | 'role';
export type PreviewRoleMode = 'user' | 'admin';

export interface PrototypePreviewOptions {
  formInputs?: Record<string, FormInputEntity>;
  previewState?: PreviewStateMode;
  previewRole?: PreviewRoleMode;
}

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

function safeJsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * Generates a golden, unambiguous "Prototype-as-Spec" prompt for Cursor, Claude Code, Windsurf, etc.
 * Instructs the AI agent to reverse-engineer prototype.html 1:1 into production React 19 code without hallucinations.
 */
export function generatePrototypePrompt(
  plan: SitePlan,
  formInputs?: Record<string, FormInputEntity>,
  lockedChapters?: number[]
): string {
  const projectName = plan.metadata?.projectName || '애플리케이션';
  const platform = plan.metadata?.platform === 'APP' ? '모바일 웹/앱 (Mobile-First)' : '웹 대시보드 (Web-First)';
  const pages = plan.navigation?.pageStructure || [
    { name: '대시보드', route: '/dashboard', purpose: '실시간 현황 모니터링' },
    { name: '목록 관리', route: '/list', purpose: '데이터 검색 및 상태 관리' },
  ];
  const domainRulesMarkdown = serializeAllBusinessRulesToMarkdown(formInputs, lockedChapters);

  const lockedNarrativeBlocks: string[] = [];
  if (formInputs) {
    for (const ch of GOGUMA_CHAPTERS) {
      for (const sec of ch.sections) {
        const key = `${ch.id}_${sec.key}`;
        const raw = formInputs[key]?.userRawInput?.trim();
        if (raw && isChapterOrSectionLocked(ch.id, sec.key, formInputs, lockedChapters)) {
          lockedNarrativeBlocks.push(
            wrapImmutableConstraint(`### Chapter 0${ch.id} · ${sec.title} (\`${key}\`)\n${raw}`)
          );
        }
      }
    }
  }

  return `당신은 [${projectName}]의 수석 프론트엔드 소프트웨어 엔지니어입니다.

루트 디렉터리에 이미 브라우저에서 동작 검증을 마친 [prototype.html] 파일이 있습니다.
자신의 자의적인 상상이나 환각으로 화면을 꾸미지 말고, [prototype.html]의 컴포넌트 구조, 화면 전환(Navigation Flow), 상세 정보 드로어(Detail Drawer), 상태 변경 파이프라인, 모달 입력 폼, 그리고 로컬 데이터 스키마를 React 19 + TypeScript + Tailwind CSS 프로덕션 코드로 1:1 완벽하게 변환해 주십시오.

### 📌 프로덕션 구현 요구사항 (Prototype-as-Spec):
1. **타깃 플랫폼 & 디자인 규약**:
   - 대상 플랫폼: ${platform}
   - 브랜드 색상 & 톤앤매너: 럭셔리 미니멀리즘 (Sumi Black 바탕 #0B0C10, 카드/표면 #0E1217 / #13181F, 헤어라인 보더 border-white/[0.08], Warm White 텍스트 #F0F3F6 / #9AA5B5, 럭셔리 사파이어 블루 포인트 #2563EB 및 일렉트릭 애저 #38BDF8)
   - 타이포그래피: DM Sans / SUIT Variable 산스 세리프 폰트 전면 적용 (세리프 배제, 가독성과 절제미 극대화)
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
   - 무거운 외부 라이브러리(Redux, Axios, Lodash 등)를 설치하지 말고, 순수 React 19 + Tailwind CSS + Lucide Icons만으로 정갈하게 작성하십시오.${domainRulesMarkdown ? `

5. **도메인 비즈니스 규칙 및 제약 사항 (Domain Rules & Constraints — 엄격 준수)**:
${domainRulesMarkdown}` : ''}${lockedNarrativeBlocks.length > 0 ? `

6. **잠금된 불변 사양 (Spec Lock Guardrails — 임의 변경/생략 금지)**:
${lockedNarrativeBlocks.join('\n\n')}` : ''}

지금 prototype.html과 docs/ 폴더를 정독하고, src/ 구조 설계와 첫 번째 핵심 컴포넌트 코드를 작성해 주십시오.`;
}

/**
 * Advanced Dynamic Screen Synthesis & Rich Virtual Navigation Prototype Compiler.
 * Produces a fully self-contained HTML5 + Vanilla JS + Tailwind Play CDN web app.
 * Styled in high-end Luxury Black & White minimalism.
 */
export function compileStandalonePrototypeHtml(
  plan: SitePlan,
  options?: PrototypePreviewOptions
): string {
  const formInputs = options?.formInputs;
  const initialPreviewState: PreviewStateMode = options?.previewState || 'default';
  const initialPreviewRole: PreviewRoleMode = options?.previewRole || 'user';

  const projectName = escapeHtml(plan.metadata?.projectName || '애플리케이션');
  const platform = plan.metadata?.platform === 'APP' ? 'APP' : 'WEB';
  const pages = plan.navigation?.pageStructure && plan.navigation.pageStructure.length > 0
    ? plan.navigation.pageStructure
    : [
        { name: '대시보드', route: '/dashboard', purpose: '실시간 업무 현황 및 주요 지표 모니터링' },
        { name: '업무 목록', route: '/list', purpose: '전체 데이터 검색, 필터링 및 상세 내역 확인' },
        { name: '진행 칸반', route: '/kanban', purpose: '단계별 업무 요청 및 승인 파이프라인' },
        { name: '통계 리포트', route: '/analytics', purpose: '월별 처리 현황 및 목표 달성률' },
      ];
  const themeColor = plan.design?.themeColor || '#FFFFFF';
  const purpose = escapeHtml(
    formInputs?.['1_problem_background']?.userRawInput?.trim() ||
    plan.metadata?.projectOverview?.purpose ||
    '사용자 친화적 업무 프로세스 자동화 및 생산성 향상'
  );
  const target = escapeHtml(
    formInputs?.['2_target_persona']?.userRawInput?.trim() ||
    plan.metadata?.projectOverview?.target ||
    '현장 실무자 및 의사결정권자'
  );
  const kpi = escapeHtml(plan.metadata?.projectOverview?.kpi || '업무 처리 시간 50% 단축');

  // Collect all structured Domain Business Rules across all chapters
  const collectedDomainRules: Array<{
    id: string;
    chapterTitle: string;
    sectionTitle: string;
    when: string;
    then: string;
    exception: string;
    isLocked: boolean;
  }> = [];

  if (formInputs) {
    for (const ch of GOGUMA_CHAPTERS) {
      for (const sec of ch.sections) {
        const rules = getSectionBusinessRules(formInputs[`${ch.id}_${sec.key}`]).filter(hasMeaningfulRuleContent);
        for (const r of rules) {
          collectedDomainRules.push({
            id: r.id,
            chapterTitle: ch.title,
            sectionTitle: sec.title,
            when: r.when.trim(),
            then: r.then.trim(),
            exception: r.exception.trim(),
            isLocked: Boolean(r.isLocked),
          });
        }
      }
    }
  }

  // Derive realistic domain sample records from user's current project inputs
  const rawFeaturesText = formInputs?.['3_key_features']?.userRawInput?.trim() || '';
  const featureLines = rawFeaturesText
    .split(/\n+/)
    .map(l => l.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(l => l.length > 2)
    .slice(0, 4);

  const rawColumnsText = formInputs?.['4_data_columns']?.userRawInput?.trim() || '';
  const dataColumnsList = rawColumnsText
    .split(/[,;\n/·•]+/)
    .map(c => c.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 6);

  const domainOwnerHint = target.split(/[,\n/·]+/)[0]?.trim() || 'operator@service.io';
  const statuses: Array<'진행중' | '대기' | '완료'> = ['진행중', '대기', '완료', '대기'];

  const synthesizedDefaultData = featureLines.length > 0
    ? featureLines.map((feat, idx) => ({
        id: `item-${idx + 1}`,
        title: feat.slice(0, 72),
        contact: idx === 0 ? domainOwnerHint.slice(0, 28) : `team-${idx + 1}@${(plan.metadata?.projectName || 'app').replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'goguma'}.io`,
        status: statuses[idx % statuses.length],
        amount: dataColumnsList[idx] ? `${dataColumnsList[idx]} 연동` : `Sprint 0${idx + 1} · v1.${idx}.0`,
        memo: `${pages[idx % pages.length]?.name || '핵심 화면'} · ${dataColumnsList.length > 0 ? `필드(${dataColumnsList.slice(0, 3).join(', ')})` : purpose.slice(0, 48)}`,
        createdAt: new Date().toISOString(),
        isAdminRestricted: idx === featureLines.length - 1,
      }))
    : [
        { id: 'item-1', title: `[${plan.metadata?.projectName || 'CORE'}] 핵심 워크플로우 & 대시보드 처리`, contact: 'lead@service.io', status: '진행중', amount: dataColumnsList[0] ? `${dataColumnsList[0]} 매핑` : 'Sprint 02 • v1.2.0', memo: `${purpose.slice(0, 60)}`, createdAt: new Date().toISOString(), isAdminRestricted: false },
        { id: 'item-2', title: `[API] ${pages[1]?.name || '실시간 데이터'} 조회 및 필터링 파이프라인`, contact: 'backend@service.io', status: '대기', amount: dataColumnsList[1] ? `${dataColumnsList[1]} 검증` : 'P99 < 35ms', memo: dataColumnsList.length > 0 ? `스키마 필드: ${dataColumnsList.join(', ')}` : 'IndexedDB 로컬 우선 조회 및 상태 동기화', createdAt: new Date().toISOString(), isAdminRestricted: false },
        { id: 'item-3', title: `[RULE] 도메인 유효성 검증 및 상태 전이 가드`, contact: 'qa@service.io', status: '완료', amount: collectedDomainRules.length > 0 ? `규칙 ${collectedDomainRules.length}건 적용` : 'Validation v1.0', memo: collectedDomainRules[0]?.then || '필수 입력값 검증 및 중복 처리 방지 규칙 준수', createdAt: new Date().toISOString(), isAdminRestricted: false },
        { id: 'item-4', title: `[ADMIN] 권한 제어(RBAC) 및 관리자 승인 오버라이드`, contact: 'security@service.io', status: '대기', amount: 'Admin Only', memo: collectedDomainRules[0]?.exception || '관리자 전용 감사 로그 및 예외 승인 권한 제어', createdAt: new Date().toISOString(), isAdminRestricted: true },
      ];

  // JSON safe serialized pages with detected screen types and icons
  const safePagesJson = safeJsonForScript(pages.map(p => {
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

  const safeDefaultDataJson = safeJsonForScript(synthesizedDefaultData);
  const safeDomainRulesJson = safeJsonForScript(collectedDomainRules);
  const safeDataColumnsJson = safeJsonForScript(dataColumnsList);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} - 실시간 발현 프로토타입</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/sun-typeface/SUIT@2/fonts/variable/woff2/SUIT-Variable.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400;500;600&display=swap" />
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"DM Sans"', '"SUIT Variable"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace']
          },
          colors: {
            brand: '${themeColor}',
            canvas: '#FFFFFF',
            surface: '#F8FAFC',
            card: '#FFFFFF',
            subtle: '#F8FAFC',
            ink: '#0F172A',
            inkMuted: '#64748B',
            hairline: '#E2E8F0',
            sapphire: '#1E3A8A',
            azure: '#2563EB',
          }
        }
      }
    }
  </script>
  <style>
    body { 
      font-family: "DM Sans", "SUIT Variable", -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.75;
      letter-spacing: -0.01em;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .custom-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: rgba(15, 23, 42, 0.14); border-radius: 9999px; }
    .modal-backdrop { background: rgba(15, 23, 42, 0.35); backdrop-filter: blur(4px); }
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes pulseSync {
      0% { box-shadow: 0 0 0 0 rgba(30, 58, 138, 0.28); }
      45% { box-shadow: 0 0 0 5px rgba(30, 58, 138, 0.08); }
      100% { box-shadow: 0 0 0 0 rgba(30, 58, 138, 0); }
    }
    .pulse-glow {
      animation: pulseSync 1.1s cubic-bezier(0.16, 1, 0.3, 1);
    }
  </style>
</head>
<body class="bg-[#FFFFFF] text-[#0F172A] min-h-screen flex flex-col relative font-sans antialiased m-0 p-0 selection:bg-[#EFF6FF] selection:text-[#1E3A8A]">

  <!-- Toast Notification Container -->
  <div id="toastContainer" class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <!-- Main Prototype Shell Container -->
  <div 
    id="prototypeContainer" 
    class="w-full flex-1 bg-[#FFFFFF] flex flex-col relative min-h-screen"
  >
    
    <!-- Mobile Status Bar (Visible only in phone frame) -->
    <div id="mobileStatusBar" class="${platform === 'APP' ? 'flex' : 'hidden'} items-center justify-between px-6 pt-3 pb-1.5 bg-[#F8FAFC] text-xs font-sans tabular-nums font-semibold text-[#64748B] select-none border-b border-[#E2E8F0]">
      <span>09:41</span>
      <div class="w-16 h-4 bg-[#E2E8F0] rounded-full mx-auto -mt-1"></div>
      <div class="flex items-center gap-1">
        <span>5G</span>
        <span>100%</span>
      </div>
    </div>

    <!-- App / Web Header with Truncated Project Title -->
    <header class="px-5 py-3.5 bg-[#FFFFFF] border-b border-[#E2E8F0] flex items-center justify-between gap-3 sticky top-0 z-20">
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <!-- Back Navigation Button -->
        <button 
          id="navBackBtn" 
          onclick="navigateBack()" 
          class="hidden px-2 py-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1E3A8A] text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap"
          title="이전 화면으로 돌아가기"
        >
          ← 뒤로
        </button>

        <div class="w-7 h-7 rounded-lg flex items-center justify-center text-[#FFFFFF] font-bold text-xs bg-[#1E3A8A] shrink-0 font-sans">
          ${projectName.charAt(0)}
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="text-sm sm:text-[15px] font-bold tracking-tight text-[#0F172A] leading-tight truncate" title="${projectName}">${projectName}</h1>
          <p class="text-[11px] text-[#64748B] truncate">${purpose}</p>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span id="headerRoleBadge" class="hidden px-2 py-1 rounded-md text-[10px] font-sans font-semibold border whitespace-nowrap"></span>
        <button 
          id="headerAddBtn"
          onclick="openAddModal()" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium text-[#FFFFFF] bg-[#1E3A8A] hover:bg-[#172554] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>+</span>
          <span>신규 등록</span>
        </button>
      </div>
    </header>

    <!-- Desktop / Top Navigation Tab Bar -->
    <nav id="topNavTabs" class="bg-[#FFFFFF] px-5 border-b border-[#E2E8F0] flex items-center gap-1.5 overflow-x-auto custom-scroll py-2">
      ${pages.map((p, idx) => `
        <button 
          onclick="switchPage(${idx})" 
          id="navTab-${idx}" 
          class="px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            idx === 0 
              ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold' 
              : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] font-medium'
          }"
        >
          <span>${escapeHtml(p.name)}</span>
        </button>
      `).join('')}
    </nav>

    <!-- Dynamic Content Area -->
    <main class="flex-1 p-4 sm:p-5 overflow-y-auto custom-scroll space-y-4 pb-16 sm:pb-5 bg-[#FFFFFF]">
      
      <!-- Preview State Simulation Banner (Blocked/Error or Role Mode) -->
      <div id="previewStateBanner" class="hidden"></div>

      <!-- Screen Context Header Card -->
      <div id="screenHeaderCard" class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-4">
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span id="screenRouteBadge" class="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E3A8A]">ROUTE: ${escapeHtml(pages[0].route || '/')}</span>
            <span id="screenTypeBadge" class="text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#64748B] border border-[#E2E8F0]">화면</span>
          </div>
          <h2 id="screenTitle" class="text-sm font-bold text-[#0F172A] mt-2 truncate">${escapeHtml(pages[0].name)}</h2>
          <p id="screenDesc" class="text-xs text-[#64748B] mt-0.5 line-clamp-2">${escapeHtml(pages[0].purpose || '')}</p>
        </div>
        <div class="text-right hidden sm:block shrink-0">
          <span class="text-[10px] font-sans text-[#64748B]">목표 KPI</span>
          <p class="text-xs font-sans font-semibold text-[#1E3A8A] mt-0.5">${kpi}</p>
        </div>
      </div>

      <!-- Synthesized Dynamic Screen View Slot -->
      <div id="dynamicScreenView" class="space-y-4">
        <!-- Rendered dynamically by switchPage() in JavaScript -->
      </div>

    </main>

    <!-- Mobile Native Bottom Navigation Bar (Active in phone frame) -->
    <div id="mobileBottomNav" class="${platform === 'APP' ? 'flex' : 'hidden'} items-center justify-around bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E2E8F0] py-2 px-1 absolute bottom-0 left-0 right-0 z-20">
      ${pages.slice(0, 4).map((p, idx) => `
        <button 
          onclick="switchPage(${idx})" 
          id="bottomTab-${idx}" 
          class="flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] transition-all cursor-pointer ${
            idx === 0 ? 'text-[#1E3A8A] font-semibold' : 'text-[#64748B] hover:text-[#0F172A]'
          }"
        >
          <span class="text-sm leading-none mb-0.5">${p.name.includes('대시') ? '📊' : p.name.includes('칸반') ? '📑' : p.name.includes('예약') ? '📅' : p.name.includes('견적') ? '💡' : p.name.includes('통계') ? '📈' : '📋'}</span>
          <span class="truncate max-w-[60px]">${escapeHtml(p.name)}</span>
        </button>
      `).join('')}
    </div>
  </div>

  <!-- Item Detail Drawer / Sheet (Slide-in) -->
  <div id="detailDrawerBackdrop" onclick="closeDetailDrawer()" class="fixed inset-0 modal-backdrop hidden z-40 transition-opacity"></div>
  <div id="detailDrawer" class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-2xl z-50 p-5 flex flex-col justify-between hidden animate-slide-in-right overflow-y-auto custom-scroll text-[#0F172A]">
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <div class="flex items-center gap-2">
          <span id="drawerStatusBadge" class="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-[#EFF6FF] text-[#1E3A8A]">대기</span>
          <span class="text-xs font-sans text-[#64748B]">엔지니어링 스펙 상세</span>
        </div>
        <button onclick="closeDetailDrawer()" class="text-[#64748B] hover:text-[#0F172A] text-lg font-bold cursor-pointer">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-medium text-[#475569] mb-1">기능 명세 / 엔드포인트 명</label>
          <input id="drawerTitle" type="text" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A]">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-medium text-[#475569] mb-1">진행 파이프라인</label>
            <select id="drawerStatusSelect" onchange="updateDrawerStatus()" class="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] font-medium text-xs focus:outline-none focus:border-[#1E3A8A] cursor-pointer">
              <option value="대기">대기</option>
              <option value="진행중">진행중</option>
              <option value="완료">완료</option>
            </select>
          </div>
          <div>
            <label class="block font-medium text-[#475569] mb-1">버전 / 성능 지표</label>
            <input id="drawerAmount" type="text" class="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A] font-sans tabular-nums">
          </div>
        </div>

        <div>
          <label class="block font-medium text-[#475569] mb-1">담당 엔지니어 / 서브시스템</label>
          <input id="drawerContact" type="text" class="w-full p-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A]">
        </div>

        <div>
          <label class="block font-medium text-[#475569] mb-1">상세 구현 규격 & 메모</label>
          <textarea id="drawerMemo" rows="4" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A] leading-relaxed"></textarea>
        </div>
      </div>
    </div>

    <div class="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
      <button onclick="deleteDrawerItem()" class="px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">
        삭제하기
      </button>
      <div class="flex items-center gap-2">
        <button onclick="closeDetailDrawer()" class="px-4 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer">닫기</button>
        <button onclick="saveDrawerChanges()" class="px-4 py-2 rounded-lg text-xs font-semibold text-[#FFFFFF] bg-[#1E3A8A] hover:bg-[#172554] cursor-pointer">
          저장하기
        </button>
      </div>
    </div>
  </div>

  <!-- Add Item Modal Dialog -->
  <div id="addModal" class="fixed inset-0 modal-backdrop hidden z-50 flex items-center justify-center p-4">
    <div class="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 text-[#0F172A]">
      <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
        <h3 class="text-sm font-bold text-[#0F172A] tracking-tight">신규 기능 스펙 & API 엔드포인트 등록</h3>
        <button onclick="closeAddModal()" class="text-[#64748B] hover:text-[#0F172A] text-lg font-bold cursor-pointer">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-medium text-[#475569] mb-1">기능명 / 엔드포인트 <span class="text-[#1E3A8A]">*</span></label>
          <input id="modalTitle" type="text" placeholder="예: [FEAT] 사용자 온보딩 퍼널 및 토큰 인증 플로우" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1E3A8A]">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-medium text-[#475569] mb-1">담당 엔지니어</label>
            <input id="modalContact" type="text" placeholder="dev-lead@service.io" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1E3A8A]">
          </div>
          <div>
            <label class="block font-medium text-[#475569] mb-1">상태</label>
            <select id="modalStatus" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A] cursor-pointer">
              <option value="대기">대기</option>
              <option value="진행중" selected>진행중</option>
              <option value="완료">완료</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-medium text-[#475569] mb-1">버전 / 스프린트 / 레이턴시 지표</label>
          <input id="modalAmount" type="text" placeholder="예: Sprint 03 • v1.1.0 (P99 < 30ms)" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1E3A8A]">
        </div>

        <div>
          <label class="block font-medium text-[#475569] mb-1">상세 사양 / 의존성 메모</label>
          <textarea id="modalMemo" rows="3" placeholder="기능 상세 요구사항, 의존성 모듈, API 스키마 변경 사항을 작성하세요." class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] focus:bg-[#FFFFFF] text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#1E3A8A] leading-relaxed"></textarea>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
        <button onclick="closeAddModal()" class="px-4 py-2 rounded-lg text-xs font-medium text-[#64748B] hover:text-[#0F172A] cursor-pointer">취소</button>
        <button onclick="submitNewItem()" class="px-4 py-2 rounded-lg text-xs font-semibold text-[#FFFFFF] bg-[#1E3A8A] hover:bg-[#172554] cursor-pointer">스펙 등록하기</button>
      </div>
    </div>
  </div>

  <script>
    const STORAGE_KEY = 'proto_live_data_' + '${encodeURIComponent(projectName)}';
    const PAGES = ${safePagesJson};
    const DOMAIN_RULES = ${safeDomainRulesJson};
    const DATA_COLUMNS = ${safeDataColumnsJson};
    let activePageIndex = 0;
    let navHistory = [];
    let currentFilter = 'ALL';
    let isPhoneView = ${platform === 'APP' ? 'true' : 'false'};
    let currentDrawerItemId = null;
    let previewState = '${initialPreviewState}';
    let previewRole = '${initialPreviewRole}';
    let activeErrorRuleIdx = 0;

    function escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Domain-derived sample records (from user's current project inputs)
    const DEFAULT_DATA = ${safeDefaultDataJson};

    function showToast(message, type = 'success') {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'px-4 py-2.5 rounded-lg border border-[#E2E8F0] shadow-lg text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto bg-[#0F172A] text-[#FFFFFF]';
      toast.innerHTML = (type === 'success' ? '✓ ' : type === 'delete' ? '✕ ' : 'ℹ ') + escapeHtml(message);
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }, 2500);
    }

    let inMemoryStore = null;

    function getStore() {
      if (inMemoryStore) return inMemoryStore;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
          inMemoryStore = JSON.parse(JSON.stringify(DEFAULT_DATA));
          return inMemoryStore;
        }
        inMemoryStore = JSON.parse(raw);
        return inMemoryStore;
      } catch (e) {
        if (!inMemoryStore) {
          inMemoryStore = JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
        return inMemoryStore;
      }
    }

    // Non-destructive state view selector: Empty State returns 0 records without mutating saved data
    function getEffectiveViewData() {
      if (previewState === 'empty') return [];
      return getStore();
    }

    function saveStore(data) {
      inMemoryStore = data;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // Sandboxed isolation mode active: inMemoryStore maintains state cleanly
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
      const mobileStatus = document.getElementById('mobileStatusBar');
      const mobileBottom = document.getElementById('mobileBottomNav');
      const label = document.getElementById('deviceLabel');
      const icon = document.getElementById('deviceIcon');

      if (isPhoneView) {
        container.className = 'w-full max-w-[420px] rounded-[36px] border-2 border-[#E2E8F0] shadow-xl overflow-hidden bg-[#FFFFFF] flex flex-col transition-all duration-300 min-h-[680px] relative';
        mobileStatus.classList.remove('hidden');
        mobileStatus.classList.add('flex');
        mobileBottom.classList.remove('hidden');
        mobileBottom.classList.add('flex');
        if (label) label.innerText = '데스크톱 뷰로 전환';
        if (icon) icon.innerText = '💻';
      } else {
        container.className = 'w-full max-w-5xl rounded-xl border border-[#E2E8F0] shadow-lg bg-[#FFFFFF] flex flex-col transition-all duration-300 min-h-[680px] relative';
        mobileStatus.classList.add('hidden');
        mobileStatus.classList.remove('flex');
        mobileBottom.classList.add('hidden');
        mobileBottom.classList.remove('flex');
        if (label) label.innerText = '스마트폰 뷰로 전환';
        if (icon) icon.innerText = '📱';
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
            tab.className = 'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap bg-[#EFF6FF] text-[#1E3A8A] transition-all cursor-pointer flex items-center gap-1.5';
          } else {
            tab.className = 'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-all cursor-pointer flex items-center gap-1.5';
          }
        }

        // Update Bottom Nav Tabs
        const bTab = document.getElementById('bottomTab-' + i);
        if (bTab) {
          if (i === idx) {
            bTab.className = 'flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] font-semibold text-[#1E3A8A]';
          } else {
            bTab.className = 'flex flex-col items-center justify-center flex-1 py-1 rounded-lg text-[10px] text-[#64748B]';
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
        badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-[#EFF6FF] text-[#1E3A8A]';
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
        badge.className = 'px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-[#EFF6FF] text-[#1E3A8A]';
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
      showToast('[' + item.title + '] 항목이 업데이트되었습니다.');
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
      if (previewState === 'error') {
        const activeRule = getSimulatedRule();
        showToast('차단됨: ' + (activeRule.then || '도메인 규칙 위반으로 상태 전이가 거부되었습니다.'), 'delete');
        return;
      }
      if (previewState === 'role' && previewRole === 'user') {
        const data = getStore();
        const item = data.find(d => d.id === id);
        if (item?.isAdminRestricted) {
          showToast('접근 거부: Admin / Operator 권한이 필요한 작업입니다.', 'delete');
          return;
        }
      }
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
      if (previewState === 'error') {
        showToast('정책 차단 상태에서는 레코드를 삭제할 수 없습니다.', 'delete');
        return;
      }
      if (previewState === 'role' && previewRole === 'user') {
        showToast('권한 제한: Standard User는 삭제할 수 없습니다. Admin으로 전환하세요.', 'delete');
        return;
      }
      if (confirm('이 항목을 삭제하시겠습니까?')) {
        const data = getStore().filter(d => d.id !== id);
        saveStore(data);
        showToast('항목이 삭제되었습니다.', 'delete');
      }
    }

    function getSimulatedRule() {
      if (DOMAIN_RULES && DOMAIN_RULES.length > 0) {
        const safeIdx = Math.abs(activeErrorRuleIdx) % DOMAIN_RULES.length;
        return DOMAIN_RULES[safeIdx];
      }
      return {
        id: 'default_sim_rule',
        chapterTitle: '도메인 무결성 규약',
        sectionTitle: '비즈니스 검증',
        when: '중복된 상태 요청 또는 필수 제약 조건을 위반한 작업이 시도된 경우',
        then: '작업을 즉시 차단하고 인라인 검증 경고 및 대체 가능한 안전 경로를 안내합니다',
        exception: 'Admin / Operator 권한의 긴급 예외 오버라이드가 활성화된 경우',
        isLocked: false,
      };
    }

    function cycleSimulatedRule(delta) {
      if (!DOMAIN_RULES || DOMAIN_RULES.length <= 1) return;
      activeErrorRuleIdx = (activeErrorRuleIdx + delta + DOMAIN_RULES.length) % DOMAIN_RULES.length;
      renderActiveScreen();
    }

    function triggerAdminOverrideSimulation() {
      const rule = getSimulatedRule();
      showToast('Admin Override 실행됨: ' + (rule.exception || '관리자 예외 권한으로 승인되었습니다.'), 'info');
    }

    function renderPreviewStateBanner() {
      const banner = document.getElementById('previewStateBanner');
      const roleBadge = document.getElementById('headerRoleBadge');
      const headerAddBtn = document.getElementById('headerAddBtn');
      if (!banner) return;

      // Header role badge & add button state
      if (roleBadge) {
        if (previewState === 'role') {
          roleBadge.classList.remove('hidden');
          if (previewRole === 'admin') {
            roleBadge.className = 'px-2 py-1 rounded-md text-[10px] font-sans font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 whitespace-nowrap';
            roleBadge.innerText = 'ROLE: ADMIN';
          } else {
            roleBadge.className = 'px-2 py-1 rounded-md text-[10px] font-sans font-semibold border border-amber-200 bg-amber-50 text-amber-800 whitespace-nowrap';
            roleBadge.innerText = 'ROLE: USER';
          }
        } else {
          roleBadge.classList.add('hidden');
        }
      }

      if (headerAddBtn) {
        if (previewState === 'error') {
          headerAddBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 cursor-not-allowed flex items-center gap-1 whitespace-nowrap shrink-0';
          headerAddBtn.title = '도메인 규칙 위반으로 신규 등록 차단됨';
        } else {
          headerAddBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-medium text-[#FFFFFF] bg-[#1E3A8A] hover:bg-[#172554] transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0';
          headerAddBtn.title = '';
        }
      }

      if (previewState === 'error') {
        const rule = getSimulatedRule();
        const ruleCount = DOMAIN_RULES ? DOMAIN_RULES.length : 0;
        const ruleLabel = ruleCount > 0 ? ('Rule ' + String((activeErrorRuleIdx % ruleCount) + 1).padStart(2, '0') + ' / ' + String(ruleCount).padStart(2, '0')) : 'Simulated Rule';
        const isUserDefined = ruleCount > 0;

        banner.className = 'bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2';
        banner.innerHTML = \`
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-bold bg-rose-100 text-rose-800">BLOCKED · ERROR STATE</span>
              <span class="text-xs font-sans font-semibold text-rose-900 tabular-nums">\${escapeHtml(ruleLabel)}</span>
              \${isUserDefined ? '<span class="text-[11px] text-rose-700">(' + escapeHtml(rule.sectionTitle) + ')</span>' : '<span class="text-[11px] text-rose-700">(기본 시뮬레이션 · Domain Rules 작성 시 실시간 반영)</span>'}
            </div>
            \${ruleCount > 1 ? \`
              <div class="flex items-center gap-1">
                <button onclick="cycleSimulatedRule(-1)" class="px-2 py-0.5 rounded-md bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-sans cursor-pointer">◀ 이전 규칙</button>
                <button onclick="cycleSimulatedRule(1)" class="px-2 py-0.5 rounded-md bg-white hover:bg-rose-100 border border-rose-200 text-rose-800 text-[10px] font-sans cursor-pointer">다음 규칙 ▶</button>
              </div>
            \` : ''}
          </div>
          <div class="space-y-1 text-xs">
            <div class="text-rose-800"><span class="font-sans text-[10px] text-rose-700 font-bold mr-1.5">WHEN</span> \${escapeHtml(rule.when || '조건 트리거 발생')}</div>
            <div class="text-rose-950 font-semibold"><span class="font-sans text-[10px] text-rose-700 font-bold mr-1.5">THEN</span> \${escapeHtml(rule.then || '요청이 차단되고 대체 경로가 표시됩니다')}</div>
            \${rule.exception ? '<div class="text-[#475569] text-[11px]"><span class="font-sans text-[10px] text-[#1E3A8A] font-bold mr-1.5">EXCEPT WHEN</span> ' + escapeHtml(rule.exception) + '</div>' : ''}
          </div>
        \`;
        banner.classList.remove('hidden');
      } else if (previewState === 'role') {
        const overrideRule = DOMAIN_RULES?.find(r => r.exception) || getSimulatedRule();
        if (previewRole === 'admin') {
          banner.className = 'bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3';
          banner.innerHTML = \`
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800">ADMIN / OPERATOR VIEW</span>
                <span class="text-xs font-semibold text-emerald-950">관리자 전용 제어 및 예외 오버라이드 활성화</span>
              </div>
              <p class="text-[11px] text-emerald-800">
                모든 삭제/승인 액션이 잠금 해제되었으며, <span class="font-sans font-semibold">EXCEPT WHEN</span> 예외 정책("\${escapeHtml(overrideRule.exception || '관리자 긴급 승인')}")을 실행할 수 있습니다.
              </p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="triggerAdminOverrideSimulation()" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold cursor-pointer">
                예외 오버라이드 실행
              </button>
            </div>
          \`;
        } else {
          banner.className = 'bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3';
          banner.innerHTML = \`
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-bold bg-amber-100 text-amber-800">STANDARD USER VIEW</span>
                <span class="text-xs font-semibold text-amber-950">일반 사용자 권한 스코프 (제한된 제어)</span>
              </div>
              <p class="text-[11px] text-amber-800">
                삭제·시스템 설정·예외 오버라이드("\${escapeHtml(overrideRule.exception || '관리자 승인 필요')}")가 보안 정책에 의해 숨김 또는 잠금 처리됩니다.
              </p>
            </div>
          \`;
        }
        banner.classList.remove('hidden');
      } else {
        banner.className = 'hidden';
        banner.innerHTML = '';
      }
    }

    function renderEmptyStatePanel(contextLabel) {
      const colPreview = DATA_COLUMNS && DATA_COLUMNS.length > 0
        ? DATA_COLUMNS.slice(0, 4).map(c => '<span class="px-2.5 py-0.5 rounded-md bg-[#FFFFFF] border border-[#E2E8F0] text-[#475569] font-sans text-[10px]">' + escapeHtml(c) + '</span>').join(' ')
        : '<span class="text-[11px] text-[#64748B] font-sans">기본 스키마 준비됨</span>';

      return \`
        <div class="bg-[#F8FAFC] border border-dashed border-[#CBD5E1] rounded-xl p-8 text-center space-y-4">
          <div class="w-11 h-11 rounded-xl bg-[#EFF6FF] text-[#1E3A8A] flex items-center justify-center mx-auto text-base font-sans tabular-nums font-bold">
            0
          </div>
          <div class="space-y-1.5 max-w-md mx-auto">
            <div class="text-[11px] font-sans text-[#1E3A8A] uppercase tracking-wider font-semibold">Empty State · First Launch (0 Records)</div>
            <h3 class="text-sm sm:text-base font-bold text-[#0F172A]">\${escapeHtml(contextLabel)}에 아직 등록된 데이터가 없습니다</h3>
            <p class="text-xs text-[#64748B] leading-relaxed">
              최초 실행 시 사용자에게 빈 화면 대신 시작 가이드를 제공합니다. 아래 버튼을 눌러 첫 번째 레코드를 등록해 보세요.
            </p>
          </div>
          <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            \${colPreview}
          </div>
          <div class="pt-2 flex items-center justify-center gap-2">
            <button onclick="openAddModal()" class="px-4 py-2 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold cursor-pointer">
              + 첫 번째 레코드 생성하기
            </button>
          </div>
        </div>
      \`;
    }

    // =========================================================================
    // DYNAMIC SCREEN SYNTHESIS RENDERERS
    // =========================================================================

    function renderActiveScreen() {
      const container = document.getElementById('dynamicScreenView');
      if (!container) return;
      renderPreviewStateBanner();
      const currentPage = PAGES[activePageIndex] || PAGES[0];
      const data = getEffectiveViewData();

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
          renderFormView(container);
          break;
        case 'TABLE':
        default:
          renderTableView(container, data);
          break;
      }
    }

    // 1. DASHBOARD VIEW SYNTHESIS
    function renderDashboardView(container, data) {
      const total = data.length;
      const pending = data.filter(d => d.status === '대기').length;
      const progress = data.filter(d => d.status === '진행중').length;
      const done = data.filter(d => d.status === '완료').length;
      const doneRate = total > 0 ? Math.round((done / total) * 100) : 0;
      const isUserRole = previewState === 'role' && previewRole === 'user';
      const isErrorState = previewState === 'error';

      container.innerHTML = \`
        <!-- Interactive KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div onclick="navigateToFilter('TABLE', 'ALL')" class="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A]/40 cursor-pointer transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-sans text-[#64748B]">총 기능 스펙</span>
              <span class="text-[10px] text-[#94A3B8] font-sans">전체 ➔</span>
            </div>
            <div class="text-2xl font-bold font-sans tabular-nums text-[#0F172A] mt-1">\${total} <span class="text-xs font-normal text-[#64748B]">개</span></div>
          </div>

          <div onclick="navigateToFilter('TABLE', '대기')" class="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A]/40 cursor-pointer transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-sans text-[#64748B]">백로그 / 대기</span>
              <span class="text-[10px] text-[#94A3B8] font-sans">필터 ➔</span>
            </div>
            <div class="text-2xl font-bold font-sans tabular-nums text-[#0F172A] mt-1">\${pending} <span class="text-xs font-normal text-[#64748B]">개</span></div>
          </div>

          <div onclick="navigateToFilter('KANBAN', '진행중')" class="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A]/40 cursor-pointer transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-sans text-[#64748B]">스프린트 진행</span>
              <span class="text-[10px] text-[#94A3B8] font-sans">칸반 ➔</span>
            </div>
            <div class="text-2xl font-bold font-sans tabular-nums text-[#0F172A] mt-1">\${progress} <span class="text-xs font-normal text-[#64748B]">개</span></div>
          </div>

          <div onclick="navigateToFilter('ANALYTICS', '완료')" class="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#1E3A8A]/40 cursor-pointer transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-sans text-[#64748B]">스펙 배포 완료율</span>
              <span class="text-[10px] text-[#94A3B8] font-sans">통계 ➔</span>
            </div>
            <div class="text-2xl font-bold font-sans tabular-nums text-[#1E3A8A] mt-1">\${doneRate}%</div>
          </div>
        </div>

        \${total === 0 ? renderEmptyStatePanel('대시보드') : \`
          <!-- Progress Distribution Bar -->
          <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <div class="flex items-center justify-between text-xs font-medium text-[#0F172A]">
              <span>스프린트 파이프라인 진척도</span>
              <span class="text-[11px] font-sans tabular-nums text-[#64748B]">배포 완료 \${done}건 / 전체 \${total}건</span>
            </div>
            <div class="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden flex">
              <div style="width: \${total > 0 ? (pending/total)*100 : 0}%; background-color: #94A3B8;" title="대기: \${pending}건"></div>
              <div style="width: \${total > 0 ? (progress/total)*100 : 0}%; background-color: #3B82F6;" title="진행: \${progress}건"></div>
              <div style="width: \${total > 0 ? (done/total)*100 : 0}%; background-color: #1E3A8A;" title="완료: \${done}건"></div>
            </div>
            <div class="flex items-center gap-4 text-[11px] font-sans tabular-nums text-[#64748B] pt-1">
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#94A3B8]"></span> 백로그 (\${pending})</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#3B82F6]"></span> 구현 중 (\${progress})</span>
              <span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-[#1E3A8A]"></span> 배포 완료 (\${done})</span>
            </div>
          </div>

          <!-- Recent Priority Feed with Item Drawer Integration -->
          <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-xs sm:text-sm font-bold text-[#0F172A]">핵심 엔지니어링 스펙 & 백로그 피드</h3>
                <p class="text-[11px] text-[#64748B]">항목을 클릭하면 상세 수정 드로어가 열립니다.</p>
              </div>
              <button onclick="openAddModal()" class="text-xs font-medium text-[#1E3A8A] hover:underline cursor-pointer">+ 스펙 추가</button>
            </div>
            <div class="space-y-2">
              \${data.slice(0, 4).map((item, idx) => {
                const lockedForUser = isUserRole && item.isAdminRestricted;
                const blockedInError = isErrorState && idx === 0;
                return \`
                <div onclick="openItemDetail('\${item.id}')" class="p-3 rounded-lg border transition-all flex items-center justify-between gap-2 cursor-pointer \${blockedInError ? 'bg-rose-50 border-rose-200' : lockedForUser ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-65' : 'bg-[#FFFFFF] hover:border-[#CBD5E1] border-[#E2E8F0]'}">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-medium \${blockedInError ? 'bg-rose-100 text-rose-800' : 'bg-[#EFF6FF] text-[#1E3A8A]'}">\${blockedInError ? '차단됨' : item.status}</span>
                      <span class="text-xs font-semibold text-[#0F172A] truncate">\${escapeHtml(item.title)}</span>
                      \${item.amount ? \`<span class="text-[11px] font-sans text-[#64748B]">(\${escapeHtml(item.amount)})</span>\` : ''}
                      \${lockedForUser ? '<span class="text-[10px] font-sans text-amber-700">🔒 Admin Only</span>' : ''}
                    </div>
                    <p class="text-[11px] text-[#64748B] mt-1 line-clamp-1">\${escapeHtml(item.memo)}</p>
                  </div>
                  <button onclick="toggleItemStatus('\${item.id}', event)" class="text-xs px-2.5 py-1 rounded-md border \${blockedInError ? 'border-rose-200 bg-rose-100 text-rose-800 cursor-not-allowed' : lockedForUser ? 'border-amber-200 bg-amber-50 text-amber-800 cursor-not-allowed' : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A] hover:bg-[#EFF6FF] cursor-pointer'} font-medium shrink-0">
                    \${blockedInError ? '차단됨' : lockedForUser ? '권한 필요' : '상태전환'}
                  </button>
                </div>
              \`; }).join('')}
            </div>
          </div>
        \`}
      \`;
    }

    // 2. KANBAN VIEW SYNTHESIS
    function renderKanbanView(container, data) {
      if (data.length === 0) {
        container.innerHTML = renderEmptyStatePanel('진행 칸반');
        return;
      }
      const isUserRole = previewState === 'role' && previewRole === 'user';
      const columns = [
        { id: '대기', title: '백로그 / 요구사항' },
        { id: '진행중', title: '스프린트 구현 중' },
        { id: '완료', title: '배포 및 테스트 완료' }
      ];

      container.innerHTML = \`
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          \${columns.map(col => {
            const colItems = data.filter(d => d.status === col.id);
            return \`
              <div class="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3 flex flex-col min-h-[420px]">
                <div class="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                  <span class="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">\${col.title}</span>
                  <span class="text-[11px] font-sans tabular-nums font-medium px-2 py-0.5 rounded-md bg-[#FFFFFF] text-[#1E3A8A] border border-[#E2E8F0]">\${colItems.length}</span>
                </div>
                <div class="flex-1 space-y-2 overflow-y-auto custom-scroll pr-1">
                  \${colItems.length === 0 ? \`
                    <div class="py-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#CBD5E1] rounded-lg">등록된 스펙이 없습니다</div>
                  \` : colItems.map(item => \`
                    <div onclick="openItemDetail('\${item.id}')" class="p-3 bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] hover:border-[#1E3A8A]/40 transition-all space-y-2 cursor-pointer">
                      <div class="flex items-start justify-between gap-1">
                        <h4 class="text-xs font-semibold text-[#0F172A] leading-snug">\${escapeHtml(item.title)}</h4>
                        \${isUserRole ? '' : \`<button onclick="deleteItem('\${item.id}', event)" class="text-[#94A3B8] hover:text-rose-600 text-xs">✕</button>\`}
                      </div>
                      <p class="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">\${escapeHtml(item.memo)}</p>
                      <div class="flex items-center justify-between pt-1.5 border-t border-[#F1F5F9] text-[10px] font-sans text-[#64748B]">
                        <span>\${escapeHtml(item.amount || item.contact || '상세보기')}</span>
                        <button onclick="toggleItemStatus('\${item.id}', event)" class="px-2 py-0.5 rounded-md bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1E3A8A] border border-[#E2E8F0] cursor-pointer">
                          다음 ➔
                        </button>
                      </div>
                    </div>
                  \`).join('')}
                </div>
                <button onclick="openAddModal()" class="w-full mt-2 py-1.5 rounded-lg border border-dashed border-[#CBD5E1] hover:border-[#1E3A8A] text-xs font-medium text-[#64748B] hover:text-[#1E3A8A] transition-colors cursor-pointer">
                  + 스펙 카드 추가
                </button>
              </div>
            \`;
          }).join('')}
        </div>
      \`;
    }

    // 3. TABLE / LIST VIEW SYNTHESIS
    function renderTableView(container, data) {
      if (data.length === 0) {
        container.innerHTML = renderEmptyStatePanel('데이터 목록');
        return;
      }
      const isUserRole = previewState === 'role' && previewRole === 'user';
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
        <div class="flex flex-col sm:flex-row gap-2 items-center justify-between bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
          <div class="relative w-full sm:w-64">
            <input 
              id="searchInput" 
              type="text" 
              value="\${escapeHtml(q)}"
              placeholder="스펙명, 엔지니어, 메모 검색..." 
              oninput="renderActiveScreen()"
              class="w-full pl-7 pr-3 py-1.5 text-xs bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#1E3A8A]"
            />
            <span class="absolute left-2.5 top-1.5 text-xs text-[#94A3B8]">🔍</span>
          </div>

          <div class="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            <button onclick="setFilter('ALL')" class="px-2.5 py-1 text-xs font-sans tabular-nums font-medium rounded-lg \${currentFilter === 'ALL' ? 'bg-[#1E3A8A] text-[#FFFFFF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]'}">전체 (\${data.length})</button>
            <button onclick="setFilter('대기')" class="px-2.5 py-1 text-xs font-sans font-medium rounded-lg \${currentFilter === '대기' ? 'bg-[#1E3A8A] text-[#FFFFFF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]'}">대기</button>
            <button onclick="setFilter('진행중')" class="px-2.5 py-1 text-xs font-sans font-medium rounded-lg \${currentFilter === '진행중' ? 'bg-[#1E3A8A] text-[#FFFFFF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]'}">진행중</button>
            <button onclick="setFilter('완료')" class="px-2.5 py-1 text-xs font-sans font-medium rounded-lg \${currentFilter === '완료' ? 'bg-[#1E3A8A] text-[#FFFFFF] font-semibold' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#FFFFFF]'}">완료</button>
          </div>
        </div>

        <!-- Table Grid -->
        <div class="bg-[#FFFFFF] rounded-xl border border-[#E2E8F0] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-sans uppercase text-[11px]">
                  <th class="p-3">기능 명세 / 엔드포인트</th>
                  <th class="p-3">상태</th>
                  <th class="p-3">담당 엔지니어</th>
                  <th class="p-3">버전 / 지표</th>
                  <th class="p-3">구현 메모</th>
                  <th class="p-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F1F5F9]">
                \${list.length === 0 ? \`
                  <tr>
                    <td colspan="6" class="p-8 text-center text-xs text-[#64748B] font-sans">일치하는 기능 명세 데이터가 없습니다.</td>
                  </tr>
                \` : list.map(item => \`
                  <tr onclick="openItemDetail('\${item.id}')" class="hover:bg-[#F8FAFC] transition-colors cursor-pointer">
                    <td class="p-3 font-medium text-[#0F172A]">\${escapeHtml(item.title)}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-medium bg-[#EFF6FF] text-[#1E3A8A]">\${item.status}</span>
                    </td>
                    <td class="p-3 text-[#475569] font-sans text-[11px]">\${escapeHtml(item.contact || '-')}</td>
                    <td class="p-3 font-sans tabular-nums text-[#64748B] text-[11px]">\${escapeHtml(item.amount || '-')}</td>
                    <td class="p-3 text-[#64748B] max-w-xs truncate text-[11px]">\${escapeHtml(item.memo)}</td>
                    <td class="p-3 text-right space-x-1 whitespace-nowrap" onclick="event.stopPropagation()">
                      <button onclick="toggleItemStatus('\${item.id}', event)" class="px-2 py-1 rounded-md bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1E3A8A] font-medium border border-[#E2E8F0] cursor-pointer">상태전환</button>
                      \${isUserRole ? '<span class="px-2 py-1 text-[10px] font-sans text-amber-700">🔒 Admin</span>' : \`<button onclick="deleteItem('\${item.id}', event)" class="px-2 py-1 rounded-md text-[#94A3B8] hover:text-rose-600 font-medium cursor-pointer">삭제</button>\`}
                    </td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      \`;
    }

    // 4. TIMELINE / MILESTONES VIEW SYNTHESIS
    function renderTimelineView(container, data) {
      if (data.length === 0) {
        container.innerHTML = renderEmptyStatePanel('릴리스 타임라인');
        return;
      }
      const milestones = [
        { time: '09:00', label: 'Sprint-01', desc: '핵심 도메인 스키마 및 DB 마이그레이션' },
        { time: '10:30', label: 'Sprint-02', desc: 'OAuth 2.0 세션 및 JWT 인증 게이트웨이' },
        { time: '13:00', label: 'Sprint-03', desc: '반응형 인터랙티브 캔버스 & 상태 동기화' },
        { time: '15:00', label: 'Sprint-04', desc: 'Stripe 결제 웹훅 연동 및 구독 플랜 로직' },
        { time: '17:00', label: 'Sprint-05', desc: 'E2E 통합 테스트 및 클라우드 배포 파이프라인' }
      ];

      container.innerHTML = \`
        <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-4">
          <div class="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-[#0F172A]">🚀 스프린트 릴리스 & 엔지니어링 마일스톤</span>
              <span class="text-xs px-2 py-0.5 rounded-md bg-[#EFF6FF] text-[#1E3A8A] font-sans">Active Pipeline</span>
            </div>
            <button onclick="openAddModal()" class="px-3 py-1.5 rounded-lg bg-[#1E3A8A] text-[#FFFFFF] text-xs font-medium cursor-pointer hover:bg-[#172554]">
              + 마일스톤 추가
            </button>
          </div>

          <div class="space-y-2.5">
            \${milestones.map((ms, idx) => {
              const matchedItem = data[idx % data.length];
              return \`
                <div onclick="openItemDetail('\${matchedItem.id}')" class="flex items-start gap-3 p-3 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:border-[#1E3A8A]/40 cursor-pointer transition-all">
                  <div class="w-16 font-sans tabular-nums text-xs font-semibold text-[#1E3A8A] pt-1 shrink-0">\${ms.time}</div>
                  <div class="flex-1 space-y-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="px-2 py-0.5 rounded-md text-[10px] font-sans font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">\${ms.label}</span>
                      <h4 class="text-xs font-semibold text-[#0F172A] truncate">\${escapeHtml(matchedItem.title)}</h4>
                      <span class="text-[11px] text-[#64748B] font-sans">(\${escapeHtml(matchedItem.contact || '엔지니어')})</span>
                    </div>
                    <p class="text-xs text-[#64748B] truncate">\${escapeHtml(ms.desc)} · \${escapeHtml(matchedItem.memo)}</p>
                  </div>
                  <button onclick="toggleItemStatus('\${matchedItem.id}', event)" class="text-xs px-2.5 py-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#475569] hover:text-[#1E3A8A] font-medium cursor-pointer shrink-0">
                    상태변경
                  </button>
                </div>
              \`;
            }).join('')}
          </div>
        </div>
      \`;
    }

    // 5. CALCULATOR / ARCHITECTURE ESTIMATE VIEW SYNTHESIS
    function renderCalculatorView(container, data) {
      container.innerHTML = \`
        <div class="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] space-y-5">
          <div class="border-b border-[#E2E8F0] pb-3">
            <h3 class="text-sm font-bold text-[#0F172A]">💡 기술 스택 & 기능 명세 견적 시뮬레이터</h3>
            <p class="text-xs text-[#64748B] mt-0.5">선택한 기능 모듈에 따라 개발 일정과 예상 리소스가 실시간 산출됩니다.</p>
          </div>

          <div class="space-y-2.5 text-xs">
            <label class="flex items-center justify-between p-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] cursor-pointer hover:border-[#1E3A8A]/40">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt1" checked onchange="recalculateQuote()" class="w-4 h-4 accent-[#1E3A8A]">
                <div>
                  <div class="font-semibold text-[#0F172A]">코어 풀스택 아키텍처 (Next.js / Vite SPA + Edge Runtime)</div>
                  <div class="text-[11px] text-[#64748B]">TypeScript 타입 안정성, 레이아웃 반응형 및 로컬 캐시 엔진</div>
                </div>
              </div>
              <span class="font-sans tabular-nums font-medium text-[#1E3A8A]">2,500,000원 (2주)</span>
            </label>

            <label class="flex items-center justify-between p-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] cursor-pointer hover:border-[#1E3A8A]/40">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt2" checked onchange="recalculateQuote()" class="w-4 h-4 accent-[#1E3A8A]">
                <div>
                  <div class="font-semibold text-[#0F172A]">실시간 WebSocket / SSE 데이터 스트리밍 & 상태 동기화</div>
                  <div class="text-[11px] text-[#64748B]">P99 < 35ms 저지연 양방향 메시징 및 재연결 백프레셔 제어</div>
                </div>
              </div>
              <span class="font-sans tabular-nums font-medium text-[#1E3A8A]">1,200,000원 (1주)</span>
            </label>

            <label class="flex items-center justify-between p-3.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] cursor-pointer hover:border-[#1E3A8A]/40">
              <div class="flex items-center gap-2.5">
                <input type="checkbox" id="calcOpt3" onchange="recalculateQuote()" class="w-4 h-4 accent-[#1E3A8A]">
                <div>
                  <div class="font-semibold text-[#0F172A]">엔터프라이즈 RBAC 보안 인증 및 규정 준수 감사 로깅</div>
                  <div class="text-[11px] text-[#64748B]">JWT 세션 무중단 로테이션, 변조 불가 감사 로그 스트림</div>
                </div>
              </div>
              <span class="font-sans tabular-nums font-medium text-[#1E3A8A]">800,000원 (3일)</span>
            </label>
          </div>

          <!-- Total Calculation Bar -->
          <div class="p-4 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-between">
            <div>
              <span class="text-xs text-[#64748B] font-sans">예상 개발 예산 산출 (VAT 별도)</span>
              <div id="quoteTotalDisplay" class="text-2xl font-bold text-[#1E3A8A] font-sans tabular-nums mt-0.5">3,700,000원</div>
            </div>
            <button onclick="submitQuoteOrder()" class="px-5 py-2.5 rounded-lg bg-[#1E3A8A] text-[#FFFFFF] text-xs font-semibold hover:bg-[#172554] cursor-pointer">
              기능 개발 명세 확정 ➔
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
            <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <span class="text-xs font-sans text-[#64748B]">월간 API 처리량</span>
              <div class="text-2xl font-bold font-sans tabular-nums text-[#0F172A] mt-1">\${(total * 460).toLocaleString()} k req</div>
              <span class="text-[11px] font-sans text-[#1E3A8A]">↑ 전월 대비 24% 증가</span>
            </div>
            <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <span class="text-xs font-sans text-[#64748B]">P99 응답 레이턴시</span>
              <div class="text-2xl font-bold font-sans tabular-nums text-[#1E3A8A] mt-1">38 ms</div>
              <span class="text-[11px] font-sans text-[#64748B]">↓ 캐시 최적화로 65% 개선</span>
            </div>
            <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <span class="text-xs font-sans text-[#64748B]">서비스 가용성 (SLA)</span>
              <div class="text-2xl font-bold font-sans tabular-nums text-[#0F172A] mt-1">99.98%</div>
              <span class="text-[11px] font-sans text-[#64748B]">★ 엔터프라이즈 SLA 충족</span>
            </div>
          </div>

          <!-- Bar Chart Simulation -->
          <div class="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
            <h4 class="text-xs font-bold text-[#0F172A]">주간별 배포 파이프라인 통과율 & 테스트 커버리지</h4>
            <div class="space-y-2.5 text-xs">
              <div>
                <div class="flex justify-between text-[11px] font-sans tabular-nums text-[#64748B] mb-1"><span>Sprint-01 (Core Schema)</span><span>94%</span></div>
                <div class="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div class="h-full bg-[#1E3A8A]" style="width: 94%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] font-sans tabular-nums text-[#64748B] mb-1"><span>Sprint-02 (API Gateway)</span><span>98%</span></div>
                <div class="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div class="h-full bg-[#1E3A8A]" style="width: 98%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] font-sans tabular-nums text-[#64748B] mb-1"><span>Sprint-03 (SSE Stream)</span><span>91%</span></div>
                <div class="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div class="h-full bg-[#3B82F6]" style="width: 91%"></div></div>
              </div>
              <div>
                <div class="flex justify-between text-[11px] font-sans tabular-nums text-[#64748B] mb-1"><span>Sprint-04 (Stripe Billing)</span><span>88%</span></div>
                <div class="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden"><div class="h-full bg-[#64748B]" style="width: 88%"></div></div>
              </div>
            </div>
          </div>
        </div>
      \`;
    }

    // 7. FORM VIEW SYNTHESIS
    function renderFormView(container) {
      container.innerHTML = \`
        <div class="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] space-y-4 max-w-xl mx-auto">
          <div class="border-b border-[#E2E8F0] pb-3">
            <h3 class="text-sm font-bold text-[#0F172A]">📝 신규 기능 스펙 & 엔드포인트 명세 등록</h3>
            <p class="text-xs text-[#64748B] mt-0.5">작성된 엔지니어링 항목은 실시간 대시보드와 칸반 파이프라인에 즉시 반영됩니다.</p>
          </div>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-medium text-[#475569] mb-1">기능명 / 엔드포인트 <span class="text-[#1E3A8A]">*</span></label>
              <input id="inlineFormTitle" type="text" placeholder="예: [FEAT] 엔터프라이즈 SSO SAML 2.0 연동" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A]">
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-medium text-[#475569] mb-1">담당 엔지니어</label>
                <input id="inlineFormContact" type="text" placeholder="auth-lead@service.io" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A]">
              </div>
              <div>
                <label class="block font-medium text-[#475569] mb-1">버전 / 스프린트</label>
                <input id="inlineFormAmount" type="text" placeholder="v1.3.0 / Sprint-04" class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A] font-sans tabular-nums">
              </div>
            </div>
            <div>
              <label class="block font-medium text-[#475569] mb-1">상세 구현 요구사항 및 메모</label>
              <textarea id="inlineFormMemo" rows="4" placeholder="의존성 패키지, 보안 고려사항, API 입력/출력 인터페이스 규격을 적어주세요." class="w-full p-2.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#0F172A] text-xs focus:outline-none focus:border-[#1E3A8A] leading-relaxed"></textarea>
            </div>
            <button onclick="submitInlineForm()" class="w-full py-2.5 rounded-lg bg-[#1E3A8A] text-[#FFFFFF] text-xs font-semibold hover:bg-[#172554] cursor-pointer">
              스펙 등록 완료하기 ➔
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
      if (document.getElementById('calcOpt1')?.checked) sum += 2500000;
      if (document.getElementById('calcOpt2')?.checked) sum += 1200000;
      if (document.getElementById('calcOpt3')?.checked) sum += 800000;
      const disp = document.getElementById('quoteTotalDisplay');
      if (disp) disp.innerText = sum.toLocaleString() + '원';
    }

    function submitQuoteOrder() {
      const sumText = document.getElementById('quoteTotalDisplay')?.innerText || '3,700,000원';
      const newItem = {
        id: 'item-' + Date.now(),
        title: '[ESTIMATE] 웹 풀스택 아키텍처 스펙 확정 (' + sumText + ')',
        contact: 'arch-lead@service.io',
        status: '진행중',
        amount: sumText,
        memo: '기술 스택 시뮬레이터를 통해 산출된 개발 일정 및 모듈 패키지 견적',
        createdAt: new Date().toISOString()
      };
      const data = getStore();
      data.unshift(newItem);
      saveStore(data);
      showToast('기능 개발 명세가 대시보드에 등록되었습니다!');
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
      if (previewState === 'error') {
        const activeRule = getSimulatedRule();
        showToast('차단됨: ' + (activeRule.then || '도메인 규칙 위반으로 신규 등록이 차단되었습니다.'), 'delete');
        return;
      }
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

    // Keyboard navigation (ESC closes drawers/modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailDrawer();
        closeAddModal();
      }
    });

    // Real-time synchronization pulse & Preview State Switcher listener
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'GOGUMA_TRIGGER_PULSE') {
        const target = (e.data.targetId ? document.getElementById(e.data.targetId) : null) || document.getElementById('prototypeContainer');
        if (target) {
          target.classList.remove('pulse-glow');
          void target.offsetWidth;
          target.classList.add('pulse-glow');
          setTimeout(() => target.classList.remove('pulse-glow'), 1300);
        }
      } else if (e.data && e.data.type === 'GOGUMA_SET_PREVIEW_STATE') {
        previewState = e.data.previewState || 'default';
        previewRole = e.data.previewRole || 'user';
        renderActiveScreen();
      }
    });

    // Initialize on page load (robust readyState detection for iframe srcDoc)
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        renderActiveScreen();
      });
    } else {
      renderActiveScreen();
    }
  </script>
</body>
</html>`;
}
