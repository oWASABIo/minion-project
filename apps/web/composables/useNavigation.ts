import { computed, type ComputedRef } from "vue";
import type { PageConfig } from "@minions/shared";

export function useNavigation(config: ComputedRef<PageConfig>) {
  const siteName = computed(
    () => config.value.site?.siteName || "Generated Site"
  );
  const tagline = computed(() => config.value.site?.tagline || "");

  const menuItems = computed(() => {
    // 1. Use Real Pages if available
    if ((config.value as any).pages) {
      const pages = (config.value as any).pages;
      const order = [
        "home",
        "shop",
        "blog",
        "about",
        "contact",
        "features",
        "pricing",
      ];

      return Object.entries(pages)
        .map(([key, page]: any) => {
          const href = key === "home" ? "/" : `/${key}`;
          let label = page.meta?.title;

          if (!label) {
            label = key
              .replace(/[-_]/g, " ")
              .replace(/([a-z])([A-Z])/g, "$1 $2")
              .replace(/\b\w/g, (l: string) => l.toUpperCase());
          }
          return { key, label, href };
        })
        .filter((p) => !["cart"].includes(p.key))
        .sort((a, b) => {
          const indexA = order.indexOf(a.key.toLowerCase());
          const indexB = order.indexOf(b.key.toLowerCase());
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return a.key.localeCompare(b.key);
        });
    }

    // 2. Fallbacks based on Template
    const template = config.value.template;
    if (template === "ecommerce") {
      return [
        { label: "Home", href: "/" },
        { label: "Shop", href: "/#products" },
        { label: "About", href: "/#features" },
      ];
    }
    if (template === "blog") {
      return [
        { label: "Home", href: "/" },
        { label: "Articles", href: "/#latest-posts" },
        { label: "Subscribe", href: "/#newsletter" },
      ];
    }
    return [
      { label: "Home", href: "/" },
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ];
  });

  const showCart = computed(() => config.value.template === "ecommerce");

  const secondaryCta = computed(() => {
    const template = config.value.template;
    if (template === "landing" || template === "company") {
      return { label: "Contact Us", href: "/#contact" };
    }
    return null;
  });

  return {
    siteName,
    tagline,
    menuItems,
    showCart,
    secondaryCta,
  };
}
