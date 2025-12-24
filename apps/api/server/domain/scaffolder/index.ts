// import { promises as fs } from "fs"; // REMOVED: Incompatible with Cloudflare Workers
import { resolve, dirname } from "path";
import { fileURLToPath } from "url"; // Still needed for readBackendUtil
// readBackendUtil uses fileURLToPath(import.meta.url). So we KEEP it.
// We remove the vite reference.
import type { PageConfig, ProjectConfig, Stack } from "@minions/shared";

// --- Templates ---
import {
  generateAnalyticsApi,
  generateAnalyticsComposable,
  generateAnalyticsManual,
  generateAnalyticsMigration,
} from "./templates/analytics";
import { generateNuxtConfig, generateTailwindConfig } from "./templates/nuxt";
import { generateReadme, generateDeployMd } from "./templates/readme";
import {
  generateAppVue,
  generateAppVueMultiPage,
  generateAppVueSingle,
  generateAppVueVite,
  generateIndexHtml,
  generateMainTsVite,
  generatePackageJson,
  generatePageVue,
  generatePageVueVite,
  generateRouterTs,
  generateTokens,
  generateViteConfig,
  generateVitePackageJson,
} from "./templates/vue";

type FileEntry = {
  name: string;
  content: string | Buffer;
};

/**
 * Generates the full project structure for a given configuration and stack.
 * Returns an array of file entries.
 */
