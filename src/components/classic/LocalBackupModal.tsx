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
import { useSitePlan } from '../../contexts/SitePlanContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface LocalBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalBackupModal: React.FC<LocalBackupModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { plan: currentPlan } = useSitePlan();
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'storage'>('export');

  // Storage Stats
  const [stats, setStats] = useState(getStorageUsageStats);

  // Export State
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Import State
  const [importedFile, setImportedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<GogumaBackupPackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Reset State
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStats(getStorageUsageStats());
      setImportSuccessMsg(null);
      setImportError(null);
      setImportedFile(null);
      setParsedBackup(null);
      setResetConfirmInput('');
      setResetSuccess(false);
      setExportSuccess(false);
    }
  }, [isOpen]);

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
      a.download = `goguma-backup-${dateStr}.json`;
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

  // Copy Current Plan JSON
  const handleCopyPlanJson = () => {
    if (!currentPlan) return;
    navigator.clipboard.writeText(JSON.stringify(currentPlan, null, 2));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  // Handle File Selection
  const handleFileSelect = (file: File) => {
    setImportError(null);
    setImportSuccessMsg(null);
    setImportedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        // Case A: Full local backup package
        if (parsed.collections) {
          setParsedBackup(parsed);
          return;
        }

        // Case B: Standard GogumaProjectFile format
        if (parsed.format === 'goguma-project' && parsed.plan) {
          const plan = parsed.plan;
          const projName = parsed.projectName || plan.metadata?.projectName || 'Imported Project';
          const wrapped: GogumaBackupPackage = {
            version: '2.0-open',
            exportedAt: parsed.exportedAt || new Date().toISOString(),
            collections: {
              projects: {
                [`imported_${Date.now()}`]: {
                  id: `imported_${Date.now()}`,
                  projectName: projName,
                  plan: plan,
                  ownerId: 'local_user',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
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
          return;
        }

        // Case C: Raw SitePlan object
        if (parsed.metadata || parsed.design || parsed.navigation) {
          const wrapped: GogumaBackupPackage = {
            version: '2.0-open',
            exportedAt: new Date().toISOString(),
            collections: {
              projects: {
                [`imported_${Date.now()}`]: {
                  id: `imported_${Date.now()}`,
                  projectName: parsed.metadata?.projectName || 'Imported Project',
                  plan: parsed,
                  ownerId: 'local_user',
                  updatedAt: new Date().toISOString(),
                  createdAt: new Date().toISOString(),
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
          return;
        }

        throw new Error('Unrecognized JSON format. Please select a valid GOGUMA backup or plan file.');
      } catch (err: any) {
        setImportError(err.message || 'Failed to read JSON file.');
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // Execute Restore
  const handleExecuteRestore = () => {
    if (!parsedBackup) return;
    setIsProcessingImport(true);
    setImportError(null);

    try {
      const res = importLocalData(parsedBackup, importMode);
      setImportSuccessMsg(res.message);
      setStats(getStorageUsageStats());
      setParsedBackup(null);
      setImportedFile(null);
    } catch (err: any) {
      setImportError(err.message || 'Import restoration failed.');
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <HardDrive size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  {language === 'ko' ? '로컬 데이터 및 백업 관리' : 'Local Data & Backup Hub'}
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 tracking-wider">
                    100% PRIVATE & OFFLINE
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ko' 
                    ? '모든 기획 데이터는 브라우저 내부(Local Storage)에 안전하게 저장됩니다.' 
                    : 'All project data is stored privately in your browser local storage.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-slate-200/80 bg-white flex gap-6">
            <button
              onClick={() => setActiveTab('export')}
              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'export'
                  ? 'border-goguma text-goguma'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Download size={14} />
              {language === 'ko' ? '데이터 백업 내보내기' : 'Export Backup'}
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'import'
                  ? 'border-goguma text-goguma'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload size={14} />
              {language === 'ko' ? '백업 파일 복원' : 'Import & Restore'}
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'storage'
                  ? 'border-goguma text-goguma'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Database size={14} />
              {language === 'ko' ? '저장소 진단 & 정리' : 'Storage & Clean'}
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* TAB 1: EXPORT */}
            {activeTab === 'export' && (
              <div className="space-y-5">
                {/* Full Backup Box */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FolderArchive className="text-goguma" size={18} />
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        {language === 'ko' ? '전체 워크스페이스 통합 백업 (JSON)' : 'Complete Workspace Backup (.json)'}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                      {language === 'ko'
                        ? `저장된 모든 프로젝트(${stats.projectCount}개), 자동 저장본, AI 엔진 설정값을 단일 JSON 파일로 다운로드합니다.`
                        : `Downloads all ${stats.projectCount} saved project(s), autosaves, and AI engine settings into a single JSON file.`}
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadFullBackup}
                    className="px-5 py-2.5 bg-goguma hover:bg-fuchsia-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs shrink-0"
                  >
                    <Download size={14} />
                    {language === 'ko' ? '전체 백업 다운로드' : 'Download All (.json)'}
                  </button>
                </div>

                {exportSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{language === 'ko' ? '백업 파일이 성공적으로 생성되었습니다!' : 'Backup package generated and downloaded!'}</span>
                  </div>
                )}

                {/* Quick Export Current Project */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileJson className="text-blue-600" size={18} />
                      <h4 className="text-sm font-black text-slate-900 uppercase">
                        {language === 'ko' ? '현재 열려있는 기획안 단독 내보내기' : 'Export Active Project Plan'}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {currentPlan?.metadata?.projectName || 'Untitled'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    {language === 'ko'
                      ? '현재 작성 중인 기획안의 아키텍처, 섹션, 배포 정보만 분리하여 JSON으로 내보내거나 클립보드에 복사합니다.'
                      : 'Export only the current active project plan for quick sharing or manual editing.'}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleDownloadCurrentPlan}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Download size={13} />
                      {language === 'ko' ? '프로젝트 JSON 저장' : 'Save Project JSON'}
                    </button>

                    <button
                      onClick={handleCopyPlanJson}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      {copiedPlan ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      {copiedPlan 
                        ? (language === 'ko' ? '클립보드에 복사됨' : 'Copied to Clipboard!') 
                        : (language === 'ko' ? 'JSON 복사' : 'Copy JSON')}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-500">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    {language === 'ko'
                      ? 'GOGUMA는 공개 오픈 소프트웨어이므로 외부 클라우드나 중앙 서버로 사용자의 기획 데이터나 API 키를 전송하지 않습니다. 백업 파일을 안전한 로컬 드라이브에 보관하세요.'
                      : 'GOGUMA is free, privacy-first software. Your architecture data and keys are never uploaded to any remote server. Keep your backup files on your secure drive.'}
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: IMPORT */}
            {activeTab === 'import' && (
              <div className="space-y-5">
                <div className="border-2 border-dashed border-slate-200 hover:border-goguma/50 transition-colors rounded-2xl p-8 text-center bg-slate-50/50">
                  <Upload size={32} className="mx-auto text-slate-400 mb-3" />
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    {language === 'ko' ? '백업 JSON 파일을 이곳에 업로드하세요' : 'Select or drop your GOGUMA backup JSON file'}
                  </p>
                  <p className="text-[11px] text-slate-400 mb-4">
                    *.json (Full GOGUMA Backup or Single Plan JSON)
                  </p>

                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                    <FileJson size={14} className="text-goguma" />
                    {language === 'ko' ? '파일 선택하기' : 'Browse JSON File'}
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

                {/* Parsed Inspection Preview */}
                {parsedBackup && (
                  <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900 uppercase flex items-center gap-1.5">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        {language === 'ko' ? '백업 파일 검증 완료' : 'Backup File Verified'}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Version: {parsedBackup.version || '2.0'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Projects</div>
                        <div className="font-black text-slate-900">
                          {Object.keys(parsedBackup.collections?.projects || {}).length} saved
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Export Date</div>
                        <div className="font-black text-slate-900 truncate">
                          {parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">AI Settings</div>
                        <div className="font-black text-slate-900">
                          {parsedBackup.aiSettings ? 'Included' : 'None'}
                        </div>
                      </div>
                    </div>

                    {/* Mode Selection */}
                    <div className="pt-2 border-t border-emerald-200/60">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        {language === 'ko' ? '복원 방식 선택' : 'Restore Strategy'}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setImportMode('merge')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            importMode === 'merge'
                              ? 'border-emerald-600 bg-emerald-100/50 ring-1 ring-emerald-600'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">
                            {language === 'ko' ? '안전 병합 (Merge)' : 'Safe Merge'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {language === 'ko' ? '기존 프로젝트를 유지하며 가져온 프로젝트를 추가합니다.' : 'Keep existing projects and add imported records.'}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImportMode('replace')}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            importMode === 'replace'
                              ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="text-xs font-bold text-rose-900">
                            {language === 'ko' ? '전체 덮어쓰기 (Replace All)' : 'Clean Overwrite'}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {language === 'ko' ? '기존 데이터를 모두 지우고 백업 데이터로 대체합니다.' : 'Clear existing workspace and replace with this backup.'}
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={handleExecuteRestore}
                        disabled={isProcessingImport}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
                      >
                        {isProcessingImport ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                        {language === 'ko' ? '복원 진행하기' : 'Apply Restoration'}
                      </button>
                    </div>
                  </div>
                )}

                {importError && (
                  <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-start gap-2 border border-rose-200">
                    <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2 border border-emerald-200">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{importSuccessMsg}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: STORAGE DIAGNOSTICS & RESET */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Storage Used</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{stats.formattedSize}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Approx. browser storage</div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Saved Projects</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{stats.projectCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">In local database</div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autosave Drafts</div>
                    <div className="text-xl font-black text-slate-900 mt-1">{stats.autosaveCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Crash recovery states</div>
                  </div>
                </div>

                {/* Dangerous Reset Zone */}
                <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-4">
                  <div className="flex items-center gap-2 text-rose-900">
                    <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                    <h4 className="text-sm font-black uppercase">
                      {language === 'ko' ? '로컬 데이터 공장 초기화' : 'Factory Reset Local Workspace'}
                    </h4>
                  </div>

                  <p className="text-xs text-rose-700 leading-relaxed">
                    {language === 'ko'
                      ? '저장된 모든 로컬 프로젝트, 임시 저장본 및 캐시가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없으므로 실행 전 백업 파일을 다운로드해 두시기 바랍니다.'
                      : 'Permanently removes all saved local projects, autosave drafts, and local caches from this browser. This cannot be undone.'}
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder='Type "RESET" to confirm'
                      value={resetConfirmInput}
                      onChange={(e) => setResetConfirmInput(e.target.value)}
                      className="px-3.5 py-2 bg-white border border-rose-300 rounded-xl text-xs font-mono text-rose-900 placeholder:text-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />

                    <button
                      type="button"
                      onClick={handleClearStorage}
                      disabled={resetConfirmInput !== 'RESET'}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
                    >
                      <Trash2 size={13} />
                      {language === 'ko' ? '데이터 모두 초기화' : 'Confirm & Wipe Workspace'}
                    </button>
                  </div>

                  {resetSuccess && (
                    <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {language === 'ko' ? '모든 로컬 데이터가 삭제되었습니다. 워크스페이스를 다시 시작합니다...' : 'Workspace wiped. Reloading fresh instance...'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Info size={13} className="text-slate-400" />
              <span>GOGUMA Open Architecture v2.0</span>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              {language === 'ko' ? '닫기' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
