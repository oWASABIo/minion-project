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

const templateType = ref<template>("landing");
const stack = ref<Stack>("nuxt");
const mode = ref<Mode>("auto");

const wordpressBaseUrl = ref<string>("");
const wordpressRestBase = ref<string>("/wp-json/wp/v2");

const brief = ref("");
const route = useRoute();
const router = useRouter(); // Define router
const loading = ref(!!route.query.id); // Immediate loading if editing
const stage = ref<"idle" | "analyzing" | "generating" | "rendering">("idle");
const progressMessage = ref("");
const error = ref<string | null>(null);
const exportTab = ref<"quick" | "manual">("quick");

const generatedConfig = ref<ProjectConfig | null>(null);
const currentPageId = ref<string>("home");
const isEditMode = ref(false);
const selectedSectionId = ref<string | undefined>(undefined);
const isJsonExpanded = ref(false);
const viewport = ref<"desktop" | "tablet" | "mobile">("desktop");
const hasResult = computed(() => !!generatedConfig.value);

const selectedSection = computed(() => {
  if (!selectedSectionId.value || !currentPageConfig.value) return null;
  return currentPageConfig.value.sections.find(
    (s) => s.id === selectedSectionId.value
  );
});

function onUpdateSection(updatedEndpoint: Section) {
  if (!generatedConfig.value || !currentPageId.value) return;
  const page = generatedConfig.value.pages[currentPageId.value];
  if (!page) return;

  const idx = page.sections.findIndex((s) => s.id === updatedEndpoint.id);
  if (idx !== -1) {
    page.sections[idx] = updatedEndpoint;
  }
}

const currentPageConfig = computed(() => {
  if (!generatedConfig.value) return undefined;
  return generatedConfig.value.pages?.[currentPageId.value];
});

// Iframe Communication
const previewIframe = ref<HTMLIFrameElement | null>(null);
const isPreviewReady = ref(false);
const sectionEditorRef = ref<any>(null);

function syncPreview() {
  if (
    !previewIframe.value?.contentWindow ||
    !isPreviewReady.value ||
    !currentPageConfig.value
  )
    return;

  previewIframe.value.contentWindow.postMessage(
    {
      type: "updateConfig",
      config: JSON.parse(JSON.stringify(currentPageConfig.value)), // Deep clone to be safe
      isEditMode: isEditMode.value,
      selectedSectionId: selectedSectionId.value,
    },
    "*"
  );
}

// Listen for messages from Iframe
function onMessage(event: MessageEvent) {
  const data = event.data;
  if (!data) return;

  if (data.type === "previewReady") {
    isPreviewReady.value = true;
    syncPreview();
  } else if (data.type === "selectSection") {
    selectedSectionId.value = data.id;
  } else if (data.type === "reorderSection") {
    onReorderSection(data);
  } else if (data.type === "selectField") {
    // Visual Editing: Select section and focus field
    selectedSectionId.value = data.sectionId;
    isEditMode.value = true;

    // Defer focus to allow UI connection
    nextTick(() => {
      if (sectionEditorRef.value) {
        sectionEditorRef.value.focusField(data.field);
      }
    });
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
  if (!config) return [];
  return Object.keys(config.pages).map((id) => ({
    id,
    route: config.pages[id]?.meta?.note,
  }));
});

const user = useSupabaseUser();

