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
  Table as TableIcon, Trash2, Upload, X, Image as ImageIcon, Paperclip, FileText,
  ArrowUpFromLine, ArrowDownFromLine, ArrowLeftFromLine, ArrowRightFromLine,
  ListMinus, SquareMinus, TableCellsMerge, TableCellsSplit,
  PanelTopDashed, Rows3, PanelTop, SeparatorHorizontal, Minimize2, RotateCcw
} from 'lucide-react';
import { SectionAttachment } from '../../types/schema';
import {
  SUPPORTED_ATTACHMENT_ACCEPT,
  parseDocumentAttachment,
  formatAttachmentBytes,
} from '../../lib/documentAttachmentParser';
import { useLanguage } from '../../contexts/LanguageContext';

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
  readOnly?: boolean;
  attachments?: SectionAttachment[];
  onAttachmentsChange?: (attachments: SectionAttachment[]) => void;
}

export const TiptapThinkingCanvas: React.FC<TiptapThinkingCanvasProps> = ({
  value,
  onChange,
  placeholder,
  largeTextMode = false,
  readOnly = false,
  attachments = [],
  onAttachmentsChange,
}) => {
  const { pick } = useLanguage();
  const resolvedPlaceholder =
    placeholder ||
    pick({
      ko: '생각나는 내용을 한 줄 또는 문장으로 서술해 주세요...',
      en: 'Describe what comes to mind in a line or paragraph...',
      ja: '思いついた内容を1行または文章で記述してください...',
      id: 'Tuliskan ide Anda dalam satu baris atau kalimat...',
    });
  const isInternalUpdateRef = useRef(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isParsingAttachment, setIsParsingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
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
            class: 'bg-[var(--theme-stage)] p-4 rounded-none font-mono text-[16px] text-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] my-4',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-y border-[var(--theme-border-hairline)] py-4 px-3 my-5 font-sans text-[var(--theme-ink-secondary)] not-italic',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-6 my-3 space-y-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-6 my-3 space-y-2',
          },
        },
      }),
      Placeholder.configure({
        placeholder: resolvedPlaceholder,
        emptyEditorClass:
          'is-editor-empty before:content-[attr(data-placeholder)] before:text-[var(--theme-ink-muted)] before:float-left before:pointer-events-none before:h-0',
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
          class: 'tiptap-table-root w-full my-4 border-collapse',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'tiptap-th bg-[var(--theme-active-bg)] text-[var(--theme-bar-text)] font-bold text-[16px] text-left p-3 border border-[var(--theme-border-hairline)]',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'tiptap-td p-3 text-[17px] text-[var(--theme-ink-body)] border border-[var(--theme-border-hairline)] bg-[var(--theme-canvas)] align-top',
        },
      }),
    ],
    editable: !readOnly,
    content: value || '',
    editorProps: {
      attributes: {
        class: `w-full bg-transparent py-1 outline-none font-sans transition-all duration-200 focus:outline-none ${
          readOnly ? 'text-[var(--theme-ink-secondary)] cursor-not-allowed select-text' : 'text-[var(--theme-ink-body)]'
        } ${
          largeTextMode
            ? 'text-[21px] sm:text-[23px] leading-[1.85] tracking-[-0.01em] min-h-[240px]'
            : 'text-[19px] sm:text-[20px] font-normal leading-[1.85] tracking-[-0.01em] min-h-[200px]'
        }`,
      },
      handlePaste: (view, event) => {
        if (!view.editable) return false;
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
        if (!view.editable) return false;
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
  }, [resolvedPlaceholder]);

  // Handle attaching reference documents (md, txt, pdf, office)
  const handleDocumentFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || readOnly || !onAttachmentsChange) return;
    setAttachmentError(null);
    setIsParsingAttachment(true);
    try {
      const parsedList: SectionAttachment[] = [];
      for (const file of Array.from(fileList)) {
        const parsed = await parseDocumentAttachment(file);
        parsedList.push(parsed);
      }
      if (parsedList.length > 0) {
        onAttachmentsChange([...attachments, ...parsedList]);
      }
    } catch (err: any) {
      setAttachmentError(
        err?.message ||
          pick({
            ko: '파일을 읽는 중 오류가 발생했습니다.',
            en: 'An error occurred while reading the file.',
            ja: 'ファイルの読み込み中にエラーが発生しました。',
            id: 'Terjadi kesalahan saat membaca file.',
          })
      );
    } finally {
      setIsParsingAttachment(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (readOnly || !onAttachmentsChange) return;
    setAttachmentError(null);
    onAttachmentsChange(attachments.filter(att => att.id !== attachmentId));
  };

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

  // Sync readOnly lock state safely without resetting editor content
  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!readOnly);
    if (readOnly) {
      setIsImageModalOpen(false);
    }
  }, [editor, readOnly]);

  const isTableActive = editor ? editor.isActive('table') : false;
  const isImageActive = editor ? editor.isActive('image') : false;
  const selection = editor?.state.selection;
  const isCellSelection = Boolean(selection && '$anchorCell' in selection);
  const hasTextSelection = Boolean(selection && !selection.empty && !isImageActive && !isCellSelection);

  // Suppress floating bubble menu while readOnly or image insertion popover is open
  const isMenuVisible = !readOnly && !isImageModalOpen && (isTableActive || hasTextSelection || isImageActive);

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
        if (top < 58) {
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
        if (top < 58) {
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
      const spaceAboveTable = tableRect.top - containerRect.top - 58;
      let top: number;

      if (spaceAboveTable >= menuHeight + 8) {
        top = tableRect.top - containerRect.top - menuHeight - 8;
      } else if (tableRect.height < 320) {
        top = tableRect.bottom - containerRect.top + 8;
      } else {
        top = Math.max(58, cursorTop - containerRect.top - menuHeight - 8);
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
      <div className="w-full min-h-[200px] bg-transparent p-2 animate-pulse text-[var(--theme-ink-muted)] text-[18px] font-sans">
        {pick({
          ko: '에디터 초기화 중...',
          en: 'Initializing editor...',
          ja: 'エディターを初期化中...',
          id: 'Menginisialisasi editor...',
        })}
      </div>
    );
  }

  // Bright, high-contrast fixed formatting toolbar button helpers (Theme-Aware Sharp Ink)
  const topBtnClass = (active: boolean) =>
    `p-2 rounded-none transition-colors cursor-pointer flex items-center justify-center ${
      active
        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-bold'
        : 'text-[var(--theme-ink-strong)] hover:bg-[var(--theme-bar-accent)] hover:text-[var(--theme-bar-bg)]'
    } disabled:opacity-35 disabled:cursor-not-allowed`;

  const bubbleBtnClass = (active = false, destructive = false) =>
    `p-2 rounded-none transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
      destructive
        ? 'text-[var(--theme-ink-strong)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
        : active
        ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] font-bold'
        : 'text-[var(--theme-ink-strong)] hover:bg-[var(--theme-bar-accent)] hover:text-[var(--theme-bar-bg)]'
    }`;

  return (
    <div ref={containerRef} className="relative flex flex-col w-full">
      {/* Pinned High-Luminance Formatting Toolbar (Always fixed at editor top) */}
      <div
        onMouseDown={(e) => {
          if (!imagePopoverRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
        className={`sticky top-0 z-20 flex items-center gap-1 px-3 py-2.5 mb-5 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] border-b-[var(--theme-ink-strong)] flex-wrap select-none ${
          readOnly ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={readOnly || !editor.can().chain().focus().toggleBold().run()}
          className={topBtnClass(editor.isActive('bold'))}
          title={pick({ ko: '굵게 (Ctrl+B)', en: 'Bold (Ctrl+B)', ja: '太字 (Ctrl+B)', id: 'Tebal (Ctrl+B)' })}
          aria-label={pick({ ko: '굵게', en: 'Bold', ja: '太字', id: 'Tebal' })}
        >
          <Bold size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={readOnly || !editor.can().chain().focus().toggleItalic().run()}
          className={topBtnClass(editor.isActive('italic'))}
          title={pick({ ko: '기울임 (Ctrl+I)', en: 'Italic (Ctrl+I)', ja: '斜体 (Ctrl+I)', id: 'Miring (Ctrl+I)' })}
          aria-label={pick({ ko: '기울임', en: 'Italic', ja: '斜体', id: 'Miring' })}
        >
          <Italic size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={readOnly || !editor.can().chain().focus().toggleUnderline().run()}
          className={topBtnClass(editor.isActive('underline'))}
          title={pick({ ko: '밑줄 (Ctrl+U)', en: 'Underline (Ctrl+U)', ja: '下線 (Ctrl+U)', id: 'Garis bawah (Ctrl+U)' })}
          aria-label={pick({ ko: '밑줄', en: 'Underline', ja: '下線', id: 'Garis bawah' })}
        >
          <UnderlineIcon size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={readOnly || !editor.can().chain().focus().toggleStrike().run()}
          className={topBtnClass(editor.isActive('strike'))}
          title={pick({ ko: '취소선', en: 'Strikethrough', ja: '取り消し線', id: 'Coret' })}
          aria-label={pick({ ko: '취소선', en: 'Strikethrough', ja: '取り消し線', id: 'Coret' })}
        >
          <Strikethrough size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={readOnly || !editor.can().chain().focus().toggleCode().run()}
          className={topBtnClass(editor.isActive('code'))}
          title={pick({ ko: '인라인 코드', en: 'Inline Code', ja: 'インラインコード', id: 'Kode Sebaris' })}
          aria-label={pick({ ko: '인라인 코드', en: 'Inline Code', ja: 'インラインコード', id: 'Kode Sebaris' })}
        >
          <Code size={16} strokeWidth={2.2} />
        </button>

        <span className="w-px h-4 bg-[var(--theme-border-strong)] mx-1.5" />

        {/* Headings */}
        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 1 }))}
          title={pick({ ko: '제목 1 (H1)', en: 'Heading 1 (H1)', ja: '見出し 1 (H1)', id: 'Judul 1 (H1)' })}
          aria-label={pick({ ko: '제목 1', en: 'Heading 1', ja: '見出し 1', id: 'Judul 1' })}
        >
          <Heading1 size={17} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 2 }))}
          title={pick({ ko: '제목 2 (H2)', en: 'Heading 2 (H2)', ja: '見出し 2 (H2)', id: 'Judul 2 (H2)' })}
          aria-label={pick({ ko: '제목 2', en: 'Heading 2', ja: '見出し 2', id: 'Judul 2' })}
        >
          <Heading2 size={17} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={topBtnClass(editor.isActive('heading', { level: 3 }))}
          title={pick({ ko: '제목 3 (H3)', en: 'Heading 3 (H3)', ja: '見出し 3 (H3)', id: 'Judul 3 (H3)' })}
          aria-label={pick({ ko: '제목 3', en: 'Heading 3', ja: '見出し 3', id: 'Judul 3' })}
        >
          <Heading3 size={17} strokeWidth={2.2} />
        </button>

        <span className="w-px h-4 bg-[var(--theme-border-strong)] mx-1.5" />

        {/* Lists & Blocks */}
        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={topBtnClass(editor.isActive('bulletList'))}
          title={pick({ ko: '글머리 기호 목록', en: 'Bullet List', ja: '箇条書きリスト', id: 'Daftar Poin' })}
          aria-label={pick({ ko: '글머리 기호 목록', en: 'Bullet List', ja: '箇条書きリスト', id: 'Daftar Poin' })}
        >
          <List size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={topBtnClass(editor.isActive('orderedList'))}
          title={pick({ ko: '번호 매기기 목록', en: 'Numbered List', ja: '番号付きリスト', id: 'Daftar Bernomor' })}
          aria-label={pick({ ko: '번호 매기기 목록', en: 'Numbered List', ja: '番号付きリスト', id: 'Daftar Bernomor' })}
        >
          <ListOrdered size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={topBtnClass(editor.isActive('blockquote'))}
          title={pick({ ko: '인용구', en: 'Blockquote', ja: '引用', id: 'Kutipan' })}
          aria-label={pick({ ko: '인용구', en: 'Blockquote', ja: '引用', id: 'Kutipan' })}
        >
          <Quote size={16} strokeWidth={2.2} />
        </button>

        <button
          type="button"
          disabled={readOnly}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={topBtnClass(false)}
          title={pick({ ko: '구분선 삽입', en: 'Insert Divider', ja: '区切り線を挿入', id: 'Sisipkan Pemisah' })}
          aria-label={pick({ ko: '구분선 삽입', en: 'Insert Divider', ja: '区切り線を挿入', id: 'Sisipkan Pemisah' })}
        >
          <Minus size={16} strokeWidth={2.2} />
        </button>

        <span className="w-px h-4 bg-[var(--theme-border-strong)] mx-1.5" />

        {/* Image Insertion */}
        <div ref={imagePopoverRef} className="relative">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setIsImageModalOpen((prev) => !prev)}
            className={topBtnClass(isImageModalOpen || editor.isActive('image'))}
            title={pick({
              ko: '이미지 삽입 (업로드 · URL · 붙여넣기)',
              en: 'Insert Image (Upload · URL · Paste)',
              ja: '画像を挿入 (アップロード · URL · 貼り付け)',
              id: 'Sisipkan Gambar (Unggah · URL · Tempel)',
            })}
            aria-label={pick({ ko: '이미지 삽입', en: 'Insert Image', ja: '画像を挿入', id: 'Sisipkan Gambar' })}
          >
            <ImageIcon size={16} strokeWidth={2.2} />
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
            <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] rounded-none p-5 shadow-none flex flex-col gap-3.5 text-[16px] text-[var(--theme-ink-primary)]">
              <div className="flex items-center justify-between pb-2.5 border-b border-[var(--theme-border-hairline)]">
                <span className="font-sans text-[16px] tracking-tight text-[var(--theme-ink-strong)] font-bold flex items-center gap-2">
                  <ImageIcon size={15} className="text-[var(--theme-ink-strong)]" />
                  {pick({ ko: '이미지 삽입', en: 'Insert Image', ja: '画像を挿入', id: 'Sisipkan Gambar' })}
                </span>
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] rounded-none cursor-pointer"
                  aria-label={pick({ ko: '닫기', en: 'Close', ja: '閉じる', id: 'Tutup' })}
                >
                  <X size={15} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] hover:bg-[var(--theme-active-bg)] text-[var(--theme-ink-primary)] hover:text-[var(--theme-active-text)] hover:border-[var(--theme-ink-strong)] font-bold text-[15px] transition-colors cursor-pointer"
              >
                <Upload size={15} />
                <span>{pick({ ko: '파일 선택', en: 'Choose File', ja: 'ファイルを選択', id: 'Pilih File' })}</span>
              </button>

              <form onSubmit={handleImageUrlSubmit} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder={pick({ ko: 'https:// 이미지 URL', en: 'https:// Image URL', ja: 'https:// 画像URL', id: 'https:// URL Gambar' })}
                    className="flex-1 bg-[var(--theme-canvas)] border border-[var(--theme-border-hairline)] focus:border-[var(--theme-ink-strong)] focus:outline-none px-3.5 py-2.5 rounded-none text-[15px] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!imageUrlInput.trim()}
                    className="px-4 py-2.5 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] disabled:opacity-35 disabled:cursor-not-allowed text-[var(--theme-btn-text)] text-[15px] font-bold cursor-pointer transition-colors"
                  >
                    {pick({ ko: '삽입', en: 'Insert', ja: '挿入', id: 'Sisipkan' })}
                  </button>
                </div>
              </form>

              <p className="text-[14px] text-[var(--theme-ink-secondary)] leading-relaxed">
                {pick({
                  ko: (
                    <>
                      캔버스 내 <kbd className="px-2 py-0.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[var(--theme-ink-strong)] font-mono">Ctrl+V</kbd> 또는 드래그로도 삽입됩니다.
                    </>
                  ),
                  en: (
                    <>
                      You can also paste with <kbd className="px-2 py-0.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[var(--theme-ink-strong)] font-mono">Ctrl+V</kbd> or drag &amp; drop.
                    </>
                  ),
                  ja: (
                    <>
                      キャンバス内で <kbd className="px-2 py-0.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[var(--theme-ink-strong)] font-mono">Ctrl+V</kbd> またはドラッグでも挿入できます。
                    </>
                  ),
                  id: (
                    <>
                      Anda juga dapat menempel dengan <kbd className="px-2 py-0.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[var(--theme-ink-strong)] font-mono">Ctrl+V</kbd> atau seret &amp; lepas.
                    </>
                  ),
                })}
              </p>
            </div>
          )}
        </div>

        {/* Table Insertion */}
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            if (!isTableActive) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            } else {
              editor.chain().focus().run();
            }
          }}
          className={topBtnClass(isTableActive)}
          title={
            isTableActive
              ? pick({ ko: '표 편집 중 (플로팅 메뉴 사용)', en: 'Editing Table (Use Floating Menu)', ja: '表を編集中 (フローティングメニューを使用)', id: 'Mengedit Tabel (Gunakan Menu Mengambang)' })
              : pick({ ko: '표 삽입 (3×3)', en: 'Insert Table (3×3)', ja: '表を挿入 (3×3)', id: 'Sisipkan Tabel (3×3)' })
          }
          aria-label={pick({ ko: '표 삽입', en: 'Insert Table', ja: '表を挿入', id: 'Sisipkan Tabel' })}
        >
          <TableIcon size={16} strokeWidth={2.2} />
        </button>

        {/* History: Undo / Redo */}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={readOnly || !editor.can().undo()}
            className={topBtnClass(false)}
            title={pick({ ko: '실행 취소 (Ctrl+Z)', en: 'Undo (Ctrl+Z)', ja: '元に戻す (Ctrl+Z)', id: 'Urungkan (Ctrl+Z)' })}
            aria-label={pick({ ko: '실행 취소', en: 'Undo', ja: '元に戻す', id: 'Urungkan' })}
          >
            <Undo size={16} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={readOnly || !editor.can().redo()}
            className={topBtnClass(false)}
            title={pick({ ko: '다시 실행 (Ctrl+Y)', en: 'Redo (Ctrl+Y)', ja: 'やり直し (Ctrl+Y)', id: 'Ulangi (Ctrl+Y)' })}
            aria-label={pick({ ko: '다시 실행', en: 'Redo', ja: 'やり直し', id: 'Ulangi' })}
          >
            <Redo size={16} strokeWidth={2.2} />
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
          className="absolute z-40 flex items-center gap-0.5 p-1.5 bg-[var(--theme-elevated)] border border-[var(--theme-ink-strong)] rounded-none select-none transition-all duration-150 tiptap-table-bubble-menu max-w-full overflow-x-auto no-scrollbar"
        >
          {/* Context 1: Selected Image Actions */}
          {isImageActive && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={bubbleBtnClass(false)}
                title={pick({ ko: '다른 이미지로 교체', en: 'Replace Image', ja: '別の画像に置換', id: 'Ganti Gambar' })}
                aria-label={pick({ ko: '이미지 교체', en: 'Replace Image', ja: '画像を置換', id: 'Ganti Gambar' })}
              >
                <Upload size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteSelection().run()}
                className={bubbleBtnClass(false, true)}
                title={pick({ ko: '이미지 삭제', en: 'Delete Image', ja: '画像を削除', id: 'Hapus Gambar' })}
                aria-label={pick({ ko: '이미지 삭제', en: 'Delete Image', ja: '画像を削除', id: 'Hapus Gambar' })}
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
                title={pick({ ko: '굵게 (Ctrl+B)', en: 'Bold (Ctrl+B)', ja: '太字 (Ctrl+B)', id: 'Tebal (Ctrl+B)' })}
                aria-label={pick({ ko: '굵게', en: 'Bold', ja: '太字', id: 'Tebal' })}
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={bubbleBtnClass(editor.isActive('italic'))}
                title={pick({ ko: '기울임 (Ctrl+I)', en: 'Italic (Ctrl+I)', ja: '斜体 (Ctrl+I)', id: 'Miring (Ctrl+I)' })}
                aria-label={pick({ ko: '기울임', en: 'Italic', ja: '斜体', id: 'Miring' })}
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={!editor.can().chain().focus().toggleUnderline().run()}
                className={bubbleBtnClass(editor.isActive('underline'))}
                title={pick({ ko: '밑줄 (Ctrl+U)', en: 'Underline (Ctrl+U)', ja: '下線 (Ctrl+U)', id: 'Garis bawah (Ctrl+U)' })}
                aria-label={pick({ ko: '밑줄', en: 'Underline', ja: '下線', id: 'Garis bawah' })}
              >
                <UnderlineIcon size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={bubbleBtnClass(editor.isActive('strike'))}
                title={pick({ ko: '취소선', en: 'Strikethrough', ja: '取り消し線', id: 'Coret' })}
                aria-label={pick({ ko: '취소선', en: 'Strikethrough', ja: '取り消し線', id: 'Coret' })}
              >
                <Strikethrough size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                disabled={!editor.can().chain().focus().toggleCode().run()}
                className={bubbleBtnClass(editor.isActive('code'))}
                title={pick({ ko: '인라인 코드', en: 'Inline Code', ja: 'インラインコード', id: 'Kode Sebaris' })}
                aria-label={pick({ ko: '인라인 코드', en: 'Inline Code', ja: 'インラインコード', id: 'Kode Sebaris' })}
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
                title={pick({ ko: '위에 행 추가', en: 'Add Row Above', ja: '上に行を追加', id: 'Tambah Baris di Atas' })}
                aria-label={pick({ ko: '위에 행 추가', en: 'Add Row Above', ja: '上に行を追加', id: 'Tambah Baris di Atas' })}
              >
                <ArrowUpFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className={bubbleBtnClass(false)}
                title={pick({ ko: '아래에 행 추가', en: 'Add Row Below', ja: '下に行を追加', id: 'Tambah Baris di Bawah' })}
                aria-label={pick({ ko: '아래에 행 추가', en: 'Add Row Below', ja: '下に行を追加', id: 'Tambah Baris di Bawah' })}
              >
                <ArrowDownFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className={bubbleBtnClass(false, true)}
                title={pick({ ko: '현재 행 삭제', en: 'Delete Row', ja: '現在の行を削除', id: 'Hapus Baris Ini' })}
                aria-label={pick({ ko: '현재 행 삭제', en: 'Delete Row', ja: '現在の行を削除', id: 'Hapus Baris Ini' })}
              >
                <ListMinus size={13} />
              </button>

              <span className="w-px h-3.5 bg-[var(--theme-border-hairline)] mx-0.5 shrink-0" />

              {/* Column Management */}
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className={bubbleBtnClass(false)}
                title={pick({ ko: '왼쪽에 열 추가', en: 'Add Column Left', ja: '左に列を追加', id: 'Tambah Kolom di Kiri' })}
                aria-label={pick({ ko: '왼쪽에 열 추가', en: 'Add Column Left', ja: '左に列を追加', id: 'Tambah Kolom di Kiri' })}
              >
                <ArrowLeftFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className={bubbleBtnClass(false)}
                title={pick({ ko: '오른쪽에 열 추가', en: 'Add Column Right', ja: '右に列を追加', id: 'Tambah Kolom di Kanan' })}
                aria-label={pick({ ko: '오른쪽에 열 추가', en: 'Add Column Right', ja: '右に列を追加', id: 'Tambah Kolom di Kanan' })}
              >
                <ArrowRightFromLine size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className={bubbleBtnClass(false, true)}
                title={pick({ ko: '현재 열 삭제', en: 'Delete Column', ja: '現在の列を削除', id: 'Hapus Kolom Ini' })}
                aria-label={pick({ ko: '현재 열 삭제', en: 'Delete Column', ja: '現在の列を削除', id: 'Hapus Kolom Ini' })}
              >
                <SquareMinus size={13} />
              </button>

              <span className="w-px h-3.5 bg-[var(--theme-border-hairline)] mx-0.5 shrink-0" />

              {/* Cell Merge / Split / Header Row */}
              <button
                type="button"
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
                className={`${bubbleBtnClass(false)} disabled:opacity-25 disabled:cursor-not-allowed`}
                title={pick({ ko: '선택된 셀 병합', en: 'Merge Cells', ja: '選択したセルを結合', id: 'Gabungkan Sel' })}
                aria-label={pick({ ko: '셀 병합', en: 'Merge Cells', ja: 'セルを結合', id: 'Gabungkan Sel' })}
              >
                <TableCellsMerge size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
                className={`${bubbleBtnClass(false)} disabled:opacity-25 disabled:cursor-not-allowed`}
                title={pick({ ko: '병합된 셀 분할', en: 'Split Cell', ja: '結合セルを分割', id: 'Pisahkan Sel' })}
                aria-label={pick({ ko: '셀 분할', en: 'Split Cell', ja: 'セルを分割', id: 'Pisahkan Sel' })}
              >
                <TableCellsSplit size={13} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                className={bubbleBtnClass(false)}
                title={pick({ ko: '상단 헤더 행 켜기/끄기', en: 'Toggle Header Row', ja: 'ヘッダー行の切り替え', id: 'Alihkan Baris Header' })}
                aria-label={pick({ ko: '헤더 행 토글', en: 'Toggle Header Row', ja: 'ヘッダー行の切り替え', id: 'Alihkan Baris Header' })}
              >
                <PanelTopDashed size={13} />
              </button>

              <span className="w-px h-3.5 bg-[var(--theme-border-hairline)] mx-0.5 shrink-0" />

              {/* Visual Style Toggles */}
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('striped')}
                className={bubbleBtnClass(isStriped)}
                title={pick({ ko: '줄무늬 행 스타일', en: 'Striped Rows', ja: 'ストライプ行スタイル', id: 'Baris Bergaris' })}
                aria-label={pick({ ko: '줄무늬 행 스타일', en: 'Striped Rows', ja: 'ストライプ行スタイル', id: 'Baris Bergaris' })}
              >
                <Rows3 size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('headerHighlight')}
                className={bubbleBtnClass(isHeaderHighlighted)}
                title={pick({ ko: '헤더 강조 스타일', en: 'Highlight Header', ja: 'ヘッダー強調スタイル', id: 'Sorot Header' })}
                aria-label={pick({ ko: '헤더 강조 스타일', en: 'Highlight Header', ja: 'ヘッダー強調スタイル', id: 'Sorot Header' })}
              >
                <PanelTop size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('minimalBorder')}
                className={bubbleBtnClass(isMinimalBorder)}
                title={pick({ ko: '미니멀 수평선 스타일', en: 'Minimal Borders', ja: 'ミニマル水平線スタイル', id: 'Garis Minimalis' })}
                aria-label={pick({ ko: '미니멀 수평선 스타일', en: 'Minimal Borders', ja: 'ミニマル水平線スタイル', id: 'Garis Minimalis' })}
              >
                <SeparatorHorizontal size={13} />
              </button>
              <button
                type="button"
                onClick={() => toggleTableStyleAttr('compact')}
                className={bubbleBtnClass(isCompact)}
                title={pick({ ko: '컴팩트 밀도 스타일', en: 'Compact Density', ja: 'コンパクト密度スタイル', id: 'Kepadatan Ringkas' })}
                aria-label={pick({ ko: '컴팩트 밀도 스타일', en: 'Compact Density', ja: 'コンパクト密度スタイル', id: 'Kepadatan Ringkas' })}
              >
                <Minimize2 size={13} />
              </button>

              {hasAnyTableStyle && (
                <button
                  type="button"
                  onClick={resetTableStyles}
                  className={bubbleBtnClass(false)}
                  title={pick({ ko: '기본 표 스타일로 초기화', en: 'Reset Table Style', ja: '基本の表スタイルに戻す', id: 'Reset Gaya Tabel' })}
                  aria-label={pick({ ko: '스타일 초기화', en: 'Reset Style', ja: 'スタイルを初期化', id: 'Reset Gaya' })}
                >
                  <RotateCcw size={12} />
                </button>
              )}

              <span className="w-px h-3.5 bg-[var(--theme-border-hairline)] mx-0.5 shrink-0" />

              {/* Delete Table */}
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className={bubbleBtnClass(false, true)}
                title={pick({ ko: '표 전체 삭제', en: 'Delete Table', ja: '表全体を削除', id: 'Hapus Tabel' })}
                aria-label={pick({ ko: '표 삭제', en: 'Delete Table', ja: '表を削除', id: 'Hapus Tabel' })}
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Tiptap Editor Content Mount */}
      <EditorContent editor={editor} className="tiptap-editor-wrap focus:outline-none" />

      {/* Bottom Document Attachment Footer (md, txt, pdf, office) */}
      <div className="mt-6 pt-4 border-t border-[var(--theme-border-hairline)] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              accept={SUPPORTED_ATTACHMENT_ACCEPT}
              className="hidden"
              onChange={(e) => {
                handleDocumentFilesSelected(e.target.files);
                e.target.value = '';
              }}
            />

            <button
              type="button"
              disabled={readOnly || isParsingAttachment || !onAttachmentsChange}
              onClick={() => attachmentInputRef.current?.click()}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-none text-[15px] font-bold border transition-colors whitespace-nowrap ${
                readOnly
                  ? 'border-[var(--theme-border-hairline)] text-[var(--theme-ink-muted)] bg-[var(--theme-stage)] cursor-not-allowed'
                  : 'border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-bar-accent)] hover:text-[var(--theme-bar-bg)] cursor-pointer disabled:opacity-45'
              }`}
              title={pick({
                ko: 'md, txt, pdf, office(docx, xlsx, pptx) 파일 첨부 후 AI 정제로 명세화',
                en: 'Attach md, txt, pdf, or office (docx, xlsx, pptx) files to refine into spec',
                ja: 'md, txt, pdf, office(docx, xlsx, pptx)ファイルを添付してAI精製で仕様化',
                id: 'Lampirkan file md, txt, pdf, atau office (docx, xlsx, pptx) untuk disempurnakan AI',
              })}
            >
              <Paperclip size={15} strokeWidth={2.2} />
              <span>
                {isParsingAttachment
                  ? pick({ ko: '파일 분석 중...', en: 'Parsing file...', ja: 'ファイルを解析中...', id: 'Menganalisis file...' })
                  : pick({ ko: '파일 첨부', en: 'Attach File', ja: 'ファイルを添付', id: 'Lampirkan File' })}
              </span>
            </button>

            <span className="text-[14px] text-[var(--theme-ink-secondary)] font-medium">
              md · txt · pdf · office (docx, xlsx, pptx)
            </span>
          </div>

          {attachments.length > 0 && (
            <span className="text-[14px] font-bold text-[var(--theme-ink-strong)] tabular-nums">
              {pick({
                ko: `첨부 ${attachments.length}건 · AI 정제 반영 대기`,
                en: `${attachments.length} attached · Ready for AI refinement`,
                ja: `添付 ${attachments.length}件 · AI精製反映待ち`,
                id: `${attachments.length} terlampir · Siap disempurnakan AI`,
              })}
            </span>
          )}
        </div>

        {attachmentError && (
          <div className="px-4 py-2.5 bg-[var(--theme-danger-bg)] border border-[var(--theme-danger)] text-[var(--theme-danger)] text-[15px] font-bold flex items-center justify-between gap-3">
            <span>{attachmentError}</span>
            <button
              type="button"
              onClick={() => setAttachmentError(null)}
              className="p-1 text-[var(--theme-danger)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] cursor-pointer"
              aria-label={pick({ ko: '오류 닫기', en: 'Dismiss error', ja: 'エラーを閉じる', id: 'Tutup pesan galat' })}
            >
              <X size={15} />
            </button>
          </div>
        )}

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={16} className="text-[var(--theme-ink-strong)] shrink-0" />
                  <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="text-[13px] font-extrabold tracking-[0.08em] uppercase text-[var(--theme-ink-strong)]">
                      {att.extension}
                    </span>
                    <span className="text-[var(--theme-ink-muted)]" aria-hidden="true">·</span>
                    <span className="text-[15px] font-bold text-[var(--theme-ink-primary)] truncate max-w-[260px] sm:max-w-sm">
                      {att.name}
                    </span>
                    <span className="text-[var(--theme-ink-muted)]" aria-hidden="true">·</span>
                    <span className="text-[14px] text-[var(--theme-ink-secondary)] tabular-nums">
                      {formatAttachmentBytes(att.size)}
                    </span>
                    <span className="text-[var(--theme-ink-muted)]" aria-hidden="true">·</span>
                    <span className="text-[14px] text-[var(--theme-ink-secondary)]">
                      {att.extractedText?.trim()
                        ? pick({ ko: '본문 추출 완료', en: 'Text extracted', ja: '本文抽出完了', id: 'Teks diekstrak' })
                        : att.base64Pdf
                        ? pick({ ko: 'PDF 원문 준비됨', en: 'PDF source ready', ja: 'PDF原文準備完了', id: 'Sumber PDF siap' })
                        : pick({ ko: '메타데이터 첨부됨', en: 'Metadata attached', ja: 'メタデータ添付済み', id: 'Metadata terlampir' })}
                    </span>
                  </div>
                </div>

                {!readOnly && onAttachmentsChange && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(att.id)}
                    className="p-1.5 text-[var(--theme-ink-secondary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] transition-colors cursor-pointer shrink-0"
                    title={pick({ ko: '첨부 파일 제거', en: 'Remove attachment', ja: '添付ファイルを削除', id: 'Hapus lampiran' })}
                    aria-label={pick({ ko: `${att.name} 제거`, en: `Remove ${att.name}`, ja: `${att.name} を削除`, id: `Hapus ${att.name}` })}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
