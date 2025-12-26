import type { PageConfig, Section } from "../types/landing";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export function validatePageConfig(config: any): ValidationResult {
  const errors: string[] = [];

  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Root config must be an object"] };
  }

  // Check required root fields
  // template, site are essential. backend/meta are optional or can be defaulted
  if (!config.template) errors.push("Missing root field 'template'");
  if (!config.site) errors.push("Missing root field 'site'");

  // Support ProjectConfig (with pages)
  if (config.pages) {
    if (typeof config.pages !== "object") {
      errors.push("Field 'pages' must be an object");
    } else {
      Object.keys(config.pages).forEach((pageId) => {
        const page = config.pages[pageId];
        if (!page.sections || !Array.isArray(page.sections)) {
          errors.push(`Page [${pageId}] missing 'sections' array`);
        } else {
          // Validate sections for this page
          // Reuse logic? Or simple check.
          // Ideally we'd recurse but let's stick to inline for now to avoid extensive refactor
          // Actually, let's just loop locally.
          page.sections.forEach((section: any, index: number) => {
            validateSection(section, index, errors, pageId);
          });
        }
      });
    }
    // If pages exists, we don't check root sections
  }
  // Support PageConfig (root sections)
  else if (!Array.isArray(config.sections)) {
    if (config.content && Array.isArray(config.content)) {
      errors.push(
        "Found 'content' array but expected 'sections'. Please rename 'content' to 'sections'."
      );
    } else {
      errors.push("Missing or invalid 'sections' array (or 'pages' object)");
    }
  } else {
    // Validate each section (Single Page Mode)
    config.sections.forEach((section: any, index: number) => {
      validateSection(section, index, errors);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSection(
  section: any,
  index: number,
  errors: string[],
  pageContext?: string
) {
  const prefix = pageContext
    ? `Page [${pageContext}] Section [${index}]`
    : `Section [${index}]`;

  // SMART CHEF VOCABULARY (Sync with generate-page.post.ts)
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
  ];

  if (!section.type) {
    errors.push(`${prefix} missing 'type'`);
    return;
  }
  // Loose casing check (normalize handles this, but validate should be safe)
  const typeLower =
    section.type.charAt(0).toLowerCase() + section.type.slice(1);
  if (!VOCABULARY.includes(typeLower) && !VOCABULARY.includes(section.type)) {
    errors.push(
      `${prefix} has unknown type '${section.type}'. Allowed: ${VOCABULARY.join(
        ", "
      )}`
    );
  }

  if (!section.id) {
    errors.push(`${prefix} (${section.type}) missing 'id'`);
  }

  // Specific checks per type
  switch (section.type) {
    case "hero":
      if (!section.headline) errors.push(`${prefix} (hero) missing 'headline'`);
      break;
    case "features":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (features) missing 'items' array`);
      break;
    case "testimonials":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (testimonials) missing 'items' array`);
      break;
    case "pricing":
      if (!Array.isArray(section.plans))
        errors.push(`${prefix} (pricing) missing 'plans' array`);
      break;
    case "stats":
      if (!Array.isArray(section.items))
        errors.push(`${prefix} (stats) missing 'items' array`);
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
