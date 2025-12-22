<script setup lang="ts">
import { computed } from "vue";
import { NuxtLink } from "#components";

interface Props {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "soft"
    | "success";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  to?: string | object;
  href?: string;
  type?: "button" | "submit" | "reset";
  icon?: any; // Component or string
  iconPosition?: "left" | "right";
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  size: "md",
  type: "button",
  iconPosition: "left",
});

const isLink = computed(() => !!props.to || !!props.href);
const componentType = computed(() => {
  if (props.to) return NuxtLink;
  if (props.href) return "a";
  return "button";
});

const baseClasses =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 focus:ring-indigo-500 border border-transparent",
    secondary:
      "bg-slate-800 text-white hover:bg-slate-700 hover:shadow-lg focus:ring-slate-500 border border-transparent",
    outline:
      "bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500",
    ghost:
      "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:ring-slate-500",
    danger:
      "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg focus:ring-red-500 border border-transparent",
    soft: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-transparent",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg focus:ring-emerald-500 border border-transparent",
  };
  return map[props.variant] || map.primary;
});

const sizeClasses = computed(() => {
  const map: Record<string, string> = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };
  return map[props.size] || map.md;
});
</script>

<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :type="isLink ? undefined : type"
    :disabled="disabled || loading"
    :class="[baseClasses, variantClasses, sizeClasses, block ? 'w-full' : '']"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>

    <slot name="prefix"></slot>
    <span v-if="$slots.default">
      <slot></slot>
    </span>
    <slot name="suffix"></slot>
  </component>
</template>
