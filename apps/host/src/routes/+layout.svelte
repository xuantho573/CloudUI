<script lang="ts">
  import cloudLogo from "@cloud-ui/shared/assets/cloud-ui.svg";
  import "../style.css";
  import RemoteSlot from "$lib/RemoteSlot.svelte";
  import { page } from "$app/state";
  import type { RemotePage } from "@cloud-ui/shared/create-remote";

  type Remote = {
    name: string;
    entry: string;
    framework: "vue" | "react";
  };

  const route = $derived(page.route.id || "main");
  const pageName: RemotePage = $derived.by(() => {
    if (route.includes("higher-uncle")) return "higher-uncle";
    return "main";
  });

  const REMOTES: Remote[] = [
    {
      name: "react-remote",
      entry: `http://localhost:${import.meta.env.VITE_REACT_REMOTE_PORT}/remoteEntry.js`,
      framework: "react",
    },
    {
      name: "primer-remote",
      entry: `http://localhost:${import.meta.env.VITE_PRIMER_REMOTE_PORT}/remoteEntry.js`,
      framework: "react",
    },
    {
      name: `vue-remote`,
      entry: `http://localhost:${import.meta.env.VITE_VUE_REMOTE_PORT}/remoteEntry.js`,
      framework: "vue",
    },
    {
      name: `reka-ui-remote`,
      entry: `http://localhost:${import.meta.env.VITE_REKA_UI_REMOTE_PORT}/remoteEntry.js`,
      framework: "vue",
    },
  ];

  const ROUTES = [
    { path: "/", name: "Home" },
    { path: "/higher-uncle", name: "HigherUncle" },
  ];

  // const { children } = $props();
</script>

<header class="[&_h1]:text-2xl flex items-center gap-x-2 bg-gray-100 h-10">
  <img src={cloudLogo} class="h-full" alt="" />
  <nav class="h-full">
    <ul class="h-full flex items-center">
      {#each ROUTES as route}
        <li class="h-full hover:bg-gray-200">
          <a class="h-full flex items-center px-2" href={route.path}
            >{route.name}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
  <!-- {@render children()} -->
</header>

<main class="flex flex-col gap-y-4">
  {#each REMOTES as remote}
    <RemoteSlot {...{ ...remote, page: pageName }} />
  {/each}
</main>
