import { ref } from "vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";
import { throttle } from "~/utils/performance";

export function usePreviewSync() {
  const store = useBuilderStore();
  const { currentPageConfig, isEditMode, selectedSectionId } =
    storeToRefs(store);

  const previewIframe = ref<HTMLIFrameElement | null>(null);
  const isPreviewReady = ref(false);

  const getIframeWindow = () => {
    if (!previewIframe.value) return null;

    // 1. If it's the PreviewFrame component (which exposes iframeRef)
    const comp = previewIframe.value as any;
    if (comp.iframeRef && comp.iframeRef.contentWindow) {
      return comp.iframeRef.contentWindow;
    }

    // 2. Fallback: If it's a raw HTMLIFrameElement
    if ("contentWindow" in previewIframe.value) {
      return previewIframe.value.contentWindow;
    }

    return null;
  };

  const syncPreview = throttle(() => {
    const win = getIframeWindow();
    if (!win || !isPreviewReady.value || !currentPageConfig.value) {
      return;
    }

    win.postMessage(
      {
        type: "updateConfig",
        config: JSON.parse(JSON.stringify(currentPageConfig.value)), // Deep clone to be safe
        isEditMode: isEditMode.value,
        selectedSectionId: selectedSectionId.value,
      },
      "*"
    );
  }, 100);

  // Immediate sync without debounce (for initial load or critical updates)
  const forceSyncPreview = () => {
    const win = getIframeWindow();
    if (!win || !isPreviewReady.value || !currentPageConfig.value) return;

    win.postMessage(
      {
        type: "updateConfig",
        config: JSON.parse(JSON.stringify(currentPageConfig.value)),
        isEditMode: isEditMode.value,
        selectedSectionId: selectedSectionId.value,
      },
      "*"
    );
  };

  return {
    previewIframe,
    isPreviewReady,
    syncPreview,
    forceSyncPreview,
  };
}
