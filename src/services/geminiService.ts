import { Type } from "@google/genai";
import { ScreenNode, Language, SitePlan } from "../types";
import { logApiCall } from "./loggingService";
import { getAISettings } from "../lib/aiConfig";
import { extractDominantColorsFromImage } from "../lib/colorExtractor";
import { generateLocalSlug } from "../lib/slugify";
import { compileLocalProjectProposal } from "../lib/proposalCompiler";
import { compileLocalSEOData, decomposeLocalScreenStructure } from "../lib/deterministicArchitect";

function convertToOllamaMessages(contents: any, systemInstruction?: string) {
  const messages: Array<{ role: string; content: string; images?: string[] }> = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: typeof systemInstruction === 'string' ? systemInstruction : JSON.stringify(systemInstruction) });
  }

  const parsePart = (p: any, images: string[]) => {
    if (typeof p === 'string') return p;
    if (p?.text) return p.text;
    if (p?.inlineData?.data) {
      images.push(p.inlineData.data);
    }
    return '';
  };

  if (typeof contents === 'string') {
    messages.push({ role: 'user', content: contents });
  } else if (Array.isArray(contents)) {
    for (const item of contents) {
      if (typeof item === 'string') {
        messages.push({ role: 'user', content: item });
      } else if (item && typeof item === 'object') {
        const role = item.role === 'model' ? 'assistant' : (item.role || 'user');
        const images: string[] = [];
        let textContent = '';
        if (Array.isArray(item.parts)) {
          textContent = item.parts.map((p: any) => parsePart(p, images)).filter(Boolean).join('\n');
        } else if (typeof item.text === 'string') {
          textContent = item.text;
        } else {
          textContent = JSON.stringify(item);
        }
        messages.push({ role, content: textContent, ...(images.length > 0 ? { images } : {}) });
      }
    }
  } else if (contents && typeof contents === 'object') {
    const images: string[] = [];
    let text = '';
    if (Array.isArray(contents.parts)) {
      text = contents.parts.map((p: any) => parsePart(p, images)).filter(Boolean).join('\n');
    } else {
      text = JSON.stringify(contents);
    }
    messages.push({ role: 'user', content: text, ...(images.length > 0 ? { images } : {}) });
  }

  if (messages.length === 0) {
    messages.push({ role: 'user', content: 'Hello' });
  }
  return messages;
}

const ai = {
  models: {
    generateContent: async (payload: any, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB') => {
      const { model: requestedModel, contents, config } = typeof payload === 'string' ? { contents: payload, model: undefined, config: undefined } : payload;
      const settings = getAISettings();

      if (settings.provider === 'ollama') {
        const messages = convertToOllamaMessages(contents, config?.systemInstruction);
        const isJson = config?.responseMimeType === 'application/json' || !!config?.responseSchema;
        
        const response = await fetch('/api/ollama/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: settings.ollama.endpoint,
            model: settings.ollama.model,
            messages,
            stream: false,
            format: isJson ? 'json' : undefined
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Ollama API failed with status ${response.status}`);
        }

        const data = await response.json();
        return { text: data.text || '' };
      }

      // Default: Gemini (with BYOK support)
      const model = settings.gemini.model || requestedModel || "gemini-3.8-flash";
      const apiKey = settings.gemini.apiKey?.trim() || undefined;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, contents, config, apiKey })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Gemini API call failed with status ${response.status}`);
          } catch (e: any) {
            throw new Error(e.message || `Gemini API call failed with status ${response.status}`);
          }
        } else {
          const rawText = await response.text();
          // Filter plain-text error or clean up HTML summary
          const message = rawText.includes('<!DOCTYPE') || rawText.includes('<!doctype')
            ? `Server error page (${response.status})`
            : rawText.slice(0, 150);
          throw new Error(message || `Gemini API call failed with status ${response.status}`);
        }
      }
      
      return await response.json();
    },

    generateContentStream: async (
      payload: any,
      onChunk: (chunk: string) => void,
      mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION'
    ) => {
      const { model: requestedModel, contents, config } = typeof payload === 'string' ? { contents: payload, model: undefined, config: undefined } : payload;
      const settings = getAISettings();

      if (settings.provider === 'ollama') {
        const messages = convertToOllamaMessages(contents, config?.systemInstruction);
        const isJson = config?.responseMimeType === 'application/json' || !!config?.responseSchema;

        const response = await fetch('/api/ollama/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: settings.ollama.endpoint,
            model: settings.ollama.model,
            messages,
            stream: true,
            format: isJson ? 'json' : undefined
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Ollama streaming request failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No readable stream in Ollama response");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                onChunk(parsed.text);
              }
            } catch (e) {
              // Ignore parse errors on partial chunks
            }
          }
        }
        return;
      }

      // Default: Gemini (with BYOK support)
      const model = settings.gemini.model || requestedModel || "gemini-3.8-flash";
      const apiKey = settings.gemini.apiKey?.trim() || undefined;

      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, contents, config, apiKey })
      });

      if (!response.ok) {
        throw new Error(`Gemini streaming request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No readable stream in response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const dataStr = trimmed.slice(6);
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              onChunk(parsed.text);
            }
          } catch (e) {
            // non-JSON or partial
          }
        }
      }
    }
  }
};

async function callGeminiWithRetry<T>(
  fn: () => Promise<T>, 
  userId?: string,
  retries = 3, 
  delay = 1000
): Promise<T> {
  try {
    const result = await fn();
    // Track successful API calls with userId
    logApiCall(userId).catch(console.error);
    return result;
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || 
                        error?.message?.toLowerCase().includes('rate limit') ||
                        error?.status === 429;
    
    if (isRateLimit && retries > 0) {
      console.warn(`Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(fn, userId, retries - 1, delay * 2);
    }
    
    if (isRateLimit) {
      console.error("Gemini API Rate Limit Exceeded after retries.");
      throw new Error('GEMINI_RATE_LIMIT_EXCEEDED');
    }
    throw error;
  }
}

