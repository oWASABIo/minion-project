<script setup lang="ts">
import { computed } from "vue";
import type { PageConfig } from "~/types/landing";

const props = defineProps<{
  config: PageConfig;
}>();

const year = new Date().getFullYear();
const siteName = computed(() => props.config.site.siteName || "Company");
</script>

<template>
  <footer
    class="border-t border-slate-200 dark:border-white/10 mt-20 py-16 bg-slate-50 dark:bg-black/20"
  >
    <div
      class="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-6"
    >
      <div class="text-center md:text-left">
        <div class="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {{ siteName }}
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          &copy; {{ year }} {{ siteName }}. All rights reserved.
        </p>
      </div>

      <nav
        class="flex flex-wrap justify-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300"
      >
        <NuxtLink to="/docs" class="hover:text-primary transition-colors"
          >Documentation</NuxtLink
        >
        <a href="#" class="hover:text-primary transition-colors"
          >Privacy Policy</a
        >
        <a href="#" class="hover:text-primary transition-colors"
          >Terms of Service</a
        >
        <a href="#" class="hover:text-primary transition-colors">Contact</a>
      </nav>
    </div>
  </footer>
</template>
