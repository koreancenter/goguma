import React from 'react';
import { 
  FileText, Users, Database, Palette, 
  Layout, Cpu, Archive, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { GOGUMA_CHAPTERS, ChapterDef } from '../../lib/chapterData';

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
  return (
    <aside 
      className={`h-full flex flex-col bg-[#0D0D11] border-r border-[#23232A] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[190px] xl:w-[208px]'
      }`}
      aria-label="대분류 챕터 내비게이션"
    >
      {/* Column 1 Header / Toggle */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-[#23232A]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-sans font-semibold text-xs text-[#F5F3ED] tracking-wider uppercase">
              Chapters
            </span>
            <span aria-hidden="true" className="text-[#78756E]/40 text-xs">·</span>
            <span className="text-xs font-mono tabular-nums text-[#78756E]">
              08
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-[2px] hover:bg-[#181820] text-[#B8B5AC] hover:text-[#F5F3ED] transition-colors ml-auto cursor-pointer"
          title={isCollapsed ? '챕터 목록 펼치기' : '챕터 목록 접기'}
          aria-label={isCollapsed ? '챕터 목록 펼치기' : '챕터 목록 접기'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Chapters List */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-1.5">
        {GOGUMA_CHAPTERS.map((ch: ChapterDef, idx: number) => {
          const Icon = CHAPTER_ICONS[idx] || FileText;
          const isActive = ch.id === currentChapter;
          const isDone = completedChapters.has(ch.id);

          return (
            <button
              key={ch.id}
              onClick={() => onSelectChapter(ch.id)}
              title={`${ch.id}장: ${ch.title}`}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 min-h-[42px] text-left transition-all duration-150 relative group cursor-pointer rounded-[2px] ${
                isActive
                  ? 'bg-[#181822] text-[#F5F3ED] font-semibold border-l-2 border-[#C5A880]'
                  : 'text-[#B8B5AC] hover:bg-[#14141A] hover:text-[#F5F3ED] border-l-2 border-transparent'
              }`}
            >
              {/* Icon & Badge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-[2px] flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#C5A880] text-[#0A0A0C]'
                      : isDone
                      ? 'bg-[#14141A] text-[#C5A880] border border-[#C5A880]/30'
                      : 'bg-[#121217] text-[#78756E] group-hover:text-[#F5F3ED] border border-[#23232A]'
                  }`}
                >
                  <Icon size={14} />
                </div>
                {isDone && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#C5A880] text-[#0A0A0C] rounded-full flex items-center justify-center text-[8px] font-bold">
                    <Check size={8} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Chapter Title & Number */}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className="font-mono text-xs font-semibold text-[#78756E]">
                      0{ch.id}
                    </span>
                    <span className={`truncate text-xs ${isActive ? 'text-[#F5F3ED] font-semibold' : 'text-[#B8B5AC]'}`}>
                      {ch.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#78756E] truncate mt-0.5 font-mono">
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
        <div className="p-3 border-t border-[#23232A] bg-[#0E0E14] text-xs text-[#B8B5AC]">
          <div className="flex justify-between items-center mb-1 font-medium">
            <span className="font-semibold text-xs text-[#F5F3ED]">기획 진행도</span>
            <span className="font-mono text-xs text-[#C5A880] font-semibold">
              {currentChapter} / 8
            </span>
          </div>
          <div className="w-full h-1 bg-[#23232A] rounded-none overflow-hidden">
            <div 
              className="h-full bg-[#C5A880] transition-all duration-300"
              style={{ width: `${(currentChapter / 8) * 100}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