export async function extractColorsFromLogo(base64Image: string, _mimeType: string = 'image/png', _userId?: string, _mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION'): Promise<string[]> {
  try {
    // 100% Client-Side Canvas Color Extraction (Zero AI cost, zero rate limits, sub-20ms execution)
    const colors = await extractDominantColorsFromImage(base64Image, 5);
    return colors;
  } catch (error: any) {
    console.error("Local color extraction fallback:", error);
    return ['#4F46E5', '#F97316', '#10B981', '#06B6D4', '#64748B'];
  }
}

export async function refinePageScript(script: string, projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const isGenerating = !script || script.trim() === "";
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'App UX Writer and Mobile content creator' : 'Web copywriter and writing assistant'}. 
        ${isGenerating 
          ? `Based on the 'Project Overview' below, please generate a full professional ${platform === 'APP' ? 'Mobile App screen content' : 'page script/content'} in ${lang === 'ko' ? 'Korean' : 'English'}.` 
          : `Based on the 'Project Overview' below, please refine and polish the '${platform === 'APP' ? 'Screen' : 'Page'} Script' provided by the user to be more professional and aligned with its purpose in ${lang === 'ko' ? 'Korean' : 'English'}.`
        }
        
        [Project Overview]
        ${projectContext}
        
        ${isGenerating ? "" : `[Current ${platform === 'APP' ? 'Screen' : 'Page'} Script]\n${script}`}
        
        Requirements:
        1. Maintain the overall tone and manner of the ${platform === 'APP' ? 'App' : 'Site'}.
        2. Improve readability and smooth out the sentences.
        3. Use a professional tone ${platform === 'APP' ? 'optimized for mobile reading' : 'that builds trust with visitors'}.
        4. Return only the ${isGenerating ? "generated" : "refined"} script text in ${lang === 'ko' ? 'Korean' : 'English'}. Omit any additional explanation.
      `,
    }, mode, platform), userId);

    return response.text || script;
  } catch (error: any) {
    console.error("Error refining script:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return script;
  }
}

export async function recommendReferences(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'Mobile App' : 'Web'} planner and trend analyst. 
        Referencing the 'Project Overview' below, please recommend 3 domestic or international ${platform === 'APP' ? 'Mobile Apps' : 'Websites'} that are good for benchmarking.
        
        [Project Overview]
        ${projectContext}
        
        For each ${platform === 'APP' ? 'App' : 'Site'}, please write in ${lang === 'ko' ? 'Korean' : 'English'} including:
        1. ${platform === 'APP' ? 'App Name and Store URL (or search keywords)' : 'Site Name and URL (or search keywords)'}
        2. Key Features
        3. Reason for recommendation (how it aligns with this project)
        4. Specific ideas that would be good to apply to our ${platform === 'APP' ? 'App UI/UX' : 'Homepage'}
        
        Please format with bullet points and subheadings for better readability.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    }, mode, platform), userId);

    return response.text || "Failed to retrieve recommendation information.";
  } catch (error: any) {
    console.error("Error recommending references:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "An error occurred during recommendation.";
  }
}

export async function analyzeBenchmarkSite(url: string, projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'Mobile App UI/UX' : 'Web UI/UX'} analyst. 
        Analyze the benchmark ${platform === 'APP' ? 'App' : 'Site'} provided below and suggest how it could help the project currently being prepared.
        
        [Benchmark ${platform === 'APP' ? 'App' : 'Site'}]
        ${url}
        
        [Our Project Overview]
        ${projectContext}
        
        Please analyze in ${lang === 'ko' ? 'Korean' : 'English'} including the following:
        1. Design and functional strengths of the ${platform === 'APP' ? 'App' : 'Site'}
        2. Implications compared to our project's purpose/target
        3. 3 core elements that must be benchmarked from this ${platform === 'APP' ? 'App' : 'Site'}
        4. Points to watch out for or differentiation strategies
        
        Please write in a professional yet easy-to-understand manner.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    }, mode, platform), userId);

    return response.text || "Failed to retrieve analysis information.";
  } catch (error: any) {
    console.error("Error analyzing benchmark site:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "An error occurred during analysis.";
  }
}

export async function recommendMenus(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string[]> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'App' : 'Web'} planner. 
        Referencing the 'Project Overview' below, please recommend the most suitable ${platform === 'APP' ? 'Navigation Structure (Bottom Tabs or Sidebar)' : 'Global Navigation Bar (GNB) structure'} for this ${platform === 'APP' ? 'Application' : 'Website'}.
        
        [Project Overview]
        ${projectContext}
        
        Requirements:
        1. Select 4-6 ${platform === 'APP' ? 'Tabs/Functions' : 'Menus'} that best align with the site's purpose and target.
        2. Write the names in ${lang === 'ko' ? 'Korean' : 'English'}.
        3. Return the result ONLY as a JSON string array. (e.g., ["Home", "About", "Profile", "Settings"])
        4. Absolutely do not include any additional explanation or text.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error recommending menus:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return [];
  }
}

export interface RecommendedGrid {
  titles: string[];
  columns: number[];
  contentTypes: string[][];
}

export async function recommendSectionGrid(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<RecommendedGrid> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'App UI/UX designer and Mobile' : 'UI/UX designer and web'} planner.
        Based on the 'Project Planning Data' below, please recommend the most effective ${platform === 'APP' ? 'Main Screen structure' : 'home page section structure (Grid System)'}.
        
        [Project Planning Data]
        ${projectContext}
 
        Requirements:
        1. Recommend 4-6 sections for the ${platform === 'APP' ? 'Primary screen' : 'main landing page'}.
        2. For each section, provide:
           - title: A descriptive ${lang === 'ko' ? 'Korean' : 'English'} title.
           - columns: Number of columns for this section (${platform === 'APP' ? 'Usually 1 or 2 for mobile' : '1, 2, 3, or 4'}).
           - contentTypes: An array of content types for each column (either "text" or "image"). Length should match columns.
        3. Return ONLY a JSON object with the keys 'titles', 'columns', and 'contentTypes'.
        4. Omit any additional explanation.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titles: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            columns: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER }
            },
            contentTypes: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          },
          required: ["titles", "columns", "contentTypes"],
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return { titles: ["Home"], columns: [1], contentTypes: [["text"]] };
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error recommending grid:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return { titles: ["Home"], columns: [1], contentTypes: [["text"]] };
  }
}

export async function translateToEnglishSlug(text: string, _userId?: string, _mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', _platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  // Deterministic local slug translation: instant, zero network/AI dependency, zero rate limits
  try {
    const slug = generateLocalSlug(text);
    return slug || text.toLowerCase().replace(/[^a-z0-9-]/g, '');
  } catch (error) {
    return text.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }
}

export async function generateProjectStrategy(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a senior strategist and creative director at a global agency.
        Based on a comprehensive analysis of the 'Project Planning Data' below, please propose 'Site Production Directions and Ideas' for the success of this project.
        
        [Project Planning Data]
        ${projectContext}
        
        Target Platform: ${platform}
        
        The proposal should include the following (written in ${lang === 'ko' ? 'Korean' : 'English'}):
        1. Core Strategic Keywords: 3 core keywords that define this project
        2. Production Direction: Specific structure and flow suggestions to captivate target users, optimized for ${platform === 'APP' ? 'Mobile App Experience' : 'Web Application Experience'}.
        3. Reflecting Latest Trends: Elements that would be good to apply based on ${platform}.
           - If Web: Suggest Web-specific trends like Bento Grid, Micro-interactions, Minimalist Editorial, or Web-based AI-driven UX.
           - If App: Suggest App-specific trends like Gesture-based navigation, Bottom-tab IA, PWA features, or Edge-to-edge layouts (Safe Areas).
        4. Technical Recommendations:
           - If Web: Focus on Browser compatibility, Page Speed (LCP), SEO, and Desktop/Mobile responsiveness.
           - If App: Focus on Native-like feel, Offline support, Touch feedback, and App Store guidelines.
        5. Differentiation Points: One-of-a-kind ideas that can differentiate from competitors or benchmark sites.
        
        Please write professionally using subheadings and bullet points for high readability.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    }, mode, platform), userId);

    return response.text || "Failed to generate ideas.";
  } catch (error: any) {
    console.error("Error generating strategy:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "An error occurred during strategy generation.";
  }
}

export async function generateSEOData(pageName: string, pageScript: string, projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<{ title: string, description: string, keywords: string }> {
  // Always prepare local deterministic SEO baseline first (0ms latency, privacy-first)
  const localSEO = compileLocalSEOData(pageName, pageScript, projectContext, lang, platform);

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are an SEO expert. Based on the page information below, please generate SEO meta title, description, and keywords in ${lang === 'ko' ? 'Korean' : 'English'}.
        
        [Page Name]
        ${pageName}
        
        [Page Content/Script]
        ${pageScript}
        
        [Project Context]
        ${projectContext}
        
        Target Platform: ${platform}
        
        Requirements:
        1. Title: Compelling, under 60 chars.
        2. Description: Professional, under 160 chars.
        3. Keywords: 5-8 relevant keywords separated by commas.
        4. Return ONLY a JSON object with 'title', 'description', and 'keywords' keys.
        5. Omit any additional explanation.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            keywords: { type: Type.STRING },
          },
          required: ["title", "description", "keywords"],
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return localSEO;
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error generating SEO data, falling back to local deterministic SEO:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return localSEO;
  }
}

export async function generateSingleSEOField(fieldName: 'title' | 'description' | 'keywords' | 'metaDescription', pageName: string, pageScript: string, projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  const localSEO = compileLocalSEOData(pageName, pageScript, projectContext, lang, platform);
  const localValue = fieldName === 'title' ? localSEO.title : (fieldName === 'keywords' ? localSEO.keywords : localSEO.description);

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are an SEO expert. Based on the page information below, please generate a high-quality SEO ${fieldName === 'metaDescription' ? 'description' : fieldName} in ${lang === 'ko' ? 'Korean' : 'English'}.
        
        [Page Name]
        ${pageName}
        
        [Page Content/Script]
        ${pageScript}
        
        [Project Context]
        ${projectContext}
        
        Target Platform: ${platform}
        
        Requirements for ${fieldName === 'metaDescription' ? 'description' : fieldName}:
        ${fieldName === 'title' ? 'Compelling title, under 60 characters, including the most important keyword.' : ''}
        ${(fieldName === 'description' || fieldName === 'metaDescription') ? 'Professional description, under 160 characters, that encourages clicks.' : ''}
        ${fieldName === 'keywords' ? '5-8 relevant keywords separated by commas.' : ''}
        
        Return ONLY the suggested ${fieldName === 'metaDescription' ? 'description' : fieldName} text in ${lang === 'ko' ? 'Korean' : 'English'}. No explanation or JSON formatting.
      `,
    }, mode, platform), userId);

    return (response.text || localValue).trim();
  } catch (error: any) {
    console.error(`Error generating SEO ${fieldName}, falling back to local value:`, error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return localValue;
  }
}

