import { createError, defineEventHandler, readBody, sendStream } from "h3";
import type { PageConfig, Stack, ProjectConfig } from "@minions/shared";
import {
  buildMockProject,
  buildMockPageConfig,
  hashString,
} from "~/domain/generator/mock";
import { getRandomTemplate } from "~/domain/generator/template-registry";
import { parsePromptPattern } from "~/domain/generator/prompt-pattern";
import { normalizePageConfig } from "~/domain/generator/normalize";
import {
  useGemini,
  generateContentWithRetry,
  generateContentStreamWithRetry,
} from "~/domain/generator/gemini";
import { gettemplateSpec } from "../../domain/generator/template-spec";
import { validatePageConfig } from "~/domain/generator/validate";
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

// Helper: Attempt to clean up JSON if model returns markdown fences
function cleanupJson(text: string) {
  let cleaned = text.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) lines.shift();
    if (lines[lines.length - 1].startsWith("```")) lines.pop();
    cleaned = lines.join("\n");
  }
  return cleaned;
}

function extractJson(text: string) {
  const cleaned = cleanupJson(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: try to find first { and last }
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    return JSON.parse(match[0]);
  }
}

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
    let rawProject: any = null;
    let finalMode: "mock" | "live" = "mock";
    let note = "";

    try {
      // -------------------------
      // X. STREAMING MODE (Live Only)
      // -------------------------
      if (body.stream && wantLive && hasKey) {
        // Construct detailed prompt (Single Page Focus for Streaming)
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

        // Use H3 sendStream
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
                // Attempt to send error as text if stream is open, else close
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

      // A. MOCK MODE (Explicit or No Key)
      if (mode === "mock" || (!hasKey && wantLive)) {
        finalMode = "mock";
        note =
          !hasKey && wantLive
            ? "Falling back to Mock Mode (No valid API Key found)."
            : "Mock Mode requested.";

        rawProject = buildMockProject({
          template,
          brief: cleanBrief || briefRaw,
          stack,
          seed: seed!,
          wordpressBaseUrl,
          wordpressRestBase,
        });
      }
      // B. LIVE MODE
      else if (wantLive && hasKey) {
        try {
          finalMode = "live";

          const selectedTemplate = getRandomTemplate(template, seed!);
          const templateId = selectedTemplate.id;

          // SMART CHEF VOCABULARY
          // Only these slice types are supported by the frontend.
          const VOCABULARY = [
            "hero",
            "features",
            "testimonials",
            "faq",
            "blogList",
            "cta",
            "pricing",
            "stats",
            "team",
            // "logos", // Future
            // "steps", // Future
          ];

          const baseSystemInstruction = [
            "Role: specialized UI Composer (The Smart Chef).",
            "Task: Composition only. Select and arrange sections to build a high-conversion landing page.",
            `Available Ingredients (Vocabulary): [${VOCABULARY.join(", ")}]`,
            `- Stack: ${stack}. Adjust content/structure conventions accordingly.`,
            "CRITICAL RULES:",
            "1. NO NEW INGREDIENTS: You must ONLY use the section types listed above. Do not invent 'map', 'contact', 'about', etc.",
            "2. ADAPTIVE RECIPE: The provided structure is a recommendation. You MAY add, remove, or reorder sections if it better fits the specific User Brief.",
            "3. FLATTEN: Output a flat 'sections' array. Do not nest content.",
            "4. OUTPUT: strictly JSON matching PageConfig schema.",
          ].join("\n");

          // Define generatePageWithRepair helper
          const generatePageWithRepair = async (
            pageId: string,
            pageContextBrief: string,
            globalContext: any,
            structure?: string[] // Recommendation (Guide)
          ) => {
            const templateSpec = gettemplateSpec(template);

            // Smart Chef: Structure as a Guide
            const structureInstruction = structure
              ? `Recommended Structure: [${structure.join(
                  ", "
                )}]. \nGuidance: Use this as a starting point. If the brief asks for something specific (e.g. "focus on trust"), add 'testimonials' or 'stats' even if not in the recommendation.`
              : "Recommendation: Create a logical conversion flow.";

            const instruction = [
              baseSystemInstruction,
              `Page Context: ${pageId} (${templateSpec.promptFocus})`,
              structureInstruction,
              globalContext.siteName
                ? `- Site Name: ${globalContext.siteName}`
                : "",
              globalContext.themeMode
                ? `- Theme Mode: ${globalContext.themeMode}`
                : "",
            ].join("\n");

            let currentPrompt = [
              "System:",
              instruction,
              "---",
              "User Context:",
              `Brief: ${pageContextBrief}`,
              `Directives: ${JSON.stringify(directives || {})}`,
              "---",
              "Action: Generate JSON.",
            ].join("\n");

            let lastError = "";
            const MAX_REPAIR_ATTEMPTS = 2; // Initial + 2 repairs

            for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
              if (attempt > 0) {
                console.warn(
                  `[Auto-Repair] Attempt ${attempt} for ${pageId}. Error: ${lastError}`
                );
                // Add repair context
                currentPrompt += `\n\nSYSTEM ALERT: Your previous JSON was invalid. \nErrors: ${lastError} \nPlease fix the JSON structure, remove unknown section types, and return ONLY the JSON object.`;
              }

              try {
                const result = await generateContentWithRetry(currentPrompt);
                const text = result.response.text();
                if (!text) throw new Error("Empty response");

                const json = extractJson(text);

                // --- 🩹 AUTO-PATCH: Fix trivial missing fields locally to save retries ---
                if (!json.template) json.template = template;
                if (!json.site) json.site = globalContext; // Use passed context
                if (!json.sections && !json.pages) json.sections = []; // Safety

                if (json.sections && Array.isArray(json.sections)) {
                  json.sections.forEach((sec: any, idx: number) => {
                    if (!sec.id) sec.id = `${sec.type || "section"}-${idx + 1}`;
                    if (
                      !sec.items &&
                      ["features", "testimonials", "stats"].includes(sec.type)
                    ) {
                      // Optional: Init empty items to pass structure validation?
                      // Or better to let AI retry if content is truly missing?
                      // Let's stick to fixing IDs and Root fields for now.
                    }
                  });
                }
                // -----------------------------------------------------------------------

                // Smart Validation: Filter unknown types?
                // For now, let validatePageConfig handle it, but we could aggressive filter here.

                // Validate
                const validation = validatePageConfig(json);
                if (validation.valid) {
                  return json; // Success!
                } else {
                  lastError = validation.errors.join(", ");
                  // Loop continues to cleanup/repair
                }
              } catch (e: any) {
                lastError = e.message || "Unknown parse error";
              }
            }

            throw new Error(
              `Failed to generate valid JSON after repairs. Errors: ${lastError}`
            );
          };

          const pages: Record<string, PageConfig> = {};
          let siteContext = {
            siteName: "",
            tagline: "",
            primaryColor: "",
            themeMode: "dark",
          };

          // 3. Generate HOME
          try {
            const homeDef = selectedTemplate.pages.find((p) => p.id === "home");
            const homeBrief = `${cleanBrief || briefRaw}. ${
              homeDef?.promptFocus || "Main landing page."
            }`;

            // ✅ Pass strict structure!
            const rawHome = await generatePageWithRepair(
              "home",
              homeBrief,
              {},
              homeDef?.structure
            );

            siteContext = {
              siteName: rawHome.site?.siteName || "Generated Site",
              tagline: rawHome.site?.tagline || "",
              primaryColor: rawHome.site?.primaryColor || "",
              themeMode: rawHome.site?.themeMode || "dark",
            };
            pages["home"] = rawHome;
          } catch (e) {
            console.error("Home generation failed, falling back to mock", e);
            pages["home"] = buildMockPageConfig({
              template,
              brief: cleanBrief || briefRaw,
              stack,
              seed: seed!,
              wordpressBaseUrl,
              wordpressRestBase,
              structure: selectedTemplate.pages.find((p) => p.id === "home")
                ?.structure,
            });
            siteContext = {
              siteName: pages["home"].site.siteName || "",
              tagline: pages["home"].site.tagline || "",
              primaryColor: pages["home"].site.primaryColor || "",
              themeMode: pages["home"].site.themeMode || "dark",
            };
          }

          // 4. Generate Other Pages (Sequential to avoid Rate Limits/Race Conditions)
          const otherPages = selectedTemplate.pages.filter(
            (p) => p.id !== "home"
          );

          console.log(
            `[Multi-Page] Selected Template: ${templateId}, Other Pages: ${otherPages.length}`
          );

          if (otherPages.length > 0) {
            for (const p of otherPages) {
              console.log(`[Multi-Page] Generating ${p.id}...`);
              const pBrief = `${cleanBrief || briefRaw}. Focus on ${
                p.id
              } page. ${p.promptFocus}`;

              try {
                const pageConfig = await generatePageWithRepair(
                  p.id,
                  pBrief,
                  siteContext,
                  p.structure // Guide
                );

                // Contextualize
                if (!pageConfig.site) pageConfig.site = {};
                pageConfig.site.siteName = siteContext.siteName;
                pageConfig.site.tagline = siteContext.tagline;
                if (siteContext.primaryColor)
                  pageConfig.site.primaryColor = siteContext.primaryColor;
                pageConfig.site.themeMode = siteContext.themeMode as
                  | "light"
                  | "dark";

                pages[p.id] = pageConfig;
                console.log(`[Multi-Page] Success: ${p.id}`);
              } catch (e) {
                console.warn(
                  `[Multi-Page] Failed ${p.id}, falling back to mock.`,
                  e
                );
                // Fallback
                const mockPage = buildMockPageConfig({
                  template,
                  brief: pBrief,
                  stack,
                  seed: seed! + hashString(p.id),
                  structure: p.structure,
                  themeMode: siteContext.themeMode as "light" | "dark",
                });
                mockPage.site.siteName = siteContext.siteName;
                mockPage.site.primaryColor = siteContext.primaryColor;
                pages[p.id] = mockPage;
              }
            }
          }

          note = "Live OK (Gemini Multi-page)";
          rawProject = {
            template,
            templateId,
            site: pages["home"]?.site || {},
            backend: pages["home"]?.backend,
            pages,
            meta: pages["home"]?.meta,
          };
        } catch (err: any) {
          console.error("Gemini generation failed:", err);
          finalMode = "mock";
          note = `AI Error: ${err.message}. Fallback to mock.`;
          rawProject = buildMockProject({
            template,
            brief: cleanBrief || briefRaw,
            stack,
            seed: seed!,
            wordpressBaseUrl,
            wordpressRestBase,
          });
        }
      }
    } catch (e: any) {
      console.error("Critical generation error:", e);
      finalMode = "mock";
      note = `Critical error: ${e.message}`;
      rawProject = buildMockProject({
        template,
        brief: cleanBrief || briefRaw,
        stack,
        seed: seed!,
        wordpressBaseUrl,
        wordpressRestBase,
      });
    }

    // -------------------------
    // NORMALIZATION
    // -------------------------
    const finalPages: Record<string, PageConfig> = {};

    if (rawProject && rawProject.pages) {
      for (const [pageId, pageConf] of Object.entries(rawProject.pages)) {
        finalPages[pageId] = normalizePageConfig(pageConf as any, {
          template,
          stack,
          seed: seed!,
          mode: finalMode,
          wordpressBaseUrl,
          wordpressRestBase,
        });
        finalPages[pageId].meta = {
          ...(finalPages[pageId].meta || {}),
          mode: finalMode,
          generatedAt: new Date().toISOString(),
          seed,
          stack,
          note,
        };
      }
    }

    const finalProject: any = {
      template,
      templateId: rawProject?.templateId || "unknown",
      site: rawProject?.site || {},
      backend: rawProject?.backend,
      pages: finalPages,
      meta: {
        mode: finalMode,
        generatedAt: new Date().toISOString(),
        seed,
        stack,
        note,
        brief: briefRaw,
      },
    };

    // Return Standard JSON
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
