import {
  normalizePageConfig,
  validatePageConfig,
  extractJson,
  normalizeProjectConfig,
  type PageConfig,
  type ProjectConfig,
  type Stack,
} from "@minions/shared";
import { getRandomTemplate } from "./template-registry";
import { gettemplateSpec } from "./template-spec";
import { generateContentWithRetry } from "./gemini";
import { buildMockPageConfig, buildMockProject, hashString } from "./mock";
import { systemPrompt } from "./prompts";

export type GenerationOptions = {
  template: string;
  brief: string;
  cleanBrief?: string;
  directives?: any;
  stack: Stack;
  seed: number;
  wordpressBaseUrl?: string;
  wordpressRestBase?: string;
};

export class GenerationService {
  /**
   * Generates a full project config based on the provided brief.
   */
  async generateProject(opts: GenerationOptions): Promise<any> {
    const selectedTemplate = getRandomTemplate(opts.template, opts.seed);
    const templateSpec = gettemplateSpec(opts.template);
    const baseSystemInstruction = systemPrompt(templateSpec, opts.stack);

    const pages: Record<string, PageConfig> = {};
    let siteContext = {
      siteName: "",
      tagline: "",
      primaryColor: "",
      themeMode: "dark",
    };

    // 1. Generate HOME
    try {
      const homeDef = selectedTemplate.pages.find((p) => p.id === "home");
      const homeBrief = `${opts.cleanBrief || opts.brief}. ${
        homeDef?.promptFocus || "Main landing page."
      }`;

      const rawHome = await this.generatePageWithRepair(
        "home",
        homeBrief,
        {},
        opts,
        baseSystemInstruction,
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
        template: opts.template,
        brief: opts.cleanBrief || opts.brief,
        stack: opts.stack,
        seed: opts.seed,
        wordpressBaseUrl: opts.wordpressBaseUrl,
        wordpressRestBase: opts.wordpressRestBase,
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

    // 2. Generate Other Pages
    const otherPages = selectedTemplate.pages.filter((p) => p.id !== "home");
    for (const p of otherPages) {
      const pBrief = `${opts.cleanBrief || opts.brief}. Focus on ${
        p.id
      } page. ${p.promptFocus}`;

      try {
        const pageConfig = await this.generatePageWithRepair(
          p.id,
          pBrief,
          siteContext,
          opts,
          baseSystemInstruction,
          p.structure
        );

        // Contextualize
        if (!pageConfig.site) pageConfig.site = {};
        pageConfig.site.siteName = siteContext.siteName;
        pageConfig.site.tagline = siteContext.tagline;
        if (siteContext.primaryColor)
          pageConfig.site.primaryColor = siteContext.primaryColor;
        pageConfig.site.themeMode = siteContext.themeMode as "light" | "dark";

        pages[p.id] = pageConfig;
      } catch (e) {
        console.warn(`[Multi-Page] Failed ${p.id}, falling back to mock.`, e);
        const mockPage = buildMockPageConfig({
          template: opts.template,
          brief: pBrief,
          stack: opts.stack,
          seed: opts.seed + hashString(p.id),
          structure: p.structure,
          themeMode: siteContext.themeMode as "light" | "dark",
        });
        mockPage.site.siteName = siteContext.siteName;
        mockPage.site.primaryColor = siteContext.primaryColor;
        pages[p.id] = mockPage;
      }
    }

    const rawProject = {
      template: opts.template,
      templateId: selectedTemplate.id,
      site: pages["home"]?.site || {},
      backend: pages["home"]?.backend,
      pages,
      meta: pages["home"]?.meta,
    };

    // Normalize all pages
    const finalPages: Record<string, PageConfig> = {};
    for (const [pageId, pageConf] of Object.entries(rawProject.pages)) {
      finalPages[pageId] = normalizePageConfig(pageConf as any, {
        template: opts.template,
        stack: opts.stack,
        seed: opts.seed,
        mode: "live",
        wordpressBaseUrl: opts.wordpressBaseUrl,
        wordpressRestBase: opts.wordpressRestBase,
      });
      finalPages[pageId].meta = {
        ...(finalPages[pageId].meta || {}),
        mode: "live",
        generatedAt: new Date().toISOString(),
        seed: opts.seed,
        stack: opts.stack,
      };
    }

    return {
      template: opts.template,
      templateId: selectedTemplate.id,
      site: rawProject.site,
      backend: rawProject.backend,
      pages: finalPages,
      meta: {
        mode: "live",
        generatedAt: new Date().toISOString(),
        seed: opts.seed,
        stack: opts.stack,
        brief: opts.brief,
      },
    };
  }

  /**
   * Generates a single page with auto-repair logic.
   */
  private async generatePageWithRepair(
    pageId: string,
    pageContextBrief: string,
    globalContext: any,
    opts: GenerationOptions,
    baseSystemInstruction: string,
    structure?: string[]
  ): Promise<any> {
    const templateSpec = gettemplateSpec(opts.template);

    const structureInstruction = structure
      ? `Recommended Structure: [${structure.join(
          ", "
        )}]. \nGuidance: Use this as a starting point. If the brief asks for something specific (e.g. "focus on trust"), add 'testimonials' or 'stats' even if not in the recommendation.`
      : "Recommendation: Create a logical conversion flow.";

    const instruction = [
      baseSystemInstruction,
      `Page Context: ${pageId} (${templateSpec.promptFocus})`,
      structureInstruction,
      globalContext.siteName ? `- Site Name: ${globalContext.siteName}` : "",
      globalContext.themeMode ? `- Theme Mode: ${globalContext.themeMode}` : "",
    ].join("\n");

    let currentPrompt = [
      "System:",
      instruction,
      "---",
      "User Context:",
      `Brief: ${pageContextBrief}`,
      `Directives: ${JSON.stringify(opts.directives || {})}`,
      "---",
      "Action: Generate JSON.",
    ].join("\n");

    let lastError = "";
    const MAX_REPAIR_ATTEMPTS = 2;

    for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
      if (attempt > 0) {
        console.warn(
          `[Auto-Repair] Attempt ${attempt} for ${pageId}. Error: ${lastError}`
        );
        currentPrompt += `\n\nSYSTEM ALERT: Your previous JSON was invalid. \nErrors: ${lastError} \nPlease fix the JSON structure, remove unknown section types, and return ONLY the JSON object.`;
      }

      try {
        const result = await generateContentWithRetry(currentPrompt);
        const text = result.response.text();
        if (!text) throw new Error("Empty response");

        const json = extractJson(text);

        // Auto-patch ID for better UX (optional, but keep for now)
        if (json.sections && Array.isArray(json.sections)) {
          json.sections.forEach((sec: any, idx: number) => {
            if (!sec.id) sec.id = `${sec.type || "section"}-${idx + 1}`;
          });
        }

        const validation = validatePageConfig(json);
        if (validation.valid) {
          return json;
        } else {
          lastError = validation.errors.join(", ");
        }
      } catch (e: any) {
        lastError = e.message || "Unknown parse error";
      }
    }

    throw new Error(
      `Failed to generate valid JSON after repairs. Errors: ${lastError}`
    );
  }
}
