import { createReactRemote } from "@cloud-ui/shared/create-remote";

import App from "./App.tsx";

export const { mount } = createReactRemote({ name: "primer-remote", App });
