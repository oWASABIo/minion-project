<script setup lang="ts">
/**
 * StaticPageRenderer - For static landing pages (Index, Examples)
 * This is a simplified version without builder/edit features:
 * - No SectionWrapper (no edit borders, no spacing controls)
 * - No data-sb-field interactions
 * - No blueprint CSS
 * - Fixed styling for clean public display
 */
import { computed } from "vue";
import type { PageConfig } from "@minions/shared";
import { resolveWordpressConfig } from "~/utils/backend";
import { useBlogData } from "~/composables/useBlogData";

import GeneratedHeader from "~/components/sections/marketing/GeneratedHeader.vue";
import SiteFooter from "~/components/SiteFooter.vue";

import HeroSection from "~/components/sections/marketing/HeroSection.vue";
import FeaturesSection from "~/components/sections/marketing/FeaturesSection.vue";
import TestimonialsSection from "~/components/sections/marketing/TestimonialsSection.vue";
import FaqSection from "~/components/sections/marketing/FaqSection.vue";
import CtaSection from "~/components/sections/marketing/CtaSection.vue";
import BlogListSectionComp from "~/components/sections/blog/BlogListSection.vue";
import PricingSection from "~/components/sections/marketing/PricingSection.vue";
import StatsSection from "~/components/sections/marketing/StatsSection.vue";
import TeamSection from "~/components/sections/marketing/TeamSection.vue";
import CliSection from "~/components/sections/marketing/CliSection.vue";

const props = withDefaults(
  defineProps<{
    config: PageConfig;
    headerMode?: "app" | "generated";
  }>(),
  {
    headerMode: "generated",
  }
);

// Data fetching (WordPress)
const { blogDataMap, blogLoadingMap } = useBlogData(
  computed(() => props.config)
);

// Inject default CSS variables for static pages
useHead(() => ({
  style: [
    {
      id: "static-theme-vars",
      children: `
        :root {
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --bg-page: #0f172a;
          --bg-card: rgba(30, 41, 59, 0.5);
          --bg-subtle: #1e293b;
          --border-color: rgba(148, 163, 184, 0.1);
          --radius-ui: 0.75rem;
          --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --section-spacing: 5rem;
          --accent: #6366f1;
        }
      `,
    },
  ],
  bodyAttrs: {
    class: "dark bg-slate-950 text-slate-50",
  },
}));
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300 flex flex-col dark bg-slate-950 text-slate-50"
  >
    <GeneratedHeader v-if="headerMode === 'generated'" :config="config" />

    <main class="flex-1 w-full">
      <template v-for="section in config.sections" :key="section.id">
        <!-- Render sections directly without SectionWrapper -->
        <HeroSection v-if="section.type === 'hero'" :section="section" />

        <FeaturesSection
          v-else-if="section.type === 'features'"
          :section="section"
        />

        <TestimonialsSection
          v-else-if="section.type === 'testimonials'"
          :section="section"
        />

        <FaqSection v-else-if="section.type === 'faq'" :section="section" />

        <BlogListSectionComp
          v-else-if="section.type === 'blogList'"
          :section="section"
          :posts="blogDataMap[section.id] || []"
          :loading="!!blogLoadingMap[section.id]"
        />

        <CtaSection v-else-if="section.type === 'cta'" :section="section" />

        <PricingSection
          v-else-if="section.type === 'pricing'"
          :section="section"
        />

        <StatsSection v-else-if="section.type === 'stats'" :section="section" />

        <TeamSection v-else-if="section.type === 'team'" :section="section" />

        <CliSection v-else-if="section.type === 'cli'" :section="section" />
      </template>
    </main>

    <SiteFooter :config="config" />
  </div>
</template>
