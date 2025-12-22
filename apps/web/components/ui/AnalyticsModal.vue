<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { XMarkIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  isOpen: boolean;
  projectId: number | null;
  projectName: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const loading = ref(true);
const stats = ref<any>(null);

const insights = ref<string | null>(null);
const insightsLoading = ref(false);

async function fetchStats() {
  if (!props.projectId) return;
  loading.value = true;
  insights.value = null; // Reset insights on new load
  try {
    const data = await $fetch(`/api/analytics/${props.projectId}/stats`);
    stats.value = data;
  } catch (e) {
    console.error("Failed to fetch analytics:", e);
  } finally {
    loading.value = false;
  }
}

async function fetchInsights() {
  if (!props.projectId) return;
  insightsLoading.value = true;
  try {
    const data = await $fetch<{ insights: string }>(
      `/api/analytics/${props.projectId}/insights`,
      {
        method: "POST",
      }
    );
    // Simple markdown cleanup (remove ** for cleaner plain text view if not using markdown render)
    insights.value = data.insights.replace(/\*\*/g, "").replace(/\*/g, "•");
  } catch (e) {
    console.error("Failed to fetch insights:", e);
    insights.value =
      "⚠️ AI Service is temporarily unavailable. Please try again later.";
  } finally {
    insightsLoading.value = false;
  }
}

// Fetch when opened
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.projectId) {
      fetchStats();
    }
  }
);
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div
          class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto w-screen">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center sm:p-0"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-4xl"
            >
              <!-- Header -->
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-900/50"
              >
                <DialogTitle
                  as="h3"
                  class="text-lg font-semibold leading-6 text-white flex items-center gap-2"
                >
                  <span class="text-indigo-400">📊</span>
                  Analytics: {{ projectName }}
                </DialogTitle>
                <div class="flex items-center gap-2">
                  <button
                    @click="fetchStats"
                    class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Refresh Stats"
                  >
                    <ArrowPathIcon
                      class="w-5 h-5"
                      :class="{ 'animate-spin': loading }"
                    />
                  </button>
                  <button
                    @click="$emit('close')"
                    class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <XMarkIcon class="w-6 h-6" />
                  </button>
                </div>
              </div>

              <!-- Content -->
              <div class="p-6">
                <div v-if="loading && !stats" class="flex justify-center py-20">
                  <div
                    class="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"
                  ></div>
                </div>

                <div v-else-if="stats" class="space-y-8">
                  <!-- KPI Cards -->
                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    <div
                      class="p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div class="text-sm text-slate-400 mb-1">Total Views</div>
                      <div class="text-3xl font-bold text-white">
                        {{ stats.totalViews }}
                      </div>
                    </div>
                    <div
                      class="p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div class="text-sm text-slate-400 mb-1">
                        Total Clicks
                      </div>
                      <div class="text-3xl font-bold text-indigo-400">
                        {{ stats.totalClicks }}
                      </div>
                    </div>
                    <div
                      class="p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div class="text-sm text-slate-400 mb-1">
                        Conversion Rate
                      </div>
                      <div class="text-3xl font-bold text-emerald-400">
                        {{
                          stats.totalViews
                            ? (
                                (stats.totalClicks / stats.totalViews) *
                                100
                              ).toFixed(1)
                            : 0
                        }}%
                      </div>
                    </div>
                    <div
                      class="p-4 bg-white/5 rounded-xl border border-white/5"
                    >
                      <div class="text-sm text-slate-400 mb-1">
                        Last Activity
                      </div>
                      <div
                        class="text-sm font-medium text-slate-200 mt-2 truncate"
                      >
                        {{
                          stats.recentEvents[0]
                            ? new Date(
                                stats.recentEvents[0].created_at
                              ).toLocaleTimeString()
                            : "-"
                        }}
                      </div>
                    </div>
                  </div>

                  <!-- Charts / Lists -->
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Top Pages (Simulated) -->
                    <!-- Note: In a real app we would aggregate grouping by path in DB, for now showing Recent Activity is easier -->
                    <div
                      class="bg-white/5 rounded-xl border border-white/5 overflow-hidden"
                    >
                      <div
                        class="px-4 py-3 border-b border-white/5 font-semibold text-slate-300"
                      >
                        Recent Activity
                      </div>
                      <ul
                        class="divide-y divide-white/5 max-h-64 overflow-y-auto"
                      >
                        <li
                          v-if="stats.recentEvents.length === 0"
                          class="p-4 text-center text-slate-500"
                        >
                          No activity yet.
                        </li>
                        <li
                          v-for="event in stats.recentEvents"
                          :key="event.id"
                          class="px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div class="flex items-center gap-3">
                            <span
                              class="w-2 h-2 rounded-full"
                              :class="
                                event.event_type === 'page_view'
                                  ? 'bg-indigo-400'
                                  : 'bg-emerald-400'
                              "
                            ></span>
                            <div>
                              <div class="text-sm font-medium text-slate-200">
                                {{
                                  event.event_type === "page_view"
                                    ? "Page View"
                                    : "Interaction"
                                }}
                              </div>
                              <div
                                class="text-xs text-slate-500 truncate max-w-[200px]"
                              >
                                {{
                                  event.metadata?.path ||
                                  event.metadata?.element_id ||
                                  "Unknown"
                                }}
                              </div>
                            </div>
                          </div>
                          <div class="text-xs text-slate-500">
                            {{ new Date(event.created_at).toLocaleString() }}
                          </div>
                        </li>
                      </ul>
                    </div>

                    <!-- AI Insights Panel -->
                    <div
                      class="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl border border-indigo-500/20 p-6"
                    >
                      <div
                        v-if="!insights && !insightsLoading"
                        class="flex flex-col items-center justify-center text-center"
                      >
                        <div
                          class="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4"
                        >
                          <span class="text-2xl">🧠</span>
                        </div>
                        <h4 class="text-lg font-bold text-white mb-2">
                          AI Insights
                        </h4>
                        <p class="text-slate-300 text-sm mb-6">
                          Unlock advanced analysis powered by Gemini AI. Ask
                          questions about your traffic.
                        </p>
                        <button
                          @click="fetchInsights"
                          class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                          Generate Insights
                        </button>
                      </div>

                      <div
                        v-else-if="insightsLoading"
                        class="flex flex-col items-center justify-center py-8 text-center"
                      >
                        <div
                          class="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"
                        ></div>
                        <p class="text-indigo-300 font-medium animate-pulse">
                          Consulting AI Marketing Guru...
                        </p>
                        <p class="text-slate-500 text-xs mt-2">
                          Analyzing conversion funnels and user behavior
                        </p>
                      </div>

                      <div
                        v-else
                        class="prose prose-invert prose-sm max-w-none"
                      >
                        <div class="flex items-center justify-between mb-4">
                          <h4
                            class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
                          >
                            AI Recommendations
                          </h4>
                          <button
                            @click="fetchInsights"
                            class="text-xs text-slate-400 hover:text-white underline"
                          >
                            Regenerate
                          </button>
                        </div>
                        <div
                          class="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5"
                        >
                          {{ insights }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
