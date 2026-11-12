import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Compass, Target, Users, HelpCircle, Cpu, GitBranch, 
  Database, FileCheck, Palette, Type, FolderTree, Navigation, 
  Code2, ShieldCheck, Archive, ListChecks, ChevronLeft, ChevronRight, 
  Check, LayoutGrid, CheckCircle2, Circle
} from 'lucide-react';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import { FormInputEntity } from '../../types';

interface IntegratedNavigatorProps {
  currentChapter: number;
  currentSection: string;
  onSelectChapter: (chapterId: number) => void;
  onSelectSection: (sectionKey: string) => void;
  formInputs: Record<string, FormInputEntity>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  completedChapters?: Set<number>;
}

// 16 Distinct, highly-intuitive Lucide icons corresponding to each spec section
const SECTION_ICONS = [
  Compass,      // 01 서비스 명칭 및 웹 서비스 정의
  Target,       // 02 개발 배경 및 기술 목표
  Users,        // 03 주요 사용자군 및 런타임 환경
  HelpCircle,   // 04 사용자 요구사항 및 불편 사항
  Cpu,          // 05 필수 핵심 기능 명세
  GitBranch,    // 06 사용자 핵심 흐름
  Database,     // 07 데이터베이스 엔터티 및 필드 명세
  FileCheck,    // 08 비즈니스 로직 및 유효성 검증 규칙
  Palette,      // 09 비주얼 테마 및 컬러 토큰
  Type,         // 10 타이포그래피 및 레이아웃 규격
  FolderTree,   // 11 사이트맵 및 화면 목록
  Navigation,   // 12 내비게이션 및 메뉴 계층 구조
  Code2,        // 13 기술 스택 및 프레임워크 규약
  ShieldCheck,  // 14 보안 정책 및 성능 최적화 규약
  Archive,      // 15 최종 개발 명세서 번들 및 프로토타입
  ListChecks,   // 16 개발 검수 및 인수 테스트 기준
];

interface FlatSectionItem {
  globalIndex: number;
  numStr: string;
  chapterId: number;
  chapterTitle: string;
  chapterEngTitle: string;
  sectionKey: string;
  title: string;
  question: string;
  placeholder: string;
  Icon: React.ElementType;
}

interface TooltipState {
  item: FlatSectionItem;
  top: number;
  left: number;
}

