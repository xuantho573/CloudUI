<script lang="ts">
  import { onMount } from "svelte";
  import { loadRemote, registerRemotes } from "@module-federation/runtime";
  import reactLogo from "@cloud-ui/shared/assets/react.svg";
  import vueLogo from "@cloud-ui/shared/assets/vue.svg";

  import type {
    RemoteModule,
    RemotePage,
  } from "@cloud-ui/shared/create-remote";

  interface Props {
    name: string;
    framework: string;
    entry: string;
    page: RemotePage;
  }
  const { name, framework, entry, page }: Props = $props();

  let el: HTMLDivElement;
  let mod: ReturnType<RemoteModule["mount"]> | null = $state(null);

  $effect(() => mod?.update?.({ page }));

  onMount(async () => {
    try {
      registerRemotes([{ name, entry, type: "module" }]);

      const remote = await loadRemote<RemoteModule>(name);
      if (!remote?.mount) {
        throw new Error(`${name}/app does not export mount()`);
      }

      el.replaceChildren();
      mod = remote.mount(el, { page });
    } catch (err) {
      // One remote being down must not take the whole shell with it.
      console.error(`host: failed to load ${name}`, err);
      const message = err instanceof Error ? err.message : String(err);
      const fallback = document.createElement("p");
      fallback.className = "remote-error";
      fallback.textContent = `Could not load ${name}. Is its dev server running?`;
      const detail = document.createElement("code");
      detail.textContent = message;
      fallback.append(detail);
      el.replaceChildren(fallback);
    }
  });
</script>

<section class="px-6 py-4 border rounded-xl framework-{framework}">
  <header class="flex items-center gap-x-3 mb-4 mt-2">
    <img
      src={framework === "vue" ? vueLogo : reactLogo}
      class="framework"
      alt="{name} logo"
      width="24"
      height="24"
    />
    <h2 class="font-semibold">{name}</h2>
  </header>
  <div bind:this={el}>Loading</div>
</section>

<style>
  .framework-react {
    border-color: #61dafb;
  }
  .framework-vue {
    border-color: #42b883;
  }
</style>
