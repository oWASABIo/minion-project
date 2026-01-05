<script setup lang="ts">
import type { CtaSection as CtaSectionType } from "@minions/shared";
import { useCart } from "~/composables/useCart";

const props = defineProps<{
  section: CtaSectionType;
}>();
const { addToCart } = useCart();
</script>

<template>
  <section
    class="px-6 overflow-hidden"
    :style="{
      paddingTop: 'var(--section-spacing, 6rem)',
      paddingBottom: 'var(--section-spacing, 6rem)',
    }"
  >
    <div
      class="border border-indigo-500/20 shadow-2xl overflow-hidden relative"
      :class="
        section.variant === 'banner'
          ? 'w-full bg-primary py-24 text-center'
          : 'mx-auto max-w-5xl bg-indigo-600 dark:bg-indigo-500/10 px-6 py-24 text-center relative isolate'
      "
      :style="{
        borderRadius:
          section.variant === 'banner' ? '0px' : 'var(--radius-ui, 2.5rem)',
      }"
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
          <!-- Primary CTA -->
          <template v-if="section.primaryCta">
            <button
              v-if="section.primaryCta.action === 'add-to-cart'"
              @click="
                addToCart({
                  id: section.primaryCta.productId || 'cta-primary',
                  name: section.primaryCta.label,
                  price: '',
                })
              "
              class="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow-xl hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95"
            >
              {{ section.primaryCta.label }}
            </button>
            <RouterLink
              v-else-if="section.primaryCta.href"
              :to="section.primaryCta.href"
              class="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-indigo-600 shadow-xl hover:bg-indigo-50 transition-all hover:scale-105"
            >
              {{ section.primaryCta.label }}
            </RouterLink>
          </template>

          <!-- Secondary CTA -->
          <template v-if="section.secondaryCta">
            <button
              v-if="section.secondaryCta.action === 'add-to-cart'"
              @click="
                addToCart({
                  id: section.secondaryCta.productId || 'cta-secondary',
                  name: section.secondaryCta.label,
                  price: '',
                })
              "
              class="text-sm font-semibold leading-6 text-white hover:text-indigo-100 flex items-center gap-2 transition-all active:scale-95"
            >
              {{ section.secondaryCta.label }}
            </button>
            <RouterLink
              v-else-if="section.secondaryCta.href"
              :to="section.secondaryCta.href"
              class="text-sm font-semibold leading-6 text-white hover:text-indigo-100 flex items-center gap-2 transition-colors"
            >
              {{ section.secondaryCta.label }}
              <span aria-hidden="true">&rarr;</span>
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
