<script setup lang="ts">
import { computed, ref } from "vue";
import type { Section } from "@minions/shared";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";
import { CURATED_THEMES } from "../../../../packages/shared/src/theme/themes";
import { usePreviewSync } from "~/composables/usePreviewSync";
import InternalLinkPicker from "./InternalLinkPicker.vue";
import { Cog6ToothIcon, XMarkIcon, PlusIcon } from "@heroicons/vue/24/outline";

const store = useBuilderStore();
const { selectedSection } = storeToRefs(store);
const { forceSyncPreview } = usePreviewSync();

const props = defineProps<{
  editSiteConfig?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Global Site Config helpers
function updateSiteConfig(key: string, value: any) {
  if (!store.projectConfig) return;
  store.updateGlobalSiteConfig({ [key]: value });
  forceSyncPreview();
}

function updateMenuItem(index: number, field: string, value: any) {
  const items = [...(store.projectConfig?.site?.menuItems || [])];
  if (!items[index]) return;
  items[index] = { ...items[index], [field]: value };
  updateSiteConfig("menuItems", items);
}

function addMenuItem() {
  const items = [...(store.projectConfig?.site?.menuItems || [])];
  items.push({ label: "New Link", href: "/" });
  updateSiteConfig("menuItems", items);
}

function removeMenuItem(index: number) {
  const items = [...(store.projectConfig?.site?.menuItems || [])];
  items.splice(index, 1);
  updateSiteConfig("menuItems", items);
}

// Helper to update specific field
function updateField(key: string, value: any) {
  if (!selectedSection.value) return;

  const section = JSON.parse(JSON.stringify(selectedSection.value));

  if (key.includes(".")) {
    const parts = key.split(".");
    let current = section;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      // Handle array indices if any in the path (e.g. items[0].title)
      const match = part.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        const [, prop, index] = match;
        if (!current[prop]) current[prop] = [];
        if (!current[prop][index]) current[prop][index] = {};
        current = current[prop][index];
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    }
    const lastKey = parts[parts.length - 1];
    // Handle array index in last key too if needed, but usually it's a property
    const lastMatch = lastKey.match(/^(.+)\[(\d+)\]$/);
    if (lastMatch) {
      const [, prop, index] = lastMatch;
      if (!current[prop]) current[prop] = [];
      current[prop][index] = value;
    } else {
      current[lastKey] = value;
    }
  } else {
    section[key] = value;
  }

  store.updateSection(section as Section);
  forceSyncPreview();
}

function updateItemField(
  listKey: string,
  index: number | string,
  field: string,
  value: any
) {
  if (!selectedSection.value) return;
  const list = [...((selectedSection.value as any)[listKey] || [])];
  const idx = Number(index);
  if (!list[idx]) return;

  if (field.includes(".")) {
    const [parent, child] = field.split(".");
    list[idx] = {
      ...list[idx],
      [parent]: { ...list[idx][parent], [child]: value },
    };
  } else {
    list[idx] = { ...list[idx], [field]: value };
  }

  updateField(listKey, list);
}

function removeItem(listKey: string, index: number | string) {
  if (!selectedSection.value) return;
  const list = [...((selectedSection.value as any)[listKey] || [])];
  list.splice(Number(index), 1);
  updateField(listKey, list);
}

function addItem(listKey: string) {
  if (!selectedSection.value) return;
  const list = [...((selectedSection.value as any)[listKey] || [])];

  if (listKey === "plans") {
    list.push({ name: "Plan", price: "$10", features: [] });
  } else if (listKey === "members") {
    list.push({ name: "Member", role: "Role" });
  } else if (selectedSection.value.type === "faq") {
    list.push({ question: "New Question", answer: "Answer" });
  } else if (selectedSection.value.type === "testimonials") {
    list.push({
      quote: "This is a new testimonial.",
      name: "Customer Name",
      role: "Job Title",
    });
  } else if (selectedSection.value.type === "stats") {
    list.push({ value: "100+", label: "New Stat" });
  } else if (selectedSection.value.type === "productList") {
    list.push({
      name: "New Product",
      price: "$0.00",
      image: "/images/product-main.png",
    });
  } else {
    list.push({ title: "New Item", description: "Description" });
  }

  updateField(listKey, list);
}

