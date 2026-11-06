import React from 'react';
import { 
  FileText, Users, Cpu, Database, Palette, 
  Layout, ShieldCheck, Archive, ChevronLeft, ChevronRight, Check, Compass
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef, SectionDef } from '../../lib/chapterData';
import { FormInputEntity } from '../../types';
import { Tooltip } from '../guide/Tooltip';

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

const CHAPTER_ICONS = [
  FileText,     // 1. Overview
  Users,        // 2. Persona & Platform
  Cpu,          // 3. Features & Logic
  Layout,       // 4. IA & Navigation
  Palette,      // 5. Design System
  Database,     // 6. Data & Storage
  ShieldCheck,  // 7. Security & Constitution
  Archive,      // 8. Artifacts Hub
];

export const IntegratedNavigator: React.FC<IntegratedNavigatorProps> = ({
  currentChapter,
  currentSection,
  onSelectChapter,
  onSelectSection,
  formInputs,
  isCollapsed,
  onToggleCollapse,
}) => {
  // Flatten all 16 sections into a single flat sequence
  const FLAT_SECTIONS = GOGUMA_CHAPTERS.flatMap((chap, chapIdx) =>
    chap.sections.map((sec, secIdx) => {
      const globalIdx = chapIdx * 2 + secIdx + 1;
      return {
        globalIndex: globalIdx,
        numStr: globalIdx < 10 ? `0${globalIdx}` : `${globalIdx}`,
        chapterId: chap.id,
        sectionKey: sec.key,
        title: sec.title,
        chapterTitle: chap.title,
        Icon: CHAPTER_ICONS[chap.id - 1] || FileText,
      };
    })
  );

  const completedSectionsCount = FLAT_SECTIONS.filter(item => {
    const v = formInputs[`${item.chapterId}_${item.sectionKey}`]?.userRawInput?.trim();
    return Boolean(v && v.length > 0);
  }).length;
  const totalSections = FLAT_SECTIONS.length; // 16

  return (
    <aside 
      className={`h-full flex flex-col bg-[#0D0D11] border-r border-white/[0.06] transition-all duration-300 ease-in-out select-none shrink-0 ${
        isCollapsed ? 'w-[56px]' : 'w-[260px] xl:w-[280px]'
      }`}
      aria-label="통합 기획서 목차 내비게이션"
    >
      {/* Navigator Header */}
      <div className="h-12 px-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#111116] shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="p-1 rounded-[2px] bg-[#181820] text-[#C5A880] border border-white/[0.06] shrink-0">
              <Compass size={13} />
            </span>
            <div className="min-w-0">
              <span className="font-sans font-semibold text-xs text-[#F5F3ED] tracking-tight truncate block">
                기획서 목차
              </span>
              <span className="text-[10px] font-mono text-[#78756E] tabular-nums block truncate">
                {completedSectionsCount}/{totalSections} 작성 완료
              </span>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-[2px] hover:bg-[#181820] text-[#B8B5AC] hover:text-[#F5F3ED] transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? '목차 펼치기' : '목차 접기'}
          aria-label={isCollapsed ? '목차 펼치기' : '목차 접기'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigator Content: Single Flat Un-grouped List (1 to 16) */}
      <nav className="flex-1 overflow-y-auto p-1.5 space-y-0.5 custom-scroll">
        {FLAT_SECTIONS.map((item) => {
          const isCurrent = currentChapter === item.chapterId && currentSection === item.sectionKey;
          const val = formInputs[`${item.chapterId}_${item.sectionKey}`]?.userRawInput?.trim();
          const isDone = Boolean(val && val.length > 0);

          if (isCollapsed) {
            // Collapsed Mode: Clean Number/Indicator with Tooltip
            return (
              <Tooltip key={`${item.chapterId}_${item.sectionKey}`} content={`${item.numStr}. ${item.title}`} position="right">
                <button
                  onClick={() => {
                    onSelectChapter(item.chapterId);
                    onSelectSection(item.sectionKey);
                  }}
                  className={`w-10 h-7 rounded-[2px] flex items-center justify-center font-mono text-[10px] transition-colors cursor-pointer relative ${
                    isCurrent
                      ? 'bg-[#C5A880] text-[#0A0A0C] font-bold shadow-xs'
                      : 'text-[#8E8B82] hover:bg-[#16161C] hover:text-[#F5F3ED]'
                  }`}
                  aria-label={`${item.numStr}. ${item.title}`}
                >
                  <span>{item.numStr}</span>
                  {isDone && !isCurrent && (
                    <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#C5A880]" />
                  )}
                </button>
              </Tooltip>
            );
          }

          // Single-Tier Flat List Item
          return (
            <button
              key={`${item.chapterId}_${item.sectionKey}`}
              onClick={() => {
                onSelectChapter(item.chapterId);
                onSelectSection(item.sectionKey);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-[2px] text-xs transition-colors flex items-center justify-between cursor-pointer group ${
                isCurrent
                  ? 'bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-xs'
                  : 'text-[#B8B5AC] hover:text-[#F5F3ED] hover:bg-[#15151B]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className={`font-mono text-[10px] tabular-nums shrink-0 ${
                  isCurrent ? 'text-[#0A0A0C]/75 font-bold' : 'text-[#78756E]'
                }`}>
                  {item.numStr}
                </span>
                <span className="truncate">{item.title}</span>
              </div>

              {isDone && (
                <span className={`shrink-0 ml-1.5 ${
                  isCurrent ? 'text-[#0A0A0C]' : 'text-[#C5A880]'
                }`}>
                  <Check size={11} strokeWidth={2.5} />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Navigator Footer - Quick Artifacts Shortcut */}
      {!isCollapsed && (
        <div className="p-2 border-t border-white/[0.06] bg-[#0E0E14] text-xs shrink-0">
          <button
            onClick={() => {
              onSelectChapter(8);
              onSelectSection('export_summary');
            }}
            className="w-full py-1.5 px-2 rounded-[2px] bg-[#14141A] hover:bg-[#1A1A22] border border-white/[0.06] text-[#F5F3ED] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Archive size={13} className="text-[#C5A880]" />
            <span>11종 사양서 배포 허브</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default IntegratedNavigator;
