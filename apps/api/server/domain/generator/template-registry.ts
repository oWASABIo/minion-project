import type {
  PageConfig,
  Stack,
  Pagetemplate,
  Section,
  SectionType,
  ProjectConfig,
  TemplateDefinition,
} from "@minions/shared";

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  // --- SaaS Templates ---
  {
    id: "saas-b2b",
    label: "B2B Enterprise SaaS",
    template: "saas",
    description: "Trust-focused layout for enterprise software.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: [
          "hero",
          "stats", // Social Proof first
          "features",
          "testimonials",
          "pricing",
          "faq",
          "cta",
        ],
        promptFocus:
          "Enterprise B2B SaaS for {brief}. Focus on security, scale, and ROI. Use authoritative tone.",
      },
      {
        id: "pricing",
        route: "/pricing",
        structure: ["hero", "pricing", "faq", "cta"],
        promptFocus:
          "Detailed pricing tiers for {brief}. FAQ about enterprise licenses.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "team", "cta"], // 'Talk to Sales'
        promptFocus: "Contact sales for {brief}. Offices and support.",
      },
    ],
  },
  {
    id: "saas-ai",
    label: "AI Startup Launch",
    template: "saas",
    description: "Futuristic, dark-mode ready layout for AI tools.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"], // Simpler for early stage
        promptFocus:
          "AI tool launch for {brief}. Focus on 'Magic' and speed. Futuristic tone.",
      },
      {
        id: "features",
        route: "/features",
        structure: ["hero", "features", "cta"],
        promptFocus: "Deep dive into AI capabilities of {brief}.",
      },
    ],
  },

  // --- Landing Page Templates ---
  {
    id: "landing-saas-v1",
    label: "SaaS Product Launch",
    template: "landing",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "testimonials", "pricing", "cta"],
        promptFocus:
          "High converting SaaS landing page for {brief}. Focus on benefits and trust.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "stats", "cta"],
        promptFocus:
          "About the company building {brief}. Mission driven and professional.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Contact support for {brief}. FAQ included.",
      },
    ],
  },
  {
    id: "landing-mobile-app",
    label: "Mobile App Showcase",
    template: "landing",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"], // Simplified for app
        promptFocus:
          "Mobile app showcase for {brief}. Focus on screenshots and download links.",
      },
      {
        id: "features",
        route: "/features",
        structure: ["hero", "features", "cta"],
        promptFocus: "Detailed features of the app {brief}.",
      },
    ],
  },

  // --- Company Templates ---
  {
    id: "company-corporate",
    label: "Modern Corporate",
    template: "company",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "cta"],
        promptFocus:
          "Corporate website for {brief}. Trustworthy and established.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "testimonials", "cta"],
        promptFocus: "History and leadership of {brief}.",
      },
      {
        id: "services",
        route: "/services",
        structure: ["hero", "features", "pricing", "cta"],
        promptFocus: "Professional services offered by {brief}.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Get in touch with {brief}.",
      },
    ],
  },

  // --- Blog Templates ---
  {
    id: "blog-personal",
    label: "Personal Brand",
    template: "blog",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "blogList", "cta"],
        promptFocus: "Personal blog of an expert in {brief}.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats", "cta"], // Stats = years experience etc
        promptFocus: "About the author of {brief}.",
      },
    ],
  },

  // --- Ecommerce Templates ---
  {
    id: "ecommerce-store",
    label: "Brand Store",
    template: "ecommerce",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "productList", "testimonials"], // Product list not yet implemented as section type, reusing features
        promptFocus: "Storefront for {brief}. Highlight best sellers.",
      },
      {
        id: "shop",
        route: "/shop",
        structure: ["hero", "productList"],
        promptFocus: "Full product catalog for {brief}. Organized grid.",
      },
      {
        id: "product-detail",
        route: "/product/:id",
        structure: ["productDetail", "productList"], // productList here acts as "Related Products"
        promptFocus:
          "Single product view. Focus on details and conversion. RELATED SECTION is mandatory.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats", "team"],
        promptFocus: "Our story and craftsmanship for {brief}.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq"],
        promptFocus: "Customer support for {brief}.",
      },
    ],
  },

  // --- Creative / Portfolio Templates ---
  {
    id: "portfolio-creative",
    label: "Creative Portfolio",
    template: "portfolio",
    description: "Visual-heavy layout for creatives and agencies.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "testimonials", "cta"], // features as Grid
        promptFocus:
          "Creative portfolio for {brief}. Focus on visual impact and past work. Use features section to showcase projects grid.",
      },
      {
        id: "projects",
        route: "/projects",
        structure: ["hero", "features"], // Project list
        promptFocus: "Full list of projects by {brief}.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "team", "stats", "cta"],
        promptFocus: "Our creative philosophy and the team behind {brief}.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "faq", "cta"],
        promptFocus: "Work with us. Contact {brief}.",
      },
    ],
  },
  {
    id: "portfolio-minimal",
    label: "Minimalist Folio",
    template: "portfolio",
    description: "Clean, text-forward portfolio for writers or strategists.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "blogList", "cta"], // blogList as 'Case Studies'
        promptFocus:
          "Minimalist portfolio for {brief}. Focus on typography and case studies (blog list).",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "stats"],
        promptFocus: "Bio and achievements of {brief}.",
      },
    ],
  },

  // --- Service Business ---
  {
    id: "company-service",
    label: "Local Service Business",
    template: "company",
    description: "Perfect for local businesses and service providers.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "stats", "testimonials", "faq", "cta"],
        promptFocus:
          "Local service business website for {brief}. Trust and reliability.",
      },
      {
        id: "services",
        route: "/services",
        structure: ["hero", "features", "pricing", "cta"],
        promptFocus: "Services and packages offered by {brief}.",
      },
      {
        id: "contact",
        route: "/contact",
        structure: ["hero", "team", "cta"],
        promptFocus: "Get a quote from {brief}.",
      },
    ],
  },
];

export function getRandomTemplate(
  template: string,
  seed: number
): TemplateDefinition {
  const candidates = TEMPLATE_REGISTRY.filter((t) => t.template === template);
  if (candidates.length === 0) {
    // Fallback if template unknown, stick to generic landing
    return TEMPLATE_REGISTRY[0];
  }
  // Deterministic random
  const idx = Math.abs(seed) % candidates.length;
  return candidates[idx];
}
