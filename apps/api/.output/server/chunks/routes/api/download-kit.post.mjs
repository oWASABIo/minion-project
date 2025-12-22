import process from 'node:process';globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import { a as useStorage, d as defineEventHandler, r as readBody, s as setHeader, b as sendStream } from '../../nitro/nitro.mjs';
import archiver from 'archiver';
import { promises } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';

async function generateProjectFiles(config, stack = "nuxt") {
  const files = [];
  const rootDir = process.cwd();
  const isProject = "pages" in config;
  const projectConfig = isProject ? config : null;
  const pageConfig = isProject ? null : config;
  files.push({
    name: "data/project-config.json",
    // Unified name for simplicity in new projects
    content: JSON.stringify(config, null, 2)
  });
  if (!isProject) {
    files.push({
      name: "data/page-config.json",
      content: JSON.stringify(config, null, 2)
    });
  }
  try {
    const typesPath = resolve(rootDir, "types/landing.ts");
    const typesContent = await promises.readFile(typesPath, "utf-8");
    files.push({ name: "types/landing.ts", content: typesContent });
  } catch (e) {
    files.push({ name: "types/landing.ts", content: "// Error reading types" });
  }
  if (stack === "nuxt" || stack === "wordpress-theme") {
    let mainConfig = isProject ? projectConfig.pages["home"] : pageConfig;
    if (!mainConfig && isProject) {
      const pages = Object.values(projectConfig.pages);
      if (pages.length > 0) mainConfig = pages[0];
    }
    if (!mainConfig) {
      throw new Error("Unable to determine main page configuration.");
    }
    files.push({
      name: "package.json",
      content: JSON.stringify(generatePackageJson(mainConfig), null, 2)
    });
    files.push({
      name: "nuxt.config.ts",
      content: generateNuxtConfig(mainConfig)
    });
    files.push({
      name: "tailwind.config.js",
      content: generateTailwindConfig(mainConfig)
    });
    if (isProject) {
      files.push({
        name: "app.vue",
        content: generateAppVueMultiPage()
      });
      for (const [pageId, pConfig] of Object.entries(projectConfig.pages)) {
        const fileName = pageId === "home" ? "index.vue" : `${pageId}.vue`;
        files.push({
          name: `pages/${fileName}`,
          content: generatePageVue(pageId)
        });
      }
    } else {
      files.push({
        name: "app.vue",
        content: generateAppVueSingle()
      });
    }
    const components = await readComponents();
    files.push(...components);
    const backendUtil = await readBackendUtil();
    files.push(backendUtil);
  }
  if (stack === "vue-vite") {
    files.push({
      name: "package.json",
      content: JSON.stringify(generateVitePackageJson(config), null, 2)
    });
    files.push({
      name: "vite.config.ts",
      content: generateViteConfig()
    });
    files.push({
      name: "index.html",
      content: generateIndexHtml(config)
    });
    files.push({
      name: "src/vite-env.d.ts",
      content: `/// <reference types="vite/client" />`
    });
    files.push({
      name: "src/main.ts",
      content: generateMainTsVite()
    });
    files.push({
      name: "src/App.vue",
      content: generateAppVueVite()
    });
    files.push({
      name: "src/router.ts",
      content: generateRouterTs(projectConfig)
    });
    files.push({
      name: "tailwind.config.js",
      content: generateTailwindConfig(
        isProject ? projectConfig.pages["home"] : pageConfig
      )
    });
    files.push({
      name: "postcss.config.js",
      content: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`
    });
    files.push({
      name: "src/style.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;
`
    });
    files.push({
      name: "src/data/project-config.json",
      // Duplicate for runtime access in src
      content: JSON.stringify(config, null, 2)
    });
    const components = await readComponents();
    for (const c of components) {
      files.push({
        name: `src/${c.name}`,
        // c.name is "components/sections/..."
        content: c.content
      });
    }
    const backendUtil = await readBackendUtil();
    files.push({
      name: `src/${backendUtil.name}`,
      content: backendUtil.content
    });
    if (isProject) {
      for (const [pageId, pConfig] of Object.entries(projectConfig.pages)) {
        const fileName = pageId === "home" ? "Home.vue" : `${pageId.charAt(0).toUpperCase() + pageId.slice(1)}.vue`;
        files.push({
          name: `src/pages/${fileName}`,
          content: generatePageVueVite(pageId)
        });
      }
    }
  }
  const baseConfig = isProject ? projectConfig.pages["home"] : pageConfig;
  files.push({
    name: "tokens.json",
    content: JSON.stringify(generateTokens(baseConfig), null, 2)
  });
  files.push({
    name: "content.json",
    content: JSON.stringify(isProject ? projectConfig : pageConfig, null, 2)
  });
  files.push({
    name: "DEPLOY.md",
    content: generateDeployMd()
  });
  files.push({
    name: "README.md",
    content: generateReadme(stack, baseConfig, isProject)
  });
  return files;
}
function generateVitePackageJson(config) {
  var _a;
  const name = "site" in config ? (_a = config.site) == null ? void 0 : _a.siteName : "generated-project";
  return {
    name: (name == null ? void 0 : name.toLowerCase().replace(/\s+/g, "-")) || "ai-landing-vite",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vue-tsc && vite build",
      preview: "vite preview"
    },
    dependencies: {
      vue: "^3.4.19",
      "vue-router": "^4.3.0",
      "lucide-vue-next": "^0.344.0"
    },
    devDependencies: {
      "@vitejs/plugin-vue": "^5.0.4",
      typescript: "^5.2.2",
      vite: "^5.1.4",
      "vue-tsc": "^1.8.27",
      tailwindcss: "^3.4.1",
      postcss: "^8.4.35",
      autoprefixer: "^10.4.17"
    }
  };
}
function generateViteConfig() {
  return `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./src', globalThis._importMeta_.url))
    }
  }
})
`;
}
function generateIndexHtml(config) {
  var _a;
  const title = ("site" in config ? (_a = config.site) == null ? void 0 : _a.siteName : "") || "Vite App";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"><\/script> <!-- Vite dev serves main.ts as main.js often, but let's point to main.ts directly -->
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`;
}
function generateMainTsVite() {
  return `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
`;
}
function generateAppVueVite() {
  return `<script setup lang="ts">
// Root App
<\/script>

<template>
  <div class="min-h-screen antialiased font-sans bg-slate-900 text-slate-50">
    <RouterView />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; }
