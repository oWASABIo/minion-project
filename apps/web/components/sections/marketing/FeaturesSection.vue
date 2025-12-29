<script setup lang="ts">
import type { FeaturesSection as FeaturesSectionType } from "@minions/shared";

const props = defineProps<{
  section: FeaturesSectionType;
}>();
</script>

<template>
  <section
    class="px-6"
    :style="{
      paddingTop: 'var(--section-spacing, 4rem)',
      paddingBottom: 'var(--section-spacing, 4rem)',
    }"
  >
    <div class="mx-auto max-w-5xl">
      <div class="mx-auto max-w-3xl text-center mb-16">
        <h2
          class="text-3xl font-bold tracking-tight sm:text-4xl transition-colors"
          style="color: var(--text-primary)"
          data-sb-field="title"
        >
          {{ section.title }}
        </h2>
        <p
          v-if="section.subtitle"
          class="mt-4 text-lg transition-colors"
          style="color: var(--text-secondary)"
          data-sb-field="subtitle"
        >
          {{ section.subtitle }}
        </p>
      </div>

      <div
        class="grid gap-8"
        :class="
          section.variant === 'grid'
            ? 'md:grid-cols-2 lg:grid-cols-4'
            : 'md:grid-cols-3'
        "
      >
        <div
          v-for="(item, index) in section.items"
          :key="index"
          :class="
            section.variant === 'grid'
              ? 'space-y-3'
              : 'border p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 hover:-translate-y-1 transition-all duration-300 group'
          "
          :style="
            section.variant !== 'grid'
              ? {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                  borderRadius: 'var(--radius-ui, 0.75rem)',
                }
              : {}
          "
        >
          <h3
            class="text-lg font-semibold group-hover:text-primary transition-colors"
            style="color: var(--text-primary)"
            :class="section.variant === 'grid' ? 'text-primary' : ''"
            :data-sb-field="`items.${index}.title`"
          >
            {{ item.title }}
          </h3>
          <p
            class="mt-3 text-base leading-relaxed transition-colors"
            style="color: var(--text-secondary)"
          >
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
