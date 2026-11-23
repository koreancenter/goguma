import React from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Circle, 
  Bookmark 
} from 'lucide-react';
import { getChapters, SectionDef } from '../../lib/chapterData';
import { getSectionBusinessRules, hasMeaningfulRuleContent } from '../../lib/businessRulesSerializer';
import { FormInputEntity } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { language, pick } = useLanguage();
  const chapters = getChapters(language);
  const chapter = chapters.find(c => c.id === currentChapter) || chapters[0];

  return (
    <aside 
      className={`h-full flex flex-col bg-[var(--theme-stage)] border-r border-[var(--theme-border-hairline)] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[196px] xl:w-[214px]'
      }`}
      aria-label={pick({
        ko: '소분류 섹션 인덱스',
        en: 'Section Index',
        ja: 'セクション一覧',
        id: 'Indeks Bagian',
      })}
    >
      {/* Column 2 Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[var(--theme-border-hairline)]">
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-sans text-[var(--theme-ink-muted)] block leading-tight uppercase">
              CHAPTER 0{chapter.id}
            </span>
            <h2 className="font-sans font-semibold text-xs sm:text-sm text-[var(--theme-ink-primary)] truncate mt-0.5">
              {chapter.title}
            </h2>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors ml-auto cursor-pointer"
          title={
            isCollapsed
              ? pick({ ko: '섹션 목록 펼치기', en: 'Expand sections', ja: 'セクション一覧を展開', id: 'Luaskan daftar bagian' })
              : pick({ ko: '섹션 목록 접기', en: 'Collapse sections', ja: 'セクション一覧を折りたたむ', id: 'Ciutkan daftar bagian' })
          }
          aria-label={
            isCollapsed
              ? pick({ ko: '섹션 목록 펼치기', en: 'Expand sections', ja: 'セクション一覧を展開', id: 'Luaskan daftar bagian' })
              : pick({ ko: '섹션 목록 접기', en: 'Collapse sections', ja: 'セクション一覧を折りたたむ', id: 'Ciutkan daftar bagian' })
          }
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
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                  : 'text-[var(--theme-ink-secondary)] hover:bg-[var(--theme-canvas)] hover:text-[var(--theme-ink-strong)]'
              }`}
            >
              {/* Section number or check */}
              <div className="shrink-0 mt-0.5">
                {isFilled ? (
                  <CheckCircle2 size={14} className={isActive ? 'text-[var(--theme-active-text)]' : 'text-[var(--theme-ink-strong)]'} />
                ) : (
                  <Circle size={14} className={isActive ? 'text-[var(--theme-active-text)]' : 'text-[var(--theme-ink-muted)]'} />
                )}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`font-sans text-xs tabular-nums ${isActive ? 'text-[var(--theme-active-text)]' : 'text-[var(--theme-ink-muted)]'}`}>
                      0{index + 1}.
                    </span>
                    {isFilled && (
                      <span className={`text-[10px] font-sans font-medium ${isActive ? 'text-[var(--theme-active-text)]' : 'text-[var(--theme-ink-strong)]'}`}>
                        {pick({ ko: '작성됨', en: 'Filled', ja: '入力済み', id: 'Terisi' })}
                      </span>
                    )}
                  </div>
                  <p className={`mt-0.5 text-xs leading-snug line-clamp-2 ${isActive ? 'text-[var(--theme-active-text)] font-semibold' : 'text-[var(--theme-ink-body)]'}`}>
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
        <div className="p-3 border-t border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-ink-primary)] mb-1">
            <Bookmark size={13} className="text-[var(--theme-ink-strong)]" />
            <span className="font-sans font-semibold">
              {pick({ ko: '장 개요', en: 'Chapter Overview', ja: '章の概要', id: 'Ikhtisar Bab' })}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--theme-ink-secondary)]">
            {chapter.description}
          </p>
        </div>
      )}
    </aside>
  );
};
