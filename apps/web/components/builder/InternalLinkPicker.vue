<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { LinkIcon } from "@heroicons/vue/24/outline";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";
import { computed } from "vue";

const store = useBuilderStore();
const { projectConfig } = storeToRefs(store);

defineEmits<{
  (e: "select", path: string): void;
}>();

const pages = computed(() => {
  if (!projectConfig.value?.pages) return [];
  return Object.keys(projectConfig.value.pages).map((id) => ({
    id,
    path: projectConfig.value!.pages[id].meta?.note || `/${id}`,
  }));
});
</script>

<template>
  <Popover class="relative">
    <PopoverButton
      class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
      title="Pick Internal Page"
    >
      <LinkIcon class="h-4 w-4" />
    </PopoverButton>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
        v-slot="{ close }"
        class="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-slate-900 border border-white/10 shadow-2xl focus:outline-none overflow-hidden"
      >
        <div class="p-2 border-b border-white/5 bg-white/5">
          <span
            class="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2"
            >Select Page</span
          >
        </div>
        <div class="max-h-60 overflow-y-auto p-1">
          <button
            v-for="page in pages"
            :key="page.id"
            @click="
              () => {
                $emit('select', page.path);
                close();
              }
            "
            class="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors flex items-center justify-between group"
          >
            <span class="font-medium capitalize">{{ page.id }}</span>
            <span
              class="text-[9px] text-slate-500 group-hover:text-indigo-200"
              >{{ page.path }}</span
            >
          </button>

          <div
            v-if="pages.length === 0"
            class="p-4 text-center text-slate-500 text-xs italic"
          >
            No pages found
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
