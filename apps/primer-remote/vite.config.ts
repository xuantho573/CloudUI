import { defineRemoteConfig } from "@cloud-ui/shared/config";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

import mfConfig from "./module-federation.config";

export default defineConfig(({ mode }) =>
  defineRemoteConfig({
    mode,
    federation: mfConfig,
    plugins: [react()],
    portEnvKey: "VITE_PRIMER_REMOTE_PORT",
  }),
);
