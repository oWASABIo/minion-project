<script setup lang="ts">
import { computed } from "vue";
import type { PageConfig } from "@minions/shared";
import { useNavigation } from "~/composables/useNavigation";

const props = defineProps<{
  config: PageConfig;
}>();

const { siteName, menuItems } = useNavigation(computed(() => props.config));
const year = new Date().getFullYear();
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
        <NuxtLink
          v-for="item in menuItems"
          :key="item.href"
          :to="item.href"
          class="hover:text-primary transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink to="/docs" class="hover:text-primary transition-colors"
          >Documentation</NuxtLink
        >
      </nav>
    </div>
  </footer>
</template>
