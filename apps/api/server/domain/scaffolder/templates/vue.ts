import type { PageConfig, ProjectConfig } from "@minions/shared";

export function generateAppVue() {
  return `<script setup lang="ts">
import config from "~/data/page-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-50 antialiased font-sans">
    <PageRenderer :config="config as any" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
</style>
`;
}

export function generateAppVueSingle() {
  return `<script setup lang="ts">
import config from "~/data/page-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-50 antialiased font-sans">
    <PageRenderer :config="config as any" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
</style>
`;
}

export function generateAppVueMultiPage() {
  return `<script setup lang="ts">
// Main Layout
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-50 antialiased font-sans">
    <NuxtPage />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
}
</style>
`;
}

export function generatePageVue(pageId: string) {
  // If home, we might use project-config.pages['home']
  // But here we rely on the component (PageRenderer) mapping
  // We'll import the BIG config and pick the page
  return `<script setup lang="ts">
import projectConfig from "~/data/project-config.json";

const pageConfig = projectConfig.pages["${pageId}"];
</script>

<template>
  <div v-if="pageConfig">
    <PageRenderer :config="pageConfig" />
  </div>
  <div v-else class="p-10 text-center">
    Page Not Found
  </div>
</template>
`;
}

export function generateTokens(config: PageConfig) {
  return {
    color: {
      primary: { value: config.site?.primaryColor || "#4f46e5" },
      base: {
        white: { value: "#ffffff" },
        slate950: { value: "#020617" },
      },
    },
    font: {
      sans: { value: "Inter" },
    },
    size: {
      spacing: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "2rem" },
        xl: { value: "4rem" },
      },
    },
  };
}

export function generateVitePackageJson(config: PageConfig | ProjectConfig) {
  const name =
    config.site?.siteName?.toLowerCase().replace(/[^a-z0-9]/g, "-") ||
    "minions-project";

  return {
    name,
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vue-tsc -b && vite build",
      preview: "vite preview",
    },
    dependencies: {
      vue: "^3.5.12",
      "vue-router": "^4.4.5",
      "@heroicons/vue": "^2.1.5",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.5.4",
    },
    devDependencies: {
      "@vitejs/plugin-vue": "^5.1.4",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.14",
      typescript: "~5.6.2",
      vite: "^5.4.10",
      "vue-tsc": "^2.1.8",
    },
  };
}

export function generateViteConfig() {
  return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`;
}

export function generateIndexHtml(config: PageConfig | ProjectConfig) {
  return `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.site?.siteName || "Minions Project"}</title>
    <meta name="description" content="${config.site?.tagline || ""}" />
  </head>
  <body class="bg-slate-950 text-slate-50">
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;
}

export function generateMainTsVite() {
  return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
`;
}

export function generateAppVueVite() {
  return `<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}
</style>
`;
}

export function generateRouterTs(config: ProjectConfig) {
  const routes = Object.keys(config.pages).map((pageId) => {
    const path = pageId === "home" ? "/" : `/${pageId}`;
    const componentPath = pageId === "home" ? "index.vue" : `${pageId}.vue`;
    // Use clear string concatenation to avoid nested backtick confusion
    return (
      "{ path: '" +
      path +
      "', component: () => import('./pages/" +
      componentPath +
      "') }"
    );
  });

  return `import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ${routes.join(",\n    ")}
  ]
})

export default router
`;
}

export function generatePageVueVite(pageId: string) {
  return `<script setup lang="ts">
import projectConfig from '@/data/project-config.json';
import PageRenderer from '@/components/sections/PageRenderer.vue';

const pageConfig = projectConfig.pages["${pageId}"];
</script>

<template>
  <div v-if="pageConfig">
    <PageRenderer :config="pageConfig" />
  </div>
  <div v-else>Page not found</div>
</template>
`;
}

export function generatePackageJson(config: PageConfig) {
  return {
    name: "minions-generated-project",
    private: true,
    scripts: {
      build: "nuxt build",
      dev: "nuxt dev",
      generate: "nuxt generate",
      preview: "nuxt preview",
      postinstall: "nuxt prepare",
    },
    dependencies: {
      "@heroicons/vue": "^2.1.5",
      clsx: "^2.1.1",
      nuxt: "^3.13.0",
      "tailwind-merge": "^2.5.2",
      vue: "latest",
    },
    devDependencies: {
      "@nuxtjs/tailwindcss": "^6.12.1",
      autoprefixer: "^10.4.20",
      postcss: "^8.4.47",
      tailwindcss: "^3.4.10",
    },
  };
}
