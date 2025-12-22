<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import type { ProductDetailSection, PageConfig } from "@minions/shared";
import { useRoute } from "vue-router";

const { addToCart } = useCart();

const props = defineProps<{
  section: ProductDetailSection;
  config?: PageConfig;
}>();

const route = useRoute();
const productId = route.params.id || "1"; // Fallback to '1' if no ID
const product = ref<any>(null);
const loading = ref(true);

// Mock Single Product
const mockProduct = {
  id: 1,
  name: "Premium Noise-Cancelling Headphones",
  price: "$299.00",
  sku: "HD-PH-001",
  images: [
    "/images/product-main.png",
    "/images/product-stand.png", // Reusing for gallery variety
  ],
  description: `
    <p>Experience high-fidelity audio with our premium noise-cancelling headphones. Designed for comfort and long listening sessions.</p>
    <ul>
      <li>Active Noise Cancellation</li>
      <li>30-hour battery life</li>
      <li>Ultra-soft ear cushions</li>
    </ul>
  `,
  related: [
    {
      id: 2,
      name: "Headphone Stand",
      price: "$29.00",
      image: "/images/product-stand.png",
    },
    {
      id: 3,
      name: "Audio Cable",
      price: "$15.00",
      image: "/images/product-cable.png",
    },
  ],
};

