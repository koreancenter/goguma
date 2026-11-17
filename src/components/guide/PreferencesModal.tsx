import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key, HardDrive, CheckCircle2, AlertCircle, RefreshCw, X, Eye, EyeOff,
  Server, Shield, Cpu, SlidersHorizontal, Type, PanelRight, Globe,
  FolderOpen, LayoutTemplate, Download, User, LogOut
} from 'lucide-react';
import { AISettings, getAISettings, saveAISettings } from '../../lib/aiConfig';
import { getStorageUsageStats, exportAllLocalData } from '../../lib/localDb';
import { useLanguage } from '../../contexts/LanguageContext';

export type PreferencesTab = 'engine' | 'display' | 'storage' | 'account';

export interface PreferencesModalProps {
  isOpen: boolean;
  initialTab?: PreferencesTab;
  onClose: () => void;
  largeTextMode?: boolean;
  onToggleLargeTextMode?: () => void;
  isPreviewCollapsed?: boolean;
  onTogglePreviewCollapsed?: () => void;
  onOpenTemplates?: () => void;
  onOpenBackup?: (tab?: 'export' | 'import' | 'storage') => void;
  currentUserName?: string;
  currentUserRole?: string;
  onNavigateProfile?: () => void;
  onOpenLogout?: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  initialTab = 'engine',
  onClose,
  largeTextMode,
  onToggleLargeTextMode,
  isPreviewCollapsed,
  onTogglePreviewCollapsed,
  onOpenTemplates,
  onOpenBackup,
  currentUserName,
  currentUserRole,
  onNavigateProfile,
  onOpenLogout,
}) => {
  const { language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<PreferencesTab>(initialTab);
  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [fetchingOllama, setFetchingOllama] = useState(false);
  const [storageStats, setStorageStats] = useState(getStorageUsageStats);
  const [exportNotice, setExportNotice] = useState(false);
  const [localLargeText, setLocalLargeText] = useState<boolean>(() => localStorage.getItem('goguma_large_text') === 'true');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSettings(getAISettings());
      setStorageStats(getStorageUsageStats());
      setLocalLargeText(largeTextMode ?? localStorage.getItem('goguma_large_text') === 'true');
      setTestResult(null);
      setExportNotice(false);
    }
  }, [isOpen, initialTab, largeTextMode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSaveEngine = () => {
    saveAISettings(settings);
    setTestResult({ success: true, message: '인공지능 인퍼런스 엔진 설정이 로컬에 저장되었습니다.' });
    setTimeout(() => {
      onClose();
    }, 550);
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
            ollama: { ...prev.ollama, model: models[0] }
          }));
        }
        setTestResult({ success: true, message: `로컬 Ollama 연결 완료 (${models.length}개 모델 감지됨)` });
      } else {
        setTestResult({ success: false, message: 'Ollama 서버는 실행 중이나 설치된 모델이 없습니다.' });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Ollama 엔드포인트에 연결할 수 없습니다. 로컬 서버 상태를 확인해 주세요.'
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
            apiKey: settings.gemini.apiKey?.trim() || undefined
          })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `연결 오류 (${res.status})`);
        }
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Gemini 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 30)}"`
        });
      } else if (settings.provider === 'webllm') {
        if ('gpu' in navigator) {
          setTestResult({
            success: true,
            message: `WebGPU 가속 활성화됨 · ${settings.webllm?.model || 'Qwen2.5-Coder-1.5B'} 모델이 기기 로컬에서 동작합니다.`
          });
        } else {
          setTestResult({
            success: false,
            message: '현재 브라우저에서 WebGPU를 사용할 수 없습니다. 최신 Chrome/Edge 또는 Gemini/Ollama를 선택하세요.'
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
            stream: false
          })
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        setTestResult({
          success: true,
          message: `Ollama 추론 연결 성공 · 응답: "${(data.text || '').trim().slice(0, 40)}"`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '연결 테스트에 실패했습니다. 설정값을 확인해 주세요.'
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

  if (!isOpen) return null;

  const isLarge = largeTextMode ?? localLargeText;

  const TABS: { id: PreferencesTab; label: string; Icon: React.ElementType }[] = [
    { id: 'engine', label: '인공지능 엔진', Icon: Cpu },
    { id: 'display', label: '화면 및 가독성', Icon: Type },
    { id: 'storage', label: '보관함 및 템플릿', Icon: FolderOpen },
    { id: 'account', label: '계정 및 세션', Icon: User },
  ];

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55 backdrop-blur-xs select-none font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 6 }}
          transition={{ duration: 0.16 }}
          className="w-full max-w-2xl max-h-[90vh] h-[600px] bg-[#FFFFFF] rounded-[2px] shadow-[0_24px_56px_-12px_rgba(0,0,0,0.3)] border border-[#111111] overflow-hidden flex flex-col text-[#111111]"
        >
          {/* Sejong Sumi Ink Modal Header */}
          <div className="px-6 py-4 bg-[#000000] text-[#FFFFFF] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[2px] border border-white/25 bg-white/10 text-[#FFFFFF] flex items-center justify-center shrink-0">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-[#FFFFFF]">
                  환경 설정
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-white/70 hover:text-[#FFFFFF] hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="환경 설정 닫기"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sejong Architectural Underline Tab Bar */}
          <div className="px-6 bg-[#F6F5F1] border-b border-[#E4E2DC] flex items-center gap-6 overflow-x-auto no-scrollbar shrink-0">
            {TABS.map((tab) => {
              const Icon = tab.Icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3.5 text-[13px] flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'text-[#000000] font-bold'
                      : 'text-[#52524E] hover:text-[#000000] font-medium'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#000000]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Body */}
          <div className="flex-1 p-6 space-y-5 bg-[#FFFFFF] overflow-y-auto custom-scroll">
            {/* TAB 1: AI INFERENCE ENGINE */}
            {activeTab === 'engine' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52524E]">
                      추론 엔진 계층 선택
                    </span>
                    <span className="text-[11px] text-[#8C8B85]">
                      로컬 저장 · 서버 전송 없음
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, provider: 'gemini' }))}
                      className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        settings.provider === 'gemini'
                          ? 'border-[#000000] bg-[#000000] text-[#FFFFFF]'
                          : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Cpu size={15} className={settings.provider === 'gemini' ? 'text-[#FFFFFF]' : 'text-[#111111]'} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] border uppercase tracking-wider ${
                          settings.provider === 'gemini'
                            ? 'border-white/25 text-white/90 bg-white/10'
                            : 'border-[#E4E2DC] text-[#52524E] bg-[#FFFFFF]'
                        }`}>
                          클라우드
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">Gemini 3.8</div>
                        <div className={`text-[11px] mt-0.5 ${settings.provider === 'gemini' ? 'text-white/75' : 'text-[#52524E]'}`}>
                          서버 프록시 / 개인 키
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, provider: 'ollama' }))}
                      className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        settings.provider === 'ollama'
                          ? 'border-[#000000] bg-[#000000] text-[#FFFFFF]'
                          : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <HardDrive size={15} className={settings.provider === 'ollama' ? 'text-[#FFFFFF]' : 'text-[#111111]'} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] border uppercase tracking-wider ${
                          settings.provider === 'ollama'
                            ? 'border-white/25 text-white/90 bg-white/10'
                            : 'border-[#E4E2DC] text-[#52524E] bg-[#FFFFFF]'
                        }`}>
                          로컬 서버
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">Ollama 로컬</div>
                        <div className={`text-[11px] mt-0.5 ${settings.provider === 'ollama' ? 'text-white/75' : 'text-[#52524E]'}`}>
                          오프라인 기기 추론
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettings(s => ({ ...s, provider: 'webllm' }))}
                      className={`p-3.5 rounded-[2px] border text-left transition-colors cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        settings.provider === 'webllm'
                          ? 'border-[#000000] bg-[#000000] text-[#FFFFFF]'
                          : 'border-[#E4E2DC] bg-[#F6F5F1] text-[#111111] hover:border-[#111111]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Server size={15} className={settings.provider === 'webllm' ? 'text-[#FFFFFF]' : 'text-[#111111]'} />
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-[2px] border uppercase tracking-wider ${
                          settings.provider === 'webllm'
                            ? 'border-white/25 text-white/90 bg-white/10'
                            : 'border-[#E4E2DC] text-[#52524E] bg-[#FFFFFF]'
                        }`}>
                          브라우저 내장
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-bold">WebLLM</div>
                        <div className={`text-[11px] mt-0.5 ${settings.provider === 'webllm' ? 'text-white/75' : 'text-[#52524E]'}`}>
                          무설치 WebGPU
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Gemini Config */}
                {settings.provider === 'gemini' && (
                  <div className="space-y-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#E4E2DC]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                        <Key size={13} />
                        <span>개인 Gemini API 키 (선택 사항)</span>
                      </span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#111111] underline underline-offset-4 font-medium hover:opacity-75"
                      >
                        키 발급 안내 ↗
                      </a>
                    </div>

                    <div className="relative">
                      <input
                        type={showKey ? 'text' : 'password'}
                        placeholder="비워두면 기본 서버 프록시를 사용합니다 (AIzaSy...)"
                        value={settings.gemini.apiKey}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          gemini: { ...s.gemini, apiKey: e.target.value }
                        }))}
                        className="w-full pl-3 pr-9 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] placeholder:text-[#8C8B85] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52524E] hover:text-[#111111] cursor-pointer"
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-[#52524E] leading-relaxed">
                      입력한 개인 API 키는 외부 서버에 저장되지 않고 현재 브라우저 로컬 스토리지에만 보관됩니다.
                    </p>

                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">
                        모델 선택
                      </label>
                      <select
                        value={settings.gemini.model}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          gemini: { ...s.gemini, model: e.target.value }
                        }))}
                        className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] outline-none cursor-pointer"
                      >
                        <option value="gemini-3.8-flash">gemini-3.8-flash (권장 · 균형형)</option>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (고속 응답)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (심층 아키텍처 추론)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Ollama Config */}
                {settings.provider === 'ollama' && (
                  <div className="space-y-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#E4E2DC]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                        <Server size={13} />
                        <span>Ollama 로컬 서버 주소</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleFetchOllamaModels}
                        disabled={fetchingOllama}
                        className="inline-flex items-center gap-1 text-[11px] text-[#111111] underline underline-offset-4 font-semibold cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw size={11} className={fetchingOllama ? 'animate-spin' : ''} />
                        <span>설치된 모델 스캔</span>
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="http://localhost:11434"
                        value={settings.ollama.endpoint}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          ollama: { ...s.ollama, endpoint: e.target.value }
                        }))}
                        className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">
                        Ollama 모델명
                      </label>
                      {availableOllamaModels.length > 0 ? (
                        <select
                          value={settings.ollama.model}
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            ollama: { ...s.ollama, model: e.target.value }
                          }))}
                          className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] outline-none cursor-pointer"
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
                          onChange={(e) => setSettings(s => ({
                            ...s,
                            ollama: { ...s.ollama, model: e.target.value }
                          }))}
                          className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] outline-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* WebLLM Config */}
                {settings.provider === 'webllm' && (
                  <div className="space-y-4 p-4 rounded-[2px] bg-[#F6F5F1] border border-[#E4E2DC]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                        <Shield size={13} />
                        <span>브라우저 내장 WebGPU 로컬 모델</span>
                      </span>
                      <span className="text-[10px] font-medium text-[#52524E] bg-[#FFFFFF] px-2 py-0.5 rounded-[2px] border border-[#E4E2DC]">
                        완전 오프라인
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#111111] mb-1.5">
                        내장 추론 모델
                      </label>
                      <select
                        value={settings.webllm?.model || 'Qwen2.5-Coder-1.5B'}
                        onChange={(e) => setSettings(s => ({
                          ...s,
                          webllm: { ...s.webllm, model: e.target.value }
                        }))}
                        className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-[#CBC8BF] focus:border-[#000000] rounded-[2px] text-xs text-[#111111] outline-none cursor-pointer"
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
                    className={`p-3 rounded-[2px] text-xs flex items-start gap-2.5 border ${
                      testResult.success
                        ? 'bg-[#F3F7F4] text-[#1F5132] border-[#1F5132]/30'
                        : 'bg-[#FBF3F2] text-[#8B261D] border-[#8B261D]/30'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed break-words flex-1">{testResult.message}</span>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DISPLAY & READABILITY */}
            {activeTab === 'display' && (
              <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                      <Type size={15} />
                      <span>큰 글씨 가독성 모드</span>
                    </div>
                    <p className="text-xs text-[#52524E]">
                      에디터 본문과 제목의 글자 크기 및 줄 간격을 확대하여 장시간 집필 피로를 줄입니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLargeText}
                    className={`px-4 py-2 rounded-[2px] text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                      isLarge
                        ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                        : 'bg-[#FFFFFF] text-[#111111] border-[#CBC8BF] hover:border-[#000000]'
                    }`}
                  >
                    {isLarge ? '활성화됨' : '끄기'}
                  </button>
                </div>

                {onTogglePreviewCollapsed && (
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                        <PanelRight size={15} />
                        <span>우측 실시간 사양서 미리보기 패널</span>
                      </div>
                      <p className="text-xs text-[#52524E]">
                        집필과 동시에 실시간 프로토타입과 마크다운 사양서를 나란히 표시하거나 넓게 집중 집필합니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onTogglePreviewCollapsed}
                      className={`px-4 py-2 rounded-[2px] text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                        !isPreviewCollapsed
                          ? 'bg-[#000000] text-[#FFFFFF] border-[#000000]'
                          : 'bg-[#FFFFFF] text-[#111111] border-[#CBC8BF] hover:border-[#000000]'
                      }`}
                    >
                      {!isPreviewCollapsed ? '표시 중' : '접힘'}
                    </button>
                  </div>
                )}

                <div className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-[#111111]">
                      <Globe size={15} />
                      <span>인터페이스 언어 설정</span>
                    </div>
                    <p className="text-xs text-[#52524E]">
                      스튜디오 안내 및 문서 기본 표시 언어를 전환합니다.
                    </p>
                  </div>
                  <div className="flex items-center border border-[#CBC8BF] rounded-[2px] overflow-hidden shrink-0">
                    <button
                      type="button"
                      onClick={() => setLanguage('ko')}
                      className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        language === 'ko'
                          ? 'bg-[#000000] text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] text-[#52524E] hover:text-[#111111]'
                      }`}
                    >
                      한국어
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguage('en')}
                      className={`px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer border-l border-[#CBC8BF] ${
                        language === 'en'
                          ? 'bg-[#000000] text-[#FFFFFF]'
                          : 'bg-[#FFFFFF] text-[#52524E] hover:text-[#111111]'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: STORAGE & TEMPLATES */}
            {activeTab === 'storage' && (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] rounded-[2px]">
                    <div className="text-[11px] font-medium text-[#52524E]">로컬 사용량</div>
                    <div className="text-lg font-bold text-[#111111] mt-1 tabular-nums">{storageStats.formattedSize}</div>
                  </div>
                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] rounded-[2px]">
                    <div className="text-[11px] font-medium text-[#52524E]">보존 프로젝트</div>
                    <div className="text-lg font-bold text-[#111111] mt-1 tabular-nums">{storageStats.projectCount}건</div>
                  </div>
                  <div className="p-4 bg-[#F6F5F1] border border-[#E4E2DC] rounded-[2px]">
                    <div className="text-[11px] font-medium text-[#52524E]">자동 복구 스냅샷</div>
                    <div className="text-lg font-bold text-[#111111] mt-1 tabular-nums">{storageStats.autosaveCount}건</div>
                  </div>
                </div>

                {exportNotice && (
                  <div className="p-3 rounded-[2px] bg-[#F3F7F4] border border-[#1F5132]/30 text-[#1F5132] text-xs flex items-center gap-2">
                    <CheckCircle2 size={14} />
                    <span>전체 로컬 프로젝트 백업 파일이 다운로드되었습니다.</span>
                  </div>
                )}

                <div className="divide-y divide-[#E4E2DC] border-y border-[#E4E2DC]">
                  {onOpenTemplates && (
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-[#111111]">표준 기획서 템플릿 불러오기</div>
                        <p className="text-xs text-[#52524E] mt-0.5">검증된 표준 아키텍처 템플릿으로 새 기획서를 빠르게 시작합니다.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenTemplates();
                        }}
                        className="px-4 py-2 rounded-[2px] bg-[#111111] hover:bg-[#000000] text-[#FFFFFF] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <LayoutTemplate size={13} />
                        <span>템플릿 열기</span>
                      </button>
                    </div>
                  )}

                  {onOpenBackup && (
                    <div className="py-4 flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-bold text-[#111111]">프로젝트 보관함 및 복원</div>
                        <p className="text-xs text-[#52524E] mt-0.5">로컬 데이터베이스에 저장된 프로젝트 전환, 가져오기 및 내보내기를 관리합니다.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenBackup('storage');
                        }}
                        className="px-4 py-2 rounded-[2px] border border-[#111111] bg-[#FFFFFF] hover:bg-[#111111] hover:text-[#FFFFFF] text-[#111111] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <FolderOpen size={13} />
                        <span>보관함 열기</span>
                      </button>
                    </div>
                  )}

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[#111111]">전체 데이터 즉시 백업 다운로드</div>
                      <p className="text-xs text-[#52524E] mt-0.5">현재 브라우저에 저장된 모든 기획서 원고를 단일 백업 파일로 내보냅니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickExportBackup}
                      className="px-4 py-2 rounded-[2px] border border-[#CBC8BF] hover:border-[#000000] bg-[#FFFFFF] text-[#111111] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <Download size={13} />
                      <span>즉시 백업</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT & SESSION */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <div className="p-5 bg-[#F6F5F1] border border-[#E4E2DC] rounded-[2px] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-[2px] bg-[#000000] text-[#FFFFFF] font-display font-bold text-lg flex items-center justify-center shrink-0">
                      {(currentUserName || 'D')[0]}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#111111] truncate">
                        {currentUserName || '로컬 디렉터'}
                      </div>
                      <div className="text-xs text-[#52524E] mt-0.5">
                        {currentUserRole === 'ADMIN' ? '디렉터 · 로컬 독립 세션' : '게스트 · 로컬 세션'}
                      </div>
                    </div>
                  </div>

                  {onNavigateProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateProfile();
                      }}
                      className="px-4 py-2 rounded-[2px] bg-[#111111] hover:bg-[#000000] text-[#FFFFFF] text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      프로필 관리
                    </button>
                  )}
                </div>

                {onOpenLogout && (
                  <div className="pt-2 border-t border-[#E4E2DC] flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-[#111111]">현재 작업 세션 종료</div>
                      <p className="text-xs text-[#52524E] mt-0.5">로컬 데이터는 유지되며 입장 화면으로 안전하게 전환됩니다.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenLogout();
                      }}
                      className="px-4 py-2 rounded-[2px] border border-[#8B261D]/40 text-[#8B261D] hover:bg-[#FBF3F2] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <LogOut size={13} />
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-[#E4E2DC] bg-[#F6F5F1] flex items-center justify-between gap-3 shrink-0">
            {activeTab === 'engine' ? (
              <>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 bg-[#FFFFFF] border border-[#CBC8BF] hover:border-[#000000] text-[#111111] rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
                  <span>{isTesting ? '연결 테스트 중...' : '연결 테스트'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-[#52524E] hover:text-[#111111] text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEngine}
                    className="px-5 py-2 bg-[#000000] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                  >
                    저장하기
                  </button>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 bg-[#000000] hover:bg-[#2A2A28] text-[#FFFFFF] text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
