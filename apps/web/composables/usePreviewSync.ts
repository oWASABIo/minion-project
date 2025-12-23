import { ref } from "vue";
import { useBuilderStore } from "~/stores/builder";
import { storeToRefs } from "pinia";

export function usePreviewSync() {
  const store = useBuilderStore();
  const { currentPageConfig, isEditMode, selectedSectionId } =
    storeToRefs(store);

  const previewIframe = ref<HTMLIFrameElement | null>(null);
  const isPreviewReady = ref(false);

  function debounce(fn: Function, delay: number) {
    let timeoutId: any;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  const syncPreview = () => {
    if (
      !previewIframe.value?.contentWindow ||
      !isPreviewReady.value ||
      !currentPageConfig.value
    ) {
      return;
    }

    previewIframe.value.contentWindow.postMessage(
      {
        type: "updateConfig",
        config: JSON.parse(JSON.stringify(currentPageConfig.value)), // Deep clone to be safe
        isEditMode: isEditMode.value,
        selectedSectionId: selectedSectionId.value,
      },
      "*"
    );
  };

  // Immediate sync without debounce (for initial load)
  const forceSyncPreview = () => {
    if (
      !previewIframe.value?.contentWindow ||
      !isPreviewReady.value ||
      !currentPageConfig.value
    )
      return;

    previewIframe.value.contentWindow.postMessage(
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
