import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Controlled CORS: permit same-origin, local preview, and trusted domains only
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      try {
        const url = new URL(origin);
        const host = url.hostname.toLowerCase();
        if (
          host === 'localhost' ||
          host === '127.0.0.1' ||
          host.endsWith('.run.app') ||
          host.endsWith('.goguma.app') ||
          host.endsWith('.indonesiacenter.net')
        ) {
          return callback(null, true);
        }
      } catch {}
      return callback(null, false);
    },
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));

  // Helper to create Gemini client (BYOK supported)
  const getGeminiClient = (customApiKey?: string) => {
    const key = customApiKey?.trim() || process.env.DEV_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
    if (!key) return null;
    return new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Rate limiter to protect against automated quota exhaustion & DoS (45 requests / min per IP)
  const ipRateBuckets = new Map<string, { count: number; resetAt: number }>();
  const RATE_WINDOW_MS = 60 * 1000;
  const MAX_REQ_PER_WINDOW = 45;

  const aiRateLimiter = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const bucket = ipRateBuckets.get(ip);

    if (!bucket || now > bucket.resetAt) {
      ipRateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return next();
    }

    if (bucket.count >= MAX_REQ_PER_WINDOW) {
      return res.status(429).json({
        error: "요청 한도 초과: 단시간 내 너무 많은 AI 요청이 발생했습니다. 1분 후 다시 시도해 주세요.",
        retryAfterMs: bucket.resetAt - now
      });
    }

    bucket.count += 1;
    next();
  };

  // API Route for Gemini (supports BYOK apiKey)
  app.post("/api/gemini", aiRateLimiter, async (req, res) => {
    try {
      const { model, contents, config, apiKey } = req.body;
      const ai = getGeminiClient(apiKey);
      
      if (!ai) {
        return res.status(400).json({ 
          error: "No Gemini API key provided. Please configure your personal Gemini API key in AI Settings (BYOK) or set GEMINI_API_KEY on the server." 
        });
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-3.8-flash",
        contents,
        config
      });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      let statusCode = 500;
      if (typeof error.status === 'number' && error.status >= 100 && error.status < 600) {
        statusCode = error.status;
      } else if (typeof error.code === 'number' && error.code >= 100 && error.code < 600) {
        statusCode = error.code;
      } else if (error.status === 'UNAVAILABLE' || error.message?.includes('503') || error.message?.includes('UNAVAILABLE')) {
        statusCode = 503;
      } else if (error.status === 'RESOURCE_EXHAUSTED' || error.message?.includes('429')) {
        statusCode = 429;
      } else if (error.status === 'INVALID_ARGUMENT' || error.message?.includes('400')) {
        statusCode = 400;
      }

      res.status(statusCode).json({ 
        error: error.message || "Internal Server Error",
        details: error.details
      });
    }
  });

  // Streaming SSE Route for Gemini with Thinking & Live token emission (supports BYOK apiKey)
  app.post("/api/gemini/stream", aiRateLimiter, async (req, res) => {
    try {
      const { model, contents, config, apiKey } = req.body;
      const ai = getGeminiClient(apiKey);

      if (!ai) {
        return res.status(400).json({ 
          error: "No Gemini API key provided. Please configure your personal Gemini API key in AI Settings (BYOK) or set GEMINI_API_KEY on the server." 
        });
      }

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      const streamResponse = await ai.models.generateContentStream({
        model: model || "gemini-3.8-flash",
        contents,
        config
      });

      for await (const chunk of streamResponse) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
    } catch (error: any) {
      console.error("Gemini Streaming API Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || "Internal Streaming Error" });
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message || "Stream interrupted" })}\n\n`);
        res.end();
      }
    }
  });

  // Helper to validate loopback / local AI endpoints with blocked port protection (Article 2 of 07_SECURITY.md)
  const BLOCKED_INTERNAL_PORTS = new Set([
    20, 21, 22, 23, 25, 53, 80, 443, 110, 143, 389, 445, 636, 1433, 1521, 2049, 3306, 5432, 6379, 8080, 9200, 11211, 27017, 28017
  ]);

  const isAllowedLoopbackEndpoint = (urlStr: string): boolean => {
    try {
      const parsed = new URL(urlStr);
      const host = parsed.hostname.toLowerCase();
      const isLoopback = (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.endsWith('.localhost')
      );
      if (!isLoopback) return false;

      const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
      if (isNaN(port) || port < 1 || port > 65535) return false;
      if (BLOCKED_INTERNAL_PORTS.has(port)) return false;

      return true;
    } catch {
      return false;
    }
  };

  // Ollama Models Tag Check
  app.get("/api/ollama/tags", async (req, res) => {
    try {
      const endpoint = ((req.query.endpoint as string) || "http://localhost:11434").replace(/\/$/, "");
      
      // Strict loopback check to prevent SSRF
      if (!isAllowedLoopbackEndpoint(endpoint)) {
        return res.status(400).json({ 
          error: "Security violation: Only local loopback endpoints (localhost, 127.0.0.1) are permitted for Ollama." 
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(`${endpoint}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!resp.ok) {
        return res.status(resp.status).json({ error: `Ollama returned HTTP ${resp.status}` });
      }

      const data = await resp.json();
      res.json(data);
    } catch (err: any) {
      res.status(502).json({
        error: `Cannot reach Ollama at ${req.query.endpoint || 'http://localhost:11434'}. Please verify that Ollama is running ('ollama serve') and accessible.`
      });
    }
  });

  // Ollama Chat/Generate Proxy
  app.post("/api/ollama/chat", aiRateLimiter, async (req, res) => {
    try {
      const { endpoint = "http://localhost:11434", model = "llama3.2", messages, stream = false, format } = req.body;
      const cleanEndpoint = endpoint.replace(/\/$/, "");

      // Strict loopback check to prevent SSRF
      if (!isAllowedLoopbackEndpoint(cleanEndpoint)) {
        return res.status(400).json({ 
          error: "Security violation: Only local loopback endpoints (localhost, 127.0.0.1) are permitted for Ollama." 
        });
      }

      const targetUrl = `${cleanEndpoint}/api/chat`;

      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');

        const ollamaResp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, stream: true, format })
        });

        if (!ollamaResp.ok || !ollamaResp.body) {
          throw new Error(`Ollama returned status ${ollamaResp.status}`);
        }

        const reader = (ollamaResp.body as any).getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const parsed = JSON.parse(trimmed);
              const text = parsed.message?.content || parsed.response || "";
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            } catch {
              // ignore parse errors on incomplete chunks
            }
          }
        }
        res.write(`data: [DONE]\n\n`);
        res.end();
      } else {
        const ollamaResp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, messages, stream: false, format })
        });

        if (!ollamaResp.ok) {
          const errText = await ollamaResp.text();
          return res.status(ollamaResp.status).json({ error: `Ollama error: ${errText}` });
        }

        const data: any = await ollamaResp.json();
        const text = data.message?.content || data.response || "";
        res.json({ text });
      }
    } catch (err: any) {
      console.error("Ollama proxy error:", err);
      if (!res.headersSent) {
        res.status(502).json({ error: err.message || "Failed to communicate with Ollama" });
      } else {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Explicit SEO endpoints (ensures crawlers never receive SPA HTML fallback)
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain; charset=utf-8").send(`User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://goguma.app/sitemap.xml
`);
  });

  app.get("/sitemap.xml", (req, res) => {
    const publicSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
    const distSitemap = path.join(process.cwd(), 'dist', 'sitemap.xml');
    res.type("application/xml; charset=utf-8");
    if (fs.existsSync(publicSitemap)) {
      res.sendFile(publicSitemap);
    } else if (fs.existsSync(distSitemap)) {
      res.sendFile(distSitemap);
    } else {
      res.status(404).send("Not Found");
    }
  });

  // Vite middleware for development vs static files in production
  const isDev = process.env.NODE_ENV !== "production" && (typeof __filename !== "undefined" ? !__filename.endsWith('.cjs') : true);
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Dev Server] Uncaught exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Dev Server] Unhandled rejection:', reason);
  });

  const gracefulShutdown = () => {
    console.log('[Dev Server] Shutting down gracefully...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
}

startServer().catch((err) => {
  console.error('[Dev Server] Startup failure:', err);
  process.exit(1);
});
