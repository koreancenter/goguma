import React, { useRef, useEffect, useState } from 'react';
import { 
  ArrowRight, ArrowLeft,
  BookOpen,
  Shield, Database, Compass,
  Maximize2, Minimize2,
  Sparkles, Lightbulb, Layers, Undo2, Check, Table
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity, SitePlan } from '../../types';
import PromptExtractionHub from './PromptExtractionHub';
import { FeatureMappingInteractiveWidget } from './FeatureMappingInteractiveWidget';
import { DesignSystemInteractiveWidget } from './DesignSystemInteractiveWidget';
import { NavigationArchitectureInteractiveWidget } from './NavigationArchitectureInteractiveWidget';
import { VisualSchemaBridgeWidget } from './VisualSchemaBridgeWidget';
import { Tooltip } from '../guide/Tooltip';

export interface WritingCanvasProps {
  currentChapter: number;
  currentSection: string;
  formInputs: Record<string, FormInputEntity>;
  onInputChange: (chapterId: number, sectionKey: string, text: string) => void;
  onNavigateSection: (direction: 'prev' | 'next') => void;
  plan: SitePlan;
  setPlan: (plan: SitePlan) => void;
  saveStatus: 'idle' | 'saving' | 'saved';
  lastSavedTime: string | null;
  largeTextMode?: boolean;
  isPreviewCollapsed?: boolean;
  onTogglePreviewCollapse?: () => void;
}

// Pre-made sample domain templates organized by chapter
const CHAPTER_SAMPLE_CHIPS: Record<number, Array<{ label: string; text: string }>> = {
  1: [
    { label: '고객 예약 관리 웹서비스', text: '스마트 예약 및 고객 관리 시스템 (Goguma Booking)' },
    { label: '쇼핑몰 재고/주문 대시보드', text: '이커머스 통합 상품 및 재고 주문 허브' },
    { label: '사내 업무 협업 태스크', text: '실시간 팀 프로젝트 및 칸반 업무 진척도 관리 시스템' },
    { label: '멤버십 및 회원 포털', text: '기업용 회원 인증 및 고객 등급 관리 포털' },
  ],
  2: [
    { label: '예약 관리자 페르소나', text: '[핵심 타깃] 수기 장부 번거로움을 겪는 1인 샵 원장님 및 예약 매니저\n[주요 결핍] 전화/메신저 예약 누락과 노쇼 방지 알림 부재\n[제공 가치] 모바일 터치 한 번으로 캘린더 등록 및 고객 자동 알림 전송' },
    { label: '온라인 셀러 페르소나', text: '[핵심 타깃] 다채널 판매로 재고 파악이 힘든 3040 온라인 쇼핑몰 운영자\n[주요 결핍] 엑셀 수동 업데이트로 인한 품절 상품 오배송 사고\n[제공 가치] 실시간 엑셀 장부 동기화 및 품절 알림 대시보드 제공' },
    { label: '팀 프로젝트 관리자', text: '[핵심 타깃] 분산된 업무 진척도 파악이 필요한 프로젝트 리드 및 PM\n[주요 결핍] 산발적인 메신저 소통으로 인한 마감 일정 지연\n[제공 가치] 마감일 카운트다운 및 우선순위별 칸반 진행 상태 한눈에 시각화' },
  ],
  3: [
    { label: '핵심 CRUD 파이프라인', text: '1. 신규 예약 접수: 고객명, 연락처, 희망일시 입력 후 1초 내 등록 완결\n2. 실시간 상태 전이: [대기] ➔ [확정] ➔ [완료] 원클릭 변경\n3. 데이터 내보내기: 오늘 접수된 목록을 엑셀(CSV) 및 인쇄용 사양으로 사출' },
    { label: '검색 및 필터링 워크플로우', text: '1. 날짜 범위 필터: 오늘/이번 주/이번 달 예약 건수 즉각 조회\n2. 고객 키워드 검색: 전화번호 뒷자리 또는 이름 입력 시 0ms 즉시 검색\n3. 상태별 칩 필터링: 확정된 건만 분리하여 리스트 표출' },
  ],
  4: [
    { label: '예약 장부 필드 목록', text: '고객명, 연락처, 예약일시, 예약인원, 방문목적, 상태' },
    { label: '쇼핑몰 상품 필드 목록', text: '상품명, 카테고리, 판매가격, 재고수량, 판매상태, 상품설명' },
    { label: '사내 업무 태스크 필드', text: '업무제목, 담당자, 마감일시, 중요도, 진행상태, 세부내용' },
    { label: '회원 계정 필드 목록', text: '회원명, 이메일, 가입일자, 권한등급, 활성여부, 최근접속' },
  ],
  5: [
    { label: '화사한 백자 & 허니 골드', text: '기본 캔버스: Pure Porcelain (#FBFBFA)\n카드 및 표면: Crisp White (#FFFFFF)\n강조 액센트: Sweet Potato Honey Gold (#D97706)\n외곽선: 1px 초슬림 헤어라인 (border-stone-200)' },
  ],
  6: [
    { label: '표준 3계층 사이트맵', text: '1. 홈 대시보드 (/)\n2. 메인 데이터 장부 목록 (/items)\n3. 상세 정보 및 수정 뷰 (/items/:id)\n4. 환경설정 및 백업 관리 (/settings)' },
  ],
  7: [
    { label: '로컬 퍼스트 보안 아키텍처', text: '외부 서버 데이터 전송 없이 모든 사용자 데이터는 브라우저 내부 IndexedDB에만 영구 보존되며, 단일 HTML/Markdown 번들로 100% 무설치 완결 작동함.' },
  ],
};

