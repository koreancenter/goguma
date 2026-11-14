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
      className={`h-full flex flex-col bg-[#F7F8FA] border-r border-[#E5E7EB] transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[190px] xl:w-[208px]'
      }`}
      aria-label="대분류 챕터 내비게이션"
    >
      {/* Column 1 Header / Toggle */}
      <div className="h-14 px-3.5 flex items-center justify-between border-b border-[#E5E7EB]">
        {!isCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-sans font-semibold text-xs text-[#111827] tracking-wider uppercase">
              Chapters
            </span>
            <span aria-hidden="true" className="text-[#9CA3AF] text-xs">·</span>
            <span className="text-xs font-mono tabular-nums text-[#6B7280]">
              08
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[#FFFFFF] text-[#4B5563] hover:text-[#111827] transition-colors ml-auto cursor-pointer"
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
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 min-h-[40px] text-left transition-all duration-150 relative group cursor-pointer rounded-lg ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
                  : 'text-[#4B5563] hover:bg-[#FFFFFF] hover:text-[#111827]'
              }`}
            >
              {/* Icon & Badge */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#1E3A8A] text-white'
                      : isDone
                      ? 'bg-[#EFF6FF] text-[#1E3A8A] border border-[#1E3A8A]/20'
                      : 'bg-[#FFFFFF] text-[#6B7280] group-hover:text-[#111827] border border-[#E5E7EB]'
                  }`}
                >
                  <Icon size={14} />
                </div>
                {isDone && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                    <Check size={8} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Chapter Title & Number */}
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 leading-tight">
                    <span className={`font-mono text-xs font-semibold ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'}`}>
                      0{ch.id}
                    </span>
                    <span className={`truncate text-xs ${isActive ? 'text-[#1E3A8A] font-semibold' : 'text-[#374151]'}`}>
                      {ch.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] truncate mt-0.5 font-mono">
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
        <div className="p-3 border-t border-[#E5E7EB] bg-[#FFFFFF] text-xs text-[#4B5563]">
          <div className="flex justify-between items-center mb-1 font-medium">
            <span className="font-semibold text-xs text-[#111827]">기획 진행도</span>
            <span className="font-mono text-xs text-[#1E3A8A] font-semibold">
              {currentChapter} / 8
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#1E3A8A] transition-all duration-300"
              style={{ width: `${(currentChapter / 8) * 100}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
