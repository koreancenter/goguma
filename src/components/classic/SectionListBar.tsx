import React from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, 
  Bookmark 
} from 'lucide-react';
import { GOGUMA_CHAPTERS, SectionDef } from '../../lib/chapterData';
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
      className={`h-full flex flex-col bg-[#0B0B0E] border-r border-[#23232A] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[196px] xl:w-[214px]'
      }`}
      aria-label="소분류 섹션 인덱스"
    >
      {/* Column 2 Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#23232A]">
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-[#78756E] block leading-tight uppercase">
              CHAPTER 0{chapter.id}
            </span>
            <h2 className="font-sans font-semibold text-xs sm:text-sm text-[#F5F3ED] truncate mt-0.5">
              {chapter.title}
            </h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-[2px] hover:bg-[#181820] text-[#B8B5AC] hover:text-[#F5F3ED] transition-colors ml-auto cursor-pointer"
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
          const rawInput = formInputs[inputKey]?.userRawInput || '';
          const isFilled = rawInput.trim().length > 0;
          const isActive = section.key === currentSection;

          return (
            <button
              key={section.key}
              onClick={() => onSelectSection(section.key)}
              title={section.title}
              className={`w-full flex items-start gap-2.5 p-2.5 text-left transition-all cursor-pointer rounded-[2px] ${
                isActive
                  ? 'bg-[#16161C] text-[#F5F3ED] border-l-2 border-[#C5A880] shadow-xs'
                  : 'text-[#B8B5AC] hover:bg-[#121217] hover:text-[#F5F3ED] border-l-2 border-transparent'
              }`}
            >
              {/* Section number or check */}
              <div className="shrink-0 mt-0.5">
                {isFilled ? (
                  <CheckCircle2 size={14} className="text-[#C5A880]" />
                ) : (
                  <Circle size={14} className={isActive ? 'text-[#F5F3ED]' : 'text-[#78756E]/50'} />
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-[#78756E]">
                      0{index + 1}.
                    </span>
                    {isFilled && (
                      <span className="text-[10px] font-mono text-[#C5A880] font-medium">
                        작성됨
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs leading-snug line-clamp-2 ${isActive ? 'text-[#F5F3ED] font-semibold' : 'text-[#B8B5AC]'}`}>
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
        <div className="p-3 border-t border-[#23232A] bg-[#0E0E12]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F5F3ED] mb-1">
            <Bookmark size={13} className="text-[#C5A880]" />
            <span className="font-sans font-semibold">장 개요</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#B8B5AC]">
            {chapter.description}
          </p>
        </div>
      )}
    </aside>
  );
};
