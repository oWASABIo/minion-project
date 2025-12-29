<script setup lang="ts">
import { ref } from "vue";
import type { CliSection } from "@minions/shared";

defineProps<{
  section: CliSection;
}>();

const copied = ref(false);

const copyCommand = (cmd: string) => {
  navigator.clipboard.writeText(cmd);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <section
    class="px-6 bg-slate-950 relative overflow-hidden"
    :style="{
      paddingTop: 'var(--section-spacing, 6rem)',
      paddingBottom: 'var(--section-spacing, 6rem)',
    }"
  >
    <!-- Glow Effects -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div
      class="mx-auto max-w-5xl relative z-10 grid gap-16 lg:grid-cols-2 items-center"
    >
      <!-- Text Side -->
      <div>
        <div
          v-if="section.title"
          class="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wide text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20"
        >
          CLI Power
        </div>
        <h2
          class="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6"
        >
          {{ section.title }}
        </h2>
        <p
          v-if="section.subtitle"
          class="text-lg text-slate-400 leading-relaxed mb-8"
        >
          {{ section.subtitle }}
        </p>

        <ul v-if="section.steps" class="space-y-4">
          <li
            v-for="(step, i) in section.steps"
            :key="i"
            class="flex items-center gap-4 text-slate-300"
          >
            <div
              class="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-mono shrink-0"
            >
              {{ i + 1 }}
            </div>
            <span>{{ step }}</span>
          </li>
        </ul>
      </div>

      <!-- Terminal Side -->
      <div class="relative group">
        <!-- Glow Back -->
        <div
          class="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 blur opacity-20 group-hover:opacity-40 transition duration-1000"
          :style="{ borderRadius: 'var(--radius-ui, 0.75rem)' }"
        ></div>

        <div
          class="relative border border-white/10 bg-black/90 shadow-2xl overflow-hidden font-mono text-sm leading-relaxed"
          :style="{ borderRadius: 'var(--radius-ui, 0.75rem)' }"
        >
          <!-- Title Bar -->
          <div
            class="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3"
          >
            <div class="flex gap-1.5">
              <div class="h-3 w-3 rounded-full bg-slate-700"></div>
              <div class="h-3 w-3 rounded-full bg-slate-700"></div>
              <div class="h-3 w-3 rounded-full bg-slate-700"></div>
            </div>
            <div class="text-xs text-slate-500">zsh</div>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-4">
            <div
              class="flex items-center gap-2 group/cmd cursor-pointer"
              @click="copyCommand(section.command)"
            >
              <span class="text-pink-500">➜</span>
              <span class="text-blue-400">~</span>
              <span class="text-slate-100">{{ section.command }}</span>
              <span
                class="ml-auto text-xs text-slate-500 opacity-0 group-hover/cmd:opacity-100 transition-opacity"
              >
                {{ copied ? "Copied!" : "Click to copy" }}
              </span>
            </div>
            <div class="text-slate-500">
              Initializing Minions... <br />
              <span class="text-emerald-400">✔</span> Framework: Nuxt 3 <br />
              <span class="text-emerald-400">✔</span> Style: Tailwind CSS <br />
              <br />
            </div>
            <div class="animate-pulse">
              <span class="text-pink-500">➜</span>
              <span class="text-blue-400">~</span>
              <span
                class="inline-block w-2.5 h-4 align-middle bg-slate-500 ml-1"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
