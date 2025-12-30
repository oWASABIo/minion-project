<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PageConfig, Section, BlogListSection } from "@minions/shared";
import { resolveWordpressConfig } from "~/utils/backend";
import { useRoute } from "vue-router";
import { useBuilderStore } from "~/stores/builder";
import { useBlogData } from "~/composables/useBlogData";
const store = useBuilderStore();

import GeneratedHeader from "~/components/sections/marketing/GeneratedHeader.vue";
import SiteFooter from "~/components/SiteFooter.vue";

import SectionWrapper from "~/components/builder/SectionWrapper.vue";
import UnknownSection from "~/components/builder/UnknownSection.vue";

import HeroSection from "~/components/sections/marketing/HeroSection.vue";
import FeaturesSection from "~/components/sections/marketing/FeaturesSection.vue";
import TestimonialsSection from "~/components/sections/marketing/TestimonialsSection.vue";
import FaqSection from "~/components/sections/marketing/FaqSection.vue";
import CtaSection from "~/components/sections/marketing/CtaSection.vue";
import BlogListSectionComp from "~/components/sections/blog/BlogListSection.vue";
import PricingSection from "~/components/sections/marketing/PricingSection.vue";
import StatsSection from "~/components/sections/marketing/StatsSection.vue";
import TeamSection from "~/components/sections/marketing/TeamSection.vue";
import ProductListSection from "~/components/sections/ecommerce/ProductListSection.vue";
import ProductDetailSection from "~/components/sections/ecommerce/ProductDetailSection.vue";
import CliSection from "~/components/sections/marketing/CliSection.vue";
import "~/assets/css/blueprint.css";

const props = withDefaults(
  defineProps<{
    config: PageConfig;
    headerMode?: "app" | "generated";
    isEditMode?: boolean;
    selectedSectionId?: string;
    enableContainer?: boolean;
  }>(),
  {
    headerMode: "generated",
    isEditMode: false,
    enableContainer: true, // Default to true to preserve existing behavior
  }
);

defineEmits<{
  (e: "select-section", id: string): void;
  (
    e: "reorder-section",
    payload: { id: string; direction: "up" | "down" }
  ): void;
  (e: "duplicateSection", id: string): void;
  (e: "deleteSection", id: string): void;
}>();

// Data fetching (WordPress)
const { blogDataMap, blogLoadingMap } = useBlogData(
  computed(() => props.config)
);

// Analytics Tracking
const { trackPageView } = useAnalytics();
const route = useRoute();

watch(
  () => props.config as PageConfig, // Track whenever config (page) changes
  (newConfig: PageConfig) => {
    if (newConfig?.projectId) {
      trackPageView(newConfig.projectId, route.path);
    }
  },
  { immediate: true }
);

const isBlueprint = computed(() => {
  return (
    props.config?.mode === "blueprint" ||
    props.config?.meta?.mode === "blueprint"
  );
});

const { isDark, accent, font, themeVars, bodyClass, containerStyle } =
  useThemeVariables(
    computed(() => props.config),
    isBlueprint
  );

// Inject variables into Body so they are available globally (layout, drawers, modals)
useHead(() => ({
  style: [
    {
      id: "theme-vars",
      children: `
        :root {
          ${Object.entries(themeVars.value)
            .map(([key, val]) => `${key}: ${val};`)
            .join("\n          ")}
        }
      `,
    },
  ],
  bodyAttrs: {
    class: bodyClass.value,
  },
}));

// Analytics Tracking
</script>

<template>
  <div
    class="min-h-screen transition-colors duration-300 text-slate-900 dark:text-slate-50 flex flex-col bg-white dark:bg-slate-950"
    :class="{ dark: isDark, 'is-blueprint': isBlueprint }"
    :style="containerStyle"
  >
    <GeneratedHeader v-if="headerMode === 'generated'" :config="config" />

    <main
      class="flex-1"
      :class="
        enableContainer ? 'mx-auto max-w-5xl px-6 py-12 w-full' : 'w-full'
      "
    >
      <template v-for="section in config.sections" :key="section.id">
        <SectionWrapper
          :section="section"
          :isEditMode="isEditMode"
          :isSelected="selectedSectionId === section.id"
          @select="$emit('select-section', $event)"
          @move-up="
            $emit('reorder-section', { id: section.id, direction: 'up' })
          "
          @move-down="
            $emit('reorder-section', { id: section.id, direction: 'down' })
          "
          @duplicate="$emit('duplicateSection', $event)"
          @delete="$emit('deleteSection', $event)"
        >
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

          <StatsSection
            v-else-if="section.type === 'stats'"
            :section="section"
          />

          <TeamSection v-else-if="section.type === 'team'" :section="section" />

          <ProductListSection
            v-else-if="section.type === 'productList'"
            :section="section"
            :config="config"
          />

          <ProductDetailSection
            v-else-if="section.type === 'productDetail'"
            :section="section"
            :config="config"
          />

          <CliSection v-else-if="section.type === 'cli'" :section="section" />

          <UnknownSection v-else :section="section" />
        </SectionWrapper>
      </template>
    </main>

    <SiteFooter :config="config" />
  </div>
</template>
