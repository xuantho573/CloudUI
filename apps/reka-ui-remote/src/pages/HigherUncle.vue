<template>
  <div class="relative z-10">
    <DropdownMenu triggerLabel="Hello" :items="[1, 2, 3]" @itemSelect="console.log" />
  </div>
  <div class="relative z-20">Hello there</div>
</template>
<script setup lang="ts">
import DropdownMenu from "../components/DropdownMenu.vue";
</script>
