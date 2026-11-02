import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, HardDrive, CheckCircle2, AlertCircle, 
  RefreshCw, X, Eye, EyeOff, Server, Shield, Cpu
} from 'lucide-react';
import { AISettings, getAISettings, saveAISettings } from '../../lib/aiConfig';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>(getAISettings);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [fetchingOllama, setFetchingOllama] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getAISettings());
      setTestResult(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveAISettings(settings);
    setTestResult({ success: true, message: 'Settings saved successfully' });
    setTimeout(() => {
      onClose();
    }, 600);
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
        setTestResult({ success: true, message: `Connected! Found ${models.length} installed model(s).` });
      } else {
        setTestResult({ success: false, message: 'Ollama is running, but no models are installed. Run e.g. "ollama run llama3.2".' });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Cannot reach Ollama. Check if Ollama is running (`ollama serve`).'
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
          throw new Error(data.error || `Failed with status ${res.status}`);
        }
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Gemini connected successfully! Response: "${(data.text || '').trim().slice(0, 30)}"`
        });
      } else {
        // Ollama test
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
          throw new Error(data.error || `HTTP ${res.status}. Check if endpoint is running and CORS is enabled.`);
        }

        const data = await res.json();
        setTestResult({
          success: true,
          message: `Ollama inference succeeded! Response: "${(data.text || '').trim().slice(0, 50)}"`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed. Check settings and retry.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 6 }}
          className="w-full max-w-lg h-[540px] bg-[#111116] rounded-[2px] shadow-2xl border border-[#23232A] overflow-hidden flex flex-col text-[#F5F3ED] font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#23232A] flex items-center justify-between bg-[#0E0E12] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[2px] bg-[#141418] border border-[#23232A] text-[#C5A880] flex items-center justify-center font-bold shadow-xs shrink-0">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#F5F3ED] uppercase tracking-wide">
                  AI 인퍼런스 엔진 설정
                </h3>
                <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">
                  클라우드 Gemini 또는 로컬 오프라인 Ollama
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[2px] text-[#8E8B82] hover:text-[#F5F3ED] hover:bg-[#141418] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-6 space-y-5 bg-[#111116] overflow-y-auto custom-scroll">
            {/* Provider Selection */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-[#8E8B82] mb-2">
                ACTIVE PROVIDER
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, provider: 'gemini' }))}
                  className={`p-3.5 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    settings.provider === 'gemini'
                      ? 'border-[#C5A880] bg-[#16161F]'
                      : 'border-[#23232A] bg-[#141418] hover:bg-[#181820]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-[2px] bg-[#141418] text-[#C5A880] border border-[#23232A]">
                      <Cpu size={14} />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#141418] text-[#B8B5AC] border border-[#23232A] uppercase">
                      Cloud
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F3ED]">Google Gemini</div>
                    <div className="text-[11px] text-[#8E8B82] mt-0.5">서버 프록시 / BYOK 키</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, provider: 'ollama' }))}
                  className={`p-3.5 rounded-[2px] border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    settings.provider === 'ollama'
                      ? 'border-[#C5A880] bg-[#16161F]'
                      : 'border-[#23232A] bg-[#141418] hover:bg-[#181820]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="p-1.5 rounded-[2px] bg-[#141418] text-[#C5A880] border border-[#23232A]">
                      <HardDrive size={14} />
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] bg-[#141418] text-[#B8B5AC] border border-[#23232A] uppercase">
                      Local Offline
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#F5F3ED]">Ollama Local Engine</div>
                    <div className="text-[11px] text-[#8E8B82] mt-0.5">로컬 독립 구동 LLM</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Gemini Configuration Panel */}
            {settings.provider === 'gemini' && (
              <div className="space-y-4 p-4 rounded-[2px] bg-[#141418] border border-[#23232A]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={13} className="text-[#C5A880]" />
                    <span>개인 Gemini API Key (선택 BYOK)</span>
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#C5A880] hover:underline font-mono"
                  >
                    Get Free Key ↗
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="비워둘 시 서버 기본 키 사용, 또는 AIzaSy..."
                    value={settings.gemini.apiKey}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      gemini: { ...s.gemini, apiKey: e.target.value }
                    }))}
                    className="w-full pl-3 pr-9 py-2 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:outline-none focus:border-[#C5A880]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8B82] hover:text-[#F5F3ED] cursor-pointer"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-[#8E8B82] leading-relaxed font-sans">
                  개인 API 키는 브라우저 로컬 스토리지에만 보관됩니다.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider mb-1.5">
                    Gemini Model
                  </label>
                  <select
                    value={settings.gemini.model}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      gemini: { ...s.gemini, model: e.target.value }
                    }))}
                    className="w-full px-3 py-2 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:outline-none focus:border-[#C5A880] cursor-pointer"
                  >
                    <option value="gemini-3.8-flash" className="bg-[#141418] text-[#F5F3ED]">gemini-3.8-flash (Recommended, Fast & Smart)</option>
                    <option value="gemini-2.5-flash" className="bg-[#141418] text-[#F5F3ED]">gemini-2.5-flash (Ultra Fast)</option>
                    <option value="gemini-2.5-pro" className="bg-[#141418] text-[#F5F3ED]">gemini-2.5-pro (Deep Reasoning)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Ollama Configuration Panel */}
            {settings.provider === 'ollama' && (
              <div className="space-y-4 p-4 rounded-[2px] bg-[#141418] border border-[#23232A]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider flex items-center gap-1.5">
                    <Server size={13} className="text-[#C5A880]" />
                    <span>Ollama Local Server Endpoint</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchOllamaModels}
                    disabled={fetchingOllama}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C5A880] hover:text-[#D4B992] cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={fetchingOllama ? 'animate-spin' : ''} />
                    <span>Scan Models</span>
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
                    className="w-full px-3 py-2 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:outline-none focus:border-[#C5A880]"
                  />
                  <p className="text-[11px] text-[#8E8B82] mt-1">
                    기본 로컬 엔드포인트: <code className="font-mono text-[#C5A880] bg-[#0E0E12] px-1 py-0.5 rounded-[2px] border border-[#23232A]">http://localhost:11434</code>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F3ED] uppercase tracking-wider mb-1.5">
                    Ollama Model Name
                  </label>
                  {availableOllamaModels.length > 0 ? (
                    <select
                      value={settings.ollama.model}
                      onChange={(e) => setSettings(s => ({
                        ...s,
                        ollama: { ...s.ollama, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:outline-none focus:border-[#C5A880] cursor-pointer"
                    >
                      {availableOllamaModels.map(m => (
                        <option key={m} value={m} className="bg-[#141418] text-[#F5F3ED]">{m}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. llama3.2, mistral, qwen2.5:7b, deepseek-r1"
                      value={settings.ollama.model}
                      onChange={(e) => setSettings(s => ({
                        ...s,
                        ollama: { ...s.ollama, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 bg-[#0E0E12] border border-[#23232A] rounded-[2px] text-xs font-mono text-[#F5F3ED] focus:outline-none focus:border-[#C5A880]"
                    />
                  )}
                  <p className="text-[11px] text-[#8E8B82] mt-1">
                    권장 모델: <span className="font-mono text-[#F5F3ED]">llama3.2</span>, <span className="font-mono text-[#F5F3ED]">qwen2.5:7b</span>, <span className="font-mono text-[#F5F3ED]">mistral</span>
                  </p>
                </div>
              </div>
            )}

            {/* Test result banner */}
            {testResult && (
              <div
                className={`p-3 rounded-[2px] text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-[#16221A] text-[#93D7AC] border-[#2D4A38]'
                    : 'bg-red-950/40 text-red-300 border-red-500/30'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={15} className="text-[#93D7AC] shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed break-words flex-1 font-mono">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="px-6 py-3.5 border-t border-[#23232A] bg-[#0E0E12] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-1.5 bg-[#141418] border border-[#23232A] hover:bg-[#1A1A22] text-[#B8B5AC] hover:text-[#F5F3ED] rounded-[2px] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={12} className={isTesting ? 'animate-spin' : ''} />
              <span>{isTesting ? '연결 테스트 중...' : '연결 테스트'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-[#8E8B82] hover:text-[#F5F3ED] text-xs font-medium rounded-[2px] hover:bg-[#141418] transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#C5A880] hover:bg-[#D4B992] text-[#0A0A0C] text-xs font-semibold rounded-[2px] shadow-xs transition-colors cursor-pointer"
              >
                저장하기
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
