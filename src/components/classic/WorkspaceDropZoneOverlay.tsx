import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileJson, Upload, X, 
  FolderPlus, Sparkles, Layers, FileText, 
  Globe, Smartphone, Target, Palette, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { SitePlan } from '../../types';
import { parseAndValidateProjectJson, saveProjectToLibrary, ProjectValidationResult } from '../../lib/projectFileIO';
import { auth } from '../../lib/localAuth';
import { useLanguage } from '../../contexts/LanguageContext';

interface WorkspaceDropZoneOverlayProps {
  onProjectLoaded: (plan: SitePlan) => void;
  onProjectSavedToLibrary?: () => void;
}

interface StagedProject {
  validation: ProjectValidationResult;
  fileName: string;
  fileSize: number;
  droppedAt: Date;
}

export const WorkspaceDropZoneOverlay: React.FC<WorkspaceDropZoneOverlayProps> = ({
  onProjectLoaded,
  onProjectSavedToLibrary
}) => {
  const { t, language, pick } = useLanguage();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [stagedProject, setStagedProject] = useState<StagedProject | null>(null);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState(false);
  const [showAllPages, setShowAllPages] = useState(false);
  const dragCounterRef = useRef(0);

  // Keyboard shortcut (Escape to close modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stagedProject) {
        setStagedProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stagedProject]);

  // Global window drag-and-drop listeners
  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Check if dragged items contain file data
      if (e.dataTransfer?.types && Array.from(e.dataTransfer.types).includes('Files')) {
        dragCounterRef.current += 1;
        if (dragCounterRef.current === 1) {
          setIsDraggingOver(true);
        }
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current -= 1;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        processDroppedFile(file);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [t, language]);

  const processDroppedFile = (file: File) => {
    const isJsonFile = file.name.endsWith('.json') || file.type === 'application/json';
    if (!isJsonFile) {
      toast.error(
        pick({
          ko: 'JSON 파일(.json)만 드롭할 수 있습니다.',
          en: 'Only JSON files (.json) are supported.',
          ja: 'JSONファイル（.json）のみドロップできます。',
          id: 'Hanya file JSON (.json) yang didukung.',
        })
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        pick({
          ko: '보안상 5MB를 초과하는 파일은 불러올 수 없습니다.',
          en: 'Security policy: File size cannot exceed 5MB.',
          ja: 'セキュリティポリシー上、5MBを超えるファイルは読み込めません。',
          id: 'Kebijakan keamanan: Ukuran file tidak boleh melebihi 5MB.',
        })
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const validation = parseAndValidateProjectJson(text);

        if (!validation.isValid || !validation.normalizedPlan) {
          toast.error(validation.error || t('drop_invalid_error'));
          return;
        }

        setShowAllPages(false);
        setStagedProject({
          validation,
          fileName: file.name,
          fileSize: file.size,
          droppedAt: new Date()
        });
      } catch (err: any) {
        toast.error(
          pick({
            ko: `파일을 읽는 중 오류가 발생했습니다: ${err.message}`,
            en: `Failed to read file: ${err.message}`,
            ja: `ファイルの読み込みに失敗しました: ${err.message}`,
            id: `Gagal membaca file: ${err.message}`,
          })
        );
      }
    };

    reader.onerror = () => {
      toast.error(
        pick({
          ko: '파일 읽기 작업에 실패했습니다.',
          en: 'Failed to read file.',
          ja: 'ファイルの読み込みに失敗しました。',
          id: 'Gagal membaca file.',
        })
      );
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!stagedProject?.validation.normalizedPlan) return;
    
    // Clear user autosave for clean project load
    if (auth.currentUser) {
      localStorage.removeItem(`goguma_autosave_${auth.currentUser.uid}`);
      localStorage.removeItem(`goguma_autosave_time_${auth.currentUser.uid}`);
    }

    onProjectLoaded(stagedProject.validation.normalizedPlan);
    const projName = stagedProject.validation.summary?.projectName || 'Project';
    toast.success(
      pick({
        ko: `"${projName}" 프로젝트를 워크스페이스에 성공적으로 불러왔습니다!`,
        en: `"${projName}" project successfully loaded into workspace!`,
        ja: `「${projName}」プロジェクトをワークスペースに読み込みました！`,
        id: `Proyek "${projName}" berhasil dimuat ke ruang kerja!`,
      })
    );
    setStagedProject(null);
  };

  const handleSaveToLibraryOnly = async () => {
    if (!stagedProject?.validation.normalizedPlan) return;

    setIsSavingToLibrary(true);
    try {
      const uid = auth.currentUser?.uid || 'local_user';
      const result = await saveProjectToLibrary(
        stagedProject.validation.normalizedPlan,
        uid,
        stagedProject.validation.summary?.projectName
      );

      toast.success(
        pick({
          ko: `"${result.name}" 프로젝트가 보관함에 안전하게 저장되었습니다.`,
          en: `Project "${result.name}" saved to library.`,
          ja: `プロジェクト「${result.name}」をライブラリに保存しました。`,
          id: `Proyek "${result.name}" disimpan ke pustaka.`,
        })
      );

      if (onProjectSavedToLibrary) {
        onProjectSavedToLibrary();
      }
      setStagedProject(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save to library.');
    } finally {
      setIsSavingToLibrary(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const plan = stagedProject?.validation.normalizedPlan;
  const summary = stagedProject?.validation.summary;
  const pageStructure = plan?.navigation?.pageStructure || [];
  const themeColor = plan?.design?.themeColor || '#FFFFFF';
  const accentColor = plan?.design?.accentColor || '#E4E4E7';

  return (
    <>
      {/* 1. Fullscreen Drag-over Overlay */}
      <AnimatePresence>
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragCounterRef.current = 0;
              setIsDraggingOver(false);
              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                processDroppedFile(e.dataTransfer.files[0]);
              }
            }}
            className="fixed inset-0 z-[9999] bg-[#000000]/45 backdrop-blur-xs flex items-center justify-center p-6 select-none cursor-copy"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-xl w-full bg-[var(--theme-elevated)] border-2 border-[var(--theme-ink-strong)] rounded-none p-10 sm:p-14 text-center overflow-hidden pointer-events-none"
            >
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-none bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] flex items-center justify-center mb-6 font-bold"
                >
                  <Upload size={30} strokeWidth={2} />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-[var(--theme-ink-strong)] tracking-tight mb-3 uppercase">
                  {t('dropzone_title')}
                </h2>

                <p className="text-[16px] sm:text-[18px] text-[var(--theme-ink-secondary)] max-w-md leading-relaxed mb-7 font-sans">
                  {t('dropzone_subtitle')}
                </p>

                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[14px] font-bold font-sans text-[var(--theme-ink-strong)]">
                  <FileJson size={16} className="text-[var(--theme-ink-strong)]" />
                  <span>{t('dropzone_formats')}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Project Data Summary & Import Confirmation */}
      <AnimatePresence>
        {stagedProject && summary && plan && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#000000]/45 backdrop-blur-xs overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setStagedProject(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[var(--theme-elevated)] w-full max-w-2xl max-h-[90vh] rounded-none overflow-hidden flex flex-col border-t-4 border-t-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] text-[var(--theme-ink-primary)] font-sans"
            >
              {/* Modal Top Banner & Header */}
              <div className="px-7 py-5 bg-[var(--theme-stage)] border-b border-[var(--theme-border-hairline)] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] rounded-none flex items-center justify-center shrink-0 font-bold">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h3 className="text-[20px] sm:text-[22px] font-sans font-extrabold text-[var(--theme-ink-strong)] tracking-tight">
                      {t('drop_confirm_title')}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="p-2 text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] rounded-none hover:bg-[var(--theme-subtle)] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Project Data Summary */}
              <div className="flex-1 p-7 space-y-6 overflow-y-auto custom-scroll bg-[var(--theme-canvas)]">
                {/* File Information Row */}
                <div className="flex items-center justify-between px-4 py-3 bg-[var(--theme-stage)] rounded-none border border-[var(--theme-border-hairline)] text-[15px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-[var(--theme-ink-strong)] shrink-0" />
                    <span className="font-bold text-[var(--theme-ink-strong)] truncate">{stagedProject.fileName}</span>
                    <span className="px-2 py-0.5 bg-[var(--theme-active-bg)] rounded-none text-[12px] font-bold font-sans text-[var(--theme-active-text)] uppercase">
                      {summary.version === '2.0' ? 'v2.0 Spec' : 'SitePlan Spec'}
                    </span>
                  </div>
                  <span className="text-[var(--theme-ink-secondary)] font-sans tabular-nums text-[14px] shrink-0 ml-3">
                    {formatFileSize(stagedProject.fileSize)}
                  </span>
                </div>

                {/* Primary Project Card */}
                <div className="p-6 bg-[var(--theme-stage)] rounded-none border border-[var(--theme-border-hairline)] border-t-2 border-t-[var(--theme-ink-strong)] space-y-5">
                  {/* Title & Platform Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-bold font-sans uppercase tracking-[0.12em] text-[var(--theme-ink-muted)]">
                        {pick({ ko: '프로젝트 명칭', en: 'Project Name', ja: 'プロジェクト名', id: 'Nama Proyek' })}
                      </span>
                      <h4 className="text-[22px] sm:text-[24px] font-sans font-extrabold text-[var(--theme-ink-strong)] mt-1 tracking-tight truncate">
                        {summary.projectName || 'Untitled Project'}
                      </h4>
                    </div>

                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[13px] font-sans bg-[var(--theme-canvas)] text-[var(--theme-ink-strong)] border border-[var(--theme-ink-strong)] shrink-0 font-bold uppercase tracking-wider">
                      {summary.platform === 'APP' ? (
                        <>
                          <Smartphone size={14} />
                          <span>APP SPEC</span>
                        </>
                      ) : (
                        <>
                          <Globe size={14} />
                          <span>WEB SPEC</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                    {/* Metric 1: Number of Pages */}
                    <div className="p-4 bg-[var(--theme-canvas)] rounded-none border border-[var(--theme-border-hairline)]">
                      <div className="flex items-center gap-1.5 text-[var(--theme-ink-muted)] mb-1.5">
                        <Layers size={14} className="text-[var(--theme-ink-strong)]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">{t('number_of_pages')}</span>
                      </div>
                      <p className="text-[20px] font-sans font-extrabold text-[var(--theme-ink-strong)]">
                        {summary.pageCount}
                        <span className="text-[14px] font-medium text-[var(--theme-ink-secondary)] ml-1.5">
                          {pick({ ko: '개 화면', en: 'pages', ja: 'ページ', id: 'halaman' })}
                        </span>
                      </p>
                    </div>

                    {/* Metric 2: Theme / Design Palette */}
                    <div className="p-4 bg-[var(--theme-canvas)] rounded-none border border-[var(--theme-border-hairline)]">
                      <div className="flex items-center gap-1.5 text-[var(--theme-ink-muted)] mb-1.5">
                        <Palette size={14} className="text-[var(--theme-ink-strong)]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">
                          {pick({ ko: '테마 색상', en: 'Theme Color', ja: 'テーマカラー', id: 'Warna Tema' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span 
                          className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)]" 
                          style={{ backgroundColor: themeColor }}
                          title={`Primary: ${themeColor}`}
                        />
                        <span 
                          className="w-5 h-5 rounded-none border border-[var(--theme-border-strong)]" 
                          style={{ backgroundColor: accentColor }}
                          title={`Accent: ${accentColor}`}
                        />
                        <span className="text-[14px] font-bold font-sans tabular-nums text-[var(--theme-ink-primary)] uppercase">
                          {themeColor}
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Target Platform */}
                    <div className="p-4 bg-[var(--theme-canvas)] rounded-none border border-[var(--theme-border-hairline)] col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-[var(--theme-ink-muted)] mb-1.5">
                        <Target size={14} className="text-[var(--theme-ink-strong)]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">
                          {pick({ ko: '타겟 대상', en: 'Target', ja: 'ターゲット', id: 'Target' })}
                        </span>
                      </div>
                      <p className="text-[15px] text-[var(--theme-ink-strong)] font-bold truncate mt-1.5">
                        {summary.target || pick({ ko: '일반 사용자', en: 'General Users', ja: '一般ユーザー', id: 'Pengguna Umum' })}
                      </p>
                    </div>
                  </div>

                  {/* Project Overview / Purpose */}
                  {summary.purpose && (
                    <div className="pt-1">
                      <span className="text-[13px] font-bold font-sans text-[var(--theme-ink-muted)] uppercase tracking-[0.12em] block mb-1.5">
                        {pick({ ko: '기획 의도 및 목적', en: 'Project Purpose & Intent', ja: '企画の意図と目的', id: 'Tujuan & Maksud Proyek' })}
                      </span>
                      <p className="text-[16px] text-[var(--theme-ink-primary)] leading-relaxed bg-[var(--theme-canvas)] p-4 rounded-none border border-[var(--theme-border-hairline)] font-sans">
                        {summary.purpose}
                      </p>
                    </div>
                  )}

                  {/* Included Page Architecture List */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[14px] font-bold text-[var(--theme-ink-strong)] flex items-center gap-2 uppercase tracking-wider">
                        <Layers size={15} className="text-[var(--theme-ink-strong)]" />
                        <span>{pick({ ko: '포함된 페이지 구조 상세', en: 'Page Structure Details', ja: 'ページ構造詳細', id: 'Detail Struktur Halaman' })}</span>
                      </span>
                      {summary.pages.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllPages(!showAllPages)}
                          className="text-[14px] font-bold font-sans text-[var(--theme-ink-strong)] hover:text-[var(--theme-seal)] cursor-pointer"
                        >
                          {showAllPages 
                            ? pick({ ko: '간략히 보기', en: 'Show less', ja: '閉じる', id: 'Tampilkan lebih sedikit' })
                            : pick({ ko: `전체 ${summary.pages.length}개 보기`, en: `View all ${summary.pages.length}`, ja: `全${summary.pages.length}件を表示`, id: `Lihat semua ${summary.pages.length}` })}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-[var(--theme-canvas)] rounded-none border border-[var(--theme-border-hairline)]">
                      {(showAllPages ? pageStructure : pageStructure.slice(0, 6)).map((page, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] rounded-none text-[14px] text-[var(--theme-ink-primary)]"
                        >
                          <span className="font-bold">{page.name || 'Untitled'}</span>
                          {page.slug && (
                            <span className="text-[13px] text-[var(--theme-ink-secondary)] font-sans">({page.slug})</span>
                          )}
                        </div>
                      ))}
                      {!showAllPages && pageStructure.length > 6 && (
                        <span className="px-3 py-1.5 bg-[var(--theme-stage)] rounded-none text-[14px] font-bold font-sans tabular-nums text-[var(--theme-ink-secondary)] border border-[var(--theme-border-hairline)]">
                          +{pageStructure.length - 6} {pick({ ko: '더보기', en: 'more', ja: 'その他', id: 'lainnya' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="flex items-start gap-3 p-4 bg-[var(--theme-stage)] border-l-4 border-l-[var(--theme-ink-strong)] border border-[var(--theme-border-hairline)] rounded-none text-[15px] text-[var(--theme-ink-primary)]">
                  <Sparkles size={18} className="text-[var(--theme-ink-strong)] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-[var(--theme-ink-strong)] mb-1">
                      {pick({ ko: '불러오기 확인', en: 'Import Confirmation', ja: 'インポート確認', id: 'Konfirmasi Impor' })}
                    </p>
                    <p className="text-[var(--theme-ink-secondary)]">
                      {pick({
                        ko: '확인 버튼을 누르면 현재 편집 화면이 이 프로젝트 데이터로 전환됩니다. 기존 작업물을 보존하려면 먼저 "보관함에만 저장"을 선택할 수 있습니다.',
                        en: 'Confirming will switch your active workspace canvas to this project. You may also choose "Save to Library Only" to preserve your current workspace.',
                        ja: '確定すると現在のワークスペースがこのプロジェクトに切り替わります。現在の作業を残す場合は「ライブラリにのみ保存」を選択してください。',
                        id: 'Konfirmasi akan mengalihkan ruang kerja aktif ke proyek ini. Anda juga dapat memilih "Hanya Simpan ke Pustaka".',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-7 py-4 bg-[var(--theme-stage)] border-t border-[var(--theme-border-hairline)] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="w-full sm:w-auto px-5 py-2.5 text-[15px] font-bold text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] rounded-none hover:bg-[var(--theme-subtle)] transition-colors cursor-pointer order-3 sm:order-1"
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLibraryOnly}
                  disabled={isSavingToLibrary}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--theme-canvas)] hover:bg-[var(--theme-active-bg)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] hover:text-[var(--theme-active-text)] text-[15px] font-bold rounded-none transition-colors cursor-pointer disabled:opacity-40 order-2"
                >
                  <FolderPlus size={16} />
                  <span>{t('save_to_library_only')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] text-[var(--theme-btn-text)] hover:text-[var(--theme-hover-text)] text-[15px] font-bold rounded-none transition-colors cursor-pointer order-1 sm:order-3"
                >
                  <Check size={16} strokeWidth={2.5} />
                  <span>{t('confirm_import_button')}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WorkspaceDropZoneOverlay;
