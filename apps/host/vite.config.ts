import { federation } from "@module-federation/vite";
import { REGISTRY_ENDPOINT, serveRegistry } from "@cloud-ui/dev-registry";
import { defineConfig, loadEnv } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";

import mfConfig from "./module-federation.config";

/**
 * Dev-only bridge for React Fast Refresh.
 *
 * @vitejs/plugin-react transforms the remote's components to expect a "preamble"
 * on the page that owns them — it defines window.$RefreshReg$/$RefreshSig$ and
 * calls injectIntoGlobalHook. Normally the React app's own host injects it, but
 * this host is deliberately framework-neutral, so the remote's components would
 * evaluate here and throw "can't detect preamble".
 *
 * The React remote's origin is not known when this config is evaluated (it binds
 * a free port, and may still be starting), so the preamble resolves it in the
 * browser from the dev registry before importing the refresh runtime.
 *
 * Production builds have no Fast Refresh at all, so none of this ships.
 */
function reactRefreshBridge(reactRemoteUrlFromEnv?: string) {
  return {
    name: "host-react-refresh-bridge",
    apply: "serve" as const,
    transformIndexHtml() {
      // Published as a promise the app entry awaits before loading any remote:
      // module scripts do not block each other, so without this the React
      // remote's components could evaluate before the preamble is installed.
      const script = [
        `globalThis.__MF_REACT_PREAMBLE__ = (async () => {`,
        `  const envUrl = ${JSON.stringify(reactRemoteUrlFromEnv ?? "")};`,
        `  let origin = envUrl ? new URL(envUrl).origin : "";`,
        `  if (!origin) {`,
        `    try {`,
        `      const res = await fetch(${JSON.stringify(REGISTRY_ENDPOINT)});`,
        `      origin = (await res.json())?.react_remote?.origin ?? "";`,
        `    } catch {}`,
        `  }`,
        `  if (!origin) return;`,
        `  const runtime = origin + "/@mf-react-refresh-local";`,
        `  globalThis.__MF_REACT_REFRESH_URL__ = runtime;`,
        `  const rt = await import(/* @vite-ignore */ runtime);`,
        `  rt.injectIntoGlobalHook(window);`,
        `  window.$RefreshReg$ = () => {};`,
        `  window.$RefreshSig$ = () => (type) => type;`,
        `})();`,
      ].join("\n");

      return [
        {
          tag: "script",
          attrs: { type: "module" },
          children: script,
          injectTo: "head-prepend" as const,
        },
      ];
    },
  };
}

export default defineConfig(({ mode }) => {
  // Env lives at the workspace root so every app shares one file.
  const env = loadEnv(mode, "../..", "");

  return {
    // All apps share one .env at the workspace root.
    envDir: "../..",
    plugins: [
      reactRefreshBridge(env.VITE_REACT_REMOTE_URL),
      serveRegistry(),
      federation(mfConfig),
      tailwindcss(),
    ],
    server: {
      // 0 = let the OS pick a free port.
      port: Number(env.HOST_PORT ?? 0),
    },
    preview: {
      port: Number(env.HOST_PORT ?? 0),
    },
    build: {
      // The federation runtime emits top-level await.
      target: "esnext",
    },
  };
});
