import type { ProjectConfig } from "@minions/shared";
import { extractJson, normalizeProjectConfig } from "@minions/shared";

/**
 * Parses the raw text response from the AI and extracts a valid ProjectConfig.
 * Now uses centralized logic from @minions/shared.
 */
export function parseAIResponse(rawText: string): ProjectConfig {
  try {
    const rawJson = extractJson(rawText);

    // Normalize using shared logic
    // Note: We don't have full Opts here easily (stack, seed),
    // but normalizeProjectConfig/normalizePageConfig handles defaults.
    return normalizeProjectConfig(rawJson, {
      template: rawJson.template || "landing",
      stack: rawJson.meta?.stack || "nuxt",
      seed: rawJson.meta?.seed || Date.now(),
      mode: "live",
    });
  } catch (err: any) {
    console.error("[AI Parser] Failed:", err);
    throw err;
  }
}
