import { useState, computed } from "#imports";

export const useTheme = () => {
  const primaryColor = useState<string>("theme-primary", () => "#4f46e5"); // Indigo-600 default
  const borderRadius = useState<string>("theme-radius", () => "0.5rem"); // 8px default
  const fontFamily = useState<string>("theme-font", () => "Inter");

  // Predefined palettes
  const palettes = [
    { name: "Indigo", value: "#4f46e5" },
    { name: "Red", value: "#dc2626" },
    { name: "Emerald", value: "#059669" },
    { name: "Amber", value: "#d97706" },
    { name: "Rose", value: "#e11d48" },
    { name: "Sky", value: "#0284c7" },
    { name: "Violet", value: "#7c3aed" },
    { name: "Black", value: "#0f172a" },
  ];

  const fonts = [
    { name: "Modern", value: "Inter, sans-serif" },
    { name: "Elegant", value: "Playfair Display, serif" },
    { name: "Mono", value: "JetBrains Mono, monospace" },
  ];

  const styles = computed(() => {
    return {
      "--color-primary": primaryColor.value,
      "--theme-radius": borderRadius.value,
      "--theme-font": fontFamily.value,
    };
  });

  const setPrimary = (color: string) => {
    primaryColor.value = color;
  };

  const setRadius = (radius: string) => {
    borderRadius.value = radius;
  };

  const setFont = (font: string) => {
    fontFamily.value = font;
  };

  return {
    primaryColor,
    borderRadius,
    fontFamily,
    palettes,
    fonts,
    styles,
    setPrimary,
    setRadius,
    setFont,
  };
};
