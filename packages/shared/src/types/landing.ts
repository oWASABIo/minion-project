// ~/types/landing.ts

export type Pagetemplate =
  | "landing"
  | "company"
  | "blog"
  | "ecommerce"
  | "portfolio"
  | "saas"
  | string;

export type Mode = "mock" | "live";

export type Stack = "nuxt" | "wordpress-theme" | "nextjs" | string;

export type Cmstemplate = "wordpress" | string;

export type CtaLink = {
  label: string;
  href: string;
};

export type SiteConfig = {
  siteName: string;
  tagline?: string;
  primaryColor?: string;
  themeMode?: "light" | "dark";
  fontFamily?: string;
};

export type WordPressConfig = {
  baseUrl: string;
  restBase?: string; // default "/wp-json/wp/v2"
};

export type BackendConfig = {
  cms: Cmstemplate;
  wordpress?: WordPressConfig;
};

export type PageMeta = {
  mode?: Mode; // "mock" | "live"
  generatedAt?: string;
  seed?: number;
  note?: string;

  // ✅ ใช้บอกว่า config นี้ถูก generate ด้วย stack ไหน (nuxt/nextjs/wp-theme ฯลฯ)
  stack?: Stack;
};

export type SectionType =
  | "hero"
  | "features"
  | "testimonials"
  | "faq"
  | "blogList"
  | "bloglist"
  | "cta"
  | "pricing"
  | "stats"
  | "team"
  | "productList"
  | "productDetail"
  | "cli";

export type SectionBase = {
  id: string;
  type: SectionType;
};

export type CliSection = SectionBase & {
  type: "cli";
  title?: string;
  subtitle?: string;
  command: string; // e.g. "npx minions init"
  steps?: string[]; // e.g. ["Select template", "Customize", "Deploy"]
};

export type HeroSection = SectionBase & {
  type: "hero";
  eyebrow?: string;
  headline: string;
  subheadline?: string;

  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;

  // ✅ รองรับ variant เพื่อเปลี่ยน layout ได้
  variant?: "center" | "split" | "left" | "right" | string;

  // ✅ Phase 9: Image Support
  image?: string;
};

export type FeaturesSection = SectionBase & {
  type: "features";
  title?: string;
  subtitle?: string;
  items: Array<{ title: string; description: string }>;

  variant?: "cards" | "grid" | "icons" | string;
};

export type TestimonialsSection = SectionBase & {
  type: "testimonials";
  title?: string;
  items: Array<{ quote: string; name: string; role?: string }>;

  variant?: "cards" | "slider" | string;
};

// ✅ ทำให้รับได้ทั้ง q/a (ของเดิม) และ question/answer (ที่คุณมีใน example)
export type FaqItem = {
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

export type FaqSection = SectionBase & {
  type: "faq";
  title?: string;
  items: FaqItem[];
};

export type ProductListSection = SectionBase & {
  type: "productList";
  title?: string;
  subtitle?: string;

  // Endpoint configuration (optional, defaults to WC/WP standard)
  endpoint?: string;

  // Display configuration
  maxItems?: number;
  displayMode?: "grid" | "carousel" | "featured"; // default: grid
};

export type ProductDetailSection = SectionBase & {
  type: "productDetail";
  showRelated?: boolean; // default true
  showReviews?: boolean; // default true
};

export type BlogListSection = SectionBase & {
  type: "blogList" | "bloglist";
  title?: string;

  // ✅ แก้ error subtitle ไม่อยู่ใน type
  subtitle?: string;

  layout?: "grid" | "list" | string;
  maxItems?: number;

  source?: {
    template: "wordpress" | string;
    endpoint: string; // ex: "/posts?per_page=3&_embed" OR "/wp-json/wp/v2/posts?..."
  };
};

export type CtaSection = SectionBase & {
  type: "cta";

  // บาง config ใช้ title, บางอันใช้ headline
  title?: string;
  headline?: string;

  // บาง config ใช้ subheadline, บางอันใช้ description (UI คุณกำลังเรียก description)
  subheadline?: string;
  description?: string;

  primaryCta: CtaLink;
  secondaryCta?: CtaLink;

  variant?: "boxed" | "banner" | string;
};

export type PricingPlan = {
  name: string;
  price: string;
  period?: string; // "/mo", "/yr"
  description?: string;
  features: string[];
  isPopular?: boolean;
  cta: CtaLink;
};

export type PricingSection = SectionBase & {
  type: "pricing";
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
};

export type StatItem = {
  value: string; // "10k+"
  label: string; // "Happy Users"
  description?: string;
};

export type StatsSection = SectionBase & {
  type: "stats";
  title?: string; // Optional header
  items: StatItem[];
  variant?: "simple" | "card";
};

export type TeamMember = {
  name: string;
  role: string;
  avatar?: string;
  bio?: string;
  socials?: { twitter?: string; linkedin?: string };
};

export type TeamSection = SectionBase & {
  type: "team";
  title?: string;
  subtitle?: string;
  members: TeamMember[];
};

export type Section =
  | HeroSection
  | FeaturesSection
  | TestimonialsSection
  | FaqSection
  | BlogListSection
  | CtaSection
  | PricingSection
  | StatsSection
  | TeamSection
  | ProductListSection
  | ProductDetailSection
  | CliSection;

export type PageConfig = {
  template: Pagetemplate;
  site: SiteConfig;
  backend?: BackendConfig;
  sections: Section[];

  meta?: PageMeta;

  // เผื่อมีคนเก็บ stack ไว้ที่ root (กันพัง)
  stack?: Stack;
};

export type TemplateDefinition = {
  id: string;
  label: string;
  template: Pagetemplate;
  description?: string;
  pages: {
    id: string; // e.g. "home", "about"
    route: string; // e.g. "/", "/about"
    structure: SectionType[];
    promptFocus: string; // Context for the AI to generate text
  }[];
};

export type ProjectConfig = {
  template: Pagetemplate;
  templateId: string;
  site: SiteConfig;
  backend?: BackendConfig;
  // Key = pageId (home, about, etc.)
  pages: Record<string, PageConfig>;
  meta?: PageMeta;
};
