import { createModuleFederationConfig } from "@module-federation/vite";

export default createModuleFederationConfig({
  name: "vue_remote",
  filename: "remoteEntry.js",
  // Own scope: remotes share nothing with each other or the host, so a
  // failing remote can never corrupt another remote's shared modules.
  // Cross-remote .d.ts generation is off: the host is framework-neutral and
  // excludes @mf-types from typechecking, so the archive is only build noise.
  dts: false,
  shareScope: "vue_remote",
  exposes: {
    // Framework-agnostic entry point: mount(el, props) => unmount
    "./app": "./src/mount.ts",
  },
  shared: {
    vue: { singleton: true },
    // Opted into a scope shared by every app, while react/vue above stay in
    // this remote's OWN scope (shareScope is settable per shared module). That
    // gives one live copy of the bus without reintroducing the cross-remote
    // coupling that broke failure isolation before.
    "@cloud-ui/shared": {
      singleton: true,
      shareScope: "cloud-ui",
    },
  },
});
