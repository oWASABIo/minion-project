<script setup lang="ts">
import type { Section } from "@minions/shared";

defineProps<{
  section: Section;
}>();
</script>

<template>
  <section
    class="py-12 bg-slate-900/10 border-2 border-dashed border-red-500/30 rounded-2xl mx-4 my-6 overflow-hidden"
  >
    <div
      class="container mx-auto px-6 flex flex-col items-center text-center space-y-4"
    >
      <div class="p-3 bg-red-500/10 rounded-full text-red-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.34c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      </div>
      <div>
        <h3 class="text-lg font-bold text-red-500 uppercase tracking-wider">
          Unsupported Section Type
        </h3>
        <p class="text-sm text-slate-500 mt-1">
          Section type
          <code
            class="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-xs"
            >{{ section.type }}</code
          >
          has no renderer yet.
        </p>
      </div>
      <div
        class="text-[10px] font-mono text-slate-400 bg-black/20 p-2 rounded max-w-xs truncate"
      >
        ID: {{ section.id }}
      </div>
    </div>
  </section>
</template>
