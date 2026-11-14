import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import ImageExtension from '@tiptap/extension-image';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered, Quote, Minus, Undo, Redo,
  Table as TableIcon, Trash2, Upload, X, Image as ImageIcon,
  ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine,
  ListMinus, SquareMinus, TableCellsMerge, TableCellsSplit,
  PanelTopDashed, Rows3, PanelTop, SeparatorHorizontal, Minimize2, RotateCcw
} from 'lucide-react';

// Extended Tiptap Table supporting visual style attributes persisted in HTML
const StyledTiptapTable = TiptapTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      striped: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-striped') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.striped) return {};
          return { 'data-striped': 'true' };
        },
      },
      headerHighlight: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-header-highlight') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.headerHighlight) return {};
          return { 'data-header-highlight': 'true' };
        },
      },
      minimalBorder: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-minimal-border') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.minimalBorder) return {};
          return { 'data-minimal-border': 'true' };
        },
      },
      compact: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-compact') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.compact) return {};
          return { 'data-compact': 'true' };
        },
      },
    };
  },
});

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
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePopoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const floatingMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-[#F7F8FA] p-3.5 rounded-lg font-mono text-xs text-[#111827] border border-[#E5E7EB] my-3',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-2 border-[#1E3A8A]/35 pl-4 my-3 text-[#4B5563] italic',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5 my-2 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5 my-2 space-y-1',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'is-editor-empty before:content-[attr(data-placeholder)] before:text-[#9CA3AF] before:float-left before:pointer-events-none before:h-0',
      }),
      Underline,
      ImageExtension.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image-item',
        },
      }),
      StyledTiptapTable.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table-root w-full my-3 border-collapse',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'tiptap-th bg-[#F7F8FA] text-[#111827] font-semibold text-xs text-left p-2.5 border border-[#E5E7EB]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'tiptap-td p-2.5 text-xs text-[#111827] border border-[#E5E7EB] bg-[#FFFFFF] align-top',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: `w-full bg-transparent py-1 text-[#111827] outline-none font-sans transition-all duration-200 focus:outline-none ${
          largeTextMode
            ? 'text-lg sm:text-xl leading-[1.8] tracking-normal min-h-[200px]'
            : 'text-[15px] sm:text-base leading-[1.75] min-h-[160px]'
        }`,
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find((item) => item.type.startsWith('image/'));
        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target?.result as string;
              if (base64) {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({
                      src: base64,
                      alt: file.name || 'Pasted image',
                      title: file.name || 'Pasted image',
                    })
                  )
                );
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const base64 = readerEvent.target?.result as string;
              if (base64) {
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = view.state.schema.nodes.image.create({
                  src: base64,
                  alt: file.name || 'Dropped image',
                  title: file.name || 'Dropped image',
                });
                if (coordinates) {
                  view.dispatch(view.state.tr.insert(coordinates.pos, node));
                } else {
                  view.dispatch(view.state.tr.replaceSelectionWith(node));
                }
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdateRef.current = true;
      const content = editor.isEmpty ? '' : editor.getHTML();
      onChange(content);
    },
  });

  // Helper function to insert local image file
  const handleImageFileUpload = (file: File) => {
    if (!file.type.startsWith('image/') || !editor) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        editor.chain().focus().setImage({ src: base64, alt: file.name || 'Uploaded diagram' }).run();
      }
    };
    reader.readAsDataURL(file);
  };

  // Helper function to insert web image URL
  const handleImageUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim() || !editor) return;
    editor.chain().focus().setImage({ src: imageUrlInput.trim(), alt: 'Diagram' }).run();
    setImageUrlInput('');
    setIsImageModalOpen(false);
  };

  // Close image popover cleanly on outside click or Escape key
  useEffect(() => {
    if (!isImageModalOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (imagePopoverRef.current && !imagePopoverRef.current.contains(e.target as Node)) {
        setIsImageModalOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsImageModalOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isImageModalOpen]);

  // Sync external changes (such as 1-Line Refine, Sample Chips, or Chapter switches)
  useEffect(() => {
    if (!editor) return;

    if (isInternalUpdateRef.current) {
      isInternalUpdateRef.current = false;
      return;
    }

    const currentHTML = editor.getHTML();
    const currentText = editor.getText();
    if (value !== currentHTML && value !== currentText) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const isTableActive = editor ? editor.isActive('table') : false;
  const isImageActive = editor ? editor.isActive('image') : false;
  const selection = editor?.state.selection;
  const isCellSelection = Boolean(selection && '$anchorCell' in selection);
  const hasTextSelection = Boolean(selection && !selection.empty && !isImageActive && !isCellSelection);

  // Suppress floating bubble menu while image insertion popover is open to guarantee zero overlap
  const isMenuVisible = !isImageModalOpen && (isTableActive || hasTextSelection || isImageActive);

  // Read active table visual style attributes
  const tableAttrs = editor && isTableActive ? editor.getAttributes('table') : {};
  const isStriped = Boolean(tableAttrs.striped);
  const isHeaderHighlighted = Boolean(tableAttrs.headerHighlight);
  const isMinimalBorder = Boolean(tableAttrs.minimalBorder);
  const isCompact = Boolean(tableAttrs.compact);
  const hasAnyTableStyle = isStriped || isHeaderHighlighted || isMinimalBorder || isCompact;

  const toggleTableStyleAttr = (attr: 'striped' | 'headerHighlight' | 'minimalBorder' | 'compact') => {
    if (!editor) return;
    const current = Boolean(editor.getAttributes('table')[attr]);
    editor.chain().focus().updateAttributes('table', { [attr]: !current }).run();
  };

  const resetTableStyles = () => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .updateAttributes('table', {
        striped: false,
        headerHighlight: false,
        minimalBorder: false,
        compact: false,
      })
      .run();
  };

  const [floatingMenuPos, setFloatingMenuPos] = useState<{ top: number; left: number } | null>(null);

  // Position floating bubble menu without overlapping top toolbar or active cells
  const updateFloatingMenuPosition = useCallback(() => {
    if (!editor || !containerRef.current || isImageModalOpen) {
      setFloatingMenuPos(null);
      return;
    }

    const { view } = editor;
    const sel = view.state.selection;
    const isTable = editor.isActive('table');
    const isImage = editor.isActive('image');
    const cellSel = '$anchorCell' in sel;
    const hasTextSel = !sel.empty && !isImage && !cellSel;

    if (!hasTextSel && !isTable && !isImage) {
      setFloatingMenuPos(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const menuWidth = floatingMenuRef.current?.offsetWidth || (isTable ? 430 : isImage ? 80 : 180);
    const menuHeight = floatingMenuRef.current?.offsetHeight || 36;

    if (isImage) {
      try {
        const fromPos = view.coordsAtPos(sel.from);
        let top = fromPos.top - containerRect.top - menuHeight - 8;
        if (top < 44) {
          top = fromPos.bottom - containerRect.top + 8;
        }
        const left = Math.max(0, Math.min(fromPos.left - containerRect.left, Math.max(0, containerRect.width - menuWidth)));
        setFloatingMenuPos({ top, left });
        return;
      } catch {}
    }

    if (hasTextSel) {
      try {
        const startCoords = view.coordsAtPos(sel.from);
        const endCoords = view.coordsAtPos(sel.to);
        const selTop = Math.min(startCoords.top, endCoords.top);
        const selBottom = Math.max(startCoords.bottom, endCoords.bottom);
        const selCenter = (startCoords.left + endCoords.right) / 2;

        let top = selTop - containerRect.top - menuHeight - 8;
        if (top < 44) {
          top = selBottom - containerRect.top + 8;
        }

        const clampedWidth = Math.min(menuWidth, containerRect.width);
        let left = selCenter - containerRect.left - clampedWidth / 2;
        left = Math.max(0, Math.min(left, Math.max(0, containerRect.width - clampedWidth)));

        setFloatingMenuPos({ top, left });
        return;
      } catch {}
    }

    if (isTable) {
      let domNode: HTMLElement | null = null;
      let cursorTop = 0;
      try {
        const fromPos = view.coordsAtPos(sel.from);
        cursorTop = fromPos.top;
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
      const spaceAboveTable = tableRect.top - containerRect.top - 44;
      let top: number;

      if (spaceAboveTable >= menuHeight + 8) {
        top = tableRect.top - containerRect.top - menuHeight - 8;
      } else if (tableRect.height < 320) {
        top = tableRect.bottom - containerRect.top + 8;
      } else {
        top = Math.max(46, cursorTop - containerRect.top - menuHeight - 8);
      }

      const maxLeft = Math.max(0, containerRect.width - Math.min(menuWidth, containerRect.width));
      const left = Math.max(0, Math.min(tableRect.left - containerRect.left, maxLeft));

      setFloatingMenuPos({ top, left });
    }
  }, [editor, isImageModalOpen]);

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

  useEffect(() => {
    if (!isMenuVisible) return;
    const rafId = requestAnimationFrame(updateFloatingMenuPosition);
    return () => cancelAnimationFrame(rafId);
  }, [isMenuVisible, isTableActive, isImageActive, hasTextSelection, hasAnyTableStyle, updateFloatingMenuPosition]);

  if (!editor) {
    return (
      <div className="w-full min-h-[160px] bg-transparent p-2 animate-pulse text-[#9CA3AF] text-sm font-sans">
        에디터 초기화 중...
      </div>
    );
  }

  // Minimal unobtrusive formatting toolbar button helpers
  const topBtnClass = (active: boolean) =>
    `p-1.5 rounded-md transition-colors cursor-pointer ${
      active
        ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
        : 'text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827]'
    }`;

  const bubbleBtnClass = (active = false, destructive = false) =>
    `p-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
      destructive
        ? 'text-[#6B7280] hover:bg-[#FEF2F2] hover:text-[#B91C1C]'
        : active
        ? 'bg-[#EFF6FF] text-[#1E3A8A] font-semibold'
        : 'text-[#4B5563] hover:bg-[#F7F8FA] hover:text-[#111827]'
    }`;

  return (
    <div ref={containerRef} className="relative flex flex-col w-full">
      {/* Top Minimal Unobtrusive Formatting Toolbar */}
      <div className="flex items-center gap-0.5 pb-2.5 mb-3 border-b border-[#E5E7EB]/80 flex-wrap select-none">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={topBtnClass(editor.isActive('bold'))}
          title="굵게 (Ctrl+B)"
          aria-label="굵게"
        >
          <Bold size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={topBtnClass(editor.isActive('italic'))}
          title="기울임 (Ctrl+I)"
          aria-label="기울임"
        >
          <Italic size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className={topBtnClass(editor.isActive('underline'))}
          title="밑줄 (Ctrl+U)"
          aria-label="밑줄"
        >
          <UnderlineIcon size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={topBtnClass(editor.isActive('strike'))}
          title="취소선"
          aria-label="취소선"
        >
          <Strikethrough size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={topBtnClass(editor.isActive('code'))}
          title="인라인 코드"
          aria-label="인라인 코드"
        >
          <Code size={13} />
        </button>

        <span className="w-px h-3.5 bg-[#E5E7EB] mx-1" />

        {/* Headings (Icon-only) */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 1 }))}
          title="제목 1 (H1)"
          aria-label="제목 1"
        >
          <Heading1 size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 2 }))}
          title="제목 2 (H2)"
          aria-label="제목 2"
        >
          <Heading2 size={14} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 3 }))}
          title="제목 3 (H3)"
          aria-label="제목 3"
        >
          <Heading3 size={14} />
        </button>

        <span className="w-px h-3.5 bg-[#E5E7EB] mx-1" />

        {/* Lists & Blocks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={topBtnClass(editor.isActive('bulletList'))}
          title="글머리 기호 목록"
          aria-label="글머리 기호 목록"
        >
          <List size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={topBtnClass(editor.isActive('orderedList'))}
          title="번호 매기기 목록"
          aria-label="번호 매기기 목록"
        >
          <ListOrdered size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={topBtnClass(editor.isActive('blockquote'))}
          title="인용구"
          aria-label="인용구"
        >
          <Quote size={13} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={topBtnClass(false)}
          title="구분선 삽입"
          aria-label="구분선 삽입"
        >
          <Minus size={13} />
        </button>

        <span className="w-px h-3.5 bg-[#E5E7EB] mx-1" />

        {/* Image Insertion (Icon-only + Single Non-overlapping Popover) */}
        <div ref={imagePopoverRef} className="relative">
          <button
            type="button"
            onClick={() => setIsImageModalOpen((prev) => !prev)}
            className={topBtnClass(isImageModalOpen || editor.isActive('image'))}
            title="이미지 삽입 (업로드 · URL · 붙여넣기)"
            aria-label="이미지 삽입"
          >
            <ImageIcon size={13} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageFileUpload(file);
                e.target.value = '';
                setIsImageModalOpen(false);
              }
            }}
          />

          {isImageModalOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-3.5 shadow-[0_12px_32px_-4px_rgba(15,23,42,0.12)] flex flex-col gap-2.5 text-xs text-[#111827]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#4B5563] font-semibold flex items-center gap-1.5">
                  <ImageIcon size={12} className="text-[#1E3A8A]" />
                  이미지 삽입
                </span>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1 text-[#9CA3AF] hover:text-[#111827] rounded-md cursor-pointer"
                  aria-label="닫기"
                >
                  <X size={12} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#F7F8FA] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#1E3A8A] font-medium text-xs transition-colors cursor-pointer"
              >
                <Upload size={13} className="text-[#1E3A8A]" />
                <span>파일 선택</span>
              </button>

              <form onSubmit={handleImageUrlSubmit} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https:// 이미지 URL"
                    className="flex-1 bg-[#F7F8FA] focus:bg-[#FFFFFF] border border-transparent focus:border-[#1E3A8A]/30 focus:ring-2 focus:ring-[#1E3A8A]/15 focus:outline-none px-3 py-1.5 rounded-lg text-xs text-[#111827] placeholder-[#9CA3AF] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!imageUrlInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] disabled:opacity-35 disabled:cursor-not-allowed text-white text-xs font-medium cursor-pointer transition-colors"
                  >
                    삽입
                  </button>
                </div>
              </form>

              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                캔버스 내 <kbd className="px-1.5 py-0.5 bg-[#F7F8FA] border border-[#E5E7EB] rounded text-[#111827] font-mono">Ctrl+V</kbd> 또는 드래그로도 삽입됩니다.
              </p>
            </div>
          )}
        </div>

        {/* Table Insertion (Icon-only; contextual actions live in the floating menu) */}
        <button
          type="button"
          onClick={() => {
            if (!isTableActive) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            } else {
              editor.chain().focus().run();
            }
          }}
          className={topBtnClass(isTableActive)}
          title={isTableActive ? '표 편집 중 (플로팅 메뉴 사용)' : '표 삽입 (3×3)'}
          aria-label="표 삽입"
        >
          <TableIcon size={13} />
        </button>

        {/* History: Undo / Redo */}
        <div className="ml-auto flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="실행 취소 (Ctrl+Z)"
            aria-label="실행 취소"
          >
            <Undo size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-md text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#111827] disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="다시 실행 (Ctrl+Y)"
            aria-label="다시 실행"
          >
            <Redo size={13} />
          </button>
        </div>
      </div>

      {/* Contextual Minimalist Icon-Only Floating Bubble Menu */}
      {isMenuVisible && floatingMenuPos && (
        <div
          ref={floatingMenuRef}
          style={{
            top: `${floatingMenuPos.top}px`,
            left: `${floatingMenuPos.left}px`,
          }}
          onMouseDown={(e) => {
            // Keep active editor selection when clicking floating controls
            e.preventDefault();
          }}
          className="absolute z-40 flex items-center gap-0.5 p-1 bg-[#FFFFFF]/95 border border-[#E5E7EB] rounded-lg backdrop-blur-md select-none transition-all duration-150 tiptap-table-bubble-menu max-w-full overflow-x-auto no-scrollbar"
        >
          {/* Context 1: Selected Image Actions */}
          {isImageActive && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={bubbleBtnClass(false)}
                title="다른 이미지로 교체"
                aria-label="이미지 교체"
              >
                <Upload size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteSelection().run()}
                className={bubbleBtnClass(false, true)}
                title="이미지 삭제"
                aria-label="이미지 삭제"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}

          {/* Context 2: Text Selection Formatting (outside table or text dragged inside a cell) */}
          {hasTextSelection && (
            <>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={bubbleBtnClass(editor.isActive('bold'))}
                title="굵게 (Ctrl+B)"
                aria-label="굵게"
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={bubbleBtnClass(editor.isActive('italic'))}
                title="기울임 (Ctrl+I)"
                aria-label="기울임"
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={bubbleBtnClass(editor.isActive('underline'))}
                title="밑줄 (Ctrl+U)"
                aria-label="밑줄"
              >
                <UnderlineIcon size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={bubbleBtnClass(editor.isActive('strike'))}
                title="취소선"
                aria-label="취소선"
              >
                <Strikethrough size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={bubbleBtnClass(editor.isActive('code'))}
                title="인라인 코드"
                aria-label="인라인 코드"
              >
                <Code size={13} />
              </button>
            </>
          )}

          {/* Context 3: Table Structure & Visual Styles (single clean icon row) */}
          {isTableActive && !hasTextSelection && !isImageActive && (
            <>
              {/* Row Management */}
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className={bubbleBtnClass(false)}
                title="위에 행 추가"
                aria-label="위에 행 추가"
              >
                <ArrowUpFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className={bubbleBtnClass(false)}
                title="아래에 행 추가"
                aria-label="아래에 행 추가"
              >
                <ArrowDownFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className={bubbleBtnClass(false, true)}
                title="현재 행 삭제"
                aria-label="현재 행 삭제"
              >
                <ListMinus size={13} />
              </button>

              <span className="w-px h-3.5 bg-[#E5E7EB] mx-0.5 shrink-0" />

              {/* Column Management */}
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className={bubbleBtnClass(false)}
                title="왼쪽에 열 추가"
                aria-label="왼쪽에 열 추가"
              >
                <ArrowLeftFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className={bubbleBtnClass(false)}
                title="오른쪽에 열 추가"
                aria-label="오른쪽에 열 추가"
              >
                <ArrowRightFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className={bubbleBtnClass(false, true)}
                title="현재 열 삭제"
                aria-label="현재 열 삭제"
              >
                <SquareMinus size={13} />
              </button>

              <span className="w-px h-3.5 bg-[#E5E7EB] mx-0.5 shrink-0" />

              {/* Cell Merge / Split / Header Row */}
              <button
                type="button"
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
                className={`${bubbleBtnClass(false)} disabled:opacity-25 disabled:cursor-not-allowed`}
                title="선택된 셀 병합"
                aria-label="셀 병합"
              >
                <TableCellsMerge size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
                className={`${bubbleBtnClass(false)} disabled:opacity-25 disabled:cursor-not-allowed`}
                title="병합된 셀 분할"
                aria-label="셀 분할"
              >
                <TableCellsSplit size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className={bubbleBtnClass(false)}
                title="상단 헤더 행 켜기/끄기"
                aria-label="헤더 행 토글"
              >
                <PanelTopDashed size={13} />
              </button>

              <span className="w-px h-3.5 bg-[#E5E7EB] mx-0.5 shrink-0" />

              {/* Visual Style Toggles */}
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('striped')}
                className={bubbleBtnClass(isStriped)}
                title="줄무늬 행 스타일"
                aria-label="줄무늬 행 스타일"
              >
                <Rows3 size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('headerHighlight')}
                className={bubbleBtnClass(isHeaderHighlighted)}
                title="헤더 강조 스타일"
                aria-label="헤더 강조 스타일"
              >
                <PanelTop size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('minimalBorder')}
                className={bubbleBtnClass(isMinimalBorder)}
                title="미니멀 수평선 스타일"
                aria-label="미니멀 수평선 스타일"
              >
                <SeparatorHorizontal size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('compact')}
                className={bubbleBtnClass(isCompact)}
                title="컴팩트 밀도 스타일"
                aria-label="컴팩트 밀도 스타일"
              >
                <Minimize2 size={13} />
              </button>

              {hasAnyTableStyle && (
                <button
                  type="button"
                  onClick={resetTableStyles}
                  className={bubbleBtnClass(false)}
                  title="기본 표 스타일로 초기화"
                  aria-label="스타일 초기화"
                >
                  <RotateCcw size={12} />
                </button>
              )}

              <span className="w-px h-3.5 bg-[#E5E7EB] mx-0.5 shrink-0" />

              {/* Delete Table */}
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className={bubbleBtnClass(false, true)}
                title="표 전체 삭제"
                aria-label="표 삭제"
              >
                <Trash2 size={13} />
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
