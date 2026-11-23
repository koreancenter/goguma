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
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { pick } = useLanguage();

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
      setActionError(
        `${pick({
          ko: '백업 내보내기에 실패했습니다: ',
          en: 'Failed to export backup: ',
          ja: 'バックアップのエクスポートに失敗しました: ',
          id: 'Gagal mengekspor cadangan: ',
        })}${err.message}`
      );
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
      setActionError(
        `${pick({
          ko: 'ZIP 번들 생성에 실패했습니다: ',
          en: 'Failed to generate ZIP bundle: ',
          ja: 'ZIPバンドルの生成に失敗しました: ',
          id: 'Gagal membuat bundel ZIP: ',
        })}${err.message}`
      );
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
        throw new Error(
          pick({
            ko: '유효한 기획서 백업 또는 프로젝트 JSON 규격이 아닙니다.',
            en: 'Not a valid GOGUMA backup or project JSON schema.',
            ja: '有効な企画書バックアップまたはプロジェクトJSON形式ではありません。',
            id: 'Bukan format cadangan GOGUMA atau JSON proyek yang valid.',
          })
        );
      }
    } catch (err: any) {
      setImportError(
        err.message ||
          pick({
            ko: 'JSON 파싱에 실패했습니다.',
            en: 'Failed to parse JSON.',
            ja: 'JSONの解析に失敗しました。',
            id: 'Gagal mengurai JSON.',
          })
      );
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
      setImportError(
        pick({
          ko: '붙여넣을 JSON 텍스트를 입력해 주세요.',
          en: 'Please paste JSON text first.',
          ja: '貼り付けるJSONテキストを入力してください。',
          id: 'Silakan tempel teks JSON terlebih dahulu.',
        })
      );
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
      setImportSuccessMsg(
        pick({
          ko: `복원 완료: ${res.projectCount}개 프로젝트가 성공적으로 로드되었습니다.`,
          en: `Restore complete: ${res.projectCount} project(s) loaded successfully.`,
          ja: `復元完了：${res.projectCount}件のプロジェクトが正常に読み込まれました。`,
          id: `Pemulihan selesai: ${res.projectCount} proyek berhasil dimuat.`,
        })
      );
      setParsedBackup(null);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setImportError(
        err.message ||
          pick({
            ko: '복원 작업 중 오류가 발생했습니다.',
            en: 'An error occurred during restore.',
            ja: '復元処理中にエラーが発生しました。',
            id: 'Terjadi kesalahan saat pemulihan.',
          })
      );
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleClearStorage = () => {
    if (resetConfirmInput !== 'RESET') {
      setActionError(
        pick({
          ko: '정확히 "RESET"을 입력해 주세요.',
          en: 'Please type "RESET" exactly to confirm.',
          ja: '確認のため正確に "RESET" と入力してください。',
          id: 'Ketik "RESET" dengan tepat untuk konfirmasi.',
        })
      );
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
    {
      id: 'export',
      label: pick({ ko: '데이터 백업 내보내기', en: 'Export Backup', ja: 'バックアップ書出', id: 'Ekspor Cadangan' }),
      onClick: () => selectTab('export'),
    },
    {
      id: 'import',
      label: pick({ ko: '백업 파일 복원', en: 'Restore Backup', ja: 'バックアップ復元', id: 'Pulihkan Cadangan' }),
      onClick: () => selectTab('import'),
    },
    {
      id: 'storage',
      label: pick({ ko: '저장소 진단 & 정리', en: 'Storage Diagnostics', ja: 'ストレージ診断・整理', id: 'Diagnostik & Reset' }),
      onClick: () => selectTab('storage'),
    },
  ];

  return (
    <EditorialPageLayout
      category="LOCAL STORAGE & BACKUP HUB"
      title={pick({
        ko: '보관함 및 로컬 백업',
        en: 'Vault & Local Backup',
        ja: '保管庫・ローカルバックアップ',
        id: 'Brankas & Cadangan Lokal',
      })}
      subtitle={pick({
        ko: '브라우저 로컬 저장소(IndexedDB / LocalStorage)에 보관된 모든 프로젝트 데이터를 백업, 복원 및 관리합니다.',
        en: 'Back up, restore, and inspect all project data stored inside browser local storage (IndexedDB / LocalStorage).',
        ja: 'ブラウザのローカルストレージ（IndexedDB / LocalStorage）に保存された全プロジェクトデータをバックアップ・復元・管理します。',
        id: 'Cadangkan, pulihkan, dan kelola semua data proyek yang tersimpan di penyimpanan lokal browser (IndexedDB / LocalStorage).',
      })}
      tabs={tabs}
      activeTabId={activeTab}
    >
      {actionError && (
        <div className="p-5 bg-[var(--theme-danger-bg)] text-[var(--theme-danger)] rounded-none text-[17px] font-bold flex items-center gap-2.5 border border-[var(--theme-danger)]">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-12">
          <EditorialSection
            chapter={pick({
              ko: '1. 전체 워크스페이스 통합 백업',
              en: '1. Full Workspace Unified Backup',
              ja: '1. 全ワークスペース統合バックアップ',
              id: '1. Cadangan Terpadu Seluruh Ruang Kerja',
            })}
          >
            <div className="p-8 border border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-[21px] font-extrabold text-[var(--theme-ink-strong)]">
                  <FolderArchive size={20} />
                  <span>
                    {pick({
                      ko: '전체 워크스페이스 통합 백업 (.json)',
                      en: 'Full Workspace Archive (.json)',
                      ja: '全ワークスペース統合バックアップ (.json)',
                      id: 'Arsip Penuh Ruang Kerja (.json)',
                    })}
                  </span>
                </div>
                <p className="text-[18px] text-[var(--theme-ink-body)] max-w-2xl leading-[1.75]">
                  {pick({
                    ko: `저장된 모든 프로젝트(${stats.projectCount}개), 자동 저장 스냅샷, 인공지능 엔진 설정값을 단일 JSON 파일로 내려받습니다.`,
                    en: `Download all saved projects (${stats.projectCount}), autosave snapshots, and AI engine settings in a single JSON file.`,
                    ja: `保存された全プロジェクト（${stats.projectCount}件）、自動保存スナップショット、AIエンジン設定を単一のJSONファイルとしてダウンロードします。`,
                    id: `Unduh seluruh proyek tersimpan (${stats.projectCount}), snapshot otomatis, dan pengaturan mesin AI dalam satu berkas JSON.`,
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadFullBackup}
                className="px-6 py-4 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[18px] font-bold flex items-center gap-2 transition-colors shrink-0 cursor-pointer"
              >
                <Download size={17} />
                <span>
                  {pick({
                    ko: '전체 백업 다운로드',
                    en: 'Download Full Backup',
                    ja: '全体バックアップをダウンロード',
                    id: 'Unduh Cadangan Penuh',
                  })}
                </span>
              </button>
            </div>

            {exportSuccess && (
              <div className="p-5 bg-[var(--theme-success-bg)] text-[var(--theme-success)] text-[17px] font-bold flex items-center gap-2.5 border border-[var(--theme-success)]">
                <CheckCircle2 size={18} />
                <span>
                  {pick({
                    ko: '백업 파일이 성공적으로 생성·다운로드되었습니다.',
                    en: 'Backup archive generated and downloaded successfully.',
                    ja: 'バックアップファイルが正常に生成・ダウンロードされました。',
                    id: 'Berkas cadangan berhasil dibuat dan diunduh.',
                  })}
                </span>
              </div>
            )}
          </EditorialSection>

          <EditorialSection
            chapter={pick({
              ko: '2. 현재 활성 프로젝트 단독 내보내기',
              en: '2. Export Active Project Only',
              ja: '2. 現在のアクティブプロジェクト単体書出',
              id: '2. Ekspor Proyek Aktif Saat Ini',
            })}
          >
            <div className="p-8 border border-[var(--theme-border-hairline)] bg-[var(--theme-elevated)] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-[21px] font-extrabold text-[var(--theme-ink-strong)]">
                  <FileJson size={20} />
                  <span>
                    {pick({
                      ko: '현재 열린 기획서 내보내기',
                      en: 'Export Currently Open Specification',
                      ja: '現在開いている企画書を書き出す',
                      id: 'Ekspor Spesifikasi Terbuka Saat Ini',
                    })}
                  </span>
                </div>
                <span className="px-3.5 py-1.5 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[16px] font-bold">
                  {currentPlan?.metadata?.projectName || 'Untitled'}
                </span>
              </div>

              <p className="text-[18px] text-[var(--theme-ink-secondary)] leading-[1.75]">
                {pick({
                  ko: '현재 작성 중인 기획서의 아키텍처, 섹션 원고 및 사양서 번들을 개별 파일로 저장하거나 복사합니다.',
                  en: 'Save or copy the architecture, section drafts, and 11-document specification bundle of the active project.',
                  ja: '作成中の企画書のアーキテクチャ、セクション原稿、および仕様書バンドルを個別ファイルとして保存・コピーします。',
                  id: 'Simpan atau salin arsitektur, draf bagian, dan bundel spesifikasi 11 dokumen dari proyek yang sedang aktif.',
                })}
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={handleDownloadCurrentPlan}
                  className="px-5 py-3 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={16} />
                  <span>
                    {pick({
                      ko: '프로젝트 JSON 저장',
                      en: 'Save Project JSON',
                      ja: 'プロジェクトJSON保存',
                      id: 'Simpan JSON Proyek',
                    })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadZipBundle}
                  disabled={isDownloadingZip}
                  className="px-5 py-3 bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] rounded-none text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FolderArchive size={16} />
                  <span>
                    {zipSuccess
                      ? pick({ ko: 'ZIP 다운로드 완료!', en: 'ZIP Downloaded!', ja: 'ZIPダウンロード完了!', id: 'ZIP Terunduh!' })
                      : pick({ ko: '11종 ZIP 사양서 번들', en: '11-Doc ZIP Bundle', ja: '11種ZIP仕様書バンドル', id: 'Bundel ZIP 11 Dokumen' })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyPlanJson}
                  className="px-5 py-3 bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] border border-[var(--theme-ink-strong)] text-[var(--theme-ink-strong)] rounded-none text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedPlan ? <Check size={16} /> : <Copy size={16} />}
                  <span>
                    {copiedPlan
                      ? pick({ ko: 'JSON 복사됨', en: 'JSON Copied', ja: 'JSONコピー済み', id: 'JSON Disalin' })
                      : pick({ ko: 'JSON 복사', en: 'Copy JSON', ja: 'JSONコピー', id: 'Salin JSON' })}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-6 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] flex items-start gap-3 text-[17px] text-[var(--theme-ink-body)] leading-[1.75]">
              <ShieldCheck size={19} className="text-[var(--theme-ink-strong)] shrink-0 mt-1" />
              <span>
                {pick({
                  ko: '모든 기획 데이터와 API 키는 외부 중앙 서버로 전송되지 않으며, 내보낸 백업 파일은 안전하게 로컬 드라이브에 보관하실 수 있습니다.',
                  en: 'All specification data and API keys never leave your device to a central server; exported backups remain strictly in your control.',
                  ja: 'すべての企画データとAPIキーは外部中央サーバーへ送信されず、書き出したバックアップファイルはローカルドライブに安全に保管できます。',
                  id: 'Semua data spesifikasi dan kunci API tidak pernah dikirim ke server pusat; berkas cadangan tetap aman di penyimpanan lokal Anda.',
                })}
              </span>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'import' && (
        <EditorialSection
          chapter={pick({
            ko: '백업 파일 불러오기 및 복원',
            en: 'Import & Restore Backup File',
            ja: 'バックアップファイルの読込・復元',
            id: 'Impor & Pulihkan Berkas Cadangan',
          })}
        >
          <div className="flex items-center gap-3 border-b border-[var(--theme-border-hairline)] pb-4 text-[17px]">
            <button
              type="button"
              onClick={() => setImportInputType('file')}
              className={`px-5 py-3 rounded-none font-bold transition-colors cursor-pointer ${
                importInputType === 'file'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-body)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`}
            >
              {pick({ ko: '파일 업로드 (.json)', en: 'Upload File (.json)', ja: 'ファイルアップロード (.json)', id: 'Unggah Berkas (.json)' })}
            </button>
            <button
              type="button"
              onClick={() => setImportInputType('text')}
              className={`px-5 py-3 rounded-none font-bold transition-colors cursor-pointer ${
                importInputType === 'text'
                  ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                  : 'bg-[var(--theme-stage)] text-[var(--theme-ink-body)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
              }`}
            >
              {pick({ ko: 'JSON 직접 붙여넣기', en: 'Paste Raw JSON', ja: 'JSONを直接貼り付け', id: 'Tempel JSON Langsung' })}
            </button>
          </div>

          {importInputType === 'file' ? (
            <div className="border-2 border-dashed border-[var(--theme-border-strong)] hover:border-[var(--theme-ink-strong)] transition-colors rounded-none p-12 sm:p-16 text-center bg-[var(--theme-stage)]">
              <Upload size={34} className="mx-auto text-[var(--theme-ink-strong)] mb-4" />
              <p className="text-[21px] font-bold text-[var(--theme-ink-strong)] mb-2">
                {pick({
                  ko: '백업 JSON 파일을 선택하세요',
                  en: 'Select a Backup JSON File',
                  ja: 'バックアップJSONファイルを選択してください',
                  id: 'Pilih Berkas JSON Cadangan',
                })}
              </p>
              <p className="text-[17px] text-[var(--theme-ink-secondary)] mb-6">
                {pick({
                  ko: '*.json (Full Backup 또는 Single Plan JSON)',
                  en: '*.json (Full Workspace Backup or Single Plan JSON)',
                  ja: '*.json（フルバックアップまたは単一プランJSON）',
                  id: '*.json (Cadangan Penuh atau JSON Rencana Tunggal)',
                })}
              </p>

              <label className="inline-flex items-center gap-2.5 px-7 py-4 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[18px] font-bold cursor-pointer transition-colors">
                <FileJson size={18} />
                <span>{pick({ ko: 'JSON 파일 찾아보기', en: 'Browse JSON File', ja: 'JSONファイルを参照', id: 'Pilih Berkas JSON' })}</span>
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
            <div className="p-7 border border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] space-y-4">
              <textarea
                value={pastedJsonText}
                onChange={(e) => setPastedJsonText(e.target.value)}
                placeholder='{ "metadata": { ... }, "collections": { ... } }'
                rows={7}
                className="w-full p-5 font-mono text-[17px] bg-[var(--theme-canvas)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)] rounded-none outline-none"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="px-6 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[17px] font-bold transition-colors cursor-pointer"
              >
                {pick({
                  ko: '붙여넣은 JSON 검증 및 해석',
                  en: 'Validate & Parse Pasted JSON',
                  ja: '貼り付けたJSONを検証・解析',
                  id: 'Validasi & Urai JSON',
                })}
              </button>
            </div>
          )}

          {parsedBackup && (
            <div className="p-8 border-2 border-[var(--theme-ink-strong)] bg-[var(--theme-elevated)] space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[18px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>
                    {pick({
                      ko: '백업 파일 검증 완료',
                      en: 'Backup File Verified',
                      ja: 'バックアップファイルの検証完了',
                      id: 'Berkas Cadangan Terverifikasi',
                    })}
                  </span>
                </span>
                <span className="px-3.5 py-1 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[15px] font-bold">
                  Version: {parsedBackup.version || '2.0'}
                </span>
              </div>

              <EditorialTable
                headers={[
                  pick({ ko: '프로젝트 수', en: 'Projects', ja: 'プロジェクト数', id: 'Jumlah Proyek' }),
                  pick({ ko: '내보낸 일시', en: 'Exported At', ja: 'エクスポート日時', id: 'Waktu Ekspor' }),
                  pick({ ko: 'AI 설정 포함 여부', en: 'AI Settings Included', ja: 'AI設定の同梱', id: 'Pengaturan AI' }),
                ]}
                rows={[
                  [
                    `${Object.keys(parsedBackup.collections?.projects || {}).length}`,
                    parsedBackup.exportedAt ? new Date(parsedBackup.exportedAt).toLocaleDateString() : 'N/A',
                    parsedBackup.aiSettings
                      ? pick({ ko: '포함됨', en: 'Included', ja: '同梱あり', id: 'Termasuk' })
                      : pick({ ko: '없음', en: 'None', ja: 'なし', id: 'Tidak Ada' }),
                  ],
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`p-5 rounded-none border text-left transition-colors cursor-pointer ${
                    importMode === 'merge'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-active-bg)]'
                      : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)]'
                  }`}
                >
                  <div className="text-[18px] font-bold">
                    {pick({ ko: '안전 병합 (Merge)', en: 'Safe Merge', ja: '安全マージ (Merge)', id: 'Gabung Aman (Merge)' })}
                  </div>
                  <div className={`text-[16px] mt-1 ${importMode === 'merge' ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {pick({
                      ko: '기존 프로젝트를 유지하면서 새 항목을 추가합니다.',
                      en: 'Preserve existing projects and add new entries.',
                      ja: '既存プロジェクトを維持しつつ新規項目を追加します。',
                      id: 'Pertahankan proyek yang ada dan tambahkan entri baru.',
                    })}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`p-5 rounded-none border text-left transition-colors cursor-pointer ${
                    importMode === 'replace'
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-active-bg)]'
                      : 'bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] border-[var(--theme-border-hairline)]'
                  }`}
                >
                  <div className="text-[18px] font-bold">
                    {pick({ ko: '전체 덮어쓰기 (Replace All)', en: 'Replace All', ja: 'すべて上書き (Replace All)', id: 'Ganti Semua (Replace All)' })}
                  </div>
                  <div className={`text-[16px] mt-1 ${importMode === 'replace' ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {pick({
                      ko: '기존 데이터를 모두 교체합니다.',
                      en: 'Overwrite all existing local workspace data.',
                      ja: '既存のローカルデータをすべて置き換えます。',
                      id: 'Timpa seluruh data ruang kerja lokal yang ada.',
                    })}
                  </div>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isProcessingImport}
                  className="px-7 py-4 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[18px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {isProcessingImport ? <RefreshCw size={17} className="animate-spin" /> : <Upload size={17} />}
                  <span>{pick({ ko: '복원 실행하기', en: 'Execute Restore', ja: '復元を実行する', id: 'Jalankan Pemulihan' })}</span>
                </button>
              </div>
            </div>
          )}

          {importError && (
            <div className="p-5 bg-[var(--theme-danger-bg)] text-[var(--theme-danger)] text-[17px] font-bold flex items-center gap-2.5 border border-[var(--theme-danger)]">
              <AlertTriangle size={18} />
              <span>{importError}</span>
            </div>
          )}

          {importSuccessMsg && (
            <div className="p-5 bg-[var(--theme-success-bg)] text-[var(--theme-success)] text-[17px] font-bold flex items-center gap-2.5 border border-[var(--theme-success)]">
              <CheckCircle2 size={18} />
              <span>{importSuccessMsg}</span>
            </div>
          )}
        </EditorialSection>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-12">
          <EditorialSection
            chapter={pick({
              ko: '로컬 저장소 진단',
              en: 'Local Storage Diagnostics',
              ja: 'ローカルストレージ診断',
              id: 'Diagnostik Penyimpanan Lokal',
            })}
          >
            <EditorialTable
              headers={[
                pick({ ko: '진단 지표', en: 'Metric', ja: '診断項目', id: 'Metrik' }),
                pick({ ko: '현재 값', en: 'Current Value', ja: '現在値', id: 'Nilai Saat Ini' }),
                pick({ ko: '보관 위치', en: 'Location', ja: '保管場所', id: 'Lokasi' }),
              ]}
              rows={[
                [
                  pick({ ko: '로컬 저장소 사용량', en: 'Local Storage Usage', ja: 'ローカル容量使用量', id: 'Penggunaan Penyimpanan' }),
                  stats.formattedSize,
                  pick({
                    ko: '브라우저 샌드박스 (IndexedDB / LocalStorage)',
                    en: 'Browser Sandbox (IndexedDB / LocalStorage)',
                    ja: 'ブラウザサンドボックス (IndexedDB / LocalStorage)',
                    id: 'Sandbox Browser (IndexedDB / LocalStorage)',
                  }),
                ],
                [
                  pick({ ko: '저장된 프로젝트 수', en: 'Saved Projects', ja: '保存済みプロジェクト数', id: 'Proyek Tersimpan' }),
                  `${stats.projectCount}`,
                  pick({ ko: '활성 작업 데이터', en: 'Active Workspace Data', ja: 'アクティブ作業データ', id: 'Data Ruang Kerja Aktif' }),
                ],
                [
                  pick({ ko: '자동 저장 복구 상태', en: 'Autosave Recovery', ja: '自動保存スナップショット', id: 'Status Pemulihan Otomatis' }),
                  `${stats.autosaveCount}`,
                  pick({ ko: '실시간 드래프트 스냅샷', en: 'Real-time Draft Snapshots', ja: 'リアルタイム下書き', id: 'Snapshot Draf Real-time' }),
                ],
              ]}
            />
          </EditorialSection>

          <EditorialSection
            chapter={pick({
              ko: '로컬 데이터 전체 초기화',
              en: 'Reset All Local Data',
              ja: 'ローカルデータの完全初期化',
              id: 'Reset Seluruh Data Lokal',
            })}
          >
            <div className="p-8 border border-[var(--theme-danger)] bg-[var(--theme-danger-bg)] space-y-5">
              <div className="flex items-center gap-2.5 text-[var(--theme-danger)] text-[18px] font-extrabold uppercase tracking-wider">
                <AlertTriangle size={20} />
                <span>
                  {pick({
                    ko: '로컬 데이터 영구 초기화 주의',
                    en: 'Warning: Permanent Local Data Wipe',
                    ja: '警告：ローカルデータの永久初期化',
                    id: 'Peringatan: Penghapusan Data Lokal Permanen',
                  })}
                </span>
              </div>
              <p className="text-[18px] text-[var(--theme-danger)] leading-[1.75]">
                {pick({
                  ko: '브라우저에 저장된 모든 로컬 프로젝트와 캐시가 즉시 삭제됩니다. 실행 전 반드시 상단에서 JSON 백업 파일을 다운로드해 두시기 바랍니다.',
                  en: 'All locally saved projects and caches in this browser will be erased immediately. Please download a JSON backup above before proceeding.',
                  ja: 'ブラウザに保存されたすべてのローカルプロジェクトとキャッシュが即座に削除されます。実行前に必ず上部からJSONバックアップをダウンロードしてください。',
                  id: 'Semua proyek lokal dan cache di browser ini akan langsung dihapus. Harap unduh cadangan JSON di atas sebelum melanjutkan.',
                })}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <input
                  type="text"
                  placeholder={pick({
                    ko: '확인하려면 "RESET" 입력',
                    en: 'Type "RESET" to confirm',
                    ja: '確認のため "RESET" と入力',
                    id: 'Ketik "RESET" untuk konfirmasi',
                  })}
                  value={resetConfirmInput}
                  onChange={(e) => setResetConfirmInput(e.target.value)}
                  className="px-4 py-3 bg-[var(--theme-canvas)] border border-[var(--theme-danger)]/50 rounded-none text-[18px] text-[var(--theme-ink-primary)] placeholder-[var(--theme-ink-muted)] outline-none focus:border-[var(--theme-danger)]"
                />
                <button
                  type="button"
                  onClick={handleClearStorage}
                  disabled={resetConfirmInput !== 'RESET'}
                  className="px-6 py-3 bg-[var(--theme-danger)] hover:bg-[var(--theme-btn-bg)] hover:text-[var(--theme-btn-text)] disabled:opacity-40 text-white rounded-none text-[18px] font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 size={17} />
                  <span>{pick({ ko: '데이터 모두 초기화', en: 'Wipe All Local Data', ja: '全データを初期化', id: 'Hapus Semua Data' })}</span>
                </button>
              </div>
              {resetSuccess && (
                <div className="text-[17px] font-bold text-[var(--theme-success)] flex items-center gap-2 pt-2">
                  <CheckCircle2 size={17} />
                  <span>
                    {pick({
                      ko: '초기화되었습니다. 스튜디오를 다시 불러옵니다...',
                      en: 'Storage cleared. Reloading studio...',
                      ja: '初期化されました。スタジオを再読み込みしています...',
                      id: 'Data direset. Memuat ulang studio...',
                    })}
                  </span>
                </div>
              )}
            </div>
          </EditorialSection>
        </div>
      )}
    </EditorialPageLayout>
  );
}
