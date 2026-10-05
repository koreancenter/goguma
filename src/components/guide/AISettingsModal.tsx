import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Key, HardDrive, CheckCircle2, AlertCircle, 
  RefreshCw, X, Eye, EyeOff, Server, Shield
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
        message: err.message || 'Connection test failed. Check settings and try again.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-fuchsia-50 text-goguma flex items-center justify-center border border-fuchsia-100">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Engine & Provider Settings</h3>
                <p className="text-xs text-slate-500">Configure Cloud Gemini API or Local Ollama</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Select AI Engine Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Gemini BYOK */}
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, provider: 'gemini' }))}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    settings.provider === 'gemini'
                      ? 'border-goguma bg-fuchsia-50/40 ring-1 ring-goguma shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${settings.provider === 'gemini' ? 'bg-goguma text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Sparkles size={16} />
                    </div>
                    {settings.gemini.apiKey && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-fuchsia-100 text-goguma uppercase">
                        Key Set
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Google Gemini</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Cloud API (Default / BYOK)</div>
                  </div>
                </button>

                {/* 2. Ollama Local */}
                <button
                  type="button"
                  onClick={() => setSettings(s => ({ ...s, provider: 'ollama' }))}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all ${
                    settings.provider === 'ollama'
                      ? 'border-goguma bg-fuchsia-50/40 ring-1 ring-goguma shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${settings.provider === 'ollama' ? 'bg-goguma text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <HardDrive size={16} />
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      Local Offline
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">Ollama Local Engine</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Desktop Self-Hosted LLM</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Gemini Configuration Panel */}
            {settings.provider === 'gemini' && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50/60 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={14} className="text-goguma" />
                    Personal Gemini API Key (Optional BYOK)
                  </span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-goguma hover:underline font-semibold"
                  >
                    Get Free Key
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    placeholder="Leave empty to use server default, or enter AIzaSy..."
                    value={settings.gemini.apiKey}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      gemini: { ...s.gemini, apiKey: e.target.value }
                    }))}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-goguma/20 focus:border-goguma"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Your personal key is stored safely in your browser storage only.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Gemini Model
                  </label>
                  <select
                    value={settings.gemini.model}
                    onChange={(e) => setSettings(s => ({
                      ...s,
                      gemini: { ...s.gemini, model: e.target.value }
                    }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-goguma/20 focus:border-goguma"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended, Fast & Smart)</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash (Ultra Fast)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Ollama Configuration Panel */}
            {settings.provider === 'ollama' && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50/60 border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Server size={14} className="text-goguma" />
                    Ollama Local Server Endpoint
                  </span>
                  <button
                    type="button"
                    onClick={handleFetchOllamaModels}
                    disabled={fetchingOllama}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-goguma hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={11} className={fetchingOllama ? 'animate-spin' : ''} />
                    Scan Installed Models
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-goguma/20 focus:border-goguma"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Standard local endpoint is <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">http://localhost:11434</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Ollama Model Name
                  </label>
                  {availableOllamaModels.length > 0 ? (
                    <select
                      value={settings.ollama.model}
                      onChange={(e) => setSettings(s => ({
                        ...s,
                        ollama: { ...s.ollama, model: e.target.value }
                      }))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-goguma/20 focus:border-goguma"
                    >
                      {availableOllamaModels.map(m => (
                        <option key={m} value={m}>{m}</option>
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
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-goguma/20 focus:border-goguma"
                    />
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">
                    Recommended models include <span className="font-semibold text-slate-700">llama3.2</span>, <span className="font-semibold text-slate-700">qwen2.5:7b</span>, or <span className="font-semibold text-slate-700">mistral</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Test result banner */}
            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                    : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed break-words flex-1">{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={isTesting ? 'animate-spin' : ''} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-goguma text-white text-xs font-semibold rounded-xl hover:bg-fuchsia-950 transition-colors shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
