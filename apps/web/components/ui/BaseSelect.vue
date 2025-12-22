<script setup lang="ts">
import { computed } from "vue";

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue?: string | number;
  label?: string;
  options: (string | Option)[];
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  options: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
}>();

const inputId = computed(
  () => props.id || `select-${Math.random().toString(36).substr(2, 9)}`
);

const normalizedOptions = computed(() => {
  return props.options.map((opt) => {
    if (typeof opt === "string" || typeof opt === "number") {
      return { label: String(opt), value: opt };
    }
    return opt;
  });
});

function onChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
}
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
      <select
        :id="inputId"
        :value="modelValue"
        @change="onChange"
        :disabled="disabled"
        class="block w-full appearance-none rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        :class="[
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
        ]"
      >
        <option v-if="placeholder" value="" disabled selected>
          {{ placeholder }}
        </option>
        <option
          v-for="opt in normalizedOptions"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Chevron Icon -->
      <div
        class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500"
      >
        <svg
          class="h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-xs text-red-500 font-medium">
      {{ error }}
    </p>
    <p v-if="hint && !error" class="mt-1 text-xs text-slate-500">
      {{ hint }}
    </p>
  </div>
</template>
