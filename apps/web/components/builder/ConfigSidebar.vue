<script setup lang="ts">
import { PROMPT_EXAMPLES, type PromptExample } from "~/data/prompt-examples";
import BaseSelect from "~/components/ui/BaseSelect.vue";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";

import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

const store = useBuilderStore();
// Bi-directional binding via store
const { generation } = storeToRefs(store);

const props = defineProps<{
  loading: boolean;
  stage: string;
  progressMessage: string;
  error: string | null;
  user: any; // Supabase user
  streamingLog?: string;
  hasResult?: boolean;
}>();

const emit = defineEmits<{
  (e: "generate"): void;
  (e: "download:kit"): void;
  (e: "download:json"): void;
}>();

const templates = [
  "landing",
  "saas",
  "company",
  "blog",
  "ecommerce",
  "portfolio",
];
const stacks = ["nuxt", "vue-vite", "wordpress-theme", "nextjs"];
const modeOptions = ["auto", "blueprint", "live"] as const;

function applyExample(ex: PromptExample) {
  generation.value.brief = ex.brief;
  if (ex.template) generation.value.template = ex.template;
  // Stack is not part of PromptExample currently
  // if (ex.stack) generation.value.stack = ex.stack;
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <BaseSelect
        v-model="generation.template"
        label="Template"
        :options="templates"
      />
      <BaseSelect v-model="generation.stack" label="Stack" :options="stacks" />
      <div>
        <label
          class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
          >Mode</label
        >
        <div class="flex gap-2">
          <BaseButton
            v-for="m in modeOptions"
            :key="m"
            @click="!user && m !== 'blueprint' ? null : (generation.mode = m)"
            size="xs"
            :variant="generation.mode === m ? 'primary' : 'secondary'"
            :disabled="!user && m !== 'blueprint'"
            :title="
              !user && m !== 'blueprint'
                ? 'Login required for AI Mode'
                : m === 'blueprint'
                ? 'Generate a wireframe layout to plan structure'
                : m === 'live'
                ? 'Generate high-quality content using AI'
                : 'Auto-select mode based on input'
            "
          >
            {{ m }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- WP Inputs -->
    <div class="grid gap-4 md:grid-cols-2">
      <BaseInput
        v-model="generation.wordpressBaseUrl"
        label="WP Base URL"
        placeholder="e.g. https://wordpress.org/news"
      />
      <BaseInput
        v-model="generation.wordpressRestBase"
        label="WP Rest Base"
        placeholder="/wp-json/wp/v2"
      />
    </div>

    <!-- Global Design System Tokens -->
    <div class="space-y-4">
      <h4
        class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500"
      >
        Design System
      </h4>
      <div class="grid grid-cols-2 gap-x-6 gap-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-semibold text-slate-400 uppercase"
              >Radius</label
            >
            <div class="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="32"
                :value="
                  store.projectConfig
                    ? (store.projectConfig.site as any).borderRadius ?? 16
                    : generation.borderRadius
                "
                @input="e => {
                  const val = Number((e.target as HTMLInputElement).value);
                  generation.borderRadius = val;
                  store.updateGlobalSiteConfig({ borderRadius: val });
                }"
                class="w-10 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] font-mono text-indigo-400 text-right focus:outline-none focus:border-indigo-500/50"
              />
              <span class="text-[9px] text-slate-500 font-medium uppercase"
                >px</span
              >
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            step="1"
            :value="
              store.projectConfig
                ? (store.projectConfig.site as any).borderRadius ?? 16
                : generation.borderRadius
            "
            @input="e => {
              const val = Number((e.target as HTMLInputElement).value);
              generation.borderRadius = val;
              store.updateGlobalSiteConfig({ borderRadius: val });
            }"
            class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-[10px] font-semibold text-slate-400 uppercase"
              >Spacing</label
            >
            <div class="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="10"
                :value="
                  store.projectConfig
                    ? (store.projectConfig.site as any).spacing ?? 5
                    : generation.spacing
                "
                @input="e => {
                  const val = Number((e.target as HTMLInputElement).value);
                  generation.spacing = val;
                  store.updateGlobalSiteConfig({ spacing: val });
                }"
                class="w-8 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-[10px] font-mono text-emerald-400 text-right focus:outline-none focus:border-emerald-500/50"
              />
              <span class="text-[9px] text-slate-500 font-medium ml-1">UI</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            :value="
              store.projectConfig
                ? (store.projectConfig.site as any).spacing ?? 5
                : generation.spacing
            "
            @input="e => {
              const val = Number((e.target as HTMLInputElement).value);
              generation.spacing = val;
              store.updateGlobalSiteConfig({ spacing: val });
            }"
            class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>

    <!-- Brief Input (Card Style Match: Explore Templates) -->
    <div
      class="group relative flex flex-col p-4 text-left rounded-3xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all"
    >
      <div class="flex items-center justify-between mb-3">
        <label
          class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors"
        >
          Project Brief
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="ex in PROMPT_EXAMPLES"
            :key="ex.id"
            type="button"
            @click="applyExample(ex)"
            class="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent hover:scale-105"
            :class="{
              'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/30':
                ex.template === 'landing',
              'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30':
                ex.template === 'company',
              'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30':
                ex.template === 'blog',
              'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border-cyan-500/30':
                ex.template === 'ecommerce',
              'bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30 border-fuchsia-500/30':
                ex.template === 'portfolio',
              'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border-violet-500/30':
                ex.template === 'saas',
            }"
          >
            {{ ex.title }}
          </button>
        </div>
      </div>

      <!-- Textarea styled like the 'Preview' box in Explore Templates -->
      <div
        class="relative rounded-lg bg-black/40 p-1 border border-white/5 group-focus-within:border-indigo-500/50 transition-colors"
      >
        <BaseTextarea
          v-model="generation.brief"
          :rows="5"
          placeholder="Describe your project idea in detail... (e.g. A portfolio for a photographer with a dark theme and gallery grid)"
          class="!bg-transparent !border-0 focus:!ring-0 !p-2 !text-slate-300 placeholder-slate-500 font-mono text-xs leading-relaxed"
        />
        <div
          class="absolute bottom-2 right-2 text-[10px] text-slate-600 font-mono pointer-events-none"
        >
          PROMPT
        </div>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="flex items-center justify-between pt-2">
      <div class="text-xs text-slate-400 font-mono">
        <span v-if="loading" class="animate-pulse">{{
          progressMessage || stage + "..."
        }}</span>
      </div>
      <BaseButton
        @click="$emit('generate')"
        :loading="loading"
        variant="primary"
        size="md"
        class="min-w-[140px]"
      >
        {{
          generation.mode === "blueprint"
            ? "Generate Blueprint"
            : "Generate Project"
        }}
      </BaseButton>
    </div>

    <p v-if="error" class="text-xs text-amber-300">{{ error }}</p>

    <div
      v-if="loading && streamingLog"
      class="mt-4 p-3 rounded-lg bg-black/50 border border-indigo-500/30 font-mono text-[10px] text-indigo-300 max-h-48 overflow-y-auto whitespace-pre-wrap break-all shadow-inner"
    >
      {{ streamingLog.slice(-500) }}<span class="animate-pulse">_</span>
    </div>
  </div>
</template>
