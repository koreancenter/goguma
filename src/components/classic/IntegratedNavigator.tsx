import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Compass, Target, Users, HelpCircle, Cpu, GitBranch,
  Database, FileCheck, Palette, Type, FolderTree, Navigation,
  Code2, ShieldCheck, Archive, ListChecks, ChevronLeft, ChevronRight,
  Check, LayoutGrid, Lock
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
  lockedChapters?: number[];
}

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
  lockedChapters = [],
}) => {
  const [tooltipState, setTooltipState] = useState<TooltipState | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

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
        className={`h-full flex flex-col bg-[#F6F5F1] border-r border-[#E4E2DC] transition-all duration-200 ease-out select-none shrink-0 ${
          isCollapsed ? 'w-[52px]' : 'w-[272px]'
        }`}
        aria-label="기획서 목차 내비게이션"
      >
        {/* Editorial Index Header */}
        <div className={`h-14 border-b border-[#E4E2DC] bg-[#F6F5F1] flex items-center shrink-0 ${
          isCollapsed ? 'justify-center px-1' : 'justify-between px-5'
        }`}>
          {!isCollapsed ? (
            <div className="min-w-0">
              <span className="text-[10px] font-sans font-medium uppercase tracking-[0.16em] text-[#8C8B85] block leading-none mb-1">
                Index · {completedSectionsCount}/{totalSections}
              </span>
              <span className="font-display font-bold text-[15px] text-[#111111] tracking-[-0.02em] truncate block leading-tight">
                기획서 목차
              </span>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="w-8 h-8 rounded-[2px] bg-[#FFFFFF] hover:bg-[#111111] hover:text-[#FFFFFF] border border-[#E4E2DC] text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
              title={`목차 펼치기 (${completedSectionsCount}/${totalSections} 완료)`}
              aria-label="목차 펼치기"
            >
              <ChevronRight size={15} />
            </button>
          )}

          <button
            onClick={onToggleCollapse}
            className={`rounded-[2px] hover:bg-[#EFEDE7] text-[#52524E] hover:text-[#111111] transition-colors cursor-pointer ${
              isCollapsed ? 'hidden' : 'p-1.5 ml-auto'
            }`}
            title="목차 접기"
            aria-label="목차 접기"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        {/* Index Rows (16 Items) */}
        <nav
          className={`flex-1 overflow-y-auto custom-scroll ${
            isCollapsed
              ? 'py-2 px-1 flex flex-col items-center gap-1'
              : 'py-2'
          }`}
        >
          {FLAT_SECTIONS.map((item) => {
            const isCurrent = currentChapter === item.chapterId && currentSection === item.sectionKey;
            const isDone = isSectionCompleted(item.chapterId, item.sectionKey);
            const isLocked = lockedChapters.includes(item.chapterId) || Boolean(formInputs[`${item.chapterId}_${item.sectionKey}`]?.isLocked);
            const Icon = item.Icon;

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
                  className={`relative w-10 h-10 rounded-[2px] flex flex-col items-center justify-center transition-colors cursor-pointer group ${
                    isCurrent
                      ? 'bg-[#111111] text-[#FFFFFF] font-semibold'
                      : 'text-[#52524E] hover:text-[#111111] hover:bg-[#EFEDE7]'
                  }`}
                  aria-label={`${item.numStr}. ${item.title}`}
                >
                  <Icon
                    size={15}
                    className={isCurrent ? 'text-[#FFFFFF]' : 'text-[#52524E] group-hover:text-[#111111]'}
                  />

                  <span className={`text-[9px] font-sans leading-none mt-0.5 tabular-nums ${
                    isCurrent ? 'text-[#FFFFFF] font-semibold' : 'text-[#8C8B85] group-hover:text-[#111111]'
                  }`}>
                    {item.numStr}
                  </span>

                  {isLocked && (
                    <span className={`absolute top-0.5 right-0.5 ${isCurrent ? 'text-[#FFFFFF]' : 'text-[#111111]'}`} title="Locked · AI Protected">
                      <Lock size={8} />
                    </span>
                  )}
                </button>
              );
            }

            // Expanded 272px Editorial Index Mode (Hairline-separated, Tabular Numbers)
            return (
              <button
                key={`${item.chapterId}_${item.sectionKey}`}
                onClick={() => {
                  onSelectChapter(item.chapterId);
                  onSelectSection(item.sectionKey);
                }}
                className={`w-full min-h-[42px] text-left px-5 py-2.5 text-[13px] transition-colors flex items-center justify-between cursor-pointer group border-b border-[#E4E2DC]/60 last:border-b-0 ${
                  isCurrent
                    ? 'bg-[#FFFFFF] text-[#111111] font-semibold'
                    : 'text-[#52524E] hover:text-[#111111] hover:bg-[#EFEDE7]/70'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 truncate">
                  <span className={`font-sans text-[11px] tabular-nums shrink-0 ${
                    isCurrent ? 'text-[#111111] font-semibold' : 'text-[#8C8B85]'
                  }`}>
                    {item.numStr}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>

                {isLocked ? (
                  <span className="shrink-0 ml-2 text-[#111111]" title="Locked · AI Protected">
                    <Lock size={12} />
                  </span>
                ) : isDone ? (
                  <span className={`shrink-0 ml-2 ${isCurrent ? 'text-[#111111]' : 'text-[#1F5132]'}`}>
                    <Check size={13} strokeWidth={2.25} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Editorial Hub Shortcut */}
        <div className={`border-t border-[#E4E2DC] bg-[#F6F5F1] shrink-0 ${
          isCollapsed ? 'py-2 px-1 flex flex-col items-center gap-1.5' : 'p-4'
        }`}>
          {isCollapsed ? (
            <>
              <button
                onClick={() => {
                  onSelectChapter(8);
                  onSelectSection('export_summary');
                }}
                className="w-9 h-9 rounded-[2px] bg-[#FFFFFF] hover:bg-[#111111] border border-[#E4E2DC] text-[#52524E] hover:text-[#FFFFFF] flex items-center justify-center transition-colors cursor-pointer"
                title="11종 사양서 배포 허브 바로가기"
                aria-label="11종 사양서 배포 허브"
              >
                <Archive size={15} />
              </button>

              <button
                onClick={onToggleCollapse}
                className="w-9 h-8 rounded-[2px] bg-transparent hover:bg-[#EFEDE7] text-[#52524E] hover:text-[#111111] flex items-center justify-center transition-colors cursor-pointer"
                title="목차 전체 펼치기"
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
              className="w-full h-10 px-3 rounded-[2px] bg-[#FFFFFF] hover:bg-[#111111] border border-[#CBC8BF] hover:border-[#111111] text-[#111111] hover:text-[#FFFFFF] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Archive size={14} />
              <span>11종 사양서 배포 허브</span>
            </button>
          )}
        </div>
      </aside>

      {/* Collapsed Tooltip Portal */}
      {isCollapsed && tooltipState && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            top: `${tooltipState.top}px`,
            left: `${tooltipState.left}px`,
            zIndex: 100000,
          }}
          className="pointer-events-none select-none"
        >
          <div className="relative flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] text-[#111111] rounded-[2px] shadow-[0_8px_24px_-6px_rgba(17,17,17,0.14)] border border-[#CBC8BF] font-sans whitespace-nowrap">
            <span className="font-sans text-xs font-semibold text-[#111111] tabular-nums shrink-0">
              {tooltipState.item.numStr}.
            </span>
            <span className="font-sans font-medium text-xs text-[#1C1C1A] tracking-tight">
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
