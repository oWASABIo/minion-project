<script setup lang="ts">
import type { TestimonialsSection as TestimonialsSectionType } from "@minions/shared";

const props = defineProps<{
  section: TestimonialsSectionType;
}>();
</script>

<template>
  <section
    class="px-6 overflow-hidden"
    :style="{
      paddingTop: 'var(--section-spacing, 6rem)',
      paddingBottom: 'var(--section-spacing, 6rem)',
    }"
  >
    <div class="mx-auto max-w-5xl">
      <h2
        class="text-3xl font-bold tracking-tight text-center sm:text-4xl mb-12 transition-colors"
        style="color: var(--text-primary)"
        data-sb-field="title"
      >
        {{ section.title }}
      </h2>

      <div
        class="mt-6"
        :class="
          section.variant === 'slider'
            ? 'flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar'
            : 'grid gap-8 md:grid-cols-2 lg:grid-cols-3'
        "
      >
        <figure
          v-for="(item, index) in section.items"
          :key="index"
          class="border p-8 shadow-sm hover:shadow-md transition-all backdrop-blur-sm flex flex-col justify-between"
          :style="{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            borderRadius: 'var(--radius-ui, 1rem)',
          }"
        >
          <blockquote
            class="leading-relaxed transition-colors"
            style="color: var(--text-secondary)"
            :class="
              section.variant === 'slider'
                ? 'text-lg font-medium italic'
                : 'text-base font-medium'
            "
            :data-sb-field="`items.${index}.quote`"
          >
            “{{ item.quote }}”
          </blockquote>

          <div
            class="mt-6 flex items-center gap-3 border-t pt-6 transition-colors"
            :style="{ borderColor: 'var(--border-color)' }"
          >
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-inner"
            >
              {{ (item.name || "A").charAt(0) }}
            </div>
            <div>
              <div
                class="font-semibold text-sm transition-colors"
                style="color: var(--text-primary)"
                :data-sb-field="`items.${index}.name`"
              >
                {{ item.name }}
              </div>
              <div
                v-if="item.role"
                class="text-xs text-slate-500 dark:text-slate-400"
                :data-sb-field="`items.${index}.role`"
              >
                {{ item.role }}
              </div>
            </div>
          </div>
        </figure>
      </div>
    </div>
  </section>
</template>
