<script setup lang="ts">
import { computed, ref } from "vue";
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import type { PageConfig } from "@minions/shared";

const { cartCount, toggleDrawer } = useCart();
const mobileMenuOpen = ref(false);

const props = defineProps<{
  config: PageConfig;
}>();

const siteName = computed(() => props.config.site.siteName || "Generated Site");
const tagline = computed(() => props.config.site.tagline || "");

// TODO: In Phase 11, we will generate real menu items from config.pages
const menuItems = computed(() => {
  // 1. Use Real Pages if available
  // config.pages is injected by p/[id].vue
  if ((props.config as any).pages) {
    const pages = (props.config as any).pages;

    // Sort logic: Home first, then meaningful pages, then others
    const order = [
      "home",
      "shop",
      "blog",
      "about",
      "contact",
      "features",
      "pricing",
    ];

    return (
      Object.entries(pages)
        .map(([key, page]: any) => {
          const href = key === "home" ? "/" : `/${key}`;

          // Format Label: 'product-detail' -> 'Product Detail'
          let label = page.meta?.title;
          if (!label) {
            // Fallback: Convert key to Title Case (handle kebab/snake case)
            label = key
              .replace(/[-_]/g, " ")
              .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase to space
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }

          return { key, label, href };
        })
        // Show ALL pages except maybe strictly internal ones if we really want to hide them.
        // User requested to see what was generated, so let's be permissible.
        // Only hide 'cart' or 'checkout' if they are not relevant for navigation?
        // For now, let's show everything except maybe 'cart' as that's usually an icon.
        .filter((p) => !["cart"].includes(p.key))
        .sort((a, b) => {
          const indexA = order.indexOf(a.key.toLowerCase());
          const indexB = order.indexOf(b.key.toLowerCase());

          // If both are known, sort by order
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          // If only A is known, A comes first
          if (indexA !== -1) return -1;
          // If only B is known, B comes first
          if (indexB !== -1) return 1;

          // Otherwise, alphabetical
          return a.key.localeCompare(b.key);
        })
    );
  }

  // 2. Fallback to Mock Data (Existing logic)
  if (props.config.template === "ecommerce") {
    return [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/#products" },
      { label: "About", href: "/#features" },
    ];
  }
  if (props.config.template === "blog") {
    return [
      { label: "Home", href: "/" },
      { label: "Articles", href: "/#latest-posts" },
      { label: "Subscribe", href: "/#newsletter" },
    ];
  }
  return [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ];
});

const showCart = computed(() => props.config.template === "ecommerce");
const secondaryCta = computed(() => {
  if (
    props.config.template === "landing" ||
    props.config.template === "company"
  ) {
    return { label: "Contact Us", href: "/#contact" };
  }
  return null;
});
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300"
    :style="{
      backgroundColor: 'var(--nav-bg)',
      borderColor: 'var(--border-color)',
    }"
  >
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-8">
        <!-- Logo / Brand -->
        <div class="min-w-0">
          <a
            href="/"
            class="text-lg font-bold tracking-tight transition-colors hover:opacity-80"
            :style="{ color: 'var(--text-primary)' }"
          >
            {{ siteName }}
          </a>
          <div
            v-if="tagline"
            class="text-xs font-medium truncate hidden sm:block"
            :style="{ color: 'var(--text-secondary)' }"
          >
            {{ tagline }}
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex gap-6 text-sm font-medium">
          <a
            v-for="item in menuItems"
            :key="item.href"
            :href="item.href"
            class="transition-colors hover:text-[var(--text-primary)] text-[var(--text-secondary)]"
          >
            {{ item.label }}
          </a>
        </nav>
      </div>

      <!-- CTA & Cart -->
      <div class="flex items-center gap-4">
        <!-- Optional Secondary CTA for non-ecommerce -->
        <a
          v-if="secondaryCta"
          :href="secondaryCta.href"
          class="hidden sm:inline-flex px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"
          :style="{ backgroundColor: 'var(--color-primary)' }"
        >
          {{ secondaryCta.label }}
        </a>

        <button
          v-if="showCart"
          @click="toggleDrawer"
          class="relative group p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <ShoppingBagIcon
            class="w-6 h-6 transition-colors"
            :style="{ color: 'var(--text-primary)' }"
          />
          <span
            v-if="cartCount > 0"
            class="absolute -top-1 -right-1 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 transition-colors"
            style="background-color: var(--color-primary)"
          >
            {{ cartCount }}
          </span>
        </button>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = true"
          class="md:hidden p-2 -mr-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <span class="sr-only">Open menu</span>
          <Bars3Icon
            class="w-6 h-6"
            :style="{ color: 'var(--text-primary)' }"
          />
        </button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-50 md:hidden h-screen w-screen flex flex-col pt-4 px-6 pb-6 animate-fade-in bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
    >
      <div class="flex items-center justify-between mb-8">
        <a
          href="/"
          class="text-lg font-bold tracking-tight"
          :style="{ color: 'var(--text-primary)' }"
        >
          {{ siteName }}
        </a>
        <button
          @click="mobileMenuOpen = false"
          class="p-2 -mr-2"
          :style="{ color: 'var(--text-secondary)' }"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>
      <nav class="flex flex-col gap-6 text-lg font-medium">
        <a
          v-for="item in menuItems"
          :key="item.href"
          :href="item.href"
          class="py-2 border-b border-dashed border-white/10 transition-colors"
          :style="{ color: 'var(--text-primary)' }"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </a>
        <a
          v-if="secondaryCta"
          :href="secondaryCta.href"
          class="mt-4 px-4 py-3 rounded-xl text-center font-bold text-white transition-opacity hover:opacity-90"
          :style="{ backgroundColor: 'var(--color-primary)' }"
          @click="mobileMenuOpen = false"
        >
          {{ secondaryCta.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
