import { emit } from ".";
import { createElement, StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, ref, type Component } from "vue";

export type RemotePage = "main" | "higher-uncle";

interface RemoteModuleProps {
  page: RemotePage;
}

const DEFAULT_PROPS: RemoteModuleProps = {
  page: "main",
};

export interface RemoteModule {
  mount: (
    el: HTMLElement,
    props?: RemoteModuleProps,
  ) => {
    unmount(): void;
    update(newProps: RemoteModuleProps): void;
  };
}

export function createReactRemote({
  name,
  pages,
}: {
  name: string;
  pages: Record<RemotePage, ComponentType>;
}): RemoteModule {
  return {
    mount(el: HTMLElement, props?: RemoteModuleProps) {
      const root = createRoot(el);
      const render = (page: RemotePage) => {
        const pageElement = createElement(pages[page]);
        root.render(createElement(StrictMode, {}, pageElement));
      };

      render(props?.page || DEFAULT_PROPS.page);

      // Announce on the shared singleton bus; the host is subscribed.
      emit("remote:mounted", name);

      return {
        unmount: () => root.unmount(),
        update: (newProps: RemoteModuleProps) => render(newProps.page),
      };
    },
  };
}

export function createVueRemote({
  name,
  pages,
}: {
  name: string;
  pages: Record<RemotePage, Component>;
}): RemoteModule {
  return {
    mount(el: HTMLElement, props?: RemoteModuleProps) {
      const state = ref({ ...props });
      const app = createApp({ render: () => h(pages[state.value?.page || DEFAULT_PROPS.page]) });
      app.mount(el);

      // Announce on the shared singleton bus; the host is subscribed.
      emit("remote:mounted", name);

      return {
        unmount: () => app.unmount(),
        update: (newProps: RemoteModuleProps) => (state.value = { ...newProps }),
      };
    },
  };
}
