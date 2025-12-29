<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PageConfig, Section, BlogListSection } from "@minions/shared";
import { resolveWordpressConfig } from "~/utils/backend";
import { useRoute } from "vue-router";
import { useBuilderStore } from "~/stores/builder";
const store = useBuilderStore();

import GeneratedHeader from "~/components/sections/marketing/GeneratedHeader.vue";
import SiteFooter from "~/components/SiteFooter.vue";

import SectionWrapper from "~/components/builder/SectionWrapper.vue";

import HeroSection from "~/components/sections/marketing/HeroSection.vue";
import FeaturesSection from "~/components/sections/marketing/FeaturesSection.vue";
import TestimonialsSection from "~/components/sections/marketing/TestimonialsSection.vue";
import FaqSection from "~/components/sections/marketing/FaqSection.vue";
import CtaSection from "~/components/sections/marketing/CtaSection.vue";
import BlogListSectionComp from "~/components/sections/blog/BlogListSection.vue";
import PricingSection from "~/components/sections/marketing/PricingSection.vue";
import StatsSection from "~/components/sections/marketing/StatsSection.vue";
import TeamSection from "~/components/sections/marketing/TeamSection.vue";
import ProductListSection from "~/components/sections/ecommerce/ProductListSection.vue";
import ProductDetailSection from "~/components/sections/ecommerce/ProductDetailSection.vue";
import CliSection from "~/components/sections/marketing/CliSection.vue";
import "~/assets/css/blueprint.css";

const props = withDefaults(
  defineProps<{
    config: PageConfig;
    headerMode?: "app" | "generated";
    isEditMode?: boolean;
    selectedSectionId?: string;
    enableContainer?: boolean;
  }>(),
  {
    headerMode: "generated",
    isEditMode: false,
    enableContainer: true, // Default to true to preserve existing behavior
  }
);

defineEmits<{
  (e: "select-section", id: string): void;
  (
    e: "reorder-section",
    payload: { id: string; direction: "up" | "down" }
  ): void;
}>();

const blogDataMap = ref<Record<string, any[]>>({});
const blogLoadingMap = ref<Record<string, boolean>>({});

const wp = computed(() => resolveWordpressConfig(props.config));

function isBlogListSection(s: Section): s is BlogListSection {
  return s.type === "blogList" || s.type === "bloglist";
}

const MOCK_POSTS = [
  {
    id: 1,
    title: { rendered: "Getting Started with AI Web Building (Mock)" },
    excerpt: {
      rendered:
        "<p>This is a mockup post because no WordPress URL was provided.</p>",
    },
    link: "#",
    date: new Date().toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: { rendered: "Top 5 Design Trends for 2025 (Mock)" },
    excerpt: {
      rendered:
        "<p>Mockup data to visualize how your blog section will look.</p>",
    },
    link: "#",
    date: new Date().toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: { rendered: "Why Nuxt 3 is the Best Choice (Mock)" },
    excerpt: {
      rendered: "<p>Another sample post found in the fallback dataset.</p>",
    },
    link: "#",
    date: new Date().toISOString(),
    imageUrl:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800",
  },
];

async function fetchBlogPosts(sec: BlogListSection) {
  const baseUrl = wp.value?.baseUrl || "";
  const restBase = wp.value?.restBase || "/wp-json/wp/v2";
  const endpoint = sec.source?.endpoint || "";

  // 1. No URL -> Mock
  if (!baseUrl) {
    blogDataMap.value[sec.id] = MOCK_POSTS;
    return;
  }

  // 2. Has URL -> Fetch
  blogLoadingMap.value[sec.id] = true;

  try {
    const posts = await $fetch<any[]>("/api/wp-posts", {
      query: { baseUrl, restBase, endpoint },
    });

    if (Array.isArray(posts) && posts.length > 0) {
      blogDataMap.value[sec.id] = posts;
    } else {
      // Fetch empty -> Fallback
      blogDataMap.value[sec.id] = MOCK_POSTS;
    }
  } catch (e) {
    console.error("Failed to fetch blog posts:", e);
    // 3. Error -> Fallback
    blogDataMap.value[sec.id] = MOCK_POSTS;
  } finally {
    blogLoadingMap.value[sec.id] = false;
  }
}

