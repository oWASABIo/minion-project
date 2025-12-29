<script setup lang="ts">
import type { PricingSection as PricingSectionType } from "@minions/shared";

defineProps<{
  section: PricingSectionType;
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
      <div class="text-center mb-16 max-w-3xl mx-auto">
        <h2
          class="text-3xl font-bold tracking-tight md:text-5xl transition-colors"
          style="color: var(--text-primary)"
          data-sb-field="title"
        >
          {{ section.title || "Pricing Plans" }}
        </h2>
        <p
          v-if="section.subtitle"
          class="mt-6 text-lg leading-relaxed transition-colors"
          style="color: var(--text-secondary)"
          data-sb-field="subtitle"
        >
          {{ section.subtitle }}
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mx-auto">
        <div
          v-for="(plan, idx) in section.plans || []"
          :key="idx"
          class="relative flex flex-col p-8 transition-transform hover:-translate-y-2 duration-300"
          :class="
            plan.isPopular
              ? 'border-2 border-primary bg-white/80 dark:bg-white/5 shadow-2xl skew-y-0 scale-105 z-10 backdrop-blur-md'
              : 'border shadow-lg backdrop-blur-sm'
          "
          :style="
            plan.isPopular
              ? { borderRadius: 'var(--radius-ui, 1.5rem)' }
              : {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color)',
                  boxShadow: 'var(--shadow-card)',
                  borderRadius: 'var(--radius-ui, 1.5rem)',
                }
          "
        >
          <div
            v-if="plan.isPopular"
            class="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg"
          >
            Most Popular
          </div>

          <h3
            class="text-xl font-bold transition-colors"
            style="color: var(--text-primary)"
            :data-sb-field="`plans.${idx}.name`"
          >
            {{ plan.name }}
          </h3>
          <div class="mt-4 flex items-baseline gap-1">
            <span
              class="text-5xl font-extrabold tracking-tight transition-colors"
              style="color: var(--text-primary)"
              :data-sb-field="`plans.${idx}.price`"
              >{{ plan.price }}</span
            >
            <span
              v-if="plan.period"
              class="text-sm font-semibold transition-colors"
              style="color: var(--text-secondary)"
              :data-sb-field="`plans.${idx}.period`"
              >{{ plan.period }}</span
            >
          </div>
          <p
            v-if="plan.description"
            class="mt-4 text-sm leading-relaxed transition-colors"
            style="color: var(--text-secondary)"
            :data-sb-field="`plans.${idx}.description`"
          >
            {{ plan.description }}
          </p>

          <ul
            role="list"
            class="mt-8 space-y-4 text-sm leading-6 flex-1 transition-colors"
            style="color: var(--text-secondary)"
          >
            <li
              v-for="feature in plan.features"
              :key="feature"
              class="flex gap-x-3 items-start"
            >
              <svg
                class="h-5 w-5 flex-none text-primary mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                />
              </svg>
              {{ feature }}
            </li>
          </ul>
          <RouterLink
            v-if="plan.cta"
            :to="plan.cta.href"
            :aria-describedby="plan.name"
            class="mt-8 block rounded-full px-6 py-3 text-center text-sm font-bold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all transform hover:scale-[1.02]"
            :class="[
              plan.isPopular
                ? 'bg-primary text-white shadow-xl shadow-primary/25 hover:brightness-110 focus-visible:outline-primary'
                : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90',
            ]"
            :data-sb-field="`plans.${idx}.cta.label`"
          >
            {{ plan.cta.label }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
