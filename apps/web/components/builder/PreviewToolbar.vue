<script setup lang="ts">
const viewport = defineModel<"desktop" | "tablet" | "mobile">("viewport", {
  required: true,
});

const props = defineProps<{
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  (e: "undo"): void;
  (e: "redo"): void;
}>();
</script>

<template>
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <!-- Viewport Toggles -->
      <div
        class="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-white/10"
      >
        <button
          v-for="mode in ['desktop', 'tablet', 'mobile']"
          :key="mode"
          @click="viewport = mode as any"
          class="p-1.5 rounded-md transition-all"
          :class="
            viewport === mode
              ? 'bg-indigo-600 text-white shadow ring-1 ring-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          "
          :title="mode.charAt(0).toUpperCase() + mode.slice(1)"
        >
          <svg
            v-if="mode === 'desktop'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <svg
            v-else-if="mode === 'tablet'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Undo/Redo -->
      <div
        class="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-white/10"
      >
        <button
          @click="emit('undo')"
          :disabled="!canUndo"
          class="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4"
          >
            <path
              fill-rule="evenodd"
              d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
        <button
          @click="emit('redo')"
          :disabled="!canRedo"
          class="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4"
          >
            <path
              fill-rule="evenodd"
              d="M12.207 2.232a.75.75 0 00.025 1.06l4.146 3.958H6.375a5.375 5.375 0 000 10.75h5.625a.75.75 0 000-1.5H6.375a3.875 3.875 0 010-7.75h10.003l-4.146 3.957a.75.75 0 001.036 1.085l5.5-5.25a.75.75 0 000-1.085l-5.5-5.25a.75.75 0 00-1.06.025z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
