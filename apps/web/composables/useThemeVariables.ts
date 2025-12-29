import { computed, type ComputedRef } from "vue";
import type { PageConfig } from "@minions/shared";
import { useBuilderStore } from "~/stores/builder";

export function useThemeVariables(
  config: ComputedRef<PageConfig>,
  isBlueprint: ComputedRef<boolean>
) {
  const store = useBuilderStore();

  const isDark = computed(() => {
    const mode =
      config.value.site?.themeMode ??
      store.projectConfig?.site?.themeMode ??
      "dark";
    return mode === "dark";
  });

  const accent = computed(() => {
    return (
      config.value.site?.primaryColor ??
      store.projectConfig?.site?.primaryColor ??
      "#4f46e5"
    );
  });

  const font = computed(() => {
    return (
      config.value.site?.fontFamily ??
      store.projectConfig?.site?.fontFamily ??
      "'Outfit', sans-serif"
    );
  });

  const designTokens = computed(() => {
    return {
      "--radius-ui": `${
        config.value.site?.borderRadius ??
        store.projectConfig?.site?.borderRadius ??
        16
      }px`,
      "--section-spacing": `${
        (config.value.site?.spacing ??
          store.projectConfig?.site?.spacing ??
          5) * 4
      }rem`,
    };
  });

  const themeVars = computed(() => {
    const dark = isDark.value;
    const color = accent.value;

    return {
      "--accent": color,
      "--font-primary": font.value,
      "--text-primary": dark ? "#ffffff" : "#0f172a",
      "--text-secondary": dark ? "#94a3b8" : "#475569",
      "--bg-page": dark ? "#020617" : "#ffffff",
      "--bg-subtle": dark ? "#0f172a" : "#f9fafb",
      "--bg-card": dark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
      "--border-color": dark
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)",
      "--nav-bg": dark ? "rgba(2, 6, 23, 0.8)" : "rgba(255, 255, 255, 0.9)",
      "--shadow-card": dark ? "none" : "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
      "--color-primary": color,
      ...designTokens.value,
    };
  });

  const bodyClass = computed(() => (isDark.value ? "dark" : ""));

  const containerStyle = computed(() => {
    if (isBlueprint.value) {
      return {
        background: "var(--bg-page)",
        fontFamily: "'JetBrains Mono', monospace",
        ...designTokens.value,
      };
    }

    return {
      background: `radial-gradient(1000px circle at 20% 0%, ${accent.value}${
        isDark.value ? "22" : "15"
      }, transparent 40%),
                   radial-gradient(900px circle at 80% 25%, ${accent.value}${
        isDark.value ? "18" : "10"
      }, transparent 45%),
                   var(--bg-page)`,
      ...themeVars.value,
    };
  });

  return {
    isDark,
    accent,
    font,
    themeVars,
    bodyClass,
    containerStyle,
  };
}
