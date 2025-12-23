<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  viewport: "desktop" | "tablet" | "mobile";
}>();

const emit = defineEmits<{
  (e: "iframe-load", el: HTMLIFrameElement): void;
}>();

const previewContainer = ref<HTMLElement | null>(null);
const iframeRef = ref<HTMLIFrameElement | null>(null);
const containerWidth = ref(1280);
const containerHeight = ref(1024);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (previewContainer.value) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width;
        containerHeight.value = entry.contentRect.height;
      }
    });
    resizeObserver.observe(previewContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect();
});

watch(iframeRef, (el) => {
  if (el) emit("iframe-load", el);
});

const scale = computed(() => {
  const padding = 40;
  const availW = Math.max(0, containerWidth.value - padding);
  const availH = Math.max(0, containerHeight.value - padding);

  if (props.viewport === "desktop") {
    const targetW = 1280;
    const targetH = 800;
    const scaleW = availW / targetW;
    const scaleH = availH / targetH;
    return Math.min(scaleW, scaleH, 1);
  }
  if (props.viewport === "tablet") {
    const targetW = 800;
    const targetH = 1050;
    const scaleW = availW / targetW;
    const scaleH = availH / targetH;
    return Math.min(scaleW, scaleH, 1);
  }
  if (props.viewport === "mobile") {
    const targetW = 400;
    const targetH = 900;
    const scaleW = availW / targetW;
    const scaleH = availH / targetH;
    return Math.min(scaleW, scaleH, 1);
  }
  return 1;
});

defineExpose({
  iframeRef,
});
</script>

<template>
  <div
    ref="previewContainer"
    class="relative w-full h-[600px] md:h-[800px] bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden flex items-center justify-center p-8 sticky top-24"
  >
    <!-- Background Grid -->
    <div
      class="absolute inset-0 opacity-20 pointer-events-none"
      style="
        background-image: radial-gradient(#4f46e5 1px, transparent 1px);
        background-size: 24px 24px;
      "
    ></div>

    <div
      class="origin-center transition-all duration-500 ease-out shadow-2xl relative"
      :style="{ transform: `scale(${scale})` }"
    >
      <div
        class="transition-all duration-500 bg-slate-950 border-slate-800"
        :class="[
          viewport === 'desktop'
            ? 'w-[1280px] h-[800px] shadow-lg rounded-lg border-4 border-slate-800'
            : '',
          viewport === 'tablet'
            ? 'w-[768px] h-[1024px] rounded-[2rem] border-[12px] border-slate-800'
            : '',
          viewport === 'mobile'
            ? 'w-[375px] h-[812px] rounded-[3rem] border-[12px] border-slate-800'
            : '',
        ]"
      >
        <div
          class="w-full h-full overflow-hidden bg-slate-950"
          :class="viewport !== 'desktop' ? 'rounded-[1.4rem]' : ''"
        >
          <iframe
            ref="iframeRef"
            src="/preview"
            class="w-full h-full border-0 block"
            title="Preview"
          ></iframe>
        </div>
      </div>
    </div>
  </div>
</template>
