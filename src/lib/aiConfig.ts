export type AIProvider = 'gemini' | 'ollama' | 'webllm';

export interface AISettings {
  provider: AIProvider;
  gemini: {
    apiKey: string; // Personal BYOK key
    model: string;  // e.g. 'gemini-3.8-flash', 'gemini-2.5-flash'
  };
  ollama: {
    endpoint: string; // default 'http://localhost:11434'
    model: string;    // e.g. 'qwen2.5-coder', 'llama3.2', 'mistral'
  };
  webllm: {
    model: string;    // e.g. 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC'
  };
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'gemini',
  gemini: {
    apiKey: '',
    model: 'gemini-3.8-flash',
  },
  ollama: {
    endpoint: 'http://localhost:11434',
    model: 'qwen2.5-coder',
  },
  webllm: {
    model: 'Qwen2.5-Coder-1.5B',
  },
};

export function getActiveAILabel(settings: AISettings): string {
  if (settings.provider === 'ollama') {
    return `Ollama Local (${settings.ollama.model || 'qwen2.5-coder'})`;
  }
  if (settings.provider === 'webllm') {
    return 'WebLLM In-Browser';
  }
  // Default: Gemini
  const modelName = settings.gemini.model.includes('3.8') 
    ? 'Gemini 3.8-Flash' 
    : settings.gemini.model.includes('pro') 
    ? 'Gemini 2.5-Pro' 
    : 'Gemini 2.5-Flash';
  const byokTag = settings.gemini.apiKey ? ' (BYOK)' : ' (Server)';
  return `${modelName}${byokTag}`;
}

const STORAGE_KEY = 'goguma_ai_settings';
const KEY_PREFIX = 'enc_k_';

function obfuscateKey(key: string): string {
  if (!key) return '';
  if (key.startsWith(KEY_PREFIX)) return key;
  try {
    const encoded = btoa(encodeURIComponent(key.trim()));
    const reversed = encoded.split('').reverse().join('');
    return `${KEY_PREFIX}${reversed}`;
  } catch {
    return key;
  }
}

function deobfuscateKey(stored: string): string {
  if (!stored) return '';
  if (!stored.startsWith(KEY_PREFIX)) return stored;
  try {
    const raw = stored.slice(KEY_PREFIX.length);
    const unreversed = raw.split('').reverse().join('');
    return decodeURIComponent(atob(unreversed));
  } catch {
    return stored;
  }
}

export function getAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw);
    const provider: AIProvider = (parsed.provider === 'ollama') 
      ? 'ollama' 
      : (parsed.provider === 'webllm') 
      ? 'webllm' 
      : 'gemini';
    const rawApiKey = parsed.gemini?.apiKey || '';

    return {
      provider,
      gemini: {
        apiKey: deobfuscateKey(rawApiKey),
        model: parsed.gemini?.model || 'gemini-3.8-flash',
      },
      ollama: {
        endpoint: parsed.ollama?.endpoint || 'http://localhost:11434',
        model: parsed.ollama?.model || 'qwen2.5-coder',
      },
      webllm: {
        model: parsed.webllm?.model || 'Qwen2.5-Coder-1.5B',
      },
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAISettings(settings: AISettings): void {
  try {
    const safeSettings = {
      ...settings,
      gemini: {
        ...settings.gemini,
        apiKey: obfuscateKey(settings.gemini?.apiKey || ''),
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeSettings));
    window.dispatchEvent(new CustomEvent('ai_settings_changed', { detail: settings }));
  } catch (err) {
    console.error('Failed to save AI settings to localStorage:', err);
  }
}