const blogKey = computed(() => {
  const sections = (props.config.sections || []) as Section[];
  const blogs = sections.filter(isBlogListSection);
  return blogs
    .map((s) => `${s.id}:${s.source?.endpoint || ""}:${s.maxItems ?? ""}`)
    .join("|");
});

watch(
  [
    () => props.config.backend?.wordpress?.baseUrl,
    () => props.config.backend?.wordpress?.restBase,
    blogKey,
  ],
  async () => {
    const sections = (props.config.sections || []) as Section[];
    const blogs = sections.filter(isBlogListSection);
    await Promise.all(blogs.map(fetchBlogPosts));
  },
  { immediate: true }
);

// Analytics Tracking
const { trackPageView } = useAnalytics();
const route = useRoute();

watch(
  () => props.config, // Track whenever config (page) changes
  (newConfig) => {
    if ((newConfig as any)?.projectId) {
      trackPageView((newConfig as any).projectId, route.path);
    }
  },
  { immediate: true }
);

const isDark = computed(() => {
  if (isBlueprint.value) return false; // Force light mode for blueprints
  return props.config?.site?.themeMode !== "light";
});

const isBlueprint = computed(() => {
  return (
    (props.config as any)?.mode === "blueprint" ||
    props.config?.meta?.mode === "blueprint"
  );
});

// DEBUG: Log full sections to troubleshoot content keys
watch(
  () => props.config,
  (cfg) => {
    if (cfg?.sections) {
      console.log(
        "[PageRenderer] Full Sections Data:",
        JSON.parse(JSON.stringify(cfg.sections))
      );
    } else {
      console.warn("[PageRenderer] No sections found in config");
    }
  },
  { immediate: true, deep: true }
);

const accent = computed(() => props.config?.site?.primaryColor || "#4f46e5");
const font = computed(() => props.config?.site?.fontFamily || "Inter");

// Inject variables into Body so they are available globally (layout, drawers, modals)
// Use a function for useHead to ensure reactivity
useHead(() => ({
  style: [
    {
      id: "theme-vars",
      children: `
        :root {
          --accent: ${accent.value};
          --font-primary: ${font.value};
          --text-primary: ${isDark.value ? "#ffffff" : "#0f172a"};
          --text-secondary: ${isDark.value ? "#94a3b8" : "#475569"};
          --bg-page: ${isDark.value ? "#020617" : "#ffffff"};
          --bg-subtle: ${isDark.value ? "#0f172a" : "#f9fafb"};
          --bg-card: ${isDark.value ? "rgba(255, 255, 255, 0.05)" : "#ffffff"};
          --border-color: ${
            isDark.value ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"
          };
          --nav-bg: ${
            isDark.value ? "rgba(2, 6, 23, 0.8)" : "rgba(255, 255, 255, 0.9)"
          };
          --shadow-card: ${
            isDark.value ? "none" : "0 4px 20px -2px rgba(0, 0, 0, 0.05)"
          };
          --color-primary: ${accent.value};
        }
      `,
    },
  ],
  bodyAttrs: {
    class: isDark.value ? "dark" : "",
  },
}));

