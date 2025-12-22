<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { PaintBrushIcon } from "@heroicons/vue/24/outline";

const { palettes, setPrimary, primaryColor, fonts, setFont, fontFamily } =
  useTheme();
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50">
    <Popover class="relative">
      <PopoverButton
        class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-full shadow-xl hover:scale-105 transition-transform focus:outline-none"
      >
        <PaintBrushIcon class="w-6 h-6" />
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
          class="absolute bottom-full right-0 mb-4 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-6"
        >
          <div class="space-y-6">
            <!-- Colors -->
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Primary Color
              </h3>
              <div class="grid grid-cols-4 gap-3">
                <button
                  v-for="color in palettes"
                  :key="color.name"
                  @click="setPrimary(color.value)"
                  class="w-full aspect-square rounded-full border-2 transition-all"
                  :class="[
                    primaryColor === color.value
                      ? 'border-slate-900 dark:border-white scale-110'
                      : 'border-transparent hover:scale-105',
                  ]"
                  :style="{ backgroundColor: color.value }"
                  :title="color.name"
                  :aria-label="color.name"
                ></button>
              </div>
            </div>

            <!-- Fonts -->
            <div>
              <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Typography
              </h3>
              <div class="space-y-2">
                <button
                  v-for="font in fonts"
                  :key="font.name"
                  @click="setFont(font.name)"
                  class="w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors flex items-center justify-between"
                  :class="[
                    fontFamily === font.name
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300',
                  ]"
                >
                  <span>{{ font.name }}</span>
                  <span
                    class="text-xs opacity-50"
                    :style="{ fontFamily: font.value }"
                    >Aa</span
                  >
                </button>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-200 dark:border-white/10">
              <p class="text-xs text-slate-400 text-center">
                Changes apply globally to buttons & links.
              </p>
            </div>
          </div>
        </PopoverPanel>
      </transition>
    </Popover>
  </div>
</template>
