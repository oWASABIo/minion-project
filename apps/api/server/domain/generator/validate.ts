import type { PageConfig, Section } from "@minions/shared";

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

  if (!Array.isArray(config.sections)) {
    if (config.content && Array.isArray(config.content)) {
      errors.push(
        "Found 'content' array but expected 'sections'. Please rename 'content' to 'sections'."
      );
    } else {
      errors.push("Missing or invalid 'sections' array");
    }
  } else {
    // Validate each section
    config.sections.forEach((section: any, index: number) => {
      if (!section.type) {
        errors.push(`Section [${index}] missing 'type'`);
        return;
      }
      if (!section.id) {
        errors.push(`Section [${index}] (${section.type}) missing 'id'`);
      }

      // Specific checks per type
      switch (section.type) {
        case "hero":
          if (!section.headline)
            errors.push(`Section [${index}] (hero) missing 'headline'`);
          break;
        case "features":
          if (!Array.isArray(section.items))
            errors.push(`Section [${index}] (features) missing 'items' array`);
          break;
        case "testimonials":
          if (!Array.isArray(section.items))
            errors.push(
              `Section [${index}] (testimonials) missing 'items' array`
            );
          break;
        case "pricing":
          if (!Array.isArray(section.plans))
            errors.push(`Section [${index}] (pricing) missing 'plans' array`);
          break;
        case "stats":
          if (!Array.isArray(section.items))
            errors.push(`Section [${index}] (stats) missing 'items' array`);
          break;
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
