/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Entry URL of a deployed React remote; unset in local dev. */
  readonly VITE_REACT_REMOTE_URL?: string;
  /** Entry URL of a deployed Vue remote; unset in local dev. */
  readonly VITE_VUE_REMOTE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
