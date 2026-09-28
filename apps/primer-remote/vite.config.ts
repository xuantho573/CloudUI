import { defineRemoteConfig } from "@cloud-ui/shared/config";
import { defineConfig } from "vite-plus";

import mfConfig from "./module-federation.config";

export default defineConfig(({ mode }) =>
  defineRemoteConfig({
    mode,
    federation: mfConfig,
    portEnvKey: "VITE_PRIMER_REMOTE_PORT",
    framework: "react",
  }),
);
