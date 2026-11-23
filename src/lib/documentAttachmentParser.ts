import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { SectionAttachment } from '../types/schema';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export const SUPPORTED_ATTACHMENT_EXTENSIONS = new Set([
  'md',
  'markdown',
  'txt',
  'csv',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
]);

export const SUPPORTED_ATTACHMENT_ACCEPT = [
  '.md',
  '.markdown',
  '.txt',
  '.csv',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
].join(',');

const MAX_ATTACHMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB per file
const MAX_INLINE_PDF_BYTES = 4 * 1024 * 1024; // 4MB base64 multimodal cap
const MAX_STORED_TEXT_CHARS = 40000;

export function formatAttachmentBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function normalizeAttachments(raw: unknown): SectionAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item, idx) => ({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `att_${idx + 1}`,
      name: typeof item.name === 'string' ? item.name : 'untitled',
      size: typeof item.size === 'number' ? item.size : 0,
      mimeType: typeof item.mimeType === 'string' ? item.mimeType : 'application/octet-stream',
      extension: typeof item.extension === 'string' ? item.extension : '',
      extractedText: typeof item.extractedText === 'string' ? item.extractedText : '',
      base64Pdf: typeof item.base64Pdf === 'string' ? item.base64Pdf : undefined,
      addedAt: typeof item.addedAt === 'string' ? item.addedAt : new Date().toISOString(),
    }));
}

function getFileExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts.pop() || '' : '';
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pageTexts: string[] = [];
  const totalPages = Math.min(pdf.numPages, 60);

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const lines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if (!('str' in item)) continue;
      const y = Array.isArray(item.transform) ? item.transform[5] : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.str;
      } else {
        currentLine += (currentLine && item.str && !currentLine.endsWith(' ') ? ' ' : '') + item.str;
      }
      if (y !== null) lastY = y;
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const pageStr = lines.join('\n').trim();
    if (pageStr) {
      pageTexts.push(`[Page ${pageNum}]\n${pageStr}`);
    }
  }

  return pageTexts.join('\n\n').trim();
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.file('word/document.xml');
  if (!docFile) return '';

  const xmlText = await docFile.async('string');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'));
  const lines: string[] = [];

  for (const p of paragraphs) {
    const textNodes = Array.from(p.getElementsByTagName('w:t'));
    const pText = textNodes.map(n => n.textContent || '').join('').trim();
    if (pText) {
      lines.push(pText);
    }
  }

  // Fallback to generic text tags if namespace prefix differs
  if (lines.length === 0) {
    const fallbackNodes = Array.from(xmlDoc.getElementsByTagNameNS('*', 't'));
    const joined = fallbackNodes.map(n => n.textContent || '').join(' ').trim();
    if (joined) lines.push(joined);
  }

  return lines.join('\n').trim();
}

async function extractPptxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter(name => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/slide(\d+)\.xml/i)?.[1] || '0', 10);
      return numA - numB;
    });

  const parser = new DOMParser();
  const slidesOutput: string[] = [];

  for (let idx = 0; idx < slidePaths.length; idx++) {
    const slideXml = await zip.file(slidePaths[idx])?.async('string');
    if (!slideXml) continue;
    const xmlDoc = parser.parseFromString(slideXml, 'application/xml');
    const paragraphs = Array.from(xmlDoc.getElementsByTagNameNS('*', 'p'));
    const lines: string[] = [];

    for (const p of paragraphs) {
      const runs = Array.from(p.getElementsByTagNameNS('*', 't'));
      const line = runs.map(r => r.textContent || '').join('').trim();
      if (line) lines.push(line);
    }

    if (lines.length > 0) {
      slidesOutput.push(`[Slide ${idx + 1}]\n${lines.join('\n')}`);
    }
  }

  return slidesOutput.join('\n\n').trim();
}

