<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import type { ProductListSection, PageConfig } from "@minions/shared";

const { addToCart } = useCart();

const props = defineProps<{
  section: ProductListSection;
  config?: PageConfig; // Need config for WP Base URL
}>();

const products = ref<any[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Mock products for fallback
const mockProducts = [
  {
    id: 1,
    name: "Premium Headphones",
    price: "$299.00",
    image: "/images/product-main.png",
    description: "High-fidelity wireless audio with noise cancellation.",
  },
  {
    id: 2,
    name: "Smart Watch Series 7",
    price: "$399.00",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    description: "Stay connected and healthy with our latest smart watch.",
  },
  {
    id: 3,
    name: "Ergonomic Chair",
    price: "$450.00",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
    description: "Work in comfort with our award-winning design.",
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    price: "$149.00",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b91a05c?w=800&q=80",
    description: "Tactile switches for the ultimate typing experience.",
  },
];

// Helper to normalize product data from different sources (WC Store API vs WP API vs Mock)
function normalizeProduct(p: any) {
  // WC Store API V3
  if (p.images && p.prices) {
    return {
      id: p.id,
      name: p.name,
      price: `${p.prices.currency_symbol || "$"}${p.prices.price || "0"}`,
      image: p.images[0]?.src || "",
      link: p.permalink,
      description: p.short_description || p.description || "",
    };
  }
  // WP Standard API (CPT)
  if (p.title && p.title.rendered) {
    const media = p._embedded?.["wp:featuredmedia"]?.[0];
    return {
      id: p.id,
      name: p.title.rendered,
      price: "View Details", // Standard WP posts don't have standard price field
      image: media?.source_url || "",
      link: p.link,
      description: p.excerpt?.rendered || "",
    };
  }
  // Fallback / Mock
  return {
    ...p,
    link: p.link || "/productDetail", // Ensure we link to the generated detail page
  };
}

async function fetchProducts() {
  loading.value = true;
  products.value = [];
  error.value = null;

  try {
    const baseUrl = props.config?.backend?.wordpress?.baseUrl;

    // If no WP URL, use mock
    if (!baseUrl) {
      console.log("[ProductList] No WordPress Base URL, using mock.");
      products.value = mockProducts;
      loading.value = false;
      return;
    }

    // Try WC Store API first (Best for WooCommerce)
    // endpoint: /wp-json/wc/store/v1/products
    let url = `${baseUrl}/wp-json/wc/store/v1/products?per_page=${
      props.section.maxItems || 6
    }`;

    // You can override endpoint in section config
    if (props.section.endpoint) {
      url = `${baseUrl}${props.section.endpoint}`;
    }

    console.log(`[ProductList] Fetching from ${url}`);

    // Note: In a real app we might need useFetch with cors proxy or server-side fetching
    // For now we assume client-side fetch is okay or handled by Nuxt proxy
    const res = await fetch(url);

    if (!res.ok) {
      // Fallback to standard WP posts if WC API fails (maybe it's just 'product' CPT)
      console.warn("[ProductList] WC Store API failed, trying standard WP API");
      const fallbackUrl = `${baseUrl}/wp-json/wp/v2/product?_embed&per_page=${
        props.section.maxItems || 6
      }`;
      const res2 = await fetch(fallbackUrl);
      if (!res2.ok) throw new Error("Failed to fetch products");

      const data2 = await res2.json();
      products.value = data2.map(normalizeProduct);
    } else {
      const data = await res.json();
      products.value = data.map(normalizeProduct);
    }
  } catch (err) {
    console.error("[ProductList] Fetch error:", err);
    error.value = "Failed to load products. Showing demo items.";
    products.value = mockProducts; // Fallback to mock on error to keep UI nice
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProducts();
});
</script>

<template>
  <section
    class="py-12 md:py-24 px-6 transition-colors"
    :style="{ backgroundColor: 'var(--bg-subtle)' }"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Hero/Header for Section -->
      <div
        class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
      >
        <div class="max-w-2xl">
          <h2
            class="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl transition-colors"
            style="color: var(--text-primary)"
          >
            {{ section.title || "Featured Collection" }}
          </h2>
          <p
            v-if="section.subtitle"
            class="mt-4 text-lg transition-colors"
            style="color: var(--text-secondary)"
          >
            {{ section.subtitle }}
          </p>
        </div>
        <div class="hidden md:flex gap-4">
          <!-- Fake Sort/Filter -->
          <button
            class="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Filter by
          </button>
          <button
            class="px-5 py-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Sort by: Recommended
          </button>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Sidebar (Desktop) -->
        <aside class="hidden lg:block w-64 flex-shrink-0 space-y-8">
          <div>
            <h3
              class="font-bold mb-4 transition-colors"
              style="color: var(--text-primary)"
            >
              Categories
            </h3>
            <ul class="space-y-2.5 text-slate-500 dark:text-slate-400 text-sm">
              <li
                class="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
              >
                All Products
              </li>
              <li
                class="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                New Arrivals
              </li>
              <li
                class="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Best Sellers
              </li>
              <li
                class="cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Accessories
              </li>
            </ul>
          </div>
          <div class="pt-8 border-t border-slate-200 dark:border-white/10">
            <h3
              class="font-bold mb-4 transition-colors"
              style="color: var(--text-primary)"
            >
              Price Range
            </h3>
            <div
              class="h-1 bg-slate-200 dark:bg-slate-700 rounded full relative"
            >
              <div
                class="absolute left-0 top-0 h-full w-1/2 rounded"
                :style="{ backgroundColor: 'var(--color-primary)' }"
              ></div>
            </div>
            <div class="flex justify-between mt-2 text-xs text-slate-500">
              <span>$0</span>
              <span>$500+</span>
            </div>
          </div>
        </aside>

        <!-- Product Grid -->
        <div class="flex-1">
          <div
            v-if="loading"
            class="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div
              v-for="i in section.maxItems || 6"
              :key="i"
              class="animate-pulse"
            >
              <div
                class="bg-slate-200 dark:bg-white/10 aspect-[3/4] rounded-2xl mb-4"
              ></div>
              <div
                class="h-4 bg-slate-200 dark:bg-white/10 rounded w-3/4 mb-2"
              ></div>
              <div
                class="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/2"
              ></div>
            </div>
          </div>

          <div
            v-else
            class="grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3"
          >
            <div
              v-for="product in products"
              :key="product.id"
              class="group relative"
            >
              <!-- Image -->
              <div
                class="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-white/5 relative mb-4"
              >
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="h-full w-full object-cover object-center transition duration-700 group-hover:scale-110"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center text-slate-300"
                >
                  <span class="text-4xl" :style="{ opacity: 0.5 }">🛍️</span>
                </div>

                <!-- Overlay Button -->
                <button
                  @click.stop="addToCart(product)"
                  class="absolute bottom-4 left-4 right-4 backdrop-blur font-bold py-3 rounded-xl shadow-lg translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-sm uppercase tracking-wide"
                  :style="{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                  }"
                >
                  Quick Add
                </button>
              </div>

              <!-- Content -->
              <div>
                <h3
                  class="text-lg font-bold transition-colors"
                  style="color: var(--text-primary)"
                >
                  <a :href="product.link || '#'">
                    <span aria-hidden="true" class="absolute inset-0"></span>
                    {{ product.name }}
                  </a>
                </h3>
                <div class="mt-1 flex items-center gap-2">
                  <span
                    class="font-medium transition-colors"
                    style="color: var(--text-primary)"
                    >{{ product.price }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="!loading && products.length === 0"
            class="text-center py-24 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl"
          >
            <div class="text-4xl mb-4">🔍</div>
            <h3
              class="text-xl font-medium mb-2"
              style="color: var(--text-primary)"
            >
              No products found
            </h3>
            <p class="text-slate-500">
              Try checking your WordPress/WooCommerce connection.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
