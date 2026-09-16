import type { MountProps, RemoteModule } from "@cloud-ui/contract";
import { emit } from "@cloud-ui/shared";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";

/**
 * Federated entry point. The host knows nothing about React — it just calls
 * mount() with a DOM node and calls the returned function to tear down.
 *
 * The signature is checked against @cloud-ui/contract by the assertion below, so
 * drifting from what the host expects is a compile error here rather than a
 * runtime failure in the shell.
 */
export function mount(el: HTMLElement, props: MountProps = {}): () => void {
  const root = createRoot(el);
  root.render(
    <StrictMode>
      <App {...props} />
    </StrictMode>,
  );

  // Announce on the shared singleton bus; the host is subscribed.
  emit("remote:mounted", "react_remote");

  return () => root.unmount();
}

// Compile-time conformance check: if this module ever stops matching what the
// host expects, type checking fails here instead of at runtime in the shell.
const _conforms: RemoteModule = { mount };
void _conforms;
