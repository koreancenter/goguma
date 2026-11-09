import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HardDrive, Download, Upload, Trash2, CheckCircle2, AlertTriangle, 
  Copy, Check, FileJson, X, RefreshCw, ShieldCheck, Database, FolderArchive, Info
} from 'lucide-react';
import { 
  exportAllLocalData, 
  importLocalData, 
  getStorageUsageStats, 
  clearAllLocalData, 
  GogumaBackupPackage 
} from '../../lib/localDb';
import { downloadProjectFile } from '../../lib/projectFileIO';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { useLanguage } from '../../contexts/LanguageContext';

export interface LocalBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import' | 'storage';
  formInputs?: Record<string, any>;
}

export const LocalBackupModal: React.FC<LocalBackupModalProps> = ({ 
  isOpen, 
  onClose,
  initialTab = 'export',
  formInputs,
}) => {
  const { language } = useLanguage();
  const { plan: currentPlan } = useSitePlan();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'storage'>(initialTab);

  // Storage Stats
  const [stats, setStats] = useState(getStorageUsageStats);

  // Export State
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Import State
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<GogumaBackupPackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [importInputType, setImportInputType] = useState<'file' | 'text'>('file');

  // Reset State
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setStats(getStorageUsageStats());
      setImportSuccessMsg(null);
      setImportError(null);
      setImportedFile(null);
      setParsedBackup(null);
      setPastedJsonText('');
      setResetConfirmInput('');
      setResetSuccess(false);
      setExportSuccess(false);
      setZipSuccess(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Handle Full JSON Backup Download
  const handleDownloadFullBackup = () => {
    try {
      const backupData = exportAllLocalData();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `siteplan-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err: any) {
      alert('Failed to export backup: ' + err.message);
    }
  };

  // Handle Current Project Single Export
  const handleDownloadCurrentPlan = () => {
    if (!currentPlan) return;
    downloadProjectFile(currentPlan);
  };

  // Handle 11-Doc ZIP Blueprint Download
  const handleDownloadZipBundle = async () => {
    if (!currentPlan || isDownloadingZip) return;
    setIsDownloadingZip(true);
    try {
      await downloadBlueprintZip(currentPlan, formInputs);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err: any) {
      alert('Failed to export ZIP bundle: ' + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Copy Current Plan JSON
  const handleCopyPlanJson = () => {
    if (!currentPlan) return;
    navigator.clipboard.writeText(JSON.stringify(currentPlan, null, 2));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  // Parse raw JSON text or file content
  const processRawJsonData = (text: string) => {
    setImportError(null);
    setImportSuccessMsg(null);
    try {
      const parsed = JSON.parse(text);

      if (parsed.appletId && parsed.collections) {
        setParsedBackup(parsed);
      } else if (parsed.metadata && parsed.design) {
        // Wrap single project plan into backup structure
        const wrapped: GogumaBackupPackage = {
          version: '2.0-open',
          exportedAt: new Date().toISOString(),
          collections: {
            projects: {
              [`imported_${Date.now()}`]: {
                id: `imported_${Date.now()}`,
                userId: 'imported-user',
                name: parsed.metadata.projectName || 'Imported Plan',
                plan: parsed,
                updatedAt: new Date().toISOString(),
              }
            }
          },
          meta: {
            projectCount: 1,
            appName: 'GOGUMA Web Architecture Suite',
            version: '2.0.0-local'
          }
        };
        setParsedBackup(wrapped);
      } else {
        throw new Error('유효한 기획서 백업 또는 프로젝트 JSON 규격이 아닙니다.');
      }
    } catch (err: any) {
      setImportError(err.message || 'JSON 파싱에 실패했습니다.');
      setParsedBackup(null);
    }
  };

  // Handle File Selection
  const handleFileSelect = (file: File) => {
    setImportedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      processRawJsonData(text);
    };
    reader.readAsText(file);
  };

  // Handle pasted text parse
  const handleParsePastedText = () => {
    if (!pastedJsonText.trim()) {
      setImportError('붙여넣을 JSON 텍스트를 입력해 주세요.');
      return;
    }
    processRawJsonData(pastedJsonText.trim());
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!parsedBackup) return;

    setIsProcessingImport(true);
    try {
      const res = importLocalData(parsedBackup, importMode);
      setStats(getStorageUsageStats());
      setImportSuccessMsg(
        language === 'ko'
          ? `복원 완료: ${res.projectCount}개 프로젝트가 성공적으로 로드되었습니다.`
          : `Restored: ${res.projectCount} project(s) successfully imported.`
      );
      setParsedBackup(null);
      setImportedFile(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setImportError(err.message || '복원 작업 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  // Handle Local Storage Reset
  const handleClearStorage = () => {
    if (resetConfirmInput !== 'RESET') {
      alert(language === 'ko' ? '정확히 "RESET"을 입력해 주세요.' : 'Please type "RESET" to confirm.');
      return;
    }

    clearAllLocalData();
    setStats(getStorageUsageStats());
    setResetSuccess(true);
    setResetConfirmInput('');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          className="w-full max-w-2xl h-[580px] bg-white rounded-[2px] shadow-2xl border border-stone-200 overflow-hidden flex flex-col text-stone-900 font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[2px] bg-[#D97706] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-sans font-bold text-stone-900 tracking-tight">
                  {language === 'ko' ? '로컬 데이터 및 백업 허브' : 'Local Data & Backup Hub'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 py-2 border-b border-stone-200 bg-stone-50 flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Download size={13} />
              <span>{language === 'ko' ? '데이터 백업 내보내기' : 'Export Backup'}</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Upload size={13} />
              <span>{language === 'ko' ? '백업 파일 복원' : 'Import & Restore'}</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'storage'
                  ? 'bg-[#D97706] text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Database size={13} />
              <span>{language === 'ko' ? '저장소 진단 & 정리' : 'Storage & Clean'}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 p-6 overflow-y-auto custom-scroll space-y-5 bg-white">
            {/* TAB 1: EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                {/* Full Backup Box */}
                <div className="p-4.5 rounded-[2px] border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="text-[#D97706]" size={16} />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        {language === 'ko' ? '전체 워크스페이스 통합 백업 (JSON)' : 'Complete Workspace Backup (.json)'}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 max-w-md leading-relaxed">
                      {language === 'ko'
                        ? `저장된 모든 프로젝트(${stats.projectCount}개), 자동 저장본, AI 엔진 설정값을 단일 JSON 파일로 다운로드합니다.`
                        : `Downloads all ${stats.projectCount} saved project(s), autosaves, and AI engine settings into a single JSON file.`}
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadFullBackup}
                    className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    <Download size={13} />
                    <span>{language === 'ko' ? '전체 백업 다운로드' : 'Download All (.json)'}</span>
                  </button>
                </div>

                {exportSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-[2px] text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>{language === 'ko' ? '백업 파일이 성공적으로 생성되었습니다!' : 'Backup package generated and downloaded!'}</span>
                  </div>
                )}

                {/* Quick Export Current Project */}
                <div className="p-4.5 rounded-[2px] border border-stone-200 bg-stone-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileJson className="text-[#D97706]" size={16} />
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        {language === 'ko' ? '현재 열려있는 기획안 단독 내보내기' : 'Export Active Project Plan'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-[#D97706] bg-amber-50 px-2 py-0.5 rounded-[2px] border border-amber-200/80 font-semibold">
                      {currentPlan?.metadata?.projectName || 'Untitled'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600">
                    {language === 'ko'
                      ? '현재 작성 중인 기획안의 아키텍처, 섹션, 배포 정보만 분리하여 JSON으로 내보내거나 클립보드에 복사합니다.'
                      : 'Export only the current active project plan for quick sharing or manual editing.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={handleDownloadCurrentPlan}
                      className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Download size={13} />
                      <span>{language === 'ko' ? '프로젝트 JSON 저장' : 'Save Project JSON'}</span>
                    </button>

                    <button
                      onClick={handleDownloadZipBundle}
                      disabled={isDownloadingZip}
                      className="px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <FolderArchive size={13} className="text-[#D97706]" />
                      <span>
                        {zipSuccess
                          ? (language === 'ko' ? 'ZIP 다운로드됨!' : 'ZIP Downloaded!')
                          : (language === 'ko' ? '11종 ZIP 사양서 번들' : '11-Doc ZIP Bundle')}
                      </span>
                    </button>

                    <button
                      onClick={handleCopyPlanJson}
                      className="px-3.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedPlan ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>
                        {copiedPlan 
                          ? (language === 'ko' ? '복사됨' : 'Copied!') 
                          : (language === 'ko' ? 'JSON 복사' : 'Copy JSON')}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-[2px] bg-amber-50/60 border border-amber-200/70 flex items-start gap-2.5 text-xs text-stone-700">
                  <ShieldCheck size={15} className="text-[#D97706] shrink-0 mt-0.5" />
                  <span>
                    {language === 'ko'
                      ? '본 애플리케이션은 사용자의 기획 데이터나 API 키를 외부 서버로 전송하지 않습니다. 백업 파일을 안전한 로컬 드라이브에 보관하세요.'
                      : 'This is private offline software. Your architecture data and keys are never uploaded to any remote server.'}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: IMPORT */}
            {activeTab === 'import' && (
              <div className="space-y-4">
                {/* Mode Selector: File or Paste Text */}
                <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs">
                  <button
                    onClick={() => setImportInputType('file')}
                    className={`px-3 py-1 rounded-[2px] font-semibold transition-colors cursor-pointer ${
                      importInputType === 'file'
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'ko' ? '파일 업로드' : 'File Upload'}
                  </button>
                  <button
                    onClick={() => setImportInputType('text')}
                    className={`px-3 py-1 rounded-[2px] font-semibold transition-colors cursor-pointer ${
                      importInputType === 'text'
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {language === 'ko' ? 'JSON 직접 붙여넣기' : 'Paste JSON Text'}
                  </button>
                </div>

                {importInputType === 'file' ? (
                  <div className="border border-dashed border-stone-300 hover:border-[#D97706] transition-colors rounded-[2px] p-8 text-center bg-stone-50/70">
                    <Upload size={28} className="mx-auto text-[#D97706] mb-2.5" />
                    <p className="text-xs font-semibold text-stone-900 mb-1">
                      {language === 'ko' ? '백업 JSON 파일을 이곳에 업로드하세요' : 'Select or drop your backup JSON file'}
                    </p>
                    <p className="text-[11px] font-mono text-stone-500 mb-4">
                      *.json (Full Backup or Single Plan JSON)
                    </p>

                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold cursor-pointer transition-colors shadow-xs">
                      <FileJson size={13} />
                      <span>{language === 'ko' ? '파일 선택하기' : 'Browse JSON File'}</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileSelect(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="p-4 rounded-[2px] border border-stone-200 bg-stone-50/70 space-y-3">
                    <textarea
                      value={pastedJsonText}
                      onChange={(e) => setPastedJsonText(e.target.value)}
                      placeholder='{ "metadata": { ... }, "collections": { ... } }'
                      rows={6}
                      className="w-full p-3 font-mono text-xs bg-white border border-stone-200 rounded-[2px] text-stone-900 focus:outline-none focus:border-[#D97706] leading-relaxed shadow-2xs"
                    />
                    <button
                      onClick={handleParsePastedText}
                      className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      {language === 'ko' ? '붙여넣은 JSON 검증 및 해석' : 'Parse Pasted JSON'}
                    </button>
                  </div>
                )}

                {/* Parsed Inspection Preview */}
                {parsedBackup && (
                  <div className="p-4.5 rounded-[2px] border border-stone-200 bg-stone-50/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900 uppercase flex items-center gap-1.5">
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>{language === 'ko' ? '백업 파일 검증 완료' : 'Backup File Verified'}</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-[2px] border border-amber-300/60 font-semibold">
                        Version: {parsedBackup.version || '2.0'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="bg-white p-2.5 rounded-[2px] border border-stone-200 shadow-2xs">
                        <div className="text-[10px] font-mono text-stone-500 uppercase">Projects</div>
                        <div className="font-mono font-bold text-stone-900 mt-0.5">
                          {Object.keys(parsedBackup.collections?.projects || {}).length} saved
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-[2px] border border-stone-200 shadow-2xs">
                        <div className="text-[10px] font-mono text-stone-500 uppercase">Export Date</div>
                        <div className="font-mono font-bold text-stone-900 mt-0.5 truncate">
                          {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-[2px] border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-mono text-stone-500 uppercase">AI Settings</div>
                        <div className="font-mono font-bold text-stone-900 mt-0.5">
                          {parsedBackup.aiSettings ? 'Included' : 'None'}
                        </div>
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="pt-2 border-t border-stone-200">
                      <label className="block text-xs font-semibold text-stone-900 mb-2">
                        {language === 'ko' ? '복원 방식 선택' : 'Restore Strategy'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setImportMode('merge')}
                          className={`p-3 rounded-[2px] border text-left transition-all cursor-pointer ${
                            importMode === 'merge'
                              ? 'border-[#D97706] bg-amber-50/70'
                              : 'border-stone-200 bg-white'
                          }`}
                        >
                          <div className="text-xs font-semibold text-stone-900">
                            {language === 'ko' ? '안전 병합 (Merge)' : 'Safe Merge'}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {language === 'ko' ? '기존 프로젝트를 유지하며 추가합니다.' : 'Keep existing projects and add imported records.'}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImportMode('replace')}
                          className={`p-3 rounded-[2px] border text-left transition-all cursor-pointer ${
                            importMode === 'replace'
                              ? 'border-[#D97706] bg-amber-50/70'
                              : 'border-stone-200 bg-white'
                          }`}
                        >
                          <div className="text-xs font-semibold text-stone-900">
                            {language === 'ko' ? '전체 덮어쓰기 (Replace All)' : 'Clean Overwrite'}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {language === 'ko' ? '기존 데이터를 모두 지우고 대체합니다.' : 'Clear existing workspace and replace.'}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={isProcessingImport}
                        className="px-4 py-2 bg-[#D97706] hover:bg-[#B45309] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        {isProcessingImport ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                        <span>{language === 'ko' ? '복원 진행하기' : 'Apply Restoration'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-rose-50 text-rose-800 rounded-[2px] text-xs flex items-start gap-2 border border-rose-200">
                    <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-[2px] text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STORAGE DIAGNOSTICS & RESET */}
            {activeTab === 'storage' && (
              <div className="space-y-4">
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-3.5 rounded-[2px] border border-stone-200 bg-stone-50/70">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Storage Used</div>
                    <div className="text-lg font-mono font-bold text-stone-900 mt-1">{stats.formattedSize}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">Local storage</div>
                  </div>

                  <div className="p-3.5 rounded-[2px] border border-stone-200 bg-stone-50/70">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Saved Projects</div>
                    <div className="text-lg font-mono font-bold text-stone-900 mt-1">{stats.projectCount}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">Active records</div>
                  </div>

                  <div className="p-3.5 rounded-[2px] border border-stone-200 bg-stone-50/70 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-stone-500">Autosave Drafts</div>
                    <div className="text-lg font-mono font-bold text-stone-900 mt-1">{stats.autosaveCount}</div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">Recovery states</div>
                  </div>
                </div>

                {/* Reset Zone */}
                <div className="p-4.5 rounded-[2px] border border-rose-200 bg-rose-50/40 space-y-3">
                  <div className="flex items-center gap-2 text-rose-950">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {language === 'ko' ? '로컬 데이터 초기화' : 'Reset Local Workspace'}
                    </h4>
                  </div>

                  <p className="text-xs text-rose-900 leading-relaxed font-sans">
                    {language === 'ko'
                      ? '저장된 모든 로컬 프로젝트와 캐시가 삭제됩니다. 실행 전 백업 파일을 다운로드해 두시기 바랍니다.'
                      : 'Permanently removes saved local projects and cache from this browser.'}
                  </p>

                  <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <input
                      type="text"
                      placeholder='Type "RESET" to confirm'
                      value={resetConfirmInput}
                      onChange={(e) => setResetConfirmInput(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-rose-300 rounded-[2px] text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-rose-500"
                    />

                    <button
                      type="button"
                      onClick={handleClearStorage}
                      disabled={resetConfirmInput !== 'RESET'}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white rounded-[2px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
                    >
                      <Trash2 size={13} />
                      <span>{language === 'ko' ? '데이터 모두 초기화' : 'Confirm Reset'}</span>
                    </button>
                  </div>

                  {resetSuccess && (
                    <div className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 pt-1">
                      <CheckCircle2 size={13} />
                      <span>{language === 'ko' ? '초기화되었습니다. 다시 시작합니다...' : 'Reset complete. Reloading...'}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
              <Info size={12} className="text-stone-400" />
              <span>OFFLINE STORAGE ENGINE</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium rounded-[2px] transition-colors cursor-pointer shadow-2xs"
            >
              {language === 'ko' ? '닫기' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
