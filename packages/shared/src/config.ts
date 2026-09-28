import { createModuleFederationConfig, federation } from "@module-federation/vite";
import { loadEnv, type PluginOption, type UserConfig } from "vite-plus";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import react from "@vitejs/plugin-react";

export interface RemoteFederationOptions {
  name: string;
  /** The exposed mount module, e.g. "./src/mount.tsx". */
  mount: string;
  /** The exposed components, e.g. { "./Button": "./src/components/Button.tsx" }. */
  components?: Record<string, string>;
  /** Extra federation options, merged last. */
  extra?: Record<string, unknown>;
}

export function defineRemoteFederation({
  name,
  mount,
  components = {},
  extra = {},
}: RemoteFederationOptions) {
  return createModuleFederationConfig({
    name,
    filename: "remoteEntry.js",
    dts: false,
    // shareScope: name,
    exposes: {
      // Framework-agnostic entry point: mount(el, props) => unmount
      ".": mount,
      ...components,
    },
    shared: {
      "@cloud-ui/shared": { singleton: true, shareScope: "cloud-ui" },
    },
    ...extra,
  });
}

/** The shape of a remote's module-federation.config.ts default export. */
type FederationConfig = Parameters<typeof federation>[0];

interface RemoteConfigOptions {
  /** The remote's module-federation.config.ts default export. */
  federation: FederationConfig;
  /** Vite mode, from defineConfig's callback argument. */
  mode: string;
  /**
   * Env var naming this remote's dev port, e.g. "REACT_REMOTE_PORT".
   * Unset or 0 means "any free port".
   */
  portEnvKey: string;

  framework: "vue" | "react";
  /** Framework plugin(s): react(), vue(), etc. */
  plugins?: PluginOption[];
}

/**
 * Shared Vite config for every remote.
 *
 * Each remote is a separately built app that a framework-neutral host loads at
 * runtime from a different origin, which imposes a handful of non-obvious
 * settings. They are collected here so adding a remote does not mean
 * rediscovering them — every one is load-bearing and commented below.
 */
export function defineRemoteConfig({
  federation: mfConfig,
  mode,
  portEnvKey,
  framework,
  plugins = [],
}: RemoteConfigOptions): UserConfig {
  // Env lives at the workspace root so every app shares one file.
  const env = loadEnv(mode, "../..", "");

  const port = env[portEnvKey]?.match(/\d+/) ? Number(env[portEnvKey]) : undefined;

  return {
    // All apps share one .env at the workspace root.
    envDir: "../..",
    // Assets must resolve against THIS remote, not the host page that loads it.
    // With the default base, Vite emits root-relative URLs like
    // "/assets/logo-abc.svg", which the browser resolves against the host's
    // origin — where the file does not exist (404, silently broken image).
    // base "./" makes Vite emit new URL("logo-abc.svg", import.meta.url)
    // instead, relative to the module's own URL and therefore correct on any
    // origin. (The federation plugin's publicPath: "auto" does NOT affect
    // these asset URLs — verified against this plugin version.)
    base: "./",
    plugins: [
      ...plugins,
      ...(framework === "vue"
        ? [
            vue({
              features: {
                componentIdGenerator(filepath, source, isProduction, getHash) {
                  return getHash(`${mfConfig.name}-${filepath}${isProduction ? source : ""}`);
                },
              },
            }),
          ]
        : []),
      ...(framework === "react" ? [react()] : []),
      tailwindcss(),
      federation(mfConfig),
    ],
    server: {
      // publishRemote records this port so the host can find us; nothing
      // hardcodes it. Set <portEnvKey> to pin it.
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
}
