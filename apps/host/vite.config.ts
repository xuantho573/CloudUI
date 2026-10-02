import { federation } from "@module-federation/vite";
import { defineConfig, loadEnv } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import mfConfig from "./module-federation.config";
import react from "@vitejs/plugin-react";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => {
  // Env lives at the workspace root so every app shares one file.
  const env = loadEnv(mode, "../..", "");
  const port = Number(env.VITE_HOST_PORT ?? 0);

  return {
    // All apps share one .env at the workspace root.
    envDir: "../..",
    // Require `react()` to allow react remotes
    plugins: [react(), federation(mfConfig), tailwindcss(), svelte()],
    server: {
      port,
      cors: true,
    },
    preview: {
      port,
      cors: true,
    },
    build: {
      // The federation runtime emits top-level await.
      target: "esnext",
    },
  };
});
