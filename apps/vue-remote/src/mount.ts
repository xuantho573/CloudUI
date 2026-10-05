import { createVueRemote } from "@cloud-ui/shared/create-remote";

import HigherUncle from "./pages/HigherUncle.vue";
import Main from "./pages/Main.vue";

export const { mount } = createVueRemote({
  name: "vue-remote",
  pages: {
    "higher-uncle": HigherUncle,
    main: Main,
  },
});
