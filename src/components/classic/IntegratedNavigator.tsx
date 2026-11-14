import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Compass, Target, Users, HelpCircle, Cpu, GitBranch, 
  Database, FileCheck, Palette, Type, FolderTree, Navigation, 
  Code2, ShieldCheck, Archive, ListChecks, ChevronLeft, ChevronRight, 
  Check, LayoutGrid, CheckCircle2, Circle
} from 'lucide-react';
import { GOGUMA_CHAPTERS } from '../../lib/chapterData';
import { getSectionBusinessRules, hasMeaningfulRuleContent } from '../../lib/businessRulesSerializer';
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

  const isSectionCompleted = (chapterId: number, sectionKey: string): boolean => {
    const entry = formInputs[`${chapterId}_${sectionKey}`];
    const hasProse = Boolean(entry?.userRawInput?.trim());
    const hasRules = getSectionBusinessRules(entry).some(hasMeaningfulRuleContent);
    return hasProse || hasRules;
  };

  const completedSectionsCount = FLAT_SECTIONS.filter(item =>
    isSectionCompleted(item.chapterId, item.sectionKey)
  ).length;
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
        className={`h-full flex flex-col bg-[#F7F8FA] border-r border-[#E5E7EB] transition-all duration-200 ease-out select-none shrink-0 ${
          isCollapsed ? 'w-[52px]' : 'w-[240px]'
        }`}
        aria-label="기획서 목차 내비게이션"
      >
        {/* Dock / Sidebar Top Header */}
        <div className={`h-12 border-b border-[#E5E7EB] bg-[#F7F8FA] flex items-center shrink-0 ${
          isCollapsed ? 'justify-center px-1' : 'justify-between px-3.5'
        }`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <span className="p-1.5 rounded-lg bg-[#EFF6FF] text-[#1E3A8A] shrink-0">
                <Compass size={14} />
              </span>
              <div className="min-w-0">
                <span className="font-sans font-semibold text-xs text-[#111827] tracking-tight truncate block">
                  기획서 목차
                </span>
                <span className="text-[11px] font-mono text-[#4B5563] tabular-nums block truncate">
                  {completedSectionsCount}/{totalSections} 작성 완료
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-[#1E3A8A] flex items-center justify-center transition-colors cursor-pointer"
              title={`목차 펼치기 (${completedSectionsCount}/${totalSections} 완료)`}
              aria-label="목차 펼치기"
            >
              <ChevronRight size={15} />
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className={`rounded-lg hover:bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] transition-colors cursor-pointer ${
              isCollapsed ? 'hidden' : 'p-1.5 ml-auto'
            }`}
            title="레일로 접기"
            aria-label="레일로 접기"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Dock Rail Items (16 Items) */}
        <nav 
          className={`flex-1 overflow-y-auto custom-scroll ${
            isCollapsed 
              ? 'py-2 px-1 flex flex-col items-center gap-1' 
              : 'p-2 space-y-1'
          }`}
        >
          {FLAT_SECTIONS.map((item) => {
            const isCurrent = currentChapter === item.chapterId && currentSection === item.sectionKey;
            const isDone = isSectionCompleted(item.chapterId, item.sectionKey);
            const Icon = item.Icon;

            // 1. Slim 52px Icon & Number Rail Mode
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
                  className={`relative w-10 h-10 rounded-lg flex flex-col items-center justify-center transition-all duration-150 cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                      : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#FFFFFF]'
                  }`}
                  aria-label={`${item.numStr}. ${item.title}`}
                >
                  {/* Active Navy Indicator on the left edge */}
                  {isCurrent && (
                    <span 
                      className="absolute -left-1 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#1E3A8A]" 
                    />
                  )}

                  {/* Section Icon */}
                  <Icon 
                    size={16} 
                    className={`transition-transform duration-150 ${
                      isCurrent ? 'text-[#1E3A8A]' : 'text-[#4B5563] group-hover:text-[#111827]'
                    }`}
                  />

                  {/* Micro Index Number */}
                  <span className={`text-[9px] font-mono leading-none mt-0.5 tabular-nums ${
                    isCurrent ? 'text-[#1E3A8A] font-bold' : 'text-[#9CA3AF] group-hover:text-[#4B5563]'
                  }`}>
                    {item.numStr}
                  </span>

                  {/* Completed Dot */}
                  {isDone && (
                    <span 
                      className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                        isCurrent ? 'bg-[#1E3A8A]' : 'bg-[#15803D]'
                      }`}
                      title="작성 완료됨"
                    />
                  )}
                </button>
              );
            }

            // 2. Expanded 240px Drawer Mode (40px row height, #EFF6FF active pill)
            return (
              <button
                key={`${item.chapterId}_${item.sectionKey}`}
                onClick={() => {
                  onSelectChapter(item.chapterId);
                  onSelectSection(item.sectionKey);
                }}
                className={`w-full min-h-[40px] h-10 text-left px-3 rounded-lg text-[13px] transition-colors flex items-center justify-between cursor-pointer group ${
                  isCurrent
                    ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                    : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 truncate">
                  <span className={`font-mono text-[11px] tabular-nums shrink-0 ${
                    isCurrent ? 'text-[#1E3A8A] font-bold' : 'text-[#9CA3AF]'
                  }`}>
                    {item.numStr}
                  </span>
                  <Icon size={15} className={`shrink-0 ${isCurrent ? 'text-[#1E3A8A]' : 'text-[#4B5563] group-hover:text-[#111827]'}`} />
                  <span className="truncate">{item.title}</span>
                </div>

                {isDone && (
                  <span className={`shrink-0 ml-1.5 ${
                    isCurrent ? 'text-[#1E3A8A]' : 'text-[#15803D]'
                  }`}>
                    <Check size={13} strokeWidth={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dock Bottom Controls */}
        <div className={`border-t border-[#E5E7EB] bg-[#F7F8FA] shrink-0 ${
          isCollapsed ? 'py-2 px-1 flex flex-col items-center gap-1.5' : 'p-2.5'
        }`}>
          {isCollapsed ? (
            <>
              {/* Quick 11-Spec Hub Shortcut Icon */}
              <button
                onClick={() => {
                  onSelectChapter(8);
                  onSelectSection('export_summary');
                }}
                className="w-9 h-9 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-[#4B5563] hover:text-[#1E3A8A] flex items-center justify-center transition-colors cursor-pointer"
                title="11종 사양서 배포 허브 바로가기"
                aria-label="11종 사양서 배포 허브"
              >
                <Archive size={16} />
              </button>

              {/* Expand Drawer Button */}
              <button
                onClick={onToggleCollapse}
                className="w-9 h-8 rounded-lg bg-transparent hover:bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
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
              className="w-full h-10 px-3 rounded-lg bg-[#FFFFFF] hover:bg-[#EFF6FF] border border-[#E5E7EB] text-[#111827] hover:text-[#1E3A8A] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Archive size={14} className="text-[#1E3A8A]" />
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
          <div className="relative flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] text-[#111827] rounded-lg shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12)] border border-[#E5E7EB] font-sans whitespace-nowrap">
            <div 
              className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#FFFFFF] border-l border-b border-[#E5E7EB] rotate-45"
            />

            <span className="font-mono text-xs font-bold text-[#1E3A8A] tabular-nums shrink-0">
              {tooltipState.item.numStr}.
            </span>
            <span className="font-sans font-semibold text-xs text-[#111827] tracking-tight">
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

