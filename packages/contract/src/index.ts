/**
 * The contract between the host shell and every remote.
 *
 * Types only — this package emits no runtime code, so importing it costs
 * nothing in any bundle and needs no Module Federation wiring. It exists so the
 * host and the remotes cannot drift apart silently: before this, the host
 * declared the mount signature and each remote re-declared it independently.
 */

/** Props every remote's mount() accepts. */
export interface MountProps {
  /** Short description of where the remote was loaded from; shown in its header. */
  label?: string;
}

/**
 * What a remote must export from its federated `./app` module.
 *
 * `mount` renders into the given element and returns a function that tears the
 * rendering down again. Deliberately plain DOM: the host never imports React or
 * Vue, so a remote can change framework without the host noticing.
 */
export interface RemoteModule {
  mount: (el: HTMLElement, props?: MountProps) => () => void;
}

/** Every remote the host knows how to load. */
export const REMOTE_NAMES = ["react_remote", "vue_remote"] as const;

export type RemoteName = (typeof REMOTE_NAMES)[number];
