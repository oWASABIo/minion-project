import { createError, readBody } from "h3";
import type { PageConfig, Stack, ProjectConfig } from "@minions/shared";
import {
  buildMockProject,
  buildMockPageConfig,
  hashString,
} from "~/domain/generator/mock";
import { getRandomTemplate } from "~/domain/generator/template-registry";
import { parsePromptPattern } from "~/domain/generator/prompt-pattern";
import { normalizePageConfig } from "~/domain/generator/normalize";
import { useGemini, generateContentWithRetry } from "~/domain/generator/gemini";
import { gettemplateSpec } from "../../domain/generator/template-spec";
import { validatePageConfig } from "~/domain/generator/validate";

type Body = {
  template?: string;
  brief?: string;
  mode?: "auto" | "mock" | "live";
  stack?: string;
  seed?: number;
  wordpressBaseUrl?: string;
  wordpressRestBase?: string;
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
      // A. MOCK MODE (Explicit or No Key)
      if (mode === "mock" || (!hasKey && wantLive)) {
        finalMode = "mock";
        note =
          !hasKey && wantLive
            ? "No Gemini key available. Fallback to mock."
            : "Mock mode requested.";

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

          const baseSystemInstruction = [
            "Role: AI Web Architect.",
            "Task: Generate a JSON object matching the PageConfig schema.",
            "Constraints:",
            "- Output strictly JSON. No markdown fences.",
            "- Use section types: hero, features, testimonials, faq, blogList, cta, pricing, stats, team.",
            `- Stack: ${stack}. Adjust content/structure conventions accordingly.`,
            "- Flatten sections (do not nest under 'content').",
            "- REQUIRED: Output must have a root 'sections' array.",
            "- Decide 'site.themeMode' ('light' or 'dark') based on the vibe.",
          ].join("\n");

          // Define generatePageWithRepair helper
          const generatePageWithRepair = async (
            pageId: string,
            pageContextBrief: string,
            globalContext: any
          ) => {
            const templateSpec = gettemplateSpec(template);
            const instruction = [
              baseSystemInstruction,
              `- Page ID: ${pageId}`,
              `- Page template: ${template}. ${templateSpec.promptFocus}`,
              globalContext.siteName
                ? `- Site Name: ${globalContext.siteName}`
                : "",
              globalContext.tagline
                ? `- Tagline: ${globalContext.tagline}`
                : "",
              globalContext.themeMode
                ? `- Theme Mode: ${globalContext.themeMode}`
                : "",
              "- Change section order/variants based on brief.",
            ].join("\n");

            let currentPrompt = [
              "System:",
              instruction,
              "---",
              "User Context:",
              `Brief: ${pageContextBrief}`,
              `Directives: ${JSON.stringify(directives || {})}`,
            ].join("\n");

            let lastError = "";
            const MAX_REPAIR_ATTEMPTS = 2; // Initial + 2 repairs

            for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
              if (attempt > 0) {
                console.warn(
                  `[Auto-Repair] Attempt ${attempt} for ${pageId}. Error: ${lastError}`
                );
                // Add repair context
                currentPrompt += `\n\nSYSTEM ALERT: Your previous JSON was invalid. \nErrors: ${lastError} \nPlease fix the JSON structure and return ONLY the JSON object.`;
              }

              try {
                const result = await generateContentWithRetry(currentPrompt);
                const text = result.response.text();
                if (!text) throw new Error("Empty response");

                const json = extractJson(text);

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

            const rawHome = await generatePageWithRepair("home", homeBrief, {});

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

          // 4. Generate Other Pages
          const otherPages = selectedTemplate.pages.filter(
            (p) => p.id !== "home"
          );

          if (otherPages.length > 0) {
            await Promise.all(
              otherPages.map(async (p) => {
                const pBrief = `${cleanBrief || briefRaw}. Focus on ${
                  p.id
                } page. ${p.promptFocus}`;
                try {
                  const pageConfig = await generatePageWithRepair(
                    p.id,
                    pBrief,
                    siteContext
                  );
                  if (!pageConfig.site) pageConfig.site = {};
                  pageConfig.site.siteName = siteContext.siteName;
                  pageConfig.site.tagline = siteContext.tagline;
                  if (siteContext.primaryColor)
                    pageConfig.site.primaryColor = siteContext.primaryColor;
                  pageConfig.site.themeMode = siteContext.themeMode as
                    | "light"
                    | "dark";

                  pages[p.id] = pageConfig;
                } catch (e) {
                  console.warn(
                    `Failed to generate ${p.id}, falling back to mock.`
                  );
                  pages[p.id] = buildMockPageConfig({
                    template,
                    brief: pBrief,
                    stack,
                    seed: seed! + hashString(p.id),
                    structure: p.structure,
                    themeMode: siteContext.themeMode as "light" | "dark",
                  });
                  pages[p.id].site.siteName = siteContext.siteName;
                  pages[p.id].site.primaryColor = siteContext.primaryColor;
                }
              })
            );
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