export async function generateRoadmap(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional project manager and IT consultant.
        Based on the 'Project Planning Data' below, please propose a realistic '${platform === 'APP' ? 'App Development' : 'Website Development'} Roadmap'.
        
        [Project Planning Data]
        ${projectContext}
        
        Requirements:
        1. Create a roadmap consisting of 5-8 major tasks/phases.
        2. Group tasks into categories like: Discovery, Planning, Design, Development, Testing, Launch.
        3. Use ${lang === 'ko' ? 'Korean' : 'English'} for category names and task names.
        4. For each task, specify a start month and an end month (represented by numbers 1-12 or month names in ${lang === 'ko' ? 'Korean like 1월, 2월' : 'English like Jan, Feb'}).
        5. Assign a responsible role/person for each task in ${lang === 'ko' ? 'Korean' : 'English'}.
        6. Format each line EXACTLY as follows for parsing:
           Category: Task Name [StartMonth - EndMonth] {Responsible Role}
           example (English):
           Discovery: Market Research [Jan - Feb] {Product Manager}
           example (Korean):
           분석: 시장 조사 [1월 - 2월] {프로젝트 매니저}
        7. Return ONLY the roadmap list using the format above. No other text.
      `,
    }, mode, platform), userId);

    return response.text || "Failed to generate roadmap.";
  } catch (error: any) {
    console.error("Error generating roadmap:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "";
  }
}

export async function generateAiCriticism(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a world-class white-hat hacker and elite system architect.
        Your task is to ruthlessly critique the user's project idea for a ${platform} platform. "Explain exactly why this project is bound to fail" from at least 5 perspectives: 
        1. Security (Vulnerabilities, data leaks, attack vectors)
        2. Scalability (Architectural bottlenecks, performance limits)
        3. Cost (Economic viability, hidden infra costs, maintenance burden)
        4. UX (User friction, cognitive load, logic flaws ${platform === 'APP' ? 'specific to mobile context' : 'specific to web context'})
        5. Data Alignment (Information silos, data consistency, reporting failures)
        
        Guidelines:
        - Omit all "half-baked praise" or "flattery". 
        - Focus solely on data-driven and logic-based harsh evaluation (Toxic/Ruthless Critique).
        - For each failure point, provide a cynical but accurate "Risk Rating" (1-10) and a "Brutally Honest Reality Check".
        - Finally, provide a "Survival Directive" - what MUST be changed immediately if they want to avoid total failure.
        
        [Project Planning Data]
        ${projectContext}
        
        Tone: Ruthless, data-driven, cynical, authoritative, and brutally honest.
        Write the report in a clear, formatted manner in ${lang === 'ko' ? 'Korean' : 'English'}.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    }, mode, platform), userId);

    return response.text || "Failed to generate criticism.";
  } catch (error: any) {
    console.error("Error generating AI criticism:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "An error occurred during AI criticism generation.";
  }
}

export async function streamAiCriticism(
  projectContext: string, 
  onChunk: (chunk: string) => void,
  lang: Language = 'en', 
  userId?: string, 
  mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', 
  platform: 'WEB' | 'APP' = 'WEB'
): Promise<void> {
  try {
    await ai.models.generateContentStream({
      contents: `
        You are a world-class white-hat hacker and elite system architect.
        Your task is to ruthlessly critique the user's project idea for a ${platform} platform. "Explain exactly why this project is bound to fail" from at least 5 perspectives: 
        1. Security (Vulnerabilities, data leaks, attack vectors)
        2. Scalability (Architectural bottlenecks, performance limits)
        3. Cost (Economic viability, hidden infra costs, maintenance burden)
        4. UX (User friction, cognitive load, logic flaws ${platform === 'APP' ? 'specific to mobile context' : 'specific to web context'})
        5. Data Alignment (Information silos, data consistency, reporting failures)
        
        Guidelines:
        - Omit all "half-baked praise" or "flattery". 
        - Focus solely on data-driven and logic-based harsh evaluation (Toxic/Ruthless Critique).
        - For each failure point, provide a cynical but accurate "Risk Rating" (1-10) and a "Brutally Honest Reality Check".
        - Finally, provide a "Survival Directive" - what MUST be changed immediately if they want to avoid total failure.
        
        [Project Planning Data]
        ${projectContext}
        
        Tone: Ruthless, data-driven, cynical, authoritative, and brutally honest.
        Write the report in a clear, formatted manner in ${lang === 'ko' ? 'Korean' : 'English'}.
      `,
    }, onChunk, mode);

    if (userId) {
      logApiCall(userId).catch(console.error);
    }
  } catch (error: any) {
    console.error("Error streaming AI criticism:", error);
    throw error;
  }
}

export async function recommendTechStack(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a specialized CTO and tech architect. 
        Your goal is to recommend the absolute best technology stack for a ${platform === 'APP' ? 'Mobile App' : 'Web'} project based on the context provided below.
        
        [Project Context]
        ${projectContext}
        
        Requirements for ${platform}:
        - If APP: Suggest React Native, Expo, Flutter, or Native (Swift/Kotlin) based on context. Mention PWA if appropriate.
        - If WEB: Suggest React+Vite, Next.js, or and modern frontend tools. 
        - Backend: Recommend Cloud-native solutions (GCP/Cloud Run/Node.js).
        
        Please provide your recommendation in ${lang === 'ko' ? 'Korean' : 'English'} in the following format:
        [Tech Stack Summary]
        (Briefly list the recommended tools/frameworks)
        
        [Why this stack?]
        (Provide a detailed rationale focusing on performance, scalability, development speed, and suitability for ${platform} goals)
        
        Be specific and professional.
      `,
    }, mode, platform), userId);

    return response.text || "Failed to generate tech stack recommendation.";
  } catch (error: any) {
    console.error("Error recommending tech stack:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return "An error occurred during tech stack recommendation.";
  }
}

