export type PromptExample = {
  id: string;
  template: "landing" | "company" | "blog" | "ecommerce" | "portfolio" | "saas";
  title: string;
  description?: string;
  brief: string;
};

export const PROMPT_EXAMPLES: PromptExample[] = [
  {
    id: "saas-b2b",
    template: "saas",
    title: "SaaS Landing Page",
    description:
      "Perfect for B2B startups. Includes Hero, Features, Testimonials, and Pricing tables optimized for conversion.",
    brief:
      "A high-conversion landing page for 'TaskMaster', an AI-powered project management tool. \n\nTarget Audience: Remote teams and project managers.\nKey Features: Automated scheduling, Gantt charts, Slack integration.\nTone: Professional, efficient, and modern.\n\nStructure: Hero with app screenshot, 3-column feature grid, testimonials from tech leads, and a pricing CTA.",
  },
  {
    id: "company-agency",
    template: "company",
    title: "Creative Agency",
    description:
      "Showcase your portfolio and services. Best for design studios, marketing agencies, or consultants.",
    brief:
      "Corporate site for 'PixelPerfect', a digital design agency based in Bangkok.\n\nServices: UX/UI Design, Web Development, Branding.\nValues: User-centric, pixel-perfect detail, speed.\nTone: Creative, bold, and artistic.\n\nInclude a portfolio highlights section (features) and a 'Meet the Team' section.",
  },
  {
    id: "blog-tech",
    template: "blog",
    title: "Tech Blog",
    description:
      "A clean, content-focused layout for technical writers, documentation, or company news.",
    brief:
      "A clean, minimal blog for 'DevDaily', covering Vue.js and Nuxt ecosystem news.\n\nHeader: Simple logo with navigation.\nHero: Latest featured article with large typography.\nList: Grid of recent tutorials.\nFooter: Newsletter signup.",
  },
  {
    id: "ecommerce-gadget",
    template: "ecommerce",
    title: "Gadget Store",
    description:
      "High-impact product launch page. Features product highlights, specs, and clear buy buttons.",
    brief:
      "Product launch page for 'SoundEra', new noise-cancelling headphones.\n\nProduct: Wireless, 40h battery, adaptive ANC.\nVibe: Premium, sleek, dark mode aesthetic.\n\nFeatures to highlight: Sound quality, Comfort, Battery life.\nTestimonials: Audiophiles rating 5 stars.",
  },
  {
    id: "landing-thai",
    template: "landing",
    title: "Thai Food Delivery",
    description:
      "A vibrant, appetizing template for food services, restaurants, or local businesses.",
    brief:
      "Landing page for 'AroiD', a premium food delivery service in Chiang Mai.\n\nLanguage: Thai ({force Thai language}).\nKey Selling Points: Fresh ingredients, 30-min delivery, Michelin-rated partners.\nStyle: Vibrant, appetizing, warm colors (orange/red).",
  },
  {
    id: "portfolio-minimal",
    template: "portfolio",
    title: "Minimalist Portfolio",
    description:
      "Clean, typography-focused site for writers or strategists. Highlights case studies.",
    brief:
      "Portfolio for 'Alex Chen', a UX Strategist.\n\nStyle: Minimalist, black and white, heavy typography.\nContent: Bio, Case Studies (Blog List), Contact.\nTone: Thoughtful, analytical, professional.",
  },
  {
    id: "portfolio-creative",
    template: "portfolio",
    title: "Creative Studio",
    description:
      "Visual-heavy portfolio for designers/agencies with project grid.",
    brief:
      "Portfolio for 'Neon Studio', a motion graphics artist.\n\nStyle: Dark mode, neon accents, large images.\nSections: Hero video reel, Project Grid (Features), Client list.\nTone: Bold, energetic, futuristic.",
  },
  {
    id: "saas-ai",
    template: "saas",
    title: "AI Startup",
    description:
      "Futuristic, dark-mode ready layout for AI tools. Focus on 'Magic' and speed.",
    brief:
      "Launch page for 'Nexus AI', a generative code assistant.\n\nStyle: Cyberpunk, Neon, Dark mode.\nSections: Hero (Termial Style), Features (Speed), Stats (10x faster), CTA (Get Early Access).",
  },
];
