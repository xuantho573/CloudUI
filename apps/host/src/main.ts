import { mount } from "svelte";

import App from "./App.svelte";

import "@cloud-ui/shared/tokens.css";
import "./style.css";
import "./App.css";

mount(App, {
  target: document.getElementById("content")!,
});
