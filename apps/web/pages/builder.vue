<script setup lang="ts">
import type { PageConfig, ProjectConfig } from "@minions/shared";
import PageRenderer from "~/components/sections/PageRenderer.vue";
import SiteHeader from "~/components/SiteHeader.vue";
import { pageConfig } from "~/data/landing-data";
import StyleControlPanel from "~/components/builder/StyleControlPanel.vue";
import SectionEditor from "~/components/builder/SectionEditor.vue";
import type { Section } from "@minions/shared";
import ToastContainer from "~/components/ui/ToastContainer.vue";
import {
  LinkIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
} from "@heroicons/vue/24/outline";

// Refactored Components
import ConfigSidebar from "~/components/builder/ConfigSidebar.vue";
import PreviewToolbar from "~/components/builder/PreviewToolbar.vue";
import PreviewFrame from "~/components/builder/PreviewFrame.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import ConfirmModal from "~/components/ui/ConfirmModal.vue";
import draggableComponent from "vuedraggable";
import { parseAIResponse } from "~/utils/ai-parser";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

const draggable = draggableComponent as any;

// Store
const store = useBuilderStore();
const {
  projectConfig: generatedConfig, // Alias for backward compatibility
  currentPageConfig,
  selectedSectionId,
  selectedSection,
  historyIndex,
  history,
  hasResult,
  viewport,
  currentPageId,
  isEditMode,
  generation, // [NEW] Generation Config
} = storeToRefs(store);

// Computed for Drag & Drop
const currentSections = computed({
  get: () => store.currentSections,
  set: (newSections: Section[]) => {
    store.setSections(newSections);
    // Trigger sync handled by watcher on projectConfig
  },
});

const { success: toastSuccess, error: toastError } = useToast();

definePageMeta({
  layout: "builder",
});

const templates = [
  "landing",
  "company",
  "blog",
  "ecommerce",
  "portfolio",
  "saas",
] as const;
type template = (typeof templates)[number];

const stacks = ["nuxt", "vue-vite", "wordpress-theme", "nextjs"] as const;
type Stack = (typeof stacks)[number];

const modeOptions = ["auto", "mock", "live"] as const;
type Mode = (typeof modeOptions)[number];

// DEPRECATED local state: templateType, stack, mode, etc. replaced by store.generation

const route = useRoute();
const router = useRouter(); // Define router
const loading = ref(!!route.query.id); // Immediate loading if editing
const stage = ref<"idle" | "analyzing" | "generating" | "rendering">("idle");
const progressMessage = ref("");
const error = ref<string | null>(null);
const brief = ref("");

const isJsonExpanded = ref(false);

// Utils
const sectionEditorRef = ref<any>(null);
const { previewIframe, isPreviewReady, syncPreview, forceSyncPreview } =
  usePreviewSync();

// Listen for messages from Iframe
function onMessage(event: MessageEvent) {
  const data = event.data;
  if (!data) return;

  if (data.type === "ready") {
    isPreviewReady.value = true;
    syncPreview();
  } else if (data.type === "selectSection") {
    isPreviewReady.value = true;
    syncPreview(); // Initial sync can be debounced or immediate, debounced is fine.
  } else if (data.type === "selectSection") {
    store.selectSection(data.id);
  } else if (data.type === "reorderSection") {
    onReorderSection(data);
  } else if (data.type === "selectField") {
    // Visual Editing: Select section and focus field
    store.selectSection(data.sectionId);
    store.isEditMode = true;

    // Defer focus to allow UI connection
    nextTick(() => {
      if (sectionEditorRef.value) {
        sectionEditorRef.value.focusField(data.field);
      }
    });
  } else if (data.type === "updateField") {
    // Inline Edit
    store.updateSectionField(data.sectionId, data.field, data.value);
  }
}

watch(
  [currentPageConfig, isEditMode, selectedSectionId],
  () => {
    syncPreview();
  },
  { deep: true }
);

onMounted(() => {
  window.addEventListener("message", onMessage);
});

onUnmounted(() => {
  window.removeEventListener("message", onMessage);
});

