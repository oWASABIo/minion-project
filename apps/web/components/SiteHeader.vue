<script setup lang="ts">
import { computed } from "vue";
import type { PageConfig } from "@minions/shared";
import { pageConfig as defaultPageConfig } from "~/data/landing-data";

const props = withDefaults(
  defineProps<{
    config?: PageConfig;
  }>(),
  {
    config: () => defaultPageConfig,
  }
);

const siteName = computed(
  () => props.config.site?.siteName || "Generated Preview"
);
const tagline = computed(() => props.config.site?.tagline || "");

const user = useSupabaseUser();
const supabase = useSupabaseClient();
const showProfileMenu = ref(false);

const handleLogout = async () => {
  await supabase.auth.signOut();
  navigateTo("/login");
};
</script>

<template>
  <header
    class="border-b border-white/10 bg-slate-950/80 backdrop-blur fixed top-0 w-full z-40 transition-all duration-300"
  >
    <div
      class="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4"
    >
      <div class="flex items-center gap-6">
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Logo"
            class="h-10 w-10 rounded-full shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform"
          />
          <div class="flex flex-col">
            <span
              class="text-sm font-bold tracking-widest uppercase text-slate-100 group-hover:text-indigo-400 transition-colors"
            >
              {{ siteName }}
            </span>
          </div>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-6 ml-4">
          <NuxtLink
            to="/examples"
            class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            active-class="text-white"
          >
            Examples
          </NuxtLink>
          <NuxtLink
            to="/docs"
            class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            active-class="text-white"
          >
            Docs
          </NuxtLink>
        </nav>
      </div>

      <div class="flex items-center gap-3">
        <template v-if="user">
          <NuxtLink
            to="/dashboard"
            class="text-sm font-medium text-slate-400 hover:text-white transition-colors mr-2"
          >
            Dashboard
          </NuxtLink>
          <div class="relative">
            <button
              @click="showProfileMenu = !showProfileMenu"
              class="flex items-center gap-2 focus:outline-none"
            >
              <div
                class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20"
              >
                {{ user.email?.charAt(0).toUpperCase() }}
              </div>
            </button>

            <!-- Dropdown -->
            <div
              v-if="showProfileMenu"
              class="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl py-1 z-50"
            >
              <div class="px-4 py-2 border-b border-white/5">
                <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
              </div>
              <NuxtLink
                to="/dashboard"
                class="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >My Projects</NuxtLink
              >
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>

          <!-- Overlay to close -->
          <div
            v-if="showProfileMenu"
            class="fixed inset-0 z-40"
            @click="showProfileMenu = false"
          ></div>
        </template>

        <template v-else>
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-slate-400 hover:text-white transition-colors mr-2"
            >Sign In</NuxtLink
          >
        </template>

        <NuxtLink
          to="/builder"
          class="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
        >
          <span>Open Builder</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-3 h-3"
          >
            <path
              fill-rule="evenodd"
              d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
              clip-rule="evenodd"
            />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
