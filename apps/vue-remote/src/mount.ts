import { createVueRemote } from "@cloud-ui/shared/create-remote";

import App from "./App.vue";

export const { mount } = createVueRemote({ name: "vue-remote", App });
