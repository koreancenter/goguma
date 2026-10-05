export type AIProvider = 'gemini' | 'ollama';

export interface AISettings {
  provider: AIProvider;
  gemini: {
    apiKey: string; // Personal BYOK key
    model: string;  // e.g. 'gemini-3.8-flash', 'gemini-2.5-flash'
  };
  ollama: {
    endpoint: string; // default 'http://localhost:11434'
    model: string;    // e.g. 'llama3.2', 'qwen2.5:7b', 'mistral'
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
    model: 'llama3.2',
  },
};

const STORAGE_KEY = 'goguma_ai_settings';

export function getAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_SETTINGS;
    const parsed = JSON.parse(raw);
    const provider: AIProvider = (parsed.provider === 'ollama') ? 'ollama' : 'gemini';

    return {
      provider,
      gemini: {
        apiKey: parsed.gemini?.apiKey || '',
        model: parsed.gemini?.model || 'gemini-3.8-flash',
      },
      ollama: {
        endpoint: parsed.ollama?.endpoint || 'http://localhost:11434',
        model: parsed.ollama?.model || 'llama3.2',
      },
    };
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAISettings(settings: AISettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('ai_settings_changed', { detail: settings }));
  } catch (err) {
    console.error('Failed to save AI settings to localStorage:', err);
  }
}
