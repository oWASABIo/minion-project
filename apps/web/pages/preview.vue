<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import type { PageConfig } from "@minions/shared";
import PageRenderer from "~/components/sections/PageRenderer.vue";

definePageMeta({
  layout: false,
});

const config = ref<PageConfig | undefined>(undefined);
const selectedSectionId = ref<string | undefined>(undefined);
const isEditMode = ref(false);

function onMessage(event: MessageEvent) {
  const data = event.data;
  if (!data) return;

  if (data.type === "updateConfig") {
    console.log("[Preview] Received Config:", data.config);
    config.value = data.config;
    if (data.isEditMode !== undefined) isEditMode.value = data.isEditMode;
    if (data.selectedSectionId !== undefined)
      selectedSectionId.value = data.selectedSectionId;
  } else if (data.type === "updateSelection") {
    selectedSectionId.value = data.id;
  } else if (data.type === "updateEditMode") {
    isEditMode.value = data.value;
  }
}

function onSelectSection(id: string) {
  selectedSectionId.value = id;
  window.parent.postMessage({ type: "selectSection", id }, "*");
}

function onReorderSection(payload: { id: string; direction: "up" | "down" }) {
  window.parent.postMessage({ type: "reorderSection", ...payload }, "*");
}

onMounted(() => {
  window.addEventListener("message", onMessage);

  // Notify parent that we are ready
  window.parent.postMessage({ type: "ready" }, "*");

  // Visual Editing Click Handler
  window.addEventListener(
    "click",
    (e) => {
      // Only intercept if in edit mode
      if (!isEditMode.value) return;

      const target = e.target as HTMLElement;

      // Find closest field (up to 3 levels)
      const fieldEl = target.closest("[data-sb-field]") as HTMLElement;
      if (!fieldEl) return;

      // Find closest section ID
      const sectionEl = target.closest("[data-sb-section-id]") as HTMLElement;
      const sectionId = sectionEl?.getAttribute("data-sb-section-id");

      if (fieldEl && sectionId) {
        // Prevent default navigation for links, but allow editing
        if (target.tagName === "A") {
          e.preventDefault();
        }
        e.stopPropagation();

        const fieldKey = fieldEl.getAttribute("data-sb-field");
        if (!fieldKey) return;

        console.log("[Preview] Field Selected:", sectionId, fieldKey);

        // Notify parent to open sidebar
        window.parent.postMessage(
          {
            type: "selectField",
            sectionId,
            field: fieldKey,
          },
          "*"
        );

        // --- INLINE EDITING LOGIC ---
        // Enable contenteditable
        fieldEl.contentEditable = "true";
        fieldEl.focus();

        // Optional: Select all text for easier replacement
        // document.execCommand('selectAll', false, undefined);

        // Handle BLUR (Save)
        const onBlur = () => {
          fieldEl.contentEditable = "false";
          const newVal = fieldEl.innerText; // or innerHTML if we support rich text

          window.parent.postMessage(
            {
              type: "updateField",
              sectionId,
              field: fieldKey,
              value: newVal,
            },
            "*"
          );

          fieldEl.removeEventListener("blur", onBlur);
          fieldEl.removeEventListener("keydown", onKeydown);
        };

        // Handle Keydown (Enter to save for single line)
        const onKeydown = (ev: KeyboardEvent) => {
          if (ev.key === "Enter") {
            // If modifier (Shift+Enter), allow newline. Else save.
            if (!ev.shiftKey) {
              ev.preventDefault();
              fieldEl.blur(); // Triggers onBlur
            }
          }
        };

        fieldEl.addEventListener("blur", onBlur);
        fieldEl.addEventListener("keydown", onKeydown);
      }
    },
    true
  ); // Capture phase

  // Notify parent that we are ready
  window.parent.postMessage({ type: "ready" }, "*");
});

onUnmounted(() => {
  window.removeEventListener("message", onMessage);
});
</script>

<template>
  <div class="min-h-screen">
    <!-- Note: PageRenderer might have its own background logic but default to dark fallback -->
    <NuxtErrorBoundary>
      <PageRenderer
        v-if="config"
        :config="config"
        :selectedSectionId="selectedSectionId"
        :isEditMode="isEditMode"
        :enableContainer="false"
        @select-section="onSelectSection"
        @reorder-section="onReorderSection"
      />

      <template #error="{ error }">
        <div
          class="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-slate-950 text-red-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-12 h-12 mb-4 opacity-80"
          >
            <path
              fill-rule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clip-rule="evenodd"
            />
          </svg>
          <h3 class="text-lg font-bold mb-2">Preview Rendering Error</h3>
          <div
            class="w-full max-w-lg bg-black/50 p-4 rounded-lg border border-red-500/20 text-left overflow-auto"
          >
            <pre class="text-xs font-mono whitespace-pre-wrap break-words">{{
              error
            }}</pre>
          </div>
        </div>
      </template>
    </NuxtErrorBoundary>

    <div
      v-if="!config"
      class="flex items-center justify-center h-screen bg-slate-950 text-slate-400"
    >
      <div class="flex items-center gap-2">
        <span
          class="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"
        ></span>
        <span>Loading Preview...</span>
      </div>
    </div>
  </div>
</template>
