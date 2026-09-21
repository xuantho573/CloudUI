import { createModuleFederationConfig } from "@module-federation/vite";

export default createModuleFederationConfig({
  name: "host",
  remotes: {},
  dts: false,
  shared: {
    "@cloud-ui/shared": {
      singleton: true,
      shareScope: "cloud-ui",
    },
  },
});
