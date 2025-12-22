import {
  u as useRuntimeConfig,
  d as defineEventHandler,
  c as setResponseHeader,
  r as readBody,
  e as createError,
  b as sendStream,
} from "../../nitro/nitro.mjs";
import { PassThrough } from "stream";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "node:http";
import "node:https";
import "node:events";
import "node:buffer";
import "node:fs";
import "node:path";
import "node:crypto";
import "node:url";

const TEMPLATE_REGISTRY = [
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
        structure: ["hero", "features", "stats", "cta"],
        // Simplified for app
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
        structure: ["hero", "stats", "cta"],
        // Stats = years experience etc
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
        structure: ["hero", "features", "testimonials", "cta"],
        // Product list not yet implemented as section type, reusing features
        promptFocus: "Storefront for {brief}. Highlight best sellers.",
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
        structure: ["hero", "faq", "cta"],
        promptFocus: "Customer support for {brief}.",
      },
    ],
  },
  // --- Creative / Portfolio Templates ---
  {
    id: "landing-creative",
    label: "Creative Portfolio",
    template: "landing",
    description: "Visual-heavy layout for creatives and agencies.",
    pages: [
      {
        id: "home",
        route: "/",
        structure: ["hero", "features", "testimonials", "cta"],
        promptFocus:
          "Creative portfolio for {brief}. Focus on visual impact and past work.",
      },
      {
        id: "about",
        route: "/about",
        structure: ["hero", "features", "team", "cta"],
        // Features used as 'Our Values'
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
function getRandomTemplate(template, seed) {
  const candidates = TEMPLATE_REGISTRY.filter((t) => t.template === template);
  if (candidates.length === 0) {
    return TEMPLATE_REGISTRY[0];
  }
  const idx = Math.abs(seed) % candidates.length;
  return candidates[idx];
}

const COMMON_SECTIONS = /* @__PURE__ */ new Set([
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
const STACK_SPECS = {
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
      if (template === "landing")
        return ["hero", "features", "testimonials", "cta"];
      return ["hero", "features", "faq", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["split", "center"],
        // Next.js spec might be more opinionated
        defaultVariant: "split",
      },
    },
  },
  "wordpress-theme": {
    label: "WordPress Theme (Headless)",
    description: "Headless setup using WordPress as CMS.",
    allowedSections: COMMON_SECTIONS,
    defaultOrder: (template) => {
      return ["hero", "features", "blogList", "testimonials", "cta"];
    },
    constraints: {
      hero: {
        allowedVariants: ["center", "left"],
        // Traditional WP style
        defaultVariant: "center",
      },
      blogList: {
        forceSourcetemplate: "wordpress",
        // Must use WP
      },
    },
  },
};
function getStackSpec(stack = "nuxt") {
  return STACK_SPECS[stack] || STACK_SPECS["nuxt"];
}
function enforceStackConstraints(section, stack) {
  const spec = getStackSpec(stack);
  const type = section.type;
  if (!spec.allowedSections.has(type));
  if (type === "hero" && spec.constraints.hero) {
    const s = section;
    const allowed = spec.constraints.hero.allowedVariants;
    if (!allowed.includes(s.variant)) {
      s.variant = spec.constraints.hero.defaultVariant;
    }
  }
  if (type === "blogList" && spec.constraints.blogList) {
    const s = section;
    if (spec.constraints.blogList.forceSourcetemplate) {
      if (!s.source) s.source = {};
      s.source.template = spec.constraints.blogList.forceSourcetemplate;
    }
  }
  return section;
}

const template_SPECS = {
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
    ],
    // features here implies services/about
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
    defaultSectionOrder: ["hero", "features", "testimonials", "cta"],
    // features -> product categories?
    requiredSections: ["hero", "cta"],
    promptFocus:
      "Focus on product showcasing. Use 'features' section to highlight top categories or product benefits.",
  },
};
function gettemplateSpec(template) {
  return template_SPECS[template] || template_SPECS["landing"];
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function pick(arr, n) {
  return arr[Math.abs(n) % arr.length];
}
function makeAccent(template, seed, brief, stack) {
  const palette = [
    "#4f46e5",
    // Indigo
    "#06b6d4",
    // Cyan
    "#22c55e",
    // Green
    "#f97316",
    // Orange
    "#ec4899",
    // Pink
    "#a855f7",
    // Purple
    "#eab308",
    // Yellow
    "#ef4444",
    // Red
    "#14b8a6",
    // Teal
    "#3b82f6",
    // Blue
    "#8b5cf6",
    // Violet
    "#d946ef",
    // Fuchsia
    "#f43f5e",
    // Rose
    "#84cc16",
    // Lime
    "#0ea5e9",
    // Sky
  ];
  const h = hashString(`${template}|${stack}|${seed}|${brief}`);
  return pick(palette, h);
}
function titleFromBrief(brief, fallback) {
  const t = (brief || "").trim();
  if (!t) return fallback;
  return t.split("\n")[0].slice(0, 48);
}
function buildMockProject(opts) {
  const { template, brief, stack, seed } = opts;
  const template = getRandomTemplate(template, seed);
  const themeMode = seed % 2 === 0 ? "dark" : "light";
  const pages = {};
  for (const pageDef of template.pages) {
    const pageBrief = `${brief}. ${pageDef.promptFocus}`;
    const pageSeed = seed + hashString(pageDef.id);
    pages[pageDef.id] = buildMockPageConfig({
      ...opts,
      template,
      // Keep project template, but structure is overriden
      brief: pageBrief,
      seed: pageSeed,
      structure: pageDef.structure,
      // Explicit structure from template
      themeMode,
      // Pass consistent theme
    });
  }
  return {
    template,
    templateId: template.id,
    site: {
      siteName: titleFromBrief(brief, "Generated Site"),
      tagline: "Generated by MINIONS",
      primaryColor: makeAccent(template, seed, brief, stack),
      themeMode,
    },
    backend: {
      cms: "wordpress",
      wordpress: opts.wordpressBaseUrl
        ? { baseUrl: opts.wordpressBaseUrl, restBase: opts.wordpressRestBase }
        : { baseUrl: "", restBase: opts.wordpressRestBase },
    },
    pages,
    meta: {
      mode: "mock",
      generatedAt: /* @__PURE__ */ new Date().toISOString(),
      seed,
      stack,
    },
  };
}
function buildMockPageConfig(opts) {
  const { template, brief, stack, seed } = opts;
  const h = hashString(`${template}|${stack}|${seed}|${brief}`);
  const stackSpec = getStackSpec(stack);
  const templateSpec = gettemplateSpec(template);
  opts.themeMode || (seed % 2 === 0 ? "dark" : "light");
  function shuffle(array, seed2) {
    const copy = [...array];
    let m = copy.length,
      t,
      i;
    let s = seed2 % 2147483647;
    if (s <= 0) s += 2147483646;
    const next = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    while (m) {
      i = Math.floor(next() * m--);
      t = copy[m];
      copy[m] = copy[i];
      copy[i] = t;
    }
    return copy;
  }
  let baseSections = [];
  if (opts.structure) {
    baseSections = [...opts.structure];
  } else {
    const defaultOrder = templateSpec.defaultSectionOrder;
    const hasHero = defaultOrder[0] === "hero";
    const hasCta = defaultOrder[defaultOrder.length - 1] === "cta";
    let middle = defaultOrder.slice(
      hasHero ? 1 : 0,
      hasCta ? defaultOrder.length - 1 : defaultOrder.length
    );
    middle = shuffle(middle, h);
    baseSections = [
      ...(hasHero ? ["hero"] : []),
      ...middle,
      ...(hasCta ? ["cta"] : []),
    ];
  }
  const wpBaseUrl = (opts.wordpressBaseUrl || "").trim() || "";
  const wpRestBase = (opts.wordpressRestBase || "").trim() || "/wp-json/wp/v2";
  const siteName = titleFromBrief(brief, "Generated Preview");
  const accent = makeAccent(template, seed, brief, stack);
  const sections = baseSections.map((t, idx) => {
    const secHash = h + idx * 13;
    const ctx = { h: secHash, stackSpec, stack, seed, siteName, wpBaseUrl };
    switch (t) {
      case "hero":
        return mockHero(ctx);
      case "features":
        return mockFeatures(ctx);
      case "testimonials":
        return mockTestimonials(ctx);
      case "faq":
        return mockFaq();
      case "blogList":
        return mockBlogList(ctx);
      case "pricing":
        return mockPricing();
      case "stats":
        return mockStats();
      case "team":
        return mockTeam();
      case "cta":
        return mockCta(ctx);
      default:
        return mockCta(ctx);
    }
  });
  const page = {
    template,
    site: {
      siteName,
      tagline: "Generated by MINIONS",
      primaryColor: accent,
    },
    backend: {
      cms: "wordpress",
      wordpress: wpBaseUrl
        ? { baseUrl: wpBaseUrl, restBase: wpRestBase }
        : { baseUrl: "", restBase: wpRestBase },
    },
    sections,
    meta: {
      mode: "mock",
      generatedAt: /* @__PURE__ */ new Date().toISOString(),
      seed,
      stack,
      note: "Mock generator via Stack Spec.",
    },
  };
  return page;
}
function mockHero(ctx) {
  var _a;
  const allowedVars = ((_a = ctx.stackSpec.constraints.hero) == null
    ? void 0
    : _a.allowedVariants) || ["center"];
  const variant = pick(allowedVars, ctx.h);
  return {
    id: "hero-main",
    type: "hero",
    variant,
    eyebrow: `${ctx.stackSpec.label} Concept`.toUpperCase(),
    headline:
      variant === "split"
        ? `Your Idea: ${ctx.siteName}`
        : `Build ${ctx.siteName} with ${ctx.stackSpec.label}`,
    subheadline:
      "This is a mock generated based on your brief, seed, and selected stack constraints.",
    primaryCta: { label: "Generate (Live)", href: "#get-started" },
    secondaryCta: { label: "Learn More", href: "#examples" },
  };
}
function mockFeatures(ctx) {
  return {
    id: "features-main",
    type: "features",
    title: pick(
      ["Key Features", "Why Us?", "Highlights", "Core Benefits"],
      ctx.h
    ),
    subtitle: `Optimized for ${ctx.stackSpec.label} architecture.`,
    items: [
      {
        title: "Stack Optimized",
        description: `Generated specifically for ${ctx.stack} conventions.`,
      },
      {
        title: "Deterministic Mock",
        description: `Same seed (${ctx.seed}) = Same result.`,
      },
      {
        title: "Customizable",
        description: "Edit brief to change the tone/content keywords.",
      },
    ],
  };
}
function mockTestimonials(ctx) {
  return {
    id: "testimonials-main",
    type: "testimonials",
    title: "Testimonials",
    items: [
      {
        quote: `The ${ctx.stack} output structure is exactly what I needed.`,
        name: "Alex",
        role: "Developer",
      },
      {
        quote: "Mock generation is super fast and consistent.",
        name: "Sarah",
        role: "Product Manager",
      },
    ],
  };
}
function mockFaq(ctx) {
  return {
    id: "faq-main",
    type: "faq",
    title: "Frequently Asked Questions",
    items: [
      {
        q: "How does the stack selection affect output?",
        a: "It changes section ordering, constraints, and constraints valid for that framework.",
      },
      {
        q: "Can I export this?",
        a: "Yes, you can export the JSON config using the Export panel.",
      },
    ],
  };
}
function mockBlogList(ctx) {
  var _a;
  return {
    id: "blog-latest",
    type: "blogList",
    title: ctx.wpBaseUrl ? "From the Blog" : "Blog (Configure WP)",
    subtitle:
      ctx.wpBaseUrl ||
      ((_a = ctx.stackSpec.constraints.blogList) == null
        ? void 0
        : _a.forceSourcetemplate) === "wordpress"
        ? "Fetching from WordPress API"
        : "Connect your CMS to see real posts",
    maxItems: 3,
    source: {
      template: "wordpress",
      endpoint: "/posts?per_page=3&_embed",
    },
  };
}
function mockPricing(ctx) {
  return {
    id: "pricing-main",
    type: "pricing",
    title: "Simple, Transparent Pricing",
    subtitle: "Choose the plan that's right for you.",
    plans: [
      {
        name: "Starter",
        price: "$0",
        period: "/mo",
        description: "Perfect for hobbyists.",
        features: ["1 Project", "Community Support", "Basic Analytics"],
        cta: { label: "Start Free", href: "#free" },
      },
      {
        name: "Pro",
        price: "$29",
        period: "/mo",
        isPopular: true,
        description: "For serious developers.",
        features: [
          "Unlimited Projects",
          "Priority Support",
          "Advanced Analytics",
          "Custom Domain",
        ],
        cta: { label: "Get Pro", href: "#pro" },
      },
      {
        name: "Enterprise",
        price: "$99",
        period: "/mo",
        description: "For large teams.",
        features: [
          "SSO Integration",
          "Dedicated Success Manager",
          "SLA",
          "Audit Logs",
        ],
        cta: { label: "Contact Sales", href: "#contact" },
      },
    ],
  };
}
function mockStats(ctx) {
  return {
    id: "stats-main",
    type: "stats",
    title: "Trusted by Developers",
    variant: "card",
    items: [
      { value: "10k+", label: "Active Users", description: "Growing daily" },
      {
        value: "99.9%",
        label: "Uptime",
        description: "Enterprise grade reliability",
      },
      { value: "24/7", label: "Support", description: "We are always here" },
      { value: "500+", label: "Components", description: "Ready to use" },
    ],
  };
}
function mockTeam(ctx) {
  return {
    id: "team-main",
    type: "team",
    title: "Meet the Team",
    subtitle: "The experts behind the magic.",
    members: [
      {
        name: "Sarah Chen",
        role: "CEO & Founder",
        bio: "Visionary leader with 10+ years in Tech.",
      },
      {
        name: "David Miller",
        role: "CTO",
        bio: "Full stack wizard and open source contributor.",
      },
      {
        name: "Emily Davis",
        role: "Head of Design",
        bio: "Creating beautiful pixels and user experiences.",
      },
      {
        name: "Michael Wilson",
        role: "Lead Engineer",
        bio: "Architecting scalable systems.",
      },
    ],
  };
}
function mockCta(ctx) {
  return {
    id: "cta-bottom",
    type: "cta",
    title: "Ready to launch?",
    headline: "Start building today",
    subheadline: `Get your ${ctx.stackSpec.label} starter kit now.`,
    primaryCta: { label: "Get Started", href: "#get-started" },
  };
}

const KNOWN_BLOCKS = /* @__PURE__ */ new Set([
  "site",
  "style",
  "content",
  "wordpress",
  "config",
]);
function setNested(d, block, key, value) {
  const v = value.trim();
  if (!v) return;
  if (block === "site") {
    d.site || (d.site = {});
    if (key === "siteName") d.site.siteName = v;
    if (key === "tagline") d.site.tagline = v;
    if (key === "primaryColor") d.site.primaryColor = v;
    return;
  }
  if (block === "style") {
    d.style || (d.style = {});
    if (key === "tone") d.style.tone = v;
    if (key === "language") d.style.language = v;
    if (key === "keywords") d.style.keywords = v;
    return;
  }
  if (block === "wordpress") {
    d.wordpress || (d.wordpress = {});
    if (key === "baseUrl") d.wordpress.baseUrl = v;
    if (key === "restBase") d.wordpress.restBase = v;
    if (key === "postsEndpoint") d.wordpress.postsEndpoint = v;
    return;
  }
  if (block === "config") {
    d.config || (d.config = {});
    if (key === "seed") {
      const n = parseInt(v, 10);
      if (!isNaN(n)) d.config.seed = n;
    }
    return;
  }
  if (block === "content") {
    d.content || (d.content = {});
    d.content[key] = v;
  }
}
function parsePromptPattern(input) {
  const text = (input || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const directives = {};
  const free = [];
  let currentBlock = null;
  for (const rawLine of lines) {
    let line = rawLine.split("//")[0].trim();
    if (!line) continue;
    const m = line.match(/^\[([a-zA-Z0-9_-]+)\]$/);
    if (m) {
      const name = m[1].toLowerCase();
      currentBlock = KNOWN_BLOCKS.has(name) ? name : null;
      continue;
    }
    if (currentBlock) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      setNested(directives, currentBlock, key, value);
      continue;
    }
    free.push(line);
  }
  const cleanBrief = free.join("\n").trim();
  return { cleanBrief, directives };
}

const toStr = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));
function normalizePageConfig(input, opts) {
  var _a, _b, _c, _d;
  const out = input && typeof input === "object" ? { ...input } : {};
  out.template = toStr(out.template) || opts.template;
  out.stack = toStr(out.stack) || opts.stack;
  const siteFromRoot = {
    siteName: toStr(out.siteName) || "",
    tagline: toStr(out.tagline) || "",
    primaryColor: toStr(out.primaryColor) || "",
  };
  out.site = out.site && typeof out.site === "object" ? { ...out.site } : {};
  out.site.siteName =
    toStr(out.site.siteName) || siteFromRoot.siteName || "Generated Preview";
  out.site.tagline = toStr(out.site.tagline) || siteFromRoot.tagline || "";
  out.site.primaryColor =
    toStr(out.site.primaryColor) || siteFromRoot.primaryColor || "#4f46e5";
  const baseUrl = (
    opts.wordpressBaseUrl ||
    ((_b = (_a = out.backend) == null ? void 0 : _a.wordpress) == null
      ? void 0
      : _b.baseUrl) ||
    ""
  ).trim();
  const restBase = (
    opts.wordpressRestBase ||
    ((_d = (_c = out.backend) == null ? void 0 : _c.wordpress) == null
      ? void 0
      : _d.restBase) ||
    "/wp-json/wp/v2"
  ).trim();
  if (baseUrl) {
    out.backend =
      out.backend && typeof out.backend === "object" ? { ...out.backend } : {};
    out.backend.cms = "wordpress";
    out.backend.wordpress = { baseUrl, restBase };
  }
  const sections = Array.isArray(out.sections) ? out.sections : [];
  out.sections = sections.map((sec, i) => {
    var _a2;
    const obj = sec && typeof sec === "object" ? sec : {};
    const merged = {
      ...obj,
      ...(obj.content && typeof obj.content === "object" ? obj.content : {}),
    };
    delete merged.content;
    let t = toStr(merged.type) || "hero";
    if (t === "bloglist") t = "blogList";
    merged.type = t;
    merged.id = toStr(merged.id) || `${merged.type}-${i + 1}`;
    if (merged.type === "hero") {
      merged.headline =
        toStr(merged.headline) || toStr(merged.title) || "Generated Preview";
      merged.subheadline =
        toStr(merged.subheadline) || toStr(merged.subtitle) || "";
      if (!merged.image) {
        merged.image = `https://picsum.photos/seed/${opts.seed + i}/800/600`;
      }
    }
    if (merged.type === "features") {
      merged.title = toStr(merged.title) || "Features";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      merged.items = Array.isArray(merged.items)
        ? merged.items.map((it) => ({
            title: toStr(it == null ? void 0 : it.title) || "Feature",
            description: toStr(it == null ? void 0 : it.description) || "",
          }))
        : [];
    }
    if (merged.type === "testimonials") {
      merged.title = toStr(merged.title) || "Testimonials";
      merged.items = Array.isArray(merged.items)
        ? merged.items.map((it) => ({
            quote: toStr(it == null ? void 0 : it.quote) || "",
            name: toStr(it == null ? void 0 : it.name) || "",
            role: toStr(it == null ? void 0 : it.role) || void 0,
          }))
        : [];
    }
    if (merged.type === "team") {
      merged.title = toStr(merged.title) || "Our Team";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      merged.items = [];
      merged.members = Array.isArray(merged.members)
        ? merged.members.map((it, midx) => ({
            name: toStr(it == null ? void 0 : it.name) || "Member Name",
            role: toStr(it == null ? void 0 : it.role) || "Role",
            bio: toStr(it == null ? void 0 : it.bio),
            // ✅ Phase 9: Inject Avatar
            avatar:
              toStr(it == null ? void 0 : it.avatar) ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                toStr(it == null ? void 0 : it.name) || opts.seed + i + midx
              }`,
            socials: (it == null ? void 0 : it.socials) || {},
          }))
        : [];
    }
    if (merged.type === "faq") {
      merged.title = toStr(merged.title) || "FAQ";
      if (Array.isArray(merged.items)) {
        merged.items = merged.items.map((it) => ({
          q:
            toStr(it == null ? void 0 : it.q) ||
            toStr(it == null ? void 0 : it.question) ||
            "",
          a:
            toStr(it == null ? void 0 : it.a) ||
            toStr(it == null ? void 0 : it.answer) ||
            "",
        }));
      } else {
        merged.items = [];
      }
    }
    if (merged.type === "cta") {
      merged.headline =
        toStr(merged.headline) || toStr(merged.title) || "Call to action";
      const desc = toStr(merged.description);
      const sub = toStr(merged.subheadline) || toStr(merged.subtitle);
      merged.subheadline = sub || desc || "";
      merged.description = desc || merged.subheadline || "";
      if (!merged.primaryCta || typeof merged.primaryCta !== "object") {
        merged.primaryCta = { label: "Get started", href: "#get-started" };
      } else {
        merged.primaryCta = {
          label: toStr(merged.primaryCta.label) || "Get started",
          href: toStr(merged.primaryCta.href) || "#get-started",
        };
      }
      if (merged.secondaryCta && typeof merged.secondaryCta === "object") {
        merged.secondaryCta = {
          label: toStr(merged.secondaryCta.label) || "Learn more",
          href: toStr(merged.secondaryCta.href) || "#",
        };
      }
    }
    if (merged.type === "blogList") {
      const postsEndpoint =
        toStr(merged.postsEndpoint) ||
        toStr((_a2 = merged.source) == null ? void 0 : _a2.endpoint);
      merged.source =
        merged.source && typeof merged.source === "object"
          ? { ...merged.source }
          : { template: "wordpress", endpoint: "" };
      merged.source.template = toStr(merged.source.template) || "wordpress";
      merged.source.endpoint = postsEndpoint || "/posts?per_page=3&_embed";
      merged.title = toStr(merged.title) || "Latest from WordPress";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      if (merged.layout != null) merged.layout = toStr(merged.layout);
      if (typeof merged.maxItems !== "number") merged.maxItems = 3;
    }
    return enforceStackConstraints(merged, out.stack);
  });
  out.meta = out.meta && typeof out.meta === "object" ? { ...out.meta } : {};
  out.meta.mode = opts.mode;
  out.meta.seed = opts.seed;
  out.meta.stack = toStr(out.meta.stack) || out.stack || opts.stack;
  return out;
}

let keyRing = [];
let currentIndex = 0;
let genAIInstances = [];
function initKeys() {
  if (keyRing.length > 0) return;
  const config = useRuntimeConfig();
  const rawKeys = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
  if (!rawKeys) {
    throw new Error("Missing GEMINI_API_KEY");
  }
  keyRing = rawKeys
    .split(",")
    .map((k) => k.trim().replace(/^["']|["']$/g, ""))
    .filter((k) => k);
  if (keyRing.length === 0) {
    throw new Error("No valid keys found in GEMINI_API_KEY");
  }
  console.log(`[Gemini] Initialized with ${keyRing.length} keys.`);
  keyRing.forEach((k, i) =>
    console.log(
      `[Gemini] Loaded Key ${i}: ${k.slice(0, 4)}...(${k.length} chars)`
    )
  );
  genAIInstances = keyRing.map((k) => new GoogleGenerativeAI(k));
}
function getCurrentModel() {
  initKeys();
  const instance = genAIInstances[currentIndex];
  const config = useRuntimeConfig();
  let modelName = config.geminiModel || "gemini-flash-latest";
  if (modelName.includes("gemini-1.5") || modelName.includes("flash")) {
    modelName = "gemini-flash-latest";
  }
  return instance.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });
}
function rotateKey() {
  const prevIndex = currentIndex;
  currentIndex = (currentIndex + 1) % keyRing.length;
  console.warn(
    `[Gemini] Rotating key from index ${prevIndex} to ${currentIndex}`
  );
}
async function generateContentWithRetry(prompt, maxRetries = 3) {
  initKeys();
  const totalAttempts = Math.max(genAIInstances.length * 2, maxRetries);
  let lastError = null;
  for (let i = 0; i < totalAttempts; i++) {
    try {
      const model = getCurrentModel();
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      lastError = err;
      const msg = err.message || "";
      const isQuota =
        msg.includes("429") ||
        msg.includes("Quota") ||
        msg.includes("Resource has been exhausted");
      const isServer =
        msg.includes("503") ||
        msg.includes("Overloaded") ||
        msg.includes("500");
      const isInvalidKey =
        msg.includes("API key not valid") || msg.includes("API_KEY_INVALID");
      if (isQuota) {
        console.warn(
          `[Gemini] Quota exceeded on key index ${currentIndex}. Rotating...`
        );
        rotateKey();
      } else if (isInvalidKey) {
        console.warn(
          `[Gemini] Invalid API Key detected at index ${currentIndex}. Rotating to next key...`
        );
        rotateKey();
      } else if (isServer) {
        console.warn(`[Gemini] Server error (503). Retrying...`);
        await new Promise((r) => setTimeout(r, 1e3 * (i + 1)));
      } else {
        throw err;
      }
    }
  }
  throw lastError || new Error("Gemini generation failed after retries.");
}

function cleanupJson(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    const lines = cleaned.split("\n");
    if (lines[0].startsWith("```")) lines.shift();
    if (lines[lines.length - 1].startsWith("```")) lines.pop();
    cleaned = lines.join("\n");
  }
  return cleaned;
}
function extractJson(text) {
  const cleaned = cleanupJson(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Model did not return JSON.");
    return JSON.parse(match[0]);
  }
}
const generatePage_post = defineEventHandler(async (event) => {
  setResponseHeader(event, "Content-Type", "text/event-stream");
  setResponseHeader(event, "Cache-Control", "no-cache");
  setResponseHeader(event, "Connection", "keep-alive");
  const stream = new PassThrough();
  (async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    try {
      const body = await readBody(event);
      const template = (body.template || "landing").toString();
      const briefRaw = (body.brief || "").toString().trim();
      const mode = body.mode || "auto";
      const stack = (body.stack || "nuxt").toString() || "nuxt";
      const wordpressBaseUrl = (body.wordpressBaseUrl || "").toString().trim();
      const wordpressRestBase = (body.wordpressRestBase || "")
        .toString()
        .trim();
      let seed = typeof body.seed === "number" ? body.seed : void 0;
      if (!briefRaw) {
        throw createError({
          statusCode: 400,
          statusMessage: "Brief is required",
        });
      }
      const { cleanBrief, directives } = parsePromptPattern(briefRaw);
      if (
        seed === void 0 &&
        typeof ((_a = directives.config) == null ? void 0 : _a.seed) ===
          "number"
      ) {
        seed = directives.config.seed;
      }
      if (seed === void 0) {
        seed = Date.now();
      }
      const config = useRuntimeConfig();
      const geminiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
      const hasKey = geminiKey.length > 0;
      const wantLive = mode === "live" || mode === "auto";
      const notify = (message) => {
        stream.write(`data: ${JSON.stringify({ type: "progress", message })}

`);
      };
      async function performGeminiGen() {
        return "";
      }
      let rawProject = null;
      let finalMode = "mock";
      let note = "";
      notify("Analyzing Brief...");
      try {
        if (mode === "mock" || (!hasKey && wantLive)) {
          finalMode = "mock";
          note =
            !hasKey && wantLive
              ? "No Gemini key available. Fallback to mock."
              : "Mock mode requested.";
          notify("Generating Mock Project...");
          rawProject = buildMockProject({
            template,
            brief: cleanBrief || briefRaw,
            stack,
            seed,
            wordpressBaseUrl,
            wordpressRestBase,
          });
        } else if (wantLive && hasKey) {
          try {
            finalMode = "live";
            const template = getRandomTemplate(template, seed);
            const templateId = template.id;
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
            const generatePage = async (
              pageId,
              pageContextBrief,
              globalContext
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
              const prompt = [
                "System:",
                instruction,
                "---",
                "User Context:",
                `Brief: ${pageContextBrief}`,
                `Directives: ${JSON.stringify(directives || {})}`,
              ].join("\n");
              const result = await generateContentWithRetry(prompt);
              const text = result.response.text();
              if (!text) throw new Error("Empty response");
              return extractJson(text);
            };
            const pages = {};
            let siteContext = {
              siteName: "",
              tagline: "",
              primaryColor: "",
              themeMode: "dark",
            };
            notify("Generating Home Page...");
            try {
              const homeDef = template.pages.find((p) => p.id === "home");
              const homeBrief = `${cleanBrief || briefRaw}. ${
                (homeDef == null ? void 0 : homeDef.promptFocus) ||
                "Main landing page."
              }`;
              const rawHome = await generatePage("home", homeBrief, {});
              siteContext = {
                siteName:
                  ((_b = rawHome.site) == null ? void 0 : _b.siteName) ||
                  "Generated Site",
                tagline:
                  ((_c = rawHome.site) == null ? void 0 : _c.tagline) || "",
                primaryColor:
                  ((_d = rawHome.site) == null ? void 0 : _d.primaryColor) ||
                  "",
                themeMode:
                  ((_e = rawHome.site) == null ? void 0 : _e.themeMode) ||
                  "dark",
              };
              pages["home"] = rawHome;
            } catch (e) {
              console.error("Home generation failed, falling back to mock", e);
              notify("Home Generation Failed. Using Mock...");
              pages["home"] = buildMockPageConfig({
                template,
                brief: cleanBrief || briefRaw,
                stack,
                seed,
                wordpressBaseUrl,
                wordpressRestBase,
                structure:
                  (_f = template.pages.find((p) => p.id === "home")) == null
                    ? void 0
                    : _f.structure,
              });
              siteContext = {
                siteName: pages["home"].site.siteName || "",
                tagline: pages["home"].site.tagline || "",
                primaryColor: pages["home"].site.primaryColor || "",
                themeMode: pages["home"].site.themeMode || "dark",
              };
            }
            const otherPages = template.pages.filter((p) => p.id !== "home");
            if (otherPages.length > 0) {
              notify(`Generating ${otherPages.length} other pages...`);
            }
            await Promise.all(
              otherPages.map(async (p) => {
                const pBrief = `${cleanBrief || briefRaw}. Focus on ${
                  p.id
                } page. ${p.promptFocus}`;
                try {
                  const pageConfig = await generatePage(
                    p.id,
                    pBrief,
                    siteContext
                  );
                  if (!pageConfig.site) pageConfig.site = {};
                  pageConfig.site.siteName = siteContext.siteName;
                  pageConfig.site.tagline = siteContext.tagline;
                  if (siteContext.primaryColor)
                    pageConfig.site.primaryColor = siteContext.primaryColor;
                  pageConfig.site.themeMode = siteContext.themeMode;
                  pages[p.id] = pageConfig;
                } catch (e) {
                  console.warn(
                    `Failed to generate ${p.id}, falling back to mock.`
                  );
                  pages[p.id] = buildMockPageConfig({
                    template,
                    brief: pBrief,
                    stack,
                    seed: seed + hashString(p.id),
                    structure: p.structure,
                    themeMode: siteContext.themeMode,
                  });
                  pages[p.id].site.siteName = siteContext.siteName;
                  pages[p.id].site.primaryColor = siteContext.primaryColor;
                }
              })
            );
            note = "Live OK (Gemini Multi-page)";
            rawProject = {
              template,
              templateId,
              site: ((_g = pages["home"]) == null ? void 0 : _g.site) || {},
              backend: (_h = pages["home"]) == null ? void 0 : _h.backend,
              pages,
              meta: (_i = pages["home"]) == null ? void 0 : _i.meta,
            };
          } catch (err) {
            console.error("Gemini generation failed:", err);
            finalMode = "mock";
            note = `AI Error: ${err.message}. Fallback to mock.`;
            notify("Error encountered. Falling back to Mock...");
            rawProject = buildMockProject({
              template,
              brief: cleanBrief || briefRaw,
              stack,
              seed,
              wordpressBaseUrl,
              wordpressRestBase,
            });
          }
        }
      } catch (e) {
        console.error("Critical generation error:", e);
        finalMode = "mock";
        note = `Critical error: ${e.message}`;
        rawProject = buildMockProject({
          template,
          brief: cleanBrief || briefRaw,
          stack,
          seed,
          wordpressBaseUrl,
          wordpressRestBase,
        });
      }
      notify("Finalizing Project...");
      const finalPages = {};
      if (rawProject && rawProject.pages) {
        for (const [pageId, pageConf] of Object.entries(rawProject.pages)) {
          finalPages[pageId] = normalizePageConfig(pageConf, {
            template,
            stack,
            seed,
            mode: finalMode,
            wordpressBaseUrl,
            wordpressRestBase,
          });
          finalPages[pageId].meta = {
            ...(finalPages[pageId].meta || {}),
            mode: finalMode,
            generatedAt: /* @__PURE__ */ new Date().toISOString(),
            seed,
            stack,
            note,
          };
        }
      }
      const finalProject = {
        template,
        templateId:
          (rawProject == null ? void 0 : rawProject.templateId) || "unknown",
        site: (rawProject == null ? void 0 : rawProject.site) || {},
        backend: rawProject == null ? void 0 : rawProject.backend,
        pages: finalPages,
        meta: {
          mode: finalMode,
          generatedAt: /* @__PURE__ */ new Date().toISOString(),
          seed,
          stack,
          note,
        },
      };
      stream.write(`data: ${JSON.stringify({
        type: "result",
        data: finalProject,
      })}

`);
      stream.end();
    } catch (err) {
      stream.write(`data: ${JSON.stringify({
        type: "error",
        message: err.message || "Unknown server error",
      })}

`);
      stream.end();
    }
  })();
  return sendStream(event, stream);
});

export { generatePage_post as default };
//# sourceMappingURL=generate-page.post.mjs.map
