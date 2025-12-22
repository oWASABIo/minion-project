<script setup lang="ts">
import CartDrawer from "~/components/ui/CartDrawer.vue";
import SiteHeader from "~/components/SiteHeader.vue";

const { styles } = useTheme();
</script>

<template>
  <div
    :style="styles"
    class="min-h-screen font-theme text-slate-900 dark:text-white transition-colors duration-300 flex flex-col pt-[72px]"
  >
    <SiteHeader />
    <slot />
    <CartDrawer />
  </div>
</template>

<style>
/* Global overrides for theme variables */
.font-theme {
  font-family: var(--theme-font, inherit);
}
</style>