// Helper to get available pages list
const pagesList = computed(() => {
  const config = generatedConfig.value;
  if (!config || !config.pages) return [];
  return Object.keys(config.pages).map((id) => ({
    id,
    route: config.pages[id]?.meta?.note,
  }));
});

const user = useSupabaseUser();
const supabase = useSupabaseClient();

// Force Mock Mode for Guests
watch(
  user,
  (u) => {
    if (!u) {
      store.generation.mode = "mock";
    } else {
      store.generation.mode = "auto";
    }
  },
  { immediate: true }
);

import confetti from "canvas-confetti";

const isSaving = ref(false);

function copyToClipboard(text: string) {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    toastSuccess("Copied!", "Link copied to clipboard.");
  } else {
    // Fallback
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    toastSuccess("Copied!", "Link copied to clipboard.");
  }
}

async function saveProject() {
  if (!generatedConfig.value) return;

  // Check if user is logged in
  const user = useSupabaseUser();
  if (!user.value) {
    authAction.value = "save";
    showAuthModal.value = true;
    return;
  }

  isSaving.value = true;
  try {
    const session = user.value ? await supabase.auth.getSession() : null;
    const token = session?.data.session?.access_token;

    if (!token) {
      toastError("Auth Error", "Could not retrieve access token.");
      return;
    }

    const { success, project } = await $fetch<{
      success: boolean;
      project: any;
    }>("/api/projects/save", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: generatedConfig.value.site?.siteName || "Untitled Project",
        config: generatedConfig.value,
      },
    });

    if (success) {
      toastSuccess("Saved!", "Project saved to your dashboard.");
      // Update config meta with ID?
      router.push({ query: { id: project.id } });
    }
  } catch (e) {
    console.error(e);
    toastError("Error", "Failed to save project.");
  } finally {
    isSaving.value = false;
  }
}

function copyPublicLink() {
  if (!route.query.id) return;
  const url = `${window.location.origin}/p/${route.query.id}`;
  copyToClipboard(url);
}

const showPublishModal = ref(false);
const showAuthModal = ref(false);
const authAction = ref<"save" | "publish">("save");
const showPublishConfirm = ref(false);

function handleAuthConfirm() {
  showAuthModal.value = false;
  navigateTo("/login");
}

const streamingContent = ref("");

async function createProject() {
  console.log("createProject called");
  store.setProjectConfig(null as any);
  stage.value = "analyzing";
  progressMessage.value = "Connecting to Gemini...";
  error.value = null;
  loading.value = true;
  store.currentPageId = "home";
  streamingContent.value = "";

  try {
    const isStream = false; // Disable stream to ensure multi-page generation & normalization works

    // Use native fetch to support streaming
    const response = await fetch("/api/generate-page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: store.generation.template,
        stack: store.generation.stack,
        mode: store.generation.mode,
        brief: store.generation.brief,
        wordpressBaseUrl: store.generation.wordpressBaseUrl,
        wordpressRestBase: store.generation.wordpressRestBase,
        stream: isStream,
      }),
    });

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let resultText = "";

    stage.value = "generating"; // Update stage
    progressMessage.value = "Streaming content...";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      resultText += chunk;
      streamingContent.value = resultText;
    }

    // Final Parse
    // Parse using our robust utility which now returns a proper ProjectConfig
    const config = parseAIResponse(resultText);

    store.setProjectConfig(config);

    // Ensure we select a valid page ID
    if (config.pages && Object.keys(config.pages).length > 0) {
      if (!config.pages["home"]) {
        const firstPageId = Object.keys(config.pages)[0];
        if (firstPageId) {
          store.currentPageId = firstPageId;
        }
      } else {
        store.currentPageId = "home";
      }
    }

    console.log("[Builder] Config set. State:", {
      pageId: store.currentPageId,
      configKeys: config.pages ? Object.keys(config.pages) : "no-pages",
      storeHasConfig: !!store.projectConfig,
    });

    // Force immediate sync to update iframe without delay
    forceSyncPreview();

    stage.value = "rendering";

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch (err: any) {
    console.error("JSON Parse Error:", err);
    // Handle JSON parsing errors specifically if wrapped in known structure or simple message
    if (
      err.message &&
      (err.message.includes("JSON") || err.message.includes("parse"))
    ) {
      error.value = "Failed to parse AI response. Retrying might help.";
    } else {
      error.value = err.message || "Failed to generate project.";
    }
  } finally {
    loading.value = false;
    stage.value = "idle";
    streamingContent.value = ""; // Clear buffer
  }
}

