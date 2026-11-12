import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Table as TableIcon, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Split, Combine, ChevronDown, Sparkles
} from 'lucide-react';

export interface TiptapThinkingCanvasProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  largeTextMode?: boolean;
}

export const TiptapThinkingCanvas: React.FC<TiptapThinkingCanvasProps> = ({
  value,
  onChange,
  placeholder = '생각나는 내용을 한 줄 또는 문장으로 서술해 주세요...',
  largeTextMode = false,
}) => {
  const isInternalUpdateRef = useRef(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-[#0B0C10] p-2.5 rounded-[2px] font-mono text-xs text-sky-300 border border-white/[0.08] my-2',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-2 border-[#38BDF8] pl-3 my-2 text-zinc-400 italic',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5 my-1.5 space-y-0.5',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5 my-1.5 space-y-0.5',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-[#5C6675] before:float-left before:pointer-events-none before:h-0',
      }),
      Underline,
      TiptapTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table-root w-full my-3 border-collapse',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'tiptap-th bg-[#0E1217] text-[#38BDF8] font-semibold text-xs text-left p-2.5 border border-white/[0.12]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'tiptap-td p-2 text-xs text-[#F0F3F6] border border-white/[0.08] bg-[#13181F]/40 align-top',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `w-full bg-transparent px-1 py-1 text-[#F0F3F6] outline-none font-sans transition-all duration-200 focus:outline-none ${
          largeTextMode
            ? 'text-lg sm:text-xl leading-loose tracking-wide min-h-[190px]'
            : 'text-base sm:text-lg leading-relaxed min-h-[140px]'
        }`,
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdateRef.current = true;
      const text = editor.getText();
      onChange(text);
    },
  });

  // Sync external changes (such as 1-Line Refine, Sample Chips, or Chapter switches)
  useEffect(() => {
    if (!editor) return;

    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const currentText = editor.getText();
    if (value !== currentText) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const isTableActive = editor ? editor.isActive('table') : false;
  const hasTextSelection = editor ? !editor.state.selection.empty : false;
  const isMenuVisible = isTableActive || hasTextSelection;

  const [floatingMenuPos, setFloatingMenuPos] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Position the floating bubble menu directly above the text selection or active table
  const updateFloatingMenuPosition = useCallback(() => {
    if (!editor || !containerRef.current) {
      setFloatingMenuPos(null);
      return;
    }

    const { view } = editor;
    const { selection } = view.state;
    const isTable = editor.isActive('table');
    const hasSelection = !selection.empty;

    // Hide menu if neither text is selected nor inside a table
    if (!hasSelection && !isTable) {
      setFloatingMenuPos(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();

    if (hasSelection) {
      try {
        const startCoords = view.coordsAtPos(selection.from);
        const endCoords = view.coordsAtPos(selection.to);
        const selTop = Math.min(startCoords.top, endCoords.top);
        const selBottom = Math.max(startCoords.bottom, endCoords.bottom);
        const selCenter = (startCoords.left + endCoords.right) / 2;

        // Position bubble menu ~46px above the top of the selection
        let top = selTop - containerRect.top - 46;
        if (top < 0) {
          // If clipped above top edge, position below the selection
          top = selBottom - containerRect.top + 8;
        }

        const estimatedWidth = isTable ? 500 : 260;
        let left = selCenter - containerRect.left - (estimatedWidth / 2);
        const maxLeft = Math.max(8, containerRect.width - estimatedWidth - 8);
        left = Math.max(8, Math.min(left, maxLeft));

        setFloatingMenuPos({ top, left });
        return;
      } catch {
        // Fallback to table position if selection coords error
      }
    }

    if (isTable) {
      let domNode: HTMLElement | null = null;
      try {
        const fromPos = view.coordsAtPos(selection.from);
        const elementAtPoint = document.elementFromPoint(fromPos.left, fromPos.top);
        domNode = elementAtPoint?.closest('table') as HTMLElement | null;
      } catch {}

      if (!domNode) {
        domNode = containerRef.current.querySelector('table');
      }

      if (!domNode) {
        setFloatingMenuPos(null);
        return;
      }

      const tableRect = domNode.getBoundingClientRect();
      const top = Math.max(0, tableRect.top - containerRect.top - 46);
      const left = Math.max(8, Math.min(tableRect.left - containerRect.left, containerRect.width - 500));

      setFloatingMenuPos({ top, left });
    }
  }, [editor]);

  // Track selection, transaction, resize, and scroll events to update bubble menu coordinates
  useEffect(() => {
    if (!editor) return;

    editor.on('selectionUpdate', updateFloatingMenuPosition);
    editor.on('transaction', updateFloatingMenuPosition);

    window.addEventListener('resize', updateFloatingMenuPosition);
    const scrollContainer = containerRef.current?.closest('.overflow-y-auto') || window;
    scrollContainer.addEventListener('scroll', updateFloatingMenuPosition);

    return () => {
      editor.off('selectionUpdate', updateFloatingMenuPosition);
      editor.off('transaction', updateFloatingMenuPosition);
      window.removeEventListener('resize', updateFloatingMenuPosition);
      scrollContainer.removeEventListener('scroll', updateFloatingMenuPosition);
    };
  }, [editor, updateFloatingMenuPosition]);

  if (!editor) {
    return (
      <div className="w-full min-h-[150px] bg-transparent p-2 animate-pulse text-[#5C6675] text-sm font-mono">
        에디터 초기화 중...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex flex-col w-full">
      {/* Tiptap Minimalist Floating Toolbar (Sumi Black & Hairline Styling) */}
      <div className="flex items-center gap-1 pb-2.5 mb-2 border-b border-white/[0.08] flex-wrap text-zinc-400 select-none">
        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('bold')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="굵게 (Ctrl+B)"
        >
          <Bold size={13} />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('italic')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="기울임 (Ctrl+I)"
        >
          <Italic size={13} />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('underline')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="밑줄 (Ctrl+U)"
        >
          <UnderlineIcon size={13} />
        </button>

        {/* Strike */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('strike')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="취소선"
        >
          <Strikethrough size={13} />
        </button>

        {/* Inline Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('code')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="인라인 코드"
        >
          <Code size={13} />
        </button>

        <span className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-1.5 py-1 text-[11px] font-mono font-bold rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="제목 1 (H1)"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-1.5 py-1 text-[11px] font-mono font-bold rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="제목 2 (H2)"
        >
          H2
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-1.5 py-1 text-[11px] font-mono font-bold rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="제목 3 (H3)"
        >
          H3
        </button>

        <span className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('bulletList')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="글머리 기호 목록"
        >
          <List size={13} />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('orderedList')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="번호 매기기 목록"
        >
          <ListOrdered size={13} />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
            editor.isActive('blockquote')
              ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
              : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
          }`}
          title="인용구"
        >
          <Quote size={13} />
        </button>

        {/* Horizontal Rule */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-[2px] hover:bg-white/[0.06] hover:text-[#F0F3F6] transition-colors cursor-pointer"
          title="구분선 삽입"
        >
          <Minus size={13} />
        </button>

        <span className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

        {/* Table Controls (Creation & Structure Manipulation) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (!isTableActive) {
                // Instantly insert default 3x3 table with headers
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
              } else {
                setIsTableMenuOpen(prev => !prev);
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-[2px] transition-colors cursor-pointer ${
              isTableActive
                ? 'bg-blue-950/70 text-[#38BDF8] border border-blue-500/40'
                : 'hover:bg-white/[0.06] hover:text-[#F0F3F6]'
            }`}
            title={isTableActive ? '표 메뉴 열기' : '3×3 표 삽입'}
          >
            <TableIcon size={13} />
            <span>표 {isTableActive ? '관리' : '삽입'}</span>
            {isTableActive && <ChevronDown size={11} className="text-[#38BDF8]" />}
          </button>

          {/* Table Operations Dropdown Menu when active */}
          {isTableActive && isTableMenuOpen && (
            <div className="absolute left-0 top-full mt-1 z-30 min-w-[210px] bg-[#0E1217] border border-white/[0.12] rounded-[3px] p-1.5 shadow-2xl flex flex-col gap-0.5 text-xs text-[#F0F3F6]">
              <div className="px-2 py-1 text-[10px] font-mono uppercase text-[#7A889B] tracking-wider border-b border-white/[0.06] mb-1">
                행 / 열 구조 제어 (Rows & Cols)
              </div>

              {/* Add / Remove Rows */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-xs"
              >
                <ArrowUp size={12} className="text-[#38BDF8]" />
                <span>위에 행 추가</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-xs"
              >
                <ArrowDown size={12} className="text-[#38BDF8]" />
                <span>아래에 행 추가</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-red-950/40 text-red-300 text-left transition-colors cursor-pointer text-xs"
              >
                <Trash2 size={12} />
                <span>현재 행 삭제</span>
              </button>

              <div className="my-1 border-t border-white/[0.06]" />

              {/* Add / Remove Columns */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-xs"
              >
                <ArrowLeft size={12} className="text-[#38BDF8]" />
                <span>왼쪽에 열 추가</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-xs"
              >
                <ArrowRight size={12} className="text-[#38BDF8]" />
                <span>오른쪽에 열 추가</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-red-950/40 text-red-300 text-left transition-colors cursor-pointer text-xs"
              >
                <Trash2 size={12} />
                <span>현재 열 삭제</span>
              </button>

              <div className="my-1 border-t border-white/[0.06]" />

              {/* Cell Merge / Split */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().mergeCells().run();
                  setIsTableMenuOpen(false);
                }}
                disabled={!editor.can().mergeCells()}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors cursor-pointer text-xs"
              >
                <Combine size={12} className="text-[#38BDF8]" />
                <span>셀 병합</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().splitCell().run();
                  setIsTableMenuOpen(false);
                }}
                disabled={!editor.can().splitCell()}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed text-left transition-colors cursor-pointer text-xs"
              >
                <Split size={12} className="text-[#38BDF8]" />
                <span>셀 분할</span>
              </button>

              {/* Toggle Header */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeaderRow().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-white/[0.06] text-left transition-colors cursor-pointer text-xs"
              >
                <TableIcon size={12} className="text-[#38BDF8]" />
                <span>헤더 행 켜기/끄기</span>
              </button>

              <div className="my-1 border-t border-white/[0.06]" />

              {/* Delete entire table */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().deleteTable().run();
                  setIsTableMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2 py-1 rounded-[2px] hover:bg-red-950/60 text-red-400 font-semibold text-left transition-colors cursor-pointer text-xs"
              >
                <Trash2 size={12} />
                <span>표 전체 삭제</span>
              </button>
            </div>
          )}
        </div>

        {/* Dedicated Context Action Strip when inside Table */}
        {isTableActive && (
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-[2px] bg-blue-950/50 border border-blue-500/30 text-xs">
            <span className="text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider font-semibold mr-1">표 편집 중:</span>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-0.5 hover:bg-blue-900/60 text-[#38BDF8] rounded-[2px] font-mono text-[11px] cursor-pointer flex items-center gap-0.5"
              title="아래에 행 추가"
            >
              <Plus size={10} /> 행
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-0.5 hover:bg-blue-900/60 text-[#38BDF8] rounded-[2px] font-mono text-[11px] cursor-pointer flex items-center gap-0.5"
              title="오른쪽에 열 추가"
            >
              <Plus size={10} /> 열
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1.5 py-0.5 hover:bg-rose-950/60 text-rose-300 rounded-[2px] font-mono text-[11px] cursor-pointer"
              title="행 삭제"
            >
              -행
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-1.5 py-0.5 hover:bg-rose-950/60 text-rose-300 rounded-[2px] font-mono text-[11px] cursor-pointer"
              title="열 삭제"
            >
              -열
            </button>
          </div>
        )}

        {/* History: Undo / Redo */}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-[2px] hover:bg-white/[0.06] hover:text-[#F0F3F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="실행 취소 (Ctrl+Z)"
          >
            <Undo size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-[2px] hover:bg-white/[0.06] hover:text-[#F0F3F6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="다시 실행 (Ctrl+Y)"
          >
            <Redo size={13} />
          </button>
        </div>
      </div>

      {/* Pure React Floating Bubble Menu with Bold, Italic, Underline & Table Structuring */}
      {isMenuVisible && floatingMenuPos && (
        <div
          style={{
            top: `${floatingMenuPos.top}px`,
            left: `${floatingMenuPos.left}px`,
          }}
          onMouseDown={(e) => {
            // Prevent losing editor selection when clicking formatting buttons
            e.preventDefault();
          }}
          className="absolute z-40 flex items-center gap-1 p-1 bg-[#0E1217] border border-blue-500/40 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.75)] rounded-[4px] backdrop-blur-md select-none transition-all duration-150 tiptap-table-bubble-menu max-w-full overflow-x-auto no-scrollbar"
        >
          {/* Text Formatting Controls: Bold, Italic, Underline */}
          <div className="flex items-center gap-0.5">
            {/* Bold */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                editor.isActive('bold')
                  ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/50'
                  : 'text-zinc-300 hover:bg-white/[0.08] hover:text-[#F0F3F6]'
              }`}
              title="굵게 (Ctrl+B)"
            >
              <Bold size={12} />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                editor.isActive('italic')
                  ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/50'
                  : 'text-zinc-300 hover:bg-white/[0.08] hover:text-[#F0F3F6]'
              }`}
              title="기울임 (Ctrl+I)"
            >
              <Italic size={12} />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                editor.isActive('underline')
                  ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/50'
                  : 'text-zinc-300 hover:bg-white/[0.08] hover:text-[#F0F3F6]'
              }`}
              title="밑줄 (Ctrl+U)"
            >
              <UnderlineIcon size={12} />
            </button>

            {/* Strike */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                editor.isActive('strike')
                  ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/50'
                  : 'text-zinc-300 hover:bg-white/[0.08] hover:text-[#F0F3F6]'
              }`}
              title="취소선"
            >
              <Strikethrough size={12} />
            </button>

            {/* Code */}
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={`p-1.5 rounded-[2px] transition-colors cursor-pointer ${
                editor.isActive('code')
                  ? 'bg-blue-950/80 text-[#38BDF8] border border-blue-500/50'
                  : 'text-zinc-300 hover:bg-white/[0.08] hover:text-[#F0F3F6]'
              }`}
              title="인라인 코드"
            >
              <Code size={12} />
            </button>
          </div>

          {/* Table Management Actions if Table is Active */}
          {isTableActive && (
            <>
              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Badge Label */}
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-blue-950/70 border border-blue-500/30 rounded-[2px] text-[#38BDF8] text-[10px] font-mono font-semibold">
                <TableIcon size={11} className="text-[#38BDF8]" />
                <span className="hidden xs:inline">표 제어</span>
              </div>

              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Rows Management Section */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                  className="p-1 hover:bg-white/[0.08] active:bg-blue-950 text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="위에 행 추가"
                >
                  <ArrowUp size={11} className="text-[#38BDF8]" />
                  <span className="hidden sm:inline">위 행</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                  className="p-1 hover:bg-white/[0.08] active:bg-blue-950 text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="아래에 행 추가"
                >
                  <ArrowDown size={11} className="text-[#38BDF8]" />
                  <span className="hidden sm:inline">아래 행</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                  className="p-1 hover:bg-rose-950/50 active:bg-rose-900/60 text-rose-300 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="현재 행 삭제"
                >
                  <Trash2 size={11} />
                  <span className="hidden sm:inline">행 삭제</span>
                </button>
              </div>

              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Columns Management Section */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                  className="p-1 hover:bg-white/[0.08] active:bg-blue-950 text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="왼쪽에 열 추가"
                >
                  <ArrowLeft size={11} className="text-[#38BDF8]" />
                  <span className="hidden sm:inline">좌 열</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                  className="p-1 hover:bg-white/[0.08] active:bg-blue-950 text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="오른쪽에 열 추가"
                >
                  <ArrowRight size={11} className="text-[#38BDF8]" />
                  <span className="hidden sm:inline">우 열</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                  className="p-1 hover:bg-rose-950/50 active:bg-rose-900/60 text-rose-300 rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="현재 열 삭제"
                >
                  <Trash2 size={11} />
                  <span className="hidden sm:inline">열 삭제</span>
                </button>
              </div>

              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Merge & Split Cells Section */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => editor.chain().focus().mergeCells().run()}
                  disabled={!editor.can().mergeCells()}
                  className="p-1 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="선택된 셀 병합"
                >
                  <Combine size={11} className="text-[#38BDF8]" />
                  <span className="hidden md:inline">병합</span>
                </button>
                <button
                  type="button"
                  onClick={() => editor.chain().focus().splitCell().run()}
                  disabled={!editor.can().splitCell()}
                  className="p-1 hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                  title="병합된 셀 분할"
                >
                  <Split size={11} className="text-[#38BDF8]" />
                  <span className="hidden md:inline">분할</span>
                </button>
              </div>

              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Header Row Toggle */}
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className="p-1 hover:bg-white/[0.08] text-[#F0F3F6] hover:text-[#38BDF8] rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="상단 헤더 행 토글"
              >
                <TableIcon size={11} className="text-[#38BDF8]" />
                <span className="hidden sm:inline">헤더</span>
              </button>

              <span className="w-px h-4 bg-white/10 mx-0.5" />

              {/* Delete Whole Table */}
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="p-1 hover:bg-red-950/70 text-red-400 font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                title="표 전체 삭제"
              >
                <Trash2 size={11} />
                <span>표 삭제</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Tiptap Editor Content Mount */}
      <EditorContent editor={editor} className="tiptap-editor-wrap focus:outline-none" />
    </div>
  );
};
