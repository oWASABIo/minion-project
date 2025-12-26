import type { Pagetemplate, Stack, Section } from "../types/landing";

export type StackSpec = {
  label: string;
  description: string;
  allowedSections: Set<string>;
  defaultOrder: (template: Pagetemplate) => string[];
  constraints: {
    hero?: { allowedVariants: string[]; defaultVariant: string };
    blogList?: { forceSourcetemplate?: string };
    cta?: { allowedVariants: string[]; defaultVariant: string };
  };
};

const COMMON_SECTIONS = new Set([
  "hero",
  "features",
  "testimonials",
  "faq",
  "blogList",
  "cta",
  "pricing",
  "stats",
  "team",
]);

export const STACK_SPECS: Record<Stack, StackSpec> = {
  nuxt: {
    label: "Nuxt 3 Starter",
    description: "Modern Vue 3 + Nuxt 4 stack with TailwindCSS.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      if (template === "company")
        return ["hero", "features", "testimonials", "cta"];
      if (template === "blog") return ["hero", "blogList", "cta"];
      return ["hero", "features", "testimonials", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "split", "left", "right"],
        defaultVariant: "center",
      },
    },
  },
  "vue-vite": {
    label: "Vue 3 + Vite",
    description: "Pure Vue 3 with Vite for maximum speed.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      // Same as Nuxt for now
      if (template === "company")
        return ["hero", "features", "testimonials", "cta"];
      return ["hero", "features", "testimonials", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "split", "left", "right"],
        defaultVariant: "center",
      },
    },
  },
  nextjs: {
    label: "Next.js Starter",
    description: "A robust React framework starter.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      // Next.js users often prefer simpler, conversion-focused layouts
      if (template === "landing")
        return ["hero", "features", "testimonials", "cta"];
      return ["hero", "features", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["split", "center"], // Next.js spec might be more opinionated
        defaultVariant: "split",
      },
    },
  },
  "wordpress-theme": {
    label: "WordPress Theme (Headless)",
    description: "Headless setup using WordPress as CMS.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      // WP sites almost always have a blog list
      return ["hero", "features", "blogList", "testimonials", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "left"], // Traditional WP style
        defaultVariant: "center",
      },
      blogList: {
        forceSourcetemplate: "wordpress", // Must use WP
      },
    },
  },
};

export function getStackSpec(stack: Stack = "nuxt"): StackSpec {
  return STACK_SPECS[stack] || STACK_SPECS["nuxt"];
}

export function enforceStackConstraints(
  section: Section,
  stack: Stack
): Section {
  const spec = getStackSpec(stack);
  const type = section.type;

  // 1. Check if section is allowed
  if (!spec.allowedSections.has(type)) {
    // If not allowed, we might return null or turn it into a generic replacement?
    // For now, let's keep it but maybe warn in meta?
    // Or strictly: return section as is, but maybe the UI won't render it well.
    // Better strategy: Try to adapt.
  }

  // 2. Apply specifics
  if (type === "hero" && spec.constraints.hero) {
    const s = section as any;
    const allowed = spec.constraints.hero.allowedVariants;
    if (!allowed.includes(s.variant)) {
      s.variant = spec.constraints.hero.defaultVariant;
    }
  }

  if (type === "blogList" && spec.constraints.blogList) {
    const s = section as any;
    if (spec.constraints.blogList.forceSourcetemplate) {
      if (!s.source) s.source = {};
      s.source.template = spec.constraints.blogList.forceSourcetemplate;
    }
  }

  return section;
}