// Logic to load project on mount if ID exists
async function loadProject(id: string) {
  loading.value = true;
  stage.value = "analyzing";
  progressMessage.value = "Loading project...";
  try {
    const { project } = await $fetch<{ project: any }>(`/api/projects/${id}`);
    if (project && project.config) {
      store.setProjectConfig(project.config);
      // Restore generation state
      store.generation.brief =
        project.config?.meta?.brief || project.config?.meta?.note || "";
      store.generation.template = project.config?.template || "landing";
      // Restore other props if saved
    }
  } catch (e) {
    console.error("Load failed", e);
    error.value = "Failed to load project.";
  } finally {
    loading.value = false;
    stage.value = "idle";
  }
}

onMounted(() => {
  if (route.query.id) {
    loadProject(route.query.id as string);
  } else {
    // Handle params from Examples/Explore page
    if (route.query.template) {
      const t = route.query.template as string;
      if (templates.includes(t as any)) {
        store.generation.template = t as template;
      }
    }
    if (route.query.brief) {
      store.generation.brief = route.query.brief as string;
    }
  }
});

// JSON Export
const exportJson = computed(() =>
  JSON.stringify(generatedConfig.value, null, 2)
);

function copyJson() {
  copyToClipboard(exportJson.value);
}

async function downloadKit() {
  if (!generatedConfig.value) return;
  try {
    const blob = await $fetch("/api/download-kit", {
      method: "POST",
      body: {
        config: generatedConfig.value,
        stack: store.generation.stack,
      },
      responseType: "blob",
    });

    const url = URL.createObjectURL(blob as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${
      generatedConfig.value.site?.siteName || "minions-project"
    }.zip`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Download failed", e);
    error.value = "Failed to create Starter Kit zip.";
  }
}

/* History logic handled by useBuilderStore */

function undo() {
  store.undo();
}

function redo() {
  store.redo();
}

function onReorderSection({
  id,
  direction,
}: {
  id: string;
  direction: "up" | "down";
}) {
  const sections = [...store.currentSections];
  const index = sections.findIndex((s) => s.id === id);
  if (index === -1) return;

  if (direction === "up" && index > 0) {
    const prev = sections[index - 1];
    const curr = sections[index];
    if (prev && curr) {
      sections[index] = prev;
      sections[index - 1] = curr;
    }
  } else if (direction === "down" && index < sections.length - 1) {
    const next = sections[index + 1];
    const curr = sections[index];
    if (next && curr) {
      sections[index] = next;
      sections[index + 1] = curr;
    }
  }

  store.setSections(sections);
}

function downloadJson() {
  if (!generatedConfig.value) return;
  const blob = new Blob([exportJson.value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${generatedConfig.value.template || "project"}-${
    generatedConfig.value?.meta?.mode || "mode"
  }-${generatedConfig.value?.meta?.seed || "seed"}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
const isPublished = ref(false);
const publishLoading = ref(false);
const exportTab = ref<"quick-setup" | "json">("quick-setup");
const liveUrl = computed(() => {
  if (import.meta.client) {
    return `${window.location.origin}/p/${route.query.id}`;
  }
  return "";
});

function publishProject() {
  showPublishConfirm.value = true;
}

async function handleConfirmPublish() {
  showPublishConfirm.value = false;

  const user = useSupabaseUser();
  if (!user.value) {
    authAction.value = "publish";
    showAuthModal.value = true;
    return;
  }

  if (!route.query.id) {
    alert("Please save the project first.");
    return;
  }

  publishLoading.value = true;
  try {
    const targetStatus = !isPublished.value; // Toggle
    await $fetch("/api/projects/publish", {
      method: "POST",
      body: {
        id: route.query.id,
        published: targetStatus,
      },
    });

    isPublished.value = targetStatus;
    if (targetStatus) {
      showPublishModal.value = true;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      toastSuccess("Unpublished", "Project is no longer public.");
    }
  } catch (e: any) {
    console.error(e);
    toastError("Error", "Failed to update publish status.");
  } finally {
    publishLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
    <!-- Gimmick: Painter Minion -->
    <div
      class="fixed bottom-0 right-0 z-50 pointer-events-none transform translate-y-4 hover:translate-y-0 transition-transform duration-500 hidden md:block"
    >
      <img
        src="/images/minion-painter.png"
        alt="Minion Painter"
        class="w-64 drop-shadow-2xl animate-wiggle"
        style="animation-duration: 4s"
      />
    </div>

    <ToastContainer />

    <!-- Modals -->
    <ConfirmModal
      :isOpen="showAuthModal"
      title="Login Required"
      :message="`You need to be logged in to ${authAction} your project. Would you like to log in now?`"
      confirmText="Login"
      @close="showAuthModal = false"
      @confirm="handleAuthConfirm"
    />

    <ConfirmModal
      :isOpen="showPublishConfirm"
      :title="isPublished ? 'Unpublish Project' : 'Publish Project'"
      :message="
        isPublished
          ? 'Are you sure you want to unpublish this project? It will no longer be publicly accessible.'
          : 'Are you sure you want to publish this project? It will be publicly accessible at a unique URL.'
      "
      :confirmText="isPublished ? 'Unpublish' : 'Publish'"
      @close="showPublishConfirm = false"
      @confirm="handleConfirmPublish"
    />
    <SiteHeader :config="pageConfig" />
    <div class="mx-auto max-w-[1600px] px-6 py-10 pt-24 space-y-8">
      <!-- 1. Configuration Form -->
      <ConfigSidebar
        :loading="loading"
        :stage="stage"
        :progressMessage="progressMessage"
        :error="error"
        :user="user"
        :streaming-log="streamingContent"
        :has-result="hasResult"
        @generate="createProject"
      />

      <!-- 2. Result Area (2-Column Layout) -->
      <div v-if="hasResult" class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Sidebar: Style & Controls -->
        <div class="space-y-6">
          <!-- Edit Mode Toggle -->
          <div
            class="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <span
              class="text-xs font-semibold uppercase tracking-[0.16em] text-white"
              >Edit Mode</span
            >
            <button
              @click="isEditMode = !isEditMode"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              :class="isEditMode ? 'bg-indigo-600' : 'bg-slate-700'"
            >
              <span
                class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                :class="isEditMode ? 'translate-x-6' : 'translate-x-1'"
              />
            </button>
          </div>
          <div class="rounded-xl border border-white/10 bg-white/5 p-4">
            <div v-if="selectedSection">
              <SectionEditor
                ref="sectionEditorRef"
                @close="selectedSectionId = undefined"
              />
            </div>
            <div v-else>
              <div class="mb-6">
                <!-- Structure / Reordering -->
                <h3
                  class="text-xs font-semibold uppercase tracking-[0.16em] text-white mb-3"
                >
                  Structure
                </h3>
                <draggable
                  v-model="currentSections"
                  item-key="id"
                  handle=".drag-handle"
                  ghost-class="opacity-20"
                  class="space-y-2"
                >
                  <template #item="{ element: section }">
                    <div
                      class="group flex items-center justify-between rounded-lg border border-white/5 bg-slate-900/50 p-2 hover:border-indigo-500/50 hover:bg-slate-800 transition-colors cursor-default"
                    >
                      <div
                        class="flex items-center gap-3 overflow-hidden"
                        @click="selectedSectionId = section.id"
                      >
                        <!-- Drag Handle -->
                        <div
                          class="drag-handle cursor-grab text-slate-500 hover:text-white p-1"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M4 6h16M4 12h16M4 18h16"
                            />
                          </svg>
                        </div>
                        <span
                          class="text-sm font-medium text-slate-200 truncate capitalize"
                        >
                          {{ section.type }}
                        </span>
                      </div>
                      <button
                        @click.stop="selectedSectionId = section.id"
                        class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-400 transition-opacity"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                          />
                        </svg>
                      </button>
                    </div>
                  </template>
                </draggable>
              </div>

              <h3
                class="text-xs font-semibold uppercase tracking-[0.16em] text-white mb-4"
              >
                Design
              </h3>
              <StyleControlPanel v-if="generatedConfig" />
            </div>
          </div>

          <div
            class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-[0.16em] text-white"
            >
              Pages
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="pg in pagesList"
                :key="pg.id"
                @click="currentPageId = pg.id"
                class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/5"
                :class="
                  currentPageId === pg.id
                    ? 'bg-indigo-500 text-white border-indigo-400'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                "
              >
                {{ pg.id }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right Main: Preview -->
        <div class="md:col-span-3 space-y-4">
          <!-- Action Toolbar -->
          <div
            class="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-2 mb-4"
          >
            <div
              class="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2"
            >
              Project Actions
            </div>
            <div class="flex gap-2">
              <BaseButton
                @click="saveProject"
                :loading="isSaving"
                variant="secondary"
                size="xs"
              >
                Save
              </BaseButton>

              <BaseButton
                @click="publishProject"
                :loading="publishLoading"
                :variant="isPublished ? 'success' : 'primary'"
                size="xs"
                :class="
                  isPublished ? 'bg-emerald-600 hover:bg-emerald-500' : ''
                "
              >
                {{ isPublished ? "Published (Update)" : "Publish / Share" }}
              </BaseButton>

              <BaseButton
                v-if="isPublished"
                @click="copyPublicLink"
                variant="secondary"
                size="xs"
                title="Copy Public Link"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 000 5.656.75.75 0 001.06-1.06 2.5 2.5 0 010-3.536l3-3z"
                  />
                  <path
                    d="M3.332 11.854a4 4 0 005.657 5.657l3-3a4 4 0 000-5.657.75.75 0 10-1.061 1.061 2.5 2.5 0 010 3.535l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224z"
                  />
                </svg>
              </BaseButton>

              <BaseButton
                @click="downloadKit"
                variant="secondary"
                size="xs"
                title="Download Source Code"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"
                  />
                  <path
                    d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"
                  />
                </svg>
              </BaseButton>
            </div>
          </div>

          <!-- Preview Toolbar -->
          <PreviewToolbar
            v-if="store.currentSections"
            v-model:viewport="viewport"
            :can-undo="historyIndex > 0"
            :can-redo="historyIndex < history.length - 1"
            @undo="undo"
            @redo="redo"
            @export-json="downloadJson"
            @copy-json="copyJson"
          />

          <!-- Iframe Container -->
          <div
            class="min-h-[600px] h-[calc(100vh-12rem)] flex justify-center perspective-1000"
          >
            <PreviewFrame
              ref="previewIframe"
              :src="liveUrl"
              :viewport="viewport"
              class="shadow-2xl transition-all duration-300 transform origin-top"
              :class="{
                'w-full h-full': viewport === 'desktop',
                'w-[768px] h-full rounded-b-xl border-x border-b border-white/10':
                  viewport === 'tablet',
                'w-[375px] h-full rounded-2xl border border-white/10 my-4':
                  viewport === 'mobile',
              }"
            />
          </div>

          <!-- Export Interface (Tabs) -->
          <div v-if="hasResult" class="mt-8 animate-fade-in-up">
            <!-- Tabs Navigation -->
            <div class="flex items-center gap-6 border-b border-white/10 mb-6">
              <button
                @click="exportTab = 'quick-setup'"
                class="pb-2 text-sm font-medium transition-colors border-b-2"
                :class="
                  exportTab === 'quick-setup'
                    ? 'text-indigo-400 border-indigo-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                "
              >
                🚀 Quick Setup
              </button>
              <button
                @click="exportTab = 'json'"
                class="pb-2 text-sm font-medium transition-colors border-b-2"
                :class="
                  exportTab === 'json'
                    ? 'text-indigo-400 border-indigo-400'
                    : 'text-slate-400 border-transparent hover:text-white'
                "
              >
                📄 JSON Config
              </button>
            </div>

            <!-- Tab 1: Quick Setup -->
            <div
              v-if="exportTab === 'quick-setup'"
              class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
              <div class="col-span-full mb-2">
                <h3
                  class="text-xl font-bold text-white flex items-center gap-2"
                >
                  Use with
                  <span class="capitalize">{{ generation.stack }}</span>
                </h3>
                <p class="text-sm text-slate-400">
                  Follow these steps to get running in minutes.
                </p>
              </div>

              <!-- Step 1: Download -->
              <div
                class="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between"
              >
                <div>
                  <div
                    class="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide"
                  >
                    Step 1
                  </div>
                  <div class="text-lg font-bold text-white mb-1">Download</div>
                  <p class="text-xs text-slate-400 mb-4">
                    Get the full source code configured for
                    {{ generation.stack }}.
                  </p>
                </div>
                <div class="space-y-2">
                  <BaseButton
                    @click="downloadKit"
                    variant="primary"
                    size="sm"
                    class="w-full"
                  >
                    Download Kit
                  </BaseButton>
                </div>
              </div>

              <!-- Step 2: Unzip -->
              <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                <div
                  class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                >
                  Step 2
                </div>
                <div class="text-lg font-bold text-white mb-1">Unzip</div>
                <p class="text-xs text-slate-400">
                  Extract to your project folder.
                </p>
                <div
                  class="mt-4 rounded bg-black/40 p-2 font-mono text-[10px] text-slate-300"
                >
                  unzip {{ generatedConfig?.site?.siteName || "project" }}.zip
                </div>
              </div>

              <!-- Step 3: Install -->
              <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                <div
                  class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                >
                  Step 3
                </div>
                <div class="text-lg font-bold text-white mb-1">Install</div>
                <p class="text-xs text-slate-400">Install dependencies.</p>
                <div
                  class="mt-4 rounded bg-black/40 p-2 font-mono text-[10px] text-emerald-400"
                >
                  npm install
                </div>
              </div>

              <!-- Step 4: Run -->
              <div class="rounded-xl border border-white/10 bg-white/5 p-4">
                <div
                  class="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide"
                >
                  Step 4
                </div>
                <div class="text-lg font-bold text-white mb-1">Run</div>
                <p class="text-xs text-slate-400">Start the dev server.</p>
                <div
                  class="mt-4 rounded bg-black/40 p-2 font-mono text-[10px] text-emerald-400"
                >
                  npm run dev
                </div>
              </div>
            </div>

            <!-- Tab 2: JSON -->
            <div v-else-if="exportTab === 'json'">
              <div class="grid md:grid-cols-[1fr_300px] gap-6">
                <div
                  class="rounded-xl bg-black/40 border border-white/10 p-4 max-h-[400px] overflow-auto"
                >
                  <pre
                    class="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all"
                    >{{ exportJson }}</pre
                  >
                </div>
                <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-bold text-white mb-2">
                      Raw Configuration
                    </h3>
                    <p class="text-sm text-slate-400">
                      This JSON contains your entire site definition including
                      themes, pages, and sections.
                    </p>
                  </div>
                  <div class="space-y-2">
                    <BaseButton
                      @click="copyJson"
                      variant="secondary"
                      size="sm"
                      class="w-full"
                    >
                      Copy to Clipboard
                    </BaseButton>
                    <BaseButton
                      @click="downloadJson"
                      variant="secondary"
                      size="sm"
                      class="w-full"
                    >
                      Download JSON
                    </BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20 text-slate-500">
        <p class="mb-4">Select a template and start generating your site!</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.animate-wiggle {
  animation: wiggle 3s ease-in-out infinite;
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}
</style>
