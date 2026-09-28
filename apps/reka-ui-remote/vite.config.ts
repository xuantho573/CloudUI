import { defineConfig } from "vite-plus";
import { defineRemoteConfig } from "@cloud-ui/shared/config";

import mfConfig from "./module-federation.config";

export default defineConfig(({ mode }) =>
  defineRemoteConfig({
    federation: mfConfig,
    mode,
    portEnvKey: "VITE_REKA_UI_REMOTE_PORT",
    framework: "vue",
  }),
);