export const IntegratedNavigator: React.FC<IntegratedNavigatorProps> = ({
  currentChapter,
  currentSection,
  onSelectChapter,
  onSelectSection,
  formInputs,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Tooltip portal state for the Ubuntu Dock mode
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  // Flatten all 16 sections into a sequential array with rich metadata
  const FLAT_SECTIONS: FlatSectionItem[] = GOGUMA_CHAPTERS.flatMap((chap, chapIdx) =>
    chap.sections.map((sec, secIdx) => {
      const globalIdx = chapIdx * 2 + secIdx + 1;
      return {
        globalIndex: globalIdx,
        numStr: globalIdx < 10 ? `0${globalIdx}` : `${globalIdx}`,
        chapterId: chap.id,
        chapterTitle: chap.title,
        chapterEngTitle: chap.engTitle,
        sectionKey: sec.key,
        title: sec.title,
        question: sec.question,
        placeholder: sec.placeholder,
        Icon: SECTION_ICONS[globalIdx - 1] || Compass,
      };
    })
  );

  const completedSectionsCount = FLAT_SECTIONS.filter(item => {
    const v = formInputs[`${item.chapterId}_${item.sectionKey}`]?.userRawInput?.trim();
    return Boolean(v && v.length > 0);
  }).length;
  const totalSections = FLAT_SECTIONS.length; // 16

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (item: FlatSectionItem, e: React.MouseEvent<HTMLButtonElement>) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    const rect = e.currentTarget.getBoundingClientRect();
    const buttonCenterY = rect.top + rect.height / 2;
    const tooltipHeight = 34;
    const computedTop = Math.max(8, Math.min(window.innerHeight - tooltipHeight - 8, buttonCenterY - tooltipHeight / 2));

    setTooltipState({
      item,
      top: computedTop,
      left: rect.right + 10,
    });
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = window.setTimeout(() => {
      setTooltipState(null);
    }, 60);
  };

  return (
    <>
      <aside 
        className={`h-full flex flex-col bg-[#0E1217] border-r border-white/[0.08] transition-all duration-200 ease-out select-none shrink-0 ${
          isCollapsed ? 'w-[58px]' : 'w-[260px] xl:w-[280px]'
        }`}
        aria-label="기획서 목차 내비게이션"
      >
        {/* Dock / Sidebar Top Header */}
        <div className={`h-12 border-b border-white/[0.08] bg-[#0E1217] flex items-center shrink-0 ${
          isCollapsed ? 'justify-center px-1.5' : 'justify-between px-3.5'
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <span className="p-1 rounded-[2px] bg-blue-950/60 text-[#38BDF8] border border-blue-500/30 shrink-0">
                <Compass size={14} />
              </span>
              <div className="min-w-0">
                <span className="font-sans font-semibold text-xs text-[#F0F3F6] tracking-tight truncate block">
                  기획서 목차
                </span>
                <span className="text-[10px] font-mono text-[#9AA5B5] tabular-nums block truncate">
                  {completedSectionsCount}/{totalSections} 작성 완료
                </span>
              </div>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center cursor-default"
              title={`작성 현황: ${completedSectionsCount}/${totalSections} 완료`}
            >
              <div className="w-7 h-7 rounded-[4px] bg-blue-950/60 border border-blue-500/30 text-[#38BDF8] flex items-center justify-center font-bold text-xs shadow-2xs">
                <Compass size={15} />
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`rounded-[2px] hover:bg-white/[0.08] text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors cursor-pointer ${
              isCollapsed ? 'hidden' : 'p-1.5 ml-auto'
            }`}
            title="아이콘 독으로 접기 (캔버스 공간 극대화)"
            aria-label="아이콘 독으로 접기"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Dock Rail Items (16 Items) */}
        <nav 
          className={`flex-1 overflow-y-auto custom-scroll ${
            isCollapsed 
              ? 'p-1.5 flex flex-col items-center gap-1.5' 
              : 'p-1.5 space-y-0.5'
          }`}
        >
          {FLAT_SECTIONS.map((item) => {
            const isCurrent = currentChapter === item.chapterId && currentSection === item.sectionKey;
            const val = formInputs[`${item.chapterId}_${item.sectionKey}`]?.userRawInput?.trim();
            const isDone = Boolean(val && val.length > 0);
            const Icon = item.Icon;

            // 1. Icon Launcher Dock Mode
            if (isCollapsed) {
              return (
                <button
                  key={`${item.chapterId}_${item.sectionKey}`}
                  onClick={() => {
                    onSelectChapter(item.chapterId);
                    onSelectSection(item.sectionKey);
                    setTooltipState(null);
                  }}
                  onMouseEnter={(e) => handleMouseEnter(item, e)}
                  onMouseLeave={handleMouseLeave}
                  className={`relative w-10 h-10 rounded-[4px] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#13181F] text-[#38BDF8] border border-blue-500/50 shadow-xs ring-1 ring-blue-500/30'
                      : 'text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.06] border border-transparent'
                  }`}
                  aria-label={`${item.numStr}. ${item.title}`}
                >
                  {/* Active Azure Pip on the left edge */}
                  {isCurrent && (
                    <span 
                      className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-[3.5px] h-5 rounded-r-[2px] bg-[#38BDF8] shadow-xs" 
                    />
                  )}

                  {/* Section Icon */}
                  <Icon 
                    size={18} 
                    className={`transition-transform duration-150 ${
                      isCurrent ? 'scale-105 text-[#38BDF8]' : 'text-[#9AA5B5] group-hover:text-[#F0F3F6] group-hover:scale-110'
                    }`}
                  />

                  {/* Micro Index Number */}
                  <span className={`text-[8.5px] font-mono leading-none mt-0.5 tabular-nums ${
                    isCurrent ? 'text-[#38BDF8] font-bold' : 'text-[#5C6675] group-hover:text-[#9AA5B5]'
                  }`}>
                    {item.numStr}
                  </span>

                  {/* Completed Dot Pip (Azure glow on top-right) */}
                  {isDone && (
                    <span 
                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full border border-[#0E1217] ${
                        isCurrent ? 'bg-[#38BDF8]' : 'bg-[#60A5FA]'
                      }`}
                      title="작성 완료됨"
                    />
                  )}
                </button>
              );
            }

            // 2. Expanded Drawer Mode (Full Text Labels)
            return (
              <button
                key={`${item.chapterId}_${item.sectionKey}`}
                onClick={() => {
                  onSelectChapter(item.chapterId);
                  onSelectSection(item.sectionKey);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs transition-colors flex items-center justify-between cursor-pointer group border ${
                  isCurrent
                    ? 'bg-[#13181F] border-blue-500/40 text-[#F0F3F6] font-semibold shadow-2xs'
                    : 'border-transparent text-[#9AA5B5] hover:text-[#F0F3F6] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <span className={`font-mono text-[10px] tabular-nums shrink-0 ${
                    isCurrent ? 'text-[#38BDF8] font-bold' : 'text-[#5C6675]'
                  }`}>
                    {item.numStr}
                  </span>
                  <Icon size={14} className={`shrink-0 ${isCurrent ? 'text-[#38BDF8]' : 'text-[#9AA5B5] group-hover:text-[#F0F3F6]'}`} />
                  <span className="truncate">{item.title}</span>
                </div>

                {isDone && (
                  <span className={`shrink-0 ml-1.5 ${
                    isCurrent ? 'text-[#38BDF8]' : 'text-[#60A5FA]'
                  }`}>
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dock Bottom Controls */}
        <div className={`border-t border-white/[0.08] bg-[#0E1217] shrink-0 ${
          isCollapsed ? 'p-1.5 flex flex-col items-center gap-1.5' : 'p-2'
        }`}>
          {isCollapsed ? (
            <>
              {/* Quick 11-Spec Hub Shortcut Icon */}
              <button
                onClick={() => {
                  onSelectChapter(8);
                  onSelectSection('export_summary');
                }}
                className="w-10 h-10 rounded-[4px] bg-[#13181F] hover:bg-blue-950/60 border border-white/10 hover:border-blue-500/40 text-[#9AA5B5] hover:text-[#38BDF8] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="11종 사양서 배포 허브 바로가기"
                aria-label="11종 사양서 배포 허브"
              >
                <Archive size={17} />
              </button>

              {/* Expand Drawer Button */}
              <button
                onClick={onToggleCollapse}
                className="w-10 h-8 rounded-[4px] bg-transparent hover:bg-white/[0.08] text-[#9AA5B5] hover:text-[#F0F3F6] flex items-center justify-center transition-colors cursor-pointer"
                title="목차 전체 펼치기 (텍스트 목록 보기)"
                aria-label="목차 전체 펼치기"
              >
                <LayoutGrid size={15} />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onSelectChapter(8);
                onSelectSection('export_summary');
              }}
              className="w-full py-1.5 px-2 rounded-[2px] bg-[#13181F] hover:bg-blue-950/60 border border-white/10 hover:border-blue-500/40 text-[#F0F3F6] hover:text-[#38BDF8] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Archive size={13} className="text-[#38BDF8]" />
              <span>11종 사양서 배포 허브</span>
            </button>
          )}
        </div>
      </aside>

      {/* Dock Label Tooltip (Rendered to body via createPortal) */}
      {isCollapsed && tooltipState && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${tooltipState.top}px`,
            left: `${tooltipState.left}px`,
            zIndex: 100000,
          }}
          className="pointer-events-none select-none animate-in fade-in zoom-in-95 duration-100"
        >
          {/* Tooltip Card: Only the Core Title clearly and boldly visible */}
          <div className="relative flex items-center gap-2.5 px-3 py-2 bg-[#13181F] text-[#F0F3F6] rounded-[4px] shadow-2xl border border-blue-500/30 font-sans whitespace-nowrap">
            {/* Left Triangle Arrow pointing to the dock icon */}
            <div 
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#13181F] border-l border-b border-blue-500/30 rotate-45 shadow-xs"
            />

            <span className="font-mono text-xs font-bold text-[#38BDF8] tabular-nums shrink-0">
              {tooltipState.item.numStr}.
            </span>
            <span className="font-sans font-bold text-xs sm:text-[13px] text-[#F0F3F6] tracking-tight">
              {tooltipState.item.title}
            </span>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default IntegratedNavigator;

