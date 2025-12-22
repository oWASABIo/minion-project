<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}>();

const emit = defineEmits(["close", "confirm"]);

function onClose() {
  emit("close");
}

function onConfirm() {
  emit("confirm");
}
</script>

<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" class="relative z-[100]" @close="onClose">
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

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div
          class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
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
              class="relative transform overflow-hidden rounded-2xl bg-slate-900 border border-white/10 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  class="rounded-md bg-transparent text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  @click="onClose"
                >
                  <span class="sr-only">Close</span>
                  <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div class="sm:flex sm:items-start">
                <div
                  v-if="isDanger"
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100/10 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <ExclamationTriangleIcon
                    class="h-6 w-6 text-red-500"
                    aria-hidden="true"
                  />
                </div>
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <DialogTitle
                    as="h3"
                    class="text-xl font-semibold leading-6 text-white"
                  >
                    {{ title }}
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-slate-400">
                      {{ message }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-8 sm:mt-8 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  :class="[
                    'inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset sm:w-auto transition-all',
                    isDanger
                      ? 'bg-red-600 hover:bg-red-500 ring-red-500 shadow-red-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 ring-indigo-500',
                  ]"
                  @click="onConfirm"
                >
                  {{ confirmText || "Confirm" }}
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 sm:mt-0 sm:w-auto transition-all"
                  @click="onClose"
                >
                  {{ cancelText || "Cancel" }}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
