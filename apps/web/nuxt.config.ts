import { fileURLToPath } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    "~/types/landing": fileURLToPath(
      new URL("../../packages/shared/src/types/landing.ts", import.meta.url)
    ),
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/supabase", "@pinia/nuxt"],
  tailwindcss: {
    config: {
      darkMode: "class",
    },
  },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  supabase: {
    redirect: false, // Handle auth redirects manually for now
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/builder", "/examples", "/docs"],
    },
  },
  pages: true,
  runtimeConfig: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
  },
  routeRules: {
    "/api/**": {
      proxy: `${process.env.API_BASE_URL || "http://localhost:3001"}/api/**`,
    },
  },
});
