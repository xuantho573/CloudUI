<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="rounded px-4 py-2 inline-flex items-center justify-center bg-white hover:bg-stone-50 hover:cursor-pointer"
      aria-label="Customise options"
    >
      {{ triggerLabel }}
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-[220px] outline-none bg-white rounded-md p-1 will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
        :side-offset="5"
      >
        <DropdownMenuItem
          v-for="item in items"
          class="text-xs leading-none text-black rounded flex items-center h-6 px-1 relative select-none outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-green-900 data-[highlighted]:text-green-100"
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
