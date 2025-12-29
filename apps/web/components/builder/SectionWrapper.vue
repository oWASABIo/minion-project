<script setup lang="ts">
import { computed } from "vue";
import type { Section } from "@minions/shared";

const props = defineProps<{
  section: Section;
  isEditMode: boolean;
  isSelected: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "move-up", id: string): void;
  (e: "move-down", id: string): void;
  (e: "duplicate", id: string): void;
  (e: "delete", id: string): void;
}>();

const classes = computed(() => {
  if (!props.isEditMode) return "";

  const base =
    "relative group cursor-pointer transition-all duration-200 border-2";

  if (props.isSelected) {
    return `${base} border-primary shadow-[0_0_0_4px_rgba(99,102,241,0.2)] z-10`;
  }

  // Hover state (only if not selected)
  return `${base} border-transparent hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg`;
});
</script>

<template>
  <div
    :id="`wrapper-${section.id}`"
    :data-sb-section-id="section.id"
    :class="classes"
    @click.stop="isEditMode && emit('select', section.id)"
  >
    <!-- Edit Label (Center Top) -->
    <div
      v-if="isEditMode"
      class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg pointer-events-none z-20 whitespace-nowrap"
      :class="{ '!opacity-100': isSelected }"
    >
      {{ isSelected ? "Editing: " : "Edit " }} {{ section.type }}
    </div>

    <!-- Reorder Controls (Top Right) -->
    <div
      v-if="isEditMode"
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-30"
      :class="{ '!opacity-100': isSelected }"
    >
      <button
        @click.stop="emit('move-up', section.id)"
        class="p-1.5 bg-white text-slate-600 rounded-full shadow hover:bg-primary hover:text-white transition-colors flex items-center justify-center transform hover:scale-110 active:scale-90"
        title="Move Up"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      <button
        @click.stop="emit('move-down', section.id)"
        class="p-1.5 bg-white text-slate-600 rounded-full shadow hover:bg-primary hover:text-white transition-colors flex items-center justify-center transform hover:scale-110 active:scale-90"
        title="Move Down"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <!-- Duplicate Section -->
      <button
        @click.stop="emit('duplicate', section.id)"
        class="p-1.5 bg-white text-slate-600 rounded-full shadow hover:bg-indigo-500 hover:text-white transition-colors flex items-center justify-center transform hover:scale-110 active:scale-90"
        title="Duplicate Section"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.121a1.5 1.5 0 01.439 1.061V16.5a1.5 1.5 0 01-1.5 1.5H8.5A1.5 1.5 0 017 16.5v-13z"
          />
          <path
            d="M4 6.5a1.5 1.5 0 011.5-1.5H6v11a3 3 0 003 3h5v.5a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 014 19.5v-13z"
          />
        </svg>
      </button>

      <!-- Delete Section -->
      <button
        @click.stop="emit('delete', section.id)"
        class="p-1.5 bg-white text-slate-600 rounded-full shadow hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center transform hover:scale-110 active:scale-90"
        title="Delete Section"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-4 h-4"
        >
          <path
            fill-rule="evenodd"
            d="M8.75 1A2.75 2.75 0 006 3.75V4H5a2 2 0 00-2 2v.033C3 6.635 3.345 7 3.75 7h12.5c.405 0 .75-.365.75-.967V6a2 2 0 00-2-2h-1v-.25A2.75 2.75 0 0011.25 1h-2.5zM5 8.5h10V17a2 2 0 01-2 2H7a2 2 0 01-2-2V8.5z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <slot />
  </div>
</template>
