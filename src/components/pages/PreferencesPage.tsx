import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Key, HardDrive, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff,
  Server, Shield, Cpu, Type, Globe, FolderOpen, LayoutTemplate, Download, LogOut,
  Palette, Check, Moon, Sun
} from 'lucide-react';
import { AISettings, getAISettings, saveAISettings } from '../../lib/aiConfig';
import { getStorageUsageStats, exportAllLocalData } from '../../lib/localDb';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { STUDIO_THEMES, getLocalizedThemeInfo } from '../../lib/themeConfig';
import { LocalUser } from '../../lib/localAuth';
import { Language } from '../../types';
import {
  EditorialPageLayout,
  EditorialSection,
  EditorialTable,
} from '../classic/layout/EditorialPageLayout';

export type PreferencesTab = 'engine' | 'display' | 'storage' | 'account';

interface PreferencesPageProps {
  largeTextMode?: boolean;
  onToggleLargeTextMode?: () => void;
  currentUser?: LocalUser | null;
}

export default function PreferencesPage({
  largeTextMode,
  onToggleLargeTextMode,
  currentUser,
}: PreferencesPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, setLanguage, pick } = useLanguage();
  const { themeId, setTheme } = useTheme();

  const paramTab = searchParams.get('tab') as PreferencesTab | null;
  const initialTab: PreferencesTab =
    paramTab && ['engine', 'display', 'storage', 'account'].includes(paramTab)
      ? paramTab
      : 'engine';

  const [activeTab, setActiveTab] = useState<PreferencesTab>(initialTab);
  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [fetchingOllama, setFetchingOllama] = useState(false);
  const [storageStats] = useState(getStorageUsageStats);
  const [exportNotice, setExportNotice] = useState(false);
  const [localLargeText, setLocalLargeText] = useState<boolean>(
    () => localStorage.getItem('goguma_large_text') === 'true'
  );

  useEffect(() => {
    if (paramTab && ['engine', 'display', 'storage', 'account'].includes(paramTab)) {
      setActiveTab(paramTab);
    } else {
      setActiveTab('engine');
    }
    setTestResult(null);
  }, [paramTab]);

  const handleSaveEngine = () => {
    saveAISettings(settings);
    setTestResult({
      success: true,
      message: pick({
        ko: '인공지능 인퍼런스 엔진 설정이 브라우저 로컬 저장소에 저장되었습니다.',
        en: 'AI inference engine settings saved to local browser storage.',
        ja: 'AI推論エンジン設定がローカルブラウザストレージに保存されました。',
        id: 'Pengaturan mesin inferensi AI disimpan ke penyimpanan lokal peramban.',
      }),
    });
  };

  const handleFetchOllamaModels = async () => {
    setFetchingOllama(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/ollama/tags?endpoint=${encodeURIComponent(settings.ollama.endpoint)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const models = (data.models || []).map((m: any) => m.name || m.model).filter(Boolean);
      setAvailableOllamaModels(models);
      if (models.length > 0) {
        if (!models.includes(settings.ollama.model)) {
          setSettings(prev => ({
            ...prev,
            ollama: { ...prev.ollama, model: models[0] },
          }));
        }
        setTestResult({
          success: true,
          message: pick({
            ko: `로컬 Ollama 연결 완료 (${models.length}개 모델 감지됨)`,
            en: `Local Ollama connected (${models.length} models detected)`,
            ja: `ローカルOllama接続完了（${models.length}個のモデルを検出）`,
            id: `Ollama lokal terhubung (${models.length} model terdeteksi)`,
          }),
        });
      } else {
        setTestResult({
          success: false,
          message: pick({
            ko: 'Ollama 서버는 실행 중이나 설치된 모델이 없습니다.',
            en: 'Ollama server is running, but no models are installed.',
            ja: 'Ollamaサーバーは起動中ですが、インストール済みのモデルがありません。',
            id: 'Server Ollama berjalan, tetapi belum ada model yang terpasang.',
          }),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err.message ||
          pick({
            ko: 'Ollama 엔드포인트에 연결할 수 없습니다. 로컬 서버 상태를 확인해 주세요.',
            en: 'Cannot reach Ollama endpoint. Please verify your local server is running.',
            ja: 'Ollamaエンドポイントに接続できません。ローカルサーバーの状態を確認してください。',
            id: 'Tidak dapat terhubung ke endpoint Ollama. Periksa status server lokal Anda.',
          }),
      });
    } finally {
      setFetchingOllama(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (settings.provider === 'gemini') {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: settings.gemini.model,
            contents: 'Respond with the word "OK".',
            apiKey: settings.gemini.apiKey?.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Connection error (${res.status})`);
        }
        const data = await res.json();
        setTestResult({
          success: true,
          message: pick({
            ko: `Gemini 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 30)}"`,
            en: `Gemini connected · Response: "${(data.text || '').trim().slice(0, 30)}"`,
            ja: `Gemini接続成功 · 応答: "${(data.text || '').trim().slice(0, 30)}"`,
            id: `Gemini terhubung · Respons: "${(data.text || '').trim().slice(0, 30)}"`,
          }),
        });
      } else if (settings.provider === 'webllm') {
        if ('gpu' in navigator) {
          setTestResult({
            success: true,
            message: pick({
              ko: `WebGPU 가속 활성화됨 · ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'} 모델이 기기 로컬에서 동작합니다.`,
              en: `WebGPU acceleration active · ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'} runs locally on your device.`,
              ja: `WebGPUアクセラレーション有効 · ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'}が端末内で動作します。`,
              id: `Akselerasi WebGPU aktif · Model ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'} berjalan secara lokal.`,
            }),
          });
        } else {
          setTestResult({
            success: false,
            message: pick({
              ko: '현재 브라우저에서 WebGPU를 사용할 수 없습니다. 최신 Chrome/Edge 또는 Gemini/Ollama를 선택하세요.',
              en: 'WebGPU is unavailable in this browser. Use recent Chrome/Edge or choose Gemini/Ollama.',
              ja: 'このブラウザではWebGPUが利用できません。最新のChrome/EdgeまたはGemini/Ollamaを選択してください。',
              id: 'WebGPU tidak tersedia di peramban ini. Gunakan Chrome/Edge terbaru atau pilih Gemini/Ollama.',
            }),
          });
        }
      } else {
        const res = await fetch('/api/ollama/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: settings.ollama.endpoint,
            model: settings.ollama.model,
            messages: [{ role: 'user', content: 'Say "Ollama ready" in 3 words.' }],
            stream: false,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        setTestResult({
          success: true,
          message: pick({
            ko: `Ollama 추론 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 40)}"`,
            en: `Ollama inference connected · Response: "${(data.text || '').trim().slice(0, 40)}"`,
            ja: `Ollama推論接続成功 · 応答: "${(data.text || '').trim().slice(0, 40)}"`,
            id: `Inferensi Ollama terhubung · Respons: "${(data.text || '').trim().slice(0, 40)}"`,
          }),
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message:
          err.message ||
          pick({
            ko: '연결 테스트에 실패했습니다. 설정값을 확인해 주세요.',
            en: 'Connection test failed. Please check your configuration.',
            ja: '接続テストに失敗しました。設定値をご確認ください。',
            id: 'Uji koneksi gagal. Silakan periksa pengaturan Anda.',
          }),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleToggleLargeText = () => {
    if (onToggleLargeTextMode) {
      onToggleLargeTextMode();
      setLocalLargeText(prev => !prev);
    } else {
      const next = !localLargeText;
      setLocalLargeText(next);
      localStorage.setItem('goguma_large_text', String(next));
    }
  };

  const handleQuickExportBackup = () => {
    exportAllLocalData();
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const isLarge = largeTextMode ?? localLargeText;

  const sectionMeta: Record<PreferencesTab, { category: string; title: string; subtitle: string }> = {
    engine: {
      category: 'STUDIO PREFERENCES · AI ENGINE',
      title: pick({ ko: '인공지능 엔진 설정', en: 'AI Engine Settings', ja: 'AIエンジン設定', id: 'Pengaturan Mesin AI' }),
      subtitle: pick({
        ko: '인공지능 인퍼런스 엔진(Gemini BYOK / Ollama 로컬 서버 / 브라우저 WebLLM) 연결 및 추론 모델을 구성합니다.',
        en: 'Configure AI inference engines (Gemini BYOK / Ollama local server / in-browser WebLLM) and model routing.',
        ja: 'AI推論エンジン（Gemini BYOK / Ollamaローカルサーバー / ブラウザWebLLM）の接続と推論モデルを設定します。',
        id: 'Konfigurasikan koneksi mesin inferensi AI (Gemini BYOK / server lokal Ollama / WebLLM peramban) dan pilihan model.',
      }),
    },
    display: {
      category: 'STUDIO PREFERENCES · DISPLAY & THEME',
      title: pick({ ko: '화면 · 테마 · 가독성', en: 'Display · Theme · Language', ja: '画面・テーマ・言語', id: 'Tampilan · Tema · Bahasa' }),
      subtitle: pick({
        ko: '한국의 사계절 스튜디오 테마와 컬러셋, 큰 글씨 가독성 모드, 인터페이스 언어를 설정합니다.',
        en: 'Customize Korean seasonal studio themes, color palettes, large-text readability mode, and interface language.',
        ja: '韓国の四季スタジオテーマとカラーセット、大きな文字・可読性モード、インターフェース言語を設定します。',
        id: 'Atur tema musiman studio, palet warna, mode teks besar, dan bahasa antarmuka studio.',
      }),
    },
    storage: {
      category: 'STUDIO PREFERENCES · STORAGE',
      title: pick({ ko: '보관함 및 로컬 백업', en: 'Library & Local Backup', ja: '保管庫・ローカルBackup', id: 'Pustaka & Cadangan Lokal' }),
      subtitle: pick({
        ko: '브라우저 로컬 저장소 현황을 확인하고 템플릿 및 백업 허브로 이동합니다.',
        en: 'Inspect browser local storage usage and access standard templates or the local backup hub.',
        ja: 'ブラウザのローカルストレージ状況を確認し、テンプレートやバックアップハブへ移動します。',
        id: 'Periksa penggunaan penyimpanan lokal browser dan akses templat standar atau pusat cadangan lokal.',
      }),
    },
    account: {
      category: 'STUDIO PREFERENCES · ACCOUNT',
      title: pick({ ko: '내 계정 및 프로필', en: 'Account & Profile', ja: 'アカウント・プロフィール', id: 'Akun & Profil' }),
      subtitle: pick({
        ko: '현재 활성화된 로컬 작업자 세션과 프로필 정보를 확인하고 관리합니다.',
        en: 'Inspect and manage your active local worker session and profile identity.',
        ja: '現在アクティブなローカル作業者セッションとプロフィール情報を確認・管理します。',
        id: 'Periksa dan kelola sesi pekerja lokal yang aktif serta identitas profil Anda.',
      }),
    },
  };

  const activeMeta = sectionMeta[activeTab];

  return (
    <EditorialPageLayout
      category={activeMeta.category}
      title={activeMeta.title}
      subtitle={activeMeta.subtitle}
    >
      {activeTab === 'engine' && (
        <div className="space-y-12">
          <EditorialSection chapter={pick({ ko: '1. 추론 엔진 계층 선택', en: '1. Inference Engine Layer', ja: '1. 推論エンジン層の選択', id: '1. Lapisan Mesin Inferensi' })}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'gemini' }))}
                className={`p-7 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-5 ${
                  settings.provider === 'gemini'
                    ? 'border-[var(--theme-ink-strong)] bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                    : 'border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Cpu size={20} />
                  <span className="text-[14px] px-2.5 py-0.5 border border-current uppercase font-bold tracking-wider">
                    {pick({ ko: '클라우드', en: 'Cloud', ja: 'クラウド', id: 'Cloud' })}
                  </span>
                </div>
                <div>
                  <div className="text-[22px] font-extrabold">Gemini 3.8</div>
                  <div className={`text-[17px] mt-1.5 ${settings.provider === 'gemini' ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {pick({ ko: '서버 프록시 / 개인 키(BYOK)', en: 'Server Proxy / Personal Key (BYOK)', ja: 'サーバープロキシ / BYOK', id: 'Proksi Server / Kunci Pribadi (BYOK)' })}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'ollama' }))}
                className={`p-7 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-5 ${
                  settings.provider === 'ollama'
                    ? 'border-[var(--theme-ink-strong)] bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                    : 'border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <HardDrive size={20} />
                  <span className="text-[14px] px-2.5 py-0.5 border border-current uppercase font-bold tracking-wider">
                    {pick({ ko: '로컬 서버', en: 'Local Server', ja: 'ローカルサーバー', id: 'Server Lokal' })}
                  </span>
                </div>
                <div>
                  <div className="text-[22px] font-extrabold">{pick({ ko: 'Ollama 로컬', en: 'Ollama Local', ja: 'Ollama ローカル', id: 'Ollama Lokal' })}</div>
                  <div className={`text-[17px] mt-1.5 ${settings.provider === 'ollama' ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {pick({ ko: '오프라인 기기 직접 추론', en: 'Offline On-Device Inference', ja: 'オフライン端末推論', id: 'Inferensi Langsung Offline' })}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'webllm' }))}
                className={`p-7 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-5 ${
                  settings.provider === 'webllm'
                    ? 'border-[var(--theme-ink-strong)] bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                    : 'border-[var(--theme-border-hairline)] bg-[var(--theme-stage)] text-[var(--theme-ink-primary)] hover:border-[var(--theme-ink-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Server size={20} />
                  <span className="text-[14px] px-2.5 py-0.5 border border-current uppercase font-bold tracking-wider">
                    {pick({ ko: '브라우저 내장', en: 'In-Browser', ja: 'ブラウザ内蔵', id: 'Dalam Peramban' })}
                  </span>
                </div>
                <div>
                  <div className="text-[22px] font-extrabold">WebLLM</div>
                  <div className={`text-[17px] mt-1.5 ${settings.provider === 'webllm' ? 'opacity-85' : 'text-[var(--theme-ink-secondary)]'}`}>
                    {pick({ ko: '무설치 WebGPU 가속', en: 'Zero-Install WebGPU Acceleration', ja: 'インストール不要WebGPU加速', id: 'Akselerasi WebGPU Tanpa Instalasi' })}
                  </div>
                </div>
              </button>
            </div>
          </EditorialSection>

          <EditorialSection chapter={pick({ ko: '2. 상세 연결 구성', en: '2. Connection Configuration', ja: '2. 接続設定', id: '2. Konfigurasi Koneksi' })}>
            {settings.provider === 'gemini' && (
              <div className="space-y-6 p-8 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[18px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
                    <Key size={18} />
                    <span>{pick({ ko: '개인 Gemini API 키 (선택 사항 · BYOK)', en: 'Personal Gemini API Key (Optional · BYOK)', ja: '個人Gemini APIキー（任意 · BYOK）', id: 'Kunci API Gemini Pribadi (Opsional · BYOK)' })}</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[17px] text-[var(--theme-ink-strong)] underline underline-offset-4 font-bold hover:text-[var(--theme-seal)]"
                  >
                    {pick({ ko: '키 발급 안내 ↗', en: 'Get API Key ↗', ja: 'APIキー取得案内 ↗', id: 'Panduan Kunci API ↗' })}
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder={pick({ ko: '비워두면 기본 서버 프록시를 사용합니다 (AIzaSy...)', en: 'Leave empty to use default server proxy (AIzaSy...)', ja: '空欄時はデフォルトのサーバープロキシを使用 (AIzaSy...)', id: 'Kosongkan untuk memakai proksi server bawaan (AIzaSy...)' })}
                    value={settings.gemini.apiKey}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, gemini: { ...s.gemini, apiKey: e.target.value } }))
                    }
                    className="w-full pl-4 pr-12 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--theme-ink-secondary)] hover:text-[var(--theme-ink-strong)] cursor-pointer"
                  >
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div>
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)] mb-2">
                    {pick({ ko: '모델 선택', en: 'Model Selection', ja: 'モデル選択', id: 'Pilihan Model' })}
                  </label>
                  <select
                    value={settings.gemini.model}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, gemini: { ...s.gemini, model: e.target.value } }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none cursor-pointer"
                  >
                    <option value="gemini-3.8-flash">{pick({ ko: 'gemini-3.8-flash (권장 · 균형형)', en: 'gemini-3.8-flash (Recommended · Balanced)', ja: 'gemini-3.8-flash（推奨・バランス型）', id: 'gemini-3.8-flash (Disarankan · Seimbang)' })}</option>
                    <option value="gemini-2.5-flash">{pick({ ko: 'gemini-2.5-flash (고속 응답)', en: 'gemini-2.5-flash (Fast Response)', ja: 'gemini-2.5-flash（高速応答）', id: 'gemini-2.5-flash (Respons Cepat)' })}</option>
                    <option value="gemini-2.5-pro">{pick({ ko: 'gemini-2.5-pro (심층 아키텍처 추론)', en: 'gemini-2.5-pro (Deep Architecture Reasoning)', ja: 'gemini-2.5-pro（詳細アーキテクチャ推論）', id: 'gemini-2.5-pro (Penalaran Arsitektur Mendalam)' })}</option>
                  </select>
                </div>
              </div>
            )}

            {settings.provider === 'ollama' && (
              <div className="space-y-6 p-8 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[18px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
                    <Server size={18} />
                    <span>{pick({ ko: 'Ollama 로컬 서버 주소', en: 'Ollama Local Server Endpoint', ja: 'Ollamaローカルサーバーアドレス', id: 'Alamat Server Lokal Ollama' })}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchOllamaModels}
                    disabled={fetchingOllama}
                    className="inline-flex items-center gap-2 text-[17px] text-[var(--theme-ink-strong)] underline underline-offset-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={fetchingOllama ? 'animate-spin' : ''} />
                    <span>{pick({ ko: '설치된 모델 스캔', en: 'Scan Installed Models', ja: 'インストール済みモデルをスキャン', id: 'Pindai Model Terpasang' })}</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={settings.ollama.endpoint}
                  onChange={(e) =>
                    setSettings(s => ({ ...s, ollama: { ...s.ollama, endpoint: e.target.value } }))
                  }
                  className="w-full px-4 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none"
                />

                <div>
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)] mb-2">
                    {pick({ ko: 'Ollama 모델명', en: 'Ollama Model Name', ja: 'Ollamaモデル名', id: 'Nama Model Ollama' })}
                  </label>
                  {availableOllamaModels.length > 0 ? (
                    <select
                      value={settings.ollama.model}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, ollama: { ...s.ollama, model: e.target.value } }))
                      }
                      className="w-full px-4 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none cursor-pointer"
                    >
                      {availableOllamaModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={pick({ ko: '예: llama3.2, qwen2.5:7b, mistral', en: 'e.g., llama3.2, qwen2.5:7b, mistral', ja: '例：llama3.2, qwen2.5:7b, mistral', id: 'cth: llama3.2, qwen2.5:7b, mistral' })}
                      value={settings.ollama.model}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, ollama: { ...s.ollama, model: e.target.value } }))
                      }
                      className="w-full px-4 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {settings.provider === 'webllm' && (
              <div className="space-y-6 p-8 rounded-none bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)]">
                <div className="flex items-center justify-between">
                  <span className="text-[18px] font-extrabold text-[var(--theme-ink-strong)] flex items-center gap-2">
                    <Shield size={18} />
                    <span>{pick({ ko: '브라우저 내장 WebGPU 로컬 모델', en: 'In-Browser WebGPU Local Model', ja: 'ブラウザ内蔵WebGPUローカルモデル', id: 'Model Lokal WebGPU Dalam Peramban' })}</span>
                  </span>
                  <span className="text-[15px] font-bold text-[var(--theme-ink-strong)] bg-[var(--theme-elevated)] px-3.5 py-1.5 border border-[var(--theme-border-hairline)]">
                    {pick({ ko: '완전 오프라인', en: '100% Offline', ja: '完全オフライン', id: 'Sepenuhnya Offline' })}
                  </span>
                </div>

                <div>
                  <label className="block text-[17px] font-extrabold text-[var(--theme-ink-strong)] mb-2">
                    {pick({ ko: '내장 추론 모델', en: 'Built-In Inference Model', ja: '内蔵推論モデル', id: 'Model Inferensi Bawaan' })}
                  </label>
                  <select
                    value={settings.webllm?.model || 'Qwen2.5-Coder-1.5B'}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, webllm: { ...s.webllm, model: e.target.value } }))
                    }
                    className="w-full px-4 py-3.5 bg-[var(--theme-elevated)] border border-[var(--theme-border-strong)] focus:border-[var(--theme-ink-strong)] rounded-none text-[18px] text-[var(--theme-ink-primary)] outline-none cursor-pointer"
                  >
                    <option value="Qwen2.5-Coder-1.5B">{pick({ ko: 'Qwen2.5-Coder-1.5B (코드 · 명세 최적화)', en: 'Qwen2.5-Coder-1.5B (Code & Spec Optimized)', ja: 'Qwen2.5-Coder-1.5B（コード・仕様最適化）', id: 'Qwen2.5-Coder-1.5B (Optimal Kode & Spesifikasi)' })}</option>
                    <option value="Llama-3.2-1B-Instruct">{pick({ ko: 'Llama-3.2-1B-Instruct (경량 범용)', en: 'Llama-3.2-1B-Instruct (Lightweight General)', ja: 'Llama-3.2-1B-Instruct（軽量汎用）', id: 'Llama-3.2-1B-Instruct (Umum Ringan)' })}</option>
                    <option value="SmolLM2-1.7B-Instruct">{pick({ ko: 'SmolLM2-1.7B-Instruct (초경량)', en: 'SmolLM2-1.7B-Instruct (Ultra-Light)', ja: 'SmolLM2-1.7B-Instruct（超軽量）', id: 'SmolLM2-1.7B-Instruct (Ultra Ringan)' })}</option>
                  </select>
                </div>
              </div>
            )}

            {testResult && (
              <div
                className={`p-5 rounded-none text-[17px] flex items-start gap-3 border ${
                  testResult.success
                    ? 'bg-[var(--theme-success-bg)] text-[var(--theme-success)] border-[var(--theme-success)]'
                    : 'bg-[var(--theme-danger-bg)] text-[var(--theme-danger)] border-[var(--theme-danger)]'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={18} className="shrink-0 mt-1" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 mt-1" />
                )}
                <span className="leading-[1.7] font-semibold">{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-6 py-3.5 bg-[var(--theme-canvas)] border border-[var(--theme-ink-strong)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] rounded-none text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={16} className={isTesting ? 'animate-spin' : ''} />
                <span>
                  {isTesting
                    ? pick({ ko: '연결 테스트 중...', en: 'Testing Connection...', ja: '接続テスト中...', id: 'Menguji Koneksi...' })
                    : pick({ ko: '연결 테스트 실행', en: 'Run Connection Test', ja: '接続テストを実行', id: 'Jalankan Uji Koneksi' })}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSaveEngine}
                className="px-7 py-3.5 bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] rounded-none text-[18px] font-bold transition-colors cursor-pointer"
              >
                {pick({ ko: '로컬 설정 저장하기', en: 'Save Local Settings', ja: 'ローカル設定を保存', id: 'Simpan Pengaturan Lokal' })}
              </button>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'display' && (
        <div className="space-y-14">
          <EditorialSection chapter={pick({ ko: '스튜디오 테마 및 컬러셋 (5종)', en: 'Studio Themes & Palettes (5 Presets)', ja: 'スタジオテーマ・カラーセット（5種）', id: 'Tema & Palet Studio (5 Pilihan)' })}>
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-[19px] font-bold text-[var(--theme-ink-primary)]">
                  <Palette size={20} />
                  <span>
                    {pick({
                      ko: '기본 세종 테마와 한국의 사계절(봄·여름·가을·겨울 야간 다크) 컬러셋 중 선택하세요.',
                      en: 'Choose between the default Sejong Ink & Hanji theme and four Korean season palettes.',
                      ja: '標準の世宗テーマと韓国の四季（春・夏・秋・冬ダーク）カラーセットから選択してください。',
                      id: 'Pilih antara tema standar Sejong atau empat palet warna empat musim Korea.',
                    })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {STUDIO_THEMES.map((item) => {
                  const isSelected = themeId === item.id;
                  const localized = getLocalizedThemeInfo(item.id, language);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id)}
                      aria-pressed={isSelected}
                      className={`group text-left rounded-none border transition-all cursor-pointer flex flex-col justify-between p-6 space-y-5 ${
                        isSelected
                          ? 'border-2 border-[var(--theme-ink-strong)] bg-[var(--theme-stage)]'
                          : 'border-[var(--theme-border-hairline)] bg-[var(--theme-elevated)] hover:border-[var(--theme-ink-strong)]'
                      }`}
                    >
                      {/* Top Header & Active Badge */}
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-[12px] font-extrabold uppercase tracking-[0.14em] text-[var(--theme-ink-secondary)]">
                          {localized.seasonLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {item.isDark ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[var(--theme-border-strong)] text-[11px] font-bold text-[var(--theme-ink-primary)]">
                              <Moon size={11} />
                              <span>DARK</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-[var(--theme-border-hairline)] text-[11px] font-bold text-[var(--theme-ink-secondary)]">
                              <Sun size={11} />
                              <span>LIGHT</span>
                            </span>
                          )}
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] text-[11px] font-extrabold">
                              <Check size={11} />
                              <span>{pick({ ko: '적용 중', en: 'Active', ja: '適用中', id: 'Aktif' })}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Mini Live Palette Preview Frame (Rendered in the Theme's Own Colors) */}
                      <div
                        className="w-full border overflow-hidden"
                        style={{
                          backgroundColor: item.tokens.canvas,
                          borderColor: item.tokens.borderStrong,
                        }}
                      >
                        <div
                          className="h-5 px-2.5 flex items-center justify-between"
                          style={{
                            backgroundColor: item.tokens.barBg,
                            color: item.tokens.barText,
                          }}
                        >
                          <span className="text-[9px] font-extrabold tracking-wider">GOGUMA</span>
                          <span
                            className="w-2 h-2 inline-block"
                            style={{ backgroundColor: item.tokens.barAccent }}
                          />
                        </div>

                        <div className="grid grid-cols-12 h-16">
                          <div
                            className="col-span-7 p-2.5 flex flex-col justify-between border-r"
                            style={{
                              backgroundColor: item.tokens.canvas,
                              borderColor: item.tokens.borderHairline,
                            }}
                          >
                            <div
                              className="h-2 w-16"
                              style={{ backgroundColor: item.tokens.inkStrong }}
                            />
                            <div className="space-y-1">
                              <div
                                className="h-1.5 w-full opacity-40"
                                style={{ backgroundColor: item.tokens.inkBody }}
                              />
                              <div
                                className="h-1.5 w-3/4 opacity-25"
                                style={{ backgroundColor: item.tokens.inkSecondary }}
                              />
                            </div>
                          </div>
                          <div
                            className="col-span-5 p-2.5 flex flex-col justify-between"
                            style={{ backgroundColor: item.tokens.stage }}
                          >
                            <div
                              className="h-3 w-full"
                              style={{ backgroundColor: item.tokens.hoverBg }}
                            />
                            <div
                              className="h-2 w-10"
                              style={{ backgroundColor: item.tokens.activeBg }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4-Color Swatch Strip */}
                      <div className="grid grid-cols-4 h-3 border border-[var(--theme-border-strong)]">
                        <span style={{ backgroundColor: item.swatches.canvas }} title={pick({ ko: '주 배경', en: 'Primary Canvas', ja: 'メイン背景', id: 'Kanvas Utama' })} />
                        <span style={{ backgroundColor: item.swatches.stage }} title={pick({ ko: '한지/보조 배경', en: 'Stage / Paper', ja: '補助背景', id: 'Latar Kertas' })} />
                        <span style={{ backgroundColor: item.swatches.ink }} title={pick({ ko: '먹/주 텍스트', en: 'Primary Ink', ja: '墨テキスト', id: 'Tinta Utama' })} />
                        <span style={{ backgroundColor: item.swatches.accent }} title={pick({ ko: '포인트 컬러', en: 'Accent Color', ja: 'アクセント色', id: 'Warna Aksen' })} />
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <div className="text-[21px] font-extrabold text-[var(--theme-ink-strong)] leading-snug">
                          {localized.name}
                        </div>
                        <div className="text-[13px] font-bold uppercase tracking-wider text-[var(--theme-ink-muted)]">
                          {item.subtitle}
                        </div>
                        <p className="text-[15px] text-[var(--theme-ink-body)] leading-[1.65] pt-1">
                          {localized.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-5 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] text-[16px] text-[var(--theme-ink-body)] leading-[1.7]">
                {pick({
                  ko: (
                    <>
                      <strong className="text-[var(--theme-ink-strong)]">백지 고정 안내:</strong> 겨울 야간 수묵 다크 모드를 포함한 모든 테마에서{' '}
                      <strong>인쇄 출력 및 사양서 내보내기 문서</strong>는 가독성과 인쇄 품질을 위해 항상 <strong>흰 종이(#FFFFFF) + 흑먹 텍스트</strong> 규격으로 고정됩니다.
                    </>
                  ),
                  en: (
                    <>
                      <strong className="text-[var(--theme-ink-strong)]">Fixed White-Paper Notice:</strong> Regardless of your active theme (including Winter Nocturnal Ink dark mode),{' '}
                      <strong>printed reports and exported specification sheets</strong> always use crisp <strong>white paper (#FFFFFF) and black ink</strong> for optimal readability.
                    </>
                  ),
                  ja: (
                    <>
                      <strong className="text-[var(--theme-ink-strong)]">白紙固定のご案内：</strong> 冬の夜間水墨ダークモードを含むすべてのテーマにおいて、{' '}
                      <strong>印刷出力および仕様書エクスポート文書</strong>は可読性と印刷品質のために常に<strong>白い紙（#FFFFFF）＋黒墨テキスト</strong>仕様に固定されます。
                    </>
                  ),
                  id: (
                    <>
                      <strong className="text-[var(--theme-ink-strong)]">Catatan Kertas Putih Tetap:</strong> Di semua tema termasuk mode gelap Tinta Malam Musim Dingin,{' '}
                      <strong>dokumen cetak dan ekspor spesifikasi</strong> selalu menggunakan <strong>kertas putih (#FFFFFF) dan tinta hitam</strong> demi keterbacaan terbaik.
                    </>
                  ),
                })}
              </div>
            </div>
          </EditorialSection>

          <EditorialSection chapter={pick({ ko: '화면 및 가독성 규격', en: 'Display & Readability', ja: '画面・可読性設定', id: 'Tampilan & Keterbacaan' })}>
            <div className="divide-y divide-[var(--theme-border-hairline)] border-y border-[var(--theme-border-hairline)]">
              <div className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[21px] font-extrabold text-[var(--theme-ink-strong)]">
                    <Type size={20} />
                    <span>{pick({ ko: '큰 글씨 가독성 모드', en: 'Large Text Readability Mode', ja: '大きな文字・可読性モード', id: 'Mode Teks Besar' })}</span>
                  </div>
                  <p className="text-[18px] text-[var(--theme-ink-secondary)]">
                    {pick({
                      ko: '에디터 본문과 제목의 글자 크기 및 줄 간격을 확대하여 장시간 집필 피로를 줄입니다.',
                      en: 'Increases heading and editor body font sizes and line spacing for comfortable long-form authoring.',
                      ja: 'エディター本文と見出しの文字サイズ・行間を拡大し、長時間の執筆による目の疲れを軽減します。',
                      id: 'Memperbesar ukuran font dan jarak baris pada editor untuk mengurangi kelelahan membaca.',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleLargeText}
                  className={`px-6 py-3.5 rounded-none text-[17px] font-bold border transition-colors cursor-pointer shrink-0 ${
                    isLarge
                      ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)] border-[var(--theme-ink-strong)]'
                      : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-strong)] border-[var(--theme-ink-strong)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)]'
                  }`}
                >
                  {isLarge
                    ? pick({ ko: '활성화됨 (켜짐)', en: 'Enabled (On)', ja: '有効（オン）', id: 'Aktif (Nyala)' })
                    : pick({ ko: '표준 크기 (끄기)', en: 'Standard Size (Off)', ja: '標準サイズ（オフ）', id: 'Ukuran Standar (Mati)' })}
                </button>
              </div>

              <div className="py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 text-[21px] font-extrabold text-[var(--theme-ink-strong)]">
                    <Globe size={20} />
                    <span>{pick({ ko: '인터페이스 언어 설정', en: 'Interface Language', ja: 'インターフェース言語設定', id: 'Bahasa Antarmuka' })}</span>
                  </div>
                  <p className="text-[18px] text-[var(--theme-ink-secondary)]">
                    {pick({
                      ko: '스튜디오 인터페이스 및 문서 표시 언어를 전환합니다.',
                      en: 'Switch studio UI and documentation language globally.',
                      ja: 'スタジオのインターフェースおよびドキュメント表示言語を切り替えます。',
                      id: 'Ubah bahasa antarmuka studio dan dokumen secara global.',
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center border border-[var(--theme-ink-strong)] rounded-none divide-x divide-[var(--theme-ink-strong)] shrink-0">
                  {(
                    [
                      { code: 'ko', label: '한국어' },
                      { code: 'en', label: 'English' },
                      { code: 'ja', label: '日本語' },
                      { code: 'id', label: 'Indonesia' },
                    ] as { code: Language; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setLanguage(opt.code)}
                      className={`px-5 py-3 text-[17px] font-bold transition-colors cursor-pointer ${
                        language === opt.code
                          ? 'bg-[var(--theme-active-bg)] text-[var(--theme-active-text)]'
                          : 'bg-[var(--theme-canvas)] text-[var(--theme-ink-primary)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-12">
          <EditorialSection chapter={pick({ ko: '로컬 저장소 현황 및 빠른 이동', en: 'Local Storage Overview & Shortcuts', ja: 'ローカルストレージ状況とクイック移動', id: 'Status Penyimpanan Lokal & Pintasan' })}>
            <EditorialTable
              headers={pick({
                ko: ['항목', '현재 상태', '설명'],
                en: ['Metric', 'Current Status', 'Description'],
                ja: ['項目', '現在の状態', '説明'],
                id: ['Item', 'Status Saat Ini', 'Keterangan'],
              })}
              rows={[
                [
                  pick({ ko: '로컬 저장소 사용량', en: 'Local Storage Used', ja: 'ローカル容量使用量', id: 'Penggunaan Penyimpanan Lokal' }),
                  storageStats.formattedSize,
                  pick({ ko: '브라우저 IndexedDB / LocalStorage 점유 용량', en: 'Browser IndexedDB / LocalStorage footprint', ja: 'ブラウザIndexedDB / LocalStorage使用容量', id: 'Kapasitas terpakai di IndexedDB / LocalStorage peramban' }),
                ],
                [
                  pick({ ko: '보존 중인 프로젝트', en: 'Saved Projects', ja: '保存済みプロジェクト', id: 'Proyek Tersimpan' }),
                  pick({ ko: `${storageStats.projectCount}건`, en: `${storageStats.projectCount}`, ja: `${storageStats.projectCount}件`, id: `${storageStats.projectCount}` }),
                  pick({ ko: '현재 브라우저에 저장된 전체 기획서 프로젝트 수', en: 'Total specification projects stored in this browser', ja: 'このブラウザに保存された全プロジェクト数', id: 'Jumlah proyek spesifikasi yang tersimpan di peramban ini' }),
                ],
                [
                  pick({ ko: '자동 복구 스냅샷', en: 'Autosave Snapshots', ja: '自動復元スナップショット', id: 'Snapshot Pemulihan Otomatis' }),
                  pick({ ko: `${storageStats.autosaveCount}건`, en: `${storageStats.autosaveCount}`, ja: `${storageStats.autosaveCount}件`, id: `${storageStats.autosaveCount}` }),
                  pick({ ko: '작업 중 실시간 생성된 자동 복원 지점', en: 'Real-time recovery points created during authoring', ja: '作業中にリアルタイム生成された自動復元ポイント', id: 'Titik pemulihan otomatis yang dibuat selama penulisan' }),
                ],
              ]}
            />

            {exportNotice && (
              <div className="p-5 rounded-none bg-[var(--theme-success-bg)] border border-[var(--theme-success)] text-[var(--theme-success)] text-[17px] font-bold flex items-center gap-2.5">
                <CheckCircle2 size={18} />
                <span>{pick({ ko: '전체 로컬 프로젝트 백업 파일이 다운로드되었습니다.', en: 'Full local workspace backup JSON downloaded.', ja: '全ローカルプロジェクトのバックアップファイルをダウンロードしました。', id: 'File cadangan seluruh proyek lokal telah diunduh.' })}</span>
              </div>
            )}

            <div className="divide-y divide-[var(--theme-border-hairline)] border-y border-[var(--theme-border-hairline)]">
              <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">
                    {pick({ ko: '표준 기획서 템플릿 불러오기', en: 'Browse Standard Specification Templates', ja: '標準仕様書テンプレートを開く', id: 'Telusuri Templat Spesifikasi Standar' })}
                  </div>
                  <p className="text-[17px] text-[var(--theme-ink-secondary)] mt-1">
                    {pick({ ko: '검증된 표준 아키텍처 템플릿으로 새 기획서를 빠르게 시작합니다.', en: 'Start rapidly with battle-tested industry architecture templates.', ja: '実績のある標準アーキテクチャテンプレートで新しい企画書を素早く開始します。', id: 'Mulai proyek baru dengan cepat menggunakan templat arsitektur standar teruji.' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/templates')}
                  className="px-5 py-3 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <LayoutTemplate size={16} />
                  <span>{pick({ ko: '템플릿 페이지로', en: 'Open Templates', ja: 'テンプレートへ', id: 'Buka Templat' })}</span>
                </button>
              </div>

              <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">
                    {pick({ ko: '보관함 및 로컬 백업 허브', en: 'Archive & Local Backup Hub', ja: 'アーカイブ・ローカルバックアップハブ', id: 'Hub Arsip & Cadangan Lokal' })}
                  </div>
                  <p className="text-[17px] text-[var(--theme-ink-secondary)] mt-1">
                    {pick({ ko: '백업 내보내기, JSON 복원 및 저장소 정리를 수행합니다.', en: 'Export backups, restore JSON packages, and manage local storage.', ja: 'バックアップ出力、JSON復元、ストレージ整理を行います。', id: 'Ekspor cadangan, pulihkan berkas JSON, dan kelola penyimpanan.' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/backup?tab=storage')}
                  className="px-5 py-3 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <FolderOpen size={16} />
                  <span>{pick({ ko: '보관함 열기', en: 'Open Backup Hub', ja: '保管庫を開く', id: 'Buka Arsip' })}</span>
                </button>
              </div>

              <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[20px] font-extrabold text-[var(--theme-ink-strong)]">
                    {pick({ ko: '전체 데이터 즉시 백업 다운로드', en: 'Download Instant Full Backup', ja: '全データを今すぐバックアップ', id: 'Unduh Cadangan Penuh Seketika' })}
                  </div>
                  <p className="text-[17px] text-[var(--theme-ink-secondary)] mt-1">
                    {pick({ ko: '현재 브라우저에 저장된 모든 원고를 단일 JSON 파일로 내려받습니다.', en: 'Download all specifications stored in this browser as a single JSON file.', ja: 'このブラウザに保存された全原稿を単一のJSONファイルとして保存します。', id: 'Unduh semua draf yang tersimpan di peramban ini sebagai satu file JSON.' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickExportBackup}
                  className="px-5 py-3 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Download size={16} />
                  <span>{pick({ ko: '즉시 백업', en: 'Quick Backup', ja: '今すぐバックアップ', id: 'Cadangkan Cepat' })}</span>
                </button>
              </div>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'account' && (
        <EditorialSection chapter={pick({ ko: '로컬 계정 및 작업 세션 관리', en: 'Local Account & Active Session', ja: 'ローカルアカウント・セッション管理', id: 'Akun Lokal & Manajemen Sesi' })}>
          <div className="p-8 bg-[var(--theme-stage)] border border-[var(--theme-border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-14 h-14 rounded-none bg-[var(--theme-bar-bg)] text-[var(--theme-bar-accent)] font-extrabold text-[24px] flex items-center justify-center shrink-0">
                {(currentUser?.displayName || 'D')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[22px] font-extrabold text-[var(--theme-ink-strong)] truncate">
                  {currentUser?.displayName || pick({ ko: '로컬 디렉터', en: 'Local Director', ja: 'ローカルディレクター', id: 'Direktur Lokal' })}
                </div>
                <div className="text-[17px] text-[var(--theme-ink-secondary)] mt-1">
                  {currentUser?.role === 'ADMIN'
                    ? pick({ ko: '디렉터 · 로컬 독립 세션', en: 'Director · Local Sovereign Session', ja: 'ディレクター · ローカル独立セッション', id: 'Direktur · Sesi Lokal Mandiri' })
                    : pick({ ko: '게스트 · 로컬 세션', en: 'Guest · Local Session', ja: 'ゲスト · ローカルセッション', id: 'Tamu · Sesi Lokal' })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-5 py-3 rounded-none bg-[var(--theme-btn-bg)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] text-[var(--theme-btn-text)] text-[17px] font-bold transition-colors cursor-pointer"
              >
                {pick({ ko: '내 계정 및 프로필', en: 'Account & Profile', ja: 'アカウント・プロフィール', id: 'Akun & Profil Saya' })}
              </button>
              <button
                type="button"
                onClick={() => navigate('/logout')}
                className="px-5 py-3 rounded-none border border-[var(--theme-ink-strong)] bg-[var(--theme-canvas)] hover:bg-[var(--theme-hover-bg)] hover:text-[var(--theme-hover-text)] hover:border-[var(--theme-hover-bg)] text-[var(--theme-ink-strong)] text-[17px] font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>{pick({ ko: '로그아웃', en: 'Sign Out', ja: 'ログアウト', id: 'Keluar' })}</span>
              </button>
            </div>
          </div>
        </EditorialSection>
      )}
    </EditorialPageLayout>
  );
}
