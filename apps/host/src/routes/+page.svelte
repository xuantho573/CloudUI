<script lang="ts">
  import { onMount } from "svelte";
  import { loadRemote, registerRemotes } from "@module-federation/runtime";
  import { type RemoteModule } from "@cloud-ui/shared/create-remote";
  import reactLogo from "@cloud-ui/shared/assets/react.svg";
  import vueLogo from "@cloud-ui/shared/assets/vue.svg";

  type Remote = {
    name: string;
    entry: string;
    framework: "vue" | "react";
  };

  const remoteMap: Record<string, any> = {};

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

  async function bootRemote(remote: Remote): Promise<void> {
    const { name, entry } = remote;
    const el = remoteMap[name];

    try {
      registerRemotes([{ name, entry, type: "module" }]);

      const mod = await loadRemote<RemoteModule>(name);
      if (!mod?.mount) {
        throw new Error(`${name}/app does not export mount()`);
      }

      el.replaceChildren();
      mod.mount(el);
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
  }

  onMount(() => {
    REMOTES.forEach(bootRemote);
  });
</script>

<main class="flex flex-col gap-y-4">
  {#each REMOTES as { name, framework }}
    <section class="remote-card framework-{framework}">
      <header>
        <img
          src={framework === "vue" ? vueLogo : reactLogo}
          class="framework"
          alt="{name} logo"
          width="48"
          height="48"
        />
        <h2>{name}</h2>
      </header>
      <div bind:this={remoteMap[name]}>Loading</div>
    </section>
  {/each}
</main>

<style>
  .remote-card {
    padding: 1.5rem;
    border: 1px solid black;
    border-radius: 12px;
    background: transparent;

    &.framework-react {
      border-color: #61dafb55;
      background: #61dafb0d;
    }

    &.framework-vue {
      border-color: #42b88355;
      background: #42b8830d;
    }
    & header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    & h2 {
      margin: 0;
      font-size: 1.1rem;
    }
  }
</style>
