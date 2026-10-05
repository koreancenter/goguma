import React from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, 
  HelpCircle, Sparkles, Bookmark 
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
      className={`h-full flex flex-col bg-[#0E1217] border-r border-white/7 transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[196px] xl:w-[212px]'
      }`}
      aria-label="소분류 섹션 인덱스"
    >
      {/* Column 2 Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-white/7">
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-[#C5A880] block leading-tight">
              제 {chapter.id}장
            </span>
            <h2 className="font-semibold text-xs sm:text-sm text-[#F0F3F6] truncate mt-0.5">
              {chapter.title}
            </h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-[2px] hover:bg-[#18202A] text-[#9AA5B5] hover:text-[#F0F3F6] transition-colors ml-auto cursor-pointer"
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
                  ? 'bg-[#13181F] text-[#F0F3F6] border-l-2 border-[#C5A880]'
                  : 'text-[#9AA5B5] hover:bg-[#13181F] hover:text-[#F0F3F6] border-l-2 border-transparent'
              }`}
            >
              {/* Section number or check */}
              <div className="shrink-0 mt-0.5">
                {isFilled ? (
                  <CheckCircle2 size={15} className="text-[#C5A880]" />
                ) : (
                  <Circle size={15} className={isActive ? 'text-[#C5A880]' : 'text-[#5C6675]'} />
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-[#5C6675]">
                      0{index + 1}.
                    </span>
                    {isFilled && (
                      <span className="text-[11px] font-mono text-[#34D399]">
                        기록됨
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs leading-snug line-clamp-2 ${isActive ? 'text-[#F0F3F6] font-semibold' : 'text-[#9AA5B5]'}`}>
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
        <div className="p-3 border-t border-white/7 bg-[#0E1217]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] mb-1">
            <Bookmark size={13} />
            <span>장(Chapter) 개요</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#9AA5B5]">
            {chapter.description}
          </p>
        </div>
      )}
    </aside>
  );
};
