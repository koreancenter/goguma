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
          ? 'JSON 파일(.goguma.json 또는 .json)만 드롭할 수 있습니다.' 
          : 'Only JSON files (.goguma.json or .json) are supported.'
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
  const themeColor = plan?.design?.themeColor || '#6366f1';
  const accentColor = plan?.design?.accentColor || '#f97316';

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
            className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-6 select-none cursor-copy"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-xl w-full bg-slate-900/95 border-2 border-dashed border-goguma rounded-3xl p-10 sm:p-12 text-center shadow-2xl shadow-goguma/40 overflow-hidden pointer-events-none"
            >
              {/* Radial glow */}
              <div className="absolute inset-0 bg-radial from-goguma/25 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-2xl bg-goguma text-white flex items-center justify-center shadow-xl shadow-goguma/40 mb-6"
                >
                  <Upload size={36} strokeWidth={2.5} />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3">
                  {t('dropzone_title')}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 max-w-md font-medium leading-relaxed mb-6">
                  {t('dropzone_subtitle')}
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs font-bold text-goguma-light">
                  <FileJson size={14} />
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
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setStagedProject(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-100 my-8 max-h-[90vh]"
            >
              {/* Modal Top Banner & Header */}
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-goguma/10 text-goguma rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
                    <FileJson size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {t('drop_confirm_title')}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {t('drop_confirm_subtitle')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="p-2.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Project Data Summary */}
              <div className="p-6 space-y-5 overflow-y-auto">
                {/* File Information Chip */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-100/70 rounded-2xl border border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={15} className="text-goguma shrink-0" />
                    <span className="font-bold text-slate-700 truncate">{stagedProject.fileName}</span>
                    <span className="px-2 py-0.5 bg-white rounded-md text-[10px] font-bold text-slate-500 border border-slate-200">
                      {summary.version === '2.0' ? 'v2.0 Spec' : 'SitePlan Spec'}
                    </span>
                  </div>
                  <span className="text-slate-400 font-medium shrink-0 ml-3">
                    {formatFileSize(stagedProject.fileSize)}
                  </span>
                </div>

                {/* Primary Project Card */}
                <div className="p-5 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 rounded-2xl border border-amber-200/70 shadow-2xs space-y-4">
                  {/* Title & Platform Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-goguma">
                        {language === 'ko' ? '프로젝트 명칭' : 'Project Name'}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 tracking-tight truncate">
                        {summary.projectName || 'Untitled Project'}
                      </h4>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 ${
                      summary.platform === 'APP' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {summary.platform === 'APP' ? (
                        <>
                          <Smartphone size={14} />
                          <span>App Architecture</span>
                        </>
                      ) : (
                        <>
                          <Globe size={14} />
                          <span>Web Architecture</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Summary Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    {/* Metric 1: Number of Pages */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Layers size={13} />
                        <span className="text-[11px] font-bold uppercase">{t('number_of_pages')}</span>
                      </div>
                      <p className="text-lg font-black text-slate-800">
                        {summary.pageCount}
                        <span className="text-xs font-medium text-slate-400 ml-1">
                          {language === 'ko' ? '개 화면' : 'pages'}
                        </span>
                      </p>
                    </div>

                    {/* Metric 2: Theme / Design Palette */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Palette size={13} />
                        <span className="text-[11px] font-bold uppercase">
                          {language === 'ko' ? '테마 색상' : 'Theme Color'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span 
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs" 
                          style={{ backgroundColor: themeColor }}
                          title={`Primary: ${themeColor}`}
                        />
                        <span 
                          className="w-5 h-5 rounded-full border border-black/10 shadow-2xs" 
                          style={{ backgroundColor: accentColor }}
                          title={`Accent: ${accentColor}`}
                        />
                        <span className="text-xs font-mono text-slate-600 font-bold uppercase">
                          {themeColor}
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Target Platform */}
                    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                        <Target size={13} />
                        <span className="text-[11px] font-bold uppercase">
                          {language === 'ko' ? '타겟 대상' : 'Target'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate mt-1">
                        {summary.target || (language === 'ko' ? '일반 사용자' : 'General Users')}
                      </p>
                    </div>
                  </div>

                  {/* Project Overview / Purpose */}
                  {summary.purpose && (
                    <div className="pt-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        {language === 'ko' ? '기획 의도 및 목적' : 'Project Purpose & Intent'}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {summary.purpose}
                      </p>
                    </div>
                  )}

                  {/* Included Page Architecture List */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Layers size={14} className="text-goguma" />
                        <span>{language === 'ko' ? '포함된 페이지 구조 상세' : 'Page Structure Details'}</span>
                      </span>
                      {summary.pages.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllPages(!showAllPages)}
                          className="text-xs font-bold text-goguma hover:underline"
                        >
                          {showAllPages 
                            ? (language === 'ko' ? '간략히 보기' : 'Show less') 
                            : (language === 'ko' ? `전체 ${summary.pages.length}개 보기` : `View all ${summary.pages.length}`)}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-slate-100">
                      {(showAllPages ? pageStructure : pageStructure.slice(0, 6)).map((page, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 shadow-2xs"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-goguma" />
                          <span className="font-bold">{page.name || 'Untitled'}</span>
                          {page.slug && (
                            <span className="text-[10px] text-slate-400 font-mono">({page.slug})</span>
                          )}
                        </div>
                      ))}
                      {!showAllPages && pageStructure.length > 6 && (
                        <span className="px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-500">
                          +{pageStructure.length - 6} {language === 'ko' ? '더보기' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900">
                  <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-blue-950 mb-0.5">
                      {language === 'ko' ? '불러오기 확인' : 'Import Confirmation'}
                    </p>
                    <p className="text-blue-800/90">
                      {language === 'ko'
                        ? '확인 버튼을 누르면 현재 편집 화면이 이 프로젝트 데이터로 전환됩니다. 기존 작업물을 보존하려면 먼저 "보관함에만 저장"을 선택할 수 있습니다.'
                        : 'Confirming will switch your active workspace canvas to this project. You may also choose "Save to Library Only" to preserve your current workspace.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors order-3 sm:order-1"
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLibraryOnly}
                  disabled={isSavingToLibrary}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 order-2"
                >
                  <FolderPlus size={15} className="text-slate-500" />
                  <span>{t('save_to_library_only')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-goguma hover:bg-goguma/90 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-goguma/20 hover:shadow-lg hover:shadow-goguma/30 order-1 sm:order-3"
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
