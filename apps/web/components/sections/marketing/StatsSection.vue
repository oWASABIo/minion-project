<script setup lang="ts">
import type { StatsSection as StatsSectionType } from "@minions/shared";

defineProps<{
  section: StatsSectionType;
}>();
</script>

<template>
  <section
    class="px-6"
    :style="{
      paddingTop: 'var(--section-spacing, 6rem)',
      paddingBottom: 'var(--section-spacing, 6rem)',
    }"
  >
    <div v-if="section.title" class="text-center mb-16 px-6">
      <h2
        class="text-sm font-bold uppercase tracking-[0.2em] text-primary"
        data-sb-field="title"
      >
        {{ section.title }}
      </h2>
    </div>

    <div class="mx-auto max-w-5xl">
      <div
        class="grid gap-8 text-center"
        :class="
          (section.items || []).length === 2
            ? 'md:grid-cols-2'
            : (section.items || []).length === 4
            ? 'md:grid-cols-2 lg:grid-cols-4'
            : 'md:grid-cols-3'
        "
      >
        <div
          v-for="(item, idx) in section.items"
          :key="idx"
          class="p-8 transition-all relative overflow-hidden group"
          :class="
            section.variant === 'card'
              ? 'border hover:shadow-lg hover:-translate-y-1'
              : ''
          "
          :style="
            section.variant === 'card'
              ? {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                  borderRadius: 'var(--radius-ui, 1.5rem)',
                }
              : {}
          "
        >
          <div
            class="text-5xl font-extrabold md:text-6xl tracking-tight mb-2 transition-colors"
            style="color: var(--text-primary)"
            :data-sb-field="`items.${idx}.value`"
          >
            {{ item.value }}
          </div>
          <div
            class="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors"
            style="color: var(--text-secondary)"
            :data-sb-field="`items.${idx}.label`"
          >
            {{ item.label }}
          </div>
          <div
            v-if="item.description"
            class="mt-3 text-sm leading-relaxed transition-colors"
            style="color: var(--text-secondary)"
          >
            {{ item.description }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
