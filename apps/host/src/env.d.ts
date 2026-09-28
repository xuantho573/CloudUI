/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Entry URL of a deployed React remote; unset in local dev. */
  readonly VITE_REACT_REMOTE_URL?: string;
  readonly VITE_REACT_REMOTE_PORT?: number;

  /** Entry URL of a deployed Primer remote; unset in local dev. */
  readonly VITE_PRIMER_REMOTE_URL?: string;
  readonly VITE_PRIMER_REMOTE_PORT?: number;

  /** Entry URL of a deployed Vue remote; unset in local dev. */
  readonly VITE_VUE_REMOTE_URL?: string;
  readonly VITE_VUE_REMOTE_PORT?: number;

  /** Entry URL of a deployed Vue remote; unset in local dev. */
  readonly VITE_REKA_UI_REMOTE_URL?: string;
  readonly VITE_REKA_UI_REMOTE_PORT?: number;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
