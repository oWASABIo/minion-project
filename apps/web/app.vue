<script setup lang="ts">
import CartDrawer from "~/components/ui/CartDrawer.vue";
import ToastContainer from "~/components/ui/ToastContainer.vue";

useHead({
  link: [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossorigin: "",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;700&display=swap",
    },
    {
      rel: "icon",
      type: "image/png",
      href: "/logo.png",
    },
  ],
  bodyAttrs: {
    class: "font-sans antialiased bg-slate-950 text-white",
  },
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <CartDrawer />
    <ToastContainer />
  </NuxtLayout>
</template>

<style>
:root {
  --font-mono: "JetBrains Mono", monospace;
}
.font-mono {
  font-family: var(--font-mono);
}

/* Global Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(4px);
}

/* Layout Transitions */
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.3s ease;
}
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
