<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  id?: string;
  disabled?: boolean;
  rows?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  rows: 4,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputId = computed(
  () => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`
);

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-xs font-semibold text-slate-700 dark:text-white mb-1.5 uppercase tracking-wider"
    >
      {{ label }}
    </label>
    <div class="relative">
      <textarea
        v-bind="$attrs"
        :id="inputId"
        :value="modelValue"
        @input="onInput"
        :rows="rows"
        :placeholder="placeholder"
        :disabled="disabled"
        class="block w-full rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :class="[
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
        ]"
      ></textarea>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-500 font-medium">
      {{ error }}
    </p>
    <p v-if="hint && !error" class="mt-1 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>
