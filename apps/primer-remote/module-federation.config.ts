import { defineRemoteFederation } from "@cloud-ui/shared/config";

export default defineRemoteFederation({
  name: "primer-remote",
  mount: "./src/mount.tsx",
  extra: { dev: { remoteHmr: true } },
});
