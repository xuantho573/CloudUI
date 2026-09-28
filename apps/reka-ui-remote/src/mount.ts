import { createVueRemote } from "@cloud-ui/shared/create-remote";

import App from "./App.vue";
import "./App.css";

export const { mount } = createVueRemote({ name: "reka-ui-remote", App });
