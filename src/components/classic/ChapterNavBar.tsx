import React from 'react';
import { 
  FileText, Users, Database, Palette, 
  Layout, Cpu, Archive, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { getChapters, ChapterDef } from '../../lib/chapterData';
import { useLanguage } from '../../contexts/LanguageContext';

interface ChapterNavBarProps {
  currentChapter: number;
  onSelectChapter: (chapterId: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  completedChapters?: Set<number>;
}

const CHAPTER_ICONS = [
  FileText,
  Users,
  Cpu,
  Database,
  Palette,
  Layout,
  Cpu,
  Archive,
];

export const ChapterNavBar: React.FC<ChapterNavBarProps> = ({
  currentChapter,
  onSelectChapter,
  isCollapsed,
  onToggleCollapse,
  completedChapters = new Set(),
}) => {
  const { language, pick } = useLanguage();
  const chapters = getChapters(language);

  return (
    <aside 
      className={`h-full flex flex-col bg-[var(--theme-stage)] border-r border-[var(--theme-border-hairline)] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[190px] xl:w-[208px]'
      }`}
      aria-label={pick({
        ko: '대분류 챕터 내비게이션',
        en: 'Chapter Navigation',
        ja: 'チャプターナビゲーション',
        id: 'Navigasi Bab',
      })}
    >
      {/* Column 1 Header / Toggle */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-[var(--theme-border-hairline)]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-sans font-semibold text-xs text-[var(--theme-ink-primary)] tracking-wider uppercase">
              {pick({ ko: 'Chapters', en: 'Chapters', ja: 'Chapters', id: 'Bab' })}
            </span>
            <span aria-hidden="true" className="text-[var(--theme-ink-muted)] text-xs">·</span>
            <span className="text-xs font-sans tabular-nums text-[var(--theme-ink-secondary)]">
              08
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] transition-colors ml-auto cursor-pointer"
          title={
            isCollapsed
              ? pick({ ko: '챕터 목록 펼치기', en: 'Expand chapters', ja: 'チャプター一覧を展開', id: 'Luaskan daftar bab' })
              : pick({ ko: '챕터 목록 접기', en: 'Collapse chapters', ja: 'チャプター一覧を折りたたむ', id: 'Ciutkan daftar bab' })
          }
          aria-label={
            isCollapsed
              ? pick({ ko: '챕터 목록 펼치기', en: 'Expand chapters', ja: 'チャプター一覧を展開', id: 'Luaskan daftar bab' })
              : pick({ ko: '챕터 목록 접기', en: 'Collapse chapters', ja: 'チャプター一覧を折りたたむ', id: 'Ciutkan daftar bab' })
          }
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Chapters List */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1.5">
        {chapters.map((ch: ChapterDef, idx: number) => {
          const Icon = CHAPTER_ICONS[idx] || FileText;
          const isActive = ch.id === currentChapter;
          const isDone = completedChapters.has(ch.id);

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              title={`${ch.id}. ${ch.title}`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 min-h-[40px] text-left transition-all duration-150 relative group cursor-pointer rounded-lg ${
                isActive
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-semibold'
                  : 'text-[var(--theme-ink-secondary)] hover:bg-[var(--theme-canvas)] hover:text-[var(--theme-ink-strong)]'
              }`}
            >
              {/* Icon & Badge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)]'
                      : isDone
                      ? 'bg-[var(--theme-subtle)] text-[var(--theme-ink-strong)] border border-[var(--theme-border-strong)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-secondary)] group-hover:text-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)]'
                  }`}
                >
                  <Icon size={14} />
                </div>
                {isDone && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[var(--theme-btn-bg)] text-[var(--theme-btn-text)] rounded-full flex items-center justify-center text-[8px] font-bold">
                    <Check size={8} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Chapter Title & Number */}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className={`font-sans tabular-nums text-xs font-semibold ${isActive ? 'text-[var(--theme-active-text)]' : 'text-[var(--theme-ink-muted)]'}`}>
                      0{ch.id}
                    </span>
                    <span className={`truncate text-xs ${isActive ? 'text-[var(--theme-active-text)] font-semibold' : 'text-[var(--theme-ink-body)]'}`}>
                      {ch.title}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 font-sans ${isActive ? 'text-[var(--theme-active-text)] opacity-80' : 'text-[var(--theme-ink-muted)]'}`}>
                    {ch.engTitle}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Column Footer: Chapter Progress */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)] text-xs text-[var(--theme-ink-secondary)]">
          <div className="flex justify-between items-center mb-1 font-medium">
            <span className="font-semibold text-xs text-[var(--theme-ink-primary)]">
              {pick({ ko: '기획 진행도', en: 'Planning Progress', ja: '設計進捗', id: 'Progres Rencana' })}
            </span>
            <span className="font-sans tabular-nums text-xs text-[var(--theme-ink-strong)] font-semibold">
              {currentChapter} / 8
            </span>
          </div>
          <div className="w-full h-1.5 bg-[var(--theme-border-hairline)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--theme-ink-strong)] transition-all duration-300"
              style={{ width: `${(currentChapter / 8) * 100}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
