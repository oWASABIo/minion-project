<script setup lang="ts">
import { computed } from "vue";
import type { HeroSection as HeroSectionType } from "@minions/shared";

const props = defineProps<{ section: HeroSectionType }>();

const isCenter = computed(() => props.section.variant !== "split");
</script>

<template>
  <section
    :id="section.id"
    class="px-6 relative overflow-hidden transition-all duration-500"
    :class="[
      section.variant === 'glass'
        ? 'min-h-[70vh] md:min-h-[85vh] flex items-center'
        : '',
    ]"
    :style="{
      paddingTop: 'var(--section-spacing, 5rem)',
      paddingBottom: 'var(--section-spacing, 5rem)',
      backgroundColor:
        section.variant !== 'glass' ? 'var(--bg-section)' : 'transparent',
    }"
  >
    <!-- Background for Glass Variant -->
    <div
      v-if="section.variant === 'glass' && section.image"
      class="absolute inset-0 z-0"
    >
      <img :src="section.image" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-md"></div>
    </div>

    <div
      class="mx-auto max-w-6xl relative z-10"
      :class="
        ['split', 'terminal', 'right'].includes(section.variant || '')
          ? 'grid gap-12 lg:gap-16 md:grid-cols-2 items-center'
          : 'text-center'
      "
    >
      <div :class="section.variant === 'right' ? 'md:order-2' : ''">
        <div
          v-if="section.eyebrow"
          class="inline-block rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6"
          data-sb-field="eyebrow"
        >
          {{ section.eyebrow }}
        </div>
        <h1
          class="text-4xl font-bold tracking-tight md:text-5xl lg:text-5xl transition-colors"
          :class="section.variant === 'glass' ? 'text-white' : ''"
          :style="
            section.variant !== 'glass' ? { color: 'var(--text-primary)' } : {}
          "
          data-sb-field="headline"
        >
          {{ section.headline }}
        </h1>
        <p
          v-if="section.subheadline"
          class="mt-6 text-lg leading-relaxed max-w-lg transition-colors"
          :class="[
            isCenter ? 'mx-auto' : '',
            section.variant === 'glass' ? 'text-slate-200' : '',
          ]"
          :style="
            section.variant !== 'glass'
              ? { color: 'var(--text-secondary)' }
              : {}
          "
          data-sb-field="subheadline"
        >
          {{ section.subheadline }}
        </p>

        <div
          class="mt-8 flex items-center gap-x-4"
          :class="[isCenter ? 'justify-center' : '']"
        >
          <RouterLink
            v-if="section.primaryCta && section.primaryCta.href"
            :to="section.primaryCta.href"
            class="bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            :style="{ borderRadius: 'var(--radius-ui, 0.5rem)' }"
            data-sb-field="primaryCta.label"
          >
            {{ section.primaryCta.label }}
          </RouterLink>
          <RouterLink
            v-if="section.secondaryCta && section.secondaryCta.href"
            :to="section.secondaryCta.href"
            class="text-sm font-semibold leading-6 px-4 py-2 hover:text-slate-900 dark:hover:text-white transition-colors"
            :class="
              section.variant === 'glass'
                ? 'text-white hover:bg-white/10'
                : 'text-slate-600 dark:text-slate-300'
            "
            :style="{ borderRadius: 'var(--radius-ui, 0.5rem)' }"
            data-sb-field="secondaryCta.label"
          >
            {{ section.secondaryCta.label }} <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>

      <!-- Right Column: Hybrid Terminal + Image -->
      <div
        v-if="['split', 'terminal', 'right'].includes(section.variant || '')"
        class="relative perspective-1000"
        :class="section.variant === 'right' ? 'md:order-1' : ''"
      >
        <!-- Hybrid Variant: Fun Pivot -->
        <div
          v-if="section.variant === 'terminal'"
          class="relative min-h-[500px] flex items-center justify-center"
        >
          <!-- Terminal (Background Layer) -->
          <div
            class="absolute top-10 left-0 right-0 mx-auto w-full max-w-lg bg-slate-900/80 backdrop-blur-sm border border-white/5 shadow-2xl overflow-hidden font-mono text-sm transform transition-transform duration-700 hover:rotate-0 hover:scale-100 opacity-60 hover:opacity-100 z-10"
            :style="{
              transform: 'rotate(6deg) scale(0.9)',
              borderRadius: 'var(--radius-ui, 0.75rem)',
            }"
          >
            <div
              class="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3"
            >
              <div class="flex gap-1.5">
                <div class="h-3 w-3 rounded-full bg-red-500/50"></div>
                <div class="h-3 w-3 rounded-full bg-yellow-500/50"></div>
              </div>
              <div
                class="ml-4 text-xs text-slate-500 flex-1 text-center font-sans tracking-wide"
              >
                🍌 minions.exe
              </div>
            </div>

            <div
              class="p-8 text-slate-500 space-y-4 font-mono text-xs select-none"
            >
              <div>
                <span class="text-yellow-500">➜</span>
                <span class="text-slate-400">$ npx minions serve</span>
              </div>
              <div class="space-y-1 opacity-50">
                <div>[INFO] Loading bananas... Done (120ms)</div>
                <div>[INFO] Spawning helpers... Done (500ms)</div>
                <div>[WARN] Bello! We are ready to code!</div>
              </div>
            </div>
          </div>

          <!-- Minions Image (Foreground Layer) -->
          <div
            class="relative z-20 transform hover:scale-105 transition-transform duration-500"
          >
            <img
              src="/images/hero-minions-v2.png"
              alt="Minions Builder"
              class="w-full h-full max-w-[120%] object-contain drop-shadow-2xl animate-bounce-slow"
              style="animation-duration: 3s"
            />
          </div>
        </div>

        <!-- Image Standard Variant -->
        <img
          v-else-if="section.image"
          :src="section.image"
          alt="Hero Image"
          class="shadow-xl w-full object-cover aspect-[4/3] bg-slate-800 transition-all duration-700 hover:scale-[1.02]"
          :style="{ borderRadius: 'var(--radius-ui, 1rem)' }"
        />
        <div
          v-else
          class="border border-white/10 bg-white/5 p-6 aspect-[4/3] flex items-center justify-center text-center"
          :style="{ borderRadius: 'var(--radius-ui, 1rem)' }"
        >
          <p class="text-sm text-slate-400">
            Generated Visual will appear here
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
