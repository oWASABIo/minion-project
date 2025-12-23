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
        site: pageConfig.site,
        backend: pageConfig.backend,
        meta: pageConfig.meta,
        pages: {
          home: pageConfig,
        },
      };

      return projectConfig;
    }

    // Fallback: If neither, it might be a partial or valid ProjectConfig without pages yet?
    // Assuming ProjectConfig for safety, referencing code will handle empty pages
    return config as ProjectConfig;
  } catch (err: any) {
    // If it's already an error object thrown above, rethrow
    if (err.message && !err.message.includes("JSON")) {
      throw err;
    }

    console.error("JSON Parse Error on:", cleaned);
    throw new Error("Failed to parse AI response: " + err.message);
  }
}