// Force Mock Mode for Guests
watch(
  user,
  (u) => {
    if (!u) {
      mode.value = "mock";
    } else {
      mode.value = "auto";
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
    const { success, project } = await $fetch<{
      success: boolean;
      project: any;
    }>("/api/projects/save", {
      method: "POST",
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

const showPublishModal = ref(false);
const showAuthModal = ref(false);
const authAction = ref<"save" | "publish">("save");
const showPublishConfirm = ref(false);

function handleAuthConfirm() {
  showAuthModal.value = false;
  navigateTo("/login");
}

async function createProject() {
  console.log("createProject called");
  // Reset
  generatedConfig.value = null;
  stage.value = "analyzing";
  progressMessage.value = "Analyzing requirements...";
  error.value = null;
  loading.value = true;
  currentPageId.value = "home";

  try {
    console.log("Fetching /api/generate-page...");
    const { config, error: err } = await $fetch<{
      config: ProjectConfig;
      error?: string;
    }>("/api/generate-page", {
      method: "POST",
      body: {
        template: templateType.value,
        stack: stack.value,
        mode: mode.value,
        brief: brief.value,
        wordpressBaseUrl: wordpressBaseUrl.value,
        wordpressRestBase: wordpressRestBase.value,
      },
    });

    if (err) {
      error.value = err;
      return;
    }

    stage.value = "rendering";
    generatedConfig.value = config;

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch (e: any) {
    console.error(e);
    error.value = e.message || "Failed to generate project.";
  } finally {
    loading.value = false;
    stage.value = "idle";
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
      generatedConfig.value = project.config;
      brief.value =
        project.config.meta?.brief || project.config.meta?.note || ""; // Restore brief
      templateType.value = project.config.template || "landing";
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
        templateType.value = t as template;
      }
    }
    if (route.query.brief) {
      brief.value = route.query.brief as string;
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
        stack: stack.value,
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

const history = ref<string[]>([]);
const historyIndex = ref(-1);
let isHistoryNavigating = false;

// Initialize history when config is generated
watch(
  generatedConfig,
  (newVal) => {
    if (isHistoryNavigating || !newVal) return;
    const state = JSON.stringify(newVal);
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    history.value.push(state);
    historyIndex.value++;
    if (history.value.length > 20) {
      history.value.shift();
      historyIndex.value--;
    }
  },
  { deep: true }
);

function undo() {
  if (historyIndex.value > 0) {
    isHistoryNavigating = true;
    historyIndex.value--;
    const state = history.value[historyIndex.value];
    if (state) generatedConfig.value = JSON.parse(state);
    nextTick(() => {
      isHistoryNavigating = false;
    });
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    isHistoryNavigating = true;
    historyIndex.value++;
    const state = history.value[historyIndex.value];
    if (state) generatedConfig.value = JSON.parse(state);
    nextTick(() => {
      isHistoryNavigating = false;
    });
  }
}

function onReorderSection({
  id,
  direction,
}: {
  id: string;
  direction: "up" | "down";
}) {
  if (!generatedConfig.value) return;
  const page = generatedConfig.value.pages?.[currentPageId.value];
  if (!page || !page.sections) return;

  const index = page.sections.findIndex((s) => s.id === id);
  if (index === -1) return;

  const newSections = [...page.sections];

  if (direction === "up" && index > 0) {
    const prev = newSections[index - 1];
    const curr = newSections[index];
    if (prev && curr) {
      newSections[index] = prev;
      newSections[index - 1] = curr;
    }
  } else if (direction === "down" && index < newSections.length - 1) {
    const next = newSections[index + 1];
    const curr = newSections[index];
    if (next && curr) {
      newSections[index] = next;
      newSections[index + 1] = curr;
    }
  }

  page.sections = newSections;
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
        v-model:templateType="templateType"
        v-model:stack="stack"
        v-model:mode="mode"
        v-model:brief="brief"
        v-model:wordpressBaseUrl="wordpressBaseUrl"
        v-model:wordpressRestBase="wordpressRestBase"
        :loading="loading"
        :stage="stage"
        :progressMessage="progressMessage"
        :error="error"
        :user="user"
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
                :section="selectedSection"
                @update:section="onUpdateSection"
                @close="selectedSectionId = undefined"
              />
            </div>
            <div v-else>
              <h3
                class="text-xs font-semibold uppercase tracking-[0.16em] text-white mb-4"
              >
                Design
              </h3>
              <StyleControlPanel
                v-if="generatedConfig"
                :config="generatedConfig"
                @update:config="(val) => (generatedConfig = val)"
              />
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
            v-model:viewport="viewport"
            :can-undo="historyIndex > 0"
            :can-redo="historyIndex < history.length - 1"
            @undo="undo"
            @redo="redo"
          />

          <!-- Preview Iframe -->
          <NuxtErrorBoundary>
            <div class="relative">
              <PreviewFrame
                v-model:viewport="viewport"
                @iframe-load="(el) => (previewIframe = el)"
              />
            </div>
          </NuxtErrorBoundary>

          <!-- Export Section (Bottom of Preview) -->
          <div
            class="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <div class="flex border-b border-white/10 bg-white/5">
              <button
                @click="exportTab = 'quick'"
                class="px-6 py-3 text-sm font-medium transition-colors"
                :class="
                  exportTab === 'quick'
                    ? 'text-white bg-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                "
              >
                Quick Start
              </button>
              <button
                @click="exportTab = 'manual'"
                class="px-6 py-3 text-sm font-medium transition-colors"
                :class="
                  exportTab === 'manual'
                    ? 'text-white bg-white/5'
                    : 'text-slate-400 hover:text-slate-200'
                "
              >
                Manual / JSON
              </button>
            </div>
            <!-- Export Content -->
            <!-- Quick Start -->
            <div v-if="exportTab === 'quick'" class="p-6 space-y-6">
              <div class="space-y-4">
                <div
                  class="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-4"
                >
                  <h3
                    class="text-lg font-semibold text-white mb-2 flex items-center gap-2"
                  >
                    🚀 Launch your
                    {{ generatedConfig?.meta?.stack || stack || "App" }}
                  </h3>
                  <p class="text-sm text-slate-300">
                    Your kit is ready. Follow these steps to get started with
                    <strong>{{ generatedConfig?.meta?.stack || stack }}</strong
                    >.
                  </p>
                </div>

                <div
                  class="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-white/5"
                >
                  <!-- Nuxt Instructions -->
                  <div
                    v-if="
                      ['nuxt'].includes(generatedConfig?.meta?.stack || stack)
                    "
                    class="space-y-6"
                  >
                    <!-- Step 1 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >1</span
                        >
                        Initialize Project
                      </h4>
                      <div
                        class="rounded-lg bg-black/40 p-3 border border-white/5 space-y-2"
                      >
                        <pre class="text-xs font-mono text-emerald-400">
npx nuxi@latest init my-landing</pre
                        >
                        <pre class="text-xs font-mono text-emerald-400">
cd my-landing</pre
                        >
                        <pre class="text-xs font-mono text-emerald-400">
npm install</pre
                        >
                      </div>
                    </div>

                    <!-- Step 2 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >2</span
                        >
                        Install TailwindCSS
                      </h4>
                      <div
                        class="rounded-lg bg-black/40 p-3 border border-white/5 space-y-2"
                      >
                        <pre class="text-xs font-mono text-emerald-400">
npm install -D @nuxtjs/tailwindcss</pre
                        >
                        <p class="text-[10px] text-slate-500 pt-1">
                          Add to nuxt.config.ts:
                        </p>
                        <pre class="text-xs font-mono text-slate-300">
modules: ['@nuxtjs/tailwindcss']</pre
                        >
                      </div>
                    </div>

                    <!-- Step 3 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >3</span
                        >
                        Add Minions Config
                      </h4>
                      <p class="text-xs text-slate-400 mb-2 pl-7">
                        Copy the `tailwind.config.js` and `app.vue` from the
                        downloaded kit.
                      </p>
                    </div>
                  </div>

                  <!-- VUE + VITE SPECIFIC INSTRUCTIONS -->
                  <div
                    v-else-if="
                      ['vue', 'vue-vite'].includes(
                        generatedConfig?.meta?.stack || stack
                      )
                    "
                    class="space-y-6"
                  >
                    <!-- Step 1 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >1</span
                        >
                        Download & Unzip
                      </h4>
                      <p class="text-xs text-slate-400 mb-2 pl-7">
                        Download the .zip kit using the button below and extract
                        it.
                      </p>
                    </div>

                    <!-- Step 2 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >2</span
                        >
                        Install Dependencies
                      </h4>
                      <div
                        class="rounded-lg bg-black/40 p-3 border border-white/5 space-y-2"
                      >
                        <pre class="text-xs font-mono text-emerald-400">
cd my-landing-kit</pre
                        >
                        <pre class="text-xs font-mono text-emerald-400">
npm install</pre
                        >
                      </div>
                    </div>

                    <!-- Step 3 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >3</span
                        >
                        Start Development
                      </h4>
                      <div
                        class="rounded-lg bg-black/40 p-3 border border-white/5 space-y-2"
                      >
                        <pre class="text-xs font-mono text-emerald-400">
npm run dev</pre
                        >
                        <p class="text-[10px] text-slate-500 pt-1">
                          Opens at http://localhost:5173
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    v-else-if="
                      (generatedConfig?.meta?.stack || stack) === 'next' ||
                      (generatedConfig?.meta?.stack || stack) === 'nextjs'
                    "
                    class="space-y-6"
                  >
                    <!-- Step 1 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >1</span
                        >
                        Create Next.js App
                      </h4>
                      <div
                        class="rounded-lg bg-black/40 p-3 border border-white/5 space-y-2"
                      >
                        <pre class="text-xs font-mono text-emerald-400">
npx create-next-app@latest my-site --typescript --tailwind --eslint</pre
                        >
                        <pre class="text-xs font-mono text-emerald-400">
cd my-site</pre
                        >
                      </div>
                    </div>

                    <!-- Step 2 -->
                    <div>
                      <h4
                        class="flex items-center gap-2 text-sm font-semibold text-white mb-2"
                      >
                        <span
                          class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs shrink-0"
                          >2</span
                        >
                        Setup Components
                      </h4>
                      <p class="text-xs text-slate-400 mb-2 pl-7">
                        Copy the `components/` folder and `page.tsx` from the
                        kit to your project.
                      </p>
                    </div>
                  </div>
                  <!-- Fallback / Plain HTML -->
                  <div v-else class="space-y-3">
                    <p class="text-sm text-slate-400">
                      Open <strong>index.html</strong> in your browser or serve
                      with a static server.
                    </p>
                    <div
                      class="group relative rounded-lg bg-black/50 px-4 py-3 font-mono text-sm text-indigo-300"
                    >
                      npx serve .
                    </div>
                  </div>
                </div>

                <button
                  @click="downloadKit"
                  class="mt-4 w-full inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"
                    />
                    <path
                      d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"
                    />
                  </svg>
                  Download {{ generatedConfig?.meta?.stack || stack }} Kit
                </button>
              </div>
            </div>

            <!-- Manual / JSON -->
            <div v-else class="p-6 space-y-6">
              <div class="grid gap-4 sm:grid-cols-2 h-full">
                <!-- Actions -->
                <div
                  class="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4 flex flex-col justify-center"
                >
                  <div class="text-center space-y-1">
                    <div class="font-semibold text-white">Project Config</div>
                    <p class="text-xs text-slate-400">
                      Full JSON Configuration
                    </p>
                  </div>
                  <div class="grid grid-cols-1 gap-3">
                    <button
                      @click="copyJson"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-white transition-colors border border-white/5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-4 h-4 text-slate-400"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M15.988 3.012A2.25 2.25 0 0118 5.25v6.5A2.25 2.25 0 0115.75 14H13.5V7A2.5 2.5 0 0011 4.5H8.128a2.252 2.252 0 011.884-1.488A2.25 2.25 0 0112.25 1h1.5a2.25 2.25 0 012.238 2.012zM11.5 3.25a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v.25h-3v-.25z"
                          clip-rule="evenodd"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M2 7a1 1 0 011-1h8a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V7zm2 3.25a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zm0 3.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Copy to Clipboard
                    </button>
                    <button
                      @click="downloadJson"
                      class="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-white transition-colors border border-white/5"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-4 h-4 text-slate-400"
                      >
                        <path
                          d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z"
                        />
                        <path
                          d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z"
                        />
                      </svg>
                      Download .json
                    </button>
                  </div>
                </div>

                <!-- Preview Box -->
                <div
                  @click="isJsonExpanded = true"
                  class="group relative p-4 rounded-xl border border-white/10 bg-slate-900/80 cursor-pointer overflow-hidden hover:border-indigo-500/50 transition-all"
                >
                  <div
                    class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span
                      class="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider"
                      >Expand</span
                    >
                  </div>
                  <div class="text-[10px] font-mono text-slate-500 mb-2">
                    PREVIEW
                  </div>
                  <div
                    class="text-[10px] text-slate-300 font-mono opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    {{ exportJson.slice(0, 300) }}...
                  </div>
                  <!-- Gradient Fade -->
                  <div
                    class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Close Export Panel -->
      </div>
    </div>
  </div>
</template>
