import { mount } from "./mount";

// Standalone dev entry — the host uses ./mount directly over Module Federation.
mount(document.getElementById("app")!);