const containerRef = ref<HTMLElement | null>(null);

function getField(key: string): any {
  if (!selectedSection.value) return undefined;

  const parts = key.split(".");
  let current: any = selectedSection.value;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    // Check for array index: something[0]
    const match = part.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      const [, prop, index] = match;
      current = current[prop]?.[Number(index)];
    } else {
      current = current[part];
    }
  }

  return current;
}

function focusField(key: string) {
  if (!containerRef.value) return;
  setTimeout(() => {
    const el = containerRef.value?.querySelector(
      `[data-field-key="${key}"]`
    ) as HTMLElement;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-indigo-500", "bg-indigo-500/10");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-indigo-500", "bg-indigo-500/10");
      }, 1000);
    }
  }, 100);
}

function getListKey(type: string): string {
  if (type === "team") return "members";
  if (type === "pricing") return "plans";
  return "items";
}

function updateStyle(key: string, value: any) {
  if (!selectedSection.value) return;
  const styles = {
    ...((selectedSection.value as any).styles || {}),
    [key]: value,
  };
  updateField("styles", styles);
}

const activeTab = ref<"content" | "design">("content");

defineExpose({ focusField });
</script>

<template>
  <div
    ref="containerRef"
    class="flex flex-col h-full overflow-hidden bg-slate-900"
  >
    <!-- Component Header -->
    <div
      class="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50 shrink-0"
    >
      <h2 class="text-sm font-bold text-white flex items-center gap-2">
        <template v-if="editSiteConfig"> Site Settings </template>
        <template v-else-if="selectedSection">
          <span class="capitalize">{{ selectedSection.type }}</span>
        </template>
        <template v-else>Editor</template>
      </h2>
      <button
        @click="$emit('close')"
        class="text-slate-400 hover:text-white transition-colors"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
      <!-- SITE GLOBAL SETTINGS MODE -->
      <div v-if="editSiteConfig" class="space-y-6">
        <!-- Curated Themes Section -->
        <div class="space-y-4">
          <label
            class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
          >
            Curated Themes
          </label>
          <div class="grid grid-cols-1 gap-3">
            <button
              v-for="theme in CURATED_THEMES"
              :key="theme.id"
              @click="store.applyTheme(theme.id)"
              class="flex items-center gap-4 p-3 rounded-2xl border-2 transition-all group overflow-hidden relative"
              :class="
                store.projectConfig?.site?.primaryColor ===
                  theme.primaryColor &&
                store.projectConfig?.site?.themeMode === theme.themeMode
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-white/5 hover:border-indigo-500/50 hover:bg-white/5'
              "
            >
              <!-- Preview Swatch -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner relative z-10 shrink-0"
                :style="{
                  backgroundColor:
                    theme.themeMode === 'dark' ? '#020617' : '#ffffff',
                  border:
                    '1px solid ' +
                    (theme.themeMode === 'dark'
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.1)'),
                }"
              >
                <div
                  class="w-5 h-5 rounded-full"
                  :style="{ backgroundColor: theme.primaryColor }"
                ></div>
              </div>

              <div class="text-left relative z-10 flex-1 min-w-0">
                <div class="font-bold text-xs text-white truncate">
                  {{ theme.name }}
                </div>
                <div class="text-[10px] text-slate-400 capitalize truncate">
                  {{ theme.themeMode }} mode •
                  {{ theme.fontFamily.split(",")[0].replace(/'/g, "") }}
                </div>
              </div>

              <!-- Selection Indicator -->
              <div
                v-if="
                  store.projectConfig?.site?.primaryColor ===
                    theme.primaryColor &&
                  store.projectConfig?.site?.themeMode === theme.themeMode
                "
                class="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500"
              ></div>
            </button>
          </div>
        </div>

        <!-- Branding Section -->
        <div class="space-y-3">
          <label
            class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >Branding</label
          >
          <BaseInput
            label="Site Name"
            :model-value="store.projectConfig?.site?.siteName"
            @update:model-value="(val) => updateSiteConfig('siteName', val)"
          />
          <BaseInput
            label="Tagline"
            :model-value="store.projectConfig?.site?.tagline"
            @update:model-value="(val) => updateSiteConfig('tagline', val)"
          />
        </div>

        <!-- E-commerce Visibility -->
        <div class="space-y-3">
          <label
            class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
            >E-commerce</label
          >
          <div
            class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 ring-1 ring-white/10"
          >
            <span class="text-xs font-medium text-slate-300"
              >Show Shopping Cart</span
            >
            <button
              @click="
                updateSiteConfig(
                  'showCart',
                  !store.projectConfig?.site?.showCart
                )
              "
              class="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="
                store.projectConfig?.site?.showCart
                  ? 'bg-indigo-600'
                  : 'bg-slate-700'
              "
            >
              <span
                class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="
                  store.projectConfig?.site?.showCart
                    ? 'translate-x-4'
                    : 'translate-x-0'
                "
              />
            </button>
          </div>
        </div>

        <!-- Navbar Links Manager -->
        <div class="space-y-3 pb-8">
          <div class="flex items-center justify-between">
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest"
              >Navbar Links</label
            >
            <button
              @click="addMenuItem"
              class="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <PlusIcon class="w-3 h-3" />
              ADD LINK
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(item, idx) in store.projectConfig?.site?.menuItems || []"
              :key="idx"
              class="p-3 rounded-lg bg-slate-800/50 ring-1 ring-white/10 space-y-2 relative group"
            >
              <button
                @click="removeMenuItem(idx)"
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
              >
                <XMarkIcon class="w-3 h-3" />
              </button>
              <BaseInput
                label="Label"
                :model-value="item.label"
                @update:model-value="(val) => updateMenuItem(idx, 'label', val)"
                size="sm"
              />
              <div class="flex gap-2 items-end">
                <div class="flex-1">
                  <BaseInput
                    label="Link"
                    :model-value="item.href"
                    @update:model-value="
                      (val) => updateMenuItem(idx, 'href', val)
                    "
                    size="sm"
                  />
                </div>
                <InternalLinkPicker
                  @select="(path) => updateMenuItem(idx, 'href', path)"
                />
              </div>
            </div>
            <div
              v-if="!store.projectConfig?.site?.menuItems?.length"
              class="text-[10px] text-slate-500 italic p-4 text-center border border-dashed border-white/5 rounded-lg"
            >
              Using auto-generated links from pages. Add custom links above to
              override.
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION EDITING MODE -->
      <div v-else-if="selectedSection" class="space-y-6">
        <!-- Tabs Header -->
        <div class="flex items-center gap-4 border-b border-white/10 pb-3">
          <button
            @click="activeTab = 'content'"
            class="text-xs font-bold uppercase tracking-wider transition-colors"
            :class="
              activeTab === 'content'
                ? 'text-white border-b-2 border-indigo-500 pb-1'
                : 'text-slate-500 hover:text-slate-300'
            "
          >
            Content
          </button>
          <button
            @click="activeTab = 'design'"
            class="text-xs font-bold uppercase tracking-wider transition-colors"
            :class="
              activeTab === 'design'
                ? 'text-white border-b-2 border-indigo-500 pb-1'
                : 'text-slate-500 hover:text-slate-300'
            "
          >
            Design
          </button>
        </div>

        <!-- CONTENT TAB -->
        <div v-show="activeTab === 'content'" class="space-y-6">
          <!-- Specialized: Product Detail View -->
          <div
            v-if="selectedSection.type === 'productDetail'"
            class="space-y-3"
          >
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block"
              >Product Details</label
            >
            <div
              class="space-y-3 p-3 rounded-lg bg-slate-800/50 ring-1 ring-white/10"
            >
              <BaseInput
                label="Name"
                :model-value="getField('product.name')"
                @update:model-value="(val) => updateField('product.name', val)"
              />
              <div class="grid grid-cols-2 gap-2">
                <BaseInput
                  label="Sale Price"
                  :model-value="getField('product.price')"
                  @update:model-value="
                    (val) => updateField('product.price', val)
                  "
                />
                <BaseInput
                  label="Original Price"
                  :model-value="getField('product.originalPrice')"
                  @update:model-value="
                    (val) => updateField('product.originalPrice', val)
                  "
                  placeholder="e.g. $599"
                />
              </div>
              <BaseTextarea
                label="Description"
                :model-value="getField('product.description')"
                @update:model-value="
                  (val) => updateField('product.description', val)
                "
                :rows="3"
              />
              <!-- Product Image with Preview -->
              <div class="space-y-2">
                <BaseInput
                  label="Image URL"
                  :model-value="
                    getField('product.image') || getField('product.images[0]')
                  "
                  @update:model-value="
                    (val) => updateField('product.image', val)
                  "
                />
                <div
                  v-if="
                    getField('product.image') || getField('product.images[0]')
                  "
                  class="relative h-24 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20"
                >
                  <img
                    :src="
                      getField('product.image') || getField('product.images[0]')
                    "
                    class="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Common Text Fields -->
          <div v-if="'eyebrow' in selectedSection">
            <BaseInput
              label="Eyebrow"
              :model-value="getField('eyebrow')"
              @update:model-value="(val) => updateField('eyebrow', val)"
            />
          </div>

          <div
            v-if="'headline' in selectedSection || 'title' in selectedSection"
          >
            <BaseTextarea
              label="Headline / Title"
              :rows="3"
              :model-value="getField('headline') || getField('title')"
              @update:model-value="
                (val) =>
                  updateField(
                    'headline' in selectedSection! ? 'headline' : 'title',
                    val
                  )
              "
            />
          </div>

          <div
            v-if="
              'subheadline' in selectedSection || 'subtitle' in selectedSection
            "
          >
            <BaseTextarea
              label="Subheadline / Subtitle"
              :rows="2"
              :model-value="getField('subheadline') || getField('subtitle')"
              @update:model-value="
                (val) =>
                  updateField(
                    'subheadline' in selectedSection!
                      ? 'subheadline'
                      : 'subtitle',
                    val
                  )
              "
            />
          </div>

          <div v-if="'description' in selectedSection">
            <BaseTextarea
              label="Description"
              :rows="3"
              :model-value="getField('description')"
              @update:model-value="(val) => updateField('description', val)"
            />
          </div>

          <!-- Section Main Image (Hero, etc.) -->
          <div v-if="'image' in selectedSection" class="space-y-2">
            <BaseInput
              label="Section Image (URL)"
              :model-value="getField('image')"
              @update:model-value="(val) => updateField('image', val)"
              placeholder="https://..."
            />
            <div
              v-if="getField('image')"
              class="relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/20 group/img"
            >
              <img
                :src="getField('image')"
                class="h-full w-full object-cover"
              />
              <button
                @click="updateField('image', '')"
                class="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500"
              >
                <XMarkIcon class="w-3 h-3" />
              </button>
            </div>
          </div>

          <!-- Primary CTA with Action Picker -->
          <div
            v-if="'primaryCta' in selectedSection"
            class="space-y-3 p-3 rounded-lg bg-slate-800/50 ring-1 ring-white/10"
          >
            <label
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Primary Button</label
            >
            <div class="grid grid-cols-2 gap-2">
              <BaseInput
                label="Label"
                :model-value="getField('primaryCta.label')"
                @update:model-value="
                  (val) =>
                    updateField('primaryCta', {
                      ...getField('primaryCta'),
                      label: val,
                    })
                "
              />
              <div>
                <label
                  class="text-[10px] text-slate-500 block mb-1 uppercase font-bold"
                  >Action</label
                >
                <select
                  :value="getField('primaryCta.action') || 'link'"
                  @change="(e) => updateField('primaryCta', { ...getField('primaryCta'), action: (e.target as HTMLSelectElement).value })"
                  class="w-full bg-slate-900 text-slate-200 text-xs rounded border border-white/10 p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="link">Navigate to Link</option>
                  <option value="add-to-cart">Add to Cart</option>
                </select>
              </div>
            </div>
            <div v-if="getField('primaryCta.action') === 'add-to-cart'">
              <BaseInput
                label="Product ID / SKU"
                placeholder="e.g. prod_001"
                :model-value="getField('primaryCta.productId')"
                @update:model-value="
                  (val) =>
                    updateField('primaryCta', {
                      ...getField('primaryCta'),
                      productId: val,
                    })
                "
              />
            </div>
            <div v-else class="flex gap-2 items-end">
              <div class="flex-1">
                <BaseInput
                  label="Link"
                  :model-value="getField('primaryCta.href')"
                  @update:model-value="
                    (val) =>
                      updateField('primaryCta', {
                        ...getField('primaryCta'),
                        href: val,
                      })
                  "
                />
              </div>
              <InternalLinkPicker
                @select="
                  (path) =>
                    updateField('primaryCta', {
                      ...getField('primaryCta'),
                      href: path,
                    })
                "
              />
            </div>
          </div>

          <!-- Secondary CTA -->
          <div
            v-if="'secondaryCta' in selectedSection"
            class="space-y-3 p-3 rounded-lg bg-slate-800/50 ring-1 ring-white/10"
          >
            <label
              class="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >Secondary Button</label
            >
            <div class="grid grid-cols-2 gap-2">
              <BaseInput
                label="Label"
                :model-value="getField('secondaryCta.label')"
                @update:model-value="
                  (val) =>
                    updateField('secondaryCta', {
                      ...getField('secondaryCta'),
                      label: val,
                    })
                "
              />
              <div>
                <label
                  class="text-[10px] text-slate-500 block mb-1 uppercase font-bold"
                  >Action</label
                >
                <select
                  :value="getField('secondaryCta.action') || 'link'"
                  @change="(e) => updateField('secondaryCta', { ...getField('secondaryCta'), action: (e.target as HTMLSelectElement).value })"
                  class="w-full bg-slate-900 text-slate-200 text-xs rounded border border-white/10 p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="link">Navigate to Link</option>
                  <option value="add-to-cart">Add to Cart</option>
                </select>
              </div>
            </div>
            <div v-if="getField('secondaryCta.action') === 'add-to-cart'">
              <BaseInput
                label="Product ID / SKU"
                placeholder="e.g. prod_001"
                :model-value="getField('secondaryCta.productId')"
                @update:model-value="
                  (val) =>
                    updateField('secondaryCta', {
                      ...getField('secondaryCta'),
                      productId: val,
                    })
                "
              />
            </div>
            <div v-else class="flex gap-2 items-end">
              <div class="flex-1">
                <BaseInput
                  label="Link"
                  :model-value="getField('secondaryCta.href')"
                  @update:model-value="
                    (val) =>
                      updateField('secondaryCta', {
                        ...getField('secondaryCta'),
                        href: val,
                      })
                  "
                />
              </div>
              <InternalLinkPicker
                @select="
                  (path) =>
                    updateField('secondaryCta', {
                      ...getField('secondaryCta'),
                      href: path,
                    })
                "
              />
            </div>
          </div>

          <!-- List Items Manager (Features, Products, Pricing, etc.) -->
          <div
            v-for="listKey in [getListKey(selectedSection.type)]"
            :key="listKey"
          >
            <div
              v-if="listKey in selectedSection && Array.isArray((selectedSection as any)[listKey])"
            >
              <label
                class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2"
                >{{ listKey === "items" ? "List Items" : listKey }}</label
              >
              <div class="space-y-3">
                <div
                  v-for="(item, index) in (selectedSection as any)[listKey]"
                  :key="index"
                  class="relative rounded-lg bg-slate-800/50 p-3 ring-1 ring-white/10 group"
                >
                  <button
                    @click="removeItem(listKey, index)"
                    class="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>

                  <div class="space-y-2 pr-6">
                    <!-- Pricing Plan -->
                    <template v-if="selectedSection.type === 'pricing'">
                      <BaseInput
                        label="Plan Name"
                        :model-value="item.name"
                        @update:model-value="
                          (val) => updateItemField(listKey, index, 'name', val)
                        "
                      />
                      <div class="flex gap-2">
                        <BaseInput
                          label="Price"
                          :model-value="item.price"
                          @update:model-value="
                            (val) =>
                              updateItemField(listKey, index, 'price', val)
                          "
                        />
                        <BaseInput
                          label="Period"
                          :model-value="item.period"
                          @update:model-value="
                            (val) =>
                              updateItemField(listKey, index, 'period', val)
                          "
                        />
                      </div>
                    </template>

                    <!-- Product Item (List) -->
                    <template
                      v-else-if="selectedSection.type === 'productList'"
                    >
                      <BaseInput
                        label="Product Name"
                        :model-value="item.name"
                        @update:model-value="
                          (val) => updateItemField(listKey, index, 'name', val)
                        "
                      />
                      <div class="grid grid-cols-2 gap-2">
                        <BaseInput
                          label="Sale Price"
                          :model-value="item.price"
                          @update:model-value="
                            (val) =>
                              updateItemField(listKey, index, 'price', val)
                          "
                        />
                        <BaseInput
                          label="Original"
                          :model-value="item.originalPrice"
                          @update:model-value="
                            (val) =>
                              updateItemField(
                                listKey,
                                index,
                                'originalPrice',
                                val
                              )
                          "
                        />
                      </div>
                      <div class="space-y-2">
                        <BaseInput
                          label="Image URL"
                          :model-value="item.image"
                          @update:model-value="
                            (val) =>
                              updateItemField(listKey, index, 'image', val)
                          "
                        />
                        <div
                          v-if="item.image"
                          class="relative h-16 w-full rounded border border-white/10 bg-black/20 overflow-hidden"
                        >
                          <img
                            :src="item.image"
                            class="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    </template>

                    <!-- Generic: Title and Value -->
                    <template v-else>
                      <BaseInput
                        :label="'title' in item ? 'Title' : 'label'"
                        :model-value="item.title || item.label"
                        @update:model-value="
                          (val) =>
                            updateItemField(
                              listKey,
                              index,
                              'title' in item ? 'title' : 'label',
                              val
                            )
                        "
                      />
                      <BaseTextarea
                        v-if="'description' in item"
                        label="Description"
                        :model-value="item.description"
                        @update:model-value="
                          (val) =>
                            updateItemField(listKey, index, 'description', val)
                        "
                        :rows="2"
                      />
                    </template>
                  </div>
                </div>
                <button
                  @click="addItem(listKey)"
                  class="w-full rounded-lg border border-dashed border-white/20 p-2 text-xs text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  + Add Item
                </button>
              </div>
            </div>
          </div>

          <!-- Variant Selector -->
          <div v-if="'variant' in selectedSection">
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2"
              >Layout</label
            >
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="v in ['center', 'split', 'grid', 'boxed']"
                :key="v"
                @click="updateField('variant', v)"
                class="px-2 py-1 text-[10px] font-medium rounded border transition-all"
                :class="
                  getField('variant') === v
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                "
              >
                {{ v.toUpperCase() }}
              </button>
            </div>
          </div>
        </div>

        <!-- DESIGN TAB -->
        <div v-show="activeTab === 'design'" class="space-y-6">
          <div>
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3"
              >Colors</label
            >
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-300">Background</span>
                <input
                  type="color"
                  :value="getField('styles.backgroundColor') || '#111827'"
                  @input="e => updateStyle('backgroundColor', (e.target as HTMLInputElement).value)"
                  class="w-8 h-8 rounded shrink-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-300">Text</span>
                <input
                  type="color"
                  :value="getField('styles.textColor') || '#ffffff'"
                  @input="e => updateStyle('textColor', (e.target as HTMLInputElement).value)"
                  class="w-8 h-8 rounded shrink-0 border-0 bg-transparent cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div>
            <label
              class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3"
              >Spacing</label
            >
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="s in ['none', 'sm', 'md', 'lg']"
                :key="s"
                @click="updateStyle('spacing', s)"
                class="px-2 py-2 text-[10px] font-bold uppercase rounded-lg border transition-all"
                :class="
                  getField('styles.spacing') === s ||
                  (!getField('styles.spacing') && s === 'md')
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'
                "
              >
                {{ s }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
