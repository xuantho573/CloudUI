import type { RemoteModule, RemoteName } from "@cloud-ui/contract";
import { on } from "@cloud-ui/shared";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import cloudLogo from "@cloud-ui/shared/assets/cloud-ui.svg";

import "@cloud-ui/shared/tokens.css";
import "./style.css";

/** Path the host dev server serves the live remote registry on. */
const REGISTRY_ENDPOINT = "/@mf-dev-remotes";

/**
 * In dev, vite.config.ts injects a React Fast Refresh preamble as a promise on
 * this global. It must finish before any React remote module evaluates, so we
 * await it before loading remotes. Undefined in production builds.
 */
declare global {
  // eslint-disable-next-line no-var
  var __MF_REACT_PREAMBLE__: Promise<void> | undefined;
}

interface RemoteSlot {
  /**
   * Federation remote name. Typed against the contract, so a typo here is a
   * compile error rather than a runtime "remote not found".
   */
  name: RemoteName;
  /**
   * Entry URL from the build-time env, e.g. VITE_REACT_REMOTE_URL. Set for
   * deployed remotes; empty in local dev, where the registry supplies it.
   */
  envUrl: string | undefined;
  /** id of the element in index.html to mount into. */
  slotId: string;
}

const REMOTES: RemoteSlot[] = [
  {
    name: "react_remote",
    envUrl: import.meta.env.VITE_REACT_REMOTE_URL,
    slotId: "react-slot",
  },
  {
    name: "vue_remote",
    envUrl: import.meta.env.VITE_VUE_REMOTE_URL,
    slotId: "vue-slot",
  },
];

interface RegistryEntry {
  entry: string;
}

let registryPromise: Promise<Record<string, RegistryEntry>> | undefined;

/**
 * Dev servers bind free ports, so their URLs are only known once they are
 * listening. The host dev server serves what each remote published; fetched
 * once and shared by every slot.
 */
function fetchRegistry(): Promise<Record<string, RegistryEntry>> {
  registryPromise ??= fetch(REGISTRY_ENDPOINT)
    .then((res) => (res.ok ? (res.json() as Promise<Record<string, RegistryEntry>>) : {}))
    .catch(() => ({}));
  return registryPromise;
}

/** Env wins (that is how deployed remotes are configured); dev registry fills in. */
async function resolveEntry({ name, envUrl }: RemoteSlot): Promise<string> {
  if (envUrl) return envUrl;

  const registries = await fetchRegistry();
  const entry = registries[name]?.entry;
  if (entry) return entry;

  throw new Error(
    `No URL for ${name}. Start its dev server, or set VITE_${name.toUpperCase()}_URL.`,
  );
}

async function boot(root: HTMLElement, slot: RemoteSlot): Promise<void> {
  const { name } = slot;

  const label = document.createElement("p");

  const el = document.createElement("div");

  const block = document.createElement("div");
  block.append(label, el);
  root.appendChild(block);

  try {
    // Dev only: ensure React's Fast Refresh preamble is installed first.
    await globalThis.__MF_REACT_PREAMBLE__;

    const entry = await resolveEntry(slot);

    // Registered one at a time, each in its own share scope (named after the
    // remote), so a failing remote cannot break another remote's init.
    // type "module": Vite emits remoteEntry.js as an ES module, not a global.
    registerRemotes([{ name, entry, type: "module", shareScope: name }]);

    const mod = await loadRemote<RemoteModule>(`${name}/app`);
    if (!mod?.mount) {
      throw new Error(`${name}/app does not export mount()`);
    }
    // Show where the remote actually came from; ports are not fixed.
    label.textContent = `${name} · ${new URL(entry).host}`;

    el.replaceChildren();
    mod.mount(el, { label: `loaded from ${name}` });
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

/**
 * Proof that @cloud-ui/shared is a real singleton: the remotes import their own
 * copy of the module and call emit(), yet those messages arrive here. That only
 * works because Module Federation resolves all three imports to one instance —
 * if the package were bundled per app, this subscriber would never fire.
 */
on("remote:mounted", (payload) => {
  console.log("host: shared bus received remote:mounted from", payload);
});

async function main() {
  document.querySelector("img")?.setAttribute("src", cloudLogo);

  const content = document.getElementById("content");
  console.log(content);

  if (!content) return;

  // Remotes load independently so a slow or missing one never blocks the others.
  for (const slot of REMOTES) await boot(content, slot);
}

main();
