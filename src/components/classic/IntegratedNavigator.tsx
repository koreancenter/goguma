import React, { useState } from 'react';
import { 
  FileText, Users, Cpu, Database, Palette, 
  Layout, ShieldCheck, Archive, ChevronDown, ChevronRight,
  ChevronLeft, Check, Compass
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef, SectionDef } from '../../lib/chapterData';
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
  completedChapters = new Set(),
}) => {
  // Keep track of which chapters are expanded in the accordion
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({
    [currentChapter]: true,
  });

  const toggleChapterExpand = (chapterId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleChapterClick = (chapterId: number) => {
    onSelectChapter(chapterId);
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: true,
    }));
    // Also select the first section of that chapter if switching
    const targetChapter = GOGUMA_CHAPTERS.find(c => c.id === chapterId);
    if (targetChapter && targetChapter.sections.length > 0) {
      onSelectSection(targetChapter.sections[0].key);
    }
  };

  // Calculate total completed sections
  let totalSections = 0;
  let completedSectionsCount = 0;
  GOGUMA_CHAPTERS.forEach(c => {
    c.sections.forEach(s => {
      totalSections++;
      const val = formInputs[`${c.id}_${s.key}`]?.userRawInput?.trim();
      if (val && val.length > 0) completedSectionsCount++;
    });
  });

  return (
    <aside 
      className={`h-full flex flex-col bg-[#0D0D11] border-r border-white/[0.06] transition-all duration-300 ease-in-out select-none shrink-0 ${
        isCollapsed ? 'w-[56px]' : 'w-[260px] xl:w-[280px]'
      }`}
      aria-label="통합 기획서 목차 내비게이션"
    >
      {/* Navigator Header */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-white/[0.06] bg-[#111116]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <span className="p-1 rounded-[2px] bg-[#181820] text-[#C5A880] border border-white/[0.06] shrink-0">
              <Compass size={14} />
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
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigator Content */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scroll">
        {GOGUMA_CHAPTERS.map((chap: ChapterDef) => {
          const IconComponent = CHAPTER_ICONS[chap.id - 1] || FileText;
          const isCurrentChapter = chap.id === currentChapter;
          const isExpanded = expandedChapters[chap.id] ?? isCurrentChapter;
          const isCompleted = completedChapters.has(chap.id);

          // Count completed sections in this chapter
          const completedInChap = chap.sections.filter(s => {
            const v = formInputs[`${chap.id}_${s.key}`]?.userRawInput?.trim();
            return v && v.length > 0;
          }).length;

          if (isCollapsed) {
            // Collapsed Mode: Clean Icon Strip with Tooltip
            return (
              <button
                key={chap.id}
                onClick={() => handleChapterClick(chap.id)}
                className={`w-full h-10 rounded-[2px] flex items-center justify-center relative transition-colors cursor-pointer group ${
                  isCurrentChapter
                    ? 'bg-[#181822] text-[#C5A880] border border-white/20 shadow-2xs font-bold'
                    : 'text-[#B8B5AC] hover:bg-[#14141A] hover:text-[#F5F3ED]'
                }`}
                title={`제 ${chap.id}장. ${chap.title}`}
              >
                <IconComponent size={16} />
                {isCompleted && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                )}
              </button>
            );
          }

          // Expanded Mode: Accordion Tree
          return (
            <div 
              key={chap.id}
              className={`rounded-[2px] border transition-colors ${
                isCurrentChapter 
                  ? 'border-white/10 bg-[#14141A] shadow-2xs' 
                  : 'border-transparent hover:border-white/[0.06] bg-transparent'
              }`}
            >
              {/* Chapter Header Button */}
              <div
                onClick={() => handleChapterClick(chap.id)}
                className="w-full px-2.5 py-2 flex items-center justify-between text-left cursor-pointer group rounded-[2px]"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-[2px] flex items-center justify-center text-xs shrink-0 transition-colors ${
                    isCurrentChapter
                      ? 'bg-[#C5A880] text-[#0A0A0C] font-bold'
                      : 'bg-[#1A1A22] text-[#B8B5AC] group-hover:bg-[#23232E]'
                  }`}>
                    <IconComponent size={12} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#78756E]">
                        0{chap.id}
                      </span>
                      <span className={`text-xs font-sans font-semibold truncate ${
                        isCurrentChapter ? 'text-[#F5F3ED]' : 'text-[#B8B5AC] group-hover:text-[#F5F3ED]'
                      }`}>
                        {chap.title}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1.5">
                  <span className="text-[10px] font-mono tabular-nums text-[#78756E]">
                    {completedInChap}/{chap.sections.length}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleChapterExpand(chap.id, e)}
                    className="p-1 rounded-[2px] hover:bg-[#1E1E28] text-[#78756E] hover:text-[#F5F3ED] transition-transform cursor-pointer"
                    aria-label="섹션 펼치기/접기"
                  >
                    {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>
                </div>
              </div>

              {/* Sections Accordion Body */}
              {isExpanded && (
                <div className="pl-6 pr-2 pb-2 space-y-0.5 border-t border-white/[0.06] pt-1.5 mt-0.5">
                  {chap.sections.map((section: SectionDef, sIdx: number) => {
                    const isCurrentSection = isCurrentChapter && section.key === currentSection;
                    const val = formInputs[`${chap.id}_${section.key}`]?.userRawInput?.trim();
                    const isSectionDone = Boolean(val && val.length > 0);

                    return (
                      <button
                        key={section.key}
                        onClick={() => {
                          onSelectChapter(chap.id);
                          onSelectSection(section.key);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-[2px] text-xs transition-colors flex items-center justify-between cursor-pointer group ${
                          isCurrentSection
                            ? 'bg-[#C5A880] text-[#0A0A0C] font-semibold shadow-2xs'
                            : 'text-[#B8B5AC] hover:text-[#F5F3ED] hover:bg-[#181822]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`font-mono text-[10px] ${
                            isCurrentSection ? 'text-[#0A0A0C]/70' : 'text-[#78756E]'
                          }`}>
                            0{sIdx + 1}
                          </span>
                          <span className="truncate">{section.title}</span>
                        </div>
                        {isSectionDone && (
                          <span className={`shrink-0 ml-1 ${
                            isCurrentSection ? 'text-[#0A0A0C]' : 'text-[#C5A880]'
                          }`}>
                            <Check size={11} strokeWidth={2.5} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Navigator Footer - Quick Artifacts Shortcut */}
      {!isCollapsed && (
        <div className="p-2.5 border-t border-white/[0.06] bg-[#0E0E14] text-xs">
          <button
            onClick={() => {
              onSelectChapter(8);
              onSelectSection('export_bundle');
            }}
            className="w-full py-1.5 px-2 rounded-[2px] bg-[#14141A] hover:bg-[#1A1A22] border border-white/[0.06] text-[#F5F3ED] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Archive size={13} className="text-[#C5A880]" />
            <span>11종 사양서 배포 허브 바로가기</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default IntegratedNavigator;
