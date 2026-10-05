<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="rounded px-3 py-1 text-sm text-black bg-white hover:bg-gray-50 hover:cursor-pointer"
      aria-label="Customise options"
    >
      {{ triggerLabel }}
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent class="min-w-40 bg-white rounded-lg p-1" :side-offset="5">
        <DropdownMenuItem
          v-for="item in items"
          class="text-sm leading-none text-black rounded flex items-center px-2 py-1.5 hover:cursor-pointer data-disabled:pointer-events-none data-highlighted:bg-green-50"
          :value="item"
          @select="onItemSelect(item)"
          >{{ item }}</DropdownMenuItem
        >
        <DropdownMenuArrow class="fill-white" />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<script setup lang="ts" generic="T extends string | number | boolean">
import {
  DropdownMenuArrow,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "reka-ui";

const {} = defineProps<{
  items: Array<T>;
  triggerLabel: string;
  onItemSelect: (item: T) => void;
}>();
</script>
