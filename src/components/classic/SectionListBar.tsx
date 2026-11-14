import React from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, 
  Bookmark 
} from 'lucide-react';
import { GOGUMA_CHAPTERS, SectionDef } from '../../lib/chapterData';
import { getSectionBusinessRules, hasMeaningfulRuleContent } from '../../lib/businessRulesSerializer';
import { FormInputEntity } from '../../types';

interface SectionListBarProps {
  currentChapter: number;
  currentSection: string;
  onSelectSection: (sectionKey: string) => void;
  formInputs: Record<string, FormInputEntity>;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SectionListBar: React.FC<SectionListBarProps> = ({
  currentChapter,
  currentSection,
  onSelectSection,
  formInputs,
  isCollapsed,
  onToggleCollapse,
}) => {
  const chapter = GOGUMA_CHAPTERS.find(c => c.id === currentChapter) || GOGUMA_CHAPTERS[0];

  return (
    <aside 
      className={`h-full flex flex-col bg-[#F7F8FA] border-r border-[#E5E7EB] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[196px] xl:w-[214px]'
      }`}
      aria-label="소분류 섹션 인덱스"
    >
      {/* Column 2 Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#E5E7EB]">
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-[#6B7280] block leading-tight uppercase">
              CHAPTER 0{chapter.id}
            </span>
            <h2 className="font-sans font-semibold text-xs sm:text-sm text-[#111827] truncate mt-0.5">
              {chapter.title}
            </h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? '섹션 목록 펼치기' : '섹션 목록 접기'}
          aria-label={isCollapsed ? '섹션 목록 펼치기' : '섹션 목록 접기'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Sections List */}
      <nav className="flex-1 overflow-y-auto p-1.5 space-y-1">
        {chapter.sections.map((section: SectionDef, index: number) => {
          const inputKey = `${currentChapter}_${section.key}`;
          const entry = formInputs[inputKey];
          const rawInput = entry?.userRawInput || '';
          const hasRules = getSectionBusinessRules(entry).some(hasMeaningfulRuleContent);
          const isFilled = rawInput.trim().length > 0 || hasRules;
          const isActive = section.key === currentSection;

          return (
            <button
              key={section.key}
              onClick={() => onSelectSection(section.key)}
              title={section.title}
              className={`w-full flex items-start gap-2.5 p-2.5 text-left transition-all cursor-pointer rounded-lg ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                  : 'text-[#4B5563] hover:bg-[#FFFFFF] hover:text-[#111827]'
              }`}
            >
              {/* Section number or check */}
              <div className="shrink-0 mt-0.5">
                {isFilled ? (
                  <CheckCircle2 size={14} className="text-[#1E3A8A]" />
                ) : (
                  <Circle size={14} className={isActive ? 'text-[#1E3A8A]' : 'text-[#9CA3AF]'} />
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs tabular-nums ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'}`}>
                      0{index + 1}.
                    </span>
                    {isFilled && (
                      <span className="text-[10px] font-mono text-[#1E3A8A] font-medium">
                        작성됨
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs leading-snug line-clamp-2 ${isActive ? 'text-[#1E3A8A] font-semibold' : 'text-[#374151]'}`}>
                    {section.title}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Chapter Overview Box */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#E5E7EB] bg-[#FFFFFF]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111827] mb-1">
            <Bookmark size={13} className="text-[#1E3A8A]" />
            <span className="font-sans font-semibold">장 개요</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#4B5563]">
            {chapter.description}
          </p>
        </div>
      )}
    </aside>
  );
};
