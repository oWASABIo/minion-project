import { createError, defineEventHandler, readBody, sendStream } from "h3";
import type { PageConfig, Stack, ProjectConfig } from "@minions/shared";
import { buildMockProject, hashString } from "~/domain/generator/mock";
import { parsePromptPattern } from "~/domain/generator/prompt-pattern";
import { generateContentStreamWithRetry } from "~/domain/generator/gemini";
import { gettemplateSpec } from "../../domain/generator/template-spec";
import { GenerationService } from "~/domain/generator/GenerationService";
import { useRuntimeConfig } from "nitropack/runtime";

type Body = {
  template?: string;
  brief?: string;
  mode?: "auto" | "mock" | "live";
  stack?: string;
  seed?: number;
  wordpressBaseUrl?: string;
  wordpressRestBase?: string;
  stream?: boolean;
};

export default defineEventHandler(async (event) => {
  try {
    const body = (await readBody(event)) as Body;

    const template = (body.template || "landing").toString();
    const briefRaw = (body.brief || "").toString().trim();
    const mode = (body.mode || "auto") as Body["mode"];
    const stack = ((body.stack || "nuxt").toString() || "nuxt") as Stack;

    const wordpressBaseUrl = (body.wordpressBaseUrl || "").toString().trim();
    const wordpressRestBase = (body.wordpressRestBase || "").toString().trim();

    // ✅ Seed logic
    let seed = typeof body.seed === "number" ? body.seed : undefined;

    if (!briefRaw) {
      throw createError({
        statusCode: 400,
        statusMessage: "Brief is required",
      });
    }

    const { cleanBrief, directives } = parsePromptPattern(briefRaw);

    if (seed === undefined && typeof directives.config?.seed === "number") {
      seed = directives.config.seed;
    }
    if (seed === undefined) {
      seed = Date.now();
    }

    const config = useRuntimeConfig();
    const geminiKey =
      (config.geminiApiKey as string | undefined) ||
      process.env.GEMINI_API_KEY ||
      "";
    const hasKey = geminiKey.length > 0;

    const wantLive = mode === "live" || mode === "auto";

    // -------------------------
    // MAIN LOGIC
    // -------------------------
    let finalProject: any = null;
    let finalMode: "mock" | "live" = "mock";
    let note = "";

    try {
      // -------------------------
      // 1. STREAMING MODE (Live Only)
      // -------------------------
      if (body.stream && wantLive && hasKey) {
        const templateSpec = gettemplateSpec(template);
        const { systemPrompt } = await import("../../domain/generator/prompts");

        const fullPrompt = [
          "System:",
          systemPrompt(templateSpec, stack),
          "---",
          "User Context:",
          `Brief: ${briefRaw}`,
          `Directives: ${JSON.stringify(directives || {})}`,
          cleanBrief ? `Clean Intent: ${cleanBrief}` : "",
        ].join("\n");

        return sendStream(
          event,
          new ReadableStream({
            async start(controller) {
              try {
                const result = await generateContentStreamWithRetry(fullPrompt);
                for await (const chunk of result.stream) {
                  const chunkText = chunk.text();
                  controller.enqueue(new TextEncoder().encode(chunkText));
                }
                controller.close();
              } catch (err: any) {
                console.error("[Streaming] Error:", err);
                try {
                  controller.enqueue(
                    new TextEncoder().encode(`\n\n[ERROR]: ${err.message}`)
                  );
                } catch {}
                controller.close();
              }
            },
          })
        );
      }

      // -------------------------
      // 2. GENERATION SERVICE (Live vs Mock)
      // -------------------------
      const genService = new GenerationService();

      if (wantLive && hasKey) {
        finalMode = "live";
        const result = await genService.generateProject({
          template,
          brief: briefRaw,
          cleanBrief,
          directives,
          stack,
          seed: seed!,
          wordpressBaseUrl,
          wordpressRestBase,
        });
        finalProject = result;
        note = "Live OK (Service Oriented)";
      } else {
        finalMode = "mock";
        note = !hasKey && wantLive ? "Fallback: No API Key" : "Mock Requested";
        finalProject = buildMockProject({
          template,
          brief: cleanBrief || briefRaw,
          stack,
          seed: seed!,
          wordpressBaseUrl,
          wordpressRestBase,
        });
      }
    } catch (e: any) {
      console.error("Selection/Generation error:", e);
      finalMode = "mock";
      note = `Error: ${e.message}. Falling back to mock.`;
      finalProject = buildMockProject({
        template,
        brief: cleanBrief || briefRaw,
        stack,
        seed: seed!,
        wordpressBaseUrl,
        wordpressRestBase,
      });
    }

    return {
      config: finalProject,
    };
  } catch (err: any) {
    return {
      config: null,
      error: err.message || "Unknown server error",
    };
  }
});
