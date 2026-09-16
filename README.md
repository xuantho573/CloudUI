# CloudUI — micro frontends with Vite + Module Federation

A host shell that loads two independently built, independently deployed remotes
at runtime. The host ships **no framework of its own**: React and Vue each live
entirely inside their remote, behind a small `mount()` contract.

| App                 | Port | Role                               |
| ------------------- | ---- | ---------------------------------- |
| `apps/host`         | 5000 | Vanilla shell. Loads both remotes. |
| `apps/react-remote` | 5001 | Exposes `./app` (React 19)         |
| `apps/vue-remote`   | 5002 | Exposes `./app` (Vue 3)            |

## Running

```bash
pnpm install
pnpm dev        # all three dev servers in parallel
```

Then open <http://localhost:5000>.

Each remote also runs standalone at its own port, which is the fastest way to
work on one in isolation:

```bash
vp -C apps/react-remote dev
```

Other workspace commands:

```bash
pnpm build      # build every app
pnpm preview    # serve the production builds on the same ports
pnpm check      # format, lint and type check
```

## Sharing code

Two workspace packages, split by what sharing _costs_:

| Package             | Holds                                             | Runtime cost                     |
| ------------------- | ------------------------------------------------- | -------------------------------- |
| `@cloud-ui/contract` | Types: `MountProps`, `RemoteModule`, `RemoteName` | None — erased at build           |
| `@cloud-ui/shared`   | Event bus, design tokens, shared assets           | One federated singleton instance |

**`@cloud-ui/contract` is free.** Types disappear at build time, so it needs no
federation wiring. It exists so the host and the remotes cannot drift: each
remote ends with a conformance check that fails the build if its `mount` stops
matching what the host expects.

```ts
const _conforms: RemoteModule = { mount };
```

**`@cloud-ui/shared` is a singleton, and that has a price.** It is declared
`singleton: true` in all three federation configs, so exactly one copy is live
however many remotes import it — which is the only way the event bus works.
The tradeoff: the remotes now agree on one copy of this module, so a breaking
change to its API needs every app redeployed together. Keep it small, and put
anything that does not need one instance in an ordinary package instead.

### Isolation is preserved via per-module `shareScope`

Sharing a module normally means a common share scope, which is exactly what
broke failure isolation earlier in this project. It does not have to:
`shareScope` is settable **per shared module**, not just per remote. So
`react`/`vue` stay in each remote's own scope while `@cloud-ui/shared` alone
opts into a common `cloud-ui` scope:

```ts
shared: {
  react: { singleton: true },                                  // react_remote scope
  "@cloud-ui/shared": { singleton: true, shareScope: "cloud-ui" }, // shared scope
}
```

Verified: with the Vue remote stopped, React still mounts and the bus still
delivers, while the Vue slot shows its error.

### Design tokens

`@cloud-ui/shared/tokens.css` is imported **once, by the host**. Remotes read the
`--cloud-ui-*` variables and must not re-import the file, or a second copy of the
declarations lands on the page. Always pair `var()` with a fallback: a remote
opened standalone has no host to provide the tokens.

### Assets

Import shared assets through `@cloud-ui/shared/assets/*`. Each remote sets
`base: "./"` in its `vite.config.ts` — **this is load-bearing**. With Vite's
default base, an emitted asset URL is the root-relative `/assets/logo-abc.svg`,
which the browser resolves against the _host's_ origin, where the file does not
exist: a silently broken image. `base: "./"` makes Vite emit
`new URL("logo-abc.svg", import.meta.url)`, correct on any origin.

Note that assets under ~4kB are inlined as `data:` URIs and never hit this path,
so the bug only appears once a shared asset grows past that threshold. The
federation plugin's `publicPath: "auto"` does **not** fix it — verified against
this plugin version.

## The remote contract

A remote exposes exactly one thing — a `mount` function:

```ts
export function mount(el: HTMLElement, props?: { label?: string }): () => void;
```

It renders into `el` and returns an unmount function. Because the contract is
plain DOM, the host never imports React or Vue, and a remote can switch
frameworks without the host changing.

To add a third remote: build it with `@module-federation/vite`, expose a
`mount` under `./app`, give it its own `shareScope`, add `publishRemote()` to
its Vite plugins, then add one entry to `REMOTES` in `apps/host/src/main.ts`
and a slot `<div>` in its `index.html`.

## Notes on the setup

A few details are load-bearing and easy to break:

- **Remotes are registered at runtime**, not declared in the host's
  `module-federation.config.ts`. The plugin initializes all statically declared
  remotes in a single `Promise.all`, so one unreachable remote would fail init
  for every remote. Registering per slot keeps failures contained — a remote
  that is down shows an error in its own slot while the others render.
- **Each remote owns a `shareScope`** named after itself. The remotes share no
  dependencies with each other, and a single shared scope lets a failing remote
  corrupt the other's initialization.
- **`type: "module"`** on each remote: Vite emits `remoteEntry.js` as an ES
  module, not a global `var` bundle.
- **`cors: true`** on the remote dev servers, so the host can fetch their
  entries from a different origin.
- **Ports are reserved before startup** (`reservePort`) rather than using Vite's
  `server.port: 0`. With `port: 0` the port is unknown until the server is
  listening, and the dep pre-bundling that runs during startup could settle on
  URLs the host then failed to load — federation init died with
  `Cannot read properties of undefined (reading 'd')`.
- **`build.target: "esnext"`** everywhere — the federation runtime emits
  top-level `await`.
- **`strictPort: true`** everywhere, since the remote URLs are hardcoded.
- The host injects a **React Fast Refresh preamble** in dev only
  (`apps/host/vite.config.ts`). React's dev transform expects it on the page
  that owns the components; a framework-neutral host would otherwise throw
  "can't detect preamble". It is published as a promise on
  `globalThis.__MF_REACT_PREAMBLE__` that the app entry awaits, because module
  scripts do not block one another and the remote's components must not
  evaluate first. None of it ships in production.
- After changing `.env`, **restart the dev servers**. Vite bakes
  `import.meta.env` into its dep cache; editing env values under running servers
  leaves a stale cache and remotes fail to initialize.
- If a remote fails with `Remote container initialization failed` /
  `Cannot read properties of undefined (reading 'd')`, the host and the remote
  are holding mismatched copies of the federation runtime from stale
  pre-bundling. Clear the dep caches and restart:

  ```bash
  rm -rf apps/*/node_modules/.vite && pnpm dev
  ```
