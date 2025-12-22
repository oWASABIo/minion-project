import { defineEventHandler } from "h3";

export default defineEventHandler(() => {
  const config = useRuntimeConfig();

  // Check both runtime config and process.env
  const key =
    (config.geminiApiKey as string | undefined) ||
    process.env.GEMINI_API_KEY ||
    "";

  // Check valid length (Gemini keys are usually ~39 chars)
  const hasKey = typeof key === "string" && key.trim().length > 20;

  const warnings: string[] = [];
  if (!hasKey && key.length > 0) {
    warnings.push("API Key seems too short or invalid.");
  }
  if (process.env.AI_MOCK === "1") {
    warnings.push("AI_MOCK=1 is set in .env (System might force mock mode).");
  }

  return {
    status: "ok",
    provider: "gemini",
    hasKey, // 'hasOpenAIKey' kept for backward compat if needed, or we migrate frontend
    hasOpenAIKey: hasKey, // Legacy compat
    model: (config.geminiModel as string | undefined) || "gemini-1.5-flash",
    keyHint: hasKey ? `***${key.trim().slice(-4)}` : "No Key",
    warnings,
    debug: {
      envKeyFound: !!process.env.GEMINI_API_KEY,
      runtimeKeyFound: !!config.geminiApiKey,
      mockEnv: process.env.AI_MOCK,
    },
    recommendation: !hasKey
      ? "Add GEMINI_API_KEY to .env to enable Live generation."
      : null,
  };
});
