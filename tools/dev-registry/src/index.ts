import { createServer } from "node:net";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, parse, resolve } from "node:path";
import type { AddressInfo } from "node:net";

/**
 * Dev-time remote discovery.
 *
 * Dev servers take whatever port is free, so no URL can be hardcoded. Each
 * remote writes its real URL into a shared JSON registry as it comes up, and
 * the host serves that registry to the browser (see serveRegistry) so the page
 * can resolve remotes at load time.
 *
 * Deployed remotes never use this — their URLs come from env vars, and the
 * registry file is dev-only scratch state under node_modules/.cache.
 */

export interface RegistryEntry {
  /** Federation remote name, e.g. "react_remote". */
  name: string;
  /** Origin the dev server is actually listening on, e.g. "http://localhost:53124". */
  origin: string;
  /** Full URL of the remote's module federation entry. */
  entry: string;
  /** Epoch ms of the last write; useful when inspecting the file by hand. */
  updatedAt: number;
}

type Registry = Record<string, RegistryEntry>;

/**
 * Asks the OS for a free port, then releases it so Vite can bind it.
 *
 * Using `server.port: 0` directly is not enough: the port is then unknown until
 * the server is listening, and the dep pre-bundling that runs during startup
 * could settle on URLs the host later fails to load (federation init dies with
 * "reading \'d\'"). Knowing the port before startup avoids that. The small race
 * between releasing and rebinding is acceptable for a dev server.
 */
export async function reservePort(preferred = 0): Promise<number> {
  if (preferred > 0) return preferred;
  return new Promise<number>((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, () => {
      const address = probe.address() as AddressInfo;
      probe.close(() => resolvePort(address.port));
    });
  });
}

/**
 * Walks up from an app directory to the workspace root, so every app agrees on
 * one registry file. Vite's `root` is the app dir, not the repo root.
 */
function workspaceRoot(from: string): string {
  let dir = resolve(from);
  const { root } = parse(dir);
  while (true) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    if (dir === root) return resolve(from);
    dir = dirname(dir);
  }
}

/** Shared registry path; override to isolate parallel runs. */
export function registryPath(root: string): string {
  if (process.env.MF_DEV_REGISTRY) return process.env.MF_DEV_REGISTRY;
  return join(workspaceRoot(root), "node_modules", ".cache", "mf-dev-remotes.json");
}

function readRegistry(path: string): Registry {
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf-8"));
    if (parsed && typeof parsed === "object") return parsed as Registry;
  } catch {
    // Missing or half-written file: treat as empty rather than failing startup.
  }
  return {};
}

function writeRegistry(path: string, registry: Registry): void {
  mkdirSync(dirname(path), { recursive: true });
  // Write-then-rename so a concurrently starting app never reads a partial file.
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(registry, null, 2));
  try {
    rmSync(path, { force: true });
  } catch {
    // Racing writer already replaced it; the rename below still wins or loses cleanly.
  }
  writeFileSync(path, readFileSync(tmp));
  rmSync(tmp, { force: true });
}

/**
 * Vite plugin for a remote: publishes this dev server's real URL once it is
 * listening. No-op for builds.
 */
export function publishRemote(options: { name: string; filename?: string }) {
  const filename = options.filename ?? "remoteEntry.js";

  return {
    name: "mf-dev-registry-publish",
    apply: "serve" as const,

    /**
     * Vite emits root-relative URLs for pre-bundled deps (/node_modules/.vite/
     * deps/...). Inside remoteEntry.js those resolve against whatever origin
     * loaded it — the HOST — which serves a different (or missing) copy of the
     * federation runtime, and container init dies with "reading 'd'".
     *
     * server.origin makes Vite emit absolute URLs back to this remote. The port
     * is only known once listening, so it is patched in configureServer below.
     */
    configureServer(server: {
      httpServer: {
        once: (ev: string, cb: () => void) => void;
        address: () => AddressInfo | string | null;
      } | null;
      config: { root: string; server: { host?: string | boolean } };
    }) {
      const httpServer = server.httpServer;
      if (!httpServer) return;

      httpServer.once("listening", () => {
        const address = httpServer.address();
        if (!address || typeof address === "string") return;

        const host =
          typeof server.config.server.host === "string" ? server.config.server.host : "localhost";
        const origin = `http://${host}:${address.port}`;
        const path = registryPath(server.config.root);
        const registry = readRegistry(path);

        registry[options.name] = {
          name: options.name,
          origin,
          entry: `${origin}/${filename}`,
          updatedAt: Date.now(),
        };
        writeRegistry(path, registry);
        console.log(`  ➜  federation: ${options.name} published at ${origin}/${filename}`);
      });

      // Drop our entry on shutdown so the host never points at a dead server.
      const unpublish = () => {
        const path = registryPath(server.config.root);
        const registry = readRegistry(path);
        if (registry[options.name]) {
          delete registry[options.name];
          writeRegistry(path, registry);
        }
      };
      process.once("exit", unpublish);
      process.once("SIGINT", unpublish);
      process.once("SIGTERM", unpublish);
    },
  };
}

/** Path the host dev server serves the live registry on. */
export const REGISTRY_ENDPOINT = "/@mf-dev-remotes";

/**
 * Vite plugin for the host: serves the registry over HTTP so the browser can
 * resolve remote URLs at page load, not at config load. This matters because
 * the host and the remotes start in parallel — at the moment the host's config
 * is evaluated, the remotes usually have not published their ports yet.
 */
export function serveRegistry() {
  return {
    name: "mf-dev-registry-serve",
    apply: "serve" as const,
    configureServer(server: {
      middlewares: {
        use: (
          fn: (
            req: { url?: string },
            res: {
              setHeader: (k: string, v: string) => void;
              end: (body?: string) => void;
            },
            next: () => void,
          ) => void,
        ) => void;
      };
      config: { root: string };
    }) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== REGISTRY_ENDPOINT) return next();

        const registry = readRegistry(registryPath(server.config.root));

        res.setHeader("Content-Type", "application/json; charset=utf-8");
        // Always hit the registry: remotes may restart on a new port mid-session.
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(registry));
      });
    },
  };
}
