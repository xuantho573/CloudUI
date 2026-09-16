import { createModuleFederationConfig } from "@module-federation/vite";

/**
 * Remotes are registered at runtime in src/main.ts, not declared here: the
 * plugin initializes every statically declared remote in a single Promise.all
 * at bootstrap, so one unreachable remote would fail init for all of them.
 */
export default createModuleFederationConfig({
  name: "host",
  remotes: {},
  // See the note on dts in each remote's config.
  dts: false,
  // The host stays framework-neutral — no react/vue here. Each remote carries
  // its own framework runtime in its own share scope (see each remote's
  // config), so the React and Vue remotes never contend over one scope.
  //
  // The one exception is @cloud-ui/shared, which must be a single live instance
  // for the event bus to work. It lives in its own "cloud-ui" scope so sharing
  // it does not put the frameworks back into a common scope.
  shared: {
    "@cloud-ui/shared": {
      singleton: true,
      shareScope: "cloud-ui",
    },
  },
});
