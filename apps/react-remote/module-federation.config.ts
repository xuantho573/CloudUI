import { defineRemoteFederation } from "@cloud-ui/shared/config";

export default defineRemoteFederation({
  name: "react-remote",
  mount: "./src/mount.tsx",
  extra: { dev: { remoteHmr: true } },
});