export async function analyzeScreenStructure(pageName: string, script: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<ScreenNode[]> {
  // Always prepare local deterministic screen decomposition baseline first (0ms latency, privacy-first)
  const localNodes = decomposeLocalScreenStructure(pageName, script, lang, platform);

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        Analyze the following ${platform === 'APP' ? 'App Screen' : 'Web Page'} script and decompose it into major components/sections.
        Generate a unique Screen ID (e.g., SCR-XXX) for each component.
        
        [${platform === 'APP' ? 'Screen' : 'Page'} Name]
        ${pageName}
        
        [${platform === 'APP' ? 'Screen' : 'Page'} Script]
        ${script}
        
        Requirements:
        1. Identify 4-7 key functional components (e.g., ${platform === 'APP' ? 'Header Bar, Bottom Sheet, List Item, Info Card, Action Button' : 'Hero, Features, Stats, CTA, Footer'}).
        2. For each, provide:
           - id: A string starting with 'SCR-' followed by 3 digits.
           - label: A short, descriptive name in ${lang === 'ko' ? 'Korean' : 'English'}.
           - description: A brief summary of what's in this section in ${lang === 'ko' ? 'Korean' : 'English'}.
        3. Return ONLY a JSON array of objects with keys 'id', 'label', and 'description'.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              description: { type: Type.STRING },
            },
            required: ["id", "label", "description"],
          },
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return localNodes;
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : localNodes;
  } catch (error: any) {
    console.error("Error analyzing screen structure, falling back to local deterministic decomposition:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return localNodes;
  }
}

