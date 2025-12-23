<script setup lang="ts">
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

const store = useBuilderStore();
const { projectConfig } = storeToRefs(store);

// Simple color presets
const COLORS = [
  "#4f46e5", // Indigo (Default)
  "#db2777", // Pink
  "#dc2626", // Red
  "#ea580c", // Orange
  "#d97706", // Amber
  "#16a34a", // Green
  "#0891b2", // Cyan
  "#2563eb", // Blue
  "#7c3aed", // Violet
  "#0f172a", // Slate
];

const FONTS = ["Inter", "Roboto", "Poppins", "Playfair Display"];

function updatePrimaryColor(color: string) {
  if (!projectConfig.value) return;
  const newConfig = JSON.parse(JSON.stringify(projectConfig.value)); // Deep clone
  if (!newConfig.site) newConfig.site = { siteName: "My Site" }; // Safety

  // Update Global
  newConfig.site.primaryColor = color;

  // Propagate to all pages
  if (newConfig.pages) {
    const pages = newConfig.pages;
    Object.keys(pages).forEach((key) => {
      const page = pages[key];
      if (page) {
        if (!page.site) page.site = { siteName: "My Site" };
        page.site.primaryColor = color;
      }
    });
  }

  store.updateProjectConfig(newConfig);
}

function updateThemeMode(mode: "light" | "dark") {
  if (!projectConfig.value) return;
  const newConfig = JSON.parse(JSON.stringify(projectConfig.value));
  if (!newConfig.site) newConfig.site = { siteName: "My Site" };

  newConfig.site.themeMode = mode;

  // Propagate to all pages
  if (newConfig.pages) {
    const pages = newConfig.pages;
    Object.keys(pages).forEach((key) => {
      const page = pages[key];
      if (page) {
        if (!page.site) page.site = { siteName: "My Site" };
        page.site.themeMode = mode;
      }
    });
  }

  store.updateProjectConfig(newConfig);
}

function updateFont(font: string) {
  if (!projectConfig.value) return;
  const newConfig = JSON.parse(JSON.stringify(projectConfig.value));
  if (!newConfig.site) newConfig.site = { siteName: "My Site" };

  newConfig.site.fontFamily = font;

  // Propagate to all pages
  if (newConfig.pages) {
    const pages = newConfig.pages;
    Object.keys(pages).forEach((key) => {
      const page = pages[key];
      if (page && page.site) {
        page.site.fontFamily = font;
      }
    });
  }

  // Dynamically load font from Google Fonts
  const linkId = "dynamic-font-loader";
  let link = document.getElementById(linkId) as HTMLLinkElement;
  if (!link) {
    link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  // Format font name for URL (e.g., "Playfair Display" -> "Playfair+Display")
  const fontName = font.replace(/ /g, "+");
  link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;500;600;700&display=swap`;

  store.updateProjectConfig(newConfig);
}

// TODO: Handle Font Family updates (requires loading font or updating CSS var)
</script>

<template>
  <div class="space-y-6">
    <!-- Theme Mode -->
    <div>
      <label
        class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2 block"
        >Theme</label
      >
      <div
        class="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/10"
      >
        <button
          @click="updateThemeMode('light')"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          :class="
            projectConfig?.site?.themeMode === 'light'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Light
        </button>
        <button
          @click="updateThemeMode('dark')"
          class="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          :class="
            projectConfig?.site?.themeMode !== 'light'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          "
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          Dark
        </button>
      </div>
    </div>

    <!-- Primary Color -->
    <div>
      <label
        class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3 block"
        >Primary Color</label
      >
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="color in COLORS"
          :key="color"
          @click="updatePrimaryColor(color)"
          class="w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
          :class="
            projectConfig?.site?.primaryColor === color
              ? 'border-white'
              : 'border-transparent'
          "
          :style="{ backgroundColor: color }"
          :title="color"
        />
        <!-- Custom Color Input (Hidden native input hack could be used here) -->
      </div>
      <div class="mt-3 flex items-center gap-2">
        <input
          type="color"
          :value="projectConfig?.site?.primaryColor || '#4f46e5'"
          @input="e => updatePrimaryColor((e.target as HTMLInputElement).value)"
          class="h-8 w-8 rounded cursor-pointer bg-transparent border-0 p-0"
        />
        <span class="text-xs text-slate-400 font-mono">{{
          projectConfig?.site?.primaryColor
        }}</span>
      </div>
    </div>

    <!-- Font Family (Placeholder) -->
    <!-- 
    <div>
      <label class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2 block">Typography</label>
      <select class="w-full rounded-xl bg-slate-900/80 px-3 py-2 text-sm ring-1 ring-white/10 text-slate-300">
        <option v-for="font in FONTS" :key="font">{{ font }}</option>
      </select>
    </div> 
    -->
  </div>
</template>
