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
            className="fixed inset-0 z-[9999] bg-[#000000]/45 backdrop-blur-xs flex items-center justify-center p-6 select-none cursor-copy"
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-w-xl w-full bg-[#FFFFFF] border-2 border-[#000000] rounded-none p-10 sm:p-14 text-center overflow-hidden pointer-events-none"
            >
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-none bg-[#000000] text-[#FFE600] flex items-center justify-center mb-6 font-bold"
                >
                  <Upload size={30} strokeWidth={2} />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl font-sans font-extrabold text-[#000000] tracking-tight mb-3 uppercase">
                  {t('dropzone_title')}
                </h2>

                <p className="text-[16px] sm:text-[18px] text-[#595959] max-w-md leading-relaxed mb-7 font-sans">
                  {t('dropzone_subtitle')}
                </p>

                <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none text-[14px] font-bold font-sans text-[#000000]">
                  <FileJson size={16} className="text-[#000000]" />
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
              className="bg-[#FFFFFF] w-full max-w-2xl max-h-[90vh] rounded-none overflow-hidden flex flex-col border-t-4 border-t-[#000000] border border-[#E4E2DC] text-[#111111] font-sans"
            >
              {/* Modal Top Banner & Header */}
              <div className="px-7 py-5 bg-[#F6F5F1] border-b border-[#E4E2DC] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 bg-[#000000] text-[#FFE600] rounded-none flex items-center justify-center shrink-0 font-bold">
                    <FileJson size={20} />
                  </div>
                  <div>
                    <h3 className="text-[20px] sm:text-[22px] font-sans font-extrabold text-[#000000] tracking-tight">
                      {t('drop_confirm_title')}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="p-2 text-[#595959] hover:text-[#000000] rounded-none hover:bg-[#E4E2DC]/60 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body: Project Data Summary */}
              <div className="flex-1 p-7 space-y-6 overflow-y-auto custom-scroll bg-[#FFFFFF]">
                {/* File Information Row */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#F6F5F1] rounded-none border border-[#E4E2DC] text-[15px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText size={16} className="text-[#000000] shrink-0" />
                    <span className="font-bold text-[#000000] truncate">{stagedProject.fileName}</span>
                    <span className="px-2 py-0.5 bg-[#000000] rounded-none text-[12px] font-bold font-sans text-[#FFE600] uppercase">
                      {summary.version === '2.0' ? 'v2.0 Spec' : 'SitePlan Spec'}
                    </span>
                  </div>
                  <span className="text-[#595959] font-sans tabular-nums text-[14px] shrink-0 ml-3">
                    {formatFileSize(stagedProject.fileSize)}
                  </span>
                </div>

                {/* Primary Project Card */}
                <div className="p-6 bg-[#F6F5F1] rounded-none border border-[#E4E2DC] border-t-2 border-t-[#000000] space-y-5">
                  {/* Title & Platform Row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-bold font-sans uppercase tracking-[0.12em] text-[#7A7A7A]">
                        {language === 'ko' ? '프로젝트 명칭' : 'Project Name'}
                      </span>
                      <h4 className="text-[22px] sm:text-[24px] font-sans font-extrabold text-[#000000] mt-1 tracking-tight truncate">
                        {summary.projectName || 'Untitled Project'}
                      </h4>
                    </div>

                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-none text-[13px] font-sans bg-[#FFFFFF] text-[#000000] border border-[#000000] shrink-0 font-bold uppercase tracking-wider">
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
                    <div className="p-4 bg-[#FFFFFF] rounded-none border border-[#E4E2DC]">
                      <div className="flex items-center gap-1.5 text-[#7A7A7A] mb-1.5">
                        <Layers size={14} className="text-[#000000]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">{t('number_of_pages')}</span>
                      </div>
                      <p className="text-[20px] font-sans font-extrabold text-[#000000]">
                        {summary.pageCount}
                        <span className="text-[14px] font-medium text-[#595959] ml-1.5">
                          {language === 'ko' ? '개 화면' : 'pages'}
                        </span>
                      </p>
                    </div>

                    {/* Metric 2: Theme / Design Palette */}
                    <div className="p-4 bg-[#FFFFFF] rounded-none border border-[#E4E2DC]">
                      <div className="flex items-center gap-1.5 text-[#7A7A7A] mb-1.5">
                        <Palette size={14} className="text-[#000000]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">
                          {language === 'ko' ? '테마 색상' : 'Theme Color'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span 
                          className="w-5 h-5 rounded-none border border-[#000000]/20" 
                          style={{ backgroundColor: themeColor }}
                          title={`Primary: ${themeColor}`}
                        />
                        <span 
                          className="w-5 h-5 rounded-none border border-[#000000]/20" 
                          style={{ backgroundColor: accentColor }}
                          title={`Accent: ${accentColor}`}
                        />
                        <span className="text-[14px] font-bold font-sans tabular-nums text-[#111111] uppercase">
                          {themeColor}
                        </span>
                      </div>
                    </div>

                    {/* Metric 3: Target Platform */}
                    <div className="p-4 bg-[#FFFFFF] rounded-none border border-[#E4E2DC] col-span-2 sm:col-span-1">
                      <div className="flex items-center gap-1.5 text-[#7A7A7A] mb-1.5">
                        <Target size={14} className="text-[#000000]" />
                        <span className="text-[12px] font-bold font-sans uppercase tracking-wider">
                          {language === 'ko' ? '타겟 대상' : 'Target'}
                        </span>
                      </div>
                      <p className="text-[15px] text-[#000000] font-bold truncate mt-1.5">
                        {summary.target || (language === 'ko' ? '일반 사용자' : 'General Users')}
                      </p>
                    </div>
                  </div>

                  {/* Project Overview / Purpose */}
                  {summary.purpose && (
                    <div className="pt-1">
                      <span className="text-[13px] font-bold font-sans text-[#7A7A7A] uppercase tracking-[0.12em] block mb-1.5">
                        {language === 'ko' ? '기획 의도 및 목적' : 'Project Purpose & Intent'}
                      </span>
                      <p className="text-[16px] text-[#111111] leading-relaxed bg-[#FFFFFF] p-4 rounded-none border border-[#E4E2DC] font-sans">
                        {summary.purpose}
                      </p>
                    </div>
                  )}

                  {/* Included Page Architecture List */}
                  <div className="pt-1">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[14px] font-bold text-[#000000] flex items-center gap-2 uppercase tracking-wider">
                        <Layers size={15} className="text-[#000000]" />
                        <span>{language === 'ko' ? '포함된 페이지 구조 상세' : 'Page Structure Details'}</span>
                      </span>
                      {summary.pages.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllPages(!showAllPages)}
                          className="text-[14px] font-bold font-sans text-[#000000] hover:text-[#DC2626] cursor-pointer"
                        >
                          {showAllPages 
                            ? (language === 'ko' ? '간략히 보기' : 'Show less') 
                            : (language === 'ko' ? `전체 ${summary.pages.length}개 보기` : `View all ${summary.pages.length}`)}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-[#FFFFFF] rounded-none border border-[#E4E2DC]">
                      {(showAllPages ? pageStructure : pageStructure.slice(0, 6)).map((page, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#F6F5F1] border border-[#E4E2DC] rounded-none text-[14px] text-[#111111]"
                        >
                          <span className="font-bold">{page.name || 'Untitled'}</span>
                          {page.slug && (
                            <span className="text-[13px] text-[#595959] font-sans">({page.slug})</span>
                          )}
                        </div>
                      ))}
                      {!showAllPages && pageStructure.length > 6 && (
                        <span className="px-3 py-1.5 bg-[#F6F5F1] rounded-none text-[14px] font-bold font-sans tabular-nums text-[#595959] border border-[#E4E2DC]">
                          +{pageStructure.length - 6} {language === 'ko' ? '더보기' : 'more'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="flex items-start gap-3 p-4 bg-[#F6F5F1] border-l-4 border-l-[#000000] border border-[#E4E2DC] rounded-none text-[15px] text-[#111111]">
                  <Sparkles size={18} className="text-[#000000] shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold text-[#000000] mb-1">
                      {language === 'ko' ? '불러오기 확인' : 'Import Confirmation'}
                    </p>
                    <p className="text-[#595959]">
                      {language === 'ko'
                        ? '확인 버튼을 누르면 현재 편집 화면이 이 프로젝트 데이터로 전환됩니다. 기존 작업물을 보존하려면 먼저 "보관함에만 저장"을 선택할 수 있습니다.'
                        : 'Confirming will switch your active workspace canvas to this project. You may also choose "Save to Library Only" to preserve your current workspace.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-7 py-4 bg-[#F6F5F1] border-t border-[#E4E2DC] flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setStagedProject(null)}
                  className="w-full sm:w-auto px-5 py-2.5 text-[15px] font-bold text-[#595959] hover:text-[#000000] rounded-none hover:bg-[#E4E2DC]/60 transition-colors cursor-pointer order-3 sm:order-1"
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  onClick={handleSaveToLibraryOnly}
                  disabled={isSavingToLibrary}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#FFE600] border border-[#000000] text-[#000000] text-[15px] font-bold rounded-none transition-colors cursor-pointer disabled:opacity-40 order-2"
                >
                  <FolderPlus size={16} />
                  <span>{t('save_to_library_only')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmImport}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#000000] hover:bg-[#FFE600] text-[#FFFFFF] hover:text-[#000000] text-[15px] font-bold rounded-none transition-colors cursor-pointer order-1 sm:order-3"
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