const themeStyle = computed(() => {
  // Base vars used by both modes
  const designTokens = {
    // Design Tokens (Radius & Spacing)
    "--radius-ui": `${
      (props.config?.site as any)?.borderRadius ??
      (store.projectConfig?.site as any)?.borderRadius ??
      16
    }px`,
    "--section-spacing": `${
      ((props.config?.site as any)?.spacing ??
        (store.projectConfig?.site as any)?.spacing ??
        5) * 4
    }rem`,
  };

  if (isBlueprint.value) {
    return {
      background: "var(--bg-page)",
      fontFamily: "'JetBrains Mono', monospace",
      ...designTokens,
    } as any;
  }

  return {
    background: `radial-gradient(1000px circle at 20% 0%, ${accent.value}${
      isDark.value ? "22" : "15"
    }, transparent 40%),
                 radial-gradient(900px circle at 80% 25%, ${accent.value}${
      isDark.value ? "18" : "10"
    }, transparent 45%),
                 var(--bg-page)`,
    ["--accent" as any]: accent.value,
    ["--font-primary" as any]: font.value,
    ["--text-primary" as any]: isDark.value ? "#ffffff" : "#0f172a",
    ["--text-secondary" as any]: isDark.value ? "#94a3b8" : "#475569",
    ["--bg-page" as any]: isDark.value ? "#020617" : "#ffffff",
    ["--bg-subtle" as any]: isDark.value ? "#0f172a" : "#f9fafb",
    ["--bg-card" as any]: isDark.value
      ? "rgba(255, 255, 255, 0.05)"
      : "#ffffff",
    ["--border-color" as any]: isDark.value
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)",
    ["--nav-bg" as any]: isDark.value
      ? "rgba(2, 6, 23, 0.8)"
      : "rgba(255, 255, 255, 0.9)",
    ["--shadow-card" as any]: isDark.value
      ? "none"
      : "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
    ["--color-primary" as any]: accent.value,
    ...designTokens,
  } as any;
});
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300 text-slate-900 dark:text-slate-50 flex flex-col bg-white dark:bg-slate-950"
    :class="{ dark: isDark, 'is-blueprint': isBlueprint }"
    :style="themeStyle"
  >
    <GeneratedHeader v-if="headerMode === 'generated'" :config="config" />

    <main
      class="flex-1"
      :class="
        enableContainer ? 'mx-auto max-w-5xl px-6 py-12 w-full' : 'w-full'
      "
    >
      <template v-for="section in config.sections" :key="section.id">
        <SectionWrapper
          :section="section"
          :isEditMode="isEditMode"
          :isSelected="selectedSectionId === section.id"
          @select="$emit('select-section', $event)"
          @move-up="
            $emit('reorder-section', { id: section.id, direction: 'up' })
          "
          @move-down="
            $emit('reorder-section', { id: section.id, direction: 'down' })
          "
        >
          <HeroSection
            v-if="section.type === 'hero'"
            :section="section as any"
          />

          <FeaturesSection
            v-else-if="section.type === 'features'"
            :section="section as any"
          />

          <TestimonialsSection
            v-else-if="section.type === 'testimonials'"
            :section="section as any"
          />

          <FaqSection
            v-else-if="section.type === 'faq'"
            :section="section as any"
          />

          <BlogListSectionComp
            v-else-if="
              section.type === 'blogList' || section.type === 'bloglist'
            "
            :section="section as any"
            :posts="blogDataMap[section.id] || []"
            :loading="!!blogLoadingMap[section.id]"
          />

          <CtaSection
            v-else-if="section.type === 'cta'"
            :section="section as any"
          />

          <PricingSection
            v-else-if="section.type === 'pricing'"
            :section="section as any"
          />

          <StatsSection
            v-else-if="section.type === 'stats'"
            :section="section as any"
          />

          <TeamSection
            v-else-if="section.type === 'team'"
            :section="section as any"
          />

          <ProductListSection
            v-else-if="section.type === 'productList'"
            :section="section as any"
            :config="config"
          />

          <ProductDetailSection
            v-else-if="section.type === 'productDetail'"
            :section="section as any"
            :config="config"
          />

          <CliSection
            v-else-if="section.type === 'cli'"
            :section="section as any"
          />
        </SectionWrapper>
      </template>
    </main>

    <SiteFooter :config="config" />
  </div>
</template>
