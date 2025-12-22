import type { Pagetemplate } from "@minions/shared";

export type templateSpec = {
  label: string;
  description: string;
  defaultSectionOrder: string[];
  requiredSections: string[]; // Sections that must be present
  promptFocus: string; // Instruction for AI to focus on specific content
};

export const template_SPECS: Record<Pagetemplate, templateSpec> = {
  landing: {
    label: "Landing Page",
    description: "High conversion page for products or services.",
    defaultSectionOrder: [
      "hero",
      "features",
      "pricing",
      "testimonials",
      "faq",
      "cta",
    ],
    requiredSections: ["hero", "cta"],
    promptFocus:
      "Focus on conversion, clear value proposition, and call to action. Use persuasive copy.",
  },
  company: {
    label: "Company Site",
    description: "Corporate or agency website focusing on trust and brand.",
    defaultSectionOrder: [
      "hero",
      "features",
      "stats",
      "team",
      "testimonials",
      "cta",
    ], // features here implies services/about
    requiredSections: ["hero"],
    promptFocus:
      "Focus on trust, professional tone, company values, and services offered. Use 'About Us' style content.",
  },
  blog: {
    label: "Blog / News",
    description: "Content-focused site with article listings.",
    defaultSectionOrder: ["hero", "blogList", "cta"],
    requiredSections: ["blogList"],
    promptFocus:
      "Focus on content discovery. The hero should highlight the latest news or main category. Ensure the blog list is prominent.",
  },
  ecommerce: {
    label: "E-Commerce",
    description: "Online store front for selling products.",
    defaultSectionOrder: ["hero", "features", "productList", "testimonials"],
    requiredSections: ["hero", "productList"],
    promptFocus:
      "Focus on product showcasing. Use 'features' section to highlight categories. Ensure 'productList' shows top selling items.",
  },
  portfolio: {
    label: "Portfolio",
    description: "Showcase work and case studies for creatives.",
    defaultSectionOrder: ["hero", "features", "testimonials", "cta"],
    requiredSections: ["hero", "features"],
    promptFocus:
      "Focus on visual impact, showcasing projects (use features section for this), and clear contact info.",
  },
  saas: {
    label: "SaaS / Startup",
    description: "High-growth B2B or B2C software product sites.",
    defaultSectionOrder: [
      "hero",
      "stats",
      "features",
      "testimonials",
      "pricing",
      "faq",
      "cta",
    ],
    requiredSections: ["hero", "pricing", "cta"],
    promptFocus:
      "Focus on problem-solution fit, ROI metrics (stats), main features, and clear tiered pricing.",
  },
};

export function gettemplateSpec(template: string): templateSpec {
  return template_SPECS[template as Pagetemplate] || template_SPECS["landing"];
}
