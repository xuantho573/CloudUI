import { federation } from "@module-federation/vite";
import vue from "@vitejs/plugin-vue";
import { publishRemote, reservePort } from "@cloud-ui/dev-registry";
import { defineConfig, loadEnv } from "vite-plus";

import mfConfig from "./module-federation.config";

export default defineConfig(async ({ mode }) => {
  // Env lives at the workspace root so every app shares one file.
  const env = loadEnv(mode, "../..", "");

  // Claimed up front rather than using `port: 0`: the port must be known before
  // the server starts so Vite's dep pre-bundling settles on one set of URLs.
  // With `port: 0` the host could load remoteEntry.js while the remote was
  // still re-optimizing, and federation init failed with "reading 'd'".
  const port = await reservePort(Number(env.VUE_REMOTE_PORT ?? 0));

  return {
    // All apps share one .env at the workspace root.
    envDir: "../..",
    // Assets must resolve against THIS remote, not the host page that loads it.
    // With the default base, Vite emits root-relative URLs like
    // "/assets/logo-abc.svg", which the browser resolves against the host's
    // origin — where the file does not exist (404, silently broken image).
    // base "./" makes Vite emit new URL("logo-abc.svg", import.meta.url)
    // instead, which is relative to the module's own URL and therefore correct
    // on any origin. (The federation plugin's publicPath: "auto" does NOT
    // affect these asset URLs — verified against this plugin version.)
    base: "./",
    plugins: [vue(), publishRemote({ name: mfConfig.name }), federation(mfConfig)],
    server: {
      // publishRemote records this port so the host can find us; nothing
      // hardcodes it. Set VUE_REMOTE_PORT to pin it.
      port,
      // The host runs on a different origin and fetches remoteEntry.js.
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
