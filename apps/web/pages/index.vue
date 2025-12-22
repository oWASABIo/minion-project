<script setup lang="ts">
import { pageConfig } from "../data/landing-data";
import PageRenderer from "~/components/sections/PageRenderer.vue";
</script>

<template>
  <PageRenderer :config="pageConfig" headerMode="app" />
</template>
