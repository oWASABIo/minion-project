import type { PageConfig, ProjectConfig } from "../types/landing";
import { normalizePageConfig } from "./normalize";

export function extractJson(text: string): any {
  let cleaned = text.trim();

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
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  try {
    let json = JSON.parse(cleaned);
    // Unwrap nested config if present
    if (json.config && !json.pages && !json.sections) {
      json = json.config;
    }
    return json;
  } catch (err: any) {
    throw new Error("Failed to parse JSON from AI response: " + err.message);
  }
}

export function normalizeProjectConfig(input: any, opts: any): ProjectConfig {
  const project = { ...input };

  // If input has sections but no pages, it's a single page config wrapped as project
  if (project.sections && !project.pages) {
    const page = normalizePageConfig(project, opts);
    return {
      template: page.template,
      templateId: project.templateId || "generated-project",
      site: page.site,
      backend: page.backend,
      meta: page.meta,
      pages: {
        home: page,
      },
    };
  }

  // Normal project with pages
  if (project.pages && typeof project.pages === "object") {
    const normalizedPages: Record<string, PageConfig> = {};
    for (const [id, page] of Object.entries(project.pages)) {
      normalizedPages[id] = normalizePageConfig(page as any, opts);
    }
    project.pages = normalizedPages;
  }

  return project as ProjectConfig;
}
