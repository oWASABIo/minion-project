<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  text: string;
  context?: string;
}>();

const emit = defineEmits<{
  (e: "update", val: string): void;
}>();

const loading = ref(false);

async function rewrite() {
  if (!props.text || loading.value) return;

  loading.value = true;
  try {
    const res = await $fetch<{ result: string }>("/api/rewrite", {
      method: "POST",
      body: {
        text: props.text,
        context: props.context || "Website Section",
      },
    });

    if (res && res.result) {
      emit("update", res.result);
    }
  } catch (e) {
    console.error("Rewrite error", e);
    // Optional: show toast
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <button
    @click="rewrite"
    :disabled="loading || !text"
    class="group relative inline-flex items-center justify-center p-1.5 rounded-lg transition-all"
    :class="
      loading
        ? 'bg-indigo-500/20 cursor-wait'
        : 'hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300'
    "
    title="Rewrite with AI"
  >
    <span
      v-if="loading"
      class="animate-spin h-3.5 w-3.5 rounded-full border-2 border-indigo-500 border-t-transparent"
    ></span>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="w-3.5 h-3.5"
    >
      <path
        fill-rule="evenodd"
        d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.148 5.039c.966.688.75 2.193-.414 2.508-2.61.706-5.839 2.18-8.066 3.473a.75.75 0 01-.75 0c-2.227-1.293-5.457-2.767-8.066-3.473-1.164-.315-1.38-1.82-.414-2.508a41.059 41.059 0 018.148-5.04z"
        clip-rule="evenodd"
      />
      <path
        d="M6.53 11a.75.75 0 00-1.06 0l-1.97 1.97 1.97 1.97a.75.75 0 101.06-1.06L5.31 12.75l1.22-1.22a.75.75 0 000-1.06zM14.53 11a.75.75 0 00-1.06 0l-1.22 1.22-1.22-1.22a.75.75 0 00-1.06 1.06l1.97 1.97-1.97 1.97a.75.75 0 101.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 001.06-1.06l-1.97-1.97 1.97-1.97a.75.75 0 000-1.06z"
      />
    </svg>

    <!-- Tooltip -->
    <span
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10"
    >
      Magic Rewrite
    </span>
  </button>
</template>
