import { on } from "@cloud-ui/shared";
import { type RemoteModule } from "@cloud-ui/shared/create-remote";
import { loadRemote, registerRemotes } from "@module-federation/runtime";
import cloudLogo from "@cloud-ui/shared/assets/cloud-ui.svg";
import reactLogo from "@cloud-ui/shared/assets/react.svg";
import vueLogo from "@cloud-ui/shared/assets/vue.svg";

import "@cloud-ui/shared/tokens.css";
import "./style.css";
import "./App.css";

async function bootRemote(root: HTMLElement, name: string, entry: string): Promise<void> {
  const framework = name === "vue-remote" ? "vue" : "react";
  const el = document.createElement("div");

  const block = document.createElement("section");
  block.className = `remote-card framework-${framework}`;
  block.innerHTML = `
    <header>
      <img src=${name === "vue-remote" ? vueLogo : reactLogo} className="framework" alt="" width="48" height="48" />
      <h2>${name}</h2>
    </header>
  `;
  block.append(el);
  root.appendChild(block);

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

/**
 * Proof that @cloud-ui/shared is a real singleton: the remotes import their own
 * copy of the module and call emit(), yet those messages arrive here. That only
 * works because Module Federation resolves all three imports to one instance —
 * if the package were bundled per app, this subscriber would never fire.
 */
on("remote:mounted", (payload) => {
  console.log("host: shared bus received remote:mounted from", payload);
});

const REMOTES = [
  {
    name: "react-remote",
    entry: `http://localhost:${import.meta.env.VITE_REACT_REMOTE_PORT}/remoteEntry.js`,
  },
  {
    name: "primer-remote",
    entry: `http://localhost:${import.meta.env.VITE_PRIMER_REMOTE_PORT}/remoteEntry.js`,
  },
  {
    name: `vue-remote`,
    entry: `http://localhost:${import.meta.env.VITE_VUE_REMOTE_PORT}/remoteEntry.js`,
  },
];

async function main() {
  document.querySelector("img")?.setAttribute("src", cloudLogo);

  const content = document.getElementById("content");
  if (!content) return;

  for (const { name, entry } of REMOTES) {
    await bootRemote(content, name, entry);
  }
}

void main();
