import { ref, computed, watch, type ComputedRef } from "vue";
import type { PageConfig, Section, BlogListSection } from "@minions/shared";
import { resolveWordpressConfig } from "~/utils/backend";

export function useBlogData(config: ComputedRef<PageConfig>) {
  const blogDataMap = ref<Record<string, any[]>>({});
  const blogLoadingMap = ref<Record<string, boolean>>({});

  const wp = computed(() => resolveWordpressConfig(config.value));

  function isBlogListSection(s: Section): s is BlogListSection {
    return s.type === "blogList";
  }

  const MOCK_POSTS = [
    {
      id: 1,
      title: { rendered: "Getting Started with AI Web Building (Mock)" },
      excerpt: {
        rendered:
          "<p>This is a mockup post because no WordPress URL was provided.</p>",
      },
      link: "#",
      date: new Date().toISOString(),
      imageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 2,
      title: { rendered: "Top 5 Design Trends for 2025 (Mock)" },
      excerpt: {
        rendered:
          "<p>Mockup data to visualize how your blog section will look.</p>",
      },
      link: "#",
      date: new Date().toISOString(),
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: 3,
      title: { rendered: "Why Nuxt 3 is the Best Choice (Mock)" },
      excerpt: {
        rendered: "<p>Another sample post found in the fallback dataset.</p>",
      },
      link: "#",
      date: new Date().toISOString(),
      imageUrl:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800",
    },
  ];

  async function fetchBlogPosts(sec: BlogListSection) {
    const baseUrl = wp.value?.baseUrl || "";
    const restBase = wp.value?.restBase || "/wp-json/wp/v2";
    const endpoint = sec.source?.endpoint || "";

    if (!baseUrl) {
      blogDataMap.value[sec.id] = MOCK_POSTS;
      return;
    }

    blogLoadingMap.value[sec.id] = true;

    try {
      const posts = await $fetch<any[]>("/api/wp-posts", {
        query: { baseUrl, restBase, endpoint },
      });

      if (Array.isArray(posts) && posts.length > 0) {
        blogDataMap.value[sec.id] = posts;
      } else {
        blogDataMap.value[sec.id] = MOCK_POSTS;
      }
    } catch (e) {
      console.error("Failed to fetch blog posts:", e);
      blogDataMap.value[sec.id] = MOCK_POSTS;
    } finally {
      blogLoadingMap.value[sec.id] = false;
    }
  }

  const blogKey = computed(() => {
    const sections = (config.value.sections || []) as Section[];
    const blogs = sections.filter(isBlogListSection);
    return blogs
      .map((s) => `${s.id}:${s.source?.endpoint || ""}:${s.maxItems ?? ""}`)
      .join("|");
  });

  watch(
    [
      () => config.value.backend?.wordpress?.baseUrl,
      () => config.value.backend?.wordpress?.restBase,
      blogKey,
    ],
    async () => {
      const sections = (config.value.sections || []) as Section[];
      const blogs = sections.filter(isBlogListSection);
      await Promise.all(blogs.map(fetchBlogPosts));
    },
    { immediate: true }
  );

  return {
    blogDataMap,
    blogLoadingMap,
    fetchBlogPosts,
  };
}