</style>
`;
}
function generateRouterTs(config) {
  const routes = Object.keys(config.pages).map((pageId) => {
    const path = pageId === "home" ? "/" : `/${pageId}`;
    const componentName = pageId === "home" ? "Home" : pageId.charAt(0).toUpperCase() + pageId.slice(1);
    return `{ path: '${path}', component: () => import('./pages/${componentName}.vue') }`;
  });
  return `import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  ${routes.join(",\n  ")}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  }
})

export default router
`;
}
function generatePageVueVite(pageId) {
  return `<script setup lang="ts">
import project from "~/data/project-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";

const pageConfig = project.pages["${pageId}"];
<\/script>

<template>
  <PageRenderer :config="pageConfig as any" />
</template>
`;
}
function generateAppVueSingle() {
  return `<script setup lang="ts">
import config from "~/data/page-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";
<\/script>

<template>
  <div class="min-h-screen antialiased font-sans">
    <PageRenderer :config="config as any" />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; }
</style>
`;
}
function generateAppVueMultiPage() {
  return `<template>
  <div class="min-h-screen antialiased font-sans">
    <NuxtPage />
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
body { font-family: 'Inter', sans-serif; }
</style>
`;
}
function generatePageVue(pageId) {
  return `<script setup lang="ts">
import project from "~/data/project-config.json";
import PageRenderer from "~/components/sections/PageRenderer.vue";

const pageConfig = project.pages["${pageId}"];
<\/script>

<template>
  <PageRenderer :config="pageConfig" />
</template>
`;
}
function generatePackageJson(config) {
  var _a;
  return {
    name: ((_a = config.site.siteName) == null ? void 0 : _a.toLowerCase().replace(/\s+/g, "-")) || "ai-landing-page",
    private: true,
    scripts: {
      build: "nuxt build",
      dev: "nuxt dev",
      generate: "nuxt generate",
      preview: "nuxt preview"
    },
    dependencies: {
      "lucide-vue-next": "^0.344.0"
    },
    devDependencies: {
      "@nuxtjs/tailwindcss": "^6.11.4",
      nuxt: "^3.10.3",
      vue: "^3.4.19",
      "vue-router": "^4.3.0"
    }
  };
}
function generateNuxtConfig(config) {
  var _a, _b;
  return `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: "${((_a = config.site) == null ? void 0 : _a.siteName) || "My Landing Page"}",
      meta: [
        { name: 'description', content: '${((_b = config.site) == null ? void 0 : _b.tagline) || ""}' }
      ]
    }
  }
})
`;
}
function generateTailwindConfig(config) {
  var _a;
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
        primary: "${((_a = config.site) == null ? void 0 : _a.primaryColor) || "#4f46e5"}",
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
function generateTokens(config) {
  var _a;
  return {
    color: {
      primary: { value: ((_a = config.site) == null ? void 0 : _a.primaryColor) || "#4f46e5" },
      base: {
        white: { value: "#ffffff" },
        slate950: { value: "#020617" }
      }
    },
    font: {
      sans: { value: "Inter" }
    },
    size: {
      spacing: {
        sm: { value: "0.5rem" },
        md: { value: "1rem" },
        lg: { value: "2rem" },
        xl: { value: "4rem" }
      }
    }
  };
}
async function readComponents(rootDir) {
  const storage = useStorage("assets:web-components");
  const keys = await storage.getKeys();
  const components = [];
  for (const key of keys) {
    if (!key.endsWith(".vue")) continue;
    const content = await storage.getItem(key);
    if (typeof content === "string") {
      components.push({
        name: `components/sections/${key}`,
        content: content.replace(
          /~\/server\/utils\/backend/g,
          "~/utils/backend"
        )
      });
    }
  }
  return components;
}
async function readBackendUtil(rootDir) {
  try {
    const currentDir = dirname(fileURLToPath(globalThis._importMeta_.url));
    const backendUtilPath = resolve(currentDir, "assets/backend.ts");
    const content = await promises.readFile(backendUtilPath, "utf-8");
    return { name: "utils/backend.ts", content };
  } catch (e) {
    return {
      name: "utils/backend.ts",
      content: `export const resolveWordpressConfig = (c: any) => c.backend?.wordpress;`
    };
  }
}
function generateReadme(stack, config, isProject = false) {
  var _a, _b, _c;
  const base = `# ${((_a = config.site) == null ? void 0 : _a.siteName) || "Generated Project"}

