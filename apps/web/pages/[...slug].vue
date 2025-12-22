<script setup lang="ts">
const route = useRoute();
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-50">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <h1 class="text-4xl font-bold text-indigo-400">404 / Placeholder</h1>
      <p class="mt-4 text-lg text-slate-300">
        The page <code class="rounded bg-white/10 px-2 py-1">{{ route.path }}</code> does not exist in this builder preview.
      </p>
      <p class="mt-2 text-sm text-slate-400">
        (In a real app, you would create this page file.)
      </p>
      
      <div class="mt-8">
        <NuxtLink
          to="/"
          class="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20"
        >
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
