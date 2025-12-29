<script setup lang="ts">
import { computed, ref } from "vue";
import type { Section } from "@minions/shared";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";
import { usePreviewSync } from "~/composables/usePreviewSync";

const store = useBuilderStore();
const { selectedSection } = storeToRefs(store);
const { forceSyncPreview } = usePreviewSync();

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Helper to update specific field
function updateField(key: string, value: any) {
  if (!selectedSection.value) return;
  store.updateSection({ ...selectedSection.value, [key]: value } as Section);

  // Force sync to bypass any throttle during active editing if needed
  // (Optional, syncPreview is usually enough, but let's be safe for now)
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
  } else {
    list.push({ title: "New Item", description: "Description" });
  }

  updateField(listKey, list);
}

const containerRef = ref<HTMLElement | null>(null);

function getField(key: string): any {
  if (!selectedSection.value) return undefined;
  if (key.includes(".")) {
    const [parent, child] = key.split(".");
    return (selectedSection.value as any)[parent]?.[child];
  }
  return (selectedSection.value as any)[key];
}

function focusField(key: string) {
  if (!containerRef.value) return;
  // Use timeout to allow simple transitions or rendering if needed
  setTimeout(() => {
    const el = containerRef.value?.querySelector(
      `[data-field-key="${key}"]`
    ) as HTMLElement;
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Flash effect
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

// Helper to update specific style field
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
  <div class="space-y-4" ref="containerRef" v-if="selectedSection">
    <div
      class="flex items-center justify-between border-b border-white/10 pb-3"
    >
      <div class="flex gap-4">
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

      <button
        @click="$emit('close')"
        class="text-xs text-slate-400 hover:text-white"
      >
        Close
      </button>
    </div>

    <!-- Content Tab -->
    <div v-show="activeTab === 'content'" class="space-y-4">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">
          {{ selectedSection.type }} Content
        </h3>
      </div>
      <!-- Common Text Fields -->
      <div v-if="'eyebrow' in selectedSection">
        <BaseInput
          label="Eyebrow"
          :model-value="getField('eyebrow')"
          @update:model-value="(val) => updateField('eyebrow', val)"
          data-field-key="eyebrow"
        />
      </div>

      <div v-if="'headline' in selectedSection">
        <BaseTextarea
          label="Headline"
          :rows="2"
          :model-value="getField('headline')"
          @update:model-value="(val) => updateField('headline', val)"
          data-field-key="headline"
        />
      </div>

      <div v-if="'title' in selectedSection">
        <BaseInput
          label="Title"
          :model-value="getField('title')"
          @update:model-value="(val) => updateField('title', val)"
          data-field-key="title"
        />
      </div>

      <div v-if="'subheadline' in selectedSection">
        <BaseTextarea
          label="Subheadline"
          :rows="2"
          :model-value="getField('subheadline')"
          @update:model-value="(val) => updateField('subheadline', val)"
          data-field-key="subheadline"
        />
      </div>

      <div v-if="'image' in selectedSection">
        <label
          class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-1"
          >Image URL</label
        >
        <div class="flex gap-3">
          <div
            v-if="getField('image')"
            class="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-800"
          >
            <img :src="getField('image')" class="h-full w-full object-cover" />
          </div>
          <BaseInput
            :model-value="getField('image')"
            @update:model-value="(val) => updateField('image', val)"
            placeholder="https://..."
            data-field-key="image"
          />
        </div>
      </div>

      <div v-if="'subtitle' in selectedSection">
        <BaseTextarea
          label="Subtitle"
          :rows="2"
          :model-value="getField('subtitle')"
          @update:model-value="(val) => updateField('subtitle', val)"
          data-field-key="subtitle"
        />
      </div>

      <div v-if="'description' in selectedSection">
        <BaseTextarea
          label="Description"
          :rows="3"
          :model-value="getField('description')"
          @update:model-value="(val) => updateField('description', val)"
          data-field-key="description"
        />
      </div>

      <div
        v-if="'primaryCta' in selectedSection && (selectedSection as any).primaryCta"
      >
        <label
          class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-2"
          >Primary Button</label
        >
        <div class="grid grid-cols-2 gap-2">
          <BaseInput
            :model-value="getField('primaryCta.label')"
            @update:model-value="
              (val) =>
                updateField('primaryCta', {
                  ...getField('primaryCta'),
                  label: val,
                })
            "
            placeholder="Label"
            data-field-key="primaryCta.label"
          />
          <BaseInput
            :model-value="getField('primaryCta.href')"
            @update:model-value="
              (val) =>
                updateField('primaryCta', {
                  ...getField('primaryCta'),
                  href: val,
                })
            "
            placeholder="Link"
            data-field-key="primaryCta.href"
          />
        </div>
      </div>

      <div
        v-if="'secondaryCta' in selectedSection && (selectedSection as any).secondaryCta"
      >
        <label
          class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-2"
          >Secondary Button</label
        >
        <div class="grid grid-cols-2 gap-2">
          <BaseInput
            :model-value="getField('secondaryCta.label')"
            @update:model-value="
              (val) =>
                updateField('secondaryCta', {
                  ...getField('secondaryCta'),
                  label: val,
                })
            "
            placeholder="Label"
            data-field-key="secondaryCta.label"
          />
          <BaseInput
            :model-value="getField('secondaryCta.href')"
            @update:model-value="
              (val) =>
                updateField('secondaryCta', {
                  ...getField('secondaryCta'),
                  href: val,
                })
            "
            placeholder="Link"
            data-field-key="secondaryCta.href"
          />
        </div>
      </div>

      <!-- List Editor (Items, Plans, Members) -->
      <div v-for="listKey in [getListKey(selectedSection.type)]" :key="listKey">
        <div
          v-if="listKey in selectedSection && Array.isArray((selectedSection as any)[listKey])"
        >
          <label
            class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-2"
          >
            {{ listKey }}
          </label>
          <div class="space-y-3">
            <div
              v-for="(item, index) in (selectedSection as any)[listKey]"
              :key="index"
              class="relative rounded-lg bg-slate-800/50 p-3 ring-1 ring-white/10"
            >
              <button
                @click="removeItem(listKey, index)"
                class="absolute top-2 right-2 text-slate-500 hover:text-red-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                  />
                </svg>
              </button>

              <div class="space-y-2 pr-6">
                <!-- Specialized: Features / Items -->
                <template
                  v-if="
                    ['features', 'productList', 'stats'].includes(
                      selectedSection.type
                    )
                  "
                >
                  <BaseInput
                    label="Title / Value"
                    :model-value="item.title || item.value"
                    @update:model-value="
                      (val) =>
                        updateItemField(
                          listKey,
                          index,
                          'title' in item ? 'title' : 'value',
                          val
                        )
                    "
                    placeholder="Title"
                  />
                  <BaseTextarea
                    label="Description / Label"
                    :model-value="item.description || item.label"
                    @update:model-value="
                      (val) =>
                        updateItemField(
                          listKey,
                          index,
                          'description' in item ? 'description' : 'label',
                          val
                        )
                    "
                    :rows="2"
                    placeholder="Description"
                  />
                </template>

                <!-- Specialized: Pricing -->
                <template v-else-if="selectedSection.type === 'pricing'">
                  <BaseInput
                    label="Plan Name"
                    :model-value="item.name"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'name', val)
                    "
                    placeholder="Pro"
                  />
                  <div class="flex gap-2">
                    <BaseInput
                      label="Price"
                      :model-value="item.price"
                      @update:model-value="
                        (val) => updateItemField(listKey, index, 'price', val)
                      "
                      placeholder="$99"
                    />
                    <BaseInput
                      label="Period"
                      :model-value="item.period"
                      @update:model-value="
                        (val) => updateItemField(listKey, index, 'period', val)
                      "
                      placeholder="/mo"
                    />
                  </div>
                  <BaseTextarea
                    label="Description"
                    :model-value="item.description"
                    @update:model-value="
                      (val) =>
                        updateItemField(listKey, index, 'description', val)
                    "
                    :rows="2"
                    placeholder="Perfect for..."
                  />
                </template>

                <!-- Specialized: FAQ -->
                <template v-else-if="selectedSection.type === 'faq'">
                  <BaseInput
                    label="Question"
                    :model-value="item.question || item.q"
                    @update:model-value="
                      (val) =>
                        updateItemField(
                          listKey,
                          index,
                          'q' in item ? 'q' : 'question',
                          val
                        )
                    "
                    placeholder="Question"
                  />
                  <BaseTextarea
                    label="Answer"
                    :model-value="item.answer || item.a"
                    @update:model-value="
                      (val) =>
                        updateItemField(
                          listKey,
                          index,
                          'a' in item ? 'a' : 'answer',
                          val
                        )
                    "
                    :rows="2"
                    placeholder="Answer"
                  />
                </template>

                <!-- Specialized: Team -->
                <template v-else-if="selectedSection.type === 'team'">
                  <BaseInput
                    label="Name"
                    :model-value="item.name"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'name', val)
                    "
                    placeholder="John Doe"
                  />
                  <BaseInput
                    label="Role"
                    :model-value="item.role"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'role', val)
                    "
                    placeholder="CEO"
                  />
                  <BaseTextarea
                    label="Bio"
                    :model-value="item.bio"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'bio', val)
                    "
                    :rows="2"
                    placeholder="Bio"
                  />
                </template>

                <!-- Specialized: Testimonials -->
                <template v-else-if="selectedSection.type === 'testimonials'">
                  <BaseTextarea
                    label="Quote"
                    :model-value="item.quote"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'quote', val)
                    "
                    :rows="3"
                    placeholder="Best service ever!"
                  />
                  <BaseInput
                    label="Author Name"
                    :model-value="item.name"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'name', val)
                    "
                    placeholder="Sarah Jones"
                  />
                  <BaseInput
                    label="Role/Company"
                    :model-value="item.role"
                    @update:model-value="
                      (val) => updateItemField(listKey, index, 'role', val)
                    "
                    placeholder="Marketing Manager"
                  />
                </template>

                <!-- CTA (Nested) - For Pricing or others -->
                <div
                  v-if="'cta' in item && item.cta"
                  class="mt-2 pt-2 border-t border-white/5"
                >
                  <label
                    class="text-[10px] font-bold text-slate-500 uppercase block mb-1"
                    >Button</label
                  >
                  <div class="grid grid-cols-2 gap-2">
                    <BaseInput
                      :model-value="item.cta.label"
                      @update:model-value="
                        (val) =>
                          updateItemField(listKey, index, 'cta.label', val)
                      "
                      placeholder="Label"
                    />
                    <BaseInput
                      :model-value="item.cta.href"
                      @update:model-value="
                        (val) =>
                          updateItemField(listKey, index, 'cta.href', val)
                      "
                      placeholder="Link"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="addItem(listKey)"
              class="w-full rounded-lg border border-dashed border-white/20 p-2 text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
            >
              + Add {{ listKey.slice(0, -1) }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="'variant' in selectedSection">
        <label
          class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-2"
          >Layout Variant</label
        >
        <div
          v-if="selectedSection.type === 'hero'"
          class="grid grid-cols-2 gap-2"
        >
          <button
            v-for="v in ['center', 'split', 'right', 'glass', 'terminal']"
            :key="v"
            @click="updateField('variant', v)"
            class="px-3 py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg border transition-all"
            :class="
              (selectedSection as any).variant === v ||
              (!(selectedSection as any).variant && v === 'center')
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            "
          >
            {{ v }}
          </button>
        </div>
        <input
          v-else
          :value="(selectedSection as any).variant"
          @input="e => updateField('variant', (e.target as HTMLInputElement).value)"
          class="w-full rounded-lg bg-slate-900/80 px-3 py-2 text-sm text-white ring-1 ring-white/10 focus:ring-indigo-500"
          placeholder="e.g. split, center"
        />
      </div>

      <div
        class="pt-4 border-t border-white/10 text-[10px] text-slate-500 font-mono"
      >
        ID: {{ selectedSection.id }}
      </div>
    </div>

    <!-- Design Tab -->
    <div v-show="activeTab === 'design'" class="space-y-6">
      <div class="flex justify-end">
        <button
          @click="$emit('close')"
          class="text-xs text-slate-400 hover:text-white"
        >
          Close
        </button>
      </div>

      <div>
        <label
          class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3"
          >Colors</label
        >
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-300">Background</span>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="getField('styles.backgroundColor') || '#111827'"
                @input="e => updateStyle('backgroundColor', (e.target as HTMLInputElement).value)"
                class="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                :value="getField('styles.backgroundColor')"
                @input="e => updateStyle('backgroundColor', (e.target as HTMLInputElement).value)"
                class="w-20 rounded bg-slate-900 px-2 py-1 text-[10px] text-white ring-1 ring-white/10"
                placeholder="#000000"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-300">Text Color</span>
            <div class="flex items-center gap-2">
              <input
                type="color"
                :value="getField('styles.textColor') || '#ffffff'"
                @input="e => updateStyle('textColor', (e.target as HTMLInputElement).value)"
                class="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                :value="getField('styles.textColor')"
                @input="e => updateStyle('textColor', (e.target as HTMLInputElement).value)"
                class="w-20 rounded bg-slate-900 px-2 py-1 text-[10px] text-white ring-1 ring-white/10"
                placeholder="#ffffff"
              />
            </div>
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
                : 'bg-slate-900/50 border-white/10 text-slate-400 hover:text-white'
            "
          >
            {{ s }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
```
