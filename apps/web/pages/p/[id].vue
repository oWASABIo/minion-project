<script setup lang="ts">
import PageRenderer from "~/components/sections/PageRenderer.vue";
import type { ProjectConfig } from "@minions/shared";

const route = useRoute();
const id = route.params.id as string;
const config = ref<ProjectConfig | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

definePageMeta({
  layout: false,
});

useHead({
  title: computed(() => {
    const pageTitle = (config.value?.meta as any)?.title;
    const siteName = config.value?.site?.siteName || "Minions Site";
    return pageTitle ? `${pageTitle} | ${siteName}` : siteName;
  }),
  meta: [
    {
      name: "description",
      content: computed(
        () => config.value?.site?.tagline || "Built with Minions AI"
      ),
    },
  ],
});

const rootConfig = ref<ProjectConfig | null>(null);

onMounted(async () => {
  try {
    const { project } = await $fetch<{ project: any }>(
      `/api/projects/public/${id}`
    );
    if (project && project.config) {
      rootConfig.value = project.config;
      // FIX: PageRenderer expects a PAGE config (with sections), not the ROOT config.
      // We extract the 'home' page (or first page) and merge it with site/backend config.
      const homePage =
        rootConfig.value?.pages?.["home"] ||
        Object.values(rootConfig.value?.pages || {})[0];

      if (homePage) {
        // Construct a full PageConfig object that PageRenderer expects
        config.value = {
          ...homePage, // sections, templateId, etc.
          site: rootConfig.value?.site, // Global site config (colors, fonts)
          backend: rootConfig.value?.backend, // Backend config
          meta: rootConfig.value?.meta, // Meta info
          pages: rootConfig.value?.pages, // Pass all pages for navigation logic
          projectId: project.id, // Inject Project ID for Analytics
        } as any;
      } else {
        error.value = "Project has no pages configured.";
      }
    } else {
      error.value = "Project found but config is empty.";
    }
  } catch (e: any) {
    console.error("Failed to load project", e);
    error.value = "Site not found or private. (" + e.message + ")";
  } finally {
    loading.value = false;
  }
});

const isDark = computed(() => {
  return config.value?.site?.themeMode !== "light";
});

function toggleTheme() {
  if (!config.value || !config.value.site) return;

  if (isDark.value) {
    config.value.site.themeMode = "light";
  } else {
    config.value.site.themeMode = "dark";
  }
}

function handleLinkClick(e: MouseEvent) {
  const target = (e.target as HTMLElement).closest("a");
  if (!target) return;

  const href = target.getAttribute("href");
  if (!href) return;

  // 1. Handle External Links -> Allow default
  if (href.startsWith("http") || href.startsWith("mailto:")) return;

  // 2. Handle Anchors -> Allow default (scrolling)
  if (href.startsWith("#")) return;

  // 3. Handle Internal Navigation
  e.preventDefault();
  console.log("Intercepted navigation to:", href);

  if (!rootConfig.value) return;

  // Map path to page key (Simple logic for now)
  let pageKey = "home";
  if (href === "/" || href === "") {
    pageKey = "home";
  } else {
    // Remove leading slash
    pageKey = href.replace(/^\//, "");
  }

  const targetPage = rootConfig.value.pages?.[pageKey];

  if (targetPage) {
    config.value = {
      ...targetPage,
      site: rootConfig.value.site,
      backend: rootConfig.value.backend,
      meta: rootConfig.value.meta,
      pages: rootConfig.value.pages, // Keep pages available for navigation
      projectId: (config.value as any)?.projectId, // Persist Project ID
    } as any;

    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    console.warn("Target page not found:", pageKey);
    // Optional: Show 404 toast
  }
}

function postToParent(type: string, payload: any = {}) {
  if (typeof window !== "undefined") {
    window.parent.postMessage({ type, ...payload }, "*");
  }
}
</script>

<template>
  <!-- Wrapper generally handles connection failures/loading, but PageRenderer owns the design -->
  <div
    class="min-h-screen bg-slate-950 text-white relative"
    @click="handleLinkClick"
  >
    <Transition name="fade" mode="out-in">
      <div v-if="loading" class="flex items-center justify-center min-h-screen">
        <div
          class="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"
        ></div>
      </div>

      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center min-h-screen text-center px-4"
      >
        <h1
          class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 mb-4"
        >
          Oops!
        </h1>
        <p class="text-slate-400 text-lg mb-8">{{ error }}</p>
        <NuxtLink
          to="/"
          class="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium"
        >
          Go Home
        </NuxtLink>
      </div>

      <div v-else-if="config" class="relative">
        <NuxtErrorBoundary>
          <PageRenderer
            :config="config as any"
            headerMode="generated"
            :enableContainer="false"
            @select-section="(id) => postToParent('selectSection', { id })"
            @reorder-section="
              (payload) => postToParent('reorderSection', payload)
            "
            @duplicateSection="(id) => postToParent('duplicateSection', { id })"
            @deleteSection="(id) => postToParent('deleteSection', { id })"
          />

          <!-- Floating Theme Toggle -->
          <button
            @click="toggleTheme"
            class="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 group"
            :title="'Switch to ' + (isDark ? 'Light' : 'Dark') + ' Mode'"
          >
            <svg
              v-if="isDark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6 text-yellow-300"
            >
              <path
                d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6 text-indigo-400"
            >
              <path
                fill-rule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          <template #error="{ error }">
            <div class="p-8 text-center text-red-500">
              <h2 class="text-2xl font-bold mb-4">Critical Rendering Error</h2>
              <pre class="bg-black p-4 rounded text-left overflow-auto">{{
                error
              }}</pre>
            </div>
          </template>
        </NuxtErrorBoundary>
      </div>

      <div
        v-else
        class="flex items-center justify-center min-h-screen text-slate-500"
      >
        No configuration loaded.
      </div>
    </Transition>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
