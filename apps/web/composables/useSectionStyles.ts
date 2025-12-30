import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { Section, SectionBase } from "@minions/shared";

export function useSectionStyles(sectionSource: MaybeRefOrGetter<Section>) {
  const wrapperStyle = computed(() => {
    const s = (toValue(sectionSource) as SectionBase).styles || {};
    const bg = s.backgroundColor;
    const txt = s.textColor;

    if (!bg && !txt) return {};

    return {
      backgroundColor: bg,
      color: txt,
      "--text-primary": txt,
      "--text-secondary": txt ? `${txt}cc` : undefined,
      "--bg-section": bg,
    };
  });

  const spacingClass = computed(() => {
    const s = (toValue(sectionSource) as SectionBase).styles?.spacing;
    if (s === "none") return "py-0";
    if (s === "sm") return "py-8";
    if (s === "lg") return "py-24";
    return "py-16"; // Default md
  });

  return {
    wrapperStyle,
    spacingClass,
  };
}