export async function generateFullProjectProposalData(projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<{
  executiveSummary: string;
  strategicIntent: string;
  administrativeRoadmap: string;
  sddSummary: string;
  negativeConstraints: string;
  aiDesignPrinciples: string;
  adminMonitoringPlan: string;
}> {
  // Always compile the rich local proposal baseline first (deterministic, instant, offline-first)
  const localProposal = compileLocalProjectProposal(projectContext, lang, platform);

  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a GOGUMA Master Architect, a specialized enterprise SaaS architect and strategic consultant.
        Your task is to generate a comprehensive "Project Proposal" data pack based on the provided project context for a ${platform} platform.
        
        [Project Context]
        ${projectContext}
        
        Requirements for ${platform}:
        Generate the following 7 sections in ${lang === 'ko' ? 'Korean' : 'English'}:
        
        1. Executive Summary: Core value and expected effects in a narrative form.
        2. Strategic Intent: Strategic basis for choosing this specific design and functionality.
        3. Administrative Roadmap: Administrative procedures and checklist required before deployment (e.g., MOU, budget approval, security review, ${platform === 'APP' ? 'App Store Review' : 'Domain Purchase'}).
        4. SDD Summary: Summarize the technical specification (Software Design Document) features for non-developers.
        5. Negative Constraints: Elements that MUST NOT be done to maintain brand identity and security (e.g., ${platform === 'APP' ? 'No non-touch targets, no desktop-only layouts' : 'No mobile-only patterns on desktop'}).
        6. AI Design Principles: Logical guardrails and principles used by AI for this project's design.
        7. Admin Monitoring Plan: Plan for monitoring operations, usage, and security in the Admin module.
        
        Return ONLY a JSON object with the following keys: 
        'executiveSummary', 'strategicIntent', 'administrativeRoadmap', 'sddSummary', 'negativeConstraints', 'aiDesignPrinciples', 'adminMonitoringPlan'.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            strategicIntent: { type: Type.STRING },
            administrativeRoadmap: { type: Type.STRING },
            sddSummary: { type: Type.STRING },
            negativeConstraints: { type: Type.STRING },
            aiDesignPrinciples: { type: Type.STRING },
            adminMonitoringPlan: { type: Type.STRING },
          },
          required: ["executiveSummary", "strategicIntent", "administrativeRoadmap", "sddSummary", "negativeConstraints", "aiDesignPrinciples", "adminMonitoringPlan"],
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return localProposal;
    const parsed = JSON.parse(text);
    return {
      executiveSummary: parsed.executiveSummary || localProposal.executiveSummary,
      strategicIntent: parsed.strategicIntent || localProposal.strategicIntent,
      administrativeRoadmap: parsed.administrativeRoadmap || localProposal.administrativeRoadmap,
      sddSummary: parsed.sddSummary || localProposal.sddSummary,
      negativeConstraints: parsed.negativeConstraints || localProposal.negativeConstraints,
      aiDesignPrinciples: parsed.aiDesignPrinciples || localProposal.aiDesignPrinciples,
      adminMonitoringPlan: parsed.adminMonitoringPlan || localProposal.adminMonitoringPlan,
    };
  } catch (error: any) {
    console.warn("Using high-performance local proposal compiler fallback:", error?.message || error);
    return localProposal;
  }
}