export async function generateProjectFiles(
  config: PageConfig | ProjectConfig,
  stack: Stack = "nuxt"
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];
  const rootDir = process.cwd();

  const isProject = "pages" in config;
  const projectConfig = isProject ? (config as ProjectConfig) : null;
  const pageConfig = isProject ? null : (config as PageConfig);

  // 1. Core Data
  files.push({
    name: "data/project-config.json", // Unified name for simplicity in new projects
    content: JSON.stringify(config, null, 2),
  });

  // Legacy support: also write page-config.json if single page
  if (!isProject) {
    files.push({
      name: "data/page-config.json",
      content: JSON.stringify(config, null, 2),
    });
  }

  // 2. Types
  try {
    const storage = useStorage("assets:shared-types");
    const typesContent = (await storage.getItem("landing.ts")) as string;

    if (!typesContent) {
      throw new Error(
        "Could not find landing.ts types in storage 'assets:shared-types'"
      );
    }

    files.push({ name: "types/landing.ts", content: typesContent });
  } catch (e) {
    console.warn("Failed to include types/landing.ts:", e);
    files.push({
      name: "types/landing.ts",
      content:
        "// Error reading types from Scaffolder. Please ensure @minions/shared is built or accessible.",
    });
  }

  // 3. Nuxt Scaffolding
  if (stack === "nuxt" || stack === "wordpress-theme") {
    let mainConfig = isProject ? projectConfig!.pages["home"] : pageConfig!;

    if (!mainConfig && isProject) {
      const pages = Object.values(projectConfig!.pages);
      if (pages.length > 0) mainConfig = pages[0];
    }

    if (!mainConfig) {
      throw new Error("Unable to determine main page configuration.");
    }

    // Package.json
    files.push({
      name: "package.json",
      content: JSON.stringify(generatePackageJson(mainConfig), null, 2),
    });

    // Nuxt Config
    files.push({
      name: "nuxt.config.ts",
      content: generateNuxtConfig(mainConfig),
    });

    // Tailwind Config
    files.push({
      name: "tailwind.config.js",
      content: generateTailwindConfig(mainConfig),
    });

    // App & Pages
    if (isProject) {
      // Multi-page App Structure
      files.push({
        name: "app.vue",
        content: generateAppVueMultiPage(),
      });

      // Generate distinct page files
      for (const [pageId, pConfig] of Object.entries(projectConfig!.pages)) {
        const fileName = pageId === "home" ? "index.vue" : `${pageId}.vue`;
        files.push({
          name: `pages/${fileName}`,
          content: generatePageVue(pageId),
        });
      }
    } else {
      // Single Page Legacy Structure
      files.push({
        name: "app.vue",
        content: generateAppVueSingle(),
      });
    }

    // Component Files
    const components = await readComponents(rootDir);
    files.push(...components);

    // Backend Util
    const backendUtil = await readBackendUtil(rootDir);
    files.push(backendUtil);

    // --- Analytics Kit Upgrade ---
    // 1. API Endpoint (Server Logic)
    files.push({
      name: "server/api/analytics/track.post.ts",
      content: generateAnalyticsApi(),
    });

    // 2. Composable (Frontend Logic)
    files.push({
      name: "composables/useAnalytics.ts",
      content: generateAnalyticsComposable(),
    });

    // 3. Database Schema (Migration)
    files.push({
      name: "database/analytics_schema.sql",
      content: generateAnalyticsMigration(),
    });

    // 4. Analytics Manual
    files.push({
      name: "ANALYTICS.md",
      content: generateAnalyticsManual(),
    });
  } else if (stack === "vue-vite") {
    // Vite Scaffolding
    files.push({
      name: "package.json",
      content: JSON.stringify(generateVitePackageJson(config), null, 2),
    });
    files.push({
      name: "vite.config.ts",
      content: generateViteConfig(),
    });
    files.push({
      name: "index.html",
      content: generateIndexHtml(config),
    });
    files.push({
      name: "src/main.ts",
      content: generateMainTsVite(),
    });
    files.push({
      name: "src/App.vue",
      content: generateAppVueVite(),
    });

    if (isProject) {
      // Router for Multi-page
      files.push({
        name: "src/router.ts",
        content: generateRouterTs(projectConfig!),
      });

      for (const [pageId, pConfig] of Object.entries(projectConfig!.pages)) {
        const fileName = pageId === "home" ? "index.vue" : `${pageId}.vue`;
        // Page Wrapper
        files.push({
          name: `src/pages/${fileName}`,
          content: generatePageVueVite(pageId),
        });
      }
    } else {
      // Component-only / Single Page
      // (Just use App.vue logic above)
    }

    const components = await readComponents(rootDir);
    // Vite expects components in src/components
    // Our readComponents returns "components/..."
    // We need to map them to "src/components/..."
    const viteComponents = components.map((c) => ({
      name: `src/${c.name}`,
      content: c.content,
    }));
    files.push(...viteComponents);
  }

  // 4. README & Utils
  // Global Design Tokens
  const configForTokens = isProject
    ? projectConfig!.pages["home"] ||
      (Object.values(projectConfig!.pages)[0] as PageConfig)
    : (pageConfig as PageConfig);

  if (configForTokens) {
    files.push({
      name: isProject
        ? "data/tokens.json"
        : stack === "vue-vite"
        ? "src/data/tokens.json"
        : "data/tokens.json",
      content: JSON.stringify(generateTokens(configForTokens), null, 2),
    });
  }

  files.push({
    name: "README.md",
    content: generateReadme(stack, configForTokens || ({} as any), isProject),
  });

  files.push({
    name: "DEPLOY.md",
    content: generateDeployMd(),
  });

  return files;
}

// Helpers using bundling-friendly approaches
import { useStorage } from "nitropack/runtime";

async function readComponents(rootDir: string): Promise<FileEntry[]> {
  const storage = useStorage("assets:web-components");
  const keys = await storage.getKeys();

  const components: FileEntry[] = [];

  for (const key of keys) {
    // key is like "sections:HeroSection.vue" or "ui:Button.vue"
    // We want to preserve the structure relative to components/
    // e.g. components/sections/HeroSection.vue
    const content = await storage.getItem(key);
    if (typeof content !== "string") continue; // Should be string for text files

    // Map storage keys to file paths
    // assets:web-components base is "components"
    // So "sections:HeroSection.vue" -> "components/sections/HeroSection.vue"
    const relativePath = key.replace(/:/g, "/");
    components.push({
      name: `components/${relativePath}`,
      content: content,
    });
  }

  return components;
}

async function readBackendUtil(rootDir: string): Promise<FileEntry> {
  const storage = useStorage("assets:scaffold-assets");
  let content = (await storage.getItem("backend.ts")) as string;

  if (!content) {
    content = "export const backend = {}; // Placeholder (Asset not found)";
  }

  return {
    name: "server/utils/backend.ts",
    content,
  };
}