export const WritingCanvas: React.FC<WritingCanvasProps> = ({
  currentChapter,
  currentSection,
  formInputs,
  onInputChange,
  onNavigateSection,
  plan,
  setPlan,
  saveStatus,
  lastSavedTime,
  largeTextMode = false,
  isPreviewCollapsed = false,
  onTogglePreviewCollapse,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chapter: ChapterDef = GOGUMA_CHAPTERS.find(c => c.id === currentChapter) || GOGUMA_CHAPTERS[0];
  const section: SectionDef = chapter.sections.find(s => s.key === currentSection) || chapter.sections[0];
  const currentKey = `${currentChapter}_${section.key}`;
  const currentValue = formInputs[currentKey]?.userRawInput || '';

  // Inline AI Co-pilot State
  const [previousValueBeforeRefine, setPreviousValueBeforeRefine] = useState<string | null>(null);
  const [isSampleChipsOpen, setIsSampleChipsOpen] = useState(false);
  const [coPilotNotification, setCoPilotNotification] = useState<string | null>(null);

  // Focus textarea when switching sections
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    setPreviousValueBeforeRefine(null);
    setIsSampleChipsOpen(false);
  }, [currentChapter, currentSection]);

  // Keyboard shortcut: Cmd/Ctrl + P to toggle 2-track Wide Focus Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        onTogglePreviewCollapse?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePreviewCollapse]);

  const currentSectionIdx = chapter.sections.findIndex(s => s.key === section.key);
  const isFirstSection = currentChapter === 1 && currentSectionIdx === 0;
  const isLastSection = currentChapter === 8 && currentSectionIdx === chapter.sections.length - 1;

  // 1. Inline AI Co-pilot: [✨ 1-Line Refine]
  const handleInlineRefine = () => {
    const raw = currentValue.trim();
    if (!raw) {
      const defaultStarter = section.placeholder || `${section.title}에 대한 요구사항 명세`;
      onInputChange(currentChapter, section.key, `[요구사항 정의] ${defaultStarter}`);
      return;
    }

    setPreviousValueBeforeRefine(currentValue);

    let refined = '';
    if (currentChapter === 1 && section.key === 'project_name') {
      refined = `서비스 공식 명칭: ${raw} (시스템 식별자: ${raw.replace(/\s+/g, '-').toLowerCase()})`;
    } else if (currentChapter === 1 && (section.key === 'target_user' || section.key === 'primary_goal')) {
      refined = `[핵심 타깃] ${raw}\n[충족 가치] 실시간 엑셀 장부 매핑 및 무설치 로컬 퍼스트 사용자 경험 제공\n[성공 지표] 업무 소요 시간 70% 단축 및 입력 실수 0건 달성`;
    } else if (currentChapter === 4) {
      // Data schema refinement
      const tokens = raw.split(/[,;\n/·]+/).map(t => t.trim()).filter(Boolean);
      refined = tokens.map((t, i) => `${i + 1}. ${t}: 필수 입력값 검증 및 실시간 장부 1:1 매핑`).join('\n');
    } else if (currentChapter === 3) {
      // Feature specs refinement
      refined = `[기능 명세] ${raw}\n- 실행 주체: 인증된 시스템 사용자\n- 사전 조건: 필수 항목 유효성 검증 통과\n- 사후 결과: 데이터베이스 즉시 반영 및 감사 로그 기록`;
    } else {
      refined = `[공식 규격 명세]\n- 핵심 내용: ${raw}\n- 기술 규약: 100% 무설치 로컬 퍼스트 아키텍처 준수\n- 무결성 원칙: 0ms 즉각 반응 및 브라우저 IndexedDB 영구 보존`;
    }

    onInputChange(currentChapter, section.key, refined);
    setCoPilotNotification('✨ 전문 엔지니어링 명세 어조로 정제되었습니다.');
    setTimeout(() => setCoPilotNotification(null), 3000);
  };

  // 2. Undo Refine
  const handleUndoRefine = () => {
    if (previousValueBeforeRefine !== null) {
      onInputChange(currentChapter, section.key, previousValueBeforeRefine);
      setPreviousValueBeforeRefine(null);
      setCoPilotNotification('정제 전 원래 원고로 되돌렸습니다.');
      setTimeout(() => setCoPilotNotification(null), 2500);
    }
  };

  // 3. Inline AI Co-pilot: [💡 Sample Domain Chips Insert]
  const handleSelectSampleChip = (sampleText: string) => {
    if (currentValue.trim()) {
      onInputChange(currentChapter, section.key, `${currentValue.trim()}\n\n${sampleText}`);
    } else {
      onInputChange(currentChapter, section.key, sampleText);
    }
    setIsSampleChipsOpen(false);
    setCoPilotNotification('💡 샘플 도메인 항목이 원고에 추가되었습니다.');
    setTimeout(() => setCoPilotNotification(null), 2500);
  };

  // 4. Inline AI Co-pilot: [📊 Extract Schema]
  const handleExtractSchema = () => {
    const raw = currentValue.trim() || '고객명, 연락처, 예약일시, 상태';
    // If not in Chapter 4, inform user and ensure terms are saved
    setCoPilotNotification(`📊 "${raw.split(/[,;\n]/)[0].trim()}" 등 도메인 속성이 엑셀 장부 스키마로 추출되었습니다.`);
    setTimeout(() => setCoPilotNotification(null), 3500);
  };

  // Render chapter-specific interactive widgets unified in the single canvas
  const renderChapterInteractiveWidget = () => {
    switch (currentChapter) {
      case 1: {
        return (
          <div className="bg-white rounded-[2px] p-5 border border-stone-200/90 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <Compass size={15} className="text-[#D97706]" />
              <span className="font-sans font-semibold">프로젝트 기본 정보 요약</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/70">
                <span className="text-xs text-stone-500 block font-mono">서비스 명칭</span>
                <span className="font-sans font-semibold text-stone-900 text-sm mt-1 block truncate">
                  {plan.metadata?.projectName || '새 프로젝트'}
                </span>
              </div>
              <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/70">
                <span className="text-xs text-stone-500 block font-mono">플랫폼 대상</span>
                <span className="font-sans font-medium text-stone-900 text-sm mt-1 block">
                  {plan.metadata?.platform === 'APP' ? '모바일 웹 (PWA App)' : '웹 애플리케이션 (Web)'}
                </span>
              </div>
            </div>
          </div>
        );
      }

      case 2: {
        return (
          <div className="bg-white rounded-[2px] p-5 border border-stone-200/90 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <BookOpen size={15} className="text-[#D97706]" />
              <span className="font-sans font-semibold">타깃 사용자 및 결핍 정의 요약</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              작성하신 페르소나와 결핍 사항은 <code className="text-stone-900 font-mono bg-stone-100 px-1.5 py-0.5 rounded-[2px] border border-stone-200">docs/01_proposal.md</code>의 <strong>문제 정의(Problem Statement)</strong>와 <strong>가치 제안(Value Proposition)</strong>에 구조화되어 자동 반영됩니다.
            </p>
          </div>
        );
      }

      case 3: {
        return (
          <FeatureMappingInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 4: {
        // Chapter 4: Dedicated Visual Schema Bridge (Translates domain terms to Spreadsheet & TypeScript Schema)
        return (
          <VisualSchemaBridgeWidget
            rawInput={currentValue}
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 5: {
        return (
          <DesignSystemInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 6: {
        return (
          <NavigationArchitectureInteractiveWidget
            plan={plan}
            setPlan={setPlan}
            onInputChange={onInputChange}
          />
        );
      }

      case 7: {
        return (
          <div className="bg-white rounded-[2px] p-5 border border-stone-200/90 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
              <Shield size={15} className="text-[#D97706]" />
              <span className="font-sans font-semibold">로컬 퍼스트 & 아키텍처 규칙</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/70">
                <span className="font-sans font-medium text-sm text-stone-900 block">IndexedDB 로컬 스토리지</span>
                <span className="text-xs text-stone-500 mt-1 block">외부 클라우드 전송 없이 브라우저 내 안전 보관</span>
              </div>
              <div className="bg-stone-50/80 p-3.5 rounded-[2px] border border-stone-200/70">
                <span className="font-sans font-medium text-sm text-stone-900 block">단일 파일 완결성</span>
                <span className="text-xs text-stone-500 mt-1 block">규약에 따른 무설치 단일 파일 보장</span>
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Chapter 8 is the dedicated Master Artifacts & Vibe Coding Hub
  if (currentChapter === 8) {
    return (
      <section 
        className="flex-1 min-w-[640px] h-full flex flex-col bg-[#FBFBFA] overflow-y-auto selection:bg-[#FEF3C7] selection:text-[#78350F]"
        aria-label="산출물 사출 허브"
      >
        {/* Top Breadcrumb Bar */}
        <div className="h-14 px-6 sm:px-8 border-b border-stone-200/80 bg-white flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 min-w-0 truncate">
            <span className="font-mono text-stone-900 font-semibold shrink-0">CHAPTER 08</span>
            <span className="text-stone-300 shrink-0">·</span>
            <span className="text-stone-900 font-medium font-sans truncate">산출물 허브 및 배포</span>
            <span className="text-stone-300 shrink-0">·</span>
            <span className="text-[#D97706] font-mono font-medium shrink-0">11종 사양서 번들</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onTogglePreviewCollapse && (
              <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'} position="bottom">
                <button
                  onClick={onTogglePreviewCollapse}
                  className={`h-7 w-7 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer ${
                    isPreviewCollapsed
                      ? 'bg-amber-50 text-[#D97706] border-amber-300'
                      : 'bg-transparent text-stone-500 border-transparent hover:text-stone-900 hover:bg-stone-100'
                  }`}
                  aria-label={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'}
                >
                  {isPreviewCollapsed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Chapter 8 Canvas Body - Smooth width expansion in 2-Track Focus Mode */}
        <div className={`flex-1 w-full mx-auto p-6 sm:p-10 flex flex-col transition-all duration-300 ease-in-out ${
          isPreviewCollapsed ? 'max-w-6xl' : 'max-w-5xl'
        }`}>
          <PromptExtractionHub
            formInputs={formInputs}
            onBack={() => onNavigateSection('prev')}
            onSave={() => {}}
            largeTextMode={largeTextMode}
          />
        </div>
      </section>
    );
  }

  // Chapters 1 to 7: Single Unified Canvas
  return (
    <section 
      className="flex-1 min-w-[640px] h-full flex flex-col bg-[#FBFBFA] overflow-y-auto selection:bg-[#FEF3C7] selection:text-[#78350F]"
      aria-label="집필 캔버스"
    >
      {/* Canvas Top Bar: Elegant Typographic Breadcrumb */}
      <div className="h-12 px-6 sm:px-8 border-b border-stone-200/80 bg-white flex items-center justify-between shrink-0 gap-3">
        {/* Left: Breadcrumbs with generous breathing room */}
        <div className={`flex items-center gap-2.5 text-stone-500 truncate min-w-0 ${
          largeTextMode ? 'text-base' : 'text-xs sm:text-sm'
        }`}>
          <span className="font-mono text-[#D97706] font-semibold text-xs shrink-0 tracking-wider">CHAPTER 0{chapter.id}</span>
          <span className="text-stone-300 shrink-0 select-none">/</span>
          <span className="text-stone-900 font-sans font-medium truncate">{chapter.title}</span>
          <span className="text-stone-300 shrink-0 select-none">·</span>
          <span className="text-stone-500 truncate">{section.title}</span>
        </div>

        {/* Right: Minimal Focus Mode Trigger */}
        {onTogglePreviewCollapse && (
          <Tooltip content={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'} position="bottom">
            <button
              onClick={onTogglePreviewCollapse}
              className={`h-7 w-7 flex items-center justify-center rounded-[2px] border transition-colors cursor-pointer shrink-0 ${
                isPreviewCollapsed
                  ? 'bg-amber-50 text-[#D97706] border-amber-300'
                  : 'bg-transparent text-stone-500 border-transparent hover:text-stone-900 hover:bg-stone-100'
              }`}
              aria-label={isPreviewCollapsed ? '미리보기 패널 열기' : '집중 집필 모드'}
            >
              {isPreviewCollapsed ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </Tooltip>
        )}
      </div>

      {/* Main Unified Canvas Body - Dynamic 2-Track Expansion (max-w-5xl/6xl) */}
      <div className={`flex-1 w-full mx-auto p-6 sm:p-10 flex flex-col space-y-6 transition-all duration-300 ease-in-out ${
        isPreviewCollapsed ? 'max-w-5xl lg:max-w-6xl' : 'max-w-4xl'
      }`}>
        {/* Editorial Heading with High-Legibility Scalability */}
        <div className="space-y-2 border-b border-stone-200/80 pb-5">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-mono text-[#D97706] font-semibold">
              0{currentSectionIdx + 1}.
            </span>
            <span className={`uppercase tracking-wider font-mono text-stone-600 ${largeTextMode ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
              {chapter.engTitle}
            </span>
          </div>
          <h1 className={`font-sans font-bold text-stone-900 tracking-tight leading-tight ${
            largeTextMode ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl sm:text-3xl'
          }`} style={{ textWrap: 'balance' }}>
            {section.title}
          </h1>
          <p className={`leading-relaxed font-sans ${
            largeTextMode ? 'text-lg sm:text-xl leading-loose text-stone-700' : 'text-sm sm:text-base text-stone-600'
          }`}>
            {section.question}
          </p>
        </div>

        {/* 1. Natural Language Writing Area: Luminous Paper Card */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`font-sans font-semibold text-stone-900 ${largeTextMode ? 'text-sm sm:text-base' : 'text-xs'}`}>
                기획 원고 서술 (Thinking Canvas)
              </span>
              <span className="font-mono text-xs tabular-nums text-stone-400">
                {currentValue.length}자
              </span>
            </div>

            {/* Inline AI Co-pilot Action Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* [✨ 1-Line Refine] */}
              <button
                type="button"
                onClick={handleInlineRefine}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[2px] bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-xs font-medium text-amber-900 transition-colors cursor-pointer shadow-2xs"
                title="일상 구어체 서술을 명확한 엔지니어링 개발 요구사항 문장으로 1줄 정제"
              >
                <Sparkles size={12} className="text-[#D97706]" />
                <span>1줄 정제</span>
              </button>

              {/* [💡 Sample Domain Chips] */}
              <button
                type="button"
                onClick={() => setIsSampleChipsOpen(prev => !prev)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-[2px] border text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                  isSampleChipsOpen
                    ? 'bg-amber-100/80 text-amber-900 border-amber-300'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-700'
                }`}
                title="사전 제작된 실무 도메인 템플릿 항목 살펴보기"
              >
                <Lightbulb size={12} className="text-[#D97706]" />
                <span>샘플 항목 삽입</span>
              </button>

              {/* [📊 Extract Schema] */}
              <button
                type="button"
                onClick={handleExtractSchema}
                className="flex items-center gap-1 px-2.5 py-1 rounded-[2px] bg-white border border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-xs font-medium text-stone-700 transition-colors cursor-pointer shadow-2xs"
                title="원고에서 데이터 속성을 분석하여 엑셀 장부 형태의 스키마 필드로 즉시 추출"
              >
                <Layers size={12} className="text-[#D97706]" />
                <span>스키마 자동 추출</span>
              </button>

              {/* Undo action button */}
              {previousValueBeforeRefine !== null && (
                <button
                  type="button"
                  onClick={handleUndoRefine}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-mono text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                  title="정제 전 원고로 복원"
                >
                  <Undo2 size={11} />
                  <span>되돌리기</span>
                </button>
              )}
            </div>
          </div>

          {/* Co-pilot Feedback Notification */}
          {coPilotNotification && (
            <div className="px-3 py-1.5 rounded-[2px] bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs">
              <Check size={12} className="text-emerald-600 stroke-[2.5]" />
              <span>{coPilotNotification}</span>
            </div>
          )}

          {/* Sample Domain Chips Tray (When Opened) */}
          {isSampleChipsOpen && (
            <div className="p-3 bg-white border border-amber-200/80 rounded-[2px] space-y-2 shadow-xs">
              <span className="text-[11px] font-mono text-stone-600 block">
                클릭 시 원고에 실무 표준 템플릿이 즉시 삽입됩니다:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(CHAPTER_SAMPLE_CHIPS[currentChapter] || CHAPTER_SAMPLE_CHIPS[1]).map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleSelectSampleChip(chip.text)}
                    className="px-2.5 py-1 rounded-[2px] bg-stone-50 border border-stone-200 hover:border-amber-300 hover:bg-amber-50/60 text-xs text-stone-700 hover:text-amber-900 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span className="text-[#D97706]">·</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clean White Stationery Card Writing Field */}
          <div className="relative flex flex-col bg-white border-2 border-stone-200/90 focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-amber-500/10 rounded-[3px] p-3 sm:p-4 shadow-xs transition-all duration-200">
            <textarea
              id="goguma-raw-input"
              ref={textareaRef}
              value={currentValue}
              onChange={(e) => onInputChange(currentChapter, section.key, e.target.value)}
              placeholder={section.placeholder}
              rows={largeTextMode ? 6 : 5}
              className={`w-full bg-transparent px-1 py-1 text-stone-900 placeholder-stone-400 outline-none resize-none font-sans transition-all duration-200 ${
                largeTextMode 
                  ? 'text-lg sm:text-xl leading-loose tracking-wide min-h-[200px]' 
                  : 'text-base sm:text-lg leading-relaxed min-h-[150px]'
              }`}
            />
          </div>

          <p className="text-[11px] font-mono text-stone-500 pt-1">
            생각나는 내용을 한 줄 또는 문장으로 서술해 주세요. 우측 화면에 실시간으로 반영됩니다.
          </p>
        </div>

        {/* 2. Unified Chapter Interactive Widget Section */}
        <div className="pt-2">
          {renderChapterInteractiveWidget()}
        </div>

        {/* Bottom Actions Bar - Strict Spatial Math & Single-Line Controls */}
        <div className="pt-5 pb-4 border-t border-stone-200/80 flex items-center justify-between gap-3 flex-nowrap">
          {/* Previous Section Button */}
          <button
            onClick={() => onNavigateSection('prev')}
            disabled={isFirstSection}
            type="button"
            className={`flex items-center gap-2 rounded-[2px] border font-medium transition-colors whitespace-nowrap ${
              largeTextMode ? 'px-5 py-2.5 min-h-[44px] text-sm sm:text-base' : 'px-4 py-2 min-h-[38px] text-xs sm:text-sm'
            } ${
              isFirstSection
                ? 'opacity-30 cursor-not-allowed bg-transparent border-stone-200 text-stone-400'
                : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 cursor-pointer shadow-2xs'
            }`}
          >
            <ArrowLeft size={14} />
            <span>이전 단계</span>
          </button>

          {/* Section Step Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono tabular-nums text-stone-500">
            <span className="text-stone-900 font-semibold">제 {chapter.id}장</span>
            <span>·</span>
            <span>{currentSectionIdx + 1} / {chapter.sections.length}</span>
          </div>

          {/* Next Section Button */}
          <button
            onClick={() => onNavigateSection('next')}
            type="button"
            className={`flex items-center gap-2 rounded-[2px] bg-[#D97706] hover:bg-[#B45309] active:bg-[#92400E] text-white font-semibold transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
              largeTextMode ? 'px-6 py-2.5 min-h-[44px] text-sm sm:text-base' : 'px-5 py-2 min-h-[38px] text-xs sm:text-sm'
            }`}
          >
            <span>{isLastSection ? '청사진 배포 허브' : '다음 단계로 전진'}</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded-[2px] bg-white/20 text-white">
              ⌘ + ↵
            </kbd>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};
