<script setup lang="ts">
import { TransitionGroup } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/solid";

const { toasts, remove } = useToast();
</script>

<template>
  <div
    class="fixed top-24 right-6 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
  >
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 backdrop-blur-xl transition-all"
        :class="[
          toast.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20'
            : toast.type === 'error'
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-slate-800/90 border border-white/10',
        ]"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon
                v-if="toast.type === 'success'"
                class="h-6 w-6 text-emerald-400"
                aria-hidden="true"
              />
              <ExclamationCircleIcon
                v-else-if="toast.type === 'error'"
                class="h-6 w-6 text-red-400"
                aria-hidden="true"
              />
              <InformationCircleIcon
                v-else
                class="h-6 w-6 text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p
                class="text-sm font-medium"
                :class="
                  toast.type === 'success'
                    ? 'text-emerald-100'
                    : toast.type === 'error'
                    ? 'text-red-100'
                    : 'text-white'
                "
              >
                {{ toast.title }}
              </p>
              <p
                v-if="toast.message"
                class="mt-1 text-sm"
                :class="
                  toast.type === 'success'
                    ? 'text-emerald-200/80'
                    : toast.type === 'error'
                    ? 'text-red-200/80'
                    : 'text-slate-400'
                "
              >
                {{ toast.message }}
              </p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md text-white/50 hover:text-white focus:outline-none"
                @click="remove(toast.id)"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
