import type { MountProps, RemoteModule } from "@cloud-ui/contract";
import { emit } from "@cloud-ui/shared";
import { createApp } from "vue";

import App from "./App.vue";
import "./style.css";

/**
 * Federated entry point. The host knows nothing about Vue — it just calls
 * mount() with a DOM node and calls the returned function to tear down.
 */
export function mount(el: HTMLElement, props: MountProps = {}): () => void {
  // createApp's root props are an indexed record; MountProps is a closed
  // interface, so widen here rather than in the exported signature — the
  // parameter type must stay exactly what the host contract promises.
  const app = createApp(App, { ...props } as Record<string, unknown>);
  app.mount(el);

  // Announce on the shared singleton bus; the host is subscribed.
  emit("remote:mounted", "vue_remote");

  return () => app.unmount();
}

// Compile-time conformance check: if this module ever stops matching what the
// host expects, type checking fails here instead of at runtime in the shell.
const _conforms: RemoteModule = { mount };
void _conforms;
