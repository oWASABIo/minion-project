<script setup lang="ts">
import type { CtaSection as CtaSectionType } from "@minions/shared";

const props = defineProps<{
  section: CtaSectionType;
}>();
</script>

<template>
  <section class="py-24 px-6 overflow-hidden">
    <div
      class="border border-indigo-500/20 shadow-2xl overflow-hidden relative"
      :class="
        section.variant === 'banner'
          ? 'w-full bg-primary rounded-none py-24 text-center'
          : 'mx-auto max-w-5xl rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-500/10 px-6 py-24 text-center relative isolate'
      "
    >
      <!-- Background Glow (if Card) -->
      <div
        v-if="section.variant !== 'banner'"
        class="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),theme(colors.white)_100%)] opacity-20 dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.800),transparent)]"
      ></div>

      <div class="mx-auto max-w-2xl relative">
        <h2
          class="text-4xl font-bold tracking-tight sm:text-5xl"
          :class="
            section.variant === 'banner'
              ? 'text-white'
              : 'text-white dark:text-white'
          "
          data-sb-field="headline"
        >
          {{ section.headline || section.title }}
        </h2>
        <p
          class="mt-6 text-lg leading-8 text-indigo-100"
          data-sb-field="subheadline"
        >
          {{ section.subheadline || section.description }}
        </p>

        <div class="mt-10 flex items-center justify-center gap-x-6">
          <RouterLink
            v-if="section.primaryCta && section.primaryCta.href"
            :to="section.primaryCta.href"
            class="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow-xl hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all hover:scale-105"
            data-sb-field="primaryCta.label"
          >
            {{ section.primaryCta.label }}
          </RouterLink>
          <RouterLink
            v-if="section.secondaryCta && section.secondaryCta.href"
            :to="section.secondaryCta.href"
            class="text-sm font-semibold leading-6 text-white hover:text-indigo-100 flex items-center gap-2 transition-colors"
            data-sb-field="secondaryCta.label"
          >
            {{ section.secondaryCta.label }}
            <span aria-hidden="true">&rarr;</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
