import type { PageConfig } from "~/types/landing";

export const pageConfig: PageConfig = {
  template: "landing",
  stack: "nuxt",
  site: {
    siteName: "MINIONS: AI Builder",
    tagline: "AI-powered websites in minutes",
    primaryColor: "#4f46e5",
  },
  backend: {
    cms: "wordpress",
    wordpress: {
      baseUrl: "",
      restBase: "/wp-json/wp/v2",
    },
  },
  sections: [
    {
      id: "hero-main",
      type: "hero",
      variant: "terminal",
      eyebrow: "Code? We eat that for breakfast. 🍌",
      image: "/images/hero-minions-v2.png",
      headline: "Minions As A Service",
      subheadline:
        "The open-source AI scaffolder for modern developers. Generate production-ready Nuxt 3 & Vue apps directly from your terminal or our cloud builder.",
      primaryCta: {
        label: "Start Building",
        href: "/builder",
      },
      secondaryCta: {
        label: "View Showcase",
        href: "/examples",
      },
    },
    {
      id: "features-dev",
      type: "features",
      title: "Built for Modern Developers",
      subtitle:
        "A professional stack that scales with your ambition, not just a toy.",
      items: [
        {
          title: "Nuxt 3 Architecture",
          description:
            "Generated code uses the latest Nuxt 3 best practices, ensuring SEO, performance, and type safety out of the box.",
        },
        {
          title: "Component-Driven Design",
          description:
            "Every section is a standalone Vue component. Modular, reusable, and easy to customize or replace.",
        },
        {
          title: "Zero Lock-in",
          description:
            "You own the code. Download the full source, deploy to Vercel, Netlify, or anywhere. No proprietary runtime.",
        },
      ],
    },
    {
      id: "cli-install",
      type: "cli",
      title: "Start in seconds",
      subtitle: "Just run this command in your terminal. No config needed.",
      command: "npx minions init my-app",
      steps: [
        "Select your preferred stack (Nuxt / Next.js)",
        "Choose your design system tokens",
      ],
    },
    {
      id: "stats-home",
      type: "stats",
      title: "Empowering Creators",
      variant: "card",
      items: [
        { value: "10k+", label: "Pages Generated" },
        { value: "100%", label: "Customizable" },
        { value: "0ms", label: "Runtime Overhead" },
      ],
    },
    {
      id: "testimonials-early",
      type: "testimonials",
      title: "Testimonials from Early Users",
      items: [
        {
          quote:
            "I used to spend days setting up a project. Now I get a solid Nuxt starter in minutes.",
          name: "A",
          role: "Full-stack Developer",
        },
        {
          quote: "Clients love seeing a working prototype on the first call.",
          name: "B",
          role: "Owner, small agency",
        },
      ],
    },
    {
      id: "faq-main",
      type: "faq",
      title: "Frequently Asked Questions",
      items: [
        {
          q: "How does the AI content generation work?",
          a: "Our AI analyzes your input and generates layouts and content that are tailored to your specific needs and preferences.",
        },
      ],
    },
    {
      id: "blog-latest",
      type: "blogList",
      title: "Latest Updates",
      subtitle: "See what's new in MINIONS",
      layout: "grid",
      maxItems: 3,
      source: {
        template: "wordpress",
        endpoint: "/posts?per_page=3&_embed",
      },
    },
    {
      id: "cta-bottom",
      type: "cta",
      headline: "Ready to build your AI-powered website?",
      subheadline:
        "Start with a Nuxt starter that you can fully control and extend.",
      primaryCta: {
        label: "Build for Free",
        href: "/builder",
      },
    },
  ],
};
