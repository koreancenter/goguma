import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileJson, Upload, CheckCircle2, AlertCircle, X, 
  FolderPlus, Sparkles, Layers, ArrowRight, FileText, 
  Globe, Smartphone, Target, Info, Palette, Calendar, Check
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
  const { t, language } = useLanguage();
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
        language === 'ko' 
          ? 'JSON 파일(.json)만 드롭할 수 있습니다.' 
          : 'Only JSON files (.json) are supported.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        language === 'ko'
          ? '보안상 5MB를 초과하는 파일은 불러올 수 없습니다.'
          : 'Security policy: File size cannot exceed 5MB.'
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
          language === 'ko'
            ? `파일을 읽는 중 오류가 발생했습니다: ${err.message}`
            : `Failed to read file: ${err.message}`
        );
      }
    };

    reader.onerror = () => {
      toast.error(
        language === 'ko'
          ? '파일 읽기 작업에 실패했습니다.'
          : 'Failed to read file.'
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
      language === 'ko'
        ? `"${projName}" 프로젝트를 워크스페이스에 성공적으로 불러왔습니다!`
        : `"${projName}" project successfully loaded into workspace!`
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
        language === 'ko'
          ? `"${result.name}" 프로젝트가 보관함에 안전하게 저장되었습니다.`
          : `Project "${result.name}" saved to library.`
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
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-6 select-none cursor-copy"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-xl w-full bg-[#111116] border-2 border-dashed border-[#C5A880]/40 rounded-[2px] p-10 sm:p-12 text-center shadow-2xl overflow-hidden pointer-events-none"
            >
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-[2px] bg-[#C5A880] text-[#0A0A0C] flex items-center justify-center shadow-2xl mb-6 font-bold"
                >
                  <Upload size={30} strokeWidth={2.5} />
                </motion.div>

                <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#F5F3ED] tracking-tight mb-2 uppercase">
                  {t('dropzone_title')}
                </h2>

                <p className="text-xs sm:text-sm text-[#8E8B82] max-w-md leading-relaxed mb-6 font-sans">
                  {t('dropzone_subtitle')}
                </p>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#8E8B82]">
                  <FileJson size={14} className="text-[#C5A880]" />
                  <span>{t('dropzone_formats')}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Temporary Modal Dialog: Project Data Summary & Import Confirmation */}
      <AnimatePresence>
        {stagedProject && summary && plan && (
          <div 
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setStagedProject(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#111116] w-full max-w-2xl h-[580px] rounded-[2px] shadow-2xl overflow-hidden flex flex-col border border-[#262632] text-[#F5F3ED] font-sans"
            >
              {/* Modal Top Banner & Header */}
              <div className="px-6 py-4 bg-[#0E0E12] border-b border-[#23232A] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#C5A880] text-[#0A0A0C] rounded-[2px] flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <FileJson size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-sans font-bold text-[#F5F3ED] tracking-tight uppercase">
                      {t('drop_confirm_title')}
                    </h3>
                    <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">
                      {t('drop_confirm_subtitle')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="p-1.5 text-[#8E8B82] hover:text-[#F5F3ED] rounded-[2px] hover:bg-[#1A1A22] transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body: Project Data Summary */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scroll bg-[#111116]">
                {/* File Information Chip */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#141418] rounded-[2px] border border-[#23232A] text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={14} className="text-[#C5A880] shrink-0" />
                    <span className="font-semibold text-[#F5F3ED] truncate">{stagedProject.fileName}</span>
                    <span className="px-1.5 py-0.5 bg-[#181822] rounded-[2px] text-[10px] font-mono text-[#C5A880] border border-[#23232A]">
                      {summary.version === '2.0' ? 'v2.0 Spec' : 'SitePlan Spec'}
                    </span>
                  </div>
                  <span className="text-[#8E8B82] font-mono text-xs shrink-0 ml-3">
                    {formatFileSize(stagedProject.fileSize)}
                  </span>
                </div>

                {/* Primary Project Card */}
                <div className="p-5 bg-[#141418] rounded-[2px] border border-[#23232A] space-y-4">
                  {/* Title & Platform Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8E8B82]">
                        {language === 'ko' ? '프로젝트 명칭' : 'Project Name'}
                      </span>
                      <h4 className="text-lg sm:text-xl font-sans font-bold text-[#F5F3ED] mt-0.5 tracking-tight truncate">
                        {summary.projectName || 'Untitled Project'}
                      </h4>
                    </div>

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] text-xs font-mono bg-[#181822] text-[#C5A880] border border-[#23232A] shrink-0">
                      {summary.platform === 'APP' ? (
                        <>
                          <Smartphone size={13} />
                          <span>APP SPEC</span>
                        </>
                      ) : (
                        <>
                          <Globe size={13} />
                          <span>WEB SPEC</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {/* Metric 1: Number of Pages */}
                    <div className="p-3 bg-[#0E0E12] rounded-[2px] border border-[#23232A]">
                      <div className="flex items-center gap-1.5 text-[#8E8B82] mb-1">
                        <Layers size={13} className="text-[#C5A880]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">{t('number_of_pages')}</span>
                      </div>
                      <p className="text-base font-sans font-bold text-[#F5F3ED]">
                        {summary.pageCount}
                        <span className="text-xs font-normal text-[#8E8B82] ml-1">
                          {language === 'ko' ? '개 화면' : 'pages'}
                        </span>
                      </p>
                    </div>

                    {/* Metric 2: Theme / Design Palette */}
                    <div className="p-3 bg-[#0E0E12] rounded-[2px] border border-[#23232A]">
                      <div className="flex items-center gap-1.5 text-[#8E8B82] mb-1">
                        <Palette size={13} className="text-[#C5A880]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">
                          {language === 'ko' ? '테마 색상' : 'Theme Color'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="w-4 h-4 rounded-[2px] border border-[#23232A]" 
                          style={{ backgroundColor: themeColor }}
                          title={`Primary: ${themeColor}`}
                        />
                        <span 
                          className="w-4 h-4 rounded-[2px] border border-[#23232A]" 
                          style={{ backgroundColor: accentColor }}
                          title={`Accent: ${accentColor}`}
                        />
                        <span className="text-xs font-mono text-[#8E8B82] uppercase">
                          {themeColor}
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Target Platform */}
                    <div className="p-3 bg-[#0E0E12] rounded-[2px] border border-[#23232A] col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-[#8E8B82] mb-1">
                        <Target size={13} className="text-[#C5A880]" />
                        <span className="text-[10px] font-mono uppercase tracking-wider">
                          {language === 'ko' ? '타겟 대상' : 'Target'}
                        </span>
                      </div>
                      <p className="text-xs text-[#F5F3ED] font-medium truncate mt-1">
                        {summary.target || (language === 'ko' ? '일반 사용자' : 'General Users')}
                      </p>
                    </div>
                  </div>

                  {/* Project Overview / Purpose */}
                  {summary.purpose && (
                    <div className="pt-1">
                      <span className="text-[10px] font-mono text-[#8E8B82] uppercase tracking-widest block mb-1">
                        {language === 'ko' ? '기획 의도 및 목적' : 'Project Purpose & Intent'}
                      </span>
                      <p className="text-xs text-[#F5F3ED] leading-relaxed bg-[#0E0E12] p-3 rounded-[2px] border border-[#23232A] font-sans">
                        {summary.purpose}
                      </p>
                    </div>
                  )}

                  {/* Included Page Architecture List */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#F5F3ED] flex items-center gap-1.5">
                        <Layers size={13} className="text-[#C5A880]" />
                        <span>{language === 'ko' ? '포함된 페이지 구조 상세' : 'Page Structure Details'}</span>
                      </span>
                      {summary.pages.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllPages(!showAllPages)}
                          className="text-xs font-mono text-[#C5A880] hover:text-[#D4B992] cursor-pointer"
                        >
                          {showAllPages 
                            ? (language === 'ko' ? '간략히 보기' : 'Show less') 
                            : (language === 'ko' ? `전체 ${summary.pages.length}개 보기` : `View all ${summary.pages.length}`)}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-[#0E0E12] rounded-[2px] border border-[#23232A]">
                      {(showAllPages ? pageStructure : pageStructure.slice(0, 6)).map((page, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs text-[#F5F3ED]"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                          <span className="font-medium">{page.name || 'Untitled'}</span>
                          {page.slug && (
                            <span className="text-[10px] text-[#8E8B82] font-mono">({page.slug})</span>
                          )}
                        </div>
                      ))}
                      {!showAllPages && pageStructure.length > 6 && (
                        <span className="px-2 py-1 bg-[#141418] rounded-[2px] text-xs font-mono text-[#8E8B82] border border-[#23232A]">
                          +{pageStructure.length - 6} {language === 'ko' ? '더보기' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="flex items-start gap-2.5 p-3.5 bg-[#141418] border border-[#23232A] rounded-[2px] text-xs text-[#8E8B82]">
                  <Sparkles size={15} className="text-[#C5A880] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-semibold text-[#F5F3ED] mb-0.5">
                      {language === 'ko' ? '불러오기 확인' : 'Import Confirmation'}
                    </p>
                    <p className="text-[#8E8B82]">
                      {language === 'ko'
                        ? '확인 버튼을 누르면 현재 편집 화면이 이 프로젝트 데이터로 전환됩니다. 기존 작업물을 보존하려면 먼저 "보관함에만 저장"을 선택할 수 있습니다.'
                        : 'Confirming will switch your active workspace canvas to this project. You may also choose "Save to Library Only" to preserve your current workspace.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-3.5 bg-[#0E0E12] border-t border-[#23232A] flex flex-col sm:flex-row items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-[#8E8B82] hover:text-[#F5F3ED] rounded-[2px] hover:bg-[#1A1A22] transition-colors cursor-pointer order-3 sm:order-1"
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLibraryOnly}
                  disabled={isSavingToLibrary}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#141418] hover:bg-[#1A1A22] border border-[#23232A] text-[#F5F3ED] text-xs font-medium rounded-[2px] transition-colors cursor-pointer disabled:opacity-40 order-2"
                >
                  <FolderPlus size={14} className="text-[#C5A880]" />
                  <span>{t('save_to_library_only')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] text-xs font-semibold rounded-[2px] shadow-xs transition-colors cursor-pointer order-1 sm:order-3"
                >
                  <Check size={15} strokeWidth={2.5} />
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
