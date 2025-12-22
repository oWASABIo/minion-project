import type { PageConfig } from "@minions/shared";

export function generateNuxtConfig(config: PageConfig) {
  return `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: "${config.site?.siteName || "My Landing Page"}",
      meta: [
        { name: 'description', content: '${config.site?.tagline || ""}' }
      ]
    }
  }
})
`;
}

export function generateTailwindConfig(config: PageConfig) {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./components/**/*.{js,vue,ts,tsx}",
    "./src/**/*.{js,vue,ts,tsx}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${config.site?.primaryColor || "#4f46e5"}",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
`;
}
