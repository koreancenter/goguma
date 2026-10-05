import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Upload, FileJson, Copy, Check, X, 
  Sparkles, AlertCircle, CheckCircle2, HardDrive, 
  Layers, Globe, Smartphone, Eye, Code, ArrowRight, FolderPlus,
  FolderArchive
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { auth } from '../../lib/localAuth';
import { 
  downloadProjectFile, 
  copyProjectJsonToClipboard, 
  parseAndValidateProjectJson, 
  saveProjectToLibrary, 
  ProjectValidationResult 
} from '../../lib/projectFileIO';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { normalizePlan, FormInputEntity } from '../../types';

interface ProjectImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import';
  formInputs?: Record<string, FormInputEntity>;
  onProjectLoaded?: () => void;
}

export const ProjectImportExportModal: React.FC<ProjectImportExportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'export',
  formInputs,
  onProjectLoaded
}) => {
  const { t, language } = useLanguage();
  const { plan: currentPlan, setPlan: setCurrentPlan } = useSitePlan();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [importInputMode, setImportInputMode] = useState<'file' | 'text'>('file');

  // Export State
  const [copied, setCopied] = useState(false);
  const [showJsonCode, setShowJsonCode] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);

  // Import State
  const [rawPastedText, setRawPastedText] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ProjectValidationResult | null>(null);
  const [customImportName, setCustomImportName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Blueprint ZIP Download (Priority 1)
  const handleDownloadZip = async () => {
    if (isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      await downloadBlueprintZip(currentPlan, formInputs);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 3000);
    } catch (err: any) {
      alert('ZIP 다운로드 실패: ' + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Handle Export Download
  const handleDownload = () => {
    try {
      const res = downloadProjectFile(currentPlan);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to export: ' + err.message);
    }
  };

  // Handle Copy JSON
  const handleCopy = async () => {
    const success = await copyProjectJsonToClipboard(currentPlan);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle File Input / Drop
  const handleFileChange = (file: File) => {
    setSelectedFileName(file.name);
    setFeedbackMsg(null);

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg({
        type: 'error',
        text: language === 'ko' ? '보안상 5MB를 초과하는 파일은 불러올 수 없습니다.' : 'File exceeds 5MB safety limit.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processJsonContent(text);
    };
    reader.readAsText(file);
  };

  const processJsonContent = (content: string) => {
    const result = parseAndValidateProjectJson(content);
    setValidationResult(result);
    if (result.isValid && result.summary) {
      setCustomImportName(result.summary.projectName);
      setFeedbackMsg(null);
    } else {
      setFeedbackMsg({
        type: 'error',
        text: result.error || (language === 'ko' ? '올바른 프로젝트 JSON 형식이 아닙니다.' : 'Invalid project JSON format.')
      });
    }
  };

  const handlePastedTextChange = (text: string) => {
    setRawPastedText(text);
    if (text.trim()) {
      processJsonContent(text);
    } else {
      setValidationResult(null);
      setFeedbackMsg(null);
    }
  };

  // Action: Open Directly in Workspace
  const handleOpenInWorkspace = () => {
    if (!validationResult?.normalizedPlan) return;
    const planToLoad = normalizePlan(validationResult.normalizedPlan);
    if (customImportName.trim()) {
      planToLoad.metadata.projectName = customImportName.trim();
    }

    if (auth.currentUser) {
      localStorage.removeItem(`goguma_autosave_${auth.currentUser.uid}`);
      localStorage.removeItem(`goguma_autosave_time_${auth.currentUser.uid}`);
    }

    setCurrentPlan(planToLoad);
    setFeedbackMsg({
      type: 'success',
      text: language === 'ko' 
        ? `"${planToLoad.metadata.projectName}" 프로젝트가 워크스페이스에 즉시 로드되었습니다!` 
        : `"${planToLoad.metadata.projectName}" loaded into workspace!`
    });

    setTimeout(() => {
      onProjectLoaded?.();
      onClose();
    }, 900);
  };

  // Action: Save to Projects Library
  const handleSaveToLibrary = async (openImmediately = false) => {
    if (!validationResult?.normalizedPlan || !auth.currentUser) return;
    setIsProcessing(true);
    try {
      const planToSave = normalizePlan(validationResult.normalizedPlan);
      const res = await saveProjectToLibrary(planToSave, auth.currentUser.uid, customImportName);

      if (openImmediately) {
        localStorage.removeItem(`goguma_autosave_${auth.currentUser.uid}`);
        localStorage.removeItem(`goguma_autosave_time_${auth.currentUser.uid}`);
        setCurrentPlan(planToSave);
      }

      setFeedbackMsg({
        type: 'success',
        text: language === 'ko'
          ? `"${res.name}" 프로젝트가 보관함에 성공적으로 저장되었습니다.`
          : `Saved "${res.name}" to your local project library.`
      });

      setTimeout(() => {
        onProjectLoaded?.();
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to save project.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const pagesCount = currentPlan.navigation?.pageStructure?.length || 0;
  const projectName = currentPlan.metadata?.projectName || 'Untitled Project';
  const platform = currentPlan.metadata?.platform || 'WEB';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-goguma/10 text-goguma rounded-2xl flex items-center justify-center">
              <FileJson size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {language === 'ko' ? '프로젝트 파일 단위 JSON 관리' : 'Project File JSON Export / Import'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {language === 'ko'
                  ? '표준 GOGUMA 프로젝트 포맷(.goguma.json)으로 자유롭게 내보내고 불러옵니다'
                  : 'Export and import standalone GOGUMA project files (.goguma.json)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-2 pt-2">
          <button
            onClick={() => { setActiveTab('export'); setFeedbackMsg(null); }}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'export'
                ? 'border-goguma text-goguma'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Download size={14} />
            <span>{language === 'ko' ? '프로젝트 내보내기 (Export)' : 'Export Project'}</span>
          </button>
          <button
            onClick={() => { setActiveTab('import'); setFeedbackMsg(null); }}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'import'
                ? 'border-goguma text-goguma'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Upload size={14} />
            <span>{language === 'ko' ? '프로젝트 가져오기 (Import)' : 'Import Project'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Feedback banner if any */}
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-semibold ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-800 border border-rose-200/80'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </motion.div>
          )}

          {/* EXPORT TAB */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Project Card */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {language === 'ko' ? '현재 열려있는 프로젝트' : 'Active Project in Workspace'}
                    </span>
                    <h3 className="text-lg font-black text-slate-900">{projectName}</h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {currentPlan.metadata?.title || currentPlan.metadata?.projectOverview?.purpose || (language === 'ko' ? '등록된 부제 없음' : 'No description')}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    platform === 'APP'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {platform}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 text-center">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">{language === 'ko' ? '총 페이지' : 'Pages'}</span>
                    <span className="text-sm font-black text-slate-800">{pagesCount}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">{language === 'ko' ? '레이아웃' : 'Layout'}</span>
                    <span className="text-xs font-black text-slate-800 uppercase">{currentPlan.design?.layout || 'standard'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-bold">{language === 'ko' ? '스펙 포맷' : 'Spec'}</span>
                    <span className="text-xs font-black text-goguma">v2.0-open</span>
                  </div>
                </div>
              </div>

              {/* 1. Priority Action: 11-Doc Markdown Blueprint ZIP for Vibe Coding */}
              <div className="p-5 bg-[#F8F4EB] rounded-2xl border border-[#E5DFD3] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#6B1D42]">
                      <FolderArchive size={17} />
                      <span className="text-sm font-serif font-bold">
                        {language === 'ko' ? '바이브 코딩 11종 사양서 번들 (.zip)' : 'Vibe Coding 11-Spec Blueprint (.zip)'}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#6B1D42] text-white font-mono font-semibold">
                        {language === 'ko' ? '권장' : 'Recommended'}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5752] leading-relaxed font-sans">
                      {language === 'ko'
                        ? 'Cursor / Claude Code에 바로 주입 가능한 11종 마크다운 사양서(docs/01~11.md), .cursorrules, 브라우저 즉시 실행 prototype.html이 포함된 전체 압축 아카이브입니다.'
                        : 'Complete archive containing all 11 markdown specs, .cursorrules, and interactive prototype.html for Cursor / Claude Code.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloadingZip}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#6B1D42] hover:bg-[#842352] text-white rounded-xl font-bold text-xs shadow-md shadow-[#6B1D42]/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {zipDownloaded ? (
                    <>
                      <Check size={16} className="text-emerald-300" />
                      <span>{language === 'ko' ? '11종 ZIP 번들 다운로드 완료!' : 'Blueprint ZIP Downloaded!'}</span>
                    </>
                  ) : (
                    <>
                      <FolderArchive size={16} className={isDownloadingZip ? 'animate-bounce' : ''} />
                      <span>
                        {isDownloadingZip 
                          ? (language === 'ko' ? 'ZIP 압축 중...' : 'Compressing ZIP...') 
                          : (language === 'ko' ? '📦 11종 사양서 번들 (.zip) 다운로드 (Cmd+E)' : 'Download 11-Spec Bundle (.zip)')}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* 2. Secondary Action: Raw Project File (.goguma.json) for Backups */}
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'ko' ? '백업 및 원본 데이터 (.goguma.json)' : 'Project Raw Backup JSON'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <Download size={14} />
                    <span>
                      {downloadSuccess
                        ? (language === 'ko' ? '다운로드 완료!' : 'Downloaded!')
                        : (language === 'ko' ? 'JSON 백업 파일 (.goguma.json)' : 'Download .goguma.json')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>
                      {copied
                        ? (language === 'ko' ? '클립보드에 복사됨!' : 'Copied to Clipboard!')
                        : (language === 'ko' ? '클립보드에 JSON 복사' : 'Copy JSON to Clipboard')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Collapsible JSON Preview */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowJsonCode(!showJsonCode)}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Code size={14} />
                  <span>{showJsonCode ? (language === 'ko' ? 'JSON 코드 접기' : 'Hide JSON') : (language === 'ko' ? 'JSON 원본 코드 미리보기' : 'Preview Raw JSON')}</span>
                </button>

                {showJsonCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-slate-900 rounded-2xl text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 select-all"
                  >
                    <pre>{JSON.stringify(currentPlan, null, 2)}</pre>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* IMPORT TAB */}
          {activeTab === 'import' && (
            <div className="space-y-6">
              {/* Method Switcher */}
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setImportInputMode('file')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    importInputMode === 'file'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'ko' ? '파일 업로드 (.json / .goguma.json)' : 'Upload File (.json)'}
                </button>
                <button
                  type="button"
                  onClick={() => setImportInputMode('text')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    importInputMode === 'text'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {language === 'ko' ? 'JSON 텍스트 직접 붙여넣기' : 'Paste Raw JSON Text'}
                </button>
              </div>

              {/* File Dropzone */}
              {importInputMode === 'file' && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-goguma/50 hover:bg-goguma/5 transition-all rounded-3xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.goguma.json,application/json"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {selectedFileName || (language === 'ko' ? '프로젝트 JSON 파일을 드래그하거나 클릭하여 선택' : 'Drop project JSON file here or click to browse')}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {language === 'ko'
                        ? '지원 형식: *.goguma.json, *.json (GOGUMA 단일 프로젝트 또는 SitePlan 규격)'
                        : 'Supported: *.goguma.json, *.json'}
                    </p>
                  </div>
                </div>
              )}

              {/* Raw JSON Paste Area */}
              {importInputMode === 'text' && (
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={rawPastedText}
                    onChange={(e) => handlePastedTextChange(e.target.value)}
                    placeholder={
                      language === 'ko'
                        ? '{\n  "format": "goguma-project",\n  "projectName": "My Architecture",\n  "plan": { ... }\n}'
                        : 'Paste your GOGUMA project JSON here...'
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-goguma/20 focus:border-goguma outline-none resize-none"
                  />
                </div>
              )}

              {/* Inspection Preview if Valid */}
              {validationResult?.isValid && validationResult.summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {language === 'ko' ? '유효한 프로젝트 파일 감지됨' : 'Valid GOGUMA Project Detected'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                      {validationResult.summary.platform}
                    </span>
                  </div>

                  {/* Project Name Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {language === 'ko' ? '가져올 프로젝트 이름 (필요 시 수정)' : 'Project Name to Import'}
                    </label>
                    <input
                      type="text"
                      value={customImportName}
                      onChange={(e) => setCustomImportName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Summary Details */}
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">{language === 'ko' ? '포함된 페이지:' : 'Pages count:'}</span>
                      <span className="font-bold text-slate-900">{validationResult.summary.pageCount} pages</span>
                    </div>
                    {validationResult.summary.pages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {validationResult.summary.pages.slice(0, 6).map((page, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-medium">
                            {page}
                          </span>
                        ))}
                        {validationResult.summary.pages.length > 6 && (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-md text-[10px] font-bold">
                            +{validationResult.summary.pages.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Choices */}
                  <div className="pt-3 border-t border-emerald-200/50 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={handleOpenInWorkspace}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <ArrowRight size={14} />
                      <span>{language === 'ko' ? '워크스페이스에 바로 열기' : 'Open in Workspace'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleSaveToLibrary(false)}
                      className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <FolderPlus size={14} />
                      <span>{language === 'ko' ? '보관함에 새 프로젝트로 저장' : 'Save to Library'}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs text-slate-400">
          <span>{language === 'ko' ? '100% 로컬 프라이버시 보장 (원격 전송 없음)' : '100% Local-first (No remote tracking)'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            {t('close')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
