<script setup lang="ts">
const { styles } = useTheme();
const user = useSupabaseUser();

definePageMeta({
  middleware: ["auth"], // Ensure we have something like this or check manually
});

const projects = ref<any[]>([]);
const loading = ref(true);
const supabase = useSupabaseClient();

onMounted(async () => {
  if (!user.value) {
    return navigateTo("/login");
  }

  try {
    const session = await supabase.auth.getSession();
    const token = session?.data.session?.access_token;

    if (!token) {
      console.error("No auth token available");
      loading.value = false;
      return;
    }

    const { projects: data } = await $fetch<{ projects: any[] }>(
      "/api/projects/list",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    projects.value = data || [];
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const { success: toastSuccess, error: toastError } = useToast();
import ConfirmModal from "~/components/ui/ConfirmModal.vue";
import AnalyticsModal from "~/components/ui/AnalyticsModal.vue";

// Modal State
const showDeleteConfirm = ref(false);
const projectToViewStatsId = ref<number | null>(null);
const projectToViewStatsName = ref("");
const showAnalyticsModal = ref(false);

function openAnalytics(project: any) {
  projectToViewStatsId.value = project.id;
  projectToViewStatsName.value = project.name;
  showAnalyticsModal.value = true;
}

const projectToDeleteId = ref<number | null>(null);

function requestDelete(id: number) {
  projectToDeleteId.value = id;
  showDeleteConfirm.value = true;
}

async function handleConfirmDelete() {
  if (!projectToDeleteId.value) return;

  const id = projectToDeleteId.value;
  showDeleteConfirm.value = false; // Close UI immediately for snappy feel (opt-in optimistic)

  try {
    loading.value = true;

    const session = await supabase.auth.getSession();
    const token = session?.data.session?.access_token;

    if (!token) {
      toastError("Auth Error", "Could not retrieve access token.");
      loading.value = false;
      return;
    }

    await $fetch(`/api/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Refresh list
    const { projects: data } = await $fetch<{ projects: any[] }>(
      "/api/projects/list",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    projects.value = data || [];
    toastSuccess("Deleted", "Project has been removed successfully.");
  } catch (e: any) {
    console.error("Failed to delete project:", e);
    toastError("Delete Failed", e.message || "Could not delete project.");
  } finally {
    loading.value = false;
    projectToDeleteId.value = null;
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white font-sans" :style="styles">
    <SiteHeader />

    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Delete Project"
      message="Are you sure you want to delete this project? This action cannot be undone."
      confirmText="Delete Project"
      :isDanger="true"
      @close="showDeleteConfirm = false"
      @confirm="handleConfirmDelete"
    />

    <AnalyticsModal
      :isOpen="showAnalyticsModal"
      :projectId="projectToViewStatsId"
      :projectName="projectToViewStatsName"
      @close="showAnalyticsModal = false"
    />

    <main class="max-w-7xl mx-auto px-6 py-24">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold mb-2">My Projects</h1>
          <p class="text-slate-400">Manage your generated sites.</p>
        </div>
        <NuxtLink
          to="/builder"
          class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M10 2a1 1 0 011 1v6h6a1 1 0 110 2h-6v6a1 1 0 11-2 0v-6H3a1 1 0 110-2h6V3a1 1 0 011-1z"
              clip-rule="evenodd"
            />
          </svg>
          New Project
        </NuxtLink>
      </div>

      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="i in 3"
          :key="i"
          class="h-48 rounded-2xl bg-slate-900 border border-white/5 animate-pulse"
        ></div>
      </div>

      <div
        v-else-if="projects.length === 0"
        class="text-center py-20 bg-slate-900/50 rounded-3xl border border-white/5 border-dashed"
      >
        <div
          class="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 mb-4"
        >
          <svg
            class="h-8 w-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-white mb-1">No projects yet</h3>
        <p class="text-slate-400 text-sm mb-6">
          Start building your first landing page today.
        </p>
        <NuxtLink
          to="/builder"
          class="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
          >Create Project &rarr;</NuxtLink
        >
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.id"
          class="group relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
        >
          <!-- Mock Preview (could be real screenshot later) -->
          <div
            class="h-40 bg-slate-800 relative overflow-hidden group-hover:opacity-90 transition-opacity"
          >
            <div
              class="absolute inset-0 flex items-center justify-center text-slate-700 text-6xl font-black opacity-20 select-none"
            >
              {{ project.name.charAt(0) }}
            </div>
            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"
            ></div>
          </div>

          <div class="p-5">
            <h3
              class="text-lg font-bold text-white mb-1 truncate group-hover:text-indigo-400 transition-colors"
            >
              {{ project.name }}
            </h3>
            <div class="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span class="flex items-center gap-1">
                <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75l4 4a.75.75 0 001.5-1.5l-3.25-3.25V5z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ formatDate(project.updated_at) }}
              </span>
            </div>

            <div class="flex items-center gap-3">
              <NuxtLink
                :to="`/builder?id=${project.id}`"
                class="flex-1 text-center bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 hover:text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Edit
              </NuxtLink>
              <button
                @click="requestDelete(project.id)"
                class="p-2 text-slate-500 hover:text-red-400 transition-colors"
                title="Delete Project"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div class="px-5 pb-5 pt-0">
            <button
              @click="openAnalytics(project)"
              class="w-full flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 py-2.5 rounded-lg text-sm font-medium transition-colors border border-indigo-500/20"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"
                />
              </svg>
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
