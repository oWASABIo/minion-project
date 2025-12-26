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
  }

  // Common: Components and Utils
  const alias = stack === "vue-vite" ? "@" : "~";
  const components = (await readComponents(rootDir)).map((file) => {
    if (typeof file.content === "string") {
      // Sanitize components for a dependency-free kit
      let clean = file.content
        .replace(
          /const user = useSupabaseUser\(\);/g,
          "const user = ref(null); // Mocked for Kit"
        )
        .replace(
          /const supabase = useSupabaseClient\(\);/g,
          "const supabase = { auth: { signOut: () => {} } }; // Mocked for Kit"
        )
        .replace(
          /const { .* } = useCart\(\);/g,
          "const { items, isDrawerOpen, cartCount, toggleDrawer, addToCart, updateQuantity, cartTotal } = { items: ref([]), isDrawerOpen: ref(false), cartCount: ref(0), toggleDrawer: () => {}, addToCart: () => {}, updateQuantity: () => {}, cartTotal: ref(0) }; // Mocked for Kit"
        )
        .replace(
          /useCart\(\);/g,
          "const { items, isDrawerOpen, cartCount, toggleDrawer, addToCart, updateQuantity, cartTotal } = { items: ref([]), isDrawerOpen: ref(false), cartCount: ref(0), toggleDrawer: () => {}, addToCart: () => {}, updateQuantity: () => {}, cartTotal: ref(0) }; // Mocked for Kit"
        )
        .replace(
          /\/images\/hero-minions-v2\.png/g,
          "https://picsum.photos/seed/minions/800/600"
        )
        .replace(
          /\/images\/product-.*\.png/g,
          "https://picsum.photos/seed/product/800/600"
        )
        .replace(/\/images\/team-.*\.png/g, (match) => {
          const id = match.match(/\d/)?.[0] || "1";
          return `https://i.pravatar.cc/300?img=${id}`;
        })
        .replace(/import type { .* } from "@minions\/shared";/g, (match) => {
          return match.replace("@minions/shared", `${alias}/types/landing`);
        })
        .replace(/@minions\/shared/g, `${alias}/types/landing`)
        .replace(/~\//g, `${alias}/`); // Convert Nuxt style to Stack style if needed

      return {
        ...file,
        name: stack === "vue-vite" ? `src/${file.name}` : file.name,
        content: clean,
      };
    }
    return {
      ...file,
      name: stack === "vue-vite" ? `src/${file.name}` : file.name,
    };
  });
  files.push(...components);

  const backendUtil = await readBackendUtil(rootDir);
  if (typeof backendUtil.content === "string") {
    backendUtil.content = backendUtil.content
      .replace(/@minions\/shared/g, `${alias}/types/landing`)
      .replace(/~\//g, `${alias}/`);
  }
  files.push({
    ...backendUtil,
    name: stack === "vue-vite" ? `src/${backendUtil.name}` : backendUtil.name,
  });

  // Analytics (Standard for all stacks if desired, let's keep it for Nuxt specifically for now or all?)
  // Let's keep it for Nuxt/WP for now as the templates use H3
  if (stack === "nuxt" || stack === "wordpress-theme") {
    files.push({
      name: "server/api/analytics/track.post.ts",
      content: generateAnalyticsApi(),
    });
    files.push({
      name: "composables/useAnalytics.ts",
      content: generateAnalyticsComposable(),
    });
    files.push({
      name: "database/analytics_schema.sql",
      content: generateAnalyticsMigration(),
    });
    files.push({
      name: "ANALYTICS.md",
      content: generateAnalyticsManual(),
    });
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
      content: content, // No global replace here, we do it per-stack in generateProjectFiles
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
    name: "utils/backend.ts",
    content,
  };
}
