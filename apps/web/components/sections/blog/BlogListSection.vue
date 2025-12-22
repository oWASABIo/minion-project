<script setup lang="ts">
import { computed } from "vue";
import type { BlogListSection } from "@minions/shared";

const props = defineProps<{
  section: BlogListSection;
  posts: any[];
  loading?: boolean;
}>();

const maxItems = computed(() => props.section.maxItems ?? 3);
const items = computed(() => (props.posts || []).slice(0, maxItems.value));

function getImageUrl(post: any) {
  // 1. Direct URL (Mock)
  if (post.imageUrl) return post.imageUrl;

  // 2. WP Embedded
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return media?.source_url || null;
}
</script>

<template>
  <section :id="section.id" class="py-24 px-6">
    <div class="mx-auto max-w-5xl">
      <div
        class="flex flex-col md:flex-row items-end justify-between gap-4 mb-12"
      >
        <div>
          <h2
            class="text-3xl font-bold tracking-tight md:text-4xl transition-colors"
            style="color: var(--text-primary)"
          >
            {{ section.title || "Blog" }}
          </h2>
          <p
            v-if="section.subtitle"
            class="mt-4 text-lg max-w-2xl transition-colors"
            style="color: var(--text-secondary)"
          >
            {{ section.subtitle }}
          </p>
        </div>

        <div
          v-if="loading"
          class="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-full"
        >
          <span
            class="inline-block h-2 w-2 animate-pulse rounded-full bg-primary"
          ></span>
          Updating feed...
        </div>
      </div>

      <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="post in items"
          :key="post?.id"
          class="group flex flex-col overflow-hidden rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1"
          :style="{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }"
        >
          <div
            class="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800"
          >
            <img
              v-if="getImageUrl(post)"
              :src="getImageUrl(post)"
              alt=""
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-slate-400"
            >
              <svg
                class="w-12 h-12 opacity-20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          <div class="flex flex-1 flex-col p-6">
            <h3
              class="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors"
              style="color: var(--text-primary)"
              v-html="post?.title?.rendered || 'Untitled Post'"
            ></h3>
            <p
              class="mt-4 flex-1 text-sm leading-relaxed line-clamp-3 transition-colors"
              style="color: var(--text-secondary)"
              v-html="post?.excerpt?.rendered || 'No description available.'"
            ></p>

            <a
              class="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
              :href="post.link && post.link !== '#' ? post.link : '/postDetail'"
              target="_blank"
              rel="noreferrer"
            >
              Read Article
              <svg
                class="h-4 w-4 transition-transform group-hover:translate-x-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clip-rule="evenodd"
                />
              </svg>
            </a>
          </div>
        </article>
      </div>

      <div
        v-if="!loading && items.length === 0"
        class="mt-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-white/10 p-12"
      >
        <p class="text-slate-500 dark:text-slate-400">
          No posts found. check your WordPress configuration.
        </p>
      </div>
    </div>
  </section>
</template>
