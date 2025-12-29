<script setup lang="ts">
import { pageConfig } from "../data/landing-data";
import StaticPageRenderer from "~/components/sections/StaticPageRenderer.vue";
</script>

<template>
  <StaticPageRenderer :config="pageConfig" headerMode="app" />
</template>
