import { emit } from ".";
import { createElement, StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { createApp, type Component } from "vue";

export interface RemoteModule {
  mount: (el: HTMLElement) => () => void;
}

export function createReactRemote({
  name,
  App,
}: {
  name: string;
  App: ComponentType;
}): RemoteModule {
  return {
    mount(el: HTMLElement) {
      const root = createRoot(el);
      const app = createElement(StrictMode, {}, createElement(App));
      root.render(app);

      // Announce on the shared singleton bus; the host is subscribed.
      emit("remote:mounted", name);

      return () => root.unmount();
    },
  };
}
export function createVueRemote({ name, App }: { name: string; App: Component }): RemoteModule {
  return {
    mount(el: HTMLElement): () => void {
      const app = createApp(App);
      app.mount(el);

      // Announce on the shared singleton bus; the host is subscribed.
      emit("remote:mounted", name);

      return () => app.unmount();
    },
  };
}
