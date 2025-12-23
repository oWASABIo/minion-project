import type { PageConfig, ProjectConfig } from "@minions/shared";

/**
 * Parses the raw text response from the AI and extracts a valid PageConfig object.
 * Handles:
 * - Markdown code blocks (```json ... ```)
 * - Trailing/Leading text explanation
 * - Nested/Wrapped config objects (e.g. { config: { ... } })
 */
export function parseAIResponse(rawText: string): ProjectConfig {
  let cleaned = rawText.trim();

  // Detect server-side error stream
  if (cleaned.startsWith("[ERROR]:")) {
    throw new Error(cleaned.replace("[ERROR]:", "").trim());
  }

  // Remove Markdown code blocks if present
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0]?.startsWith("```")) lines.shift();
    if (lines[lines.length - 1]?.startsWith("```")) lines.pop();
    cleaned = lines.join("\n");
  }

  // Improve JSON extraction: find first '{' and last '}'
  // This handles cases where AI adds text before or after the JSON block
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  try {
    let config = JSON.parse(cleaned);

    // Unwrap nested config if present (Handle AI/Wrapper nuances)
    // Sometimes AI returns { "config": { ... } } instead of flat object
    if (config.config && !config.pages) {
      config = config.config;
    }

    // Check for error field in JSON
    if (config.error) {
      throw new Error(config.error);
    }

    // Auto-detect: Is this a ProjectConfig (has pages) or a PageConfig (has sections)?
    if (config.pages) {
      // It's a ProjectConfig
      return config as ProjectConfig;
    } else if (config.sections) {
      // It's a Single Page Config -> Wrap it into ProjectConfig
      const pageConfig = config as PageConfig;

      const projectConfig: ProjectConfig = {
        template: pageConfig.template,
        templateId: "generated-project", // Default ID
        site: pageConfig.site || { siteName: "My Site", themeMode: "dark" },
        backend: pageConfig.backend,
        meta: pageConfig.meta,
        pages: {
          home: normalizeSections(pageConfig),
        },
      };

      return projectConfig;
    }

    // Fallback: It might be a ProjectConfig
    const project = config as ProjectConfig;
    if (project.pages) {
      Object.keys(project.pages).forEach((key) => {
        const page = project.pages![key];
        if (page) {
          project.pages![key] = normalizeSections(page);
        }
      });
    }
    return project;
  } catch (err: any) {
    // If it's already an error object thrown above, rethrow
    if (err.message && !err.message.includes("JSON")) {
      throw err;
    }

    console.error("JSON Parse Error on:", cleaned);
    throw new Error("Failed to parse AI response: " + err.message);
  }
}

function normalizeSections(pageConfig: PageConfig): PageConfig {
  if (!pageConfig.sections) return pageConfig;

  pageConfig.sections = pageConfig.sections.map((section: any) => {
    // Normalize Type
    let type = section.type || "";
    // Handle Common AI Capitalization (Hero -> hero, Features -> features)
    type = type.charAt(0).toLowerCase() + type.slice(1);

    // Map specific types if needed
    if (type.toLowerCase() === "bloglist") type = "blogList";
    if (type.toLowerCase() === "productlist") type = "productList";
    if (type.toLowerCase() === "productdetail") type = "productDetail";
    if (type.toLowerCase() === "cta") type = "cta";
    if (type.toLowerCase() === "faq") type = "faq";
    if (type.toLowerCase() === "cli") type = "cli";

    // Flatten Content Logic (Refactored for robustness)
    let mergedSection = { ...section };

    if (
      section.content &&
      typeof section.content === "object" &&
      !Array.isArray(section.content)
    ) {
      // console.log(`[AI Parser] Flattening content for section ${section.id}`, Object.keys(section.content));
      mergedSection = {
        ...mergedSection,
        ...section.content,
        // Restore overrides
        id: section.id,
        type: type,
      };
    }

    // FIELD MAPPING: Fix Schema Mismatch
    // 1. Hero Section Mapping
    if (type === "hero") {
      // tag -> eyebrow
      if (mergedSection.tag && !mergedSection.eyebrow)
        mergedSection.eyebrow = mergedSection.tag;

      // title -> headline
      if (mergedSection.title && !mergedSection.headline)
        mergedSection.headline = mergedSection.title;

      // description -> subheadline
      if (mergedSection.description && !mergedSection.subheadline)
        mergedSection.subheadline = mergedSection.description;

      // actions -> primaryCta, secondaryCta
      if (Array.isArray(mergedSection.actions)) {
        if (mergedSection.actions.length > 0 && !mergedSection.primaryCta) {
          mergedSection.primaryCta = {
            label:
              mergedSection.actions[0].label || mergedSection.actions[0].text,
            href:
              mergedSection.actions[0].link ||
              mergedSection.actions[0].href ||
              "#",
          };
        }
        if (mergedSection.actions.length > 1 && !mergedSection.secondaryCta) {
          mergedSection.secondaryCta = {
            label:
              mergedSection.actions[1].label || mergedSection.actions[1].text,
            href:
              mergedSection.actions[1].link ||
              mergedSection.actions[1].href ||
              "#",
          };
        }
      }
    }

    // 2. Features Section
    if (type === "features") {
      if (mergedSection.description && !mergedSection.subtitle)
        mergedSection.subtitle = mergedSection.description;
    }

    mergedSection.type = type;
    return mergedSection;
  });

  return pageConfig;
}
