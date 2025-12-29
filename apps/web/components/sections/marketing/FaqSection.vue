<script setup lang="ts">
import type { FaqSection as FaqSectionType } from "@minions/shared";

const props = defineProps<{
  section: FaqSectionType;
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
    <div class="mx-auto max-w-3xl">
      <h2
        class="text-3xl font-bold tracking-tight text-center md:text-4xl mb-12 transition-colors"
        style="color: var(--text-primary)"
        data-sb-field="title"
      >
        {{ section.title || "Frequently Asked Questions" }}
      </h2>

      <div class="space-y-4">
        <details
          v-for="(item, index) in section.items"
          :key="index"
          class="group border [&_summary::-webkit-details-marker]:hidden transition-all duration-300 open:shadow-md"
          :style="{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            borderRadius: 'var(--radius-ui, 1rem)',
          }"
        >
          <summary
            class="flex cursor-pointer items-center justify-between gap-1.5 p-6 font-medium transition-colors hover:bg-slate-50 dark:hover:bg-white/5 group-open:rounded-b-none group-open:bg-slate-50 dark:group-open:bg-white/5"
            :style="{
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-ui, 1rem)',
            }"
          >
            <h3
              class="text-lg"
              :data-sb-field="`items.${index}.${item.q ? 'q' : 'question'}`"
            >
              {{ item.q || item.question }}
            </h3>
            <span class="relative h-5 w-5 shrink-0">
              <svg
                class="absolute inset-0 h-5 w-5 opacity-100 group-open:opacity-0 transition-opacity duration-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>

              <svg
                class="absolute inset-0 h-5 w-5 opacity-0 group-open:opacity-100 transition-opacity duration-300"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 12h-15"
                />
              </svg>
            </span>
          </summary>

          <div
            class="px-6 pb-6 pt-2 leading-relaxed transition-colors"
            style="color: var(--text-secondary)"
          >
            <p :data-sb-field="`items.${index}.${item.a ? 'a' : 'answer'}`">
              {{ item.a || item.answer }}
            </p>
          </div>
        </details>
      </div>
    </div>
  </section>
</template>
