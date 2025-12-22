export const useAnalytics = () => {
  const config = useRuntimeConfig();

  // Helper to send data to our API
  const sendEvent = async (
    projectId: number,
    eventType: string,
    metadata: any = {}
  ) => {
    try {
      // Use $fetch which is available globally in Nuxt
      await $fetch("/api/analytics/track", {
        method: "POST",
        body: {
          projectId,
          eventType,
          metadata,
        },
      });
    } catch (e) {
      // Silently fail for analytics to not disrupt UX
      console.warn("[Analytics] Failed to track:", e);
    }
  };

  const trackPageView = (projectId: number | undefined, path: string) => {
    if (!projectId) return;
    sendEvent(projectId, "page_view", { path });
  };

  const trackClick = (
    projectId: number | undefined,
    elementId: string,
    label?: string
  ) => {
    if (!projectId) return;
    sendEvent(projectId, "click", { element_id: elementId, label });
  };

  return {
    trackPageView,
    trackClick,
  };
};
