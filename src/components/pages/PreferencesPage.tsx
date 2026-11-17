import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Key, HardDrive, CheckCircle2, AlertCircle, RefreshCw, Eye, EyeOff,
  Server, Shield, Cpu, Type, Globe, FolderOpen, LayoutTemplate, Download, LogOut
} from 'lucide-react';
import { AISettings, getAISettings, saveAISettings } from '../../lib/aiConfig';
import { getStorageUsageStats, exportAllLocalData } from '../../lib/localDb';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { language, setLanguage } = useLanguage();

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
    }
  }, [paramTab]);

  const selectTab = (tab: PreferencesTab) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
    setTestResult(null);
  };

  const handleSaveEngine = () => {
    saveAISettings(settings);
    setTestResult({
      success: true,
      message: '인공지능 인퍼런스 엔진 설정이 브라우저 로컬 저장소에 저장되었습니다.',
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
        setTestResult({ success: true, message: `로컬 Ollama 연결 완료 (${models.length}개 모델 감지됨)` });
      } else {
        setTestResult({ success: false, message: 'Ollama 서버는 실행 중이나 설치된 모델이 없습니다.' });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Ollama 엔드포인트에 연결할 수 없습니다. 로컬 서버 상태를 확인해 주세요.',
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
          throw new Error(data.error || `연결 오류 (${res.status})`);
        }
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Gemini 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 30)}"`,
        });
      } else if (settings.provider === 'webllm') {
        if ('gpu' in navigator) {
          setTestResult({
            success: true,
            message: `WebGPU 가속 활성화됨 · ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'} 모델이 기기 로컬에서 동작합니다.`,
          });
        } else {
          setTestResult({
            success: false,
            message: '현재 브라우저에서 WebGPU를 사용할 수 없습니다. 최신 Chrome/Edge 또는 Gemini/Ollama를 선택하세요.',
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
          message: `Ollama 추론 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 40)}"`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '연결 테스트에 실패했습니다. 설정값을 확인해 주세요.',
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

  const tabs = [
    { id: 'engine', label: '인공지능 엔진', onClick: () => selectTab('engine') },
    { id: 'display', label: '화면 및 가독성', onClick: () => selectTab('display') },
    { id: 'storage', label: '보관함 및 템플릿', onClick: () => selectTab('storage') },
    { id: 'account', label: '계정 및 세션', onClick: () => selectTab('account') },
  ];

  return (
    <EditorialPageLayout
      category="STUDIO PREFERENCES"
      title="환경 설정"
      subtitle="인공지능 인퍼런스 엔진(BYOK / Ollama / WebLLM), 화면 가독성, 언어 및 로컬 보관함 환경을 구성합니다."
      tabs={tabs}
      activeTabId={activeTab}
    >
      {activeTab === 'engine' && (
        <div className="space-y-8">
          <EditorialSection chapter="1. 추론 엔진 계층 선택">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'gemini' }))}
                className={`p-5 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  settings.provider === 'gemini'
                    ? 'border-[#000000] bg-[#000000] text-[#FFE600]'
                    : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#000000]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Cpu size={16} />
                  <span className="text-[10px] px-2 py-0.5 border border-current uppercase font-bold tracking-wider">
                    클라우드
                  </span>
                </div>
                <div>
                  <div className="text-base font-extrabold">Gemini 3.8</div>
                  <div className={`text-xs mt-1 ${settings.provider === 'gemini' ? 'text-white/80' : 'text-[#52524E]'}`}>
                    서버 프록시 / 개인 키(BYOK)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'ollama' }))}
                className={`p-5 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  settings.provider === 'ollama'
                    ? 'border-[#000000] bg-[#000000] text-[#FFE600]'
                    : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#000000]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <HardDrive size={16} />
                  <span className="text-[10px] px-2 py-0.5 border border-current uppercase font-bold tracking-wider">
                    로컬 서버
                  </span>
                </div>
                <div>
                  <div className="text-base font-extrabold">Ollama 로컬</div>
                  <div className={`text-xs mt-1 ${settings.provider === 'ollama' ? 'text-white/80' : 'text-[#52524E]'}`}>
                    오프라인 기기 직접 추론
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, provider: 'webllm' }))}
                className={`p-5 rounded-none border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-3 ${
                  settings.provider === 'webllm'
                    ? 'border-[#000000] bg-[#000000] text-[#FFE600]'
                    : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#000000]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Server size={16} />
                  <span className="text-[10px] px-2 py-0.5 border border-current uppercase font-bold tracking-wider">
                    브라우저 내장
                  </span>
                </div>
                <div>
                  <div className="text-base font-extrabold">WebLLM</div>
                  <div className={`text-xs mt-1 ${settings.provider === 'webllm' ? 'text-white/80' : 'text-[#52524E]'}`}>
                    무설치 WebGPU 가속
                  </div>
                </div>
              </button>
            </div>
          </EditorialSection>

          <EditorialSection chapter="2. 상세 연결 구성">
            {settings.provider === 'gemini' && (
              <div className="space-y-4 p-6 rounded-none bg-[#F6F5F1] border border-[#E4E2DC]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1.5">
                    <Key size={14} />
                    <span>개인 Gemini API 키 (선택 사항 · BYOK)</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#000000] underline underline-offset-4 font-bold hover:text-[#DC2626]"
                  >
                    키 발급 안내 ↗
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="비워두면 기본 서버 프록시를 사용합니다 (AIzaSy...)"
                    value={settings.gemini.apiKey}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, gemini: { ...s.gemini, apiKey: e.target.value } }))
                    }
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52524E] hover:text-[#000000] cursor-pointer"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#000000] mb-1.5">모델 선택</label>
                  <select
                    value={settings.gemini.model}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, gemini: { ...s.gemini, model: e.target.value } }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none cursor-pointer"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (권장 · 균형형)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (고속 응답)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (심층 아키텍처 추론)</option>
                  </select>
                </div>
              </div>
            )}

            {settings.provider === 'ollama' && (
              <div className="space-y-4 p-6 rounded-none bg-[#F6F5F1] border border-[#E4E2DC]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1.5">
                    <Server size={14} />
                    <span>Ollama 로컬 서버 주소</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchOllamaModels}
                    disabled={fetchingOllama}
                    className="inline-flex items-center gap-1.5 text-xs text-[#000000] underline underline-offset-4 font-bold cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={fetchingOllama ? 'animate-spin' : ''} />
                    <span>설치된 모델 스캔</span>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="http://localhost:11434"
                  value={settings.ollama.endpoint}
                  onChange={(e) =>
                    setSettings(s => ({ ...s, ollama: { ...s.ollama, endpoint: e.target.value } }))
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none"
                />

                <div>
                  <label className="block text-xs font-extrabold text-[#000000] mb-1.5">Ollama 모델명</label>
                  {availableOllamaModels.length > 0 ? (
                    <select
                      value={settings.ollama.model}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, ollama: { ...s.ollama, model: e.target.value } }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none cursor-pointer"
                    >
                      {availableOllamaModels.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="예: llama3.2, qwen2.5:7b, mistral"
                      value={settings.ollama.model}
                      onChange={(e) =>
                        setSettings(s => ({ ...s, ollama: { ...s.ollama, model: e.target.value } }))
                      }
                      className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none"
                    />
                  )}
                </div>
              </div>
            )}

            {settings.provider === 'webllm' && (
              <div className="space-y-4 p-6 rounded-none bg-[#F6F5F1] border border-[#E4E2DC]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-[#000000] flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>브라우저 내장 WebGPU 로컬 모델</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#000000] bg-[#FFFFFF] px-2.5 py-1 border border-[#E4E2DC]">
                    완전 오프라인
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#000000] mb-1.5">내장 추론 모델</label>
                  <select
                    value={settings.webllm?.model || 'Qwen2.5-Coder-1.5B'}
                    onChange={(e) =>
                      setSettings(s => ({ ...s, webllm: { ...s.webllm, model: e.target.value } }))
                    }
                    className="w-full px-3.5 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-none text-xs text-[#111111] outline-none cursor-pointer"
                  >
                    <option value="Qwen2.5-Coder-1.5B">Qwen2.5-Coder-1.5B (코드 · 명세 최적화)</option>
                    <option value="Llama-3.2-1B-Instruct">Llama-3.2-1B-Instruct (경량 범용)</option>
                    <option value="SmolLM2-1.7B-Instruct">SmolLM2-1.7B-Instruct (초경량)</option>
                  </select>
                </div>
              </div>
            )}

            {testResult && (
              <div
                className={`p-4 rounded-none text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-[#F3F7F4] text-[#1F5132] border-[#1F5132]'
                    : 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-semibold">{testResult.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 bg-[#FFFFFF] border border-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] rounded-none text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
                <span>{isTesting ? '연결 테스트 중...' : '연결 테스트 실행'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveEngine}
                className="px-6 py-2.5 bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] rounded-none text-xs font-bold transition-colors cursor-pointer"
              >
                로컬 설정 저장하기
              </button>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'display' && (
        <EditorialSection chapter="화면 및 가독성 규격">
          <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#000000]">
                  <Type size={16} />
                  <span>큰 글씨 가독성 모드</span>
                </div>
                <p className="text-xs text-[#52524E]">
                  에디터 본문과 제목의 글자 크기 및 줄 간격을 확대하여 장시간 집필 피로를 줄입니다.
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleLargeText}
                className={`px-5 py-2.5 rounded-none text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                  isLarge
                    ? 'bg-[#000000] text-[#FFE600] border-[#000000]'
                    : 'bg-[#FFFFFF] text-[#000000] border-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626]'
                }`}
              >
                {isLarge ? '활성화됨 (켜짐)' : '표준 크기 (끄기)'}
              </button>
            </div>

            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#000000]">
                  <Globe size={16} />
                  <span>인터페이스 언어 설정</span>
                </div>
                <p className="text-xs text-[#52524E]">
                  스튜디오 인터페이스 및 문서 표시 언어를 전환합니다.
                </p>
              </div>
              <div className="flex items-center border border-[#000000] rounded-none divide-x divide-[#000000] shrink-0">
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
                    className={`px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                      language === opt.code
                        ? 'bg-[#000000] text-[#FFE600]'
                        : 'bg-[#FFFFFF] text-[#111111] hover:bg-[#DC2626] hover:text-[#FFE600]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </EditorialSection>
      )}

      {activeTab === 'storage' && (
        <div className="space-y-6">
          <EditorialSection chapter="로컬 저장소 현황 및 빠른 이동">
            <EditorialTable
              headers={['항목', '현재 상태', '설명']}
              rows={[
                ['로컬 저장소 사용량', storageStats.formattedSize, '브라우저 IndexedDB / LocalStorage 점유 용량'],
                ['보존 중인 프로젝트', `${storageStats.projectCount}건`, '현재 브라우저에 저장된 전체 기획서 프로젝트 수'],
                ['자동 복구 스냅샷', `${storageStats.autosaveCount}건`, '작업 중 실시간 생성된 자동 복원 지점'],
              ]}
            />

            {exportNotice && (
              <div className="p-3.5 rounded-none bg-[#F3F7F4] border border-[#1F5132] text-[#1F5132] text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>전체 로컬 프로젝트 백업 파일이 다운로드되었습니다.</span>
              </div>
            )}

            <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-[#000000]">표준 기획서 템플릿 불러오기</div>
                  <p className="text-xs text-[#52524E] mt-0.5">검증된 표준 아키텍처 템플릿으로 새 기획서를 빠르게 시작합니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/templates')}
                  className="px-4 py-2 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <LayoutTemplate size={13} />
                  <span>템플릿 페이지로</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-[#000000]">보관함 및 로컬 백업 허브</div>
                  <p className="text-xs text-[#52524E] mt-0.5">백업 내보내기, JSON 복원 및 저장소 정리를 수행합니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/backup?tab=storage')}
                  className="px-4 py-2 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <FolderOpen size={13} />
                  <span>보관함 열기</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-extrabold text-[#000000]">전체 데이터 즉시 백업 다운로드</div>
                  <p className="text-xs text-[#52524E] mt-0.5">현재 브라우저에 저장된 모든 원고를 단일 JSON 파일로 내려받습니다.</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickExportBackup}
                  className="px-4 py-2 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download size={13} />
                  <span>즉시 백업</span>
                </button>
              </div>
            </div>
          </EditorialSection>
        </div>
      )}

      {activeTab === 'account' && (
        <EditorialSection chapter="로컬 계정 및 작업 세션 관리">
          <div className="p-6 bg-[#F6F5F1] border border-[#E4E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-none bg-[#000000] text-[#FFE600] font-extrabold text-lg flex items-center justify-center shrink-0">
                {(currentUser?.displayName || 'D')[0]}
              </div>
              <div className="min-w-0">
                <div className="text-base font-extrabold text-[#000000] truncate">
                  {currentUser?.displayName || '로컬 디렉터'}
                </div>
                <div className="text-xs text-[#52524E] mt-0.5">
                  {currentUser?.role === 'ADMIN' ? '디렉터 · 로컬 독립 세션' : '게스트 · 로컬 세션'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 rounded-none bg-[#000000] hover:bg-[#DC2626] hover:text-[#FFE600] text-[#FFFFFF] text-xs font-bold transition-colors cursor-pointer"
              >
                내 계정 및 프로필
              </button>
              <button
                type="button"
                onClick={() => navigate('/logout')}
                className="px-4 py-2 rounded-none border border-[#000000] bg-[#FFFFFF] hover:bg-[#DC2626] hover:text-[#FFE600] hover:border-[#DC2626] text-[#000000] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </EditorialSection>
      )}
    </EditorialPageLayout>
  );
}