async function extractXlsxText(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const parser = new DOMParser();

  // 1. Load shared strings table
  const sharedStrings: string[] = [];
  const sharedFile = zip.file('xl/sharedStrings.xml');
  if (sharedFile) {
    const sharedXml = await sharedFile.async('string');
    const sharedDoc = parser.parseFromString(sharedXml, 'application/xml');
    const siNodes = Array.from(sharedDoc.getElementsByTagNameNS('*', 'si'));
    for (const si of siNodes) {
      const tNodes = Array.from(si.getElementsByTagNameNS('*', 't'));
      sharedStrings.push(tNodes.map(t => t.textContent || '').join(''));
    }
  }

  // 2. Read sorted worksheets
  const sheetPaths = Object.keys(zip.files)
    .filter(name => /^xl\/worksheets\/sheet\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/sheet(\d+)\.xml/i)?.[1] || '0', 10);
      const numB = parseInt(b.match(/sheet(\d+)\.xml/i)?.[1] || '0', 10);
      return numA - numB;
    });

  const sheetsOutput: string[] = [];

  for (let idx = 0; idx < sheetPaths.length; idx++) {
    const sheetXml = await zip.file(sheetPaths[idx])?.async('string');
    if (!sheetXml) continue;
    const sheetDoc = parser.parseFromString(sheetXml, 'application/xml');
    const rowNodes = Array.from(sheetDoc.getElementsByTagNameNS('*', 'row'));
    const rowLines: string[] = [];

    for (const row of rowNodes.slice(0, 300)) {
      const cellNodes = Array.from(row.getElementsByTagNameNS('*', 'c'));
      const cellValues: string[] = [];

      for (const cell of cellNodes) {
        const type = cell.getAttribute('t');
        if (type === 'inlineStr') {
          const tNode = cell.getElementsByTagNameNS('*', 't')[0];
          cellValues.push((tNode?.textContent || '').trim());
        } else if (type === 's') {
          const vNode = cell.getElementsByTagNameNS('*', 'v')[0];
          const strIdx = parseInt(vNode?.textContent || '', 10);
          cellValues.push(Number.isFinite(strIdx) ? (sharedStrings[strIdx] || '').trim() : '');
        } else {
          const vNode = cell.getElementsByTagNameNS('*', 'v')[0];
          cellValues.push((vNode?.textContent || '').trim());
        }
      }

      const cleanedRow = cellValues.filter(Boolean).join(' | ');
      if (cleanedRow) rowLines.push(cleanedRow);
    }

    if (rowLines.length > 0) {
      sheetsOutput.push(`[Sheet ${idx + 1}]\n${rowLines.join('\n')}`);
    }
  }

  return sheetsOutput.join('\n\n').trim();
}

function extractLegacyBinaryReadableText(buffer: ArrayBuffer): string {
  // Best-effort readable Unicode/ASCII run extraction for legacy OLE2 .doc / .xls / .ppt
  const utf16Decoder = new TextDecoder('utf-16le', { fatal: false });
  const utf16Raw = utf16Decoder.decode(buffer);
  const koreanOrSentenceChunks = utf16Raw.match(/[\uAC00-\uD7A3a-zA-Z0-9 .,;:!?()\[\]\/\-_%@]{6,}/g) || [];
  const filtered = koreanOrSentenceChunks
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(s => /[a-zA-Z\uAC00-\uD7A3]{3,}/.test(s) && !/^Root Entry|WordDocument|Workbook|PowerPoint/i.test(s));

  if (filtered.length > 0) {
    return Array.from(new Set(filtered)).slice(0, 200).join('\n').trim();
  }

  const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
  const utf8Raw = utf8Decoder.decode(buffer);
  const asciiChunks = utf8Raw.match(/[a-zA-Z0-9 .,;:!?()\[\]\/\-_%@]{12,}/g) || [];
  return Array.from(new Set(asciiChunks.map(s => s.trim()))).slice(0, 120).join('\n').trim();
}

function getAttachmentLang(): 'ko' | 'en' | 'ja' | 'id' {
  try {
    const val = localStorage.getItem('goguma_language');
    if (val === 'en' || val === 'ja' || val === 'id' || val === 'ko') return val;
  } catch {
    // ignore
  }
  return 'ko';
}

