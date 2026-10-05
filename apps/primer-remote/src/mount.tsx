import { createReactRemote } from "@cloud-ui/shared/create-remote";

import HigherUncle from "./pages/HigherUncle.tsx";
import Main from "./pages/Main.tsx";

export const { mount } = createReactRemote({
  name: "primer-remote", pages: {
    'main': Main,
    'higher-uncle': HigherUncle
  }
});