Generated by MINIONS AI Builder.

## Setup

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`
`;
  if (stack === "vue-vite") {
    return `${base}
## Stack: Vue 3 + Vite

This project uses **Vite** for lightning fast development.

### Folder Structure
- \`src/App.vue\`: The root component.
- \`src/main.ts\`: Entry point, mounts Vue.
- \`src/router.ts\`: Vue Router configuration.
- \`src/components/sections/\`: All UI sections (Hero, Features, etc.).
- \`src/pages/\`: Page wrappers using \`PageRenderer\`.
- \`src/data/project-config.json\`: The single source of truth for content.

### Integration Guide

**1. Using Components:**
All sections are pure Vue components. You can import them anywhere:
\`\`\`vue
<script setup>
import HeroSection from './components/sections/HeroSection.vue'
<\/script>

<template>
  <HeroSection :config="{...}" />
</template>
\`\`\`

**2. Routing:**
We use \`vue-router\`. Routes are generated automatically in \`src/router.ts\` based on your pages. Add new pages by creating a Vue file and adding a route there.

**3. Theming:**
TailwindCSS is configured in \`tailwind.config.js\`.
- Change primary colors in \`src/data/project-config.json\` (site.primaryColor).
- Dark mode is class-based. Toggle it via the \`dark\` class on the HTML element.

### Deployment
Build using \`npm run build\`. The output will be in \`dist/\`. You can deploy this static folder anywhere (Vercel, Netlify, S3).
`;
  }
  if (stack === "wordpress-theme") {
    return `${base}
## WordPress Headless Configuration

This project is configured as a Headless Frontend for your WordPress site.

**WordPress URL**: \`${((_c = (_b = config.backend) == null ? void 0 : _b.wordpress) == null ? void 0 : _c.baseUrl) || "NOT_SET"}\`

### How it works
1. The **PageRenderer** reads from \`data/${isProject ? "project-config.json" : "page-config.json"}\`.
2. The **BlogListSection** fetches posts from your WordPress API.
3. You can edit content in WordPress (Posts) or in the JSON (Layouts).

### Deployment
Deploy this folder to Vercel/Netlify. It acts as the "View" layer for your WP data.
`;
  }
  if (stack === "nuxt") {
    let structureDocs = `
- **Engine**: Nuxt 3
- **Styling**: TailwindCSS
- **Components**: \`components/sections/*\`
- **Configuration**: \`data/${isProject ? "project-config.json" : "page-config.json"}\`
`;
    if (isProject) {
      structureDocs += `
- **Pages**: 
  - \`pages/index.vue\` (Home)
  - Other pages generated based on project structure.
  - Each page file reads its config from the central JSON.
`;
    }
    return `${base}
## Architecture

${structureDocs}

Open \`app.vue\` and \`pages/\` to see how the \`PageRenderer\` is used.
`;
  }
  return `# Project Export
  
stack: ${stack}

See docs for manual integration.
`;
}
function generateDeployMd() {
  return `# Deployment Guide

## Vercel (Recommended)

1. **Install Vercel CLI** (Optional but faster):
   \`\`\`bash
   npm i -g vercel
   vercel
   \`\`\`

2. **Drag & Drop**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard).
   - Drag this project folder into the "Import Project" area.
   - Framework Preset: **Nuxt.js** (or Vite if using Vue stack).
   - Build Command: \`npm run build\` (default).
   - Output Directory: \`.output\` (Nuxt) or \`dist\` (Vite).

## Netlify

1. Drag and drop the folder.
2. Build Command: \`npm run build\`.
3. Publish Directory: \`dist\`.

## Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["node", ".output/server/index.mjs"]
\`\`\`
`;
}

const downloadKit_post = defineEventHandler(async (event) => {
  var _a;
  const body = await readBody(event);
  const { config, stack } = body;
  const archive = archiver("zip", {
    zlib: { level: 9 }
  });
  setHeader(event, "Content-Type", "application/zip");
  setHeader(
    event,
    "Content-Disposition",
    `attachment; filename="starter-kit-${stack}-${((_a = config.meta) == null ? void 0 : _a.seed) || "seed"}.zip"`
  );
  const files = await generateProjectFiles(config, stack);
  for (const file of files) {
    archive.append(file.content, { name: file.name });
  }
  archive.finalize();
  return sendStream(event, archive);
});

export { downloadKit_post as default };
//# sourceMappingURL=download-kit.post.mjs.map
