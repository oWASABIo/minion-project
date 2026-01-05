<script setup lang="ts">
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";
import BaseButton from "../ui/BaseButton.vue";
import BaseInput from "../ui/BaseInput.vue";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useBuilderStore();
const { projectConfig, currentPageId } = storeToRefs(store);

const pagesList = computed(() => {
  if (!projectConfig.value?.pages) return [];
  return Object.keys(projectConfig.value.pages).map((id) => ({
    id,
    route: projectConfig.value!.pages[id].meta?.note || `/${id}`,
  }));
});

const isAdding = ref(false);
const newPageId = ref("");
const newPageRoute = ref("");

function startAdding() {
  isAdding.value = true;
  newPageId.value = "";
  newPageRoute.value = "/";
}

function handleAddPage() {
  if (!newPageId.value) return;
  const id = newPageId.value.toLowerCase().trim().replace(/\s+/g, "-");
  const route = newPageRoute.value.startsWith("/")
    ? newPageRoute.value
    : `/${newPageRoute.value}`;

  store.addPage(id, id);
  store.updatePageMeta(id, { note: route });

  isAdding.value = false;
  newPageId.value = "";
}

function handleDeletePage(id: string) {
  if (confirm(`Are you sure you want to delete the "${id}" page?`)) {
    store.deletePage(id);
  }
}

const editingId = ref<string | null>(null);
const editName = ref("");
const editRoute = ref("");

function startEditing(id: string) {
  editingId.value = id;
  editName.value = id;
  editRoute.value = projectConfig.value?.pages[id].meta?.note || `/${id}`;
}

function saveEdit() {
  if (!editingId.value) return;

  const id = editingId.value;
  // Update route first
  store.updatePageMeta(id, { note: editRoute.value });

  // Handle Rename if changed (and not home)
  if (editName.value !== id && id !== "home") {
    const newId = editName.value.toLowerCase().trim().replace(/\s+/g, "-");
    store.renamePage(id, newId);
  }

  editingId.value = null;
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
    >
      <!-- Header -->
      <div
        class="p-6 border-b border-white/10 flex items-center justify-between bg-white/5"
      >
        <div>
          <h2 class="text-xl font-bold text-white">Manage Pages</h2>
          <p class="text-sm text-slate-400">
            Add, rename, or delete pages for your site.
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <XMarkIcon class="h-6 w-6 text-slate-400" />
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <!-- Page List -->
        <div class="space-y-3">
          <div
            v-for="pg in pagesList"
            :key="pg.id"
            class="group flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-indigo-500/50 hover:bg-white/10 transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold uppercase text-xs"
              >
                {{ pg.id.slice(0, 2) }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white capitalize">{{
                    pg.id
                  }}</span>
                  <span
                    v-if="pg.id === 'home'"
                    class="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider"
                    >Default</span
                  >
                  <span
                    v-if="currentPageId === pg.id"
                    class="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 font-bold uppercase tracking-wider"
                    >Current</span
                  >
                </div>
                <code class="text-xs text-slate-500">{{ pg.route }}</code>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="startEditing(pg.id)"
                class="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                <PencilIcon class="h-4 w-4" />
              </button>
              <button
                v-if="pg.id !== 'home'"
                @click="handleDeletePage(pg.id)"
                class="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <TrashIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Add Page Form -->
        <div
          v-if="isAdding"
          class="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <div class="grid grid-cols-2 gap-4">
            <BaseInput
              v-model="newPageId"
              label="Page ID / Name"
              placeholder="e.g. about"
            />
            <BaseInput
              v-model="newPageRoute"
              label="Route / Path"
              placeholder="e.g. /about"
            />
          </div>
          <div class="flex justify-end gap-3">
            <BaseButton variant="secondary" size="sm" @click="isAdding = false"
              >Cancel</BaseButton
            >
            <BaseButton variant="primary" size="sm" @click="handleAddPage"
              >Add Page</BaseButton
            >
          </div>
        </div>

        <!-- Edit Form -->
        <div
          v-if="editingId"
          class="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-4 animate-in fade-in slide-in-from-top-2"
        >
          <h3 class="text-sm font-bold text-amber-200 uppercase tracking-wider">
            Editing: {{ editingId }}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput
              v-model="editName"
              label="Rename ID"
              :disabled="editingId === 'home'"
            />
            <BaseInput v-model="editRoute" label="Route / Path" />
          </div>
          <div class="flex justify-end gap-3">
            <BaseButton variant="secondary" size="sm" @click="editingId = null"
              >Cancel</BaseButton
            >
            <BaseButton variant="primary" size="sm" @click="saveEdit"
              >Save Changes</BaseButton
            >
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="p-6 border-t border-white/10 bg-white/5 flex items-center justify-between"
      >
        <BaseButton
          v-if="!isAdding && !editingId"
          variant="secondary"
          size="sm"
          @click="startAdding"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Add New Page
        </BaseButton>
        <div v-else></div>
        <BaseButton variant="primary" size="sm" @click="$emit('close')"
          >Done</BaseButton
        >
      </div>
    </div>
  </div>
</template>
