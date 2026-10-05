import { createVueRemote } from "@cloud-ui/shared/create-remote";

import "./App.css";
import { HigherUncle, Main } from "./pages";

export const { mount } = createVueRemote({
  name: "reka-ui-remote",
  pages: {
    "higher-uncle": HigherUncle,
    main: Main,
  },
});
