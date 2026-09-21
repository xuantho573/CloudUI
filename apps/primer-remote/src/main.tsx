import { mount } from "./mount.tsx";

// Standalone dev entry — the host uses ./mount directly over Module Federation.
mount(document.getElementById("root")!);
