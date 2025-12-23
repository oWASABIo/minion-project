<script setup lang="ts">
import { computed, ref } from "vue";
import type { Section } from "@minions/shared";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

const store = useBuilderStore();
const { selectedSection } = storeToRefs(store);

const emit = defineEmits<{
  (e: "close"): void;
}>();

// Helper to update specific field
function updateField(key: any, value: any) {
  if (!selectedSection.value) return;
  store.updateSection({ ...selectedSection.value, [key]: value } as Section);
}

const containerRef = ref<HTMLElement | null>(null);

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

defineExpose({ focusField });
</script>

<template>
  <div class="space-y-4" ref="containerRef" v-if="selectedSection">
    <div
      class="flex items-center justify-between border-b border-white/10 pb-3"
    >
      <h3 class="text-sm font-bold text-white uppercase tracking-wider">
        Edit {{ selectedSection.type }}
      </h3>
      <button
        @click="$emit('close')"
        class="text-xs text-slate-400 hover:text-white"
      >
        Close
      </button>
    </div>

    <div class="space-y-4">
      <!-- Common Text Fields -->
      <div v-if="'eyebrow' in selectedSection">
        <BaseInput
          label="Eyebrow"
          :model-value="(selectedSection as any).eyebrow"
          @update:model-value="(val) => updateField('eyebrow', val)"
          data-field-key="eyebrow"
        />
      </div>

      <div v-if="'headline' in selectedSection">
        <BaseTextarea
          label="Headline"
          :rows="2"
          :model-value="(selectedSection as any).headline"
          @update:model-value="(val) => updateField('headline', val)"
          data-field-key="headline"
        />
      </div>

      <div v-if="'title' in selectedSection">
        <BaseInput
          label="Title"
          :model-value="(selectedSection as any).title"
          @update:model-value="(val) => updateField('title', val)"
          data-field-key="title"
        />
      </div>

      <div v-if="'subheadline' in selectedSection">
        <BaseTextarea
          label="Subheadline"
          :rows="2"
          :model-value="(selectedSection as any).subheadline"
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
            v-if="(selectedSection as any).image"
            class="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-white/10 bg-slate-800"
          >
            <img
              :src="(selectedSection as any).image"
              class="h-full w-full object-cover"
            />
          </div>
          <BaseInput
            :model-value="(selectedSection as any).image"
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
          :model-value="(selectedSection as any).subtitle"
          @update:model-value="(val) => updateField('subtitle', val)"
          data-field-key="subtitle"
        />
      </div>

      <div v-if="'description' in selectedSection">
        <BaseTextarea
          label="Description"
          :rows="3"
          :model-value="(selectedSection as any).description"
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
            :model-value="(selectedSection as any).primaryCta.label"
            @update:model-value="val => updateField('primaryCta', { ...(selectedSection as any).primaryCta, label: val })"
            placeholder="Label"
            data-field-key="primaryCta.label"
          />
          <BaseInput
            :model-value="(selectedSection as any).primaryCta.href"
            @update:model-value="val => updateField('primaryCta', { ...(selectedSection as any).primaryCta, href: val })"
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
            :model-value="(selectedSection as any).secondaryCta.label"
            @update:model-value="val => updateField('secondaryCta', { ...(selectedSection as any).secondaryCta, label: val })"
            placeholder="Label"
            data-field-key="secondaryCta.label"
          />
          <BaseInput
            :model-value="(selectedSection as any).secondaryCta.href"
            @update:model-value="val => updateField('secondaryCta', { ...(selectedSection as any).secondaryCta, href: val })"
            placeholder="Link"
            data-field-key="secondaryCta.href"
          />
        </div>
      </div>

      <!-- Generic List Editor (Items, Plans, Members) -->
      <div v-for="listKey in ['items', 'plans', 'members']" :key="listKey">
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
                @click="() => {
                  const newItems = [...(selectedSection as any)[listKey]];
                  newItems.splice(Number(index), 1);
                  updateField(listKey, newItems);
                }"
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
                <!-- Common Title/Name -->
                <!-- Common Title/Name -->
                <BaseInput
                  v-if="'title' in item || 'head' in item || 'name' in item"
                  :model-value="item.title || item.head || item.name"
                  @update:model-value="val => {
                     const newItems = [...(selectedSection as any)[listKey]];
                     const key = 'title' in item ? 'title' : 'head' in item ? 'head' : 'name';
                     newItems[Number(index)] = { ...item, [key]: val };
                     updateField(listKey, newItems);
                   }"
                  :placeholder="'name' in item ? 'Name' : 'Title'"
                  :data-field-key="`${listKey}.${index}.${
                    'title' in item ? 'title' : 'head' in item ? 'head' : 'name'
                  }`"
                />

                <!-- Pricing: Price & Period -->
                <!-- Pricing: Price & Period -->
                <div v-if="'price' in item" class="flex gap-2">
                  <BaseInput
                    :model-value="item.price"
                    @update:model-value="val => {
                       const newItems = [...(selectedSection as any)[listKey]];
                       newItems[Number(index)] = { ...item, price: val };
                       updateField(listKey, newItems);
                     }"
                    placeholder="$99"
                    :data-field-key="`${listKey}.${index}.price`"
                  />
                  <BaseInput
                    v-if="'period' in item"
                    :model-value="item.period"
                    @update:model-value="val => {
                       const newItems = [...(selectedSection as any)[listKey]];
                       newItems[Number(index)] = { ...item, period: val };
                       updateField(listKey, newItems);
                     }"
                    placeholder="/mo"
                    :data-field-key="`${listKey}.${index}.period`"
                  />
                </div>

                <!-- Stats: Value & Label -->
                <!-- Stats: Value & Label -->
                <div v-if="'value' in item">
                  <BaseInput
                    :model-value="item.value"
                    @update:model-value="val => {
                       const newItems = [...(selectedSection as any)[listKey]];
                       newItems[Number(index)] = { ...item, value: val };
                       updateField(listKey, newItems);
                     }"
                    placeholder="Value"
                    :data-field-key="`${listKey}.${index}.value`"
                  />
                  <BaseInput
                    v-if="'label' in item"
                    :model-value="item.label"
                    @update:model-value="val => {
                       const newItems = [...(selectedSection as any)[listKey]];
                       newItems[Number(index)] = { ...item, label: val };
                       updateField(listKey, newItems);
                     }"
                    placeholder="Label"
                    :data-field-key="`${listKey}.${index}.label`"
                  />
                </div>

                <!-- Features/Text: Description/Quote -->
                <!-- Features/Text: Description/Quote -->
                <BaseTextarea
                  v-if="
                    'description' in item || 'quote' in item || 'bio' in item
                  "
                  :model-value="item.description || item.quote || item.bio"
                  @update:model-value="val => {
                     const newItems = [...(selectedSection as any)[listKey]];
                     const key = 'quote' in item ? 'quote' : 'bio' in item ? 'bio' : 'description';
                     newItems[Number(index)] = { ...item, [key]: val };
                     updateField(listKey, newItems);
                   }"
                  :rows="2"
                  placeholder="Description / Quote"
                  :data-field-key="`${listKey}.${index}.${
                    'quote' in item
                      ? 'quote'
                      : 'bio' in item
                      ? 'bio'
                      : 'description'
                  }`"
                />

                <!-- FAQ: Question & Answer -->
                <!-- FAQ: Question & Answer -->
                <BaseInput
                  v-if="'question' in item || 'q' in item"
                  :model-value="item.question || item.q"
                  @update:model-value="val => {
                     const newItems = [...(selectedSection as any)[listKey]];
                     const key = 'q' in item ? 'q' : 'question';
                     newItems[Number(index)] = { ...item, [key]: val };
                     updateField(listKey, newItems);
                   }"
                  placeholder="Question"
                  :data-field-key="`${listKey}.${index}.${
                    'q' in item ? 'q' : 'question'
                  }`"
                />
                <BaseTextarea
                  v-if="'answer' in item || 'a' in item"
                  :model-value="item.answer || item.a"
                  @update:model-value="val => {
                     const newItems = [...(selectedSection as any)[listKey]];
                     const key = 'a' in item ? 'a' : 'answer';
                     newItems[Number(index)] = { ...item, [key]: val };
                     updateField(listKey, newItems);
                   }"
                  :rows="2"
                  placeholder="Answer"
                  :data-field-key="`${listKey}.${index}.${
                    'a' in item ? 'a' : 'answer'
                  }`"
                />

                <!-- Team: Role -->
                <!-- Team: Role -->
                <BaseInput
                  v-if="'role' in item"
                  :model-value="item.role"
                  @update:model-value="val => {
                     const newItems = [...(selectedSection as any)[listKey]];
                     newItems[Number(index)] = { ...item, role: val };
                     updateField(listKey, newItems);
                   }"
                  placeholder="Role"
                  :data-field-key="`${listKey}.${index}.role`"
                />

                <!-- CTA (Nested) -->
                <div
                  v-if="'cta' in item && item.cta"
                  class="mt-2 pt-2 border-t border-white/5"
                >
                  <p
                    class="text-[10px] uppercase text-slate-500 font-semibold mb-1"
                  >
                    Button
                  </p>
                  <div class="grid grid-cols-2 gap-2">
                    <BaseInput
                      :model-value="item.cta.label"
                      @update:model-value="val => {
                         const newItems = [...(selectedSection as any)[listKey]];
                         newItems[Number(index)] = { ...item, cta: { ...item.cta, label: val } };
                         updateField(listKey, newItems);
                       }"
                      placeholder="Label"
                      :data-field-key="`${listKey}.${index}.cta.label`"
                    />
                    <BaseInput
                      :model-value="item.cta.href"
                      @update:model-value="val => {
                         const newItems = [...(selectedSection as any)[listKey]];
                         newItems[Number(index)] = { ...item, cta: { ...item.cta, href: val } };
                         updateField(listKey, newItems);
                       }"
                      placeholder="Link"
                      :data-field-key="`${listKey}.${index}.cta.href`"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              @click="() => {
                 const newItems = [...(selectedSection as any)[listKey]];
                 if (listKey === 'plans') newItems.push({ name: 'Plan', price: '$10', features: [] });
                 else if (listKey === 'members') newItems.push({ name: 'Member', role: 'Role' });
                 else if (selectedSection?.type === 'faq') newItems.push({ question: 'New Question', answer: 'Answer' });
                 else newItems.push({ title: 'New Item', description: 'Description' });
                 updateField(listKey, newItems);
              }"
              class="w-full rounded-lg border border-dashed border-white/20 p-2 text-sm text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
            >
              + Add {{ listKey.slice(0, -1) }}
            </button>
          </div>
        </div>
      </div>

      <!-- JSON Array Editor for Complex Lists -->
      <div v-for="key in ['items', 'plans', 'members']" :key="key">
        <div
          v-if="key in selectedSection && Array.isArray((selectedSection as any)[key])"
        >
          <label
            class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-1"
          >
            {{ key }} (JSON)
          </label>
          <textarea
            :value="JSON.stringify((selectedSection as any)[key], null, 2)"
            rows="6"
            @change="e => {
               try {
                 const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
                 updateField(key, parsed);
               } catch (err) {
                 console.error('Invalid JSON');
               }
             }"
            class="w-full rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-mono text-slate-300 ring-1 ring-white/10 focus:ring-indigo-500"
          ></textarea>
          <p class="text-[10px] text-slate-500 mt-1">
            Edit raw JSON to update list items.
          </p>
        </div>
      </div>

      <!-- Variant Selector -->
      <div v-if="'variant' in selectedSection">
        <label
          class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 block mb-1"
          >Variant</label
        >
        <input
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
  </div>
</template>
