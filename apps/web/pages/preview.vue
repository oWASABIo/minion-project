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

function onDuplicateSection(id: string) {
  window.parent.postMessage({ type: "duplicateSection", id }, "*");
}

function onDeleteSection(id: string) {
  window.parent.postMessage({ type: "deleteSection", id }, "*");
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
        // Special case: Images (only select, don't edit text)
        if (target.tagName === "IMG") {
          return;
        }

        // Enable contenteditable
        fieldEl.contentEditable = "true";
        fieldEl.focus();

        // Handle Paste (Strip HTML)
        const onPaste = (ev: ClipboardEvent) => {
          ev.preventDefault();
          const text = ev.clipboardData?.getData("text/plain") || "";
          document.execCommand("insertText", false, text);
        };

        // Handle Keydown (Standardize Enter)
        const onKeydown = (ev: KeyboardEvent) => {
          if (ev.key === "Enter") {
            // For multiline-likely elements, Shift+Enter or just Enter is fine.
            // But for titles/eyebrows, we might want to save on Enter.
            const isMultiline =
              fieldEl.tagName === "P" ||
              fieldEl.classList.contains("leading-relaxed");

            if (!isMultiline || (isMultiline && ev.ctrlKey)) {
              if (!ev.shiftKey) {
                ev.preventDefault();
                fieldEl.blur(); // Triggers onBlur
              }
            }
          }
        };

        // Handle BLUR (Save)
        const onBlur = () => {
          fieldEl.contentEditable = "false";
          const newVal = fieldEl.innerText;

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
          fieldEl.removeEventListener("paste", onPaste);
        };

        fieldEl.addEventListener("blur", onBlur);
        fieldEl.addEventListener("keydown", onKeydown);
        fieldEl.addEventListener("paste", onPaste);
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
    <NuxtErrorBoundary>
      <PageRenderer
        v-if="config"
        :config="config"
        :selectedSectionId="selectedSectionId"
        :isEditMode="isEditMode"
        :enableContainer="false"
        @select-section="onSelectSection"
        @reorder-section="onReorderSection"
        @duplicateSection="onDuplicateSection"
        @deleteSection="onDeleteSection"
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

<style>
/* Visual Editing Styles */
[data-sb-field] {
  position: relative;
  transition: all 0.2s ease;
  outline: none !important;
}

[data-sb-field]:hover {
  cursor: text;
  outline: 2px dotted #6366f1 !important; /* Indigo-500 */
  outline-offset: 4px;
  background-color: rgba(99, 102, 241, 0.05);
  border-radius: 4px;
}

[data-sb-field]:focus {
  outline: 2px solid #6366f1 !important;
  outline-offset: 4px;
  background-color: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

/* Special Handling for Images */
img[data-sb-field] {
  cursor: pointer !important;
}
img[data-sb-field]:hover {
  outline-style: solid !important;
}

/* Tooltip indicator */
[data-sb-field]:hover::after {
  content: "Click to edit";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #6366f1;
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: bold;
  white-space: nowrap;
  pointer-events: none;
  z-index: 50;
  margin-bottom: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

[data-sb-field]:focus::after {
  display: none;
}
</style>
