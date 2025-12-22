<script setup lang="ts">
import { PROMPT_EXAMPLES, type PromptExample } from "~/data/prompt-examples";
import BaseSelect from "~/components/ui/BaseSelect.vue";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";

const props = defineProps<{
  loading: boolean;
  stage: string;
  progressMessage: string;
  error: string | null;
  user: any; // Supabase user
}>();

const emit = defineEmits<{
  (e: "generate"): void;
}>();

// Bi-directional binding
const templateType = defineModel<string>("templateType", {
  default: "landing",
});
const stack = defineModel<string>("stack", { default: "nuxt" });
const mode = defineModel<string>("mode", { default: "auto" });
const wordpressBaseUrl = defineModel<string>("wordpressBaseUrl", {
  default: "",
});
const wordpressRestBase = defineModel<string>("wordpressRestBase", {
  default: "/wp-json/wp/v2",
});
const brief = defineModel<string>("brief", { default: "" });

const templates = [
  "landing",
  "saas",
  "company",
  "blog",
  "ecommerce",
  "portfolio",
];
const stacks = ["nuxt", "vue-vite", "wordpress-theme", "nextjs"];
const modeOptions = ["auto", "mock", "live"];

function applyExample(ex: PromptExample) {
  brief.value = ex.brief;
  if (ex.template) templateType.value = ex.template;
  // Stack is not part of PromptExample currently
  // if (ex.stack) stack.value = ex.stack;
}
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-6">
    <div class="grid gap-4 md:grid-cols-3">
      <BaseSelect
        v-model="templateType"
        label="Template"
        :options="templates"
      />
      <BaseSelect v-model="stack" label="Stack" :options="stacks" />
      <div>
        <label
          class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
          >Mode</label
        >
        <div class="flex gap-2">
          <BaseButton
            v-for="m in modeOptions"
            :key="m"
            @click="!user && m !== 'mock' ? null : (mode = m)"
            size="xs"
            :variant="mode === m ? 'primary' : 'secondary'"
            :disabled="!user && m !== 'mock'"
            :title="!user && m !== 'mock' ? 'Login required for AI Mode' : ''"
          >
            {{ m }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- WP Inputs -->
    <div class="grid gap-4 md:grid-cols-2">
      <BaseInput
        v-model="wordpressBaseUrl"
        label="WP Base URL"
        placeholder="e.g. https://wordpress.org/news"
      />
      <BaseInput
        v-model="wordpressRestBase"
        label="WP Rest Base"
        placeholder="/wp-json/wp/v2"
      />
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
          v-model="brief"
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
        Generate Project
      </BaseButton>
    </div>

    <p v-if="error" class="text-xs text-amber-300">{{ error }}</p>
  </div>
</template>