export async function parseDocumentAttachment(file: File): Promise<SectionAttachment> {
  const ext = getFileExtension(file.name);
  const lang = getAttachmentLang();

  if (!SUPPORTED_ATTACHMENT_EXTENSIONS.has(ext)) {
    const msgs = {
      ko: `지원하지 않는 파일 형식입니다 (${file.name}). md, txt, csv, pdf, office(docx, xlsx, pptx, doc, xls, ppt) 파일을 첨부해 주세요.`,
      en: `Unsupported file format (${file.name}). Please attach md, txt, csv, pdf, or office (docx, xlsx, pptx, doc, xls, ppt) files.`,
      ja: `未対応のファイル形式です (${file.name})。md, txt, csv, pdf, office(docx, xlsx, pptx, doc, xls, ppt) ファイルを添付してください。`,
      id: `Format berkas tidak didukung (${file.name}). Harap lampirkan berkas md, txt, csv, pdf, atau office (docx, xlsx, pptx, doc, xls, ppt).`,
    };
    throw new Error(msgs[lang]);
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    const sizeStr = formatAttachmentBytes(file.size);
    const msgs = {
      ko: `파일 크기가 너무 큽니다 (${file.name}: ${sizeStr}). 15MB 이하 파일만 첨부할 수 있습니다.`,
      en: `File size too large (${file.name}: ${sizeStr}). Maximum allowed size is 15MB.`,
      ja: `ファイルサイズが大きすぎます (${file.name}: ${sizeStr})。15MB以下のファイルのみ添付できます。`,
      id: `Ukuran berkas terlalu besar (${file.name}: ${sizeStr}). Maksimal ukuran berkas adalah 15MB.`,
    };
    throw new Error(msgs[lang]);
  }

  let extractedText = '';
  let base64Pdf: string | undefined;

  if (ext === 'md' || ext === 'markdown' || ext === 'txt' || ext === 'csv') {
    extractedText = (await file.text()).trim();
  } else {
    const buffer = await file.arrayBuffer();
    if (ext === 'pdf') {
      extractedText = await extractPdfText(buffer);
      if (file.size <= MAX_INLINE_PDF_BYTES) {
        base64Pdf = arrayBufferToBase64(buffer);
      }
    } else if (ext === 'docx') {
      extractedText = await extractDocxText(buffer);
    } else if (ext === 'pptx') {
      extractedText = await extractPptxText(buffer);
    } else if (ext === 'xlsx') {
      extractedText = await extractXlsxText(buffer);
    } else if (ext === 'doc' || ext === 'xls' || ext === 'ppt') {
      extractedText = extractLegacyBinaryReadableText(buffer);
    }
  }

  if (extractedText.length > MAX_STORED_TEXT_CHARS) {
    const truncMsgs = {
      ko: '문서 길이가 길어 핵심 앞부분만 저장됨',
      en: 'Document truncated; stored key leading section',
      ja: '文書が長いため先頭の主要部分のみ保存されました',
      id: 'Dokumen dipotong; menyimpan bagian awal utama',
    };
    extractedText = `${extractedText.slice(0, MAX_STORED_TEXT_CHARS)}\n\n... (${truncMsgs[lang]})`;
  }

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    size: file.size,
    mimeType: file.type || 'application/octet-stream',
    extension: ext.toUpperCase(),
    extractedText,
    base64Pdf,
    addedAt: new Date().toISOString(),
  };
}

export function stripHtmlToPlainText(html: string): string {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.trim();
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function applyInlineFormatting(line: string): string {
  const escaped = escapeHtml(line);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/**
 * Converts clean Markdown or multi-line structured text returned by AI refinement
 * into valid HTML blocks for TiptapThinkingCanvas.
 */
export function markdownOrTextToHtml(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // If the output is already HTML block markup, return directly
  if (/^\s*<(p|h[1-6]|ul|ol|blockquote|table|div)\b/i.test(trimmed)) {
    return trimmed;
  }

  const lines = trimmed.split(/\r?\n/);
  const htmlBlocks: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      htmlBlocks.push('</ul>');
      inUl = false;
    }
    if (inOl) {
      htmlBlocks.push('</ol>');
      inOl = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      continue;
    }

    const h3Match = line.match(/^###\s+(.+)$/);
    const h2Match = line.match(/^##\s+(.+)$/);
    const h1Match = line.match(/^#\s+(.+)$/);
    const ulMatch = line.match(/^[-*•]\s+(.+)$/);
    const olMatch = line.match(/^\d+[.)]\s+(.+)$/);

    if (h1Match) {
      closeLists();
      htmlBlocks.push(`<h1>${applyInlineFormatting(h1Match[1])}</h1>`);
    } else if (h2Match) {
      closeLists();
      htmlBlocks.push(`<h2>${applyInlineFormatting(h2Match[1])}</h2>`);
    } else if (h3Match) {
      closeLists();
      htmlBlocks.push(`<h3>${applyInlineFormatting(h3Match[1])}</h3>`);
    } else if (ulMatch) {
      if (inOl) {
        htmlBlocks.push('</ol>');
        inOl = false;
      }
      if (!inUl) {
        htmlBlocks.push('<ul>');
        inUl = true;
      }
      htmlBlocks.push(`<li><p>${applyInlineFormatting(ulMatch[1])}</p></li>`);
    } else if (olMatch) {
      if (inUl) {
        htmlBlocks.push('</ul>');
        inUl = false;
      }
      if (!inOl) {
        htmlBlocks.push('<ol>');
        inOl = true;
      }
      htmlBlocks.push(`<li><p>${applyInlineFormatting(olMatch[1])}</p></li>`);
    } else {
      closeLists();
      htmlBlocks.push(`<p>${applyInlineFormatting(line)}</p>`);
    }
  }

  closeLists();
  return htmlBlocks.join('');
}
