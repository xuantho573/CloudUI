<script setup lang="ts">
import { ref } from "vue";

const count = ref(0);

defineProps<{ label?: string }>();
</script>

<template>
  <button type="button" class="counter" @click="count++">Count is {{ count }}</button>
</template>

<style scoped>
.counter {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  color: #fff;
  cursor: pointer;
  transition: border-color 0.25s;
}

.counter:hover {
  border-color: #42b883;
}
</style>