export async function polishOverviewText(text: string, fieldType: string, projectContext: string, lang: Language = 'en', userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<string> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a professional ${platform === 'APP' ? 'App UI/UX' : 'web'} consultant and copywriter.
        Your task is to refine and polish the user's input for the ${platform === 'APP' ? 'App' : 'Website'} planning field: "${fieldType}".
        
        [User Input]
        ${text}
        
        [Context]
        ${projectContext}
        
        Requirements:
        1. Refine the content to be professional, precise, and well-organized. 
        2. If the input contains multiple points, use clear formatting (bullet points) to improve readability.
        3. Improve the clarity and persuasiveness in ${lang === 'ko' ? 'Korean' : 'English'}.
        4. Keep the core meaning while expressing it more effectively.
        5. Return ONLY the refined and organized text in ${lang === 'ko' ? 'Korean' : 'English'}. No introductory or concluding remarks.
      `,
    }, mode, platform), userId);

    return response.text || text;
  } catch (error: any) {
    console.error("Error polishing text:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return text;
  }
}

export async function recommendBottomTabs(projectContext: string, lang: Language = 'en', count: number = 5, userId?: string, mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION', platform: 'WEB' | 'APP' = 'WEB'): Promise<{ label: string, icon: string }[]> {
  try {
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are a specialized mobile App UI/UX planner for a ${platform} project.
        Based on the 'Project Planning Data' and requested tab count, please recommend the most suitable ${count} bottom tab functions.
        
        [Project Planning Data]
        ${projectContext}
        
        Requested Tab Count: ${count}
        
        Requirements:
        1. Select ${count} tab labels that best align with the site's purpose/target.
        2. Assign one of these icons to each tab: Home, Search, Bell, User, Settings, Heart, Star.
        3. Write the labels in ${lang === 'ko' ? 'Korean' : 'English'}.
        4. Return ONLY a JSON array of objects with keys 'label' and 'icon'.
        
        Example Output:
        [{"label": "Home", "icon": "Home"}, {"label": "Search", "icon": "Search"}]
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              icon: { type: Type.STRING },
            },
            required: ["label", "icon"],
          },
        },
      },
    }, mode, platform), userId);

    const text = response.text;
    if (!text) return Array.from({ length: count }, () => ({ label: 'Home', icon: 'Home' }));
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Error recommending bottom tabs:", error);
    if (error?.message === 'GEMINI_RATE_LIMIT_EXCEEDED') throw error;
    return Array.from({ length: count }, () => ({ label: 'Home', icon: 'Home' }));
  }
}

/**
 * Chats with GOGUMA Master Architect (MASTER GOGUMA).
 * Passes system instructions & the deep state of the site plan.
 */
export async function chatWithMasterGoguma(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  plan: SitePlan,
  lang: Language = 'en',
  userId?: string,
  mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION',
  platform: 'WEB' | 'APP' = 'WEB'
): Promise<string> {
  try {
    const isKorean = lang === 'ko';
    
    const systemInstruction = `
You are "MASTER GOGUMA" (마스터 고구마), a highly elite, specialized system architect, senior creative director, and diabolical security auditor.
Your job is to act as a brilliant, slightly theatrical strategic partner to "디렉터님" (Director, the master planner), guiding them through the website or mobile application design process in GOGUMA.

### Persona & Style Constraints:
1. **Always address the user as "디렉터님" (Director).**
2. **Dynamic Tone Based on User Request Type:**
   - **Page Usage & Functions (사용법 및 설명):** When the Director asks about how to use the current page, elements, or buttons, prioritize answering clearly: "그 기능은 이렇게 하면 된다", "그 버튼은 이런 기능이다". Briefly explain the features and usage first as an expert guide, with clear step-by-step guidance.
   - **Analyzing Ideas / Reviewing Plans (아이디어, 분석, 평가 요구):** Maintain the original, diabolical, critical, and cynical tone (비판적인 논조). Highlight structural flaws with rigorous standards.
3. **Problem Alert Empathy (문제 상황 안내 태도):** If there are structural, functional, security, or performance errors/issues during the user's work, alert them in a firm, resolute tone. BUT, initially start with a nuanced expression showing understanding that it probably wasn't their original intention (e.g., "디렉터님께서 원래 의도하신 바는 이것이 아님을 충분히 이해합니다만...", "분명 다른 뜻이 있으셨겠지요... 하지만 이 설계는..."). Then firmly detail the vulnerability.
4. **Step-by-Step Info Delivery (단계적 정보 제한):** Never overwhelm the user by dumping all possible suggestions or info at once. Tell them only what needs to be done *and* known at the current step (현 단계에서 해야 할 일과 알아야 할 정보), followed by a very brief summary of what to do next (그 다음 단계에는 무엇을 해야 하는지 간략히 안내).
5. **Dynamic eye-level consulting based on User's Skill level (눈높이식 페르소나):**
   - Gently assess the user's technical level from their message style and depth.
   - **Beginner level (초보자):** Keep explanations simple, easy to understand, matching their index level. Use clear analogies and avoid excessive technical jargon.
   - **Experienced/Professional level (지식 및 경험 보유자):** Use appropriate industry/technical/professional terms (e.g., CWE, DB performance bottlenecks, network structures). Act as a highly professional advisor.
   - In both cases, maintain the role of a **strict, slightly scary, but brilliant advisor/teacher (깐깐하고 약간은 무서운 선생님)** who pushes them to reach perfection.

### 5-Point Ruthless Critique Criteria:
1. **Security**: Look for data leaks, insecure API usage, index vulnerabilities, missing rules.
2. **Scalability**: Traffic spikes, DB performance, layout bottlenecks.
3. **Cost**: GCP billing trap, oversized instances, database query charges.
4. **UX**: Touch targets under 44px on mobile, desktop patterns in APP platform, visual clutter.
5. **Data Alignment**: Isolation of admin vs user, database sync structure.

### Current Project Plan Context:
- **Platform**: ${plan.metadata?.platform || 'WEB'}
- **Project Name**: ${plan.metadata?.projectName || 'Untitled'}
- **Vibe/Tone**: ${plan.metadata?.projectOverview?.toneAndManner || 'Standard'}
- **Current Plan Details**: ${JSON.stringify(plan)}

### Directions:
- Respond in ${isKorean ? 'Korean' : 'English'}.
- Be concise but highly structural. Highlight visual design layout omissions, missing page details, or security holes.
- If the plan has flaws, tell them to use the "RCI Auto-Improve" (RCI 자동 기획 보수) button in GOGUMA to automatically refactor the plan.
`;

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: messages,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    }), userId, 3, 1000);

    return response.text || (isKorean ? "죄송합니다, 디렉터님. 넝쿨 연결 중에 오류가 발생했습니다." : "Apologies Maestro, there was a glitch in the vine connections.");
  } catch (error: any) {
    console.error("Error in chatWithMasterGoguma:", error);
    throw error;
  }
}

/**
 * Streams chat responses from MASTER GOGUMA chunk by chunk with Thinking support.
 */
export async function streamChatWithMasterGoguma(
  messages: { role: 'user' | 'model'; parts: { text: string }[] }[],
  plan: SitePlan,
  onChunk: (chunk: string) => void,
  lang: Language = 'en',
  userId?: string,
  mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION',
  platform: 'WEB' | 'APP' = 'WEB'
): Promise<void> {
  const isKorean = lang === 'ko';
  
  const systemInstruction = `
You are "MASTER GOGUMA" (마스터 고구마), a highly elite, specialized system architect, senior creative director, and diabolical security auditor.
Your job is to act as a brilliant, slightly theatrical strategic partner to "디렉터님" (Director, the master planner), guiding them through the website or mobile application design process in GOGUMA.

### Persona & Style Constraints:
1. **Always address the user as "디렉터님" (Director).**
2. **Dynamic Tone Based on User Request Type:**
   - **Page Usage & Functions (사용법 및 설명):** When the Director asks about how to use the current page, elements, or buttons, prioritize answering clearly: "그 기능은 이렇게 하면 된다", "그 버튼은 이런 기능이다". Briefly explain the features and usage first as an expert guide, with clear step-by-step guidance.
   - **Analyzing Ideas / Reviewing Plans (아이디어, 분석, 평가 요구):** Maintain the original, diabolical, critical, and cynical tone (비판적인 논조). Highlight structural flaws with rigorous standards.
3. **Problem Alert Empathy (문제 상황 안내 태도):** If there are structural, functional, security, or performance errors/issues during the user's work, alert them in a firm, resolute tone. BUT, initially start with a nuanced expression showing understanding that it probably wasn't their original intention (e.g., "디렉터님께서 원래 의도하신 바는 이것이 아님을 충분히 이해합니다만...", "분명 다른 뜻이 있으셨겠지요... 하지만 이 설계는..."). Then firmly detail the vulnerability.
4. **Step-by-Step Info Delivery (단계적 정보 제한):** Never overwhelm the user by dumping all possible suggestions or info at once. Tell them only what needs to be done *and* known at the current step (현 단계에서 해야 할 일과 알아야 할 정보), followed by a very brief summary of what to do next (그 다음 단계에는 무엇을 해야 하는지 간략히 안내).
5. **Dynamic eye-level consulting based on User's Skill level (눈높이식 페르소나):**
   - Gently assess the user's technical level from their message style and depth.
   - **Beginner level (초보자):** Keep explanations simple, easy to understand, matching their index level. Use clear analogies and avoid excessive technical jargon.
   - **Experienced/Professional level (지식 및 경험 보유자):** Use appropriate industry/technical/professional terms (e.g., CWE, DB performance bottlenecks, network structures). Act as a highly professional advisor.
   - In both cases, maintain the role of a **strict, slightly scary, but brilliant advisor/teacher (깐깐하고 약간은 무서운 선생님)** who pushes them to reach perfection.

### 5-Point Ruthless Critique Criteria:
1. **Security**: Look for data leaks, insecure API usage, index vulnerabilities, missing rules.
2. **Scalability**: Traffic spikes, DB performance, layout bottlenecks.
3. **Cost**: GCP billing trap, oversized instances, database query charges.
4. **UX**: Touch targets under 44px on mobile, desktop patterns in APP platform, visual clutter.
5. **Data Alignment**: Isolation of admin vs user, database sync structure.

### Current Project Plan Context:
- **Platform**: ${plan.metadata?.platform || 'WEB'}
- **Project Name**: ${plan.metadata?.projectName || 'Untitled'}
- **Vibe/Tone**: ${plan.metadata?.projectOverview?.toneAndManner || 'Standard'}
- **Current Plan Details**: ${JSON.stringify(plan)}

### Directions:
- Respond in ${isKorean ? 'Korean' : 'English'}.
- Be concise but highly structural. Highlight visual design layout omissions, missing page details, or security holes.
- If the plan has flaws, tell them to use the "RCI Auto-Improve" (RCI 자동 기획 보수) button in GOGUMA to automatically refactor the plan.
`;

  try {
    await ai.models.generateContentStream(
      {
        contents: messages,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      },
      onChunk,
      mode
    );
    if (userId) {
      logApiCall(userId).catch(console.error);
    }
  } catch (error: any) {
    console.error("Error in streamChatWithMasterGoguma:", error);
    throw error;
  }
}

/**
 * Automatically refactors planning metadata using Gemini by feeding back criticism.
 * Completes the "closed feedback loop" (RCI Loop).
 */
export async function improvePlanWithCriticism(
  plan: SitePlan,
  criticism: string,
  lang: Language = 'en',
  userId?: string,
  mode: 'DEVELOPMENT' | 'PRODUCTION' = 'PRODUCTION'
): Promise<SitePlan> {
  try {
    const isKorean = lang === 'ko';
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      contents: `
        You are GOGUMA Master Architect, the diabolical but elite system architect.
        We have the current project site plan in JSON format. The user has run an AI criticism or received feedback pointing out security, scaling, UX, cost, or data alignment issues.
        
        Your task is to automatically refactor and improve the planning fields of the project plan (the metadata's projectOverview) to resolve these critical issues.
        
        [Current Plan]
        \${JSON.stringify(plan)}
        
        [Criticism received]
        \${criticism}
        
        Requirements:
        1. Refactor relevant text fields in 'metadata.projectOverview' (such as purpose, features, techStack, schedule, toneAndManner) to address the criticism. Provide highly secure, production-ready specifications that resolve security, cost, scaling, and UX flows.
        2. Keep page structural nodes, menus, designs, and colors mostly intact, but optimize their text descriptions or settings.
        3. All generated copy inside projectOverview MUST be in \${isKorean ? 'Korean' : 'English'}.
        4. Return ONLY a valid JSON object matching the exact structure of the input SitePlan. Do not add any markdown decoration like \`\`\`json or introductory words.
      `,
      config: {
        responseMimeType: "application/json",
      }
    }), userId);

    const text = response.text;
    if (!text) return plan;
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Error improving plan with criticism:", error);
    return plan;
  }
}

