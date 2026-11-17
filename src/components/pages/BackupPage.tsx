import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download, Upload, Trash2, CheckCircle2, AlertTriangle, Copy, Check,
  FileJson, RefreshCw, ShieldCheck, FolderArchive
} from 'lucide-react';
import {
  exportAllLocalData,
  importLocalData,
  getStorageUsageStats,
  clearAllLocalData,
  GogumaBackupPackage,
} from '../../lib/localDb';
import { downloadProjectFile } from '../../lib/projectFileIO';
import { downloadBlueprintZip } from '../../lib/bundleZipDownloader';
import { useSitePlan } from '../../contexts/SitePlanContext';
import { FormInputEntity } from '../../types';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
} from '../classic/layout/EditorialPageLayout';

export type BackupTab = 'export' | 'import' | 'storage';

interface BackupPageProps {
  formInputs?: Record<string, FormInputEntity>;
  lockedChapters?: number[];
}

export default function BackupPage({ formInputs, lockedChapters }: BackupPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { plan: currentPlan } = useSitePlan();

  const paramTab = searchParams.get('tab') as BackupTab | null;
  const initialTab: BackupTab =
    paramTab && ['export', 'import', 'storage'].includes(paramTab) ? paramTab : 'export';

  const [activeTab, setActiveTab] = useState<BackupTab>(initialTab);
  const [stats, setStats] = useState(getStorageUsageStats);
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const [parsedBackup, setParsedBackup] = useState<GogumaBackupPackage | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const [pastedJsonText, setPastedJsonText] = useState('');
  const [importInputType, setImportInputType] = useState<'file' | 'text'>('file');

  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (paramTab && ['export', 'import', 'storage'].includes(paramTab)) {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  const selectTab = (tab: BackupTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
    setActionError(null);
  };

  const handleDownloadFullBackup = () => {
    setActionError(null);
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
      setActionError('백업 내보내기에 실패했습니다: ' + err.message);
    }
  };

  const handleDownloadCurrentPlan = () => {
    if (!currentPlan) return;
    downloadProjectFile(currentPlan);
  };

  const handleDownloadZipBundle = async () => {
    if (!currentPlan || isDownloadingZip) return;
    setActionError(null);
    setIsDownloadingZip(true);
    try {
      await downloadBlueprintZip(currentPlan, formInputs, lockedChapters);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err: any) {
      setActionError('ZIP 번들 생성에 실패했습니다: ' + err.message);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleCopyPlanJson = () => {
    if (!currentPlan) return;
    navigator.clipboard.writeText(JSON.stringify(currentPlan, null, 2));
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  };

  const processRawJsonData = (text: string) => {
    setImportError(null);
    setImportSuccessMsg(null);
    try {
      const parsed = JSON.parse(text);
      if (parsed.appletId && parsed.collections) {
        setParsedBackup(parsed);
      } else if (parsed.metadata && parsed.design) {
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
              },
            },
          },
          meta: {
            projectCount: 1,
            appName: 'GOGUMA Web Architecture Suite',
            version: '2.0.0-local',
          },
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

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      processRawJsonData(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleParsePastedText = () => {
    if (!pastedJsonText.trim()) {
      setImportError('붙여넣을 JSON 텍스트를 입력해 주세요.');
      return;
    }
    processRawJsonData(pastedJsonText.trim());
  };

  const handleExecuteRestore = () => {
    if (!parsedBackup) return;
    setIsProcessingImport(true);
    try {
      const res = importLocalData(parsedBackup, importMode);
      setStats(getStorageUsageStats());
      setImportSuccessMsg(`복원 완료: ${res.projectCount}개 프로젝트가 성공적으로 로드되었습니다.`);
      setParsedBackup(null);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setImportError(err.message || '복원 작업 중 오류가 발생했습니다.');
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleClearStorage = () => {
    if (resetConfirmInput !== 'RESET') {
      setActionError('정확히 "RESET"을 입력해 주세요.');
      return;
    }
    setActionError(null);
    clearAllLocalData();
    setStats(getStorageUsageStats());
    setResetSuccess(true);
    setResetConfirmInput('');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const tabs = [
    { id: 'export', label: '데이터 백업 내보내기', onClick: () => selectTab('export') },
    { id: 'import', label: '백업 파일 복원', onClick: () => selectTab('import') },
    { id: 'storage', label: '저장소 진단 & 정리', onClick: () => selectTab('storage') },
  ];

  return (
    <EditorialPageLayout
      category="LOCAL STORAGE & BACKUP HUB"
      title="보관함 및 로컬 백업"
      subtitle="브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관된 모든 프로젝트 데이터를 백업, 복원 및 관리합니다."
      tabs={tabs}
      activeTabId={activeTab}
    >
      {actionError && (
        <div className="p-4 bg-[#FEF2F2] text-[#DC2626] rounded-none text-xs font-bold flex items-center gap-2 border border-[#DC2626]">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-6">
          <EditorialSection chapter="1. 전체 워크스페이스 통합 백업">
            <div className="p-6 border border-[#E4E2DC] bg-[#F6F5F1] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#000000]">
                  <FolderArchive size={16} />
                  <span>전체 워크스페이스 통합 백업 (.json)</span>
                </div>
                <p className="text-xs text-[#3F3F3C] max-w-xl leading-relaxed">
                  저장된 모든 프로젝트({stats.projectCount}개), 자동 저장 스냅샷, 인공지능 엔진 설정값을 단일 JSON 파일로 내려받습니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullBackup}
                className="px-5 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
              >
                <Download size={14} />
                <span>전체 백업 다운로드</span>
              </button>
            </div>

            {exportSuccess && (
              <div className="p-3.5 bg-[#F3F7F4] text-[#1F5132] text-xs font-bold flex items-center gap-2 border border-[#1F5132]">
                <CheckCircle2 size={15} />
                <span>백업 파일이 성공적으로 생성·다운로드되었습니다.</span>
              </div>
            )}
          </EditorialSection>

          <EditorialSection chapter="2. 현재 활성 프로젝트 단독 내보내기">
            <div className="p-6 border border-[#E4E2DC] bg-[#FFFFFF] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#000000]">
                  <FileJson size={16} />
                  <span>현재 열린 기획서 내보내기</span>
                </div>
                <span className="px-2.5 py-1 bg-[#000000] text-[#FFE600] text-xs font-bold">
                  {currentPlan?.metadata?.projectName || 'Untitled'}
                </span>
              </div>

              <p className="text-xs text-[#52524E]">
                현재 작성 중인 기획서의 아키텍처, 섹션 원고 및 사양서 번들을 개별 파일로 저장하거나 복사합니다.
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCurrentPlan}
                  className="px-4 py-2 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>프로젝트 JSON 저장</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadZipBundle}
                  disabled={isDownloadingZip}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] border border-[#000000] text-[#000000] rounded-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FolderArchive size={13} />
                  <span>{zipSuccess ? 'ZIP 다운로드 완료!' : '11종 ZIP 사양서 번들'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPlanJson}
                  className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] border border-[#000000] text-[#000000] rounded-none text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPlan ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedPlan ? 'JSON 복사됨' : 'JSON 복사'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] flex items-start gap-2.5 text-xs text-[#3F3F3C]">
              <ShieldCheck size={15} className="text-[#000000] shrink-0 mt-0.5" />
              <span>
                모든 기획 데이터와 API 키는 외부 중앙 서버로 전송되지 않으며, 내보낸 백업 파일은 안전하게 로컬 드라이브에 보관하실 수 있습니다.
              </span>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'import' && (
        <EditorialSection chapter="백업 파일 불러오기 및 복원">
          <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-3 text-xs">
            <button
              type="button"
              onClick={() => setImportInputType('file')}
              className={`px-4 py-2 rounded-none font-bold transition-colors cursor-pointer ${
                importInputType === 'file'
                  ? 'bg-[#000000] text-[#FFE600]'
                  : 'bg-[#F6F5F1] text-[#3F3F3C] hover:bg-[#DC2626] hover:text-[#FFE600]'
              }`}
            >
              파일 업로드 (.json)
            </button>
            <button
              type="button"
              onClick={() => setImportInputType('text')}
              className={`px-4 py-2 rounded-none font-bold transition-colors cursor-pointer ${
                importInputType === 'text'
                  ? 'bg-[#000000] text-[#FFE600]'
                  : 'bg-[#F6F5F1] text-[#3F3F3C] hover:bg-[#DC2626] hover:text-[#FFE600]'
              }`}
            >
              JSON 직접 붙여넣기
            </button>
          </div>

          {importInputType === 'file' ? (
            <div className="border-2 border-dashed border-[#000000]/30 hover:border-[#000000] transition-colors rounded-none p-10 text-center bg-[#F6F5F1]">
              <Upload size={28} className="mx-auto text-[#000000] mb-3" />
              <p className="text-sm font-bold text-[#000000] mb-1">백업 JSON 파일을 선택하세요</p>
              <p className="text-xs text-[#52524E] mb-4">*.json (Full Backup 또는 Single Plan JSON)</p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold cursor-pointer transition-colors">
                <FileJson size={14} />
                <span>JSON 파일 찾아보기</span>
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
            <div className="p-5 border border-[#E4E2DC] bg-[#F6F5F1] space-y-3">
              <textarea
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='{ "metadata": { ... }, "collections": { ... } }'
                rows={7}
                className="w-full p-3.5 font-mono text-xs bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none outline-none"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-5 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold transition-colors cursor-pointer"
              >
                붙여넣은 JSON 검증 및 해석
              </button>
            </div>
          )}

          {parsedBackup && (
            <div className="p-6 border-2 border-[#000000] bg-[#FFFFFF] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>백업 파일 검증 완료</span>
                </span>
                <span className="px-2.5 py-0.5 bg-[#000000] text-[#FFE600] text-[11px] font-bold">
                  Version: {parsedBackup.version || '2.0'}
                </span>
              </div>

              <EditorialTable
                headers={['프로젝트 수', '내보낸 일시', 'AI 설정 포함 여부']}
                rows={[
                  [
                    `${Object.keys(parsedBackup.collections?.projects || {}).length}개`,
                    parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleDateString() : 'N/A',
                    parsedBackup.aiSettings ? '포함됨' : '없음',
                  ],
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-3.5 rounded-none border text-left transition-colors cursor-pointer ${
                    importMode === 'merge'
                      ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                      : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC]'
                  }`}
                >
                  <div className="text-xs font-bold">안전 병합 (Merge)</div>
                  <div className={`text-[11px] mt-0.5 ${importMode === 'merge' ? 'text-white/80' : 'text-[#52524E]'}`}>
                    기존 프로젝트를 유지하면서 새 항목을 추가합니다.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-3.5 rounded-none border text-left transition-colors cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                      : 'bg-[#F6F5F1] text-[#111111] border-[#E4E2DC]'
                  }`}
                >
                  <div className="text-xs font-bold">전체 덮어쓰기 (Replace All)</div>
                  <div className={`text-[11px] mt-0.5 ${importMode === 'replace' ? 'text-white/80' : 'text-[#52524E]'}`}>
                    기존 데이터를 모두 교체합니다.
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isProcessingImport}
                  className="px-6 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isProcessingImport ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
                  <span>복원 실행하기</span>
                </button>
              </div>
            </div>
          )}

          {importError && (
            <div className="p-3.5 bg-[#FEF2F2] text-[#DC2626] text-xs font-bold flex items-center gap-2 border border-[#DC2626]">
              <AlertTriangle size={15} />
              <span>{importError}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="p-3.5 bg-[#F3F7F4] text-[#1F5132] text-xs font-bold flex items-center gap-2 border border-[#1F5132]">
              <CheckCircle2 size={15} />
              <span>{importSuccessMsg}</span>
            </div>
          )}
        </EditorialSection>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6">
          <EditorialSection chapter="로컬 저장소 진단">
            <EditorialTable
              headers={['진단 지표', '현재 값', '보관 위치']}
              rows={[
                ['로컬 저장소 사용량', stats.formattedSize, '브라우저 샌드박스 (IndexedDB / LocalStorage)'],
                ['저장된 프로젝트 수', `${stats.projectCount}건`, '활성 작업 데이터'],
                ['자동 저장 복구 상태', `${stats.autosaveCount}건`, '실시간 드래프트 스냅샷'],
              ]}
            />
          </EditorialSection>

          <EditorialSection chapter="로컬 데이터 전체 초기화">
            <div className="p-6 border border-[#DC2626] bg-[#FEF2F2] space-y-3">
              <div className="flex items-center gap-2 text-[#DC2626] text-xs font-extrabold uppercase tracking-wider">
                <AlertTriangle size={16} />
                <span>로컬 데이터 영구 초기화 주의</span>
              </div>
              <p className="text-xs text-[#7F1D1D] leading-relaxed">
                브라우저에 저장된 모든 로컬 프로젝트와 캐시가 즉시 삭제됩니다. 실행 전 반드시 상단에서 JSON 백업 파일을 다운로드해 두시기 바랍니다.
              </p>
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <input
                  type="text"
                  placeholder='확인하려면 "RESET" 입력'
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  className="px-3.5 py-2 bg-[#FFFFFF] border border-[#DC2626]/40 rounded-none text-xs text-[#111111] outline-none focus:border-[#DC2626]"
                />
                <button
                  type="button"
                  onClick={handleClearStorage}
                  disabled={resetConfirmInput !== 'RESET'}
                  className="px-5 py-2 bg-[#DC2626] hover:bg-[#000000] hover:text-[#FFE600] disabled:opacity-40 text-[#FFFFFF] rounded-none text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>데이터 모두 초기화</span>
                </button>
              </div>
              {resetSuccess && (
                <div className="text-xs font-bold text-[#1F5132] flex items-center gap-1.5 pt-1">
                  <CheckCircle2 size={14} />
                  <span>초기화되었습니다. 스튜디오를 다시 불러옵니다...</span>
                </div>
              )}
            </div>
          </EditorialSection>
        </div>
      )}
    </EditorialPageLayout>
  );
}
