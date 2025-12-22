import { d as defineEventHandler, u as useRuntimeConfig } from '../../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

const aiStatus_get = defineEventHandler(() => {
  const config = useRuntimeConfig();
  const key = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
  const hasKey = typeof key === "string" && key.trim().length > 20;
  const warnings = [];
  if (!hasKey && key.length > 0) {
    warnings.push("API Key seems too short or invalid.");
  }
  if (process.env.AI_MOCK === "1") {
    warnings.push("AI_MOCK=1 is set in .env (System might force mock mode).");
  }
  return {
    status: "ok",
    provider: "gemini",
    hasKey,
    // 'hasOpenAIKey' kept for backward compat if needed, or we migrate frontend
    hasOpenAIKey: hasKey,
    // Legacy compat
    model: config.geminiModel || "gemini-1.5-flash",
    keyHint: hasKey ? `***${key.trim().slice(-4)}` : "No Key",
    warnings,
    debug: {
      envKeyFound: !!process.env.GEMINI_API_KEY,
      runtimeKeyFound: !!config.geminiApiKey,
      mockEnv: process.env.AI_MOCK
    },
    recommendation: !hasKey ? "Add GEMINI_API_KEY to .env to enable Live generation." : null
  };
});

export { aiStatus_get as default };
//# sourceMappingURL=ai-status.get.mjs.map
