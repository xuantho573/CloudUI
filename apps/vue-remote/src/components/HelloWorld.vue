<script setup lang="ts">
import { ref } from "vue";

import vueLogo from "@cloud-ui/shared/assets/vue.svg";

defineProps<{ label?: string }>();

const count = ref(0);
</script>

<template>
  <section class="remote-card">
    <header>
      <img :src="vueLogo" class="framework" alt="" width="48" height="48" />
      <div>
        <h2>Vue remote</h2>
        <p class="origin">{{ label ?? "running standalone" }}</p>
      </div>
    </header>

    <p>
      Edit <code>apps/vue-remote/src/components/HelloWorld.vue</code> and save to test
      <code>HMR</code>.
    </p>

    <button type="button" class="counter" @click="count++">Count is {{ count }}</button>
  </section>
</template>

<style scoped>
.remote-card {
  font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
  padding: 1.5rem;
  border: 1px solid #42b88355;
  border-radius: 12px;
  background: #42b8830d;
  line-height: 1.5;
}

.remote-card header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.origin {
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.65;
}

code {
  background: #8884;
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
}

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
