<script setup lang="ts">
import { PROMPT_EXAMPLES } from "~/data/prompt-examples";
import { useRouter } from "vue-router";

const router = useRouter();

function useTemplate(ex: any) {
  // Encode brief to ensure it passes safely in URL
  const query = {
    template: ex.template,
    brief: ex.brief,
    seed: Date.now().toString(),
  };
  router.push({ path: "/builder", query });
}
</script>

<template>
  <main class="py-12 px-6">
    <div class="mx-auto max-w-4xl text-center mb-16">
      <h1
        class="text-4xl font-bold md:text-5xl lg:text-6xl bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
      >
        Explore Templates
      </h1>
      <p class="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
        Start your next project with one of our AI-optimized prompt templates.
        Click any card to load it directly into the builder.
      </p>
    </div>

    <div class="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="ex in PROMPT_EXAMPLES"
        :key="ex.id"
        class="group relative flex flex-col p-6 text-left rounded-3xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all hover:-translate-y-1"
        @click="useTemplate(ex)"
      >
        <div class="flex items-center gap-3 mb-4">
          <span
            class="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            :class="{
              'bg-indigo-500/20 text-indigo-300': ex.template === 'landing',
              'bg-emerald-500/20 text-emerald-300': ex.template === 'company',
              'bg-amber-500/20 text-amber-300': ex.template === 'blog',
              'bg-cyan-500/20 text-cyan-300': ex.template === 'ecommerce',
              'bg-fuchsia-500/20 text-fuchsia-300': ex.template === 'portfolio',
              'bg-violet-500/20 text-violet-300': ex.template === 'saas',
            }"
          >
            {{ ex.template }}
          </span>
        </div>

        <h3
          class="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors mb-2"
        >
          {{ ex.title }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-slate-300 mb-4 line-clamp-3">
          {{ ex.description }}
        </p>

        <!-- Preview -->
        <div
          class="flex-1 overflow-hidden relative rounded-lg bg-black/40 p-3 border border-white/5 mb-4"
        >
          <div
            class="text-[10px] text-slate-500 font-bold uppercase mb-1 tracking-wider"
          >
            Prompt Preview
          </div>
          <p
            class="text-xs text-slate-400 line-clamp-3 font-mono leading-relaxed opacity-80"
          >
            {{ ex.brief }}
          </p>
        </div>

        <div
          class="flex items-center text-sm font-semibold text-indigo-400 group-hover:text-indigo-300"
        >
          Use this template
          <svg
            class="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </button>
    </div>
  </main>
</template>
