<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";

defineProps<{ label?: string }>();
</script>

<template>
  <HelloWorld :label="label" />
</template>