async function fetchProduct() {
  loading.value = true;
  try {
    const baseUrl = props.config?.backend?.wordpress?.baseUrl;
    if (!baseUrl) {
      console.log("[ProductDetail] No WP URL, using mock.");
      await new Promise((r) => setTimeout(r, 500)); // Simulate delay
      product.value = mockProduct;
      return;
    }

    console.log(`[ProductDetail] Fetching product ${productId}`);
    // Try WC Store API
    const url = `${baseUrl}/wp-json/wc/store/v1/products/${productId}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      product.value = {
        id: data.id,
        name: data.name,
        price: `${data.prices.currency_symbol}${data.prices.price}`,
        images: data.images.map((img: any) => img.src), // WC returns array of images
        description: data.description,
        sku: data.sku,
        related: data.related_ids ? [] : [], // WC Store API might need separate call for related, skipping for now
      };
    } else {
      // Fallback to standard WP Post if not found (maybe it's a 'product' CPT)
      console.warn("[ProductDetail] WC API failed, trying WP Post");
      const url2 = `${baseUrl}/wp-json/wp/v2/product/${productId}?_embed`;
      const res2 = await fetch(url2);
      if (res2.ok) {
        const data = await res2.json();
        const media = data._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
        product.value = {
          id: data.id,
          name: data.title.rendered,
          price: "View Details",
          images: media ? [media] : [],
          description: data.content.rendered,
          related: [],
        };
      } else {
        throw new Error("Product not found");
      }
    }
  } catch (err) {
    console.error("[ProductDetail] Fetch failed", err);
    product.value = mockProduct; // Fallback to mock
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchProduct();
});

// Update SEO Meta when product is loaded
watch(
  () => product.value,
  (p) => {
    if (p) {
      const siteName = props.config?.site?.siteName || "Minions Site";
      const title = `${p.name} | ${siteName}`;
      const description = p.description?.replace(/<[^>]*>/g, "").slice(0, 160); // Strip HTML and truncate
      const image = p.images?.[0];

      useSeoMeta({
        title,
        ogTitle: title,
        description,
        ogDescription: description,
        ogImage: image,
        twitterCard: "summary_large_image",
        twitterTitle: title,
        twitterDescription: description,
        twitterImage: image,
      });
    }
  }
);
</script>

<template>
  <section
    class="py-24 px-6 transition-colors"
    :style="{ backgroundColor: 'var(--bg-page)' }"
  >
    <div class="mx-auto max-w-7xl">
      <!-- Loading State -->
      <div
        v-if="loading"
        class="animate-pulse flex flex-col md:flex-row gap-12"
      >
        <div
          class="w-full md:w-1/2 bg-slate-200 dark:bg-white/10 aspect-square rounded-3xl"
        ></div>
        <div class="w-full md:w-1/2 space-y-4">
          <div class="h-8 bg-slate-200 dark:bg-white/10 w-3/4 rounded"></div>
          <div class="h-6 bg-slate-200 dark:bg-white/10 w-1/4 rounded"></div>
          <div class="h-32 bg-slate-200 dark:bg-white/10 rounded"></div>
        </div>
      </div>

      <!-- Product Content -->
      <div v-else-if="product">
        <!-- Breadcrumbs -->
        <nav
          class="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap"
        >
          <a
            href="#"
            class="transition-colors hover:opacity-80"
            style="color: var(--text-secondary)"
            >Home</a
          >
          <span class="text-slate-300">/</span>
          <a
            href="#"
            class="transition-colors hover:opacity-80"
            style="color: var(--text-secondary)"
            >Shop</a
          >
          <span class="text-slate-300">/</span>
          <span
            class="font-medium truncate transition-colors"
            style="color: var(--text-primary)"
            >{{ product.name }}</span
          >
        </nav>

        <div class="flex flex-col lg:flex-row gap-12 xl:gap-20">
          <!-- Image Gallery (Left) -->
          <div class="w-full lg:w-1/2 space-y-6">
            <div
              class="aspect-square rounded-[2rem] overflow-hidden bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative group"
            >
              <img
                :src="product.images[0]"
                :alt="product.name"
                class="w-full h-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div
                class="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                New Arrival
              </div>
            </div>
            <div
              v-if="product.images.length > 1"
              class="grid grid-cols-4 gap-4"
            >
              <div
                v-for="(img, idx) in product.images.slice(1)"
                :key="idx"
                class="aspect-square rounded-2xl overflow-hidden cursor-pointer border border-transparent hover:border-indigo-600 transition-all"
              >
                <img :src="img" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Product Info (Right) -->
          <div class="w-full lg:w-1/2 flex flex-col pt-4">
            <div class="mb-4 flex items-center gap-3">
              <span
                class="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wide"
              >
                In Stock
              </span>
              <span
                class="text-sm font-medium text-slate-400 uppercase tracking-wider"
              >
                {{ product.sku || "SKU: P-001" }}
              </span>
            </div>

            <h1
              class="text-4xl lg:text-5xl font-bold mb-6 leading-tight transition-colors"
              style="color: var(--text-primary)"
            >
              {{ product.name }}
            </h1>

            <div class="flex items-baseline gap-4 mb-8">
              <span
                class="text-4xl font-bold transition-colors"
                style="color: var(--text-primary)"
              >
                {{ product.price }}
              </span>
              <span class="text-xl text-slate-400 line-through decoration-2">
                $500.00
              </span>
            </div>

            <div
              class="prose dark:prose-invert prose-lg mb-10 max-w-none leading-relaxed transition-colors"
              style="color: var(--text-secondary)"
              v-html="product.description"
            ></div>

            <div
              class="mt-auto pt-8 border-t border-slate-200 dark:border-white/10 space-y-6"
            >
              <div>
                <label
                  class="block text-sm font-bold mb-3 transition-colors"
                  style="color: var(--text-primary)"
                  >Select Size</label
                >
                <div class="flex flex-wrap gap-3">
                  <button
                    class="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all"
                  >
                    S
                  </button>
                  <button
                    class="w-12 h-12 rounded-xl border-2 flex items-center justify-center font-bold shadow-sm"
                    :style="{
                      borderColor: 'var(--color-primary)',
                      color: 'var(--color-primary)',
                    }"
                  >
                    M
                  </button>
                  <button
                    class="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all"
                  >
                    L
                  </button>
                  <button
                    class="w-12 h-12 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center font-medium hover:border-indigo-600 hover:text-indigo-600 transition-all"
                  >
                    XL
                  </button>
                </div>
              </div>

              <div class="flex gap-4">
                <div
                  class="flex items-center border rounded-2xl"
                  :style="{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                  }"
                >
                  <button
                    class="px-5 py-4 text-xl hover:text-indigo-600 transition-colors"
                  >
                    -
                  </button>
                  <span class="w-8 text-center font-bold">1</span>
                  <button
                    class="px-5 py-4 text-xl hover:text-indigo-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  @click="addToCart(product)"
                  class="flex-1 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all shadow-xl active:scale-95"
                  :style="{
                    backgroundColor: 'var(--color-primary)',
                  }"
                >
                  Add to Cart
                </button>
              </div>

              <p class="text-xs text-center text-slate-400">
                Free shipping on all orders over $100. Secure checkout.
              </p>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div
          v-if="
            props.section.showRelated &&
            product.related &&
            product.related.length > 0
          "
          class="mt-24 border-t border-slate-200 dark:border-white/10 pt-16"
        >
          <h2
            class="text-2xl font-bold mb-8 transition-colors"
            style="color: var(--text-primary)"
          >
            You may also like
          </h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              v-for="rel in product.related"
              :key="rel.id"
              class="group bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden hover:shadow-lg transition-all"
            >
              <div
                class="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden"
              >
                <img
                  :src="rel.image"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div class="p-4">
                <div
                  class="font-bold mb-1 transition-colors"
                  style="color: var(--text-primary)"
                >
                  {{ rel.name }}
                </div>
                <div class="text-slate-500">{{ rel.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
