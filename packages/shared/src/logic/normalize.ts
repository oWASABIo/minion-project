import type { PageConfig, Section } from "../types/landing";
import { enforceStackConstraints } from "./stack-spec";

type Opts = {
  template: string;
  stack: string;
  seed: number;
  mode: "mock" | "live" | "blueprint";
  wordpressBaseUrl?: string;
  wordpressRestBase?: string;
};

const toStr = (v: any) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

export function normalizePageConfig(input: any, opts: Opts): PageConfig {
  const out: any = input && typeof input === "object" ? { ...input } : {};

  // --- basics
  out.template = toStr(out.template) || opts.template;
  out.stack = toStr(out.stack) || opts.stack;

  // --- site normalize (รองรับทั้ง site, siteName/tagline ที่อยู่ root)
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

  // --- backend wordpress override (if provided from UI)
  const baseUrl = (
    opts.wordpressBaseUrl ||
    out.backend?.wordpress?.baseUrl ||
    ""
  ).trim();

  const restBase = (
    opts.wordpressRestBase ||
    out.backend?.wordpress?.restBase ||
    "/wp-json/wp/v2"
  ).trim();

  if (baseUrl) {
    out.backend =
      out.backend && typeof out.backend === "object" ? { ...out.backend } : {};
    out.backend.cms = "wordpress";
    out.backend.wordpress = { baseUrl, restBase };
  }

  // --- sections normalize
  const sections = Array.isArray(out.sections) ? out.sections : [];
  out.sections = sections.map((sec: any, i: number) => {
    const obj = sec && typeof sec === "object" ? sec : {};

    // ✅ รองรับ schema แบบ { type, content: { ... } }
    let merged: any = {
      ...obj,
      ...(obj.content && typeof obj.content === "object" ? obj.content : {}),
    };
    // Ensure we don't accidentally nest content again if it was already flattened but left a trace?
    // Actually the above spread is safe.
    delete merged.content; // Remote nested content key

    // ✅ normalize type casing + alias
    let t = toStr(merged.type) || "hero";
    // Handle Common AI Capitalization
    t = t.charAt(0).toLowerCase() + t.slice(1);

    if (t === "bloglist") t = "blogList";
    if (t === "productlist") t = "productList";
    if (t === "productdetail") t = "productDetail";

    merged.type = t;

    // ✅ id fallback
    merged.id = toStr(merged.id) || `${merged.type}-${i + 1}`;

    // --- common field mapping (Sync with client-side ai-parser.ts) ---

    // 1. Hero Section Mapping
    if (merged.type === "hero") {
      // tag -> eyebrow
      if (merged.tag && !merged.eyebrow) merged.eyebrow = merged.tag;

      // title -> headline
      if (merged.title && !merged.headline) merged.headline = merged.title;
      // headline -> fallback
      if (!merged.headline) merged.headline = "Generated Hero"; // Ensure not empty

      // description -> subheadline
      if (merged.description && !merged.subheadline)
        merged.subheadline = merged.description;
      if (merged.subtitle && !merged.subheadline)
        merged.subheadline = merged.subtitle;

      // actions -> primaryCta, secondaryCta (AI often sends 'actions' array)
      if (Array.isArray(merged.actions)) {
        if (merged.actions.length > 0 && !merged.primaryCta) {
          merged.primaryCta = {
            label:
              merged.actions[0].label ||
              merged.actions[0].text ||
              "Get Started",
            href: merged.actions[0].link || merged.actions[0].href || "#",
          };
        }
        if (merged.actions.length > 1 && !merged.secondaryCta) {
          merged.secondaryCta = {
            label:
              merged.actions[1].label || merged.actions[1].text || "Learn More",
            href: merged.actions[1].link || merged.actions[1].href || "#",
          };
        }
      }

      // ✅ Phase 9: Inject Hero Image
      if (!merged.image || opts.mode === "blueprint") {
        merged.image =
          opts.mode === "blueprint"
            ? "/images/placeholder-wireframe.png"
            : `https://picsum.photos/seed/${opts.seed + i}/800/600`;
      }
    }

    // 2. Features Section
    if (merged.type === "features") {
      merged.title = toStr(merged.title) || "Features";
      // description -> subtitle
      if (merged.description && !merged.subtitle)
        merged.subtitle = merged.description;
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);

      merged.items = Array.isArray(merged.items)
        ? merged.items.map((it: any) => ({
            title: toStr(it?.title) || "Feature",
            description: toStr(it?.description) || "",
          }))
        : [];
    }

    if (merged.type === "testimonials") {
      merged.title = toStr(merged.title) || "Testimonials";
      merged.items = Array.isArray(merged.items)
        ? merged.items.map((it: any) => ({
            quote: toStr(it?.quote) || "",
            name: toStr(it?.name) || "",
            role: toStr(it?.role) || undefined,
            avatar:
              opts.mode === "blueprint"
                ? "/images/placeholder-avatar.png"
                : it?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${toStr(
                    it?.name
                  )}`,
          }))
        : [];
    }

    if (merged.type === "team") {
      merged.title = toStr(merged.title) || "Our Team";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      // Ensure merged.items is populated if members exists
      const members = Array.isArray(merged.members)
        ? merged.members
        : Array.isArray(merged.items)
        ? merged.items
        : [];

      merged.items = members.map((it: any, midx: number) => ({
        name: toStr(it?.name) || "Member Name",
        role: toStr(it?.role) || "Role",
        bio: toStr(it?.bio),
        // ✅ Phase 9: Inject Avatar
        avatar:
          opts.mode === "blueprint"
            ? "/images/placeholder-avatar.png"
            : toStr(it?.avatar) ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${
                toStr(it?.name) || opts.seed + i + midx
              }`,
        socials: it?.socials || {},
      }));
    }

    if (merged.type === "faq") {
      merged.title = toStr(merged.title) || "FAQ";
      if (Array.isArray(merged.items)) {
        merged.items = merged.items.map((it: any) => ({
          q: toStr(it?.q) || toStr(it?.question) || "",
          a: toStr(it?.a) || toStr(it?.answer) || "",
        }));
      } else {
        merged.items = [];
      }
    }

    if (merged.type === "cta") {
      // ✅ types รองรับทั้ง title/headline และ subheadline/description
      merged.headline =
        toStr(merged.headline) || toStr(merged.title) || "Call to action";

      const desc = toStr(merged.description);
      const sub = toStr(merged.subheadline) || toStr(merged.subtitle);

      // ให้ component ใช้ได้ทั้ง 2 แบบ (กันหาย)
      merged.subheadline = sub || desc || "";
      merged.description = desc || merged.subheadline || "";

      // primaryCta ต้องมี (ถ้า model ส่งไม่มา ให้ fallback)
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
      // ✅ รองรับ prompt pattern: postsEndpoint -> source.endpoint
      const postsEndpoint =
        toStr(merged.postsEndpoint) || toStr(merged.source?.endpoint);

      merged.source =
        merged.source && typeof merged.source === "object"
          ? { ...merged.source }
          : { template: "wordpress", endpoint: "" };

      merged.source.template = toStr(merged.source.template) || "wordpress";
      merged.source.endpoint = postsEndpoint || "/posts?per_page=3&_embed"; // ✅ แนะนำให้เป็น relative (จะต่อกับ restBase ได้)

      merged.title = toStr(merged.title) || "Latest from WordPress";
      if (merged.subtitle != null) merged.subtitle = toStr(merged.subtitle);
      if (merged.layout != null) merged.layout = toStr(merged.layout);
      if (typeof merged.maxItems !== "number") merged.maxItems = 3;
    }

    if (merged.type === "productList") {
      merged.title = toStr(merged.title) || "Featured Products";
      merged.subtitle =
        toStr(merged.subtitle) || "Explore our latest collection";
      if (typeof merged.maxItems !== "number") merged.maxItems = 6;
      merged.displayMode = toStr(merged.displayMode) || "grid";
    }

    if (merged.type === "productDetail") {
      if (merged.showRelated == null) merged.showRelated = true;
      if (merged.showReviews == null) merged.showReviews = true;
    }

    // 🔥 Apply Stack Constraints
    return enforceStackConstraints(merged as Section, out.stack);
  });

  // --- meta normalize (เติม stack ตาม type ของคุณ)
  out.meta = out.meta && typeof out.meta === "object" ? { ...out.meta } : {};
  out.meta.mode = opts.mode;
  out.meta.seed = opts.seed;
  out.meta.stack = toStr(out.meta.stack) || out.stack || opts.stack;

  return out as PageConfig;
}
